import re
import struct

with open('/home/imon/Extra_SSD/arcade-hub/extracted_sis/MB2/mb2.app', 'rb') as f:
    data = f.read()

# Search for part0..part3 in mb2.app
matches = [m.start() for m in re.finditer(rb'part[0-9]\.pak', data, re.IGNORECASE)]
print("References to part[0-9].pak in mb2.app:", matches)
for m in matches:
    print(f"At offset 0x{m:x} ({m}):", data[m-16:m+32])
