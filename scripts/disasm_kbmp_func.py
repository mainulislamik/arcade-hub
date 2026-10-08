import capstone

with open('/home/imon/Extra_SSD/arcade-hub/extracted_sis/MB2/mb2.app', 'rb') as f:
    data = f.read()

cs = capstone.Cs(capstone.CS_ARCH_ARM, capstone.CS_MODE_THUMB)

# Disassemble from 0x12050 to 0x12150
for inst in cs.disasm(data[0x12050:0x12150], 0x12050):
    print(f"0x{inst.address:04x}:\t{inst.mnemonic}\t{inst.op_str}")
