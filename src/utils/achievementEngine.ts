/**
 * Arcadex Trophy & Achievement System
 * Tracks and unlocks awards with Steam/PlayStation style sound and animation popups
 */

export interface Trophy {
  id: string;
  title: string;
  description: string;
  category: 'action' | 'retro' | 'speed' | 'score' | 'master';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  points: number;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
}

const TROPHY_DEFINITIONS: Omit<Trophy, 'unlocked' | 'unlockedAt'>[] = [
  {
    id: 'first_blood',
    title: 'Arcade Initiate',
    description: 'Launch and play your first game on Arcadex.',
    category: 'retro',
    tier: 'bronze',
    points: 50,
    icon: '🎮'
  },
  {
    id: 'bounce_veteran',
    title: 'Red Sphere Legend',
    description: 'Score over 1,000 points in Nokia Bounce or Java platformers.',
    category: 'score',
    tier: 'silver',
    points: 100,
    icon: '🔴'
  },
  {
    id: 'rewind_master',
    title: 'Time Traveler',
    description: 'Use the 10-Second Rewind to save yourself from disaster.',
    category: 'master',
    tier: 'silver',
    points: 100,
    icon: '⏳'
  },
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Play a game for more than 5 minutes continuously.',
    category: 'speed',
    tier: 'gold',
    points: 250,
    icon: '⚡'
  },
  {
    id: 'multiplayer_champion',
    title: 'P2P Gladiator',
    description: 'Host or join a WebRTC P2P Multiplayer room.',
    category: 'action',
    tier: 'gold',
    points: 250,
    icon: '⚔️'
  },
  {
    id: 'vault_keeper',
    title: 'Vault Archon',
    description: 'Upload and run a custom ROM or SIS file into the Vault.',
    category: 'master',
    tier: 'platinum',
    points: 500,
    icon: '👑'
  }
];

const ACHIEVEMENTS_STORAGE_KEY = 'arcadex_trophies_unlocked';

export class AchievementEngine {
  static getTrophies(): Trophy[] {
    const raw = localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
    const unlockedMap: Record<string, number> = raw ? JSON.parse(raw) : {};

    return TROPHY_DEFINITIONS.map(def => ({
      ...def,
      unlocked: !!unlockedMap[def.id],
      unlockedAt: unlockedMap[def.id]
    }));
  }

  static getAllTrophies(): Trophy[] {
    return this.getTrophies();
  }

  static unlockTrophy(id: string): Trophy | null {
    const raw = localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
    const unlockedMap: Record<string, number> = raw ? JSON.parse(raw) : {};

    if (unlockedMap[id]) return null; // Already unlocked

    const trophyDef = TROPHY_DEFINITIONS.find(t => t.id === id);
    if (!trophyDef) return null;

    unlockedMap[id] = Date.now();
    localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(unlockedMap));

    const fullTrophy: Trophy = {
      ...trophyDef,
      unlocked: true,
      unlockedAt: unlockedMap[id]
    };

    // Broadcast event for UI notification popup
    window.dispatchEvent(new CustomEvent('arcadex:trophy_unlocked', { detail: fullTrophy }));

    return fullTrophy;
  }
}
