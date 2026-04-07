from pathlib import Path
import os
import sys


ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

# Ensure deterministic test security config before app import.
os.environ.setdefault("NOIZYVOX_AUTH_ENABLED", "true")
os.environ.setdefault("NOIZYVOX_API_TOKENS", "local-dev-token")
os.environ.setdefault("NOIZYVOX_ADMIN_TOKENS", "local-admin-token")
os.environ.setdefault("NOIZYVOX_ALLOWED_HOSTS", "localhost,127.0.0.1,testserver")
