import { PlayerProfile, GameStats, Achievement } from '../types/game';

const STORAGE_KEY = 'arcade_hub_player_profile';

export const ACHIEVEMENTS_LIST: Achievement[] = [
  { id: 'first_game', title: 'First Drop', description: 'Play your first game on Arcadex', icon: '🎮', unlocked: false },
  { id: 'snake_master', title: 'Serpent King', description: 'Score 100+ points in Retro Snake', icon: '🐍', unlocked: false },
  { id: '2048_winner', title: 'Tile Architect', description: 'Reach the 2048 tile in 2048 Master', icon: '🧩', unlocked: false },
  { id: 'galaxy_hero', title: 'Cosmic Ace', description: 'Reach 1,000+ points in Galaxy Defender', icon: '🚀', unlocked: false },
  { id: 'word_detective', title: 'Lexicon Master', description: 'Decode a 5-letter word in Word Quest', icon: '🔤', unlocked: false },
  { id: 'sudoku_genius', title: 'Logic Guru', description: 'Complete a Sudoku puzzle', icon: '🔢', unlocked: false },
  { id: 'asteroid_blaster', title: 'Rock Crusher', description: 'Score 1,500+ in Asteroid Blaster', icon: '☄️', unlocked: false },
  { id: 'mecha_titan', title: 'Titan Slayer', description: 'Score 2,500+ in Mecha Blaster 2', icon: '🤖', unlocked: false },
  { id: 'five_games', title: 'Arcade Explorer', description: 'Play at least 5 different games', icon: '🌟', unlocked: false },
  { id: 'century_club', title: 'Century Veteran', description: 'Play 100 total game rounds', icon: '👑', unlocked: false },
];

export const defaultProfile: PlayerProfile = {
  totalGamesPlayed: 0,
  favoriteGames: [],
  recentGames: [],
  gameStats: {},
  achievements: ACHIEVEMENTS_LIST,
  soundEnabled: true,
};

export const getStoredProfile = (): PlayerProfile => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProfile;
    const parsed = JSON.parse(raw);
    return {
      ...defaultProfile,
      ...parsed,
      achievements: ACHIEVEMENTS_LIST.map((ach) => {
        const existing = parsed.achievements?.find((a: Achievement) => a.id === ach.id);
        return existing || ach;
      }),
    };
  } catch {
    return defaultProfile;
  }
};

export const saveProfile = (profile: PlayerProfile): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save player profile to LocalStorage', e);
  }
};

export const resetProfile = (): PlayerProfile => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear player profile', e);
  }
  return defaultProfile;
};

export const getGameHighScore = (gameId: string): number => {
  const profile = getStoredProfile();
  return profile.gameStats[gameId]?.highScore || 0;
};

export const checkAndUnlockAchievements = (profile: PlayerProfile): PlayerProfile => {
  let changed = false;
  const updatedAch = profile.achievements.map((ach) => {
    if (ach.unlocked) return ach;
    let unlock = false;

    if (ach.id === 'first_game' && profile.totalGamesPlayed >= 1) unlock = true;
    if (ach.id === 'five_games' && Object.keys(profile.gameStats).length >= 5) unlock = true;
    if (ach.id === 'century_club' && profile.totalGamesPlayed >= 100) unlock = true;
    if (ach.id === 'snake_master' && (profile.gameStats['snake']?.highScore || 0) >= 100) unlock = true;
    if (ach.id === 'galaxy_hero' && (profile.gameStats['galaxy-defender']?.highScore || 0) >= 1000) unlock = true;
    if (ach.id === 'asteroid_blaster' && (profile.gameStats['asteroid-blaster']?.highScore || 0) >= 1500) unlock = true;
    if (ach.id === 'mecha_titan' && (profile.gameStats['mecha-blaster-2']?.highScore || 0) >= 2500) unlock = true;
    if (ach.id === 'word_detective' && (profile.gameStats['word-quest']?.highScore || 0) > 0) unlock = true;
    if (ach.id === 'sudoku_genius' && (profile.gameStats['sudoku']?.highScore || 0) > 0) unlock = true;

    if (unlock) {
      changed = true;
      return { ...ach, unlocked: true, unlockedAt: new Date().toISOString() };
    }
    return ach;
  });

  if (changed) {
    const nextProfile = { ...profile, achievements: updatedAch };
    saveProfile(nextProfile);
    return nextProfile;
  }
  return profile;
};

export interface RecordResult {
  profile: PlayerProfile;
  isNewHighScore: boolean;
  stats: GameStats;
}

export const recordGamePlay = (
  gameId: string,
  score: number,
  durationSeconds: number = 0
): RecordResult & PlayerProfile => {
  const profile = getStoredProfile();
  const currentStats: GameStats = profile.gameStats[gameId] || {
    plays: 0,
    highScore: 0,
    lastPlayed: new Date().toISOString(),
    totalTimeSeconds: 0,
  };

  const isNewHighScore = score > currentStats.highScore;
  const updatedStats: GameStats = {
    plays: currentStats.plays + 1,
    highScore: Math.max(currentStats.highScore, score),
    lastPlayed: new Date().toISOString(),
    totalTimeSeconds: (currentStats.totalTimeSeconds || 0) + durationSeconds,
  };

  const recent = [gameId, ...profile.recentGames.filter((id) => id !== gameId)].slice(0, 8);

  const updatedProfile: PlayerProfile = {
    ...profile,
    totalGamesPlayed: profile.totalGamesPlayed + 1,
    recentGames: recent,
    gameStats: {
      ...profile.gameStats,
      [gameId]: updatedStats,
    },
  };

  const verifiedProfile = checkAndUnlockAchievements(updatedProfile);
  saveProfile(verifiedProfile);

  return Object.assign(verifiedProfile, {
    profile: verifiedProfile,
    isNewHighScore,
    stats: updatedStats,
  });
};

export const toggleFavoriteGame = (gameId: string): PlayerProfile => {
  const profile = getStoredProfile();
  const isFav = profile.favoriteGames.includes(gameId);
  const nextFavs = isFav
    ? profile.favoriteGames.filter((id) => id !== gameId)
    : [...profile.favoriteGames, gameId];

  const updated: PlayerProfile = {
    ...profile,
    favoriteGames: nextFavs,
  };
  saveProfile(updated);
  return updated;
};

export const updateSoundPreference = (enabled: boolean): PlayerProfile => {
  const profile = getStoredProfile();
  const updated: PlayerProfile = {
    ...profile,
    soundEnabled: enabled,
  };
  saveProfile(updated);
  return updated;
};
