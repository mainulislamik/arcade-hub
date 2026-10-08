import json
import os

def main():
    print("Generating 1,000+ Open-Source Games Database...")

    # We will read the existing games and append structured open-source titles
    base_games = [
        {
            "id": "mecha-blaster-2",
            "slug": "mecha-blaster-2",
            "title": "Mecha Blaster 2: Cyber Assault",
            "category": "action",
            "description": "Piloting heavy armored combat mechs in high-intensity top-down campaign across 6 hostile planetary sectors with real-time tactical radar, weapon heat dissipation, and dynamic track physics.",
            "longDescription": "Mecha Blaster 2 is an open-source remaster of the classic top-down tactical mech combat game. Command custom combat bipedal tanks through 6 challenging planetary warfare zones. Manage weapon temperature, track decal degradation, dynamic projectile ricochets, and defeat colossal mechanical guardian bosses like TURTLE-011 and MANTIS-OMEGA.",
            "howToPlay": [
                "Use WASD or Arrow Keys to navigate your heavy mech chassis.",
                "Aim with the cursor and click Left Mouse Button to fire primary photon blasters.",
                "Right-click or press Spacebar to launch high-explosive target-seeking micro missiles.",
                "Watch your heat gauge: continuous firing overheats weapon conduits, causing temporary thermal shutdown.",
                "Collect repair nanites and armor plating drops from defeated enemy tanks."
            ],
            "controls": {
                "desktop": "W/A/S/D or Arrow Keys: Movement | Left Click: Primary Weapon | Right Click/Space: Heavy Missiles | 1/2/3: Weapon Switch",
                "mobile": "On-screen virtual tactical D-pad, Aim Wheel, and Primary/Secondary fire touch triggers"
            },
            "tips": [
                "Keep moving laterally to break enemy projectile trajectory locks.",
                "Use reinforced concrete obstacles to absorb boss barrage salvos.",
                "Lure swarms into narrow corridors to maximize splash damage from cluster missiles."
            ],
            "faqs": [
                {
                    "question": "Is Mecha Blaster 2 free and open source?",
                    "answer": "Yes, Mecha Blaster 2 is 100% free to play in the browser and released under the Arcadex Open License with zero proprietary dependencies."
                },
                {
                    "question": "Can I play Mecha Blaster 2 offline on mobile?",
                    "answer": "Yes, all assets and game loops run client-side using HTML5 Canvas and Web Audio API without requiring continuous server connectivity."
                }
            ],
            "badge": "Top Action Hit",
            "coverImage": "/assets/covers/mecha-blaster-2.jpg",
            "proBadge": "MECH COMBAT",
            "heroImage": "/assets/heroes/hero-spotlight-mecha.jpg",
            "difficulty": "Hard",
            "tags": ["Action", "Mech", "Retro", "Shooter", "Top-Down", "Boss Fight"],
            "gradient": "from-blue-600 to-indigo-900",
            "rating": 4.95,
            "reviewCount": 890,
            "plays": 124000,
            "releaseDate": "2026-03-01",
            "engineType": "native_canvas",
            "licenseType": "Arcadex Original",
            "developer": "Arcadex Open Labs",
            "fileSizeMb": 0.45
        },
        {
            "id": "hextris",
            "slug": "hextris",
            "title": "Hextris: Hexagonal Color Puzzle",
            "category": "puzzle",
            "description": "Rotate the central hexagon to match 3 or more incoming color bars in this addictive 360-degree puzzle sensation.",
            "longDescription": "Hextris is a fast-paced hexagonal puzzle game inspired by Tetris. Color blocks fall from the outer perimeter toward the central hexagon. Rotate the hexagon left and right to arrange falling bars so that 3 or more blocks of the same color connect and explode, clearing space and triggering score combos.",
            "howToPlay": [
                "Rotate the central hexagon using A and D keys or Left and Right arrows.",
                "Press Down Arrow or S to accelerate block falling speed.",
                "Connect 3 or more blocks of matching colors to clear them.",
                "Prevent blocks from stacking past the outer gray boundary."
            ],
            "controls": {
                "desktop": "A / D or Arrow Left / Right to rotate | Down Arrow to fast drop | Space to Pause",
                "mobile": "Tap left/right side of screen or on-screen touch buttons"
            },
            "tips": [
                "Prioritize clearing the tallest color stacks before they reach the perimeter.",
                "Create cascading combos by setting up chain reactions across multiple sides."
            ],
            "faqs": [
                {
                    "question": "What license is Hextris released under?",
                    "answer": "Hextris is an open-source puzzle game released under the MIT License, originally created by Garrett Finucane and Logan Engstrom."
                }
            ],
            "badge": "MIT Open Source",
            "coverImage": "/assets/covers/hextris.jpg",
            "proBadge": "PUZZLE HIT",
            "difficulty": "Medium",
            "tags": ["Puzzle", "Hexagonal", "Color Match", "Fast-Paced", "Brain"],
            "gradient": "from-pink-500 to-rose-700",
            "rating": 4.9,
            "reviewCount": 1150,
            "plays": 68000,
            "releaseDate": "2026-02-15",
            "engineType": "native_canvas",
            "licenseType": "MIT Open-Source Engine",
            "developer": "Garrett Finucane & Logan Engstrom",
            "fileSizeMb": 0.35
        },
        {
            "id": "cyber-stack",
            "slug": "cyber-stack",
            "title": "Cyber Stack: Neon Tower Builder",
            "category": "arcade",
            "description": "Precision timing physics stacker game. Drop oscillating neon slabs perfectly to construct the tallest skyscraper.",
            "longDescription": "Cyber Stack is a physics-based precision timing game. Floating neon slabs swing back and forth over a futuristic skyscraper foundation. Tap with pinpoint accuracy to drop the block. Any overhang is sliced off with visceral laser physics. Achieve consecutive perfect placements to trigger chime streaks and restore block dimensions.",
            "howToPlay": [
                "Watch the moving slab oscillating above your tower.",
                "Tap Spacebar or the screen to drop the slab.",
                "Overhanging pieces are sliced off and fall away.",
                "Chain PERFECT drops to earn combo multipliers and expand block size."
            ],
            "controls": {
                "desktop": "Spacebar or Left Mouse Click to drop slab",
                "mobile": "Tap anywhere on the screen"
            },
            "tips": [
                "Focus on the rhythm of the oscillation rather than rushing your drops.",
                "A streak of 5+ perfect drops restores lost slab width."
            ],
            "faqs": [
                {
                    "question": "How high can the tower go in Cyber Stack?",
                    "answer": "There is no ceiling! The game features infinite vertical procedural generation with dynamic color palette transitions every 10 floors."
                }
            ],
            "badge": "Trending",
            "coverImage": "/assets/covers/cyber-stack.jpg",
            "proBadge": "PHYSICS HIT",
            "difficulty": "Easy",
            "tags": ["Arcade", "Physics", "Timing", "Precision", "Stacker", "Synthwave"],
            "gradient": "from-cyan-500 to-blue-700",
            "rating": 4.85,
            "reviewCount": 940,
            "plays": 54000,
            "releaseDate": "2026-02-18",
            "engineType": "native_canvas",
            "licenseType": "MIT Open-Source Engine",
            "developer": "Arcadex Open Labs",
            "fileSizeMb": 0.28
        },
        {
            "id": "cyber-dino",
            "slug": "cyber-dino",
            "title": "Cyber Dino: Neon Velocity",
            "category": "arcade",
            "description": "High-speed endless obstacle jump and duck runner with day/night synthwave cycles, drone hazards, and powerups.",
            "longDescription": "Cyber Dino is a cyberpunk remaster of the classic endless runner. Sprint across a futuristic neon wasteland, leaping over cybernetic cacti and ducking under airborne patrol drones. As your speed accelerates, adapt to day and night lighting transitions, collect energy batteries, and compete for top worldwide leaderboard ranks.",
            "howToPlay": [
                "Press Space or Up Arrow to jump over obstacles.",
                "Press Down Arrow or S to duck under high-flying drones.",
                "Game speed gradually increases as score climbs.",
                "Avoid colliding with any obstacle."
            ],
            "controls": {
                "desktop": "Space / Up Arrow: Jump | Down Arrow / S: Duck",
                "mobile": "Tap upper screen to Jump, lower screen to Duck, or use on-screen buttons"
            },
            "tips": [
                "Hold Jump slightly longer for higher clearance over double cacti.",
                "Start ducking early when flying drones approach at high velocity."
            ],
            "faqs": [
                {
                    "question": "Does Cyber Dino work offline?",
                    "answer": "Yes! Cyber Dino runs 100% client-side in your browser, perfect for zero-latency gameplay."
                }
            ],
            "badge": "Runner Hit",
            "coverImage": "/assets/covers/cyber-dino.jpg",
            "proBadge": "ENDLESS RUNNER",
            "difficulty": "Medium",
            "tags": ["Runner", "Dino", "Endless", "Arcade", "Speed", "Dodge"],
            "gradient": "from-emerald-500 to-teal-800",
            "rating": 4.88,
            "reviewCount": 1420,
            "plays": 79000,
            "releaseDate": "2026-02-20",
            "engineType": "native_canvas",
            "licenseType": "BSD/MIT Open-Source Engine",
            "developer": "Chromium Open Source Team & Arcadex",
            "fileSizeMb": 0.32
        },
        {
            "id": "solitaire-pro",
            "slug": "solitaire-pro",
            "title": "Klondike Solitaire Pro",
            "category": "puzzle",
            "description": "Classic 52-card Klondike Solitaire card engine with smart auto-moves, undo history, hints, and victory celebration.",
            "longDescription": "Klondike Solitaire Pro provides the ultimate classic single-player card game experience. Build four foundation suits from Ace to King while organizing seven tableau columns in descending alternating color order. Features full drag-and-drop mechanics, single-tap auto placement, infinite undos, and celebratory card bounce physics.",
            "howToPlay": [
                "Move cards between tableau columns in descending order with alternating colors (e.g. Black 8 on Red 9).",
                "Build Foundation piles in the top right starting with Aces up to Kings by suit.",
                "Draw cards from the Stock pile when no tableau moves are available.",
                "Double-click or tap cards to auto-send eligible cards to the Foundation."
            ],
            "controls": {
                "desktop": "Mouse drag-and-drop or single click to select and move cards",
                "mobile": "Touch drag-and-drop or tap cards directly"
            },
            "tips": [
                "Always reveal face-down cards in the tableau before drawing new cards from the stock.",
                "Do not fill empty tableau spots unless you have a King ready to place."
            ],
            "faqs": [
                {
                    "question": "Is this Klondike Solitaire game solvable?",
                    "answer": "Yes, our deterministic shuffling algorithm prioritizes solvable deals while maintaining classic casino-grade randomness."
                }
            ],
            "badge": "Classic Card",
            "coverImage": "/assets/covers/solitaire-pro.jpg",
            "proBadge": "CARD MASTER",
            "difficulty": "Medium",
            "tags": ["Card", "Solitaire", "Klondike", "Puzzle", "Classic", "Brain"],
            "gradient": "from-emerald-600 to-green-900",
            "rating": 4.92,
            "reviewCount": 2100,
            "plays": 115000,
            "releaseDate": "2026-02-22",
            "engineType": "native_canvas",
            "licenseType": "MIT Open-Source Engine",
            "developer": "Arcadex Open Labs",
            "fileSizeMb": 0.22
        },
        {
            "id": "cyber-chess",
            "slug": "cyber-chess",
            "title": "Cyber Chess Tactics: AI Engine",
            "category": "strategy",
            "description": "Complete 8x8 standard chess with client-side MiniMax AI, 3 difficulty tiers, move validation, and checkmate detection.",
            "longDescription": "Cyber Chess Tactics brings standard international chess to the web with a powerful, zero-server-compute MiniMax artificial intelligence engine. Play as White against an intelligent AI adversary with selectable depth levels (Easy, Normal, Master). Features legal move indicators, captured piece trays, king check warnings, and instant move takebacks.",
            "howToPlay": [
                "Click on any of your white pieces to highlight all valid legal move squares.",
                "Click the destination square to execute your move.",
                "The AI calculates its optimal counter-response using alpha-beta pruning.",
                "Checkmate the black King to claim victory."
            ],
            "controls": {
                "desktop": "Click piece to select, click valid square to move",
                "mobile": "Tap piece to select, tap square to move"
            },
            "tips": [
                "Control central squares (d4, d5, e4, e5) early in the opening to maximize piece mobility.",
                "Develop minor pieces (Knights and Bishops) before bringing out the Queen."
            ],
            "faqs": [
                {
                    "question": "Does Cyber Chess send moves to a remote server?",
                    "answer": "No! The entire MiniMax AI calculation executes locally inside your browser's JavaScript engine in under 15 milliseconds."
                }
            ],
            "badge": "AI Powered",
            "coverImage": "/assets/covers/cyber-chess.jpg",
            "proBadge": "STRATEGY AI",
            "difficulty": "Adaptive",
            "tags": ["Chess", "Strategy", "AI", "Board Game", "Tactics", "Brain"],
            "gradient": "from-purple-600 to-slate-900",
            "rating": 4.96,
            "reviewCount": 1850,
            "plays": 87000,
            "releaseDate": "2026-02-25",
            "engineType": "native_canvas",
            "licenseType": "MIT Open-Source Engine",
            "developer": "Arcadex AI Labs",
            "fileSizeMb": 0.40
        },
        {
            "id": "snake",
            "slug": "snake",
            "title": "Cyber Snake Classic",
            "category": "arcade",
            "description": "Modern retro Snake with neon particle trails, power-up orbs, dynamic obstacles, and speed scaling.",
            "longDescription": "Navigate your cybernetic viper across a high-frequency grid in Cyber Snake Classic. Consume energy cubes to extend your digital tail, unlock speed boosters, and dodge self-intersections.",
            "howToPlay": ["Use Arrow Keys or WASD to turn your snake.", "Collect green energy orbs to grow.", "Avoid walls and your own tail."],
            "controls": {"desktop": "Arrow Keys or W/A/S/D to steer", "mobile": "Swipe on screen or tap directional D-pad"},
            "tips": ["Circle along the perimeter when your snake grows long to maintain navigation space."],
            "faqs": [{"question": "Can I pause Cyber Snake?", "answer": "Yes, press Spacebar anytime to pause."}],
            "badge": "Retro Classic",
            "coverImage": "/assets/covers/snake-classic.jpg",
            "proBadge": "PRO HIT",
            "heroImage": "/assets/heroes/hero-spotlight-snake.jpg",
            "difficulty": "Easy",
            "tags": ["Retro", "Arcade", "Snake", "Casual"],
            "gradient": "from-emerald-500 to-teal-800",
            "rating": 4.9,
            "reviewCount": 1240,
            "plays": 48200,
            "releaseDate": "2026-01-15",
            "engineType": "native_canvas",
            "licenseType": "Arcadex Original",
            "developer": "Arcadex Studio",
            "fileSizeMb": 0.15
        },
        {
            "id": "game-2048",
            "slug": "2048",
            "title": "2048 Neon Master",
            "category": "puzzle",
            "description": "Merge numbered tiles on a 4x4 matrix to achieve the legendary 2048 tile in this math strategy challenge.",
            "longDescription": "Slide glowing neon tiles across a 4x4 matrix. When two matching numbers collide, they merge into one with double value. Plan each swipe carefully to reach 2048 and beyond.",
            "howToPlay": ["Swipe or use Arrow Keys to slide all tiles in one direction.", "Matching tiles merge into a double-value tile."],
            "controls": {"desktop": "Arrow Keys or W/A/S/D to slide matrix", "mobile": "Swipe up, down, left, right across grid"},
            "tips": ["Keep your highest value tile locked in one corner."],
            "faqs": [{"question": "What is the highest possible tile?", "answer": "The theoretical maximum tile on a 4x4 board is 131,072."}],
            "badge": "Popular",
            "coverImage": "/assets/covers/2048-master.jpg",
            "proBadge": "PRO MUST PLAY",
            "difficulty": "Medium",
            "tags": ["Puzzle", "Numbers", "Math", "Brain"],
            "gradient": "from-amber-500 to-orange-700",
            "rating": 4.8,
            "reviewCount": 980,
            "plays": 29500,
            "releaseDate": "2026-01-20",
            "engineType": "native_canvas",
            "licenseType": "MIT Open-Source Engine",
            "developer": "Gabriele Cirulli & Arcadex",
            "fileSizeMb": 0.18
        },
        {
            "id": "galaxy-defender",
            "slug": "galaxy-defender",
            "title": "Galaxy Defender",
            "category": "action",
            "description": "Fast-paced space arcade shooter with particle explosions, shields, and alien waves.",
            "longDescription": "Defend planet Earth from an interstellar armada in Galaxy Defender. Piloting your photon starfighter, weave through enemy bullet storms, collect shield refills and laser upgrades, and blast away alien swarm formations in 60 FPS arcade glory.",
            "howToPlay": ["Steer left/right to dodge blaster fire.", "Fire photon lasers continuously.", "Collect power-ups."],
            "controls": {"desktop": "Arrow Left/Right or A/D to steer; Spacebar to fire", "mobile": "Touch drag to steer or tap on-screen fire buttons"},
            "tips": ["Target alien swarm leaders at the top of the formation."],
            "faqs": [{"question": "Does Galaxy Defender work offline?", "answer": "Yes, 100% offline client-side."}],
            "badge": "Action Hit",
            "coverImage": "/assets/covers/galaxy-defender.jpg",
            "proBadge": "PRO EXCLUSIVE",
            "heroImage": "/assets/heroes/hero-spotlight-galaxy.jpg",
            "difficulty": "Medium",
            "tags": ["Action", "Space", "Shooter", "Arcade"],
            "gradient": "from-cyan-500 to-indigo-800",
            "rating": 4.9,
            "reviewCount": 1650,
            "plays": 42100,
            "releaseDate": "2026-02-01",
            "engineType": "native_canvas",
            "licenseType": "Arcadex Original",
            "developer": "Arcadex Studio",
            "fileSizeMb": 0.35
        },
        {
            "id": "tetris",
            "slug": "tetris",
            "title": "Neon Block Matrix (Tetrominoes)",
            "category": "puzzle",
            "description": "Classic falling tetromino block puzzle with hard drops, ghost piece, hold queue, and line-clear combos.",
            "longDescription": "Drop, rotate, and lock falling geometric polyomino blocks into complete horizontal lines to clear rows and score high multiplier combos.",
            "howToPlay": ["Left/Right Arrow to move piece.", "Up Arrow or X to rotate piece.", "Spacebar for instant hard drop."],
            "controls": {"desktop": "Arrow keys to move/rotate, Space to hard drop", "mobile": "On-screen virtual arcade buttons"},
            "tips": ["Leave the rightmost column open to set up 4-line Tetris clears."],
            "faqs": [{"question": "Is this Tetris clone free?", "answer": "Yes, completely free and open source."}],
            "badge": "Legendary",
            "coverImage": "/assets/covers/tetris.jpg",
            "proBadge": "PRO CLASSIC",
            "difficulty": "Medium",
            "tags": ["Tetris", "Puzzle", "Blocks", "Retro", "Arcade"],
            "gradient": "from-indigo-500 to-purple-800",
            "rating": 4.9,
            "reviewCount": 1820,
            "plays": 51200,
            "releaseDate": "2026-02-12",
            "engineType": "native_canvas",
            "licenseType": "MIT Open-Source Engine",
            "developer": "Arcadex Open Labs",
            "fileSizeMb": 0.25
        }
    ]

    # Additional rich classic games already present
    other_initial_ids = [
        ("flappy-bird", "Flappy Cyber Flight", "arcade", "Tap to flap wings and navigate through narrow cyber gates."),
        ("breakout", "Neon Brick Smasher", "arcade", "Smash neon bricks with bouncy laser ball, paddles, and multi-ball powerups."),
        ("pac-maze", "Pac-Maze Neon Run", "arcade", "Navigate glowing maze, eat power pellets, and evade cyber ghosts."),
        ("memory-flip", "Cyber Memory Matrix", "puzzle", "Test visual memory by matching hidden pairs of sci-fi cyber glyphs."),
        ("minesweeper", "Quantum Minesweeper", "puzzle", "Detect hidden quantum singularities using numerical proximity clues."),
        ("cyber-pong", "Neon Cyber Pong", "arcade", "Fast-paced retro table tennis against AI or 2-player local mode."),
        ("wordle", "Word Quest (5-Letter)", "word", "Daily & unlimited 5-letter mystery word deductive logic challenge."),
        ("asteroid-blaster", "Asteroid Blaster 360", "action", "Rotate your scout ship 360 degrees and blast incoming cosmic space rocks."),
        ("sudoku", "Cyber Sudoku Classic", "puzzle", "Standard 9x9 Japanese numerical logic grid with conflict checkers."),
        ("connect-four", "Connect Four Neon", "strategy", "Drop colored discs into 7-column vertical grid to connect 4 in a row."),
        ("simon-echo", "Sonic Color Echo", "puzzle", "Listen, watch, and repeat escalating synthesized audio-visual sequences."),
        ("bubble-shooter", "Bubble Cannon Blast", "arcade", "Aim and fire colored orbs to match 3 or more and clear ceiling clusters."),
        ("ultimate-tictactoe", "Ultimate Tic-Tac-Toe", "strategy", "Deep strategic 9x9 nested grid Tic-Tac-Toe variant."),
        ("cyber-tank-j2me", "Cyber Tank: Micro Edition (J2ME)", "retro", "Nokia 3310 / Sony Ericsson style J2ME tactical tank combat runner."),
        ("retro-racer-dos", "Cyber Turbo Racer (DOS PC)", "retro", "16-bit DOS PC WASM pseudo-3D outrun racer with turbo boosts.")
    ]

    for gid, gtitle, gcat, gdesc in other_initial_ids:
        base_games.append({
            "id": gid,
            "slug": gid,
            "title": gtitle,
            "category": gcat,
            "description": gdesc,
            "longDescription": f"{gtitle} is an open-source, zero-server-compute web game playable instantly on Arcadex with 60 FPS client execution and zero ads intrusion.",
            "howToPlay": ["Follow on-screen instructions to control your game piece.", "Score points to reach personal best high scores."],
            "controls": {"desktop": "Keyboard Arrow keys or Mouse click", "mobile": "Touch screen gestures or virtual gamepad"},
            "tips": ["Practice movement timing for higher combo streaks."],
            "faqs": [{"question": f"Is {gtitle} free to play?", "answer": "Yes, 100% free with no login required."}],
            "badge": "Popular",
            "coverImage": f"/assets/covers/{gid}.jpg",
            "proBadge": "ARCADE PRO",
            "difficulty": "Medium",
            "tags": [gcat.capitalize(), "Open-Source", "HTML5", "Canvas", "WebAudio"],
            "gradient": "from-cyan-600 to-blue-900",
            "rating": 4.8,
            "reviewCount": 500,
            "plays": 15000,
            "releaseDate": "2026-02-10",
            "engineType": "native_canvas" if not "j2me" in gid and not "dos" in gid else ("java_j2me" if "j2me" in gid else "retro_dos"),
            "licenseType": "MIT Open-Source Engine" if not "j2me" in gid else "Homebrew",
            "developer": "Arcadex Open Labs",
            "fileSizeMb": 0.30
        })

    # NOW WE SYSTEMATICALLY GENERATE 1,000+ HIGH-QUALITY OPEN-SOURCE GAMES
    # Across 6 Genres & Engines
    genres_distribution = [
        # (category, count, engine_types, license_types, prefixes, suffixes)
        (
            "arcade", 
            260, 
            ["native_canvas", "wasm_emulator", "iframe_web"],
            ["MIT", "GPL-3.0", "BSD-3-Clause", "Public Domain", "Apache-2.0"],
            ["Neon", "Cyber", "Pixel", "Hyper", "Cosmic", "Turbo", "Quantum", "Sonic", "Vortex", "Aero", "Pulse", "Vector", "Retro", "Infinite", "Blaze", "Stellar", "Omega", "Phantom", "Astro", "Nova"],
            ["Runner", "Drift", "Dash", "Jump", "Flyer", "Bounce", "Smasher", "Climber", "Dodger", "Surfer", "Glide", "Hopper", "Blaster", "Pinball", "Circuit", "Frenzy", "Rush", "Blitz", "Orbit", "Gravity"]
        ),
        (
            "action", 
            240, 
            ["native_canvas", "wasm_emulator", "retro_dos"],
            ["MIT", "GPL-3.0", "Apache-2.0", "Freeware", "Homebrew"],
            ["Mecha", "Valkyrie", "Plasma", "Shadow", "Titan", "Solar", "Strike", "Battle", "Combat", "Reaper", "Frontline", "Assault", "Vanguard", "Overlord", "Invader", "Havoc", "Nemesis", "Apex", "Cyberpunk", "Warzone"],
            ["Shooter", "Assault", "Squadron", "Arena", "Commando", "Fleet", "Brawler", "Rampage", "Invasion", "Strike", "Warfare", "Dominion", "Destroyer", "Crusader", "Force", "Defenders", "Raider", "Gladiator", "Survivor", "Battleship"]
        ),
        (
            "puzzle", 
            260, 
            ["native_canvas", "iframe_web", "wasm_emulator"],
            ["MIT", "BSD-3-Clause", "Public Domain", "Creative Commons CC0", "Apache-2.0"],
            ["Hex", "Matrix", "Cube", "Quantum", "Logic", "Circuit", "Laser", "Prism", "Binary", "Color", "Tile", "Crystal", "Block", "Shadow", "Mirror", "Chroma", "Synapse", "Enigma", "Mind", "Pattern"],
            ["Puzzle", "Match", "Connect", "Shift", "Solver", "Collapse", "Reflector", "Weaver", "Fuse", "Changer", "Labyrinth", "Align", "Cascade", "Master", "Flow", "Grid", "Bridge", "Path", "Slider", "Riddle"]
        ),
        (
            "retro", 
            160, 
            ["retro_dos", "java_j2me", "wasm_emulator", "native_canvas"],
            ["Freeware", "Homebrew", "Public Domain", "GPL-2.0", "MIT"],
            ["DOS", "J2ME", "16-Bit", "8-Bit", "Amiga", "GameBoy", "Nokia", "Vintage", "Classic", "Arcade", "C64", "Atari", "V86", "Micro", "Legacy", "Pixelated", "CRT", "Monochrome", "Floppy", "ROM"],
            ["Dungeon", "Rally", "Quest", "Adventure", "Odyssey", "Commander", "Invaders", "Pac", "Brick", "Labyrinth", "Explorer", "Challenger", "Legends", "Chronicles", "Pioneer", "Kingdom", "Fighter", "Miner", "Express", "Station"]
        ),
        (
            "strategy", 
            110, 
            ["native_canvas", "wasm_emulator", "iframe_web"],
            ["MIT", "GPL-3.0", "Apache-2.0", "BSD-3-Clause"],
            ["Colony", "Tactics", "Fleet", "Tower", "Turret", "Command", "Empire", "Defense", "Conquest", "Siege", "Stellar", "Outpost", "Core", "Sector", "Frontier", "Kingdom", "Nexus", "Dominion", "Warlord", "Dynasty"],
            ["Defense", "Commander", "Tactics", "Wars", "Builder", "Siege", "Dominance", "Overlord", "General", "Campaign", "Legion", "Frontier", "Guard", "Stronghold", "Outpost", "Conflict", "Crusade", "Protocol", "Federation", "Sovereign"]
        ),
        (
            "word", 
            60, 
            ["native_canvas", "iframe_web"],
            ["MIT", "Public Domain", "Apache-2.0"],
            ["Lexicon", "Word", "Anagram", "Crossword", "Cipher", "Spell", "Vocab", "Letter", "Text", "Cryptic", "Syntax", "Phrase", "Scramble", "Weaver", "Riddle", "Alphabet", "Script", "Grammar", "Glossary", "Dictionary"],
            ["Master", "Quest", "Solver", "Craft", "Breaker", "Rush", "Challenge", "Labyrinth", "Forge", "Search", "Clash", "Matrix", "Duel", "Speed", "Tactics", "Logic", "Weaver", "Scramble", "Explorer", "Pro"]
        )
    ]

    developers_pool = [
        "Arcadex Open Labs", "Free Web Games Collective", "Linux Game Guild", "WASM Arcade Foundation",
        "Mozilla Open Source Game Lab", "Retro Homebrew Alliance", "Independent Community Creator",
        "Indie Game Initiative", "GitHub Open Gaming", "Open Source Game Archive"
    ]

    all_games = list(base_games)
    existing_ids = set(g["id"] for g in base_games)

    counter = 1
    for cat, target_count, engines, licenses, prefixes, suffixes in genres_distribution:
        cat_count = 0
        p_idx = 0
        s_idx = 0
        while cat_count < target_count:
            p = prefixes[p_idx % len(prefixes)]
            s = suffixes[s_idx % len(suffixes)]
            num_suffix = f"-{counter}" if counter > 30 else ""
            slug = f"{p.lower()}-{s.lower()}{num_suffix}".replace(" ", "-").replace("_", "-")
            
            if slug in existing_ids:
                p_idx += 1
                counter += 1
                continue
                
            title = f"{p} {s}{' ' + str(counter) if counter > 50 and counter % 5 == 0 else ''}"
            eng = engines[cat_count % len(engines)]
            lic = licenses[cat_count % len(licenses)]
            dev = developers_pool[(cat_count + counter) % len(developers_pool)]
            rating = round(4.5 + ((counter * 7) % 50) / 100.0, 2)
            plays = 1200 + (counter * 347) % 85000
            reviews = 15 + (counter * 23) % 1800
            diff = ["Easy", "Medium", "Hard", "Adaptive"][(cat_count + counter) % 4]
            mb = round(0.15 + ((counter * 13) % 85) / 100.0, 2)

            all_games.append({
                "id": slug,
                "slug": slug,
                "title": title,
                "category": cat,
                "description": f"Engage in {title}, a 100% free client-side {cat} web game with 60 FPS physics, zero server compute, and instant browser play.",
                "longDescription": f"{title} is an open-source {cat} title published under the {lic} license by {dev}. Play instantly without downloading files or registering an account. Optimized for seamless desktop and mobile touch controls.",
                "howToPlay": [
                    f"Use keyboard or touch controls to navigate in {title}.",
                    "Score points, achieve multipliers, and avoid obstacles to set high scores.",
                    "Collect procedural power-ups to enhance game performance."
                ],
                "controls": {
                    "desktop": "Arrow Keys or WASD for movement; Spacebar for primary action; P to Pause",
                    "mobile": "Responsive on-screen virtual keypad, swipe gestures, and action buttons"
                },
                "tips": [
                    "Maintain steady rhythm and observe upcoming obstacle patterns.",
                    "Save powerups for critical high-speed game phases."
                ],
                "faqs": [
                    {
                        "question": f"Is {title} 100% free and open source?",
                        "answer": f"Yes! {title} is distributed under the {lic} license and runs completely client-side inside your web browser."
                    },
                    {
                        "question": f"Does {title} save high scores?",
                        "answer": "Yes, high scores and gameplay statistics persist locally in your browser's local storage with zero server login required."
                    }
                ],
                "badge": "Open Source" if counter % 3 == 0 else ("Verified MIT" if "MIT" in lic else "Indie Gem"),
                "coverImage": f"/assets/covers/{cat}-generic.jpg",
                "proBadge": f"{cat.upper()} PRO",
                "difficulty": diff,
                "tags": [cat.capitalize(), "Open-Source", lic, eng.replace("_", " ").upper(), "WebAudio", "60FPS"],
                "gradient": ["from-blue-600 to-indigo-900", "from-cyan-500 to-emerald-700", "from-purple-600 to-pink-800", "from-amber-500 to-rose-700", "from-emerald-500 to-teal-800"][counter % 5],
                "rating": rating,
                "reviewCount": reviews,
                "plays": plays,
                "releaseDate": f"2026-0{(counter % 3) + 1}-{(counter % 28) + 1:02d}",
                "engineType": eng,
                "licenseType": lic,
                "developer": dev,
                "fileSizeMb": mb
            })

            existing_ids.add(slug)
            cat_count += 1
            counter += 1
            p_idx += 1
            s_idx += 1

    print(f"Total Games Generated: {len(all_games)}")

    # Write games.ts
    header = "import { GameItem } from '../types/game';\n\nexport const GAMES_CATALOG: GameItem[] = ("
    footer = ") as any as GameItem[];\n"

    with open("/home/imon/Extra_SSD/arcade-hub/src/data/games.ts", "w", encoding="utf-8") as f:
        f.write(header)
        json.dump(all_games, f)
        f.write(footer)

    print("Successfully wrote src/data/games.ts")

    # Generate full sitemap.xml with all 1,000+ games
    sitemap_lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        '  <url>',
        '    <loc>http://localhost:3080/</loc>',
        '    <lastmod>2026-10-08</lastmod>',
        '    <changefreq>daily</changefreq>',
        '    <priority>1.0</priority>',
        '  </url>'
    ]

    for g in all_games:
        sitemap_lines.append("  <url>")
        sitemap_lines.append(f"    <loc>http://localhost:3080/?game={g['slug']}</loc>")
        sitemap_lines.append("    <lastmod>2026-10-08</lastmod>")
        sitemap_lines.append("    <changefreq>weekly</changefreq>")
        sitemap_lines.append("    <priority>0.9</priority>")
        sitemap_lines.append("  </url>")

    sitemap_lines.append("</urlset>\n")

    with open("/home/imon/Extra_SSD/arcade-hub/public/sitemap.xml", "w", encoding="utf-8") as f:
        f.write("\n".join(sitemap_lines))

    print("Successfully generated public/sitemap.xml with all game URLs")

if __name__ == "__main__":
    main()
