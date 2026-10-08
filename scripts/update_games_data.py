import re

GAMES_FILE = "/home/imon/Extra_SSD/arcade-hub/src/data/games.ts"

with open(GAMES_FILE, "r", encoding="utf-8") as f:
    content = f.read()

cover_map = {
    'snake': ('/assets/covers/snake-retro.jpg', '/assets/heroes/hero-spotlight-retro.jpg', 'PS CLASSIC'),
    'game-2048': ('/assets/covers/2048-master.jpg', None, 'PS MUST PLAY'),
    'galaxy-defender': ('/assets/covers/galaxy-defender.jpg', '/assets/heroes/hero-spotlight-galaxy.jpg', 'PS EXCLUSIVE'),
    'word-quest': ('/assets/covers/word-quest.jpg', '/assets/heroes/hero-spotlight-word.jpg', 'PS DAILY'),
    'asteroid-blaster': ('/assets/covers/asteroid-blaster.jpg', '/assets/heroes/hero-spotlight-asteroid.jpg', 'PS ACTION'),
    'flappy-bird': ('/assets/covers/flappy-bird.jpg', None, 'PS ARCADE'),
    'breakout': ('/assets/covers/neon-breakout.jpg', None, 'PS RETRO'),
    'tetris': ('/assets/covers/tetra-block.jpg', None, 'PS LEGEND'),
    'pac-maze': ('/assets/covers/pac-runner.jpg', None, 'PS MASTER'),
    'memory-matrix': ('/assets/covers/memory-match.jpg', None, 'PS BRAIN'),
    'minesweeper': ('/assets/covers/minesweeper.jpg', None, 'PS TACTICAL'),
    'cyber-pong': ('/assets/covers/cyber-pong.jpg', None, 'PS 2-PLAYER'),
    'sudoku': ('/assets/covers/sudoku-master.jpg', None, 'PS LOGIC'),
    'connect-four': ('/assets/covers/connect-four.jpg', None, 'PS STRATEGY'),
    'simon-echo': ('/assets/covers/simon-echo.jpg', None, 'PS AUDIO'),
    'bubble-shooter': ('/assets/covers/bubble-shooter.jpg', None, 'PS HIT'),
    'ultimate-tictactoe': ('/assets/covers/ultimate-tictactoe.jpg', None, 'PS STRATEGY'),
}

for gid, (cover, hero, ps_badge) in cover_map.items():
    # Find the block for this id
    pattern = rf"(id:\s*'{gid}',[\s\S]*?)(badge:\s*'[A-Za-z0-9\s]+',)"
    def repl(m):
        res = m.group(1) + m.group(2) + f"\n    coverImage: '{cover}',\n    playStationBadge: '{ps_badge}',"
        if hero:
            res += f"\n    heroImage: '{hero}',"
        return res
    content = re.sub(pattern, repl, content, count=1)

with open(GAMES_FILE, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated games.ts with covers & PlayStation metadata!")
