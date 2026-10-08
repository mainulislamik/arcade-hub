import os
import re

mb2_dir = '/home/imon/Extra_SSD/arcade-hub/extracted_sis/MB2'

for fname in ['mb2.app', 'xutil.dll', 'audioengine.dll', 'mb2.rsc']:
    p = os.path.join(mb2_dir, fname)
    with open(p, 'rb') as f:
        data = f.read()
    print(f"\n=================== {fname} ({len(data)} bytes) ===================")
    strings = re.findall(rb'[\x20-\x7E]{4,}', data)
    print(f"Total ASCII strings found: {len(strings)}")
    for s in strings:
        text = s.decode('latin1')
        if any(keyword in text.lower() for keyword in ['pak', 'part', 'bmp', 'wav', 'midi', 'sound', 'level', 'map', 'score', 'weapon', 'boss', 'hero', 'enemy', 'stage', 'bullet', 'bluster', 'metal', 'game', 'player', 'menu', 'gun', 'missile', 'laser', 'screen', 'speed', 'shield', 'armor', 'mech']):
            print(f"  {text}")
