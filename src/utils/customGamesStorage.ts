import { GameItem } from '../types/game';

const DB_NAME = 'arcadex_vault_db';
const DB_VERSION = 1;
const STORE_GAMES = 'games_metadata';
const STORE_ROMS = 'game_rom_binaries';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_GAMES)) {
        db.createObjectStore(STORE_GAMES, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_ROMS)) {
        db.createObjectStore(STORE_ROMS, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Store a ROM binary blob into IndexedDB
export async function storeRomBinary(key: string, blob: Blob): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_ROMS, 'readwrite');
    const store = tx.objectStore(STORE_ROMS);
    const req = store.put({ key, blob, updatedAt: Date.now() });
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// Retrieve raw ROM Blob
export async function getRomBinaryBlob(key: string): Promise<Blob | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_ROMS, 'readonly');
    const store = tx.objectStore(STORE_ROMS);
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
}

// Retrieve ROM binary ArrayBuffer
export async function getRomArrayBuffer(key: string): Promise<ArrayBuffer | null> {
  const blob = await getRomBinaryBlob(key);
  if (!blob) return null;
  return await blob.arrayBuffer();
}

// Retrieve ROM binary as Base64 Data URL
export async function getRomBase64(key: string): Promise<string | null> {
  const blob = await getRomBinaryBlob(key);
  if (!blob) return null;
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Retrieve ROM binary blob and create a temporary Object URL
export async function getRomBlobUrl(key: string): Promise<string | null> {
  const blob = await getRomBinaryBlob(key);
  if (blob) {
    return URL.createObjectURL(blob);
  }
  return null;
}

// Save or Update Custom Game Metadata
export async function saveCustomGame(game: GameItem, fileBlob?: Blob): Promise<GameItem> {
  const db = await openDB();
  
  if (fileBlob) {
    const romKey = `rom_${game.id}_${Date.now()}`;
    await storeRomBinary(romKey, fileBlob);
    game.customRomKey = romKey;
    game.isCustomUpload = true;
    game.fileSizeMb = +(fileBlob.size / (1024 * 1024)).toFixed(2);
  }

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_GAMES, 'readwrite');
    const store = tx.objectStore(STORE_GAMES);
    const req = store.put(game);
    req.onsuccess = () => {
      window.dispatchEvent(new CustomEvent('arcadex:games_updated', { detail: game }));
      resolve(game);
    };
    req.onerror = () => reject(req.error);
  });
}

// Get All Custom Uploaded Games
export async function getCustomGames(): Promise<GameItem[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_GAMES, 'readonly');
      const store = tx.objectStore(STORE_GAMES);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to read custom games from DB:', err);
    return [];
  }
}

// Delete Game and its ROM Binary
export async function deleteCustomGame(gameId: string, customRomKey?: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_GAMES, STORE_ROMS], 'readwrite');
    const gameStore = tx.objectStore(STORE_GAMES);
    const romStore = tx.objectStore(STORE_ROMS);

    gameStore.delete(gameId);
    if (customRomKey) {
      romStore.delete(customRomKey);
    }

    tx.oncomplete = () => {
      window.dispatchEvent(new CustomEvent('arcadex:games_updated', { detail: { id: gameId, deleted: true } }));
      resolve();
    };
    tx.onerror = () => reject(tx.error);
  });
}
