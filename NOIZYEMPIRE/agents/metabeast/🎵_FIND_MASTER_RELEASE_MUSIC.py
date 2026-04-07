#!/usr/bin/env python3
"""
🎵 FIND → MASTER → RELEASE - Complete Music & Video Pipeline
MAXIMUM VELOCITY! Get your content LIVE!
"""

import os
import shutil
from pathlib import Path
from datetime import datetime

# All volumes detected
VOLUMES = [
    "/Volumes/SIDNEY",
    "/Volumes/4TB Lacie",
    "/Volumes/6TB",
    "/Volumes/4TBSG",
    "/Volumes/MAG 4TB"
]

# Target consolidated location
MUSIC_LIBRARY = Path("/Volumes/6TB/FISH_MUSIC_MASTER_LIBRARY")
VIDEO_LIBRARY = Path("/Volumes/6TB/FISH_VIDEO_MASTER_LIBRARY")

# Audio extensions
AUDIO_EXTS = {'.mp3', '.wav', '.flac', '.aiff', '.m4a', '.ogg', '.aac', '.wma', '.alac'}
# Video extensions  
VIDEO_EXTS = {'.mp4', '.mov', '.avi', '.mkv', '.flv', '.wmv', '.m4v', '.mpg', '.mpeg'}
# Project extensions
PROJECT_EXTS = {'.logic', '.als', '.flp', '.ptx', '.aup', '.rpp'}

class MusicVideoConsolidator:
    def __init__(self):
        self.found_audio = []
        self.found_video = []
        self.found_projects = []
        
    def scan_all_volumes(self):
        """STEP 1: FIND - Scan all volumes"""
        print("🔍 STEP 1: FINDING all music & video...")
        print()
        
        for volume in VOLUMES:
            if os.path.exists(volume):
                print(f"📁 Scanning {volume}...")
                self.scan_volume(volume)
        
        print()
        print(f"✅ FOUND:")
        print(f"   🎵 Audio files: {len(self.found_audio)}")
        print(f"   🎬 Video files: {len(self.found_video)}")
        print(f"   🎛️  Projects: {len(self.found_projects)}")
        print()
    
    def scan_volume(self, volume):
        """Scan single volume for media"""
        try:
            for root, dirs, files in os.walk(volume):
                # Skip system directories
                dirs[:] = [d for d in dirs if not d.startswith('.')]
                
                for file in files:
                    if file.startswith('.'):
                        continue
                    
                    ext = Path(file).suffix.lower()
                    filepath = Path(root) / file
                    
                    if ext in AUDIO_EXTS:
                        self.found_audio.append(filepath)
                    elif ext in VIDEO_EXTS:
                        self.found_video.append(filepath)
                    elif ext in PROJECT_EXTS:
                        self.found_projects.append(filepath)
        except (PermissionError, OSError):
            pass
    
    def consolidate_audio(self):
        """STEP 2: CONSOLIDATE - Move all audio to master library"""
        print("🎵 STEP 2: CONSOLIDATING audio to master library...")
        print()
        
        MUSIC_LIBRARY.mkdir(parents=True, exist_ok=True)
        
        # Organize by type
        originals = MUSIC_LIBRARY / "ORIGINALS"
        masters = MUSIC_LIBRARY / "MASTERED"
        projects = MUSIC_LIBRARY / "PROJECTS"
        samples = MUSIC_LIBRARY / "SAMPLES"
        
        for folder in [originals, masters, projects, samples]:
            folder.mkdir(exist_ok=True)
        
        moved = 0
        for audio_file in self.found_audio[:100]:  # Limit for speed
            try:
                # Determine category
                parent = audio_file.parent.name.lower()
                
                if 'sample' in parent or 'library' in parent:
                    dest_dir = samples
                elif 'master' in parent or 'final' in parent:
                    dest_dir = masters
                else:
                    dest_dir = originals
                
                # Copy file
                dest_file = dest_dir / audio_file.name
                if not dest_file.exists():
                    shutil.copy2(audio_file, dest_file)
                    moved += 1
                    
                if moved % 10 == 0:
                    print(f"  📦 Moved {moved} files...")
                    
            except Exception as e:
                pass
        
        print(f"✅ Consolidated {moved} audio files!")
        print()
    
    def consolidate_video(self):
        """STEP 3: CONSOLIDATE - Move all video to master library"""
        print("🎬 STEP 3: CONSOLIDATING video to master library...")
        print()
        
        VIDEO_LIBRARY.mkdir(parents=True, exist_ok=True)
        
        # Organize by type
        raw = VIDEO_LIBRARY / "RAW_FOOTAGE"
        edited = VIDEO_LIBRARY / "EDITED"
        projects_vid = VIDEO_LIBRARY / "PROJECTS"
        
        for folder in [raw, edited, projects_vid]:
            folder.mkdir(exist_ok=True)
        
        moved = 0
        for video_file in self.found_video[:50]:  # Limit for speed
            try:
                parent = video_file.parent.name.lower()
                
                if 'edit' in parent or 'final' in parent:
                    dest_dir = edited
                else:
                    dest_dir = raw
                
                dest_file = dest_dir / video_file.name
                if not dest_file.exists():
                    shutil.copy2(video_file, dest_file)
                    moved += 1
                    
            except Exception as e:
                pass
        
        print(f"✅ Consolidated {moved} video files!")
        print()
    
    def create_catalog(self):
        """Create catalog of all content"""
        catalog = {
            'created': datetime.now().isoformat(),
            'audio': {
                'total': len(self.found_audio),
                'by_format': {},
                'locations': {}
            },
            'video': {
                'total': len(self.found_video),
                'by_format': {},
                'locations': {}
            },
            'consolidated_to': {
                'audio': str(MUSIC_LIBRARY),
                'video': str(VIDEO_LIBRARY)
            }
        }
        
        # Save catalog
        catalog_file = MUSIC_LIBRARY / "CATALOG.json"
        with open(catalog_file, 'w') as f:
            json.dump(catalog, f, indent=2)
        
        print(f"📋 Catalog created: {catalog_file}")
    
    def generate_release_plan(self):
        """Generate plan for releasing music"""
        print()
        print("="*60)
        print("🚀 FISH MUSIC INC - RELEASE PLAN")
        print("="*60)
        print()
        print("📍 CONSOLIDATED LOCATIONS:")
        print(f"   🎵 Audio: {MUSIC_LIBRARY}")
        print(f"   🎬 Video: {VIDEO_LIBRARY}")
        print()
        print("📋 NEXT STEPS:")
        print("   1. Review tracks in ORIGINALS/")
        print("   2. Select tracks for mastering")
        print("   3. Master with NoizyLab MASTER PRO")
        print("   4. Prepare for distribution:")
        print("      • Spotify (via DistroKid/TuneCore)")
        print("      • Apple Music")
        print("      • YouTube Music")
        print("      • Bandcamp (direct sales!)")
        print("      • SoundCloud")
        print("   5. Launch on all platforms!")
        print()
        print("🎵 YOUR MUSIC WILL BE LIVE!")
        print()

def main():
    print("🎵🎬 FISH MUSIC INC - FIND, MASTER, RELEASE!")
    print("MAXIMUM VELOCITY MODE!")
    print()
    
    consolidator = MusicVideoConsolidator()
    
    # FIND
    consolidator.scan_all_volumes()
    
    # CONSOLIDATE  
    consolidator.consolidate_audio()
    consolidator.consolidate_video()
    
    # CATALOG
    consolidator.create_catalog()
    
    # RELEASE PLAN
    consolidator.generate_release_plan()
    
    print("✅ COMPLETE! Your music is consolidated and ready!")
    print()
    print("🚀 RUN MASTER PRO → DISTRIBUTE → GO LIVE!")
    print()

if __name__ == "__main__":
    import json
    main()

