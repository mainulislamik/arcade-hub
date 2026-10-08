import os
import struct
from PIL import Image
import io

mb2_dir = '/home/imon/Extra_SSD/arcade-hub/extracted_sis/MB2'
out_dir = '/home/imon/Extra_SSD/arcade-hub/extracted_sis/bitmaps'
os.makedirs(out_dir, exist_ok=True)

for name in ['part0.pak', 'part1.pak', 'part2.pak', 'part3.pak']:
    p = os.path.join(mb2_dir, name)
    with open(p, 'rb') as f:
        data = f.read()
    
    pos = 0
    bmp_idx = 0
    while True:
        pos = data.find(b'BM', pos)
        if pos == -1:
            break
        # Check if valid BMP header
        if pos + 14 < len(data):
            file_size, reserved, data_offset = struct.unpack('<IIH', data[pos+2:pos+12])
            # check DIB header size
            if pos + 18 < len(data):
                dib_size = struct.unpack('<I', data[pos+14:pos+18])[0]
                if dib_size in [40, 108, 124] and 0 < file_size < 1000000 and data_offset < file_size:
                    bmp_data = data[pos:pos+file_size]
                    try:
                        im = Image.open(io.BytesIO(bmp_data))
                        save_name = f"{name}_{bmp_idx:02d}_off_{pos}_{im.size[0]}x{im.size[1]}.png"
                        save_path = os.path.join(out_dir, save_name)
                        im.save(save_path)
                        print(f"Extracted valid BMP: {save_name} (Mode: {im.mode})")
                        bmp_idx += 1
                    except Exception as e:
                        print(f"BMP at {pos} failed PIL parse: {e}")
        pos += 2
