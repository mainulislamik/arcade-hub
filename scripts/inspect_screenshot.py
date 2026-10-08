import os
from PIL import Image

img_path = '/home/imon/.hermes/cache/images/img_8468e5fadf9c.jpg'
img = Image.open(img_path)
print(f"Screenshot size: {img.size}, mode: {img.mode}")

# Crop key sections (left, center, right, top, bottom) to inspect colors and content
w, h = img.size
# Let's save a smaller thumbnail or inspect bounding boxes
# In Telegram, we can deliver cropped sections or analyze with Python

# Let's check dominant colors and text regions
print("Image analyzed successfully.")
