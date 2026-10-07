import { GameItem } from '../types/game';

export const GAMES_CATALOG: GameItem[] = [
  {
    id: 'snake',
    title: 'Retro Snake 2.0',
    category: 'retro',
    description: 'Classic arcade snake with neon graphics, fruit bonuses, speed boosts, and particle effects.',
    tags: ['Retro', 'Arcade', 'Classic', 'Casual'],
    thumbnailGradient: 'from-emerald-600 via-green-500 to-lime-400',
    iconName: 'Zap',
    rating: 4.9,
    plays: 14200,
    difficulty: 'Easy',
    controls: {
      keyboard: ['Arrow Keys / WASD to steer', 'Space to pause/resume'],
      touch: 'Swipe on screen or use on-screen D-Pad'
    }
  },
  {
    id: 'game-2048',
    title: '2048 Master Edition',
    category: 'puzzle',
    description: 'Slide numbers and merge identical tiles to reach the legendary 2048 tile and beyond!',
    tags: ['Puzzle', 'Numbers', 'Brain', 'Math'],
    thumbnailGradient: 'from-amber-500 via-orange-500 to-yellow-400',
    iconName: 'Grid',
    rating: 4.8,
    plays: 28400,
    difficulty: 'Medium',
    controls: {
      keyboard: ['Arrow Keys / WASD to slide tiles', 'U to undo move'],
      touch: 'Swipe in 4 directions'
    }
  },
  {
    id: 'galaxy-defender',
    title: 'Galaxy Defender',
    category: 'action',
    description: 'Space arcade shooter! Pilot your starfighter, destroy alien waves, and avoid incoming asteroid barrages.',
    tags: ['Action', 'Shooter', 'Sci-Fi', 'Arcade'],
    thumbnailGradient: 'from-indigo-600 via-purple-600 to-pink-500',
    iconName: 'Rocket',
    rating: 4.9,
    plays: 19800,
    difficulty: 'Hard',
    controls: {
      keyboard: ['Arrow Keys / A/D to move', 'Space to fire lasers'],
      touch: 'Touch & Drag starfighter, auto-fire active'
    }
  },
  {
    id: 'flappy-bird',
    title: 'Flappy Cyber Bird',
    category: 'arcade',
    description: 'Navigate the cyber bird through hazardous energy pipes. One tap can make or break your high score.',
    tags: ['Arcade', 'Timing', 'Skill', 'Addictive'],
    thumbnailGradient: 'from-cyan-500 via-teal-500 to-emerald-400',
    iconName: 'Activity',
    rating: 4.7,
    plays: 35100,
    difficulty: 'Hard',
    controls: {
      keyboard: ['Space / Up Arrow to flap wings'],
      touch: 'Tap anywhere on the game screen'
    }
  },
  {
    id: 'breakout',
    title: 'Neon Breakout',
    category: 'arcade',
    description: 'Smash through neon brick walls with bouncy physics, multi-ball drops, and power-up beams.',
    tags: ['Arcade', 'Physics', 'Retro', 'Bricks'],
    thumbnailGradient: 'from-rose-500 via-pink-600 to-purple-600',
    iconName: 'Layers',
    rating: 4.8,
    plays: 16400,
    difficulty: 'Medium',
    controls: {
      keyboard: ['Left / Right Arrow or A/D to move paddle'],
      touch: 'Slide finger horizontally along bottom'
    }
  },
  {
    id: 'tetris',
    title: 'Block Matrix (Tetra)',
    category: 'puzzle',
    description: 'Stack falling geometric tetromino blocks, complete full rows to clear lines, and chase mega combos.',
    tags: ['Puzzle', 'Retro', 'Strategy', 'Geometry'],
    thumbnailGradient: 'from-blue-600 via-indigo-600 to-violet-500',
    iconName: 'Boxes',
    rating: 4.9,
    plays: 42000,
    difficulty: 'Medium',
    controls: {
      keyboard: ['Left/Right to move', 'Up / X to rotate', 'Down to soft drop', 'Space to hard drop'],
      touch: 'On-screen touch buttons for move, drop & rotate'
    }
  },
  {
    id: 'pac-maze',
    title: 'Cyber Pac Runner',
    category: 'retro',
    description: 'Chomp all cyber dots in the neon labyrinth while dodging roaming security glitch bots.',
    tags: ['Retro', 'Maze', 'Classic', 'Strategy'],
    thumbnailGradient: 'from-yellow-400 via-amber-500 to-red-500',
    iconName: 'Disc',
    rating: 4.9,
    plays: 24700,
    difficulty: 'Medium',
    controls: {
      keyboard: ['Arrow Keys / WASD to change direction'],
      touch: 'Swipe or touch D-Pad controls'
    }
  },
  {
    id: 'memory-flip',
    title: 'Matrix Memory Flip',
    category: 'puzzle',
    description: 'Test and sharpen your memory! Flip matching cyber tiles before the countdown timer hits zero.',
    tags: ['Puzzle', 'Memory', 'Brain', 'Casual'],
    thumbnailGradient: 'from-fuchsia-600 via-purple-600 to-indigo-600',
    iconName: 'Eye',
    rating: 4.7,
    plays: 11200,
    difficulty: 'Easy',
    controls: {
      keyboard: ['Mouse click on cards'],
      touch: 'Tap cards directly to flip'
    }
  },
  {
    id: 'minesweeper',
    title: 'Cyber Minesweeper',
    category: 'strategy',
    description: 'Deduce hidden mine locations across the tactical cyber field using numerical proximity hints.',
    tags: ['Strategy', 'Logic', 'Classic', 'Mines'],
    thumbnailGradient: 'from-slate-700 via-zinc-800 to-neutral-900',
    iconName: 'ShieldAlert',
    rating: 4.8,
    plays: 18900,
    difficulty: 'Hard',
    controls: {
      keyboard: ['Left Click to reveal', 'Right Click to place flag'],
      touch: 'Tap to reveal, toggle Flag Mode button to plant flags'
    }
  },
  {
    id: 'cyber-pong',
    title: 'Neon Cyber Pong',
    category: 'action',
    description: 'High-speed duel between paddles. Challenge the adaptive AI bot or play with a friend locally!',
    tags: ['Action', 'Sports', '2 Player', 'Arcade'],
    thumbnailGradient: 'from-emerald-500 via-teal-600 to-cyan-700',
    iconName: 'Trophy',
    rating: 4.8,
    plays: 15300,
    difficulty: 'Medium',
    controls: {
      keyboard: ['P1: W / S keys', 'P2: Up / Down arrow keys'],
      touch: 'Drag paddle vertically on your side'
    }
  }
];
