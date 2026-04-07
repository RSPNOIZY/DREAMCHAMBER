#!/usr/bin/env python3
"""
Auto-add 'Noizy Vista Demo' to Firefox bookmarks on macOS.

• Locates the default Firefox profile
• Adds the bookmark to the Bookmarks Toolbar
• Safe: Creates a backup of the places.sqlite file before modification
"""

import os
import shutil
import sqlite3
from pathlib import Path
from datetime import datetime

BOOKMARK_NAME = "Noizy Vista Demo"
BOOKMARK_URL = "http://localhost:8000/"

# Find Firefox profile directory
profile_base = Path.home() / "Library/Application Support/Firefox/Profiles"
profiles = [p for p in profile_base.iterdir() if p.is_dir() and (p / "places.sqlite").exists()]
if not profiles:
    raise FileNotFoundError("No Firefox profile with places.sqlite found.")
profile = profiles[0]  # Use first profile found
places_db = profile / "places.sqlite"
backup_db = profile / f"places_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.sqlite"
shutil.copy(places_db, backup_db)
print(f"🪣 Backup created: {backup_db}")

conn = sqlite3.connect(places_db)
c = conn.cursor()

# Get Bookmarks Toolbar folder id (type=2, parent=1)
c.execute("SELECT id FROM moz_bookmarks WHERE parent = 1 AND type = 2")
row = c.fetchone()
if not row:
    raise Exception("Bookmarks Toolbar folder not found.")
toolbar_id = row[0]

# Check if bookmark already exists
c.execute("SELECT b.id FROM moz_bookmarks b JOIN moz_places p ON b.fk = p.id WHERE b.parent = ? AND p.url = ?", (toolbar_id, BOOKMARK_URL))
if c.fetchone():
    print(f"✅ Bookmark already exists: {BOOKMARK_URL}")
    conn.close()
    exit(0)

# Insert into moz_places
c.execute("INSERT OR IGNORE INTO moz_places (url, title, rev_host, hidden, typed, frecency) VALUES (?, ?, ?, 0, 0, -1)", (BOOKMARK_URL, BOOKMARK_NAME, BOOKMARK_URL[::-1] + '.'))
c.execute("SELECT id FROM moz_places WHERE url = ?", (BOOKMARK_URL,))
place_id = c.fetchone()[0]

# Insert into moz_bookmarks
now = int(datetime.now().timestamp() * 1000000)
c.execute("INSERT INTO moz_bookmarks (type, fk, parent, position, title, dateAdded, lastModified) VALUES (1, ?, ?, (SELECT MAX(position)+1 FROM moz_bookmarks WHERE parent = ?), ?, ?, ?)", (place_id, toolbar_id, toolbar_id, BOOKMARK_NAME, now, now))
conn.commit()
conn.close()
print(f"🌐 Added bookmark: {BOOKMARK_NAME}")
