#!/usr/bin/env python3
"""
╔════════════════════════════════════════════════════════════════════════════════╗
║                                                                                ║
║  🔍 GABRIEL DEEP METADATA SCANNER & LIBRARY ORGANIZER                         ║
║                                                                                ║
║  Advanced intelligent library organization with:                              ║
║  • Deep metadata extraction (BPM, Key, Resolution, etc.)                      ║
║  • Smart categorization by multiple attributes                                ║
║  • Symlink-based multi-access organization                                    ║
║  • JSON metadata database for quick search                                    ║
║                                                                                ║
╚════════════════════════════════════════════════════════════════════════════════╝
"""

import json
import re
from pathlib import Path
from typing import Dict, List, Optional, Set
from collections import defaultdict
import time

class DeepMetadataScanner:
    """Advanced metadata extraction and library organization"""
    
    def __init__(self):
        self.audio_exts = {'.wav', '.mp3', '.aif', '.aiff', '.flac', '.m4a', '.ogg', '.aac'}
        self.video_exts = {'.mp4', '.mkv', '.avi', '.mov', '.m4v', '.wmv', '.flv', '.webm'}
        self.image_exts = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp'}
        
        # Metadata patterns
        self.bpm_pattern = re.compile(r'(\d{2,3})\s*bpm', re.IGNORECASE)
        self.key_pattern = re.compile(r'\b([A-G][#b]?)\s*(maj|min|major|minor)?\b', re.IGNORECASE)
        self.resolution_pattern = re.compile(r'(\d{3,4})[xX\*](\d{3,4})')
        self.season_pattern = re.compile(r'[Ss](\d{1,2})[Ee](\d{1,2})')
        
        # Instrument keywords
        self.instruments = {
            'Drums': ['kick', 'snare', 'hat', 'cymbal', 'tom', 'drum', 'percussion'],
            'Bass': ['bass', 'sub', '808', '909'],
            'Synths': ['synth', 'pad', 'lead', 'pluck', 'arp'],
            'Guitar': ['guitar', 'gtr', 'strum', 'pick'],
            'Piano': ['piano', 'keys', 'keyboard'],
            'Strings': ['violin', 'cello', 'strings', 'orchestra'],
            'Brass': ['trumpet', 'horn', 'trombone', 'brass'],
            'Vocals': ['vox', 'vocal', 'voice', 'acapella'],
            'FX': ['fx', 'riser', 'impact', 'sweep', 'whoosh']
        }
        
        # Producer/vendor detection
        self.vendors = [
            '8dio', 'kontakt', 'omnisphere', 'serum', 'massive',
            'spitfire', 'native', 'arturia', 'spectrasonics'
        ]
        
    def extract_audio_metadata(self, file_path: Path) -> Dict:
        """Extract metadata from audio files"""
        metadata = {
            'path': str(file_path),
            'name': file_path.name,
            'size_mb': file_path.stat().st_size / (1024*1024),
            'extension': file_path.suffix.lower(),
            'type': 'audio'
        }
        
        name_lower = file_path.name.lower()
        parent_lower = file_path.parent.name.lower()
        
        # Extract BPM
        bpm_match = self.bpm_pattern.search(name_lower)
        if bpm_match:
            metadata['bpm'] = int(bpm_match.group(1))
        
        # Extract musical key
        key_match = self.key_pattern.search(file_path.name)
        if key_match:
            key = key_match.group(1).upper()
            scale = key_match.group(2)
            if scale and scale.lower().startswith('min'):
                metadata['key'] = f"{key}_Minor"
            else:
                metadata['key'] = f"{key}_Major"
        
        # Detect instrument type
        for instrument, keywords in self.instruments.items():
            if any(kw in name_lower or kw in parent_lower for kw in keywords):
                metadata['instrument'] = instrument
                break
        
        # Detect vendor/producer
        for vendor in self.vendors:
            if vendor in name_lower or vendor in parent_lower:
                metadata['vendor'] = vendor.title()
                break
        
        # Detect sample type
        if 'loop' in name_lower:
            metadata['sample_type'] = 'Loop'
        elif 'one' in name_lower and 'shot' in name_lower:
            metadata['sample_type'] = 'One-Shot'
        elif 'midi' in name_lower:
            metadata['sample_type'] = 'MIDI'
        
        return metadata
    
    def extract_video_metadata(self, file_path: Path) -> Dict:
        """Extract metadata from video files"""
        metadata = {
            'path': str(file_path),
            'name': file_path.name,
            'size_mb': file_path.stat().st_size / (1024*1024),
            'extension': file_path.suffix.lower(),
            'type': 'video'
        }
        
        name = file_path.name
        parent = file_path.parent.name
        
        # Extract season/episode
        se_match = self.season_pattern.search(name)
        if se_match:
            metadata['season'] = int(se_match.group(1))
            metadata['episode'] = int(se_match.group(2))
        
        # Extract show name (usually the parent folder)
        metadata['show'] = parent
        
        # Extract year
        year_match = re.search(r'(19|20)\d{2}', name)
        if year_match:
            metadata['year'] = int(year_match.group(0))
        
        # Detect resolution
        if '4k' in name.lower() or '2160' in name:
            metadata['resolution'] = '4K'
        elif '1080' in name or 'hd' in name.lower():
            metadata['resolution'] = '1080p'
        elif '720' in name:
            metadata['resolution'] = '720p'
        
        return metadata
    
    def extract_image_metadata(self, file_path: Path) -> Dict:
        """Extract metadata from image files"""
        metadata = {
            'path': str(file_path),
            'name': file_path.name,
            'size_mb': file_path.stat().st_size / (1024*1024),
            'extension': file_path.suffix.lower(),
            'type': 'image'
        }
        
        name_lower = file_path.name.lower()
        parent_lower = file_path.parent.name.lower()
        
        # Detect resolution/quality
        if '8k' in name_lower or '8k' in parent_lower:
            metadata['resolution'] = '8K'
        elif '4k' in name_lower or '4k' in parent_lower or 'ultra hd' in parent_lower:
            metadata['resolution'] = '4K'
        elif 'fhd' in name_lower or 'fhd' in parent_lower:
            metadata['resolution'] = 'FHD'
        
        # Detect theme
        themes = {
            'Nature': ['nature', 'landscape', 'mountain', 'ocean', 'forest'],
            'Abstract': ['abstract', 'artistic', 'art'],
            'Space': ['space', 'galaxy', 'nebula', 'cosmos'],
            'Urban': ['city', 'urban', 'architecture']
        }
        
        for theme, keywords in themes.items():
            if any(kw in name_lower or kw in parent_lower for kw in keywords):
                metadata['theme'] = theme
                break
        
        return metadata
    
    def scan_library(self, base_path: Path) -> Dict:
        """Deep scan entire library and extract metadata"""
        print(f"\n🔍 Deep scanning: {base_path}")
        print("=" * 70)
        
        results = {
            'audio': [],
            'video': [],
            'images': [],
            'stats': defaultdict(int)
        }
        
        start_time = time.time()
        files_processed = 0
        
        for file_path in base_path.rglob('*'):
            if not file_path.is_file():
                continue
            
            ext = file_path.suffix.lower()
            
            try:
                if ext in self.audio_exts:
                    metadata = self.extract_audio_metadata(file_path)
                    results['audio'].append(metadata)
                    results['stats']['audio_count'] += 1
                    
                elif ext in self.video_exts:
                    metadata = self.extract_video_metadata(file_path)
                    results['video'].append(metadata)
                    results['stats']['video_count'] += 1
                    
                elif ext in self.image_exts:
                    metadata = self.extract_image_metadata(file_path)
                    results['images'].append(metadata)
                    results['stats']['image_count'] += 1
                
                files_processed += 1
                
                if files_processed % 1000 == 0:
                    print(f"  📊 Processed {files_processed:,} files...")
                    
            except Exception as e:
                print(f"  ⚠️  Error processing {file_path.name}: {e}")
        
        elapsed = time.time() - start_time
        results['stats']['scan_time'] = elapsed
        results['stats']['total_files'] = files_processed
        
        print(f"\n✅ Scan complete: {files_processed:,} files in {elapsed:.1f}s")
        
        return results
    
    def create_smart_libraries(self, metadata: Dict, output_base: Path):
        """Create organized libraries with symlinks based on metadata"""
        print(f"\n🎯 Creating smart libraries at: {output_base}")
        print("=" * 70)
        
        output_base.mkdir(parents=True, exist_ok=True)
        
        stats = {
            'symlinks_created': 0,
            'categories': 0
        }
        
        # 1. Audio Library Organization
        if metadata['audio']:
            print("\n🎵 Organizing Audio Library...")
            audio_base = output_base / 'AUDIO_LIBRARY'
            
            # By Instrument
            by_instrument = audio_base / '01_By_Instrument'
            by_instrument.mkdir(parents=True, exist_ok=True)
            
            for item in metadata['audio']:
                if 'instrument' in item:
                    inst_dir = by_instrument / item['instrument']
                    inst_dir.mkdir(exist_ok=True)
                    
                    link_path = inst_dir / Path(item['path']).name
                    if not link_path.exists():
                        try:
                            link_path.symlink_to(item['path'])
                            stats['symlinks_created'] += 1
                        except:
                            pass
            
            # By BPM
            by_bpm = audio_base / '02_By_BPM'
            by_bpm.mkdir(parents=True, exist_ok=True)
            
            bpm_ranges = {
                '080-100_BPM': (80, 100),
                '100-120_BPM': (100, 120),
                '120-140_BPM': (120, 140),
                '140-160_BPM': (140, 160),
                '160-180_BPM': (160, 180)
            }
            
            for item in metadata['audio']:
                if 'bpm' in item:
                    for range_name, (min_bpm, max_bpm) in bpm_ranges.items():
                        if min_bpm <= item['bpm'] < max_bpm:
                            bpm_dir = by_bpm / range_name
                            bpm_dir.mkdir(exist_ok=True)
                            
                            link_path = bpm_dir / Path(item['path']).name
                            if not link_path.exists():
                                try:
                                    link_path.symlink_to(item['path'])
                                    stats['symlinks_created'] += 1
                                except:
                                    pass
                            break
            
            # By Musical Key
            by_key = audio_base / '03_By_Key'
            by_key.mkdir(parents=True, exist_ok=True)
            
            for item in metadata['audio']:
                if 'key' in item:
                    key_dir = by_key / item['key']
                    key_dir.mkdir(exist_ok=True)
                    
                    link_path = key_dir / Path(item['path']).name
                    if not link_path.exists():
                        try:
                            link_path.symlink_to(item['path'])
                            stats['symlinks_created'] += 1
                        except:
                            pass
            
            # By Vendor
            by_vendor = audio_base / '04_By_Vendor'
            by_vendor.mkdir(parents=True, exist_ok=True)
            
            for item in metadata['audio']:
                if 'vendor' in item:
                    vendor_dir = by_vendor / item['vendor']
                    vendor_dir.mkdir(exist_ok=True)
                    
                    link_path = vendor_dir / Path(item['path']).name
                    if not link_path.exists():
                        try:
                            link_path.symlink_to(item['path'])
                            stats['symlinks_created'] += 1
                        except:
                            pass
            
            print(f"  ✅ Audio library organized")
        
        # 2. Video Library Organization
        if metadata['video']:
            print("\n🎬 Organizing Video Library...")
            video_base = output_base / 'VIDEO_LIBRARY'
            
            # By Show
            by_show = video_base / '01_By_Show'
            by_show.mkdir(parents=True, exist_ok=True)
            
            shows = defaultdict(list)
            for item in metadata['video']:
                show = item.get('show', 'Unknown')
                shows[show].append(item)
            
            for show, items in shows.items():
                show_dir = by_show / show
                show_dir.mkdir(exist_ok=True)
                
                for item in items:
                    link_path = show_dir / Path(item['path']).name
                    if not link_path.exists():
                        try:
                            link_path.symlink_to(item['path'])
                            stats['symlinks_created'] += 1
                        except:
                            pass
            
            # By Resolution
            by_res = video_base / '02_By_Resolution'
            by_res.mkdir(parents=True, exist_ok=True)
            
            for item in metadata['video']:
                if 'resolution' in item:
                    res_dir = by_res / item['resolution']
                    res_dir.mkdir(exist_ok=True)
                    
                    link_path = res_dir / Path(item['path']).name
                    if not link_path.exists():
                        try:
                            link_path.symlink_to(item['path'])
                            stats['symlinks_created'] += 1
                        except:
                            pass
            
            print(f"  ✅ Video library organized")
        
        # 3. Image Library Organization
        if metadata['images']:
            print("\n🖼️  Organizing Image Library...")
            image_base = output_base / 'IMAGE_LIBRARY'
            
            # By Resolution
            by_res = image_base / '01_By_Resolution'
            by_res.mkdir(parents=True, exist_ok=True)
            
            for item in metadata['images']:
                if 'resolution' in item:
                    res_dir = by_res / item['resolution']
                    res_dir.mkdir(exist_ok=True)
                    
                    link_path = res_dir / Path(item['path']).name
                    if not link_path.exists():
                        try:
                            link_path.symlink_to(item['path'])
                            stats['symlinks_created'] += 1
                        except:
                            pass
            
            # By Theme
            by_theme = image_base / '02_By_Theme'
            by_theme.mkdir(parents=True, exist_ok=True)
            
            for item in metadata['images']:
                if 'theme' in item:
                    theme_dir = by_theme / item['theme']
                    theme_dir.mkdir(exist_ok=True)
                    
                    link_path = theme_dir / Path(item['path']).name
                    if not link_path.exists():
                        try:
                            link_path.symlink_to(item['path'])
                            stats['symlinks_created'] += 1
                        except:
                            pass
            
            print(f"  ✅ Image library organized")
        
        return stats
    
    def save_metadata_database(self, metadata: Dict, output_path: Path):
        """Save metadata to JSON database"""
        print(f"\n💾 Saving metadata database...")
        
        db_path = output_path / 'metadata_database.json'
        
        with open(db_path, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        size_mb = db_path.stat().st_size / (1024*1024)
        print(f"  ✅ Database saved: {db_path.name} ({size_mb:.2f} MB)")
        
        return db_path

def main():
    print("╔════════════════════════════════════════════════════════════════════╗")
    print("║  🔍 GABRIEL DEEP METADATA SCANNER & ORGANIZER                      ║")
    print("╚════════════════════════════════════════════════════════════════════╝")
    
    scanner = DeepMetadataScanner()
    
    # Configuration
    source_path = Path('/Volumes/12TB 1/MEDIA_LIBRARY')
    output_path = Path('/Volumes/12TB 1/SMART_LIBRARIES')
    
    print(f"\n📁 Source: {source_path}")
    print(f"📁 Output: {output_path}")
    
    if not source_path.exists():
        print(f"\n❌ Error: Source path not found!")
        return
    
    print("\n" + "=" * 70)
    input("Press ENTER to start deep metadata scan...")
    
    # Phase 1: Deep Scan
    print("\n" + "=" * 70)
    print("PHASE 1: DEEP METADATA EXTRACTION")
    print("=" * 70)
    
    metadata = scanner.scan_library(source_path)
    
    # Show statistics
    print("\n📊 SCAN RESULTS:")
    print("=" * 70)
    print(f"🎵 Audio files: {metadata['stats']['audio_count']:,}")
    print(f"🎬 Video files: {metadata['stats']['video_count']:,}")
    print(f"🖼️  Images: {metadata['stats']['image_count']:,}")
    print(f"📁 Total: {metadata['stats']['total_files']:,}")
    print(f"⏱️  Time: {metadata['stats']['scan_time']:.1f} seconds")
    
    # Phase 2: Create Smart Libraries
    print("\n" + "=" * 70)
    print("PHASE 2: CREATING SMART LIBRARIES")
    print("=" * 70)
    
    lib_stats = scanner.create_smart_libraries(metadata, output_path)
    
    # Phase 3: Save Database
    print("\n" + "=" * 70)
    print("PHASE 3: SAVING METADATA DATABASE")
    print("=" * 70)
    
    db_path = scanner.save_metadata_database(metadata, output_path)
    
    # Final Summary
    print("\n" + "=" * 70)
    print("🎉 DEEP METADATA SCAN COMPLETE!")
    print("=" * 70)
    
    print(f"\n📊 Summary:")
    print(f"  • Files scanned: {metadata['stats']['total_files']:,}")
    print(f"  • Symlinks created: {lib_stats['symlinks_created']:,}")
    print(f"  • Metadata database: {db_path}")
    
    print(f"\n📁 Smart Libraries created at:")
    print(f"   {output_path}")
    
    print(f"\n🎯 Access your organized content:")
    print(f"   • Audio by Instrument/BPM/Key/Vendor")
    print(f"   • Video by Show/Resolution")
    print(f"   • Images by Resolution/Theme")
    
    print(f"\n✨ All done! Your media is now intelligently organized!")

if __name__ == "__main__":
    main()
