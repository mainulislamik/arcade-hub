import { GameItem } from '../types/game';

export const GAMES_CATALOG: GameItem[] = [
  {
    id: 'snake',
    slug: 'snake',
    title: 'Retro Snake 2.0',
    category: 'retro',
    description: 'Classic 8-bit arcade snake with power-ups, particle trail effects, and responsive controls.',
    longDescription: 'Experience the nostalgic thrill of Classic Snake re-engineered with modern neon visuals, smooth 60 FPS movement, dynamic sound synthesis, and multiple power-up consumables. Steer your snake around the grid, consume neon energy orbs to grow, collect speed boosts and score multipliers, while avoiding wall collisions and your own growing tail.',
    howToPlay: [
      'Use Arrow keys, WASD, or swipe gestures to direct the snake.',
      'Collect cyan energy orbs to grow longer and increase your score.',
      'Grab golden power-up orbs for double score multiplier and speed effects.',
      'Avoid running into the arena walls or your own body.'
    ],
    controls: {
      desktop: 'Arrow Keys or WASD to change direction; Space to Pause/Resume',
      mobile: 'Swipe across screen or tap on-screen D-pad buttons'
    },
    tips: [
      'Create zig-zag patterns across the board to conserve space as you grow longer.',
      'Never trap your head against a corner without an escape route.',
      'Grab golden multiplier orbs quickly before they expire.'
    ],
    faqs: [
      {
        question: 'Is Retro Snake 2.0 free to play?',
        answer: 'Yes! Retro Snake 2.0 is 100% free with no login, signups, or downloads required. Everything runs locally in your browser.'
      },
      {
        question: 'How do I control the snake on mobile phones?',
        answer: 'On touchscreen devices, you can either swipe in any direction or use the high-contrast on-screen D-Pad.'
      },
      {
        question: 'Are high scores saved?',
        answer: 'Yes, your high scores and game stats are automatically saved to your browser local storage.'
      }
    ],
    badge: 'Popular',
    coverImage: '/assets/covers/snake-retro.jpg',
    proBadge: 'PRO CLASSIC',
    heroImage: '/assets/heroes/hero-spotlight-retro.jpg',
    difficulty: 'Easy',
    tags: ['Retro', 'Arcade', 'Classic', 'Casual'],
    gradient: 'from-emerald-500 to-teal-700',
    rating: 4.9,
    reviewCount: 1420,
    plays: 38400,
    releaseDate: '2026-01-15'
  },
  {
    id: 'game-2048',
    slug: '2048',
    title: '2048 Master',
    category: 'puzzle',
    description: 'Slide matching numbered tiles to merge them and conquer the ultimate 2048 tile.',
    longDescription: '2048 Master is a high-octane implementation of the world-famous sliding tile puzzle. Merge identical numeric tiles on a 4x4 grid by shifting them horizontally and vertically. Plan moves strategically, maintain your highest-value tile in the corner, and utilize the built-in Undo move feature to master the matrix.',
    howToPlay: [
      'Use Arrow keys, WASD, or swipe on screen to slide all grid tiles simultaneously.',
      'When two tiles with the same number collide, they merge into one with double value (2+2=4, 4+4=8... 1024+1024=2048).',
      'After every move, a new 2 or 4 tile randomly spawns in an empty slot.',
      'The objective is to create a 2048 tile and aim for maximum score before running out of legal moves.'
    ],
    controls: {
      desktop: 'Arrow Keys or WASD to slide tiles; U key or button to Undo',
      mobile: 'Swipe in any direction across the game board'
    },
    tips: [
      'Pick one corner (e.g. bottom-right) and keep your highest tile anchored there.',
      'Build descending chains along the edge leading into your corner anchor.',
      'Avoid sliding upwards if your anchor is situated in the bottom row.'
    ],
    faqs: [
      {
        question: 'Can I undo my last move in 2048 Master?',
        answer: 'Yes! 2048 Master provides an Undo button so you can recover from accidental slips and refine your strategy.'
      },
      {
        question: 'What happens after reaching 2048?',
        answer: 'You can keep playing beyond 2048 to unlock 4096, 8192, and record-breaking high scores!'
      }
    ],
    badge: 'Trending',
    coverImage: '/assets/covers/2048-master.jpg',
    proBadge: 'PRO MUST PLAY',
    difficulty: 'Medium',
    tags: ['Puzzle', 'Numbers', 'Math', 'Brain'],
    gradient: 'from-amber-500 to-orange-700',
    rating: 4.8,
    reviewCount: 980,
    plays: 29500,
    releaseDate: '2026-01-20'
  },
  {
    id: 'galaxy-defender',
    slug: 'galaxy-defender',
    title: 'Galaxy Defender',
    category: 'action',
    description: 'Fast-paced space arcade shooter with particle explosions, shields, and alien waves.',
    longDescription: 'Defend planet Earth from an interstellar armada in Galaxy Defender. Piloting your photon starfighter, weave through enemy bullet storms, collect shield refills and laser upgrades, and blast away alien swarm formations in 60 FPS arcade glory.',
    howToPlay: [
      'Steer your starfighter left and right to dodge enemy blaster fire.',
      'Fire photon lasers continuously to destroy incoming alien formations.',
      'Intercept falling power-ups for health restore and weapon enhancements.',
      'Survive escalating waves of alien attackers to rack up high scores.'
    ],
    controls: {
      desktop: 'Arrow Left/Right or A/D to steer; Spacebar to fire lasers',
      mobile: 'Touch drag to steer or tap on-screen fire & directional buttons'
    },
    tips: [
      'Target alien swarm leaders at the top of the formation to weaken their barrage.',
      'Never get cornered against the screen edges where evasion is difficult.',
      'Collect green shield repair orbs immediately when your hull integrity drops.'
    ],
    faqs: [
      {
        question: 'Does Galaxy Defender require an internet connection?',
        answer: 'No, once loaded the entire game engine and sound effects run 100% offline inside your browser.'
      }
    ],
    badge: 'Action Hit',
    coverImage: '/assets/covers/galaxy-defender.jpg',
    proBadge: 'PRO EXCLUSIVE',
    heroImage: '/assets/heroes/hero-spotlight-galaxy.jpg',
    difficulty: 'Medium',
    tags: ['Action', 'Space', 'Shooter', 'Arcade'],
    gradient: 'from-cyan-500 to-indigo-800',
    rating: 4.9,
    reviewCount: 1650,
    plays: 42100,
    releaseDate: '2026-02-01'
  },
  {
    id: 'word-quest',
    slug: 'word-quest',
    title: 'Word Quest',
    category: 'word',
    description: 'Test your vocabulary and logic with this daily & unlimited 5-letter word puzzle.',
    longDescription: 'Word Quest is an addictive 5-letter word puzzle game. Guess the mystery 5-letter word within 6 tries. With each guess, colored tiles reveal how close you are: Green indicates the correct letter in the right spot, Yellow means the letter is in the word but wrong spot, and Gray means the letter is not in the word.',
    howToPlay: [
      'Enter any valid 5-letter word using the keyboard and press Enter.',
      'Green tiles show the letter is correct and in the right position.',
      'Yellow tiles show the letter exists in the mystery word but in a different position.',
      'Gray tiles indicate the letter is not in the mystery word.',
      'Solve the word in as few attempts as possible to build a winning streak.'
    ],
    controls: {
      desktop: 'Physical keyboard: letters A-Z, Backspace to delete, Enter to submit',
      mobile: 'Interactive virtual on-screen QWERTY keyboard'
    },
    tips: [
      'Start with vowel-rich starter words such as ADIEU, CRANE, or AUDIO.',
      'Eliminate common consonants (R, S, T, L, N) early.',
      'Do not reuse gray letters in subsequent guesses.'
    ],
    faqs: [
      {
        question: 'Can I play Word Quest unlimited times?',
        answer: 'Yes! Unlike daily word puzzles that lock you out after one attempt, Word Quest lets you play unlimited rounds.'
      }
    ],
    badge: 'Brain Booster',
    coverImage: '/assets/covers/word-quest.jpg',
    proBadge: 'PRO DAILY',
    heroImage: '/assets/heroes/hero-spotlight-word.jpg',
    difficulty: 'Medium',
    tags: ['Word', 'Puzzle', 'Vocabulary', 'Logic'],
    gradient: 'from-emerald-600 to-cyan-700',
    rating: 4.9,
    reviewCount: 2100,
    plays: 51200,
    releaseDate: '2026-02-10'
  },
  {
    id: 'asteroid-blaster',
    slug: 'asteroid-blaster',
    title: 'Asteroid Blaster',
    category: 'retro',
    description: 'Thrust through zero-g deep space and vaporize fracturing space asteroids.',
    longDescription: 'Asteroid Blaster brings the golden age of vector arcade space combat to modern browsers. Rotate your vessel, apply inertia thrusters, and fire rapid lasers to shatter massive asteroid boulders into smaller fragments before they collide with your ship.',
    howToPlay: [
      'Rotate your ship with Left/Right and fire thrusters with Up arrow.',
      'Shoot lasers with Spacebar to split and destroy asteroids.',
      'Beware of the physics wrap: exiting one screen edge wraps you around to the opposite side.',
      'Survive multiple waves of asteroid belts.'
    ],
    controls: {
      desktop: 'Arrow Left/Right to rotate, Up to thrust, Spacebar to fire lasers',
      mobile: 'On-screen turn buttons, thrust pad, and fire laser trigger'
    },
    tips: [
      'Avoid shooting all large asteroids simultaneously to prevent filling the screen with fast tiny rocks.',
      'Use gentle thruster taps to maintain control without flying too fast.',
      'Wrap around screen edges strategically to escape tight situations.'
    ],
    faqs: [
      {
        question: 'How do the physics work in Asteroid Blaster?',
        answer: 'Asteroid Blaster simulates real zero-gravity momentum and inertia for true vector arcade physics.'
      }
    ],
    badge: 'Retro Classic',
    coverImage: '/assets/covers/asteroid-blaster.jpg',
    proBadge: 'PRO ACTION',
    heroImage: '/assets/heroes/hero-spotlight-asteroid.jpg',
    difficulty: 'Hard',
    tags: ['Retro', 'Space', 'Vector', 'Physics'],
    gradient: 'from-sky-500 to-blue-900',
    rating: 4.7,
    reviewCount: 840,
    plays: 19800,
    releaseDate: '2026-02-14'
  },
  {
    id: 'sudoku',
    slug: 'sudoku',
    title: 'Cyber Sudoku',
    category: 'puzzle',
    description: 'Exercise logic and deduction with classic 9x9 grid puzzles, notes, and auto-validation.',
    longDescription: 'Cyber Sudoku delivers a clean, modern logic puzzle experience. Fill each 9x9 grid so that every row, column, and 3x3 box contains all digits from 1 to 9 without repetition. Features draft note-taking, error alerts, and multiple difficulty levels.',
    howToPlay: [
      'Select any empty cell on the 9x9 grid.',
      'Type a number from 1 to 9 via keyboard or keypad.',
      'Toggle Note Mode to pencil in candidate numbers.',
      'Ensure every row, column, and 3x3 block has numbers 1-9 with no duplicates.'
    ],
    controls: {
      desktop: 'Number keys 1-9 to input, Backspace/Delete to clear, Arrow keys to navigate',
      mobile: 'Tap cells and use on-screen numeric keypad & tools'
    },
    tips: [
      'Look for rows, columns, or 3x3 boxes that already have 6 or more digits filled.',
      'Use the cross-hatching technique to find single candidate cells.',
      'Utilize notes mode for complex cells.'
    ],
    faqs: [
      {
        question: 'What is Note Mode in Cyber Sudoku?',
        answer: 'Note Mode lets you pencil in multiple candidate numbers in a single cell to track possibilities.'
      }
    ],
    badge: 'Mind Fitness',
    coverImage: '/assets/covers/sudoku-master.jpg',
    proBadge: 'PRO LOGIC',
    difficulty: 'Medium',
    tags: ['Sudoku', 'Logic', 'Numbers', 'Puzzle'],
    gradient: 'from-indigo-600 to-purple-800',
    rating: 4.8,
    reviewCount: 760,
    plays: 18400,
    releaseDate: '2026-02-18'
  },
  {
    id: 'flappy-bird',
    slug: 'flappy-bird',
    title: 'Flappy Cyber Bird',
    category: 'arcade',
    description: 'Tap to flap through neon pipe obstacles and score record-breaking flight distances.',
    longDescription: 'Flappy Cyber Bird reimagines the legendary tap-to-fly arcade phenomenon. Guide your cybernetic avian friend through narrow glowing conduit pipes. Timing, cadence, and rhythm are essential to navigate narrow gaps without touching obstacles or the ground.',
    howToPlay: [
      'Tap the screen, click mouse, or hit Spacebar to flap wings upwards.',
      'Time your flaps precisely to glide through narrow pipe openings.',
      'Each cleared pipe scores 1 point and unlocks achievement medals.',
      'Touching any pipe or the ground ends the run.'
    ],
    controls: {
      desktop: 'Spacebar, Up Arrow, or Left Mouse Click to flap',
      mobile: 'Tap anywhere on the game screen'
    },
    tips: [
      'Establish a steady rhythm rather than erratic double-taps.',
      'Focus your eye on the bottom pipe rim to gauge jump clearance.',
      'Stay centered in the conduit gap.'
    ],
    faqs: [
      {
        question: 'Why is Flappy Cyber Bird so challenging?',
        answer: 'The game uses tight gravity physics and narrow obstacle gaps, making it an exciting test of precision reflex and rhythm.'
      }
    ],
    badge: 'Addictive',
    coverImage: '/assets/covers/flappy-bird.jpg',
    proBadge: 'PRO ARCADE',
    difficulty: 'Hard',
    tags: ['Arcade', 'Flappy', 'Reflex', 'Highscore'],
    gradient: 'from-amber-400 to-yellow-600',
    rating: 4.6,
    reviewCount: 3100,
    plays: 64200,
    releaseDate: '2026-01-10'
  },
  {
    id: 'breakout',
    slug: 'breakout',
    title: 'Neon Breakout',
    category: 'arcade',
    description: 'Smash through neon brick barricades with angle deflection and power-ups.',
    longDescription: 'Neon Breakout is a modern take on the beloved brick-breaker genre. Bounce the photon energy ball off your high-tech magnetic paddle to shatter grids of colored bricks. Master angle deflection curves to slice through dense brick formations.',
    howToPlay: [
      'Slide the paddle horizontally to bounce the ball upwards.',
      'Hit different sections of your paddle to control ball trajectory angles.',
      'Clear all destructible bricks in the arena to advance.',
      'Do not let the ball drop past the bottom paddle line.'
    ],
    controls: {
      desktop: 'Mouse glide or Left/Right Arrow keys to move paddle',
      mobile: 'Touch drag horizontally across the paddle zone'
    },
    tips: [
      'Hit the ball with the outer edges of the paddle for sharp diagonal cuts.',
      'Tunnel a hole through one side of the brick wall to bounce the ball along the ceiling.'
    ],
    faqs: [
      {
        question: 'Does the ball speed up in Neon Breakout?',
        answer: 'Yes! As you break more bricks and maintain longer rallies, the ball gradually gains velocity.'
      }
    ],
    badge: 'Retro Arcade',
    coverImage: '/assets/covers/neon-breakout.jpg',
    proBadge: 'PRO RETRO',
    difficulty: 'Medium',
    tags: ['Breakout', 'Bricks', 'Arcade', 'Retro'],
    gradient: 'from-rose-500 to-purple-700',
    rating: 4.8,
    reviewCount: 1120,
    plays: 28900,
    releaseDate: '2026-01-25'
  },
  {
    id: 'tetris',
    slug: 'tetris',
    title: 'Tetra Block Drop',
    category: 'arcade',
    description: 'Stack and rotate 7 classic geometric tetrominoes to clear full horizontal lines.',
    longDescription: 'Tetra Block Drop brings the world-renowned falling block puzzle to life with vivid neon visuals and responsive controls. Arrange 7 distinct tetromino geometric blocks into solid rows. Complete horizontal lines to clear them, trigger quadruple 4-line clears, and prevent the stack from reaching the ceiling.',
    howToPlay: [
      'Move falling pieces left and right, and rotate them to fit snugly into the stack.',
      'Fill complete horizontal lines to vaporize them and score points.',
      'Clear multiple lines simultaneously (Double, Triple, Tetra Block) for bonus score multipliers.',
      'Use the Ghost piece shadow to plan your exact placement.'
    ],
    controls: {
      desktop: 'Left/Right to move, Up arrow to rotate, Down arrow for soft drop, Spacebar for instant hard drop',
      mobile: 'On-screen touch buttons for move, rotate, and drop'
    },
    tips: [
      'Keep the stack as flat as possible to avoid tall jagged gaps.',
      'Leave the rightmost column open to build up 4-line quadruple clears with the long I-bar.'
    ],
    faqs: [
      {
        question: 'What is a Hard Drop in Tetra Block?',
        answer: 'Pressing Spacebar instantly slams the falling piece to the bottom of the board for quick placement and bonus points.'
      }
    ],
    badge: 'Legendary',
    coverImage: '/assets/covers/tetra-block.jpg',
    proBadge: 'PRO LEGEND',
    difficulty: 'Medium',
    tags: ['Block Puzzle', 'Blocks', 'Puzzle', 'Arcade'],
    gradient: 'from-purple-600 to-indigo-900',
    rating: 4.9,
    reviewCount: 4200,
    plays: 87500,
    releaseDate: '2026-01-05'
  },
  {
    id: 'connect-four',
    slug: 'connect-four',
    title: 'Grid 4 Cyber',
    category: 'strategy',
    description: 'Drop colored discs into a 7x6 grid to connect 4 in a row before your opponent.',
    longDescription: 'Grid 4 Cyber is the digital evolution of the classic vertical 4-in-a-row strategy game. Challenge an adaptive AI bot or play locally with a friend on the same device. Drop your glowing discs into 7 columns, setting up multi-directional threats while blocking opponent setups.',
    howToPlay: [
      'Take turns selecting a column to drop your colored disc.',
      'Discs fall to the lowest available space within the selected column.',
      'Grid Four of your discs horizontally, vertically, or diagonally to win.',
      'If the board fills completely with no 4-in-a-row, the game ends in a draw.'
    ],
    controls: {
      desktop: 'Click on any of the 7 column headers to drop a disc',
      mobile: 'Tap column header directly on touchscreen'
    },
    tips: [
      'Control the center column (Column 4) — it offers the most possible 4-in-a-row combinations.',
      'Create 7-traps (forks) where you threaten two winning lines on a single turn.'
    ],
    faqs: [
      {
        question: 'Can I play Grid 4 Cyber against a friend on the same phone/PC?',
        answer: 'Yes! Toggle to "2P Local" mode to play turn-based matches with friends on the same device.'
      }
    ],
    badge: 'Strategy Hit',
    coverImage: '/assets/covers/connect-four.jpg',
    proBadge: 'PRO STRATEGY',
    difficulty: 'Medium',
    tags: ['Strategy', 'Board', 'Multiplayer', 'Logic'],
    gradient: 'from-blue-600 to-cyan-800',
    rating: 4.8,
    reviewCount: 940,
    plays: 23400,
    releaseDate: '2026-02-20'
  },
  {
    id: 'bubble-shooter',
    slug: 'bubble-shooter',
    title: 'Neon Bubble Shooter',
    category: 'arcade',
    description: 'Aim and fire colored bubbles to form clusters of 3+ and clear the grid.',
    longDescription: 'Neon Bubble Shooter is a vibrant casual bubble popper. Match 3 or more bubbles of the same color to burst them off the board. Bounce shots off side walls to reach tricky clusters, trigger cascading drop reactions, and clear the screen before the ceiling drops.',
    howToPlay: [
      'Aim your bubble cannon with mouse cursor or touch drag.',
      'Click or release to fire the loaded colored bubble.',
      'Match 3 or more bubbles of the same color to burst them.',
      'Prevent the descending bubble ceiling from reaching the shooter line.'
    ],
    controls: {
      desktop: 'Move mouse to aim, left click to shoot',
      mobile: 'Touch drag to aim trajectory line, release to fire'
    },
    tips: [
      'Use wall ricochets to shoot bubbles behind clusters and trigger massive drops.',
      'Check the "Next Bubble" preview to plan consecutive color matches.'
    ],
    faqs: [
      {
        question: 'What happens to isolated hanging bubbles?',
        answer: 'Any bubbles disconnected from the ceiling after a match will automatically drop and award bonus points.'
      }
    ],
    badge: 'Relaxing',
    coverImage: '/assets/covers/bubble-shooter.jpg',
    proBadge: 'PRO HIT',
    difficulty: 'Easy',
    tags: ['Bubble', 'Shooter', 'Match 3', 'Casual'],
    gradient: 'from-cyan-500 to-pink-600',
    rating: 4.7,
    reviewCount: 1380,
    plays: 34100,
    releaseDate: '2026-02-25'
  },
  {
    id: 'ultimate-tictactoe',
    slug: 'ultimate-tictactoe',
    title: 'Ultimate Tic-Tac-Toe',
    category: 'strategy',
    description: 'A 9-grid nested tactical board game where your moves dictate your opponent\'s options.',
    longDescription: 'Ultimate Tic-Tac-Toe takes standard Tic-Tac-Toe to deep strategic heights. The board consists of a 3x3 grid of 9 smaller Tic-Tac-Toe boards. Each move you make inside a small grid forces your opponent to play their next move inside the corresponding mini-grid.',
    howToPlay: [
      'Player X makes the opening move in any cell of any mini-board.',
      'The specific cell selected sends the opponent to that corresponding mini-grid on the big board.',
      'Win 3 mini-grids in a row (horizontal, vertical, diagonal) to win the entire game.',
      'If sent to an already-completed board, you can play in any open grid on the board.'
    ],
    controls: {
      desktop: 'Click any valid highlighted cell',
      mobile: 'Tap highlighted cell on touchscreen'
    },
    tips: [
      'Always check which mini-grid your move will send your opponent to before confirming.',
      'Sacrifice a mini-board if it forces your opponent into an unfavorable position.'
    ],
    faqs: [
      {
        question: 'What happens if a mini-grid ends in a draw?',
        answer: 'Drawn mini-grids count for neither player and remain locked as neutral territory.'
      }
    ],
    badge: 'Deep Tactics',
    coverImage: '/assets/covers/ultimate-tictactoe.jpg',
    proBadge: 'PRO STRATEGY',
    difficulty: 'Hard',
    tags: ['TicTacToe', 'Strategy', 'Mind Game', 'Board'],
    gradient: 'from-emerald-500 to-cyan-800',
    rating: 4.9,
    reviewCount: 620,
    plays: 14700,
    releaseDate: '2026-02-28'
  },
  {
    id: 'pac-maze',
    slug: 'pac-maze',
    title: 'Cyber Pac Runner',
    category: 'action',
    description: 'Chomp neon pellets through cybernetic mazes while evading AI ghost pursuers.',
    longDescription: 'Cyber Pac Runner is an homage to classic maze navigation. Guide your neon hero through cyber pathways, devouring energy pellets while dodging 3 intelligent AI ghost bots (Blinky, Pinky, Inky). Grab glowing Power Pellets to turn the tables and chomp the frightened ghosts for high scores.',
    howToPlay: [
      'Navigate the maze using Arrow keys or touch gestures.',
      'Eat all pellets scattered throughout the corridors to complete the stage.',
      'Consume glowing Power Pellets to render ghosts vulnerable and chomp them for multiplier points.',
      'Avoid regular ghosts to preserve your lives.'
    ],
    controls: {
      desktop: 'Arrow keys or WASD to navigate maze turns',
      mobile: 'Swipe or tap on-screen 4-way directional pad'
    },
    tips: [
      'Save Power Pellets until ghosts are actively cornering you.',
      'Use the horizontal side tunnels to quickly escape ghost ambushes.'
    ],
    faqs: [
      {
        question: 'Do ghosts respawn after being eaten?',
        answer: 'Yes! Eaten ghost eyes return to the central hub cage and respawn after a short countdown.'
      }
    ],
    badge: 'Retro Icon',
    coverImage: '/assets/covers/pac-runner.jpg',
    proBadge: 'PRO MASTER',
    difficulty: 'Hard',
    tags: ['Maze Runner', 'Maze', 'Retro', 'Action'],
    gradient: 'from-yellow-400 to-amber-700',
    rating: 4.8,
    reviewCount: 2800,
    plays: 62100,
    releaseDate: '2026-01-12'
  },
  {
    id: 'memory-flip',
    slug: 'memory-flip',
    title: 'Matrix Memory Flip',
    category: 'puzzle',
    description: 'Flip and match pairs of cyberpunk glyph cards with streak bonuses and speed multipliers.',
    longDescription: 'Matrix Memory Flip tests and sharpens your visual recall and concentration. Flip hidden digital glyph cards two at a time to uncover identical pairs. Build consecutive matching streaks to trigger score multiplier bonuses and achieve 3-star memory ratings.',
    howToPlay: [
      'Click or tap any covered card to reveal its cyber glyph.',
      'Flip a second card to find its matching pair.',
      'If the cards match, they stay revealed and award streak points.',
      'If they differ, they flip back down — memorize their positions for future turns!'
    ],
    controls: {
      desktop: 'Click cards with mouse cursor',
      mobile: 'Tap cards directly on touchscreen'
    },
    tips: [
      'Focus on memorizing card positions in grid quadrants rather than random scatter.',
      'Keep your match chain going to maximize score multipliers.'
    ],
    faqs: [
      {
        question: 'Does Matrix Memory Flip help memory training?',
        answer: 'Yes! Memory card games actively stimulate short-term memory, concentration, and spatial awareness.'
      }
    ],
    badge: 'Casual',
    difficulty: 'Easy',
    tags: ['Memory', 'Cards', 'Matching', 'Casual'],
    gradient: 'from-pink-500 to-rose-700',
    rating: 4.7,
    reviewCount: 880,
    plays: 21300,
    releaseDate: '2026-01-18'
  },
  {
    id: 'minesweeper',
    slug: 'minesweeper',
    title: 'Cyber Minesweeper',
    category: 'puzzle',
    description: 'Clear the cybernetic minefield using numerical deduction with guaranteed safe first clicks.',
    longDescription: 'Cyber Minesweeper provides a sleek modernization of the classic desktop deduction puzzle. Uncover safe tiles on a 9x9 grid without detonating hidden cyber mines. Numbers reveal how many mines touch each square. Features safe first-click assurance, flag toggling, and instant island reveals.',
    howToPlay: [
      'Click any tile to uncover it (First click is always 100% safe).',
      'Numbers indicate the exact count of adjacent mines touching that cell.',
      'Right click or toggle Flag Mode to mark suspected mine locations.',
      'Reveal all non-mine tiles to win the game.'
    ],
    controls: {
      desktop: 'Left Click to reveal, Right Click to place flag, Space to toggle Flag Mode',
      mobile: 'Tap to reveal, toggle on-screen Flag button for marking'
    },
    tips: [
      'Look for corner 1s and edge 1-2-1 patterns for guaranteed mine placements.',
      'Flag verified mines to prevent accidental misclicks.'
    ],
    faqs: [
      {
        question: 'Can I hit a mine on my very first click in Cyber Minesweeper?',
        answer: 'No! The board generates mines dynamically after your first move to guarantee you never detonate a mine on click one.'
      }
    ],
    badge: 'Classic',
    coverImage: '/assets/covers/minesweeper.jpg',
    proBadge: 'PRO TACTICAL',
    difficulty: 'Medium',
    tags: ['Minesweeper', 'Logic', 'Puzzle', 'Classic'],
    gradient: 'from-emerald-500 to-cyan-900',
    rating: 4.8,
    reviewCount: 1540,
    plays: 37900,
    releaseDate: '2026-01-22'
  },
  {
    id: 'cyber-pong',
    slug: 'cyber-pong',
    title: 'Neon Cyber Pong',
    category: 'strategy',
    description: 'High-speed neon paddle table tennis vs smart adaptive AI or 2-player local couch play.',
    longDescription: 'Neon Cyber Pong reinvents the game that launched the video game industry. Control glowing neon paddles to rally the photon ball at blistering speeds. Features smooth ball spin physics, reactive wall particle trails, and local 2-player mode.',
    howToPlay: [
      'Slide your paddle vertically to deflect the incoming cyber ball.',
      'Hit the ball while moving your paddle to impart curving angle deflection.',
      'First player to reach 7 points wins the championship.'
    ],
    controls: {
      desktop: 'W/S keys for Player 1, Up/Down arrow keys for Player 2 (or Mouse slide)',
      mobile: 'Touch drag left side for P1, right side for P2'
    },
    tips: [
      'Deflect the ball using the paddle tips for sharp diagonal angles that catch opponents off guard.',
      'Anticipate wall bounces to position your paddle before the ball arrives.'
    ],
    faqs: [
      {
        question: 'Can two people play Neon Cyber Pong on one computer keyboard?',
        answer: 'Yes! Select 2P mode: Player 1 uses W/S keys, and Player 2 uses Up/Down arrow keys.'
      }
    ],
    badge: 'PvP Ready',
    coverImage: '/assets/covers/cyber-pong.jpg',
    proBadge: 'PRO 2-PLAYER',
    difficulty: 'Medium',
    tags: ['Pong', 'Retro', 'Multiplayer', 'Arcade'],
    gradient: 'from-blue-500 to-indigo-800',
    rating: 4.7,
    reviewCount: 710,
    plays: 16800,
    releaseDate: '2026-01-28'
  },
  {
    id: 'simon-echo',
    slug: 'simon-echo',
    title: 'Sonic Color Echo',
    category: 'puzzle',
    description: 'Listen, watch, and repeat escalating synthesized audio-visual color sequences.',
    longDescription: 'Sonic Color Echo is an electro-rhythm memory game. Watch and listen as the 4 colored pads illuminate in a progressively lengthening sequence. Repeat the exact pattern to advance to higher rounds and unlock rhythm memory achievements.',
    howToPlay: [
      'Press Start to hear and see the computer flash the first pad sequence.',
      'Repeat the exact color sequence by clicking or tapping the pads.',
      'Each successful round appends a new random color to the sequence.',
      'One wrong tap ends the streak.'
    ],
    controls: {
      desktop: 'Click colored pads or press 1, 2, 3, 4 number keys',
      mobile: 'Tap colored pads directly'
    },
    tips: [
      'Assign numbers or musical pitches to each color in your mind (e.g. Green=1, Red=2).',
      'Speak the pattern rhythmically as it plays to reinforce auditory memory.'
    ],
    faqs: [
      {
        question: 'Are the sounds in Sonic Color Echo generated live?',
        answer: 'Yes! All sounds are procedurally synthesized in real time via your browser\'s Web Audio API with zero latency.'
      }
    ],
    badge: 'Rhythm',
    coverImage: '/assets/covers/simon-echo.jpg',
    proBadge: 'PRO AUDIO',
    difficulty: 'Medium',
    tags: ['Memory', 'Sonic', 'Audio', 'Sequence'],
    gradient: 'from-amber-500 to-rose-700',
    rating: 4.8,
    reviewCount: 650,
    plays: 15300,
    releaseDate: '2026-02-27'
  }
];
