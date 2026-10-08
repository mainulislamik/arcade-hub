import os
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

OUTPUT_DIR = "/home/imon/Extra_SSD/arcade-hub/public/assets/covers"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def create_base_canvas(width=640, height=400, bg_color1=(10, 15, 30), bg_color2=(5, 8, 16)):
    img = Image.new("RGB", (width, height), bg_color1)
    draw = ImageDraw.Draw(img)
    # Vertical gradient
    for y in range(height):
        p = y / height
        r = int(bg_color1[0] * (1 - p) + bg_color2[0] * p)
        g = int(bg_color1[1] * (1 - p) + bg_color2[1] * p)
        b = int(bg_color1[2] * (1 - p) + bg_color2[2] * p)
        draw.line([(0, y), (width, y)], fill=(r, g, b))
    return img, draw

def add_cyber_grid(draw, width=640, height=400, color=(0, 243, 255, 40)):
    horizon = int(height * 0.45)
    cx = width // 2
    for i in range(-10, 11):
        x_end = cx + i * 70
        draw.line([(cx, horizon), (x_end, height)], fill=(0, 243, 255), width=1)
    for y in range(horizon + 10, height, 18):
        p = (y - horizon) / (height - horizon)
        alpha_color = (int(0 * p), int(243 * p), int(255 * p))
        draw.line([(0, y), (width, y)], fill=alpha_color, width=1)

def add_cinematic_vignette(img):
    vignette = Image.new("RGBA", img.size, (0, 0, 0, 0))
    vdraw = ImageDraw.Draw(vignette)
    w, h = img.size
    cx, cy = w // 2, h // 2
    max_radius = math.sqrt(cx * cx + cy * cy)
    for i in range(15):
        alpha = int(255 * (i / 15) ** 2 * 0.6)
        margin = int(i * 12)
        vdraw.rectangle([margin, margin, w - margin, h - margin], outline=(0, 0, 0, alpha), width=14)
    vignette = vignette.filter(ImageFilter.GaussianBlur(15))
    img.paste(vignette, (0, 0), vignette)
    return img

def add_3d_badge(draw, text="3D WEBGL", x=40, y=35, bg=(0, 200, 255), fg=(255, 255, 255)):
    draw.rounded_rectangle([x, y, x + 110, y + 28], radius=6, fill=(10, 25, 45), outline=bg, width=2)
    draw.text((x + 15, y + 6), text, fill=bg)

# 1. Cyber Slope 3D
def gen_slope_3d():
    img, draw = create_base_canvas(bg_color1=(12, 18, 40), bg_color2=(4, 6, 15))
    add_cyber_grid(draw)
    # Glowing 3D Sphere in Center
    cx, cy = 320, 220
    for r in range(70, 0, -5):
        p = (70 - r) / 70
        cr = int(0 + 255 * p)
        cg = int(243 + 12 * p)
        cb = int(255)
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(int(0 * (1-p) + 255*p), int(150 + 105*p), 255))
    # Draw Red Cube Obstacles
    draw.rectangle([180, 240, 230, 290], fill=(239, 68, 68), outline=(255, 255, 255), width=2)
    draw.rectangle([420, 210, 460, 250], fill=(239, 68, 68), outline=(255, 255, 255), width=2)
    add_3d_badge(draw, "3D WEBGL", 40, 35, bg=(0, 243, 255))
    draw.text((40, 320), "CYBER SLOPE 3D", fill=(255, 255, 255))
    draw.text((40, 345), "High-Speed Hardware Accelerated 3D Rolling", fill=(0, 243, 255))
    add_cinematic_vignette(img)
    img.save(f"{OUTPUT_DIR}/slope-3d.jpg", "JPEG", quality=95)

# 2. Hyper Drift 3D
def gen_drift_3d():
    img, draw = create_base_canvas(bg_color1=(25, 10, 15), bg_color2=(8, 4, 8))
    # Neon race track circle
    draw.ellipse([160, 80, 480, 340], outline=(30, 41, 59), width=70)
    draw.ellipse([160, 80, 480, 340], outline=(239, 68, 68), width=3)
    # 3D Supercar in drift
    draw.rounded_rectangle([270, 180, 370, 250], radius=10, fill=(239, 68, 68), outline=(255, 255, 255), width=2)
    draw.rounded_rectangle([290, 195, 350, 230], radius=5, fill=(15, 23, 42))
    # Headlight Beams
    draw.polygon([(270, 215), (100, 140), (140, 290)], fill=(0, 243, 255))
    add_3d_badge(draw, "3D RACING", 40, 35, bg=(239, 68, 68))
    draw.text((40, 320), "HYPER DRIFT 3D", fill=(255, 255, 255))
    draw.text((40, 345), "Smoke FX, Nitro Boost & Real 3D Physics", fill=(251, 146, 60))
    add_cinematic_vignette(img)
    img.save(f"{OUTPUT_DIR}/drift-3d.jpg", "JPEG", quality=95)

# 3. Subway Runner 3D
def gen_subway_3d():
    img, draw = create_base_canvas(bg_color1=(15, 23, 42), bg_color2=(8, 12, 24))
    # 3 Rails
    draw.line([(320, 120), (80, 400)], fill=(148, 163, 184), width=4)
    draw.line([(320, 120), (320, 400)], fill=(148, 163, 184), width=4)
    draw.line([(320, 120), (560, 400)], fill=(148, 163, 184), width=4)
    # 3D Red Train
    draw.rounded_rectangle([260, 160, 380, 320], radius=15, fill=(220, 38, 38), outline=(255, 255, 255), width=2)
    draw.ellipse([280, 260, 310, 290], fill=(254, 240, 138))
    draw.ellipse([330, 260, 360, 290], fill=(254, 240, 138))
    add_3d_badge(draw, "3D RUNNER", 40, 35, bg=(56, 189, 248))
    draw.text((40, 320), "SUBWAY RUNNER 3D", fill=(255, 255, 255))
    draw.text((40, 345), "3-Lane Endless Sprint, Trains & Hoverboard", fill=(56, 189, 248))
    add_cinematic_vignette(img)
    img.save(f"{OUTPUT_DIR}/subway-3d.jpg", "JPEG", quality=95)

# 4. Cyber Knife 3D
def gen_knife_3d():
    img, draw = create_base_canvas(bg_color1=(16, 20, 36), bg_color2=(6, 8, 16))
    # Target Wheel
    draw.ellipse([220, 70, 420, 270], fill=(30, 41, 59), outline=(0, 243, 255), width=4)
    # Embedded Blades
    draw.rectangle([316, 50, 324, 90], fill=(226, 232, 240))
    draw.rectangle([210, 166, 240, 174], fill=(226, 232, 240))
    draw.rectangle([400, 166, 430, 174], fill=(226, 232, 240))
    # Flying Blade
    draw.rectangle([315, 290, 325, 360], fill=(226, 232, 240), outline=(239, 68, 68), width=1)
    add_3d_badge(draw, "3D TARGET", 40, 35, bg=(245, 158, 11))
    draw.text((40, 320), "CYBER KNIFE 3D", fill=(255, 255, 255))
    draw.text((40, 345), "Precision Target Slicing & Boss Levels", fill=(245, 158, 11))
    add_cinematic_vignette(img)
    img.save(f"{OUTPUT_DIR}/knife-3d.jpg", "JPEG", quality=95)

# 5. Voxel Shooter 3D
def gen_voxel_3d():
    img, draw = create_base_canvas(bg_color1=(12, 16, 30), bg_color2=(4, 6, 14))
    add_cyber_grid(draw)
    # Voxel Combat Drone
    draw.rectangle([260, 140, 380, 260], fill=(239, 68, 68), outline=(255, 255, 255), width=3)
    draw.rectangle([290, 170, 350, 210], fill=(250, 204, 21))
    # Laser Crosshair
    draw.ellipse([270, 150, 370, 250], outline=(0, 243, 255), width=2)
    draw.line([(240, 200), (400, 200)], fill=(0, 243, 255), width=2)
    draw.line([(320, 120), (320, 280)], fill=(0, 243, 255), width=2)
    add_3d_badge(draw, "3D FPS", 40, 35, bg=(0, 243, 255))
    draw.text((40, 320), "VOXEL STRIKE 3D", fill=(255, 255, 255))
    draw.text((40, 345), "Raycast 3D Arena Shooter & Drone Defense", fill=(0, 243, 255))
    add_cinematic_vignette(img)
    img.save(f"{OUTPUT_DIR}/voxel-3d.jpg", "JPEG", quality=95)

if __name__ == "__main__":
    gen_slope_3d()
    gen_drift_3d()
    gen_subway_3d()
    gen_knife_3d()
    gen_voxel_3d()
    print("Generated all 5 AAA 3D Cinematic Covers!")
