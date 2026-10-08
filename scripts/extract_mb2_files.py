import zlib
import os

with open('/home/imon/.hermes/cache/documents/doc_f38a2b1ccbd8_metal_bluster_2-255893.sis', 'rb') as f:
    data = f.read()

out_dir = '/home/imon/Extra_SSD/arcade-hub/extracted_sis/MB2'
os.makedirs(out_dir, exist_ok=True)

offsets = [1830, 1929, 45907, 498334, 1397154, 1544594, 1558195, 1563562, 1565020, 1566018, 1669176]
filenames = [
    "ownpda_rulez0.txt",
    "part3.pak",
    "part2.pak",
    "part1.pak",
    "part0.pak",
    "xutil.dll",
    "audioengine.dll",
    "mb2.rsc",
    "mb2.aif",
    "mb2.app",
    "ownpda_rox0.txt"
]

for off, name in zip(offsets, filenames):
    decomp = zlib.decompress(data[off:])
    out_path = os.path.join(out_dir, name)
    with open(out_path, 'wb') as f:
        f.write(decomp)
    print(f"Saved {name:20s} ({len(decomp):7d} bytes)")
