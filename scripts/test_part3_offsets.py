import struct

with open('/home/imon/Extra_SSD/arcade-hub/extracted_sis/MB2/part3.pak', 'rb') as f:
    data = f.read()

# Let's inspect the offset table in part3.pak
# Count is 11?
# Offsets:
# 0x0582, 0x0d44, 0x1837, 0x3275, 0x34e9, etc.

offsets = [0x0582, 0x0d44, 0x1837, 0x3275, 0x34e9]
for off in offsets:
    chunk = data[off:off+64]
    print(f"Offset 0x{off:04x} ({off}): len_avail={len(data)-off}")
    print("  Hex:", chunk[:32].hex())
    print("  Ascii:", ''.join(chr(b) if 32 <= b <= 126 else '.' for b in chunk[:32]))
