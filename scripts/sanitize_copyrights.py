import os
import re

BASE_DIR = "/home/imon/Extra_SSD/arcade-hub"

# 1. Update data/games.ts
games_path = os.path.join(BASE_DIR, "src/data/games.ts")
with open(games_path, "r", encoding="utf-8") as f:
    games_code = f.read()

# Replace PlayStation badges with PRO badges
games_code = games_code.replace("playStationBadge", "proBadge")
games_code = re.sub(r"proBadge:\s*'PS\s+([^']+)'", r"proBadge: 'PRO \1'", games_code)

# Replace trademark mentions in descriptions, tags, and titles
games_code = games_code.replace("'Tetris'", "'Block Puzzle'")
games_code = games_code.replace("Tetris line-clears", "4-line clears")
games_code = games_code.replace("Tetris clears", "quadruple clears")
games_code = games_code.replace("Tetris", "Tetra Block")

games_code = games_code.replace("'Pacman'", "'Maze Runner'")
games_code = games_code.replace("'Pac-Man'", "'Maze Runner'")

games_code = games_code.replace("'Wordle'", "'Word Quest'")
games_code = games_code.replace("Wordle-style", "word puzzle")

games_code = games_code.replace("Connect 4 Cyber", "Grid 4 Cyber")
games_code = games_code.replace("Connect 4", "Grid Four")

games_code = games_code.replace("Simon Cyber Echo", "Sonic Color Echo")
games_code = games_code.replace("Simon game", "memory audio game")
games_code = games_code.replace("Simon", "Sonic")

with open(games_path, "w", encoding="utf-8") as f:
    f.write(games_code)
print("Sanitized data/games.ts successfully!")

# 2. Update components/GameCard.tsx
card_path = os.path.join(BASE_DIR, "src/components/GameCard.tsx")
with open(card_path, "r", encoding="utf-8") as f:
    card_code = f.read()
card_code = card_code.replace("playStationBadge", "proBadge")
card_code = card_code.replace("PlayStation-Grade", "Cinematic-Grade")
with open(card_path, "w", encoding="utf-8") as f:
    f.write(card_code)
print("Sanitized GameCard.tsx successfully!")

# 3. Update components/GamerActivityFeed.tsx
feed_path = os.path.join(BASE_DIR, "src/components/GamerActivityFeed.tsx")
with open(feed_path, "r", encoding="utf-8") as f:
    feed_code = f.read()
feed_code = feed_code.replace("'Connect 4'", "'Grid 4 Cyber'")
with open(feed_path, "w", encoding="utf-8") as f:
    f.write(feed_code)
print("Sanitized GamerActivityFeed.tsx successfully!")

# 4. Update App.tsx
app_path = os.path.join(BASE_DIR, "src/App.tsx")
with open(app_path, "r", encoding="utf-8") as f:
    app_code = f.read()
app_code = app_code.replace("PlayStationHeroCarousel", "CinematicHeroCarousel")
app_code = app_code.replace("PlayStation", "Cinematic Pro")
with open(app_path, "w", encoding="utf-8") as f:
    f.write(app_code)
print("Sanitized App.tsx successfully!")
