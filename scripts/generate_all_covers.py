import os
import math
import random
from PIL import Image, ImageDraw, ImageFont, ImageFilter

OUTPUT_DIR = "/home/imon/Extra_SSD/arcade-hub/public/assets/covers"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def create_badge(draw, text, x, y, bg_color, text_color=(255,255,255)):
    padding_x = 12
    w = len(text) * 7 + padding_x * 2
    h = 22
    draw.rounded_rectangle([x, y, x + w, y + h], radius=11, fill=bg_color)
    draw.text((x + padding_x, y + 4), text, fill=text_color)

def generate_base_art(path, title, subtitle, badge, badge_color, bg_colors, render_shapes_fn):
    img = Image.new("RGB", (640, 360), bg_colors[0])
    draw = ImageDraw.Draw(img)
    
    # Background gradient
    for y in range(360):
        t = y / 360.0
        r = int(bg_colors[0][0] * (1-t) + bg_colors[1][0] * t)
        g = int(bg_colors[0][1] * (1-t) + bg_colors[1][1] * t)
        b = int(bg_colors[0][2] * (1-t) + bg_colors[1][2] * t)
        draw.line([(0, y), (640, y)], fill=(r, g, b))
        
    # Call custom shape rendering
    render_shapes_fn(draw, img)
    
    # Bottom dark gradient bar for text
    overlay = Image.new("RGBA", (640, 360), (0,0,0,0))
    odraw = ImageDraw.Draw(overlay)
    for y in range(230, 360):
        a = int(230 * ((y - 230) / 130))
        odraw.line([(0, y), (640, y)], fill=(15, 23, 42, a))
    img.paste(Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB"))
    
    draw = ImageDraw.Draw(img)
    create_badge(draw, badge, 20, 20, badge_color)
    create_badge(draw, "★ 4.9 RATING", 490, 20, (234, 179, 8), (0,0,0))
    draw.text((24, 292), title, fill=(255, 255, 255))
    draw.text((24, 322), subtitle, fill=(148, 163, 184))
    
    img.save(path, quality=95)

# 1. Mecha Blaster 2
def draw_mecha(draw, img):
    # Giant Mech Tank in Sandstorm
    draw.rectangle([220, 160, 420, 260], fill=(71, 85, 105))
    draw.rectangle([260, 120, 380, 180], fill=(51, 65, 85))
    draw.line([320, 140, 450, 100], fill=(225, 29, 72), width=12) # Laser Cannon
    draw.ellipse([440, 90, 470, 120], fill=(244, 63, 94)) # Muzzle blast
    for _ in range(40):
        px = random.randint(100, 540)
        py = random.randint(80, 280)
        draw.rectangle([px, py, px+3, py+3], fill=(251, 191, 36))

generate_base_art(
    f"{OUTPUT_DIR}/mecha-blaster.jpg",
    "MECHA BLASTER 2: CYBER ASSAULT",
    "Symbian Legend • 6 Mega Bosses • Armory Weapons",
    "🚀 TOP MECH SHOOTER",
    (225, 29, 72),
    [(15, 23, 42), (88, 28, 135)],
    draw_mecha
)

# 2. Hextris
def draw_hextris(draw, img):
    cx, cy = 320, 170
    colors = [(239, 68, 68), (59, 130, 246), (234, 179, 8), (34, 197, 94)]
    for r in range(120, 30, -25):
        col = colors[(r//25)%4]
        pts = []
        for i in range(6):
            ang = i * math.pi / 3
            pts.append((cx + math.cos(ang)*r, cy + math.sin(ang)*r))
        draw.polygon(pts, outline=col, width=6)

generate_base_art(
    f"{OUTPUT_DIR}/hextris.jpg",
    "HEXTRIS: CYBER HEXAGON PUZZLE",
    "Dynamic Color Matching • 6-Sided Reflexes",
    "🔷 3D HEXAGON PUZZLE",
    (59, 130, 246),
    [(15, 23, 42), (30, 27, 75)],
    draw_hextris
)

# 3. Cyber Stack
def draw_stack(draw, img):
    for i in range(7):
        w = 260 - i * 25
        h = 24
        x = 320 - w // 2 + (i%2 * 10)
        y = 260 - i * 26
        col = (int(56 + i*25), int(189 - i*15), int(248 - i*10))
        draw.rectangle([x, y, x + w, y + h], fill=col)

generate_base_art(
    f"{OUTPUT_DIR}/cyber-stack.jpg",
    "CYBER 3D TOWER STACK",
    "Precision Slice Timing • Minimalist 3D Isometric",
    "🏗️ 3D TOWER STACK",
    (14, 165, 233),
    [(15, 23, 42), (2, 44, 34)],
    draw_stack
)

# 4. Cyber Dino Runner
def draw_dino(draw, img):
    # Dino Silhouette
    draw.rectangle([160, 180, 210, 250], fill=(34, 197, 94))
    draw.rectangle([190, 150, 230, 190], fill=(34, 197, 94))
    draw.ellipse([215, 160, 222, 167], fill=(255, 255, 255))
    # Cactus
    draw.rectangle([380, 190, 400, 270], fill=(234, 179, 8))
    draw.rectangle([365, 210, 380, 240], fill=(234, 179, 8))
    draw.rectangle([400, 220, 415, 250], fill=(234, 179, 8))
    draw.rectangle([0, 270, 640, 274], fill=(34, 197, 94))

generate_base_art(
    f"{OUTPUT_DIR}/cyber-dino.jpg",
    "CYBER CHROME DINO RUNNER",
    "Endless Pixel Cactus Jump • Retro Arcade",
    "🦖 RETRO RUNNER",
    (34, 197, 94),
    [(15, 23, 42), (20, 83, 45)],
    draw_dino
)

# 5. Solitaire Pro
def draw_solitaire(draw, img):
    for i in range(4):
        x = 180 + i * 80
        y = 120 + i * 15
        draw.rounded_rectangle([x, y, x + 65, y + 95], radius=6, fill=(255, 255, 255))
        draw.text((x + 8, y + 8), "A" if i%2==0 else "K", fill=(225, 29, 72) if i%2==0 else (15, 23, 42))

generate_base_art(
    f"{OUTPUT_DIR}/solitaire-pro.jpg",
    "KLONDIKE SOLITAIRE PRO",
    "Classic Casino Cards • Vegas Rules • 60 FPS",
    "🃏 CASINO CARDS",
    (168, 85, 247),
    [(15, 23, 42), (49, 46, 129)],
    draw_solitaire
)

# 6. Cyber Chess
def draw_chess(draw, img):
    for row in range(4):
        for col in range(4):
            x = 200 + col * 60
            y = 100 + row * 40
            c = (255, 255, 255) if (row+col)%2==0 else (51, 65, 85)
            draw.rectangle([x, y, x+60, y+40], fill=c)
    draw.ellipse([290, 130, 350, 190], fill=(59, 130, 246))

generate_base_art(
    f"{OUTPUT_DIR}/cyber-chess.jpg",
    "CYBER CHESS TACTICS",
    "Stockfish Level Grandmaster AI • 2-Player Duel",
    "♟️ TACTICAL STRATEGY",
    (99, 102, 241),
    [(15, 23, 42), (30, 27, 75)],
    draw_chess
)

print("Generated all updated rich game covers!")
