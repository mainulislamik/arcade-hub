export interface GameProgress {
  gameId: string;
  highScore: number;
  totalPlays: number;
  totalTimeSeconds: number;
  lastPlayed: number;
}

export interface PlayerProfile {
  totalPlayTimeSeconds: number;
  streakDays: number;
  lastActiveDate: string;
  gamesProgress: Record<string, GameProgress>;
  cloudSyncId: string;
}

const STORAGE_KEY = 'arcadex_player_profile_v2';

export const getPlayerProfile = (): PlayerProfile => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Error reading player profile', e);
  }

  const today = new Date().toISOString().slice(0, 10);
  const initial: PlayerProfile = {
    totalPlayTimeSeconds: 0,
    streakDays: 1,
    lastActiveDate: today,
    gamesProgress: {},
    cloudSyncId: 'ARX-' + Math.random().toString(36).substring(2, 9).toUpperCase()
  };
  savePlayerProfile(initial);
  return initial;
};

export const savePlayerProfile = (profile: PlayerProfile) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.warn('Error saving player profile', e);
  }
};

export const recordGameScore = (gameId: string, score: number): boolean => {
  const profile = getPlayerProfile();
  const current = profile.gamesProgress[gameId] || {
    gameId,
    highScore: 0,
    totalPlays: 0,
    totalTimeSeconds: 0,
    lastPlayed: Date.now()
  };

  const isNewHighScore = score > current.highScore;
  if (isNewHighScore) {
    current.highScore = score;
  }
  current.totalPlays += 1;
  current.lastPlayed = Date.now();

  profile.gamesProgress[gameId] = current;
  savePlayerProfile(profile);
  return isNewHighScore;
};

export const recordPlayDuration = (gameId: string, seconds: number) => {
  const profile = getPlayerProfile();
  profile.totalPlayTimeSeconds += seconds;

  const current = profile.gamesProgress[gameId] || {
    gameId,
    highScore: 0,
    totalPlays: 0,
    totalTimeSeconds: 0,
    lastPlayed: Date.now()
  };
  current.totalTimeSeconds += seconds;
  profile.gamesProgress[gameId] = current;

  // Streak check
  const today = new Date().toISOString().slice(0, 10);
  if (profile.lastActiveDate !== today) {
    const last = new Date(profile.lastActiveDate).getTime();
    const diffDays = Math.round((new Date(today).getTime() - last) / (1000 * 3600 * 24));
    if (diffDays === 1) {
      profile.streakDays += 1;
    } else if (diffDays > 1) {
      profile.streakDays = 1;
    }
    profile.lastActiveDate = today;
  }

  savePlayerProfile(profile);
};

export const exportSaveDataJSON = (): string => {
  return JSON.stringify(getPlayerProfile(), null, 2);
};

export const importSaveDataJSON = (jsonString: string): boolean => {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed && typeof parsed.streakDays === 'number' && parsed.gamesProgress) {
      savePlayerProfile(parsed);
      return true;
    }
  } catch {
    return false;
  }
  return false;
};
