#!/usr/bin/env python3
"""
╔════════════════════════════════════════════════════════════════════════════════╗
║                                                                                ║
║  🎹 SAMPLE LIBRARY ORGANIZER                                                  ║
║                                                                                ║
║  Intelligent organization of sample libraries by:                             ║
║  • Instrument Type (Drums, Synths, Orchestra, etc.)                           ║
║  • Vendor/Producer                                                            ║
║  • Library Purpose (Cinematic, EDM, Hip-Hop, etc.)                            ║
║                                                                                ║
╚════════════════════════════════════════════════════════════════════════════════╝
"""

from pathlib import Path
from typing import Dict, List
from collections import defaultdict
import shutil
import time

class SampleLibraryOrganizer:
    """Organize sample libraries by instrument type and purpose"""
    
    def __init__(self):
        self.audio_exts = {'.wav', '.mp3', '.aif', '.aiff', '.flac', '.m4a', '.ogg', '.aac'}
        
        # Classification keywords
        self.instrument_keywords = {
            'Drums_Percussion': [
                'drum', 'kick', 'snare', 'hat', 'cymbal', 'tom', 'percussion',
                '808', '909', 'clap', 'rim', 'shaker', 'tambourine'
            ],
            'Synths_Electronic': [
                'synth', 'pad', 'lead', 'pluck', 'arp', 'bass', 'sub',
                'serum', 'massive', 'analog', 'digital', 'fm'
            ],
            'Orchestral_Strings': [
                'orchestra', 'string', 'violin', 'cello', 'brass', 'horn',
                'trumpet', 'trombone', 'woodwind', 'flute', 'clarinet',
                'cinematic', 'epic', 'chamber'
            ],
            'Vocals_Choir': [
                'vocal', 'voice', 'choir', 'acapella', 'vox', 'singer',
                'soprano', 'alto', 'tenor', 'bass'
            ],
            'Guitar_Bass': [
                'guitar', 'gtr', 'acoustic', 'electric', 'bass', 'strum',
                'pick', 'fret', 'amplitube'
            ],
            'Piano_Keys': [
                'piano', 'keyboard', 'keys', 'rhodes', 'wurlitzer', 'organ',
                'grand', 'upright', 'electric piano'
            ],
            'World_Ethnic': [
                'world', 'ethnic', 'african', 'asian', 'latin', 'indian',
                'sitar', 'tabla', 'didgeridoo', 'koto'
            ],
            'FX_Soundscape': [
                'fx', 'sfx', 'riser', 'impact', 'sweep', 'whoosh', 'drone',
                'atmosphere', 'ambient', 'soundscape', 'texture'
            ]
        }
        
        # Vendor detection
        self.known_vendors = [
            '8dio', 'kontakt', 'omnisphere', 'serum', 'massive', 'spitfire',
            'native', 'arturia', 'spectrasonics', 'output', 'heavyocity',
            'audiobro', 'cinesamples', 'soundiron', 'projectsam'
        ]
    
    def analyze_library(self, library_path: Path) -> Dict:
        """Analyze a sample library folder"""
        info = {
            'name': library_path.name,
            'path': str(library_path),
            'type': 'Mixed_Collections',
            'vendor': 'Unknown',
            'audio_files': [],
            'subfolders': []
        }
        
        # Find audio files
        for f in library_path.rglob('*'):
            if f.is_file() and f.suffix.lower() in self.audio_exts:
                info['audio_files'].append(f)
        
        info['file_count'] = len(info['audio_files'])
        
        if info['file_count'] > 0:
            info['size_gb'] = sum(f.stat().st_size for f in info['audio_files']) / (1024**3)
        else:
            info['size_gb'] = 0
        
        # Get subfolder names for analysis
        info['subfolders'] = [d.name.lower() for d in library_path.rglob('*') if d.is_dir()]
        
        # Classify by instrument type
        all_text = ' '.join([library_path.name.lower()] + info['subfolders'])
        
        for inst_type, keywords in self.instrument_keywords.items():
            if any(kw in all_text for kw in keywords):
                info['type'] = inst_type
                break
        
        # Detect vendor
        name_lower = library_path.name.lower()
        for vendor in self.known_vendors:
            if vendor in name_lower:
                info['vendor'] = vendor.title()
                break
        
        return info
    
    def scan_sample_libraries(self, base_path: Path) -> List[Dict]:
        """Scan all sample libraries"""
        print(f"\n🔍 Scanning sample libraries in: {base_path}")
        print("=" * 70)
        
        libraries = []
        
        for folder in sorted(base_path.iterdir()):
            if folder.is_dir() and not folder.name.startswith('.'):
                print(f"  📦 Analyzing: {folder.name}...")
                info = self.analyze_library(folder)
                
                if info['file_count'] > 0:
                    libraries.append(info)
                    print(f"     Type: {info['type']}")
                    print(f"     Files: {info['file_count']:,}")
                    print(f"     Size: {info['size_gb']:.2f} GB")
        
        return libraries
    
    def organize_libraries(self, libraries: List[Dict], output_base: Path):
        """Organize libraries by instrument type"""
        print(f"\n🎯 Organizing libraries into: {output_base}")
        print("=" * 70)
        
        # Group by type
        by_type = defaultdict(list)
        for lib in libraries:
            by_type[lib['type']].append(lib)
        
        stats = {
            'moved': 0,
            'failed': 0,
            'categories': len(by_type)
        }
        
        # Create organized structure
        for inst_type, libs in sorted(by_type.items()):
            type_dir = output_base / f"{inst_type}"
            type_dir.mkdir(parents=True, exist_ok=True)
            
            print(f"\n📁 {inst_type} ({len(libs)} libraries)")
            
            for lib in libs:
                source = Path(lib['path'])
                dest = type_dir / source.name
                
                if dest.exists():
                    print(f"  ⚠️  Skipping {source.name} (already exists)")
                    continue
                
                try:
                    print(f"  🚚 Moving: {source.name}")
                    shutil.move(str(source), str(dest))
                    stats['moved'] += 1
                except Exception as e:
                    print(f"  ❌ Error: {e}")
                    stats['failed'] += 1
        
        return stats
    
    def create_instrument_index(self, output_base: Path):
        """Create organized index of all instruments"""
        print(f"\n📋 Creating instrument index...")
        
        index_dir = output_base / '_QUICK_ACCESS_BY_INSTRUMENT'
        index_dir.mkdir(exist_ok=True)
        
        # Map instrument types to folders
        instrument_map = {
            'Drums': ['Drums_Percussion'],
            'Kicks': ['Drums_Percussion'],
            'Snares': ['Drums_Percussion'],
            'Hats': ['Drums_Percussion'],
            'Synths': ['Synths_Electronic'],
            'Bass': ['Synths_Electronic', 'Guitar_Bass'],
            'Strings': ['Orchestral_Strings'],
            'Orchestra': ['Orchestral_Strings'],
            'Vocals': ['Vocals_Choir'],
            'Guitar': ['Guitar_Bass'],
            'Piano': ['Piano_Keys'],
            'FX': ['FX_Soundscape']
        }
        
        symlinks_created = 0
        
        for instrument, source_types in instrument_map.items():
            inst_dir = index_dir / instrument
            inst_dir.mkdir(exist_ok=True)
            
            for source_type in source_types:
                source_dir = output_base / source_type
                if source_dir.exists():
                    for lib_folder in source_dir.iterdir():
                        if lib_folder.is_dir():
                            link_path = inst_dir / lib_folder.name
                            if not link_path.exists():
                                try:
                                    link_path.symlink_to(lib_folder, target_is_directory=True)
                                    symlinks_created += 1
                                except:
                                    pass
        
        print(f"  ✅ Created {symlinks_created} quick-access links")
        return symlinks_created

def main():
    print("╔════════════════════════════════════════════════════════════════════╗")
    print("║  🎹 SAMPLE LIBRARY ORGANIZER                                       ║")
    print("╚════════════════════════════════════════════════════════════════════╝")
    
    organizer = SampleLibraryOrganizer()
    
    # Configuration
    source_path = Path('/Volumes/12TB 1/MEDIA_LIBRARY/Music_Production/Sample_Libraries')
    output_path = Path('/Volumes/12TB 1/MEDIA_LIBRARY/Music_Production/Organized_Libraries')
    
    print(f"\n📁 Source: {source_path}")
    print(f"📁 Output: {output_path}")
    
    if not source_path.exists():
        print(f"\n❌ Error: Source path not found!")
        return
    
    # Phase 1: Scan all libraries
    print("\n" + "=" * 70)
    print("PHASE 1: ANALYZING SAMPLE LIBRARIES")
    print("=" * 70)
    
    start_time = time.time()
    libraries = organizer.scan_sample_libraries(source_path)
    
    # Show statistics
    print("\n📊 ANALYSIS COMPLETE:")
    print("=" * 70)
    
    by_type = defaultdict(list)
    for lib in libraries:
        by_type[lib['type']].append(lib)
    
    total_files = sum(lib['file_count'] for lib in libraries)
    total_size = sum(lib['size_gb'] for lib in libraries)
    
    print(f"\n📦 Total libraries: {len(libraries)}")
    print(f"🎵 Total audio files: {total_files:,}")
    print(f"💾 Total size: {total_size:.2f} GB")
    
    print(f"\n🎯 Libraries by Type:")
    for inst_type, libs in sorted(by_type.items()):
        type_files = sum(lib['file_count'] for lib in libs)
        type_size = sum(lib['size_gb'] for lib in libs)
        print(f"\n  {inst_type}:")
        print(f"     Libraries: {len(libs)}")
        print(f"     Files: {type_files:,}")
        print(f"     Size: {type_size:.2f} GB")
    
    # Phase 2: Organize
    print("\n" + "=" * 70)
    print("PHASE 2: ORGANIZING BY INSTRUMENT TYPE")
    print("=" * 70)
    
    print("\n⚠️  This will move libraries into categorized folders.")
    input("Press ENTER to continue or Ctrl+C to cancel...")
    
    stats = organizer.organize_libraries(libraries, output_path)
    
    # Phase 3: Create quick access index
    print("\n" + "=" * 70)
    print("PHASE 3: CREATING QUICK ACCESS INDEX")
    print("=" * 70)
    
    symlinks = organizer.create_instrument_index(output_path)
    
    elapsed = time.time() - start_time
    
    # Final Summary
    print("\n" + "=" * 70)
    print("🎉 ORGANIZATION COMPLETE!")
    print("=" * 70)
    
    print(f"\n📊 Summary:")
    print(f"  • Libraries moved: {stats['moved']}")
    print(f"  • Categories created: {stats['categories']}")
    print(f"  • Quick access links: {symlinks}")
    print(f"  • Time: {elapsed:.1f} seconds")
    
    print(f"\n📁 New Structure:")
    print(f"   {output_path}/")
    for inst_type in sorted(by_type.keys()):
        print(f"   ├── {inst_type}/")
    print(f"   └── _QUICK_ACCESS_BY_INSTRUMENT/")
    
    print(f"\n✨ Your sample libraries are now organized by instrument type!")

if __name__ == "__main__":
    main()
