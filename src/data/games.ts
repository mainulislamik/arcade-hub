import { GameItem } from '../types/game';
import catalogData from './games_catalog.json';

export const GAMES_CATALOG: GameItem[] = catalogData as unknown as GameItem[];

export default GAMES_CATALOG;
