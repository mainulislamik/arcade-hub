import os
import math
import random
from PIL import Image, ImageDraw, ImageFilter, ImageFont

COVERS_DIR = "/home/imon/Extra_SSD/arcade-hub/public/assets/covers"
os.makedirs(COVERS_DIR, exist_ok=True)

def create_mecha_cover():
    width, height = 600, 800
    img = Image.new('RGB', (width, height), (10, 15, 26))
    draw = ImageDraw.Draw(img)

    # 1. Background tactical battlefield grid & warzone gradient
    for y in range(height):
        ratio = y / height
        r = int(10 + 25 * ratio + 15 * math.sin(ratio * 3.14))
        g = int(15 + 30 * ratio)
        b = int(28 + 45 * ratio)
        draw.line([(0, y), (width, y)], fill=(r, g, b))

    # Grid overlay
    for x in range(0, width, 40):
        draw.line([(x, 0), (x, height)], fill=(30, 45, 75, 40), width=1)
    for y in range(0, height, 40):
        draw.line([(0, y), (width, y)], fill=(30, 45, 75, 40), width=1)

    # Distant battle explosions & laser beams
    random.seed(42)
    for _ in range(12):
        bx = random.randint(50, width - 50)
        by = random.randint(100, height - 250)
        bradius = random.randint(25, 70)
        for r in range(bradius, 0, -6):
            alpha_color = (255, 120 + r * 2, 30)
            draw.ellipse([bx - r, by - r, bx + r, by + r], outline=alpha_color, width=2)

    # Red/Orange tactical lasers across the field
    for _ in range(8):
        x1 = random.randint(0, width)
        y1 = random.randint(150, 450)
        x2 = x1 + random.randint(-180, 180)
        y2 = y1 + random.randint(100, 250)
        draw.line([(x1, y1), (x2, y2)], fill=(255, 60, 40), width=3)
        draw.line([(x1, y1), (x2, y2)], fill=(255, 220, 180), width=1)

    # 2. Main Armored Combat Mech (Walking Titan) in Center
    cx, cy = width // 2, height // 2 - 20
    
    # Shadow underneath
    draw.ellipse([cx - 140, cy + 130, cx + 140, cy + 175], fill=(5, 8, 15))

    # Mech Legs / Treads
    # Left Leg
    draw.polygon([(cx - 100, cy + 50), (cx - 130, cy + 140), (cx - 70, cy + 150), (cx - 50, cy + 60)], fill=(40, 55, 75), outline=(90, 120, 160))
    # Right Leg
    draw.polygon([(cx + 50, cy + 60), (cx + 70, cy + 150), (cx + 130, cy + 140), (cx + 100, cy + 50)], fill=(40, 55, 75), outline=(90, 120, 160))

    # Main Torso Chassis (Heavy Armored Steel)
    draw.polygon([
        (cx - 90, cy - 60),
        (cx + 90, cy - 60),
        (cx + 120, cy + 20),
        (cx + 60, cy + 70),
        (cx - 60, cy + 70),
        (cx - 120, cy + 20)
    ], fill=(55, 75, 105), outline=(130, 175, 230), width=3)

    # Chest Armor Plates & Energy Reactor Core
    draw.polygon([(cx - 50, cy - 30), (cx + 50, cy - 30), (cx + 35, cy + 35), (cx - 35, cy + 35)], fill=(30, 45, 65), outline=(80, 120, 170), width=2)
    # Glowing Cyan Energy Reactor
    draw.ellipse([cx - 25, cy - 15, cx + 25, cy + 25], fill=(0, 240, 255), outline=(255, 255, 255), width=2)
    draw.ellipse([cx - 12, cy - 5, cx + 12, cy + 15], fill=(255, 255, 255))

    # Left Shoulder Dual Plasma Cannons
    draw.rectangle([cx - 145, cy - 70, cx - 95, cy - 20], fill=(45, 60, 85), outline=(100, 140, 190), width=2)
    draw.rectangle([cx - 140, cy - 130, cx - 125, cy - 70], fill=(20, 25, 35), outline=(0, 220, 255), width=2)
    draw.rectangle([cx - 115, cy - 130, cx - 100, cy - 70], fill=(20, 25, 35), outline=(0, 220, 255), width=2)
    # Muzzle flash on left cannon
    draw.ellipse([cx - 145, cy - 150, cx - 90, cy - 120], fill=(0, 255, 255), outline=(255, 255, 255), width=2)

    # Right Shoulder Swarm Missile Pod (6 missile tubes)
    draw.rectangle([cx + 95, cy - 70, cx + 145, cy - 20], fill=(45, 60, 85), outline=(100, 140, 190), width=2)
    for mx in range(3):
        for my in range(2):
            tx = cx + 105 + mx * 13
            ty = cy - 60 + my * 18
            draw.ellipse([tx - 4, ty - 4, tx + 4, ty + 4], fill=(255, 80, 20), outline=(255, 200, 0), width=1)
    
    # Firing Rocket from Right Pod
    draw.line([(cx + 120, cy - 80), (cx + 170, cy - 160)], fill=(255, 140, 0), width=4)
    draw.line([(cx + 120, cy - 80), (cx + 170, cy - 160)], fill=(255, 255, 200), width=2)

    # Cockpit Visor / Eye (Aggressive Glowing Red/Orange Sensor Bar)
    draw.polygon([(cx - 40, cy - 50), (cx + 40, cy - 50), (cx + 30, cy - 35), (cx - 30, cy - 35)], fill=(255, 40, 40), outline=(255, 180, 180), width=2)

    # 3. Floating Enemy Drone Swarm & Turrets
    for dx, dy, dsize in [(cx - 190, cy - 90, 22), (cx + 190, cy - 70, 25), (cx - 160, cy + 90, 18)]:
        draw.polygon([(dx, dy - dsize), (dx + dsize, dy), (dx, dy + dsize), (dx - dsize, dy)], fill=(180, 30, 30), outline=(255, 100, 100), width=2)
        draw.ellipse([dx - 5, dy - 5, dx + 5, dy + 5], fill=(255, 230, 0))

    # 4. Top & Bottom Title Banners & Typography Badges
    # Top Badge
    draw.rounded_rectangle([cx - 120, 35, cx + 120, 75], radius=10, fill=(20, 30, 50, 220), outline=(0, 210, 255), width=2)
    draw.text((cx, 55), "PRO ACTION • CYBER TITAN", fill=(0, 230, 255), anchor="mm")

    # Bottom Gradient Overlay for Title
    for y in range(height - 210, height):
        ratio = (y - (height - 210)) / 210
        draw.line([(0, y), (width, y)], fill=(10, 15, 25, int(240 * ratio)))

    # Game Title Banner: "MECHA BLASTER 2"
    draw.text((cx, height - 145), "MECHA BLASTER 2", fill=(255, 255, 255), anchor="mm")
    draw.text((cx, height - 105), "CYBER ASSAULT", fill=(0, 220, 255), anchor="mm")
    draw.text((cx, height - 65), "RETRO SYMBIAN MECH SHOOTER • 60 FPS", fill=(160, 185, 220), anchor="mm")

    # Save cover
    out_path = os.path.join(COVERS_DIR, "mecha-blaster-2.jpg")
    img.save(out_path, "JPEG", quality=95)
    print(f"Generated: {out_path}")

create_mecha_cover()
