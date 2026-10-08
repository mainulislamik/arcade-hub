import os
import struct

mb2_dir = '/home/imon/Extra_SSD/arcade-hub/extracted_sis/MB2'

for pak in ['part0.pak', 'part1.pak', 'part2.pak', 'part3.pak']:
    p = os.path.join(mb2_dir, pak)
    with open(p, 'rb') as f:
        data = f.read()
    print(f"\n--- {pak} ({len(data)} bytes) ---")
    print("Header hex:", data[:64].hex())
    print("Header ascii:", ''.join(chr(b) if 32 <= b <= 126 else '.' for b in data[:64]))
    
    # Check if there is an index table or strings
    import re
    strings = re.findall(rb'[a-zA-Z0-9_\-\.]{4,}', data[:2048])
    print("Strings in first 2KB:", [s.decode('latin1') for s in strings])
