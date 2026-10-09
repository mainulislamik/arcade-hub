import { GameItem } from '../types/game';

export const GAMES_CATALOG: GameItem[] = [
  // 1. Mecha Blaster 2 (Flagship Symbian S60 Classic)
  {
    id: 'mecha-blaster-2',
    slug: 'mecha-blaster-2',
    title: 'Mecha Blaster II: Mecha Clash',
    category: 'action',
    description: 'Authentic Nokia Symbian S60 top-down mecha warfare. Deploy Crown Mech with vulcan machine guns, rocket pods, plasma lasers, and battle armored tanks & choppers.',
    longDescription: 'Experience the legendary Symbian OS S60 arcade classic faithfully rebuilt with 60 FPS dual-layer torso & walking legs physics, authentic Nokia keypad, 4 campaign stages, and explosive mecha combat.',
    aspectRatio: '4:3',
    rating: 4.98,
    plays: 28450,
    likes: 1940,
    featured: true,
    isFeatured: true,
    tags: ['mecha', 'action', 'retro', 'nokia', 'symbian', 'shooting', 'boss-battle'],
    badge: 'FLAGSHIP',
    icon: '🤖',
    cover: '/assets/covers/mecha-blaster-2.jpg',
    coverImage: '/assets/covers/mecha-blaster-2.jpg',
    thumbnailUrl: '/assets/covers/mecha-blaster-2.jpg',
    difficulty: 'Medium',
    developer: 'Symbian EPOC Studio',
    platform: 'Symbian S60',
    engineType: 'native_canvas',
    controls: {
      keyboard: ['WASD / Arrow Keys (Move)', 'Space / J (Shoot)', 'Q / 7 (Switch Weapon)', 'E / 0 (Energy Shield)'],
      touch: ['Nokia Virtual Keypad', 'Touch On-Screen D-Pad']
    }
  },

  // 2. Slope 3D
  {
    id: 'slope-3d',
    slug: 'slope-3d',
    title: 'Slope 3D WebGL',
    category: 'action',
    description: 'High-speed 3D neon tunnel rolling ball game with procedural obstacle generation, dynamic tilt physics, and synthwave visuals.',
    aspectRatio: '16:9',
    rating: 4.95,
    plays: 45200,
    likes: 3820,
    featured: true,
    isFeatured: true,
    tags: ['3d', 'action', 'runner', 'speed', 'neon', 'webgl'],
    badge: '3D WEBGL',
    icon: '🌐',
    cover: '/assets/covers/slope-3d.jpg',
    coverImage: '/assets/covers/slope-3d.jpg',
    thumbnailUrl: '/assets/covers/slope-3d.jpg',
    difficulty: 'Hard',
    developer: 'Arcadex 3D Labs',
    platform: 'WebGL',
    engineType: 'native_canvas',
    controls: {
      keyboard: ['A / D or Left / Right (Steer ball)'],
      touch: ['Touch Left/Right sides to steer']
    }
  },

  // 3. Subway 3D Runner
  {
    id: 'subway-3d',
    slug: 'subway-3d',
    title: 'Subway 3D Surf Runner',
    category: 'action',
    description: 'Fast-paced 3D endless rail runner with 3-lane dodge mechanics, gold coin collection, power magnets, and dynamic jumping.',
    aspectRatio: '16:9',
    rating: 4.92,
    plays: 51200,
    likes: 4190,
    featured: true,
    isFeatured: true,
    tags: ['3d', 'action', 'runner', 'subway', 'parkour'],
    badge: 'TRENDING',
    icon: '🏃',
    cover: '/assets/covers/subway-3d.jpg',
    coverImage: '/assets/covers/subway-3d.jpg',
    thumbnailUrl: '/assets/covers/subway-3d.jpg',
    difficulty: 'Medium',
    developer: 'Arcadex 3D Labs',
    platform: 'WebGL',
    engineType: 'native_canvas',
    controls: {
      keyboard: ['A / D (Switch Lanes)', 'W / Space (Jump)', 'S (Slide)'],
      touch: ['Swipe Left/Right/Up/Down']
    }
  },

  // 4. Drift 3D Car Racing
  {
    id: 'drift-3d',
    slug: 'drift-3d',
    title: 'Drift 3D Hyper Racer',
    category: 'driving',
    description: 'Realistic tire-smoke drifting physics, nitro boost acceleration, neon race tracks, and high-speed cornering.',
    aspectRatio: '16:9',
    rating: 4.91,
    plays: 38900,
    likes: 2950,
    featured: true,
    isFeatured: true,
    tags: ['3d', 'driving', 'racing', 'drift', 'cars', 'webgl'],
    badge: '3D RACING',
    icon: '🏎️',
    cover: '/assets/covers/drift-3d.jpg',
    coverImage: '/assets/covers/drift-3d.jpg',
    thumbnailUrl: '/assets/covers/drift-3d.jpg',
    difficulty: 'Medium',
    developer: 'Arcadex 3D Labs',
    platform: 'WebGL',
    engineType: 'native_canvas',
    controls: {
      keyboard: ['W / Up (Accelerate)', 'S / Down (Brake)', 'A / D (Steer / Drift)', 'Space (Handbrake / Nitro)'],
      touch: ['On-screen Gas, Brake, and Steering buttons']
    }
  },

  // 5. Voxel Shooter 3D
  {
    id: 'voxel-3d',
    slug: 'voxel-3d',
    title: 'Voxel Shooter 3D Battle',
    category: 'shooting',
    description: 'Retro blocky voxel FPS battleground with destructive block physics, multiple weapon pickups, and zombie wave survival.',
    aspectRatio: '16:9',
    rating: 4.88,
    plays: 29400,
    likes: 2110,
    tags: ['3d', 'shooting', 'fps', 'voxel', 'survival', 'action'],
    badge: 'VOXEL FPS',
    icon: '🎯',
    cover: '/assets/covers/voxel-3d.jpg',
    coverImage: '/assets/covers/voxel-3d.jpg',
    thumbnailUrl: '/assets/covers/voxel-3d.jpg',
    difficulty: 'Medium',
    developer: 'Arcadex 3D Labs',
    platform: 'WebGL',
    engineType: 'native_canvas',
    controls: {
      keyboard: ['WASD (Move)', 'Mouse (Aim)', 'Left Click (Shoot)', 'R (Reload)', '1-4 (Weapons)'],
      touch: ['Virtual Joysticks & Fire Button']
    }
  },

  // 6. Cyber Knife 3D Target
  {
    id: 'knife-3d',
    slug: 'knife-3d',
    title: 'Cyber Knife 3D Master',
    category: 'arcade',
    description: 'Precision 3D knife throwing arcade simulator with rotating boss targets, apple slicing bonuses, and realistic knife physics.',
    aspectRatio: '16:9',
    rating: 4.85,
    plays: 22100,
    likes: 1840,
    tags: ['3d', 'arcade', 'casual', 'timing', 'knife'],
    badge: '3D ARCADE',
    icon: '🔪',
    cover: '/assets/covers/knife-3d.jpg',
    coverImage: '/assets/covers/knife-3d.jpg',
    thumbnailUrl: '/assets/covers/knife-3d.jpg',
    difficulty: 'Easy',
    developer: 'Arcadex 3D Labs',
    platform: 'WebGL',
    engineType: 'native_canvas',
    controls: {
      keyboard: ['Space / Left Click (Throw Knife)'],
      touch: ['Tap anywhere to throw knife']
    }
  },

  // 7. Hill Climb Racing
  {
    id: 'hill-climb',
    slug: 'hill-climb',
    title: 'Hill Climb 2D Physics Rally',
    category: 'driving',
    description: 'Classic physics-based 2D hill climber. Master vehicle suspension, mid-air tilt balance, coin collection, and fuel management.',
    aspectRatio: '16:9',
    rating: 4.89,
    plays: 36700,
    likes: 2840,
    tags: ['driving', 'physics', 'hill-climb', 'casual', 'cars'],
    badge: 'PHYSICS',
    icon: '🚙',
    cover: '/assets/covers/hill-climb.jpg',
    coverImage: '/assets/covers/hill-climb.jpg',
    thumbnailUrl: '/assets/covers/hill-climb.jpg',
    difficulty: 'Medium',
    developer: 'Arcadex Studio',
    platform: 'Canvas',
    engineType: 'native_canvas',
    controls: {
      keyboard: ['D / Right Arrow (Gas)', 'A / Left Arrow (Brake / Reverse)'],
      touch: ['Pedal Controls on touch screen']
    }
  },

  // 8. Fruit Slash Master
  {
    id: 'fruit-slash',
    slug: 'fruit-slash',
    title: 'Fruit Slash Master Blade',
    category: 'arcade',
    description: 'Juicy blade slicing arcade game. Slice airborne watermelons, oranges, and bananas while dodging dangerous bombs.',
    aspectRatio: '16:9',
    rating: 4.87,
    plays: 34100,
    likes: 2600,
    tags: ['arcade', 'ninja', 'casual', 'blade', 'action'],
    badge: 'POPULAR',
    icon: '🍉',
    cover: '/assets/covers/fruit-slash.jpg',
    coverImage: '/assets/covers/fruit-slash.jpg',
    thumbnailUrl: '/assets/covers/fruit-slash.jpg',
    difficulty: 'Easy',
    developer: 'Arcadex Studio',
    platform: 'Canvas',
    engineType: 'native_canvas',
    controls: {
      keyboard: ['Mouse Drag / Click (Slice blade)'],
      touch: ['Swipe finger across screen to slice']
    }
  },

  // 9. Stickman Warriors Battle
  {
    id: 'stickman-warriors',
    slug: 'stickman-warriors',
    title: 'Stickman Warriors Battle',
    category: 'action',
    description: 'Dynamic ragdoll physics arena brawler. Perform aerial spin kicks, weapon parries, and defeat hordes of ninja warriors.',
    aspectRatio: '16:9',
    rating: 4.89,
    plays: 41200,
    likes: 3120,
    tags: ['stickman', 'action', 'fighting', 'ragdoll', 'arena'],
    badge: 'ACTION HIT',
    icon: '⚔️',
    cover: '/assets/covers/stickman-warriors.jpg',
    coverImage: '/assets/covers/stickman-warriors.jpg',
    thumbnailUrl: '/assets/covers/stickman-warriors.jpg',
    difficulty: 'Medium',
    developer: 'Arcadex Studio',
    platform: 'Canvas',
    engineType: 'native_canvas',
    controls: {
      keyboard: ['WASD / Arrows (Move)', 'J / Space (Attack)', 'K (Special Kick)'],
      touch: ['Virtual D-Pad and Attack Buttons']
    }
  },

  // 10. Stickman Sniper Assassin
  {
    id: 'stickman-sniper',
    slug: 'stickman-sniper',
    title: 'Stickman Sniper Assassin',
    category: 'shooting',
    description: 'High-stakes rooftop tactical sniper simulation. Calibrate wind speed, lead moving criminal syndicate targets, and execute stealth contracts.',
    aspectRatio: '16:9',
    rating: 4.90,
    plays: 29800,
    likes: 2450,
    tags: ['stickman', 'shooting', 'sniper', 'stealth', 'tactical'],
    badge: 'SNIPER',
    icon: '🔭',
    cover: '/assets/covers/stickman-sniper.jpg',
    coverImage: '/assets/covers/stickman-sniper.jpg',
    thumbnailUrl: '/assets/covers/stickman-sniper.jpg',
    difficulty: 'Hard',
    developer: 'Arcadex Studio',
    platform: 'Canvas',
    engineType: 'native_canvas',
    controls: {
      keyboard: ['Mouse (Aim Scope)', 'Left Click / Space (Fire)', 'Shift (Hold Breath)'],
      touch: ['Drag Scope and Tap Trigger Button']
    }
  },

  // 11. Stickman Archer Master
  {
    id: 'stickman-archer',
    slug: 'stickman-archer',
    title: 'Stickman Archer Master',
    category: 'shooting',
    description: 'Precision bow-and-arrow duel physics. Calculate arc trajectories, release power, and score lethal headshots on castle archers.',
    aspectRatio: '16:9',
    rating: 4.86,
    plays: 25400,
    likes: 1980,
    tags: ['stickman', 'shooting', 'archery', 'physics', 'duel'],
    badge: 'BOW MASTER',
    icon: '🏹',
    cover: '/assets/covers/stickman-archer.jpg',
    coverImage: '/assets/covers/stickman-archer.jpg',
    thumbnailUrl: '/assets/covers/stickman-archer.jpg',
    difficulty: 'Medium',
    developer: 'Arcadex Studio',
    platform: 'Canvas',
    engineType: 'native_canvas',
    controls: {
      keyboard: ['Mouse Drag & Release (Aim & Shoot Bow)'],
      touch: ['Drag back and release arrow']
    }
  },

  // 12. Stickman Shadow Fighter
  {
    id: 'stickman-fighter',
    slug: 'stickman-fighter',
    title: 'Stickman Shadow Fighter',
    category: 'action',
    description: 'Lightning-fast kung-fu shadow martial arts. Execute 20+ combo chains, counter-attacks, and dragon punch finishers.',
    aspectRatio: '16:9',
    rating: 4.88,
    plays: 31000,
    likes: 2420,
    tags: ['stickman', 'action', 'martial-arts', 'fighting', 'combo'],
    badge: 'KUNG FU',
    icon: '🥋',
    cover: '/assets/covers/stickman-fighter.jpg',
    coverImage: '/assets/covers/stickman-fighter.jpg',
    thumbnailUrl: '/assets/covers/stickman-fighter.jpg',
    difficulty: 'Medium',
    developer: 'Arcadex Studio',
    platform: 'Canvas',
    engineType: 'native_canvas',
    controls: {
      keyboard: ['Arrow Keys (Move)', 'Z (Punch)', 'X (Kick)', 'C (Block)', 'Space (Special)'],
      touch: ['Touch Combo Pad']
    }
  },

  // 13. Stickman Parkour Runner
  {
    id: 'stickman-runner',
    slug: 'stickman-runner',
    title: 'Stickman Parkour Escape',
    category: 'action',
    description: 'High-altitude rooftop parkour escape. Perform wall runs, sliding rolls, gap vaults, and evade pursuing security forces.',
    aspectRatio: '16:9',
    rating: 4.84,
    plays: 23900,
    likes: 1820,
    tags: ['stickman', 'action', 'parkour', 'runner', 'speed'],
    badge: 'PARKOUR',
    icon: '🧗',
    cover: '/assets/covers/stickman-runner.jpg',
    coverImage: '/assets/covers/stickman-runner.jpg',
    thumbnailUrl: '/assets/covers/stickman-runner.jpg',
    difficulty: 'Medium',
    developer: 'Arcadex Studio',
    platform: 'Canvas',
    engineType: 'native_canvas',
    controls: {
      keyboard: ['W / Up (Jump)', 'S / Down (Slide / Roll)', 'Space (Vault)'],
      touch: ['Swipe Up to Jump, Down to Slide']
    }
  },

  // 14. Subway Surfer 2D Runner
  {
    id: 'subway-surfer',
    slug: 'subway-surfer',
    title: 'Subway Surfer 2D City Dash',
    category: 'action',
    description: 'Vibrant 2D rail surfing arcade with hoverboard boosts, coin magnets, subway trains, and urban beat soundtrack.',
    aspectRatio: '16:9',
    rating: 4.89,
    plays: 39500,
    likes: 3150,
    tags: ['action', 'runner', 'subway', 'arcade', 'hoverboard'],
    badge: 'SURFER',
    icon: '🛹',
    cover: '/assets/covers/subway-surfer.jpg',
    coverImage: '/assets/covers/subway-surfer.jpg',
    thumbnailUrl: '/assets/covers/subway-surfer.jpg',
    difficulty: 'Medium',
    developer: 'Arcadex Studio',
    platform: 'Canvas',
    engineType: 'native_canvas',
    controls: {
      keyboard: ['W / Up (Jump)', 'S / Down (Roll)', 'Space (Hoverboard)'],
      touch: ['Swipe Controls']
    }
  },

  // 15. Temple Dash 3D Runner
  {
    id: 'temple-dash',
    slug: 'temple-dash',
    title: 'Temple Dash Idol Escape',
    category: 'action',
    description: 'Ancient Aztec temple escape. Navigate crumbling stone bridges, fire traps, sharp turns, and escape the ancient guardian beast.',
    aspectRatio: '16:9',
    rating: 4.86,
    plays: 31200,
    likes: 2390,
    tags: ['action', 'runner', 'temple', 'adventure', '3d'],
    badge: 'ADVENTURE',
    icon: '🗿',
    cover: '/assets/covers/temple-dash.jpg',
    coverImage: '/assets/covers/temple-dash.jpg',
    thumbnailUrl: '/assets/covers/temple-dash.jpg',
    difficulty: 'Medium',
    developer: 'Arcadex Studio',
    platform: 'Canvas',
    engineType: 'native_canvas',
    controls: {
      keyboard: ['W / Up (Jump)', 'S / Down (Slide)', 'A / D (Turn Left/Right)'],
      touch: ['Swipe Up/Down/Left/Right']
    }
  },

  // 16. Pac-Man Arcade
  {
    id: 'pac-maze',
    slug: 'pac-maze',
    title: 'Pac-Maze Retro 1980',
    category: 'retro',
    description: 'Faithful recreation of the iconic 1980 maze arcade game. Munch glowing power pellets, evade Blinky, Pinky, Inky & Clyde, and chase fruit bonuses.',
    aspectRatio: '4:3',
    rating: 4.96,
    plays: 48900,
    likes: 4210,
    featured: true,
    tags: ['retro', 'arcade', 'classic', 'maze', '80s'],
    badge: 'ARCADE 1980',
    icon: '🟡',
    cover: '/assets/covers/pacman-arcade.jpg',
    coverImage: '/assets/covers/pacman-arcade.jpg',
    thumbnailUrl: '/assets/covers/pacman-arcade.jpg',
    difficulty: 'Medium',
    developer: 'Arcadex Retro Core',
    platform: 'Canvas',
    engineType: 'native_canvas',
    controls: {
      keyboard: ['Arrow Keys / WASD (Change Direction)'],
      touch: ['Swipe or Virtual Direction Pad']
    }
  },

  // 17. Tetris Classic 1989
  {
    id: 'tetris',
    slug: 'tetris',
    title: 'Tetris Classic 1989',
    category: 'retro',
    description: 'The definitive block-stacking puzzle game. Clear lines, achieve high-scoring Quadruple Tetris clears, and survive rising fall speeds.',
    aspectRatio: '4:3',
    rating: 4.97,
    plays: 56300,
    likes: 4890,
    featured: true,
    tags: ['retro', 'puzzle', 'classic', 'tetris', 'blocks'],
    badge: 'LEGENDARY',
    icon: '🧱',
    cover: '/assets/covers/tetris-classic.jpg',
    coverImage: '/assets/covers/tetris-classic.jpg',
    thumbnailUrl: '/assets/covers/tetris-classic.jpg',
    difficulty: 'Medium',
    developer: 'Arcadex Retro Core',
    platform: 'Canvas',
    engineType: 'native_canvas',
    controls: {
      keyboard: ['Left / Right (Move)', 'Up / X (Rotate)', 'Down (Soft Drop)', 'Space (Hard Drop)', 'C (Hold Piece)'],
      touch: ['On-Screen D-Pad and Rotate Button']
    }
  },

  // 18. Breakout Neon Master
  {
    id: 'breakout',
    slug: 'breakout',
    title: 'Neon Breakout Master',
    category: 'arcade',
    description: 'Dynamic brick breaker with laser powerups, multiball splits, paddle extensions, and destructible neon brick formations.',
    aspectRatio: '4:3',
    rating: 4.88,
    plays: 28700,
    likes: 2190,
    tags: ['arcade', 'retro', 'bricks', 'paddle', 'neon'],
    badge: 'RETRO HIT',
    icon: '🏓',
    cover: '/assets/covers/neon-breakout.jpg',
    coverImage: '/assets/covers/neon-breakout.jpg',
    thumbnailUrl: '/assets/covers/neon-breakout.jpg',
    difficulty: 'Easy',
    developer: 'Arcadex Studio',
    platform: 'Canvas',
    engineType: 'native_canvas',
    controls: {
      keyboard: ['A / D or Left / Right (Move Paddle)', 'Space (Launch Ball)'],
      touch: ['Drag paddle with finger']
    }
  },

  // 19. Galaxy Defender
  {
    id: 'galaxy-defender',
    slug: 'galaxy-defender',
    title: 'Galaxy Defender 1981',
    category: 'shooting',
    description: 'Classic vertical space shoot-em-up. Dodge swooping alien insect formations, capture dual starfighters, and blast mother-ship bosses.',
    aspectRatio: '4:3',
    rating: 4.91,
    plays: 33400,
    likes: 2680,
    tags: ['shooting', 'retro', 'space', 'arcade', 'aliens'],
    badge: 'SPACE SHMUP',
    icon: '🚀',
    cover: '/assets/covers/alien-invasion.jpg',
    coverImage: '/assets/covers/alien-invasion.jpg',
    thumbnailUrl: '/assets/covers/alien-invasion.jpg',
    difficulty: 'Medium',
    developer: 'Arcadex Retro Core',
    platform: 'Canvas',
    engineType: 'native_canvas',
    controls: {
      keyboard: ['Left / Right Arrow (Move Ship)', 'Space (Fire Laser)'],
      touch: ['Drag Ship and Tap to Fire']
    }
  },

  // 20. Asteroid Blaster 1979
  {
    id: 'asteroid-blaster',
    slug: 'asteroid-blaster',
    title: 'Asteroid Vector Blaster',
    category: 'shooting',
    description: 'Pure vector physics space combat. Thrust through zero-gravity deep space, blast splitting rocky asteroids, and duel enemy UFO saucers.',
    aspectRatio: '4:3',
    rating: 4.87,
    plays: 21800,
    likes: 1740,
    tags: ['shooting', 'retro', 'vector', 'space', 'asteroids'],
    badge: 'VECTOR 1979',
    icon: '☄️',
    cover: '/assets/covers/asteroids.jpg',
    coverImage: '/assets/covers/asteroids.jpg',
    thumbnailUrl: '/assets/covers/asteroids.jpg',
    difficulty: 'Hard',
    developer: 'Arcadex Retro Core',
    platform: 'Canvas',
    engineType: 'native_canvas',
    controls: {
      keyboard: ['Left / Right (Rotate)', 'Up (Thrust)', 'Space (Fire)', 'Down (Hyperspace)'],
      touch: ['Vector Touch Buttons']
    }
  },

  // 21. Cyber Dino T-Rex Runner
  {
    id: 'cyber-dino',
    slug: 'cyber-dino',
    title: 'Cyber Dino Chrome Runner',
    category: 'arcade',
    description: 'The famous offline T-Rex runner reimagined with cybernetic laser upgrades, flying pterodactyls, day/night cycles, and speed boosts.',
    aspectRatio: '16:9',
    rating: 4.89,
    plays: 44100,
    likes: 3620,
    tags: ['arcade', 'runner', 'dino', 'casual', 'offline'],
    badge: 'CHROME HIT',
    icon: '🦖',
    cover: '/assets/covers/dino-runner-real.jpg',
    coverImage: '/assets/covers/dino-runner-real.jpg',
    thumbnailUrl: '/assets/covers/dino-runner-real.jpg',
    difficulty: 'Easy',
    developer: 'Arcadex Studio',
    platform: 'Canvas',
    engineType: 'native_canvas',
    controls: {
      keyboard: ['Space / Up (Jump)', 'Down (Duck)'],
      touch: ['Tap anywhere to jump']
    }
  },

  // 22. Cyber Stack Builder
  {
    id: 'cyber-stack',
    slug: 'cyber-stack',
    title: 'Cyber Stack 3D Tower',
    category: 'arcade',
    description: 'Mesmerizing tower stacking puzzle. Time each moving neon block perfectly to build sky-high skyscraper towers with harmonic sound chord combos.',
    aspectRatio: '4:3',
    rating: 4.88,
    plays: 27900,
    likes: 2180,
    tags: ['arcade', 'casual', 'timing', 'tower', 'stack'],
    badge: 'PERFECT STACK',
    icon: '🏢',
    cover: '/assets/covers/cyber-stack.jpg',
    coverImage: '/assets/covers/cyber-stack.jpg',
    thumbnailUrl: '/assets/covers/cyber-stack.jpg',
    difficulty: 'Easy',
    developer: 'Arcadex Studio',
    platform: 'Canvas',
    engineType: 'native_canvas',
    controls: {
      keyboard: ['Space / Left Click (Drop Block)'],
      touch: ['Tap screen to drop block']
    }
  },

  // 23. Hextris Hexagonal Puzzle
  {
    id: 'hextris',
    slug: 'hextris',
    title: 'Hextris Hexagonal Match',
    category: 'puzzle',
    description: 'Fast-paced hexagonal puzzle game inspired by Tetris. Rotate the central hexagon to match 3 or more blocks of the same color before they overflow.',
    aspectRatio: '1:1',
    rating: 4.90,
    plays: 31400,
    likes: 2590,
    tags: ['puzzle', 'match-3', 'hexagon', 'casual', 'colors'],
    badge: 'HEX MATCH',
    icon: '⬡',
    cover: '/assets/covers/hextris.jpg',
    coverImage: '/assets/covers/hextris.jpg',
    thumbnailUrl: '/assets/covers/hextris.jpg',
    difficulty: 'Medium',
    developer: 'Arcadex Studio',
    platform: 'Canvas',
    engineType: 'native_canvas',
    controls: {
      keyboard: ['Left / Right Arrow or A / D (Rotate Hexagon)', 'Down Arrow (Fast Drop)'],
      touch: ['Tap Left/Right side of screen to rotate']
    }
  },

  // 24. 2048 Cyber Edition
  {
    id: 'game-2048',
    slug: 'game-2048',
    title: '2048 Cyber Master',
    category: 'puzzle',
    description: 'The addictive number-merging math puzzle. Slide tiles on a 4x4 grid, combine matching powers of two, and reach the legendary 2048 tile.',
    aspectRatio: '1:1',
    rating: 4.93,
    plays: 52100,
    likes: 4180,
    tags: ['puzzle', 'numbers', 'math', 'brain', 'logic'],
    badge: 'LOGIC MASTER',
    icon: '🔢',
    cover: '/assets/covers/memory-game.jpg',
    coverImage: '/assets/covers/memory-game.jpg',
    thumbnailUrl: '/assets/covers/memory-game.jpg',
    difficulty: 'Medium',
    developer: 'Arcadex Studio',
    platform: 'Canvas',
    engineType: 'native_canvas',
    controls: {
      keyboard: ['WASD or Arrow Keys (Slide all tiles)'],
      touch: ['Swipe in 4 directions']
    }
  },

  // 25. Nokia Snake 1997
  {
    id: 'snake',
    slug: 'snake',
    title: 'Nokia Snake Classic 1997',
    category: 'retro',
    description: 'Original Nokia 3310 monochrome dot-matrix snake. Eat crunchy food pellets, grow infinitely longer, and avoid running into your own tail.',
    aspectRatio: '4:3',
    rating: 4.95,
    plays: 49800,
    likes: 4350,
    featured: true,
    tags: ['retro', 'nokia', 'classic', 'snake', '90s'],
    badge: 'NOKIA 3310',
    icon: '🐍',
    cover: '/assets/covers/pacman-arcade.jpg',
    coverImage: '/assets/covers/pacman-arcade.jpg',
    thumbnailUrl: '/assets/covers/pacman-arcade.jpg',
    difficulty: 'Easy',
    developer: 'Arcadex Retro Core',
    platform: 'Canvas',
    engineType: 'native_canvas',
    controls: {
      keyboard: ['Arrow Keys / WASD / Keypad 2,4,6,8 (Turn)'],
      touch: ['Swipe / D-Pad']
    }
  },

  // 26. Flappy Cyber Bird
  {
    id: 'flappy-bird',
    slug: 'flappy-bird',
    title: 'Flappy Cyber Bird',
    category: 'arcade',
    description: 'The viral one-touch tapping game. Flap your cyber wings through narrow green pipe gaps without crashing.',
    aspectRatio: '4:3',
    rating: 4.82,
    plays: 38200,
    likes: 2790,
    tags: ['arcade', 'casual', 'flappy', 'hard', 'tap'],
    badge: 'RAGE CLASSIC',
    icon: '🐤',
    cover: '/assets/covers/clumsy-bird.jpg',
    coverImage: '/assets/covers/clumsy-bird.jpg',
    thumbnailUrl: '/assets/covers/clumsy-bird.jpg',
    difficulty: 'Hard',
    developer: 'Arcadex Studio',
    platform: 'Canvas',
    engineType: 'native_canvas',
    controls: {
      keyboard: ['Space / Up Arrow / Left Click (Flap Wings)'],
      touch: ['Tap anywhere to flap']
    }
  },

  // 27. Cyber Pong 1972
  {
    id: 'cyber-pong',
    slug: 'cyber-pong',
    title: 'Cyber Pong Classic 1972',
    category: 'retro',
    description: 'The grandfather of all video games with modern neon styling and responsive AI opponent with variable difficulty settings.',
    aspectRatio: '4:3',
    rating: 4.84,
    plays: 19400,
    likes: 1520,
    tags: ['retro', 'pong', 'classic', 'sports', 'table-tennis'],
    badge: 'FIRST GAME 1972',
    icon: '🏓',
    cover: '/assets/covers/cyber-pong.jpg',
    coverImage: '/assets/covers/cyber-pong.jpg',
    thumbnailUrl: '/assets/covers/cyber-pong.jpg',
    difficulty: 'Easy',
    developer: 'Arcadex Retro Core',
    platform: 'Canvas',
    engineType: 'native_canvas',
    controls: {
      keyboard: ['W / S or Up / Down (Move Left Paddle)'],
      touch: ['Drag paddle up/down']
    }
  },

  // 28. Bubble Shooter Master
  {
    id: 'bubble-shooter',
    slug: 'bubble-shooter',
    title: 'Bubble Shooter Master',
    category: 'puzzle',
    description: 'Aim and launch colorful bubbles. Match 3 or more bubbles of the same color to pop clusters and trigger cascading avalanche drops.',
    aspectRatio: '4:3',
    rating: 4.89,
    plays: 35100,
    likes: 2780,
    tags: ['puzzle', 'bubbles', 'match-3', 'casual', 'aim'],
    badge: 'POPULAR',
    icon: '🫧',
    cover: '/assets/covers/particle-clicker.jpg',
    coverImage: '/assets/covers/particle-clicker.jpg',
    thumbnailUrl: '/assets/covers/particle-clicker.jpg',
    difficulty: 'Easy',
    developer: 'Arcadex Studio',
    platform: 'Canvas',
    engineType: 'native_canvas',
    controls: {
      keyboard: ['Mouse Aim + Left Click / Space (Shoot Bubble)'],
      touch: ['Tap target to launch bubble']
    }
  },

  // 29. Minesweeper Classic 1990
  {
    id: 'minesweeper',
    slug: 'minesweeper',
    title: 'Minesweeper Windows 1990',
    category: 'puzzle',
    description: 'The legendary Windows puzzle. Uncover safe tiles using numbered proximity clues and plant red flags on hidden explosive mines.',
    aspectRatio: '1:1',
    rating: 4.90,
    plays: 28300,
    likes: 2310,
    tags: ['puzzle', 'retro', 'minesweeper', 'windows', 'logic'],
    badge: 'LOGIC PUZZLE',
    icon: '💣',
    cover: '/assets/covers/minesweeper.jpg',
    coverImage: '/assets/covers/minesweeper.jpg',
    thumbnailUrl: '/assets/covers/minesweeper.jpg',
    difficulty: 'Medium',
    developer: 'Arcadex Retro Core',
    platform: 'Canvas',
    engineType: 'native_canvas',
    controls: {
      keyboard: ['Left Click (Reveal Tile)', 'Right Click (Flag Mine)'],
      touch: ['Tap to reveal, Long-press to flag']
    }
  },

  // 30. Cyber Chess Grandmaster
  {
    id: 'cyber-chess',
    slug: 'cyber-chess',
    title: 'Cyber Chess Grandmaster',
    category: 'strategy',
    description: 'Full tournament chess engine with minimax AI evaluation, move highlights, checkmate validation, and undo history.',
    aspectRatio: '1:1',
    rating: 4.94,
    plays: 37600,
    likes: 3120,
    featured: true,
    tags: ['strategy', 'board', 'chess', 'brain', 'ai'],
    badge: 'GRANDMASTER',
    icon: '♟️',
    cover: '/assets/covers/cyber-chess.jpg',
    coverImage: '/assets/covers/cyber-chess.jpg',
    thumbnailUrl: '/assets/covers/cyber-chess.jpg',
    difficulty: 'Hard',
    developer: 'Arcadex Strategy Labs',
    platform: 'Canvas',
    engineType: 'native_canvas',
    controls: {
      keyboard: ['Mouse (Click piece to select, click square to move)'],
      touch: ['Touch piece then touch destination']
    }
  },

  // 31. Solitaire Pro Klondike
  {
    id: 'solitaire-pro',
    slug: 'solitaire-pro',
    title: 'Solitaire Klondike Pro',
    category: 'puzzle',
    description: 'Classic Klondike Solitaire card game. Build 4 suit foundations from Ace to King with smooth drag-and-drop card physics.',
    aspectRatio: '16:9',
    rating: 4.91,
    plays: 42100,
    likes: 3490,
    tags: ['puzzle', 'cards', 'solitaire', 'classic', 'casual'],
    badge: 'CARD CLASSIC',
    icon: '♠️',
    cover: '/assets/covers/solitaire-pro.jpg',
    coverImage: '/assets/covers/solitaire-pro.jpg',
    thumbnailUrl: '/assets/covers/solitaire-pro.jpg',
    difficulty: 'Medium',
    developer: 'Arcadex Studio',
    platform: 'Canvas',
    engineType: 'native_canvas',
    controls: {
      keyboard: ['Mouse (Click / Drag cards to columns)'],
      touch: ['Touch and drag cards']
    }
  },

  // 32. Sudoku Mastermind
  {
    id: 'sudoku',
    slug: 'sudoku',
    title: 'Sudoku Mastermind 9x9',
    category: 'puzzle',
    description: 'Clean numerical logic grid. Fill every 3x3 block, row, and column with numbers 1 to 9 without duplicates.',
    aspectRatio: '1:1',
    rating: 4.88,
    plays: 24100,
    likes: 1950,
    tags: ['puzzle', 'numbers', 'sudoku', 'brain', 'logic'],
    badge: 'BRAIN WORKOUT',
    icon: '🧩',
    cover: '/assets/covers/memory-match.jpg',
    coverImage: '/assets/covers/memory-match.jpg',
    thumbnailUrl: '/assets/covers/memory-match.jpg',
    difficulty: 'Medium',
    developer: 'Arcadex Studio',
    platform: 'Canvas',
    engineType: 'native_canvas',
    controls: {
      keyboard: ['Click Cell + Press Number 1-9', 'Backspace (Erase)'],
      touch: ['Touch cell then touch number pad']
    }
  },

  // 33. Connect Four Strategic
  {
    id: 'connect-four',
    slug: 'connect-four',
    title: 'Connect Four Strategic',
    category: 'strategy',
    description: 'Drop colored discs into the vertical grid. Strategize to align 4 consecutive discs horizontally, vertically, or diagonally.',
    aspectRatio: '4:3',
    rating: 4.85,
    plays: 19800,
    likes: 1540,
    tags: ['strategy', 'board', 'casual', 'multiplayer', 'logic'],
    badge: 'BOARD HIT',
    icon: '🔴',
    cover: '/assets/covers/connect-four.jpg',
    coverImage: '/assets/covers/connect-four.jpg',
    thumbnailUrl: '/assets/covers/connect-four.jpg',
    difficulty: 'Easy',
    developer: 'Arcadex Studio',
    platform: 'Canvas',
    engineType: 'native_canvas',
    controls: {
      keyboard: ['Click column or press 1-7 to drop disc'],
      touch: ['Tap column to drop']
    }
  },

  // 34. Wordle Cyber Guesser
  {
    id: 'wordle',
    slug: 'wordle',
    title: 'Wordle Cyber Guesser',
    category: 'word',
    description: 'Guess the hidden 5-letter English word in 6 attempts with color-coded feedback tiles (green, yellow, gray).',
    aspectRatio: '4:3',
    rating: 4.92,
    plays: 33200,
    likes: 2790,
    tags: ['word', 'puzzle', 'vocabulary', 'brain', 'daily'],
    badge: 'WORD MASTER',
    icon: '📝',
    cover: '/assets/covers/memory-game.jpg',
    coverImage: '/assets/covers/memory-game.jpg',
    thumbnailUrl: '/assets/covers/memory-game.jpg',
    difficulty: 'Medium',
    developer: 'Arcadex Studio',
    platform: 'Canvas',
    engineType: 'native_canvas',
    controls: {
      keyboard: ['Type A-Z letters + Press Enter to submit guess'],
      touch: ['Virtual Keyboard on screen']
    }
  },

  // 35. Simon Echo Memory
  {
    id: 'simon-echo',
    slug: 'simon-echo',
    title: 'Simon Echo Sound Memory',
    category: 'puzzle',
    description: 'Test auditory and visual memory. Watch the flashing color buttons, listen to the tones, and repeat increasingly long sequences.',
    aspectRatio: '1:1',
    rating: 4.86,
    plays: 18200,
    likes: 1410,
    tags: ['puzzle', 'memory', 'audio', 'colors', 'reflex'],
    badge: 'AUDIO MEMORY',
    icon: '🔔',
    cover: '/assets/covers/simon-echo.jpg',
    coverImage: '/assets/covers/simon-echo.jpg',
    thumbnailUrl: '/assets/covers/simon-echo.jpg',
    difficulty: 'Medium',
    developer: 'Arcadex Studio',
    platform: 'Canvas',
    engineType: 'native_canvas',
    controls: {
      keyboard: ['Click Color Quadrants or press Q,W,A,S'],
      touch: ['Tap colored buttons']
    }
  },

  // 36. Ultimate Tic-Tac-Toe
  {
    id: 'ultimate-tictactoe',
    slug: 'ultimate-tictactoe',
    title: 'Ultimate 9x9 Tic-Tac-Toe',
    category: 'strategy',
    description: 'A 9-board nested meta tic-tac-toe game where your move determines which mini-grid your opponent must play next.',
    aspectRatio: '1:1',
    rating: 4.88,
    plays: 16900,
    likes: 1380,
    tags: ['strategy', 'board', 'logic', 'tactics', 'tictactoe'],
    badge: 'TACTICAL META',
    icon: '❌',
    cover: '/assets/covers/ultimate-tictactoe.jpg',
    coverImage: '/assets/covers/ultimate-tictactoe.jpg',
    thumbnailUrl: '/assets/covers/ultimate-tictactoe.jpg',
    difficulty: 'Hard',
    developer: 'Arcadex Strategy Labs',
    platform: 'Canvas',
    engineType: 'native_canvas',
    controls: {
      keyboard: ['Click any highlighted active cell to place X / O'],
      touch: ['Tap cell']
    }
  },

  // 37. Memory Flip Cards
  {
    id: 'memory-flip',
    slug: 'memory-flip',
    title: 'Memory Flip Card Pairs',
    category: 'puzzle',
    description: 'Find matching icon pairs in a grid of face-down cards with minimal moves and fastest completion time.',
    aspectRatio: '4:3',
    rating: 4.83,
    plays: 17400,
    likes: 1320,
    tags: ['puzzle', 'memory', 'cards', 'brain', 'casual'],
    badge: 'PAIR MATCH',
    icon: '🃏',
    cover: '/assets/covers/memory-match.jpg',
    coverImage: '/assets/covers/memory-match.jpg',
    thumbnailUrl: '/assets/covers/memory-match.jpg',
    difficulty: 'Easy',
    developer: 'Arcadex Studio',
    platform: 'Canvas',
    engineType: 'native_canvas',
    controls: {
      keyboard: ['Click card to flip over and find its matching pair'],
      touch: ['Tap card to reveal']
    }
  }
];
