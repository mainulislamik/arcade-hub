import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

OUTPUT_DIR = "/home/imon/Extra_SSD/arcade-hub/public/assets/covers"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def create_subway_cover():
    img = Image.new('RGB', (640, 360), '#1e1b4b')
    draw = ImageDraw.Draw(img)
    # Sunset sky
    for y in range(160):
        r = int(30 + (234 - 30) * (y / 160))
        g = int(27 + (88 - 27) * (y / 160))
        b = int(75 + (12 - 75) * (y / 160))
        draw.line([(0, y), (640, y)], fill=(r, g, b))
    # Sun
    draw.ellipse([(280, 80), (360, 160)], fill='#fbbf24')
    # 3D Rails Ground
    for y in range(160, 360):
        t = (y - 160) / 200
        r = int(30 * (1 - t) + 2 * t)
        g = int(41 * (1 - t) + 6 * t)
        b = int(59 * (1 - t) + 23 * t)
        draw.line([(0, y), (640, y)], fill=(r, g, b))
    # Rails
    for lane in [-150, 0, 150]:
        draw.line([(320 + int(lane * 0.1), 160), (320 + lane * 2, 360)], fill='#94a3b8', width=4)
        draw.line([(320 + int(lane * 0.1) + 20, 160), (320 + lane * 2 + 50, 360)], fill='#94a3b8', width=4)
    # Red Subway Train
    draw.rectangle([(260, 150), (380, 270)], fill='#dc2626')
    draw.rectangle([(275, 170), (365, 205)], fill='#fef08a')
    # Runner Hero with Red Cap
    draw.ellipse([(190, 230), (220, 260)], fill='#fed7aa')
    draw.rectangle([(185, 225), (225, 238)], fill='#ef4444')
    draw.rectangle([(195, 260), (215, 295)], fill='#06b6d4')
    # Text
    draw.rectangle([(0, 290), (640, 360)], fill='#0f172a')
    draw.text((20, 305), "SUBWAY RUNNER 3D", fill='#ffffff')
    draw.text((20, 335), "ORIGINAL MOBILE HIT • 3D TRAIN ESCAPE", fill='#38bdf8')
    img.save(os.path.join(OUTPUT_DIR, "subway-surfer.jpg"), quality=92)

def create_temple_cover():
    img = Image.new('RGB', (640, 360), '#052e16')
    draw = ImageDraw.Draw(img)
    # Jungle canopy
    for y in range(160):
        r = int(6 + (2 - 6) * (y / 160))
        g = int(78 + (44 - 78) * (y / 160))
        b = int(59 + (34 - 59) * (y / 160))
        draw.line([(0, y), (640, y)], fill=(r, g, b))
    # Ancient stone pathway
    draw.polygon([(260, 160), (380, 160), (540, 360), (100, 360)], fill='#78716c')
    # Fire pit
    draw.ellipse([(270, 210), (370, 250)], fill='#ea580c')
    # Explorer hero with fedora
    draw.rectangle([(305, 230), (335, 240)], fill='#78350f')
    draw.ellipse([(310, 240), (330, 260)], fill='#fed7aa')
    draw.rectangle([(312, 260), (328, 285)], fill='#b45309')
    # Text
    draw.rectangle([(0, 290), (640, 360)], fill='#0f172a')
    draw.text((20, 305), "TEMPLE RELIC ESCAPE 3D", fill='#ffffff')
    draw.text((20, 335), "ORIGINAL MOBILE HIT • CURSED RUINS RUN", fill='#34d399')
    img.save(os.path.join(OUTPUT_DIR, "temple-dash.jpg"), quality=92)

def create_hill_climb_cover():
    img = Image.new('RGB', (640, 360), '#0284c7')
    draw = ImageDraw.Draw(img)
    # Sun
    draw.ellipse([(480, 40), (560, 120)], fill='#fef08a')
    # Green rolling hills
    draw.polygon([(0, 230), (150, 170), (320, 240), (480, 160), (640, 250), (640, 360), (0, 360)], fill='#16a34a')
    # Red 4x4 Jeep
    draw.rectangle([(180, 180), (250, 210)], fill='#dc2626')
    draw.ellipse([(175, 205), (205, 235)], fill='#1e293b')
    draw.ellipse([(225, 205), (255, 235)], fill='#1e293b')
    # Text
    draw.rectangle([(0, 290), (640, 360)], fill='#0f172a')
    draw.text((20, 305), "HILL RACER 2D PHYSICS", fill='#ffffff')
    draw.text((20, 335), "ORIGINAL MOBILE HIT • 4X4 OFFROAD", fill='#4ade80')
    img.save(os.path.join(OUTPUT_DIR, "hill-climb.jpg"), quality=92)

def create_fruit_slash_cover():
    img = Image.new('RGB', (640, 360), '#291708')
    draw = ImageDraw.Draw(img)
    # Dojo wood planks
    for y in range(0, 360, 40):
        draw.line([(0, y), (640, y)], fill='#1a0e05', width=2)
    # Watermelon cut
    draw.ellipse([(180, 120), (260, 200)], fill='#15803d')
    draw.ellipse([(200, 140), (240, 180)], fill='#ef4444')
    # Orange
    draw.ellipse([(380, 100), (450, 170)], fill='#f97316')
    # Slicing neon blade trail
    draw.line([(120, 240), (520, 80)], fill='#38bdf8', width=8)
    # Text
    draw.rectangle([(0, 290), (640, 360)], fill='#0f172a')
    draw.text((20, 305), "FRUIT BLADE NINJA", fill='#ffffff')
    draw.text((20, 335), "ORIGINAL MOBILE HIT • SWIPE & SLICE", fill='#fb7185')
    img.save(os.path.join(OUTPUT_DIR, "fruit-slash.jpg"), quality=92)

create_subway_cover()
create_temple_cover()
create_hill_climb_cover()
create_fruit_slash_cover()
print("Generated all 4 Play Store covers!")
