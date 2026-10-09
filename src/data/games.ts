import { GameItem } from '../types/game';

// Clean initial catalog (Old synthetic/dummy games removed as requested)
// All games are managed dynamically via the Admin Panel (/admin)
export const GAMES_CATALOG: GameItem[] = [];

export const INITIAL_FEATURED_IDS: string[] = [];
