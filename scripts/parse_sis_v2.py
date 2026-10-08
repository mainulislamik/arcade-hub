import struct
import zlib
import os

with open('/home/imon/.hermes/cache/documents/doc_f38a2b1ccbd8_metal_bluster_2-255893.sis', 'rb') as f:
    data = f.read()

out_dir = '/home/imon/Extra_SSD/arcade-hub/extracted_sis'
os.makedirs(out_dir, exist_ok=True)

# Parse SIS Header (Symbian SIS v1 / S60 v1/v2)
# Offsets:
# 0x00: Uid1, Uid2, Uid3, Uid4 (4x uint32 = 16 bytes)
# 0x10: Checksum (uint16 = 2 bytes)
# 0x12: NumLanguages (uint16 = 2 bytes)
# 0x14: NumFiles (uint16 = 2 bytes)
# 0x16: NumRequisites (uint16 = 2 bytes)
# 0x18: Language (uint16 = 2 bytes)
# 0x1A: FilesOffset (uint32 = 4 bytes)
# 0x1E: RequisitesOffset (uint32 = 4 bytes)
# 0x22: ...

uid1, uid2, uid3, uid4 = struct.unpack('<IIII', data[:16])
checksum, num_lang, num_files, num_req, lang, files_ptr, req_ptr = struct.unpack('<HHHHHII', data[16:36])

print(f"UIDs: {hex(uid1)}, {hex(uid2)}, {hex(uid3)}, {hex(uid4)}")
print(f"Checksum: {checksum}, NumLang: {num_lang}, NumFiles: {num_files}, NumReq: {num_req}, Lang: {lang}")
print(f"FilesPtr: {files_ptr} (0x{files_ptr:x}), ReqPtr: {req_ptr} (0x{req_ptr:x})")

# Let's inspect bytes around files_ptr
pos = files_ptr
print("At files_ptr:", data[pos:pos+64].hex())

for i in range(num_files):
    file_record = data[pos:pos+32]
    # File record: FileType (uint32), DetailsPtr (uint32), SourcePtr (uint32), DestPtr (uint32), ...
    rec = struct.unpack('<IIIIII', data[pos:pos+24])
    print(f"File {i}: {rec}")
    file_type, details_ptr, src_ptr, dest_ptr, file_len, uncompressed_len = rec
    
    # Read name from dest_ptr or details_ptr
    def read_symbian_string(ptr):
        if ptr == 0 or ptr >= len(data):
            return ""
        # In Symbian SIS, strings often have uint32 length followed by chars or null-terminated
        slen = struct.unpack('<I', data[ptr:ptr+4])[0]
        if slen < 512 and ptr+4+slen <= len(data):
            return data[ptr+4:ptr+4+slen].decode('latin1', errors='ignore')
        # try null terminated
        end = data.find(b'\x00', ptr)
        if end != -1 and end - ptr < 256:
            return data[ptr:end].decode('latin1', errors='ignore')
        return ""

    src_name = read_symbian_string(src_ptr)
    dest_name = read_symbian_string(dest_ptr)
    print(f"   Src: '{src_name}', Dest: '{dest_name}', Len: {file_len}, Uncomp: {uncompressed_len}")
    pos += 24
