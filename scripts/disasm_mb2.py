import os
import capstone
import struct

mb2_app = '/home/imon/Extra_SSD/arcade-hub/extracted_sis/MB2/mb2.app'
with open(mb2_app, 'rb') as f:
    data = f.read()

# Let's find code section
# EPOC E32 header:
# CodeSize at offset 0x20
code_size, data_size, bss_size = struct.unpack('<III', data[0x20:0x2c])
# Header size for E32ImageHeader is typically 0x40 or 0x44
# In ARM, code starts around 0x40 or 0x44 or 0x100
print(f"Header: {data[:16]}")
# Let's inspect where functions are
cs = capstone.Cs(capstone.CS_ARCH_ARM, capstone.CS_MODE_ARM)

# Disassemble first 50 instructions starting at offset 0x40
for inst in cs.disasm(data[0x44:0x44+200], 0x44):
    print(f"0x{inst.address:x}:\t{inst.mnemonic}\t{inst.op_str}")
