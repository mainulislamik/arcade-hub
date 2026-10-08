export type GameCategory = 'all' | 'arcade' | 'puzzle' | 'retro' | 'action' | 'strategy' | 'word';

export type GameEngineType = 
  | 'native_canvas' 
  | 'java_j2me' 
  | 'retro_dos' 
  | 'wasm_emulator' 
  | 'iframe_web';

export interface GameFAQ {
  question: string;
  answer: string;
}

export interface GameControls {
  keyboard?: string | string[];
  touch?: string | string[];
  mobile?: string | string[];
  desktop?: string | string[];
}

export interface EmulatorConfig {
  platform: 'java' | 'dos' | 'symbian' | 'arcade' | 'retro_pc' | 'native';
  aspectRatio: '16:9' | '4:3' | '3:4' | '1:1';
  screenResolution?: { width: number; height: number };
  showMobileKeypad?: boolean;
  biosUrl?: string;
  entryFile?: string;
  commandArgs?: string[];
}

export interface GameItem {
  id: string;
  slug: string;
  title: string;
  category: 'arcade' | 'puzzle' | 'retro' | 'action' | 'strategy' | 'word' | string;
  description: string;
  longDescription?: string;
  howToPlay?: string[];
  tips?: string[];
  faqs?: GameFAQ[];
  controls: GameControls;
  thumbnailGradient?: string;
  gradient?: string;
  accentColor?: string;
  icon?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Adaptive' | string;
  playCount?: number;
  plays?: number;
  rating: number;
  reviewCount?: number;
  releaseDate?: string;
  tags: string[];
  badge?: string;
  isFeatured?: boolean;
  coverImage?: string;
  heroImage?: string;
  proBadge?: string;
  
  // Universal Multi-Core Engine Extensions
  engineType?: GameEngineType;
  binaryUrl?: string;
  fileSizeMb?: number;
  emulatorConfig?: EmulatorConfig;
  licenseType?: string;
  developer?: string;
  developerWebsite?: string;
  downloadCount?: number;
}

export type Game = GameItem;

export interface GameStats {
  plays: number;
  highScore: number;
  lastPlayed: string;
  totalTimeSeconds: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface PlayerProfile {
  totalGamesPlayed: number;
  favoriteGames: string[];
  recentGames: string[];
  gameStats: Record<string, GameStats>;
  achievements: Achievement[];
  soundEnabled: boolean;
}
