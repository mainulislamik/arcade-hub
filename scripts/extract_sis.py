import struct
import os

SIS_PATH = "/home/imon/.hermes/cache/documents/doc_f38a2b1ccbd8_metal_bluster_2-255893.sis"
OUT_DIR = "/home/imon/Extra_SSD/arcade-hub/extracted_sis"
os.makedirs(OUT_DIR, exist_ok=True)

with open(SIS_PATH, "rb") as f:
    data = f.read()

# Symbian SIS v1/v2 header parsing
# UID1 (4), UID2 (4), UID3 (4), UID4 (4), checksum (2), num_languages (2), num_files (2), num_req (2), lang (2), flags (2), ...
uid1, uid2, uid3, uid4, chk, n_lang, n_files, n_req, lang, inst_type, flags = struct.unpack_from("<4I7H", data, 0)
print(f"UIDs: {hex(uid1)}, {hex(uid2)}, {hex(uid3)}, {hex(uid4)}")
print(f"Files: {n_files}, Languages: {n_lang}, Requirements: {n_req}")

# SIS v1 structure:
# Header is 0x2C bytes
# Pointers table follows:
# - app name ptr (4)
# - language ptr (4)
# - files ptr (4)
# - requirements ptr (4)
# - certificates ptr (4)
# - component name ptr (4)
header_ptrs = struct.unpack_from("<6I", data, 28)
print("Header pointers:", [hex(p) for p in header_ptrs])

# Let's inspect the file list pointer
files_ptr = header_ptrs[2]
print(f"Files pointer at {hex(files_ptr)}")

# Each file record in SIS v1 has:
# - file_type (4)
# - file_details (4)
# - source_name_ptr (4)
# - dest_name_ptr (4)
# - file_length (4)
# - file_offset (4)
# - capabilities (4)
curr = files_ptr
for i in range(n_files):
    f_type, f_details, src_ptr, dest_ptr, f_len, f_off = struct.unpack_from("<6I", data, curr)
    
    # Read src and dest names
    def read_str(ptr):
        if ptr == 0 or ptr >= len(data): return ""
        length = struct.unpack_from("<I", data, ptr)[0]
        # In SIS string can be ASCII or unicode (2 bytes per char)
        try:
            raw = data[ptr+4:ptr+4+length*2]
            return raw.decode('utf-16-le', errors='ignore')
        except:
            return data[ptr+4:ptr+4+length].decode('ascii', errors='ignore')

    src_name = read_str(src_ptr)
    dest_name = read_str(dest_ptr)
    print(f"File {i+1}: dest='{dest_name}', src='{src_name}', len={f_len}, off={hex(f_off)}")
    
    # Extract file
    if f_off > 0 and f_len > 0 and f_off + f_len <= len(data):
        file_bytes = data[f_off:f_off+f_len]
        clean_name = os.path.basename(dest_name.replace('\\', '/'))
        if not clean_name: clean_name = f"file_{i+1}.bin"
        out_path = os.path.join(OUT_DIR, clean_name)
        with open(out_path, "wb") as out_f:
            out_f.write(file_bytes)
        print(f"  -> Extracted to {out_path} ({len(file_bytes)} bytes)")
        
    curr += 24
