import os
import shutil

# Paths
USERNAME = "rsp_ms"
ASSET_DIR = f"/Users/{USERNAME}/NOIZYWIN_ASSETS"
BUILD_DIR = f"/Users/{USERNAME}/NOIZYWIN_BUILD"
OEM_PATH = os.path.join(BUILD_DIR, "sources", "$OEM$", "$1")

def inject_assets():
    os.makedirs(OEM_PATH, exist_ok=True)
    for file in os.listdir(ASSET_DIR):
        src = os.path.join(ASSET_DIR, file)
        dst = os.path.join(OEM_PATH, file)
        shutil.copy(src, dst)
        print(f"✅ Moved {file} → {OEM_PATH}")
    print("🔮 All NOIZYWIN assets injected into ISO build directory.")
