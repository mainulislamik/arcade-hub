import os
import struct
import re

mb2_dir = '/home/imon/Extra_SSD/arcade-hub/extracted_sis/MB2'

for pak_name in ['part0.pak', 'part1.pak', 'part2.pak', 'part3.pak']:
    p = os.path.join(mb2_dir, pak_name)
    with open(p, 'rb') as f:
        data = f.read()
    
    # Check for magic signatures
    kbmps = [m.start() for m in re.finditer(b'KBmP', data)]
    bmps = [m.start() for m in re.finditer(b'BM', data)]
    wavs = [m.start() for m in re.finditer(b'RIFF', data)]
    mids = [m.start() for m in re.finditer(b'MThd', data)]
    oggs = [m.start() for m in re.finditer(b'OggS', data)]
    
    print(f"--- {pak_name} ({len(data)}b) ---")
    print(f"  KBmP count: {len(kbmps)} at {kbmps[:5]}")
    print(f"  BMP count: {len(bmps)} at {bmps[:5]}")
    print(f"  RIFF count: {len(wavs)} at {wavs[:5]}")
    print(f"  MIDI count: {len(mids)} at {mids[:5]}")
    print(f"  OGG count: {len(oggs)} at {oggs[:5]}")

    # Let's check the header structure of the PAK
    # Many pak files start with: count (uint32 or uint16), followed by offsets
    first_words = struct.unpack('<8I', data[:32])
    print(f"  First 8 uint32: {[hex(x) for x in first_words]}")
