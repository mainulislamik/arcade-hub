with open('/home/imon/Extra_SSD/arcade-hub/extracted_sis/MB2/mb2.app', 'rb') as f:
    data = f.read()

import re
matches = [m.start() for m in re.finditer(rb'KBmP', data)]
print("KBmP matches in mb2.app:", [hex(m) for m in matches])
for m in matches:
    print(f"Around 0x{m:x}:", data[m-16:m+32])
