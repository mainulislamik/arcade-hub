import os
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

OUTPUT_DIR = "/home/imon/Extra_SSD/arcade-hub/public/assets/covers"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def create_base_canvas(w=600, h=400, color1=(15, 23, 42), color2=(2, 6, 23)):
    img = Image.new('RGB', (w, h), color1)
    draw = ImageDraw.Draw(img)
    for y in range(h):
        r = int(color1[0] + (color2[0] - color1[0]) * (y / h))
        g = int(color1[1] + (color2[1] - color1[1]) * (y / h))
        b = int(color1[2] + (color2[2] - color1[2]) * (y / h))
        draw.line([(0, y), (w, y)], fill=(r, g, b))
    return img

def add_glow_grid(img, color=(56, 189, 248, 40)):
    w, h = img.size
    overlay = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    for x in range(0, w, 30):
        d.line([(x, 0), (x, h)], fill=color, width=1)
    for y in range(0, h, 30):
        d.line([(0, y), (w, y)], fill=color, width=1)
    img.paste(Image.alpha_composite(img.convert('RGBA'), overlay).convert('RGB'))
    return img

def render_badge(img, text, x=24, y=24, bg=(239, 68, 68), fg=(255, 255, 255)):
    draw = ImageDraw.Draw(img)
    pad_x, pad_y = 12, 6
    tw = len(text) * 9
    th = 16
    draw.rounded_rectangle([x, y, x + tw + pad_x*2, y + th + pad_y*2], radius=8, fill=bg)
    draw.text((x + pad_x, y + pad_y), text, fill=fg)

def render_title_block(img, title, subtitle, tag, color_accent=(6, 182, 212)):
    w, h = img.size
    draw = ImageDraw.Draw(img)
    # Bottom gradient overlay
    overlay = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    for y in range(int(h * 0.45), h):
        alpha = int(220 * ((y - h*0.45) / (h * 0.55)))
        od.line([(0, y), (w, y)], fill=(10, 15, 30, alpha))
    img.paste(Image.alpha_composite(img.convert('RGBA'), overlay).convert('RGB'))
    
    draw = ImageDraw.Draw(img)
    # Tag
    draw.rounded_rectangle([30, h - 110, 30 + len(tag)*8 + 16, h - 88], radius=6, fill=(30, 41, 59))
    draw.text((38, h - 106), tag.upper(), fill=color_accent)
    # Title
    draw.text((30, h - 80), title, fill=(255, 255, 255))
    # Subtitle
    draw.text((30, h - 45), subtitle, fill=(148, 163, 184))

def make_hexgl_cover():
    img = create_base_canvas(600, 400, (14, 165, 233), (2, 6, 23))
    add_glow_grid(img, (255, 255, 255, 30))
    d = ImageDraw.Draw(img)
    # Wipeout Ship
    d.polygon([(300, 100), (380, 240), (300, 210), (220, 240)], fill=(255, 255, 255))
    d.polygon([(300, 120), (340, 210), (300, 190), (260, 210)], fill=(14, 165, 233))
    d.line([(220, 240), (200, 320)], fill=(244, 63, 94), width=4)
    d.line([(380, 240), (400, 320)], fill=(244, 63, 94), width=4)
    render_badge(img, "3D WEBGL RACER", 24, 24, (14, 165, 233))
    render_title_block(img, "HEXGL 3D WIPEOUT", "Legendary futuristic 3D WebGL speed racer", "AAA 3D Racing", (56, 189, 248))
    img.save(os.path.join(OUTPUT_DIR, "hexgl.jpg"), quality=92)

def make_outrun_cover():
    img = create_base_canvas(600, 400, (236, 72, 153), (15, 23, 42))
    d = ImageDraw.Draw(img)
    # Sunset
    d.ellipse([200, 40, 400, 240], fill=(251, 146, 60))
    # Road lines
    d.polygon([(300, 180), (550, 400), (50, 400)], fill=(30, 41, 59))
    d.polygon([(295, 180), (305, 180), (315, 400), (285, 400)], fill=(250, 204, 21))
    render_badge(img, "PSEUDO-3D RETRO", 24, 24, (236, 72, 153))
    render_title_block(img, "OUTRUN 3D HIGHWAY", "Classic retro Ferrari highway racing arcade", "Arcade Driving", (244, 114, 182))
    img.save(os.path.join(OUTPUT_DIR, "outrun-racer.jpg"), quality=92)

def make_underrun_cover():
    img = create_base_canvas(600, 400, (168, 85, 247), (2, 6, 23))
    add_glow_grid(img, (168, 85, 247, 50))
    d = ImageDraw.Draw(img)
    # Dungeon hero & shooter lasers
    d.rectangle([270, 130, 330, 190], fill=(59, 130, 246))
    d.line([(300, 160), (480, 80)], fill=(239, 68, 68), width=3)
    d.line([(300, 160), (120, 220)], fill=(239, 68, 68), width=3)
    render_badge(img, "WEBGL ACTION", 24, 24, (168, 85, 247))
    render_title_block(img, "UNDERRUN WEBGL", "Twin-stick isometric action dungeon shooter", "Action Shooter", (192, 132, 252))
    img.save(os.path.join(OUTPUT_DIR, "underrun.jpg"), quality=92)

def make_3dcity_cover():
    img = create_base_canvas(600, 400, (34, 197, 94), (2, 6, 23))
    d = ImageDraw.Draw(img)
    # 3D buildings isometric
    for i, (bx, by, bw, bh, col) in enumerate([(150, 120, 60, 140, (148, 163, 184)), (230, 80, 80, 180, (59, 130, 246)), (330, 100, 70, 160, (234, 179, 8)), (420, 140, 60, 120, (34, 197, 94))]):
        d.rectangle([bx, by, bx + bw, by + bh], fill=col)
    render_badge(img, "3D SIMULATION", 24, 24, (34, 197, 94))
    render_title_block(img, "3D CITY BUILDER", "Real-time 3D SimCity urban simulation", "Strategy Simulation", (74, 222, 128))
    img.save(os.path.join(OUTPUT_DIR, "3d-city.jpg"), quality=92)

def make_tower_cover():
    img = create_base_canvas(600, 400, (249, 115, 22), (2, 6, 23))
    d = ImageDraw.Draw(img)
    # Tower blocks
    for idx, y in enumerate(range(240, 60, -35)):
        w_block = 180 - idx * 8
        x_block = 300 - w_block // 2 + (math.sin(idx) * 20)
        d.rectangle([x_block, y, x_block + w_block, y + 30], fill=(251, 146, 60), outline=(255, 255, 255), width=2)
    render_badge(img, "PHYSICS STACK", 24, 24, (249, 115, 22))
    render_title_block(img, "TOWER BUILDING", "Precision timing skyscraper block stacker", "Arcade Puzzle", (251, 146, 60))
    img.save(os.path.join(OUTPUT_DIR, "tower-building.jpg"), quality=92)

def make_clumsy_cover():
    img = create_base_canvas(600, 400, (6, 182, 212), (15, 23, 42))
    d = ImageDraw.Draw(img)
    # Pipes
    d.rectangle([120, 0, 180, 140], fill=(34, 197, 94), outline=(22, 101, 52), width=3)
    d.rectangle([120, 240, 180, 400], fill=(34, 197, 94), outline=(22, 101, 52), width=3)
    d.rectangle([420, 0, 480, 180], fill=(34, 197, 94), outline=(22, 101, 52), width=3)
    d.rectangle([420, 280, 480, 400], fill=(34, 197, 94), outline=(22, 101, 52), width=3)
    # Bird
    d.ellipse([270, 170, 330, 230], fill=(250, 204, 21))
    d.polygon([(320, 195), (350, 205), (320, 215)], fill=(249, 115, 22))
    d.ellipse([305, 180, 320, 195], fill=(255, 255, 255))
    d.ellipse([312, 185, 318, 191], fill=(0, 0, 0))
    render_badge(img, "CLASSIC HIT", 24, 24, (6, 182, 212))
    render_title_block(img, "CLUMSY FLAPPY BIRD", "Original MelonJS physics bird flap arcade", "Arcade Skill", (34, 211, 238))
    img.save(os.path.join(OUTPUT_DIR, "clumsy-bird.jpg"), quality=92)

def make_pacman_cover():
    img = create_base_canvas(600, 400, (15, 23, 42), (2, 6, 23))
    d = ImageDraw.Draw(img)
    # Maze borders
    d.rectangle([50, 50, 550, 350], outline=(37, 99, 235), width=4)
    # Pacman
    d.pieslice([180, 140, 280, 240], start=35, end=325, fill=(250, 204, 21))
    # Dots
    for dx in range(320, 500, 40):
        d.ellipse([dx, 185, dx + 12, 197], fill=(254, 240, 138))
    # Ghost
    d.rounded_rectangle([480, 140, 540, 230], radius=15, fill=(239, 68, 68))
    render_badge(img, "ARCADE LEGEND", 24, 24, (250, 204, 21), fg=(0, 0, 0))
    render_title_block(img, "PAC-MAN ARCADE", "Authentic arcade maze with classic Ghost AI", "Retro Arcade", (250, 204, 21))
    img.save(os.path.join(OUTPUT_DIR, "pacman-arcade.jpg"), quality=92)

def make_tetris_cover():
    img = create_base_canvas(600, 400, (15, 23, 42), (2, 6, 23))
    d = ImageDraw.Draw(img)
    # Falling tetrominoes
    colors = [(239, 68, 68), (59, 130, 246), (234, 179, 8), (168, 85, 247), (34, 197, 94)]
    for r in range(4):
        for c in range(6):
            if (r + c) % 2 == 0:
                d.rectangle([200 + c*30, 80 + r*30, 228 + c*30, 108 + r*30], fill=colors[(r+c)%len(colors)], outline=(255, 255, 255), width=1)
    render_badge(img, "NES RETRO", 24, 24, (168, 85, 247))
    render_title_block(img, "TETRIS CLASSIC", "Original block stacking puzzle mechanics", "Retro Puzzle", (192, 132, 252))
    img.save(os.path.join(OUTPUT_DIR, "tetris-classic.jpg"), quality=92)

def make_alien_cover():
    img = create_base_canvas(600, 400, (15, 23, 42), (2, 6, 23))
    d = ImageDraw.Draw(img)
    # Space Invader aliens
    for row in range(3):
        for col in range(6):
            d.rectangle([140 + col*55, 60 + row*40, 175 + col*55, 85 + row*40], fill=(34, 197, 94))
    # Cannon
    d.rectangle([270, 240, 330, 270], fill=(59, 130, 246))
    d.rectangle([295, 220, 305, 240], fill=(59, 130, 246))
    render_badge(img, "RETRO SHOOTER", 24, 24, (34, 197, 94))
    render_title_block(img, "ALIEN INVASION", "Classic space invaders arcade defense", "Retro Action", (74, 222, 128))
    img.save(os.path.join(OUTPUT_DIR, "alien-invasion.jpg"), quality=92)

def make_dino_cover():
    img = create_base_canvas(600, 400, (241, 245, 249), (203, 213, 225))
    d = ImageDraw.Draw(img)
    # Ground line
    d.line([(0, 280), (600, 280)], fill=(71, 85, 105), width=2)
    # Cactus
    d.rectangle([380, 200, 405, 280], fill=(51, 65, 85))
    d.rectangle([365, 225, 380, 250], fill=(51, 65, 85))
    d.rectangle([405, 215, 420, 240], fill=(51, 65, 85))
    # T-Rex
    d.rectangle([160, 180, 220, 280], fill=(30, 41, 59))
    render_badge(img, "OFFLINE LEGEND", 24, 24, (30, 41, 59), fg=(255, 255, 255))
    render_title_block(img, "CHROME T-REX RUNNER", "The world-famous offline dinosaur jumping game", "Endless Runner", (15, 23, 42))
    img.save(os.path.join(OUTPUT_DIR, "dino-runner-real.jpg"), quality=92)

def make_nsshaft_cover():
    img = create_base_canvas(600, 400, (15, 23, 42), (2, 6, 23))
    d = ImageDraw.Draw(img)
    # Shaft platforms
    for i, (py, px, col) in enumerate([(100, 120, (239, 68, 68)), (160, 320, (59, 130, 246)), (220, 180, (234, 179, 8)), (280, 360, (34, 197, 94))]):
        d.rectangle([px, py, px + 120, py + 15], fill=col)
    # Stick figure falling
    d.ellipse([220, 140, 240, 160], fill=(255, 255, 255))
    d.line([(230, 160), (230, 190)], fill=(255, 255, 255), width=3)
    render_badge(img, "ENDLESS DESCENT", 24, 24, (239, 68, 68))
    render_title_block(img, "NS-SHAFT ARCADE", "Authentic 100-floor downward survival", "Arcade Platformer", (248, 113, 113))
    img.save(os.path.join(OUTPUT_DIR, "ns-shaft.jpg"), quality=92)

def make_pool_cover():
    img = create_base_canvas(600, 400, (20, 83, 45), (5, 46, 22))
    d = ImageDraw.Draw(img)
    # Pool table cloth & balls
    d.rectangle([60, 60, 540, 340], fill=(22, 101, 52), outline=(120, 53, 15), width=12)
    # Cue ball & 8 ball
    d.ellipse([200, 180, 240, 220], fill=(255, 255, 255))
    d.ellipse([340, 180, 380, 220], fill=(0, 0, 0))
    d.ellipse([352, 192, 368, 208], fill=(255, 255, 255))
    d.text((357, 194), "8", fill=(0, 0, 0))
    render_badge(img, "2D BILLIARDS", 24, 24, (34, 197, 94))
    render_title_block(img, "CLASSIC 8-BALL POOL", "Realistic pocket billiards physics", "Sports Physics", (74, 222, 128))
    img.save(os.path.join(OUTPUT_DIR, "classic-pool.jpg"), quality=92)

def make_water_cover():
    img = create_base_canvas(600, 400, (2, 132, 199), (3, 105, 161))
    d = ImageDraw.Draw(img)
    # Water ripples & light caustics
    for r in range(40, 220, 30):
        d.ellipse([300 - r, 180 - r*0.6, 300 + r, 180 + r*0.6], outline=(255, 255, 255, 80), width=3)
    # Sphere in water
    d.ellipse([260, 140, 340, 220], fill=(244, 63, 94))
    render_badge(img, "WEBGL RAYTRACING", 24, 24, (14, 165, 233))
    render_title_block(img, "WEBGL WATER SIM", "Raytraced physical fluid simulation", "3D Interactive", (56, 189, 248))
    img.save(os.path.join(OUTPUT_DIR, "webgl-water.jpg"), quality=92)

def make_particle_cover():
    img = create_base_canvas(600, 400, (15, 23, 42), (2, 6, 23))
    add_glow_grid(img, (244, 63, 94, 40))
    d = ImageDraw.Draw(img)
    # CERN collider ring
    d.ellipse([180, 80, 420, 300], outline=(244, 63, 94), width=4)
    d.ellipse([270, 160, 330, 220], fill=(250, 204, 21))
    render_badge(img, "CERN SCIENCE IDLE", 24, 24, (244, 63, 94))
    render_title_block(img, "PARTICLE CLICKER", "Discover the Higgs Boson at CERN", "Science Tycoon", (251, 113, 133))
    img.save(os.path.join(OUTPUT_DIR, "particle-clicker.jpg"), quality=92)

make_hexgl_cover()
make_outrun_cover()
make_underrun_cover()
make_3dcity_cover()
make_tower_cover()
make_clumsy_cover()
make_pacman_cover()
make_tetris_cover()
make_alien_cover()
make_dino_cover()
make_nsshaft_cover()
make_pool_cover()
make_water_cover()
make_particle_cover()
print("Generated all HD covers for real games!")
