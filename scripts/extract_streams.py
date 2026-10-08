import zlib
import os
import struct

with open('/home/imon/.hermes/cache/documents/doc_f38a2b1ccbd8_metal_bluster_2-255893.sis', 'rb') as f:
    data = f.read()

out_dir = '/home/imon/Extra_SSD/arcade-hub/extracted_sis/streams'
os.makedirs(out_dir, exist_ok=True)

# Find all zlib streams
import re
offsets = [m.start() for m in re.finditer(b'\x78[\x01\x9c\xda\x5e]', data)]

idx = 0
for off in offsets:
    try:
        decomp = zlib.decompress(data[off:])
        # find compressed length
        d = zlib.decompressobj()
        res = d.decompress(data[off:])
        comp_len = len(data[off:]) - len(d.unused_data)
        
        fname = f"stream_{idx:02d}_off_{off}_{len(decomp)}b.bin"
        fpath = os.path.join(out_dir, fname)
        with open(fpath, 'wb') as out_f:
            out_f.write(decomp)
        
        # Check magic or header
        header = decomp[:16]
        print(f"[{idx:02d}] Offset {off:7d} | Comp: {comp_len:7d} | Decomp: {len(decomp):7d} | Header: {header}")
        idx += 1
    except Exception:
        pass
