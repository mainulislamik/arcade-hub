import { PlayerProfile, GameStats } from '../types/game';

const STORAGE_KEY = 'arcade_hub_player_profile';

export const defaultProfile: PlayerProfile = {
  totalGamesPlayed: 0,
  favoriteGames: [],
  recentGames: [],
  gameStats: {},
  soundEnabled: true,
};

export const getPlayerProfile = (): PlayerProfile => {
  if (typeof window === 'undefined') return defaultProfile;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProfile;
    const parsed = JSON.parse(raw);
    return { ...defaultProfile, ...parsed };
  } catch {
    return defaultProfile;
  }
};

export const loadProfile = getPlayerProfile;

export const savePlayerProfile = (profile: PlayerProfile): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile to local storage', e);
  }
};

export const saveProfile = savePlayerProfile;

export const recordGamePlay = (
  gameId: string,
  score: number,
  playTimeSeconds: number = 0
): { isNewHighScore: boolean; stats: GameStats } => {
  const profile = getPlayerProfile();

  const currentStats = profile.gameStats[gameId] || {
    highScore: 0,
    timesPlayed: 0,
    totalPlayTimeSeconds: 0,
    favorite: profile.favoriteGames.includes(gameId),
  };

  const isNewHighScore = score > currentStats.highScore;
  const updatedHighScore = Math.max(score, currentStats.highScore);

  const updatedStats: GameStats = {
    ...currentStats,
    highScore: updatedHighScore,
    timesPlayed: currentStats.timesPlayed + 1,
    totalPlayTimeSeconds: currentStats.totalPlayTimeSeconds + playTimeSeconds,
    lastPlayed: new Date().toISOString(),
  };

  profile.gameStats[gameId] = updatedStats;
  profile.totalGamesPlayed += 1;

  // Update recent games (keep last 8 unique)
  profile.recentGames = [gameId, ...profile.recentGames.filter(id => id !== gameId)].slice(0, 8);

  savePlayerProfile(profile);
  return { isNewHighScore, stats: updatedStats };
};

export const toggleFavoriteGame = (gameId: string): PlayerProfile => {
  const profile = getPlayerProfile();
  const index = profile.favoriteGames.indexOf(gameId);

  if (index > -1) {
    profile.favoriteGames.splice(index, 1);
  } else {
    profile.favoriteGames.push(gameId);
  }

  if (profile.gameStats[gameId]) {
    profile.gameStats[gameId].favorite = profile.favoriteGames.includes(gameId);
  }

  savePlayerProfile(profile);
  return profile;
};

export const toggleFavorite = toggleFavoriteGame;

export const resetPlayerProfile = (): PlayerProfile => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
  }
  return { ...defaultProfile };
};

export const getGameHighScore = (gameId: string): number => {
  const profile = getPlayerProfile();
  return profile.gameStats[gameId]?.highScore || 0;
};
