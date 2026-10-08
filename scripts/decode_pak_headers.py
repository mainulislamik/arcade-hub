import os
import struct

mb2_dir = '/home/imon/Extra_SSD/arcade-hub/extracted_sis/MB2'

for name in ['part0.pak', 'part1.pak', 'part2.pak', 'part3.pak']:
    p = os.path.join(mb2_dir, name)
    with open(p, 'rb') as f:
        data = f.read()
    
    # In many Symbian / PocketStudio PAK formats:
    # First 2 or 4 bytes is count or header size.
    # Let's inspect first 100 bytes as uint16 and uint32
    print(f"\n=================== {name} ({len(data)} bytes) ===================")
    u16s = struct.unpack('<30H', data[:60])
    u32s = struct.unpack('<15I', data[:60])
    print("u16s:", u16s)
    print("u32s:", [f"0x{x:x}" for x in u32s])
