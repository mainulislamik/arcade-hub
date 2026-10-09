/**
 * Arcadex Save State & Rewind Engine
 * Multi-slot instantaneous snapshot capture and circular time-travel rewind
 */

export interface SaveStateSlot {
  slotId: number;
  gameId: string;
  gameTitle: string;
  timestamp: number;
  formattedDate: string;
  score: number;
  level: number;
  thumbnailDataUrl?: string;
  stateData: any;
}

const SAVE_DB_PREFIX = 'arcadex_save_slot_';

export class SaveStateManager {
  /**
   * Save a snapshot into slot 1-5
   */
  static async saveSlot(
    slotId: number, 
    gameId: string, 
    gameTitle: string, 
    score: number, 
    level: number, 
    stateData: any,
    canvasElement?: HTMLCanvasElement | null
  ): Promise<SaveStateSlot> {
    let thumbnailDataUrl: string | undefined;
    
    if (canvasElement) {
      try {
        thumbnailDataUrl = canvasElement.toDataURL('image/jpeg', 0.6);
      } catch {
        // Ignore cross-origin canvas security errors
      }
    }

    const slot: SaveStateSlot = {
      slotId,
      gameId,
      gameTitle,
      timestamp: Date.now(),
      formattedDate: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      score,
      level,
      thumbnailDataUrl,
      stateData
    };

    const key = `${SAVE_DB_PREFIX}${gameId}_${slotId}`;
    try {
      localStorage.setItem(key, JSON.stringify(slot));
    } catch {
      // If local storage is full, save without thumbnail
      slot.thumbnailDataUrl = undefined;
      localStorage.setItem(key, JSON.stringify(slot));
    }

    // Trigger state change event
    window.dispatchEvent(new CustomEvent('arcadex:save_states_updated', { detail: { gameId, slotId } }));

    return slot;
  }

  /**
   * Load a snapshot from slot 1-5
   */
  static getSlot(slotId: number, gameId: string): SaveStateSlot | null {
    const key = `${SAVE_DB_PREFIX}${gameId}_${slotId}`;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  /**
   * Get all occupied slots for a game
   */
  static getAllSlotsForGame(gameId: string): (SaveStateSlot | null)[] {
    return [1, 2, 3, 4, 5].map(id => this.getSlot(id, gameId));
  }

  /**
   * Delete a save slot
   */
  static deleteSlot(slotId: number, gameId: string): void {
    const key = `${SAVE_DB_PREFIX}${gameId}_${slotId}`;
    localStorage.removeItem(key);
    window.dispatchEvent(new CustomEvent('arcadex:save_states_updated', { detail: { gameId, slotId } }));
  }
}
