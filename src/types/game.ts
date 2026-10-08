export type GameCategory = 'all' | 'arcade' | 'puzzle' | 'retro' | 'action' | 'strategy' | 'word';

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

export interface GameItem {
  id: string;
  slug: string;
  title: string;
  category: 'arcade' | 'puzzle' | 'retro' | 'action' | 'strategy' | 'word';
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
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Adaptive';
  playCount?: number;
  plays?: number;
  rating: number;
  reviewCount?: number;
  releaseDate?: string;
  tags: string[];
  badge?: string;
  isFeatured?: boolean;
}

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
