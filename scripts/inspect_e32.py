import struct

with open('/home/imon/Extra_SSD/arcade-hub/extracted_sis/MB2/mb2.app', 'rb') as f:
    data = f.read()

# E32 header
# 0x00: Uid1, Uid2, Uid3, UidChecksum
# 0x10: Signature ('EPOC')
# 0x14: Cpu, Checksum
# 0x18: Major, Minor, Build
# 0x20: CodeSize, DataSize, BssSize
# 0x30: CodeBase, DataBase, EntryPoint

sig = data[16:20]
print("Signature:", sig)
code_size, data_size, bss_size = struct.unpack('<III', data[32:44])
entry_pt = struct.unpack('<I', data[48:52])[0]
print(f"CodeSize: {code_size}, DataSize: {data_size}, BssSize: {bss_size}, EntryPoint: {hex(entry_pt)}")
