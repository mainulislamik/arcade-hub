import os
import math
import random
from PIL import Image, ImageDraw, ImageFilter, ImageFont

COVERS_DIR = "/home/imon/Extra_SSD/arcade-hub/public/assets/covers"
HEROES_DIR = "/home/imon/Extra_SSD/arcade-hub/public/assets/heroes"

os.makedirs(COVERS_DIR, exist_ok=True)
os.makedirs(HEROES_DIR, exist_ok=True)

def get_font(size=24, bold=False):
    font_paths = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
        "/usr/share/fonts/truetype/ubuntu/Ubuntu-B.ttf" if bold else "/usr/share/fonts/truetype/ubuntu/Ubuntu-R.ttf",
    ]
    for p in font_paths:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                pass
    return ImageFont.load_default()

def draw_stars(draw, width, height, count=120, max_r=2.5):
    for _ in range(count):
        x = random.randint(0, width)
        y = random.randint(0, height)
        r = random.uniform(0.8, max_r)
        alpha = random.randint(120, 255)
        color = (255, 255, 255, alpha) if random.random() > 0.3 else (180, 230, 255, alpha)
        draw.ellipse([x - r, y - r, x + r, y + r], fill=color)

def draw_banner_badge(draw, text, x, y, bg_color=(99, 102, 241, 230), text_color=(255, 255, 255)):
    font = get_font(14, bold=True)
    bbox = draw.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    px, py = 10, 5
    draw.rounded_rectangle([x, y, x + tw + px * 2, y + th + py * 2], radius=6, fill=bg_color)
    draw.text((x + px, y + py), text, fill=text_color, font=font)

def create_base_canvas(width, height, bg_top=(15, 23, 42), bg_bottom=(2, 6, 23)):
    img = Image.new("RGBA", (width, height), (0, 0, 0, 255))
    draw = ImageDraw.Draw(img)
    for y in range(height):
        factor = y / height
        r = int(bg_top[0] * (1 - factor) + bg_bottom[0] * factor)
        g = int(bg_top[1] * (1 - factor) + bg_bottom[1] * factor)
        b = int(bg_top[2] * (1 - factor) + bg_bottom[2] * factor)
        draw.line([(0, y), (width, y)], fill=(r, g, b, 255))
    return img

def render_final_cover(img, title, category, rating="4.9 ★", badge="POPULAR", tag_color=(99, 102, 241)):
    W, H = img.size
    grad_overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    grad_draw = ImageDraw.Draw(grad_overlay)
    
    for y in range(int(H * 0.42), H):
        factor = (y - H * 0.42) / (H * 0.58)
        alpha = int(245 * (factor ** 1.3))
        grad_draw.line([(0, y), (W, y)], fill=(10, 15, 30, alpha))
        
    img.paste(grad_overlay, (0, 0), grad_overlay)
    draw = ImageDraw.Draw(img)
    
    draw_banner_badge(draw, badge, 28, 28, bg_color=(tag_color[0], tag_color[1], tag_color[2], 240), text_color=(255, 255, 255))
    
    rating_font = get_font(15, bold=True)
    draw.rounded_rectangle([W - 95, 28, W - 28, 58], radius=6, fill=(15, 23, 42, 220), outline=(255, 255, 255, 40))
    draw.text((W - 86, 33), rating, fill=(251, 191, 36), font=rating_font)
    
    cat_font = get_font(15, bold=True)
    title_font = get_font(30, bold=True)
    meta_font = get_font(14, bold=False)
    
    draw.text((30, H - 145), category.upper(), fill=(tag_color[0], tag_color[1], tag_color[2]), font=cat_font)
    draw.text((30, H - 118), title, fill=(255, 255, 255), font=title_font)
    
    draw.line([(30, H - 65), (W - 30, H - 65)], fill=(255, 255, 255, 40), width=1)
    draw.text((30, H - 50), "INSTANT PLAY • ZERO LAG • 60 FPS", fill=(148, 163, 184), font=meta_font)
    
    draw.rounded_rectangle([0, 0, W-1, H-1], radius=16, outline=(255, 255, 255, 50), width=2)
    return img

# --- Specific Game Art Renderers ---

def generate_galaxy_defender():
    img = create_base_canvas(600, 800, (10, 15, 45), (2, 4, 15))
    draw = ImageDraw.Draw(img)
    draw_stars(draw, 600, 800, 180, 3)
    
    # Nebula glow
    cx, cy = 300, 320
    for r in range(160, 20, -10):
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(59, 130, 246, int(15 * (1 - r/160))))
        draw.ellipse([cx - r*0.7, cy - r*0.7, cx + r*0.7, cy + r*0.7], fill=(168, 85, 247, int(25 * (1 - r/160))))
        
    # Spaceship
    ship_points = [(300, 240), (240, 360), (280, 345), (300, 360), (320, 345), (360, 360)]
    draw.polygon(ship_points, fill=(224, 242, 254), outline=(56, 189, 248))
    # Thruster flame
    flame_points = [(285, 355), (300, 410), (315, 355)]
    draw.polygon(flame_points, fill=(249, 115, 22))
    # Lasers
    draw.line([(260, 260), (260, 140)], fill=(56, 189, 248), width=3)
    draw.line([(340, 260), (340, 140)], fill=(56, 189, 248), width=3)
    
    return render_final_cover(img, "Galaxy Defender", "Action Space Shooter", "4.9 ★", "HOT", (56, 189, 248))

def generate_asteroid_blaster():
    img = create_base_canvas(600, 800, (40, 20, 10), (10, 5, 2))
    draw = ImageDraw.Draw(img)
    draw_stars(draw, 600, 800, 150)
    
    # Sun / Nova background
    cx, cy = 450, 200
    for r in range(180, 30, -15):
        draw.ellipse([cx-r, cy-r, cx+r, cy+r], fill=(249, 115, 22, int(20 * (1 - r/180))))
    draw.ellipse([cx-40, cy-40, cx+40, cy+40], fill=(254, 215, 170))
    
    # Asteroids
    ast1 = [(180, 220), (240, 200), (270, 250), (230, 310), (170, 280)]
    draw.polygon(ast1, fill=(120, 113, 108), outline=(214, 211, 209))
    
    ast2 = [(320, 320), (370, 300), (410, 340), (380, 390), (330, 370)]
    draw.polygon(ast2, fill=(87, 83, 78), outline=(168, 162, 158))
    
    # Battle Ship vector
    ship = [(220, 380), (180, 440), (220, 425), (260, 440)]
    draw.polygon(ship, fill=(255, 255, 255), outline=(239, 68, 68))
    # Red laser blast
    draw.line([(220, 380), (240, 260)], fill=(239, 68, 68), width=4)
    
    return render_final_cover(img, "Asteroid Blaster", "Vector Space Arcade", "4.8 ★", "RETRO", (249, 115, 22))

def generate_snake_retro():
    img = create_base_canvas(600, 800, (6, 78, 59), (2, 20, 15))
    draw = ImageDraw.Draw(img)
    
    # Grid
    for x in range(0, 600, 30):
        draw.line([(x, 0), (x, 800)], fill=(16, 185, 129, 25), width=1)
    for y in range(0, 800, 30):
        draw.line([(0, y), (600, y)], fill=(16, 185, 129, 25), width=1)
        
    # Glowing Cyber Snake Body
    snake_nodes = [(180, 380), (210, 380), (240, 380), (270, 380), (270, 350), (270, 320), (300, 320), (330, 320), (360, 320), (360, 290)]
    for nx, ny in snake_nodes[:-1]:
        draw.rounded_rectangle([nx-12, ny-12, nx+12, ny+12], radius=4, fill=(52, 211, 153), outline=(16, 185, 129))
    # Snake Head
    hx, hy = snake_nodes[-1]
    draw.rounded_rectangle([hx-14, hy-14, hx+14, hy+14], radius=6, fill=(110, 231, 183), outline=(255, 255, 255))
    # Snake Eyes
    draw.ellipse([hx-6, hy-8, hx-2, hy-4], fill=(15, 23, 42))
    draw.ellipse([hx+2, hy-8, hx+6, hy-4], fill=(15, 23, 42))
    
    # Glowing Apple Energy Core
    ax, ay = 360, 230
    for g in range(30, 0, -5):
        draw.ellipse([ax-g, ay-g, ax+g, ay+g], fill=(239, 68, 68, int(30 * (1 - g/30))))
    draw.ellipse([ax-12, ay-12, ax+12, ay+12], fill=(239, 68, 68), outline=(254, 202, 202))
    
    return render_final_cover(img, "Retro Snake 2.0", "Cyber Arcade", "4.9 ★", "FEATURED", (52, 211, 153))

def generate_word_quest():
    img = create_base_canvas(600, 800, (49, 46, 129), (15, 23, 42))
    draw = ImageDraw.Draw(img)
    draw_stars(draw, 600, 800, 100)
    
    # 5 Big Wordle Letter Tiles
    letters = [("C", (16, 185, 129)), ("Y", (234, 179, 8)), ("B", (71, 85, 105)), ("E", (16, 185, 129)), ("R", (16, 185, 129))]
    tile_w, tile_h = 75, 85
    start_x = (600 - (5 * tile_w + 4 * 12)) // 2
    y_pos = 280
    
    tile_font = get_font(38, bold=True)
    for i, (char, color) in enumerate(letters):
        tx = start_x + i * (tile_w + 12)
        # Glow
        for g in range(15, 0, -3):
            draw.rounded_rectangle([tx-g, y_pos-g, tx+tile_w+g, y_pos+tile_h+g], radius=8, fill=(color[0], color[1], color[2], int(25 * (1 - g/15))))
        draw.rounded_rectangle([tx, y_pos, tx+tile_w, y_pos+tile_h], radius=8, fill=color, outline=(255, 255, 255, 180), width=2)
        bbox = draw.textbbox((0, 0), char, font=tile_font)
        cw, ch = bbox[2] - bbox[0], bbox[3] - bbox[1]
        draw.text((tx + (tile_w - cw)/2, y_pos + (tile_h - ch)/2 - 3), char, fill=(255, 255, 255), font=tile_font)
        
    return render_final_cover(img, "Word Quest", "Word Strategy Puzzle", "4.9 ★", "TRENDING", (129, 140, 248))

def generate_sudoku_master():
    img = create_base_canvas(600, 800, (30, 58, 138), (15, 23, 42))
    draw = ImageDraw.Draw(img)
    
    # Glowing Sudoku 3x3 Mini Matrix
    grid_size = 240
    gx, gy = 180, 210
    draw.rounded_rectangle([gx, gy, gx+grid_size, gy+grid_size], radius=12, fill=(15, 23, 42, 200), outline=(59, 130, 246), width=3)
    
    # Internal lines
    step = grid_size // 3
    for i in range(1, 3):
        draw.line([(gx + i * step, gy), (gx + i * step, gy + grid_size)], fill=(59, 130, 246, 180), width=2)
        draw.line([(gx, gy + i * step), (gx + grid_size, gy + i * step)], fill=(59, 130, 246, 180), width=2)
        
    num_font = get_font(32, bold=True)
    grid_nums = [["9", "", "3"], ["", "7", ""], ["2", "", "8"]]
    for r in range(3):
        for c in range(3):
            val = grid_nums[r][c]
            if val:
                draw.text((gx + c * step + 28, gy + r * step + 20), val, fill=(96, 165, 250), font=num_font)
                
    return render_final_cover(img, "Sudoku Master", "Logic & Brain Trainer", "4.8 ★", "DAILY", (96, 165, 250))

def generate_2048_master():
    img = create_base_canvas(600, 800, (88, 28, 135), (24, 9, 44))
    draw = ImageDraw.Draw(img)
    draw_stars(draw, 600, 800, 100)
    
    # 2048 Master Tile
    cx, cy = 300, 310
    size = 180
    for g in range(40, 0, -5):
        draw.rounded_rectangle([cx-size/2-g, cy-size/2-g, cx+size/2+g, cy+size/2+g], radius=16, fill=(234, 179, 8, int(35 * (1 - g/40))))
    draw.rounded_rectangle([cx-size/2, cy-size/2, cx+size/2, cy+size/2], radius=16, fill=(234, 179, 8), outline=(255, 255, 255), width=3)
    
    t_font = get_font(52, bold=True)
    bbox = draw.textbbox((0, 0), "2048", font=t_font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    draw.text((cx - tw/2, cy - th/2 - 6), "2048", fill=(255, 255, 255), font=t_font)
    
    return render_final_cover(img, "2048 Master", "Number Merge Puzzle", "4.9 ★", "HOT", (234, 179, 8))

def generate_pac_runner():
    img = create_base_canvas(600, 800, (30, 27, 75), (5, 5, 20))
    draw = ImageDraw.Draw(img)
    
    # Neon Maze corridors
    maze_lines = [
        [(80, 200), (520, 200)], [(80, 200), (80, 420)], [(520, 200), (520, 420)],
        [(160, 280), (440, 280)], [(160, 280), (160, 360)], [(440, 280), (440, 360)]
    ]
    for p1, p2 in maze_lines:
        draw.line([p1, p2], fill=(59, 130, 246, 200), width=4)
        
    # Pacman character
    draw.pieslice([180, 320, 260, 400], start=35, end=325, fill=(250, 204, 21), outline=(254, 240, 138), width=2)
    # Ghost
    gx, gy = 360, 320
    draw.ellipse([gx, gy, gx+60, gy+50], fill=(239, 68, 68))
    draw.rectangle([gx, gy+25, gx+60, gy+60], fill=(239, 68, 68))
    # Ghost eyes
    draw.ellipse([gx+10, gy+15, gx+24, gy+32], fill=(255, 255, 255))
    draw.ellipse([gx+36, gy+15, gx+50, gy+32], fill=(255, 255, 255))
    draw.ellipse([gx+12, gy+20, gx+20, gy+28], fill=(30, 58, 138))
    draw.ellipse([gx+38, gy+20, gx+46, gy+28], fill=(30, 58, 138))
    
    return render_final_cover(img, "Cyber Pac Runner", "Retro Maze Runner", "4.8 ★", "CLASSIC", (250, 204, 21))

def generate_bubble_shooter():
    img = create_base_canvas(600, 800, (83, 23, 100), (15, 23, 42))
    draw = ImageDraw.Draw(img)
    draw_stars(draw, 600, 800, 100)
    
    # Clustered colorful bubbles
    bubbles = [
        (220, 220, (239, 68, 68)), (280, 220, (59, 130, 246)), (340, 220, (16, 185, 129)), (400, 220, (234, 179, 8)),
        (250, 270, (168, 85, 247)), (310, 270, (239, 68, 68)), (370, 270, (59, 130, 246)),
        (280, 320, (16, 185, 129)), (340, 320, (234, 179, 8))
    ]
    for bx, by, color in bubbles:
        draw.ellipse([bx-25, by-25, bx+25, by+25], fill=color, outline=(255, 255, 255, 180), width=2)
        draw.ellipse([bx-15, by-15, bx-5, by-5], fill=(255, 255, 255, 180))
        
    # Shooting Arrow Cannon
    draw.line([(300, 480), (300, 370)], fill=(244, 114, 182), width=4)
    draw.ellipse([300-24, 370-24, 300+24, 370+24], fill=(244, 114, 182), outline=(255, 255, 255), width=2)
    
    return render_final_cover(img, "Neon Bubble Shooter", "Match & Physics Arcade", "4.8 ★", "NEW", (244, 114, 182))

def generate_tetra_block():
    img = create_base_canvas(600, 800, (20, 30, 70), (5, 10, 25))
    draw = ImageDraw.Draw(img)
    
    # Tetris blocks
    def draw_tetromino(x, y, shape, color):
        s = 32
        for r, row in enumerate(shape):
            for c, val in enumerate(row):
                if val:
                    bx = x + c * s
                    by = y + r * s
                    draw.rounded_rectangle([bx, by, bx+s-2, by+s-2], radius=4, fill=color, outline=(255, 255, 255, 180), width=2)
                    
    # T piece
    draw_tetromino(240, 200, [[1, 1, 1], [0, 1, 0]], (168, 85, 247))
    # L piece
    draw_tetromino(180, 280, [[1, 0], [1, 0], [1, 1]], (249, 115, 22))
    # Line piece
    draw_tetromino(340, 260, [[1], [1], [1], [1]], (56, 189, 248))
    # Square piece
    draw_tetromino(260, 350, [[1, 1], [1, 1]], (234, 179, 8))
    
    return render_final_cover(img, "Tetra Block", "Tile-Matching Classic", "4.9 ★", "LEGEND", (168, 85, 247))

def generate_flappy_bird():
    img = create_base_canvas(600, 800, (12, 74, 110), (3, 105, 161))
    draw = ImageDraw.Draw(img)
    
    # Synthwave Sun
    cx, cy = 300, 260
    draw.ellipse([cx-90, cy-90, cx+90, cy+90], fill=(251, 146, 60))
    for i in range(5):
        y = cy + i * 15
        draw.line([(cx-90, y), (cx+90, y)], fill=(12, 74, 110), width=3)
        
    # Laser Pylons
    draw.rectangle([100, 160, 160, 270], fill=(16, 185, 129), outline=(110, 231, 183), width=2)
    draw.rectangle([100, 360, 160, 480], fill=(16, 185, 129), outline=(110, 231, 183), width=2)
    
    # Cyber Bird
    bx, by = 260, 320
    draw.ellipse([bx-24, by-18, bx+24, by+18], fill=(250, 204, 21), outline=(255, 255, 255), width=2)
    draw.polygon([(bx+15, by-4), (bx+32, by), (bx+15, by+6)], fill=(249, 115, 22))
    draw.ellipse([bx+6, by-10, bx+14, by-2], fill=(15, 23, 42))
    
    return render_final_cover(img, "Flappy Cyber Bird", "Precision Flight Action", "4.7 ★", "POPULAR", (250, 204, 21))

def generate_neon_breakout():
    img = create_base_canvas(600, 800, (88, 28, 135), (15, 23, 42))
    draw = ImageDraw.Draw(img)
    
    # Glowing Bricks
    colors = [(239, 68, 68), (249, 115, 22), (234, 179, 8), (16, 185, 129), (59, 130, 246)]
    for r, col in enumerate(colors):
        for c in range(6):
            bx = 80 + c * 75
            by = 180 + r * 28
            draw.rounded_rectangle([bx, by, bx+65, by+20], radius=4, fill=col, outline=(255, 255, 255, 120), width=1)
            
    # Glowing Ball & Laser Trail
    draw.line([(240, 420), (320, 340)], fill=(255, 255, 255, 150), width=2)
    draw.ellipse([320-14, 340-14, 320+14, 340+14], fill=(255, 255, 255), outline=(234, 179, 8), width=3)
    
    # Paddle
    draw.rounded_rectangle([200, 440, 340, 456], radius=6, fill=(56, 189, 248), outline=(255, 255, 255), width=2)
    
    return render_final_cover(img, "Cyber Breakout", "Neon Brick Breaker", "4.8 ★", "CLASSIC", (56, 189, 248))

def generate_connect_four():
    img = create_base_canvas(600, 800, (30, 41, 59), (15, 23, 42))
    draw = ImageDraw.Draw(img)
    
    # Blue Grid Frame
    draw.rounded_rectangle([120, 200, 480, 440], radius=16, fill=(37, 99, 235), outline=(96, 165, 250), width=3)
    
    # Holes & Discs
    for r in range(4):
        for c in range(5):
            cx = 160 + c * 68
            cy = 235 + r * 54
            fill_col = (15, 23, 42)
            if (r, c) in [(3, 1), (3, 2), (2, 2), (1, 2)]:
                fill_col = (239, 68, 68) # Red
            elif (r, c) in [(3, 3), (2, 3), (3, 4)]:
                fill_col = (234, 179, 8) # Yellow
            draw.ellipse([cx-20, cy-20, cx+20, cy+20], fill=fill_col, outline=(255, 255, 255, 80), width=2)
            
    return render_final_cover(img, "Connect Four AI", "Grid Strategy Duel", "4.8 ★", "2-PLAYER", (37, 99, 235))

def generate_ultimate_tictactoe():
    img = create_base_canvas(600, 800, (67, 56, 202), (15, 23, 42))
    draw = ImageDraw.Draw(img)
    
    # 3x3 Outer Big Grid
    draw.line([(240, 180), (240, 440)], fill=(129, 140, 248), width=4)
    draw.line([(360, 180), (360, 440)], fill=(129, 140, 248), width=4)
    draw.line([(140, 260), (460, 260)], fill=(129, 140, 248), width=4)
    draw.line([(140, 350), (460, 350)], fill=(129, 140, 248), width=4)
    
    # Glowing X and O
    draw.line([(160, 200), (220, 240)], fill=(239, 68, 68), width=5)
    draw.line([(220, 200), (160, 240)], fill=(239, 68, 68), width=5)
    
    draw.ellipse([270, 195, 330, 245], outline=(56, 189, 248), width=5)
    
    return render_final_cover(img, "Ultimate Tic-Tac-Toe", "Strategic 9-Grid Battle", "4.8 ★", "STRATEGY", (129, 140, 248))

def generate_cyber_pong():
    img = create_base_canvas(600, 800, (15, 23, 42), (2, 6, 23))
    draw = ImageDraw.Draw(img)
    
    # Center dashed net
    for y in range(160, 480, 20):
        draw.line([(300, y), (300, y+10)], fill=(255, 255, 255, 80), width=3)
        
    # Left & Right Paddles
    draw.rounded_rectangle([100, 260, 114, 350], radius=4, fill=(56, 189, 248), outline=(255, 255, 255))
    draw.rounded_rectangle([486, 220, 500, 310], radius=4, fill=(244, 63, 94), outline=(255, 255, 255))
    
    # Ball with particle trail
    draw.ellipse([280-12, 280-12, 280+12, 280+12], fill=(255, 255, 255), outline=(56, 189, 248), width=2)
    
    return render_final_cover(img, "Neon Cyber Pong", "Speed Retro Duel", "4.7 ★", "2-PLAYER", (56, 189, 248))

def generate_memory_match():
    img = create_base_canvas(600, 800, (88, 28, 135), (15, 23, 42))
    draw = ImageDraw.Draw(img)
    
    # 4 Cards matrix
    cards = [(160, 210), (320, 210), (160, 330), (320, 330)]
    for i, (cx, cy) in enumerate(cards):
        if i == 0: # Flipped front
            draw.rounded_rectangle([cx, cy, cx+120, cy+100], radius=10, fill=(244, 63, 94), outline=(255, 255, 255), width=2)
            draw.ellipse([cx+40, cy+30, cx+80, cy+70], fill=(255, 255, 255))
        else: # Cyber Back
            draw.rounded_rectangle([cx, cy, cx+120, cy+100], radius=10, fill=(30, 41, 59), outline=(168, 85, 247), width=2)
            draw.line([(cx+20, cy+50), (cx+100, cy+50)], fill=(168, 85, 247, 120), width=2)
            
    return render_final_cover(img, "Matrix Memory Match", "Pattern Recognition", "4.7 ★", "BRAIN", (244, 63, 94))

def generate_minesweeper():
    img = create_base_canvas(600, 800, (15, 23, 42), (2, 6, 23))
    draw = ImageDraw.Draw(img)
    
    # 4x4 Grid
    gx, gy = 180, 210
    step = 60
    for r in range(4):
        for c in range(4):
            x, y = gx + c * step, gy + r * step
            draw.rounded_rectangle([x, y, x+step-4, y+step-4], radius=4, fill=(51, 65, 85), outline=(100, 116, 139), width=1)
            
    # Mine in center
    mx, my = gx + step + 28, gy + step + 28
    draw.ellipse([mx-16, my-16, mx+16, my+16], fill=(239, 68, 68))
    # Flag
    fx, fy = gx + 2 * step + 28, gy + step + 28
    draw.line([(fx-8, fy+14), (fx-8, fy-12)], fill=(255, 255, 255), width=2)
    draw.polygon([(fx-8, fy-12), (fx+10, fy-6), (fx-8, fy)], fill=(234, 179, 8))
    
    return render_final_cover(img, "Cyber Minesweeper", "Tactical Grid Sweeper", "4.8 ★", "PUZZLE", (239, 68, 68))

def generate_simon_echo():
    img = create_base_canvas(600, 800, (30, 41, 59), (15, 23, 42))
    draw = ImageDraw.Draw(img)
    
    # 4 Glowing Quadrants Wheel
    cx, cy = 300, 310
    r = 110
    draw.pieslice([cx-r, cy-r, cx+r, cy+r], 0, 90, fill=(16, 185, 129), outline=(255, 255, 255, 80), width=2)
    draw.pieslice([cx-r, cy-r, cx+r, cy+r], 90, 180, fill=(234, 179, 8), outline=(255, 255, 255, 80), width=2)
    draw.pieslice([cx-r, cy-r, cx+r, cy+r], 180, 270, fill=(239, 68, 68), outline=(255, 255, 255, 80), width=2)
    draw.pieslice([cx-r, cy-r, cx+r, cy+r], 270, 360, fill=(59, 130, 246), outline=(255, 255, 255, 80), width=2)
    draw.ellipse([cx-40, cy-40, cx+40, cy+40], fill=(15, 23, 42), outline=(255, 255, 255), width=2)
    
    return render_final_cover(img, "Simon Cyber Echo", "Sound & Memory Rhythm", "4.8 ★", "AUDIO", (16, 185, 129))

# --- Hero Spotlight Banners (1920x1080) ---

def generate_hero_banner(filename, title, subtitle, tag, main_color, accent_color):
    W, H = 1920, 1080
    img = create_base_canvas(W, H, (15, 23, 42), (2, 6, 23))
    draw = ImageDraw.Draw(img)
    draw_stars(draw, W, H, 300, 4.0)
    
    # Right Side Cinematic Graphic Spotlight
    cx, cy = W - 500, H // 2
    for r in range(400, 50, -20):
        draw.ellipse([cx-r, cy-r, cx+r, cy+r], fill=(main_color[0], main_color[1], main_color[2], int(25 * (1 - r/400))))
        
    # Floating Geometric Arcade Rings
    draw.ellipse([cx-220, cy-220, cx+220, cy+220], outline=(accent_color[0], accent_color[1], accent_color[2], 180), width=4)
    draw.ellipse([cx-160, cy-160, cx+160, cy+160], outline=(main_color[0], main_color[1], main_color[2], 140), width=2)
    
    # Left Content Overlay Gradient
    left_grad = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    lg_draw = ImageDraw.Draw(left_grad)
    for x in range(0, int(W * 0.65)):
        factor = 1.0 - (x / (W * 0.65))
        alpha = int(240 * (factor ** 0.8))
        lg_draw.line([(x, 0), (x, H)], fill=(10, 15, 30, alpha))
    img.paste(left_grad, (0, 0), left_grad)
    draw = ImageDraw.Draw(img)
    
    # Left Hero Typography (PlayStation Style)
    draw_banner_badge(draw, tag, 120, 260, bg_color=(accent_color[0], accent_color[1], accent_color[2], 255), text_color=(15, 23, 42))
    
    t_font = get_font(72, bold=True)
    sub_font = get_font(28, bold=False)
    btn_font = get_font(22, bold=True)
    
    draw.text((120, 330), title, fill=(255, 255, 255), font=t_font)
    draw.text((120, 440), subtitle, fill=(148, 163, 184), font=sub_font)
    
    # PlayStation Style Button Mock
    draw.rounded_rectangle([120, 540, 320, 610], radius=12, fill=(255, 255, 255), outline=(255, 255, 255))
    draw.text((160, 560), "PLAY NOW ▶", fill=(15, 23, 42), font=btn_font)
    
    draw.rounded_rectangle([340, 540, 540, 610], radius=12, fill=(255, 255, 255, 30), outline=(255, 255, 255, 80))
    draw.text((375, 560), "DETAILS ℹ", fill=(255, 255, 255), font=btn_font)
    
    # Outer Frame
    draw.rectangle([0, 0, W-1, H-1], outline=(255, 255, 255, 30), width=2)
    
    path = os.path.join(HEROES_DIR, filename)
    img.convert("RGB").save(path, "JPEG", quality=92)
    print(f"Generated hero banner: {path}")

# Run All Generations
print("Starting World-Class Game Art Generation...")

covers = [
    ("galaxy-defender.jpg", generate_galaxy_defender()),
    ("asteroid-blaster.jpg", generate_asteroid_blaster()),
    ("snake-retro.jpg", generate_snake_retro()),
    ("word-quest.jpg", generate_word_quest()),
    ("sudoku-master.jpg", generate_sudoku_master()),
    ("2048-master.jpg", generate_2048_master()),
    ("pac-runner.jpg", generate_pac_runner()),
    ("bubble-shooter.jpg", generate_bubble_shooter()),
    ("tetra-block.jpg", generate_tetra_block()),
    ("flappy-bird.jpg", generate_flappy_bird()),
    ("neon-breakout.jpg", generate_neon_breakout()),
    ("connect-four.jpg", generate_connect_four()),
    ("ultimate-tictactoe.jpg", generate_ultimate_tictactoe()),
    ("cyber-pong.jpg", generate_cyber_pong()),
    ("memory-match.jpg", generate_memory_match()),
    ("minesweeper.jpg", generate_minesweeper()),
    ("simon-echo.jpg", generate_simon_echo())
]

for filename, img in covers:
    path = os.path.join(COVERS_DIR, filename)
    img.convert("RGB").save(path, "JPEG", quality=90)
    print(f"Generated cover: {path}")

# Generate 4 Major Hero Spotlight Banners
generate_hero_banner(
    "hero-spotlight-galaxy.jpg",
    "GALAXY DEFENDER",
    "Command the hyper-cruiser and repel endless alien waves.",
    "PLAYSTATION FEATURED",
    (59, 130, 246),
    (56, 189, 248)
)

generate_hero_banner(
    "hero-spotlight-word.jpg",
    "WORD QUEST CYBER",
    "Crack the 5-letter daily encrypted keyword with zero hints.",
    "DAILY CHALLENGE",
    (129, 140, 248),
    (234, 179, 8)
)

generate_hero_banner(
    "hero-spotlight-asteroid.jpg",
    "ASTEROID BLASTER",
    "Hyperdrive vector space battle across deep cosmic nebula.",
    "ACTION SPOTLIGHT",
    (249, 115, 22),
    (239, 68, 68)
)

generate_hero_banner(
    "hero-spotlight-retro.jpg",
    "RETRO SNAKE 2.0",
    "The legendary arcade classic rebuilt with neon synth physics.",
    "ALL-TIME CLASSIC",
    (16, 185, 129),
    (52, 211, 153)
)

print("All 21 World-Class Game Arts generated successfully!")
