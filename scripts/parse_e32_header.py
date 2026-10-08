import struct

with open('/home/imon/Extra_SSD/arcade-hub/extracted_sis/MB2/mb2.app', 'rb') as f:
    data = f.read()

epoc_pos = data.find(b'EPOC')
print(f"'EPOC' signature at: {epoc_pos}")

if epoc_pos != -1:
    h = data[epoc_pos-16:]
    # E32ImageHeader
    # 0: uid1, uid2, uid3, uid_chk
    # 16: 'EPOC'
    # 20: cpu, chk
    # 24: major, minor, build
    # 28: time_lo, time_hi
    # 36: flags (compressed?)
    # 40: code_size, data_size, bss_size
    # 52: entry_pt, code_base, data_base
    # 64: dll_ref_table_count
    # 68: export_dir_offset, export_dir_count
    # 76: text_size
    # 80: code_offset, data_offset
    # 88: import_offset
    flags = struct.unpack('<I', h[36:40])[0]
    code_size, data_size, bss_size = struct.unpack('<III', h[40:52])
    entry_pt, code_base, data_base = struct.unpack('<III', h[52:64])
    code_offset, data_offset = struct.unpack('<II', h[80:88])
    print(f"Flags: {hex(flags)}")
    print(f"CodeSize: {code_size}, DataSize: {data_size}, BssSize: {bss_size}")
    print(f"EntryPoint: {hex(entry_pt)}, CodeBase: {hex(code_base)}, DataBase: {hex(data_base)}")
    print(f"CodeOffset: {code_offset}, DataOffset: {data_offset}")
