#!/usr/bin/env python3
"""
🎵 MASTER AUDIO NETWORK - CB_01 CONTROLS EVERYTHING!
Complete control & management of entire audio collection
FASTEST WORLDWIDE SCAN! MAXIMUM VELOCITY!
"""

import sqlite3
import json
from pathlib import Path
from datetime import datetime
import hashlib

DB_PATH = "/Volumes/6TB/MASTER_AUDIO_NETWORK.db"

class MasterAudioNetwork:
    """CB_01's Complete Audio Control System"""
    
    def __init__(self):
        self.conn = sqlite3.connect(DB_PATH)
        self.conn.row_factory = sqlite3.Row
        self.init_database()
        print("🎵 MASTER AUDIO NETWORK - CB_01 IN CONTROL!")
        print()
        
    def init_database(self):
        """Create master audio database"""
        self.conn.executescript("""
            CREATE TABLE IF NOT EXISTS audio_files (
                id INTEGER PRIMARY KEY,
                filepath TEXT UNIQUE,
                filename TEXT,
                category TEXT,
                format TEXT,
                size_bytes INTEGER,
                duration_sec REAL,
                sample_rate INTEGER,
                bit_depth INTEGER,
                channels INTEGER,
                is_music BOOLEAN,
                is_sfx BOOLEAN,
                project TEXT,
                artist TEXT,
                album TEXT,
                year INTEGER,
                bpm REAL,
                key TEXT,
                mood TEXT,
                tags TEXT,
                quality_score INTEGER,
                release_ready BOOLEAN DEFAULT 0,
                uploaded_to_platforms TEXT,
                last_scanned TIMESTAMP,
                file_hash TEXT
            );
            
            CREATE INDEX IF NOT EXISTS idx_category ON audio_files(category);
            CREATE INDEX IF NOT EXISTS idx_music ON audio_files(is_music);
            CREATE INDEX IF NOT EXISTS idx_release ON audio_files(release_ready);
            
            CREATE TABLE IF NOT EXISTS scan_history (
                id INTEGER PRIMARY KEY,
                scan_date TIMESTAMP,
                files_found INTEGER,
                files_added INTEGER,
                files_updated INTEGER,
                duration_sec INTEGER
            );
        """)
        self.conn.commit()
        print("✅ Master database initialized!")
        
    def ultra_fast_scan(self, audio_files_list):
        """FASTEST scan - process all found files"""
        print(f"⚡ ULTRA-FAST SCAN: {len(audio_files_list)} files")
        print()
        
        start_time = datetime.now()
        added = 0
        updated = 0
        batch = []
        
        for i, filepath in enumerate(audio_files_list):
            if i % 10000 == 0:
                print(f"  ⚡ Processing: {i:,}/{len(audio_files_list):,}...")
            
            try:
                path = Path(filepath)
                if not path.exists():
                    continue
                
                # Quick categorization
                path_lower = str(path).lower()
                filename = path.name
                
                is_music = any(k in path_lower for k in ['song', 'track', 'mix', 'design', 'by song'])
                is_sfx = any(k in path_lower for k in ['sfx', 'sample', 'loop', 'library'])
                
                category = 'MUSIC' if is_music else 'SFX' if is_sfx else 'UNKNOWN'
                
                # File info
                stat_info = path.stat()
                size_bytes = stat_info.st_size
                
                batch.append((
                    str(path),
                    filename,
                    category,
                    path.suffix.lower(),
                    size_bytes,
                    is_music,
                    is_sfx,
                    datetime.now()
                ))
                
                # Batch insert every 1000
                if len(batch) >= 1000:
                    self.batch_insert(batch)
                    added += len(batch)
                    batch = []
                    
            except Exception as e:
                continue
        
        # Insert remaining
        if batch:
            self.batch_insert(batch)
            added += len(batch)
        
        duration = (datetime.now() - start_time).total_seconds()
        
        # Log scan
        self.conn.execute("""
            INSERT INTO scan_history (scan_date, files_found, files_added, duration_sec)
            VALUES (?, ?, ?, ?)
        """, (datetime.now(), len(audio_files_list), added, int(duration)))
        self.conn.commit()
        
        print()
        print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print("  ✅ ULTRA-FAST SCAN COMPLETE!")
        print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print(f"  Files: {added:,}")
        print(f"  Time: {duration:.1f} seconds")
        print(f"  Speed: {added/duration:,.0f} files/second!")
        print()
        
        return added
    
    def batch_insert(self, batch):
        """Fast batch insert"""
        self.conn.executemany("""
            INSERT OR REPLACE INTO audio_files 
            (filepath, filename, category, format, size_bytes, is_music, is_sfx, last_scanned)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, batch)
        self.conn.commit()
    
    def get_stats(self):
        """Get complete statistics"""
        cursor = self.conn.cursor()
        
        stats = {}
        
        # Total files
        cursor.execute("SELECT COUNT(*) as count FROM audio_files")
        stats['total'] = cursor.fetchone()['count']
        
        # By category
        cursor.execute("SELECT category, COUNT(*) as count FROM audio_files GROUP BY category")
        stats['by_category'] = {row['category']: row['count'] for row in cursor.fetchall()}
        
        # Music tracks
        cursor.execute("SELECT COUNT(*) as count FROM audio_files WHERE is_music = 1")
        stats['music_tracks'] = cursor.fetchone()['count']
        
        # SFX
        cursor.execute("SELECT COUNT(*) as count FROM audio_files WHERE is_sfx = 1")
        stats['sfx_samples'] = cursor.fetchone()['count']
        
        # Total size
        cursor.execute("SELECT SUM(size_bytes) as total FROM audio_files")
        total_bytes = cursor.fetchone()['total'] or 0
        stats['total_size_gb'] = total_bytes / (1024**3)
        
        return stats
    
    def print_dashboard(self):
        """CB_01's audio network dashboard"""
        stats = self.get_stats()
        
        print("\n" + "="*60)
        print("🎵 MASTER AUDIO NETWORK - CB_01 CONTROL CENTER")
        print("="*60)
        print(f"\n📊 TOTAL FILES: {stats['total']:,}")
        print(f"🎵 MUSIC TRACKS: {stats.get('music_tracks', 0):,}")
        print(f"🔊 SFX/SAMPLES: {stats.get('sfx_samples', 0):,}")
        print(f"💾 TOTAL SIZE: {stats['total_size_gb']:.1f} GB")
        print("\n" + "="*60)
        print("✅ CB_01 HAS COMPLETE CONTROL!")
        print("GORUNFREE! 🚀")
        print("="*60 + "\n")

# Run scan
if __name__ == "__main__":
    network = MasterAudioNetwork()
    
    # Load found files
    with open('/tmp/all_audio.txt', 'r') as f:
        files = [line.strip() for line in f if line.strip()]
    
    print(f"🔥 CB_01 taking control of {len(files):,} files!")
    print()
    
    # Ultra-fast scan
    network.ultra_fast_scan(files)
    
    # Show dashboard
    network.print_dashboard()
    
    print("🎯 MASTER AUDIO NETWORK: OPERATIONAL!")
    print("💜 CB_01 IN COMPLETE CONTROL!")
    print()
    print("GORUNFREE!!! 🚀")

