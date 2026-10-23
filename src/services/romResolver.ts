import { GameItem } from '../types/game';
import { getRomBinaryBlob as getVaultRomBlob } from '../utils/customGamesStorage';

const ROM_STORE_DB = 'arcadex_rom_store';
const ROM_STORE_VERSION = 1;
const STORE_BLOBS = 'rom_blobs';
const STORE_METADATA = 'rom_metadata';

export interface RomResolutionResult {
  blobUrl: string;
  blob: Blob;
  sourceUrl: string;
  isFromCache: boolean;
  mirrorIndex: number;
  totalMirrors: number;
  statusMessage: string;
}

export interface RomResolveOptions {
  preferredMirrorIndex?: number;
  onStatusUpdate?: (status: string, progress?: number) => void;
  timeoutMs?: number;
  bypassCache?: boolean;
}

export const PLATFORM_DEFAULT_ROMS: Record<string, string> = {
  nes: '/roms/contra.nes',
  gba: '/roms/pokemon-emerald.gba',
  snes: '/roms/astrohawk.smc',
  sega: '/roms/sega-action-adventure.gen',
  md: '/roms/sega-action-adventure.gen',
  psx: '/roms/psx-action.exe',
  psp: '/roms/psp-showcase.pbp',
  ps2: '/roms/ps2-boot.elf',
  jar: '/roms/nokia-rally-3d.jar',
  sis: '/roms/symbian-game.sis',
  dos: '/roms/dos-action.zip',
  swf: '/roms/pacman.swf',
  html: '/games/web-runner.html',
  zip: '/games/web-runner.html'
};

// Open or initialize IndexedDB instance for ROM caching
function openRomDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB is not supported in this environment'));
    }
    const request = indexedDB.open(ROM_STORE_DB, ROM_STORE_VERSION);

    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_BLOBS)) {
        db.createObjectStore(STORE_BLOBS, { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains(STORE_METADATA)) {
        db.createObjectStore(STORE_METADATA, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Retrieve cached ROM Blob from IndexedDB
export async function getCachedRomBlob(key: string): Promise<Blob | null> {
  try {
    const db = await openRomDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_BLOBS, 'readonly');
      const store = tx.objectStore(STORE_BLOBS);
      const req = store.get(key);
      req.onsuccess = () => {
        if (req.result && req.result.blob) {
          resolve(req.result.blob);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[RomResolver] IDB getCachedRomBlob failed:', err);
    return null;
  }
}

// Store fetched ROM Blob into IndexedDB
export async function cacheRomBlob(
  key: string,
  blob: Blob,
  metadata?: { title?: string; format?: string; mirrorUrl?: string }
): Promise<void> {
  try {
    const db = await openRomDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction([STORE_BLOBS, STORE_METADATA], 'readwrite');
      const blobStore = tx.objectStore(STORE_BLOBS);
      const metaStore = tx.objectStore(STORE_METADATA);

      blobStore.put({ key, blob, size: blob.size, savedAt: Date.now() });
      if (metadata) {
        metaStore.put({
          key,
          ...metadata,
          sizeMb: +(blob.size / (1024 * 1024)).toFixed(2),
          savedAt: Date.now()
        });
      }

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('[RomResolver] Could not cache ROM to IndexedDB:', err);
  }
}

// Invalidate or delete a cached ROM
export async function deleteCachedRom(key: string): Promise<void> {
  try {
    const db = await openRomDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction([STORE_BLOBS, STORE_METADATA], 'readwrite');
      tx.objectStore(STORE_BLOBS).delete(key);
      tx.objectStore(STORE_METADATA).delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('[RomResolver] Could not delete cached ROM:', err);
  }
}

// Clear all cached ROM blobs
export async function clearRomCache(): Promise<void> {
  try {
    const db = await openRomDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction([STORE_BLOBS, STORE_METADATA], 'readwrite');
      tx.objectStore(STORE_BLOBS).clear();
      tx.objectStore(STORE_METADATA).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('[RomResolver] Could not clear ROM store:', err);
  }
}

// Get cache statistics
export async function getRomCacheStats(): Promise<{ count: number; totalMb: number }> {
  try {
    const db = await openRomDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_BLOBS, 'readonly');
      const store = tx.objectStore(STORE_BLOBS);
      const req = store.getAll();
      req.onsuccess = () => {
        const items = req.result || [];
        let bytes = 0;
        for (const item of items) {
          bytes += item.size || item.blob?.size || 0;
        }
        resolve({
          count: items.length,
          totalMb: +(bytes / (1024 * 1024)).toFixed(2)
        });
      };
      req.onerror = () => resolve({ count: 0, totalMb: 0 });
    });
  } catch {
    return { count: 0, totalMb: 0 };
  }
}

// Build resilient multi-mirror list for a game
export function buildRomMirrorCandidates(game: GameItem, format: string): string[] {
  const candidates: string[] = [];

  // 1. Primary custom sources if provided
  if (Array.isArray(game.romSources) && game.romSources.length > 0) {
    for (const src of game.romSources) {
      if (src && !candidates.includes(src)) candidates.push(src);
    }
  }

  // 2. Primary catalog romUrl
  if (game.romUrl && !candidates.includes(game.romUrl)) {
    candidates.push(game.romUrl);
  }

  // 3. Binary URL if provided
  if (game.binaryUrl && !candidates.includes(game.binaryUrl)) {
    candidates.push(game.binaryUrl);
  }

  // 4. Fallback platform default ROM
  const defaultRom = PLATFORM_DEFAULT_ROMS[format] || PLATFORM_DEFAULT_ROMS.nes;
  if (defaultRom && !candidates.includes(defaultRom)) {
    candidates.push(defaultRom);
  }

  return candidates;
}

// Main multi-mirror resolver with client IndexedDB caching
export async function resolveRomWithMirrors(
  game: GameItem,
  format: string,
  options: RomResolveOptions = {}
): Promise<RomResolutionResult> {
  const {
    preferredMirrorIndex = 0,
    onStatusUpdate,
    timeoutMs = 8000,
    bypassCache = false
  } = options;

  const cacheKey = `cached_rom_${game.id}`;

  // 1. Check Custom Upload Vault first
  if (game.customRomKey) {
    onStatusUpdate?.('Accessing local custom vault storage...', 10);
    try {
      const vaultBlob = await getVaultRomBlob(game.customRomKey);
      if (vaultBlob) {
        onStatusUpdate?.('Ready from Custom Vault', 100);
        return {
          blobUrl: URL.createObjectURL(vaultBlob),
          blob: vaultBlob,
          sourceUrl: 'custom_vault',
          isFromCache: true,
          mirrorIndex: 0,
          totalMirrors: 1,
          statusMessage: 'Loaded from local custom game vault'
        };
      }
    } catch (e) {
      console.warn('[RomResolver] Vault check failed:', e);
    }
  }

  // 2. Check Client IndexedDB Cache (Zero VPS storage load)
  if (!bypassCache) {
    onStatusUpdate?.('Checking local device IndexedDB cache...', 15);
    try {
      const cachedBlob = await getCachedRomBlob(cacheKey);
      if (cachedBlob && cachedBlob.size > 0) {
        onStatusUpdate?.('Loaded from instant offline device cache', 100);
        return {
          blobUrl: URL.createObjectURL(cachedBlob),
          blob: cachedBlob,
          sourceUrl: 'local_indexeddb',
          isFromCache: true,
          mirrorIndex: 0,
          totalMirrors: 1,
          statusMessage: 'Loaded instantly from local offline cache'
        };
      }
    } catch (e) {
      console.warn('[RomResolver] Cache lookup failed:', e);
    }
  }

  // 3. Build Multi-Mirror Candidate List
  const mirrors = buildRomMirrorCandidates(game, format);
  if (mirrors.length === 0) {
    throw new Error(`No available ROM mirrors found for game ${game.title}`);
  }

  // Reorder mirrors if user requested a preferred mirror
  let orderedMirrors = [...mirrors];
  if (preferredMirrorIndex > 0 && preferredMirrorIndex < mirrors.length) {
    const selected = orderedMirrors.splice(preferredMirrorIndex, 1)[0];
    orderedMirrors.unshift(selected);
  }

  let lastError: Error | null = null;

  // 4. Sequential Mirror Fetch with AbortController Timeout
  for (let idx = 0; idx < orderedMirrors.length; idx++) {
    const mirrorCandidate = orderedMirrors[idx];
    const mirrorNumber = idx + 1;
    const resolvedUrl = mirrorCandidate.startsWith('http') || mirrorCandidate.startsWith('blob:')
      ? mirrorCandidate
      : (typeof window !== 'undefined' ? `${window.location.origin}${mirrorCandidate}` : mirrorCandidate);

    const progressPct = Math.min(90, Math.round(20 + (idx / orderedMirrors.length) * 60));
    onStatusUpdate?.(`Streaming from Mirror ${mirrorNumber} of ${orderedMirrors.length}...`, progressPct);

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(resolvedUrl, {
        signal: controller.signal,
        cache: 'no-cache'
      });
      clearTimeout(timer);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();
      if (!blob || blob.size === 0) {
        throw new Error('Received empty ROM stream');
      }

      // 5. Store fetched ROM into IndexedDB for instant replay
      await cacheRomBlob(cacheKey, blob, {
        title: game.title,
        format,
        mirrorUrl: mirrorCandidate
      });

      const objectUrl = URL.createObjectURL(blob);
      onStatusUpdate?.('Mirror connected! Emulator core initializing...', 100);

      return {
        blobUrl: objectUrl,
        blob,
        sourceUrl: mirrorCandidate,
        isFromCache: false,
        mirrorIndex: idx,
        totalMirrors: orderedMirrors.length,
        statusMessage: `Connected to Mirror ${mirrorNumber} (${(blob.size / 1024).toFixed(0)} KB)`
      };
    } catch (err: any) {
      console.warn(`[RomResolver] Mirror ${mirrorNumber} (${mirrorCandidate}) failed:`, err.message || err);
      lastError = err;
    }
  }

  // 6. Final safety fallback to local bundled ROM
  const defaultRom = PLATFORM_DEFAULT_ROMS[format] || PLATFORM_DEFAULT_ROMS.nes;
  const localDefaultUrl = typeof window !== 'undefined' ? `${window.location.origin}${defaultRom}` : defaultRom;

  try {
    onStatusUpdate?.('Switching to bundled local safety fallback...', 95);
    const fallbackResp = await fetch(localDefaultUrl);
    if (fallbackResp.ok) {
      const fbBlob = await fallbackResp.blob();
      const fbUrl = URL.createObjectURL(fbBlob);
      return {
        blobUrl: fbUrl,
        blob: fbBlob,
        sourceUrl: defaultRom,
        isFromCache: false,
        mirrorIndex: orderedMirrors.length,
        totalMirrors: orderedMirrors.length + 1,
        statusMessage: 'Loaded bundled safety fallback ROM'
      };
    }
  } catch (fbErr) {
    console.warn('[RomResolver] Local bundled fallback fetch failed:', fbErr);
  }

  throw new Error(
    `Failed to load ROM across all ${orderedMirrors.length} mirrors. ${lastError ? lastError.message : 'Network unreachable'}`
  );
}

// Revoke object URL cleanly to free client memory
export function revokeRomBlobUrl(url: string | null): void {
  if (url && url.startsWith('blob:')) {
    try {
      URL.revokeObjectURL(url);
    } catch (_) {}
  }
}
