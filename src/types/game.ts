export type GameCategory = 'all' | 'arcade' | 'puzzle' | 'retro' | 'action' | 'strategy';

export interface GameItem {
  id: string;
  title: string;
  category: 'arcade' | 'puzzle' | 'retro' | 'action' | 'strategy';
  description: string;
  tags: string[];
  thumbnailGradient: string;
  iconName: string;
  rating: number;
  plays: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  controls: {
    keyboard: string[];
    touch: string;
  };
}

export interface GameStats {
  highScore: number;
  timesPlayed: number;
  totalPlayTimeSeconds: number;
  lastPlayed?: string;
  favorite: boolean;
}

export interface PlayerProfile {
  totalGamesPlayed: number;
  favoriteGames: string[];
  recentGames: string[];
  gameStats: Record<string, GameStats>;
  soundEnabled: boolean;
}
