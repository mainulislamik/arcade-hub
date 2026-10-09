import os
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

OUTPUT_DIR = "/home/imon/Extra_SSD/arcade-hub/public/assets/covers"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def create_badge(draw, text, x, y, bg_color=(255, 0, 85), text_color=(255, 255, 255)):
    padding_x = 10
    padding_y = 4
    bbox = draw.textbbox((x, y), text)
    w = bbox[2] - bbox[0] + padding_x * 2
    h = bbox[3] - bbox[1] + padding_y * 2
    draw.rounded_rectangle([x, y, x + w, y + h], radius=6, fill=bg_color)
    draw.text((x + padding_x, y + padding_y), text, fill=text_color)

def generate_duckhunt_cover():
    img = Image.new('RGB', (600, 400), color=(14, 165, 233))
    draw = ImageDraw.Draw(img)
    # Retro grass and tree
    draw.rectangle([0, 260, 600, 400], fill=(34, 197, 94))
    draw.rectangle([0, 290, 600, 400], fill=(21, 128, 61))
    draw.rectangle([80, 160, 120, 260], fill=(120, 53, 15))
    draw.ellipse([40, 80, 160, 190], fill=(22, 101, 52))
    
    # Flying Duck
    draw.ellipse([340, 120, 410, 160], fill=(180, 83, 9)) # body
    draw.ellipse([400, 105, 435, 135], fill=(16, 185, 129)) # green head
    draw.polygon([(435, 120), (460, 125), (435, 130)], fill=(245, 158, 11)) # beak
    draw.polygon([(360, 120), (380, 70), (400, 120)], fill=(217, 119, 6)) # wing
    
    # Reticle
    draw.ellipse([330, 80, 430, 180], outline=(239, 68, 68), width=4)
    draw.line([380, 65, 380, 195], fill=(239, 68, 68), width=3)
    draw.line([315, 130, 445, 130], fill=(239, 68, 68), width=3)
    
    # Title
    draw.text((30, 310), "DUCK HUNT 8-BIT", fill=(255, 255, 255))
    draw.text((30, 335), "Authentic Arcade Gunner · Classic Sound", fill=(203, 213, 225))
    create_badge(draw, "RETRO HIT", 30, 30, (239, 68, 68))
    img.save(os.path.join(OUTPUT_DIR, "duckhunt.jpg"), quality=92)

def generate_breaklock_cover():
    img = Image.new('RGB', (600, 400), color=(15, 23, 42))
    draw = ImageDraw.Draw(img)
    # Grid dots
    coords = []
    for r in range(3):
        for c in range(3):
            cx = 200 + c * 100
            cy = 80 + r * 90
            coords.append((cx, cy))
            draw.ellipse([cx - 14, cy - 14, cx + 14, cy + 14], fill=(30, 41, 59), outline=(56, 189, 248), width=3)
    
    # Connecting neon lines
    seq = [0, 4, 2, 5, 8]
    for i in range(len(seq) - 1):
        p1 = coords[seq[i]]
        p2 = coords[seq[i+1]]
        draw.line([p1, p2], fill=(6, 182, 212), width=6)
    
    for idx in seq:
        cx, cy = coords[idx]
        draw.ellipse([cx - 10, cy - 10, cx + 10, cy + 10], fill=(34, 211, 238))
        
    draw.text((30, 310), "BREAKLOCK CYBER", fill=(255, 255, 255))
    draw.text((30, 335), "Mastermind Security Pattern Solver", fill=(148, 163, 184))
    create_badge(draw, "PUZZLE", 30, 30, (6, 182, 212))
    img.save(os.path.join(OUTPUT_DIR, "breaklock.jpg"), quality=92)

def generate_asteroids_cover():
    img = Image.new('RGB', (600, 400), color=(3, 7, 18))
    draw = ImageDraw.Draw(img)
    # Ship
    draw.polygon([(300, 140), (280, 200), (300, 190), (320, 200)], outline=(255, 255, 255), width=3)
    # Thruster
    draw.polygon([(290, 193), (300, 215), (310, 193)], fill=(239, 68, 68))
    # Lasers
    draw.line([300, 130, 300, 70], fill=(34, 197, 94), width=3)
    # Asteroids
    pts1 = [(150, 80), (200, 60), (240, 100), (220, 150), (170, 160), (130, 120)]
    draw.polygon(pts1, outline=(255, 255, 255), width=3)
    pts2 = [(420, 180), (480, 160), (520, 210), (490, 270), (430, 250), (400, 210)]
    draw.polygon(pts2, outline=(255, 255, 255), width=3)
    
    draw.text((30, 310), "ASTEROIDS 1979", fill=(255, 255, 255))
    draw.text((30, 335), "Vector Space Rock Blaster Arcade", fill=(156, 163, 175))
    create_badge(draw, "VECTOR CLASSIC", 30, 30, (168, 85, 247))
    img.save(os.path.join(OUTPUT_DIR, "asteroids.jpg"), quality=92)

def generate_memory_cover():
    img = Image.new('RGB', (600, 400), color=(30, 27, 75))
    draw = ImageDraw.Draw(img)
    # Cards
    for i in range(4):
        x = 60 + i * 125
        y = 110
        draw.rounded_rectangle([x, y, x + 105, y + 140], radius=12, fill=(49, 46, 129), outline=(129, 140, 248), width=3)
        if i == 1 or i == 2:
            draw.rounded_rectangle([x, y, x + 105, y + 140], radius=12, fill=(67, 56, 202), outline=(244, 63, 94), width=3)
            # Diamond icon
            draw.polygon([(x+52, y+40), (x+80, y+70), (x+52, y+100), (x+24, y+70)], fill=(244, 63, 94))
        else:
            draw.text((x+42, y+55), "?", fill=(165, 180, 252))
            
    draw.text((30, 310), "MEMORY MATRIX", fill=(255, 255, 255))
    draw.text((30, 335), "Card Flip Brain Reflex Training", fill=(199, 210, 254))
    create_badge(draw, "BRAIN GYM", 30, 30, (236, 72, 153))
    img.save(os.path.join(OUTPUT_DIR, "memory-game.jpg"), quality=92)

generate_duckhunt_cover()
generate_breaklock_cover()
generate_asteroids_cover()
generate_memory_cover()
print("Generated new covers!")
