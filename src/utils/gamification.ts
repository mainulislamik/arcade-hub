// Arcadex Client-Side Gamification, Daily Quests & XP Engine
// 100% Client-Side Persistence with 0% Server Load

export interface Quest {
  id: string;
  title: string;
  description: string;
  rewardXp: number;
  rewardCoins: number;
  progress: number;
  target: number;
  completed: boolean;
  claimed: boolean;
  type: 'play_count' | 'score' | 'share' | 'category' | 'spin';
}

export interface UserGamificationState {
  xp: number;
  level: number;
  coins: number;
  lastSpinDate: string | null;
  selectedAvatar: string;
  unlockedAvatars: string[];
  quests: Quest[];
  lastQuestDate: string;
}

export const AVATARS = [
  { id: 'pixel_retro', name: 'Retro Pixel', icon: '👾', levelRequired: 1 },
  { id: 'cyber_ninja', name: 'Cyber Ninja', icon: '🥷', levelRequired: 2 },
  { id: 'mecha_pilot', name: 'Mecha Pilot', icon: '🤖', levelRequired: 3 },
  { id: 'arcade_wizard', name: 'Arcade Wizard', icon: '🧙♂️', levelRequired: 5 },
  { id: 'galaxy_commander', name: 'Galaxy Commander', icon: '👨🚀', levelRequired: 8 },
  { id: 'dragon_slayer', name: 'Dragon Slayer', icon: '🐲', levelRequired: 10 },
  { id: 'matrix_god', name: 'Matrix God', icon: '⚡', levelRequired: 15 },
];

const STORAGE_KEY = 'arcadex_gamification_v1';

export function getGamificationState(): UserGamificationState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const today = new Date().toISOString().split('T')[0];
    
    if (raw) {
      const state: UserGamificationState = JSON.parse(raw);
      // Reset quests if it's a new day
      if (state.lastQuestDate !== today) {
        state.quests = generateDailyQuests();
        state.lastQuestDate = today;
        saveGamificationState(state);
      }
      return state;
    }
  } catch (e) {
    // fallback
  }

  const today = new Date().toISOString().split('T')[0];
  const initialState: UserGamificationState = {
    xp: 150,
    level: 1,
    coins: 50,
    lastSpinDate: null,
    selectedAvatar: 'pixel_retro',
    unlockedAvatars: ['pixel_retro'],
    quests: generateDailyQuests(),
    lastQuestDate: today
  };

  saveGamificationState(initialState);
  return initialState;
}

export function saveGamificationState(state: UserGamificationState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {}
}

export function generateDailyQuests(): Quest[] {
  return [
    {
      id: 'quest_1',
      title: 'Daily Arcade Warmup',
      description: 'Play any 3 arcade or retro games',
      rewardXp: 100,
      rewardCoins: 30,
      progress: 0,
      target: 3,
      completed: false,
      claimed: false,
      type: 'play_count'
    },
    {
      id: 'quest_2',
      title: 'High Score Hunter',
      description: 'Score over 1,000 points in any game',
      rewardXp: 200,
      rewardCoins: 50,
      progress: 0,
      target: 1000,
      completed: false,
      claimed: false,
      type: 'score'
    },
    {
      id: 'quest_3',
      title: 'Social Gamer',
      description: 'Share a game link or snapshot with friends',
      rewardXp: 80,
      rewardCoins: 25,
      progress: 0,
      target: 1,
      completed: false,
      claimed: false,
      type: 'share'
    },
    {
      id: 'quest_4',
      title: 'Daily Lucky Wheel',
      description: 'Spin the Lucky Wheel of Fortune',
      rewardXp: 150,
      rewardCoins: 40,
      progress: 0,
      target: 1,
      completed: false,
      claimed: false,
      type: 'spin'
    }
  ];
}

export function addXpAndCoins(xpToAdd: number, coinsToAdd: number): { state: UserGamificationState; leveledUp: boolean } {
  const state = getGamificationState();
  state.xp += xpToAdd;
  state.coins += coinsToAdd;

  const currentLevel = state.level;
  const newLevel = Math.floor(state.xp / 500) + 1;
  const leveledUp = newLevel > currentLevel;

  state.level = newLevel;

  // Auto unlock avatars if level reached
  AVATARS.forEach((av) => {
    if (state.level >= av.levelRequired && !state.unlockedAvatars.includes(av.id)) {
      state.unlockedAvatars.push(av.id);
    }
  });

  saveGamificationState(state);
  return { state, leveledUp };
}

export function recordQuestAction(action: 'play' | 'score' | 'share' | 'spin', value: number = 1): UserGamificationState {
  const state = getGamificationState();
  let updated = false;

  state.quests.forEach((q) => {
    if (!q.completed) {
      if (action === 'play' && q.type === 'play_count') {
        q.progress += value;
      } else if (action === 'score' && q.type === 'score') {
        q.progress = Math.max(q.progress, value);
      } else if (action === 'share' && q.type === 'share') {
        q.progress += value;
      } else if (action === 'spin' && q.type === 'spin') {
        q.progress += value;
      }

      if (q.progress >= q.target) {
        q.progress = q.target;
        q.completed = true;
        updated = true;
      }
    }
  });

  if (updated) {
    saveGamificationState(state);
  }
  return state;
}

export function claimQuestReward(questId: string): UserGamificationState {
  const state = getGamificationState();
  const quest = state.quests.find((q) => q.id === questId);

  if (quest && quest.completed && !quest.claimed) {
    quest.claimed = true;
    state.xp += quest.rewardXp;
    state.coins += quest.rewardCoins;
    state.level = Math.floor(state.xp / 500) + 1;
    saveGamificationState(state);
  }

  return state;
}
