import os
import math
import random
from PIL import Image, ImageDraw, ImageFont, ImageFilter

OUTPUT_DIR = "/home/imon/Extra_SSD/arcade-hub/public/assets/covers"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def create_badge(draw, text, x, y, bg_color, text_color=(255,255,255)):
    # Draw rounded pill badge
    padding_x = 12
    padding_y = 6
    font_size = 14
    # Approximate text width
    w = len(text) * 8 + padding_x * 2
    h = 24
    draw.rounded_rectangle([x, y, x + w, y + h], radius=12, fill=bg_color)
    draw.text((x + padding_x, y + 4), text, fill=text_color)

def generate_stickman_fighter_thumb(path):
    img = Image.new("RGB", (640, 360), "#090d16")
    draw = ImageDraw.Draw(img)
    
    # Background gradient / glowing moon
    for r in range(120, 0, -2):
        alpha = int(255 * (1 - r/120) * 0.15)
        draw.ellipse([450 - r, 120 - r, 450 + r, 120 + r], fill=(99, 102, 241))
    
    # Floor
    draw.rectangle([0, 290, 640, 360], fill=(24, 24, 37))
    draw.rectangle([0, 288, 640, 290], fill=(99, 102, 241))
    
    # Blue Ninja Stickman Hero (Slashing pose)
    # Head
    draw.ellipse([200, 160, 230, 190], fill=(56, 189, 248))
    # Eye Glow
    draw.ellipse([222, 172, 228, 178], fill=(255, 255, 255))
    # Body
    draw.line([215, 190, 205, 240], fill=(56, 189, 248), width=8)
    # Arms holding glowing katana
    draw.line([215, 205, 260, 180], fill=(56, 189, 248), width=7)
    draw.line([260, 180, 340, 130], fill=(255, 255, 255), width=10) # Katana blade
    draw.line([255, 175, 345, 125], fill=(56, 189, 248), width=4)
    # Legs (kick/dash pose)
    draw.line([205, 240, 250, 288], fill=(56, 189, 248), width=7)
    draw.line([205, 240, 170, 288], fill=(56, 189, 248), width=7)
    
    # Slash Arc Energy Wave
    draw.arc([180, 80, 420, 320], start=-60, end=40, fill=(56, 189, 248), width=12)
    
    # Red Enemy Stickman (Getting knocked back)
    draw.ellipse([400, 180, 426, 206], fill=(239, 68, 68))
    draw.line([413, 206, 435, 250], fill=(239, 68, 68), width=7)
    draw.line([413, 215, 450, 200], fill=(239, 68, 68), width=6)
    draw.line([435, 250, 460, 285], fill=(239, 68, 68), width=6)
    draw.line([435, 250, 410, 275], fill=(239, 68, 68), width=6)
    
    # Sparks / Impact particles
    for _ in range(35):
        px = random.randint(300, 420)
        py = random.randint(140, 240)
        draw.rectangle([px, py, px+4, py+4], fill=(251, 191, 36))

    # Gradient Overlay at bottom for Title readability
    overlay = Image.new("RGBA", (640, 360), (0,0,0,0))
    odraw = ImageDraw.Draw(overlay)
    for y in range(240, 360):
        a = int(220 * ((y - 240) / 120))
        odraw.line([(0, y), (640, y)], fill=(15, 23, 42, a))
    img.paste(Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB"))
    
    draw = ImageDraw.Draw(img)
    # Title & Badge
    create_badge(draw, "⚡ ACTION FIGHTER", 20, 20, (99, 102, 241))
    create_badge(draw, "★ 4.9 RATING", 480, 20, (234, 179, 8), (0,0,0))
    draw.text((24, 295), "STICKMAN SHADOW FIGHTER", fill=(255, 255, 255))
    draw.text((24, 325), "Martial Arts Combos • Dragon Slash • 60 FPS", fill=(148, 163, 184))
    
    img.save(path, quality=95)

def generate_stickman_archer_thumb(path):
    img = Image.new("RGB", (640, 360), "#0f172a")
    draw = ImageDraw.Draw(img)
    
    # Dusk Gradient
    for y in range(360):
        r = int(15 + (y/360) * 30)
        g = int(23 + (y/360) * 40)
        b = int(42 + (y/360) * 50)
        draw.line([(0, y), (640, y)], fill=(r, g, b))
        
    # Castles
    draw.rectangle([40, 220, 140, 360], fill=(30, 27, 75))
    draw.rectangle([480, 180, 580, 360], fill=(69, 10, 10))
    
    # Archer Stickman
    draw.ellipse([90, 160, 114, 184], fill=(59, 130, 246))
    draw.line([102, 184, 102, 220], fill=(59, 130, 246), width=7)
    draw.line([102, 220, 85, 260], fill=(59, 130, 246), width=6)
    draw.line([102, 220, 115, 260], fill=(59, 130, 246), width=6)
    
    # Golden Bow
    draw.arc([100, 170, 160, 230], start=-70, end=70, fill=(251, 191, 36), width=6)
    # Bowstring & Arrow
    draw.line([102, 175, 125, 200], fill=(255, 255, 255), width=2)
    draw.line([102, 225, 125, 200], fill=(255, 255, 255), width=2)
    draw.line([115, 200, 175, 185], fill=(56, 189, 248), width=5)
    
    # Trajectory Arc Line
    for step in range(10):
        tx = 175 + step * 30
        ty = 185 - math.sin(step * 0.3) * 45 + (step**2) * 1.5
        draw.ellipse([tx-2, ty-2, tx+2, ty+2], fill=(56, 189, 248))
        
    # Enemy Archer on Tower
    draw.ellipse([520, 120, 544, 144], fill=(239, 68, 68))
    draw.line([532, 144, 532, 180], fill=(239, 68, 68), width=7)
    
    # Bottom Bar
    overlay = Image.new("RGBA", (640, 360), (0,0,0,0))
    odraw = ImageDraw.Draw(overlay)
    for y in range(240, 360):
        a = int(220 * ((y - 240) / 120))
        odraw.line([(0, y), (640, y)], fill=(15, 23, 42, a))
    img.paste(Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB"))
    
    draw = ImageDraw.Draw(img)
    create_badge(draw, "🏹 PHYSICS ARCHERY", 20, 20, (59, 130, 246))
    create_badge(draw, "★ 4.8 RATING", 480, 20, (234, 179, 8), (0,0,0))
    draw.text((24, 295), "STICKMAN BOWMASTER PRO", fill=(255, 255, 255))
    draw.text((24, 325), "Ballistic Physics • Dynamic Wind • Headshot Mastery", fill=(148, 163, 184))
    
    img.save(path, quality=95)

def generate_stickman_runner_thumb(path):
    img = Image.new("RGB", (640, 360), "#090d16")
    draw = ImageDraw.Draw(img)
    
    # Neon City Grid
    for i in range(10):
        bx = i * 70
        draw.rectangle([bx, 140 + (i%3)*30, bx+55, 360], fill=(20, 24, 45))
        # Windows
        for wy in range(180, 300, 25):
            draw.rectangle([bx+10, wy, bx+20, wy+12], fill=(6, 182, 212))
            
    # Track
    draw.rectangle([0, 280, 640, 360], fill=(15, 23, 42))
    draw.rectangle([0, 278, 640, 280], fill=(6, 182, 212))
    
    # Runner Stickman in Mid-Air Leap
    draw.ellipse([220, 140, 246, 166], fill=(6, 182, 212))
    draw.line([233, 166, 220, 205], fill=(6, 182, 212), width=7)
    draw.line([233, 180, 265, 165], fill=(6, 182, 212), width=6)
    draw.line([233, 180, 195, 195], fill=(6, 182, 212), width=6)
    draw.line([220, 205, 260, 225], fill=(6, 182, 212), width=7)
    draw.line([220, 205, 185, 215], fill=(6, 182, 212), width=7)
    
    # Red Spikes & High Laser
    draw.polygon([(340, 278), (355, 230), (370, 278)], fill=(239, 68, 68))
    draw.polygon([(370, 278), (385, 230), (400, 278)], fill=(239, 68, 68))
    
    # Laser Beam
    draw.rectangle([480, 210, 520, 225], fill=(225, 29, 72))
    
    # Golden Gems
    draw.ellipse([290, 170, 310, 190], fill=(250, 204, 21))
    draw.ellipse([370, 150, 390, 170], fill=(250, 204, 21))
    
    # Bottom text overlay
    overlay = Image.new("RGBA", (640, 360), (0,0,0,0))
    odraw = ImageDraw.Draw(overlay)
    for y in range(240, 360):
        a = int(220 * ((y - 240) / 120))
        odraw.line([(0, y), (640, y)], fill=(15, 23, 42, a))
    img.paste(Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB"))
    
    draw = ImageDraw.Draw(img)
    create_badge(draw, "⚡ ENDLESS PARKOUR", 20, 20, (6, 182, 212))
    create_badge(draw, "★ 4.9 RATING", 480, 20, (234, 179, 8), (0,0,0))
    draw.text((24, 295), "STICKMAN PARKOUR DASH", fill=(255, 255, 255))
    draw.text((24, 325), "Double Jumps • Sliding • Cyberpunk Rooftop Dash", fill=(148, 163, 184))
    
    img.save(path, quality=95)

def generate_stickman_sniper_thumb(path):
    img = Image.new("RGB", (640, 360), "#020617")
    draw = ImageDraw.Draw(img)
    
    # Rooftops
    for i in range(6):
        bx = i * 110 + 20
        draw.rectangle([bx, 190, bx+90, 360], fill=(15, 23, 42))
        for wy in range(220, 340, 30):
            draw.rectangle([bx+15, wy, bx+30, wy+16], fill=(254, 240, 138))
            
    # Enemies on Rooftop
    draw.ellipse([310, 150, 328, 168], fill=(239, 68, 68))
    draw.line([319, 168, 319, 190], fill=(239, 68, 68), width=5)
    
    # Sniper Scope View Overlay (Centered on Target)
    overlay = Image.new("RGBA", (640, 360), (0,0,0,0))
    odraw = ImageDraw.Draw(overlay)
    
    # Darken outside circle
    odraw.rectangle([0, 0, 640, 360], fill=(0, 0, 0, 180))
    # Clear circle
    odraw.ellipse([320 - 100, 170 - 100, 320 + 100, 170 + 100], fill=(0, 0, 0, 0))
    # Red Reticle & Crosshair
    odraw.ellipse([320 - 100, 170 - 100, 320 + 100, 170 + 100], outline=(239, 68, 68, 255), width=3)
    odraw.line([(320 - 100, 170), (320 + 100, 170)], fill=(239, 68, 68, 255), width=2)
    odraw.line([(320, 170 - 100), (320, 170 + 100)], fill=(239, 68, 68, 255), width=2)
    
    img.paste(Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB"))
    
    # Bottom banner
    overlay2 = Image.new("RGBA", (640, 360), (0,0,0,0))
    odraw2 = ImageDraw.Draw(overlay2)
    for y in range(240, 360):
        a = int(220 * ((y - 240) / 120))
        odraw2.line([(0, y), (640, y)], fill=(15, 23, 42, a))
    img.paste(Image.alpha_composite(img.convert("RGBA"), overlay2).convert("RGB"))
    
    draw = ImageDraw.Draw(img)
    create_badge(draw, "🎯 TACTICAL SNIPER", 20, 20, (239, 68, 68))
    create_badge(draw, "★ 4.9 RATING", 480, 20, (234, 179, 8), (0,0,0))
    draw.text((24, 295), "STICKMAN TACTICAL SNIPER", fill=(255, 255, 255))
    draw.text((24, 325), "Covert Ops • VIP Targets • Precision Headshots", fill=(148, 163, 184))
    
    img.save(path, quality=95)

def generate_stickman_warriors_thumb(path):
    img = Image.new("RGB", (640, 360), "#0c0a09")
    draw = ImageDraw.Draw(img)
    
    # Battlefield
    draw.rectangle([20, 160, 120, 360], fill=(30, 58, 138))
    draw.rectangle([500, 160, 600, 360], fill=(127, 29, 29))
    draw.rectangle([0, 280, 640, 360], fill=(28, 25, 23))
    
    # Blue Army (Swordsman, Giant)
    draw.ellipse([160, 220, 180, 240], fill=(59, 130, 246))
    draw.line([170, 240, 170, 280], fill=(59, 130, 246), width=6)
    draw.line([170, 250, 195, 240], fill=(59, 130, 246), width=5)
    
    # Giant Golem
    draw.ellipse([210, 160, 250, 200], fill=(245, 158, 11))
    draw.line([230, 200, 230, 280], fill=(245, 158, 11), width=14)
    draw.line([230, 220, 275, 200], fill=(245, 158, 11), width=10)
    
    # Red Army Clashing
    draw.ellipse([340, 220, 360, 240], fill=(239, 68, 68))
    draw.line([350, 240, 350, 280], fill=(239, 68, 68), width=6)
    
    # Spells & Arrows in Air
    for _ in range(25):
        px = random.randint(180, 450)
        py = random.randint(120, 260)
        draw.ellipse([px, py, px+6, py+6], fill=(168, 85, 247))
        
    # Bottom banner
    overlay = Image.new("RGBA", (640, 360), (0,0,0,0))
    odraw = ImageDraw.Draw(overlay)
    for y in range(240, 360):
        a = int(220 * ((y - 240) / 120))
        odraw.line([(0, y), (640, y)], fill=(15, 23, 42, a))
    img.paste(Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB"))
    
    draw = ImageDraw.Draw(img)
    create_badge(draw, "⚔️ CASTLE DEFENSE", 20, 20, (245, 158, 11))
    create_badge(draw, "★ 4.9 RATING", 480, 20, (234, 179, 8), (0,0,0))
    draw.text((24, 295), "STICKMAN CASTLE ARMY: WAR", fill=(255, 255, 255))
    draw.text((24, 325), "Gold Economy • Castle Siege • Epic Army Battles", fill=(148, 163, 184))
    
    img.save(path, quality=95)

# Generate All Stickman Thumbnails
generate_stickman_fighter_thumb(f"{OUTPUT_DIR}/stickman-fighter.jpg")
generate_stickman_archer_thumb(f"{OUTPUT_DIR}/stickman-archer.jpg")
generate_stickman_runner_thumb(f"{OUTPUT_DIR}/stickman-runner.jpg")
generate_stickman_sniper_thumb(f"{OUTPUT_DIR}/stickman-sniper.jpg")
generate_stickman_warriors_thumb(f"{OUTPUT_DIR}/stickman-warriors.jpg")

print("Generated 5 realistic Stickman covers!")
