import re

with open('/home/imon/Extra_SSD/arcade-hub/extracted_sis/MB2/mb2.app', 'rb') as f:
    data = f.read()

# Dump all printable strings > 3 chars
strings = re.findall(rb'[\x20-\x7E]{3,}', data)
print(f"Total ASCII strings: {len(strings)}")

for s in strings:
    text = s.decode('latin1')
    if len(text) >= 4 and not text.startswith('___'):
        print(text)
