import struct
import zlib
import os

with open('/home/imon/.hermes/cache/documents/doc_f38a2b1ccbd8_metal_bluster_2-255893.sis', 'rb') as f:
    data = f.read()

# Let's search for filenames in unicode/ascii
import re
print("Strings in entire SIS:")
for m in re.finditer(rb'(?:[a-zA-Z0-9_\-\\\.\:]\x00){4,}', data):
    try:
        s = m.group(0).decode('utf-16le')
        print(f"Offset {m.start():7d}: {s}")
    except:
        pass
