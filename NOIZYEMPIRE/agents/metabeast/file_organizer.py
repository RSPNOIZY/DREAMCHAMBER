#!/usr/bin/env python3
"""
╔════════════════════════════════════════════════════════════════════════════════╗
║                                                                                ║
║  🗂️  GABRIEL FILE ORGANIZATION ENGINE                                         ║
║                                                                                ║
║  Integrated ULTIMATE_MASTER_ORGANIZER                                         ║
║  MetaBeast + EngrKeith + CodeVac + Music Intelligence                         ║
║                                                                                ║
║  AI Family Collective - Perfect Digital Organization                          ║
║                                                                                ║
╚════════════════════════════════════════════════════════════════════════════════╝
"""

import os
import shutil
import hashlib
import json
import re
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime
from typing import Dict, List, Set, Tuple, Optional
from collections import defaultdict


class FileOrganizer:
    """Complete file organization system integrated into GABRIEL"""
    
    def __init__(self, base_dir: str = None):
        """Initialize file organizer with optional base directory"""
        self.base_dir = Path(base_dir) if base_dir else Path.cwd()
        self.stats = {
            'files_scanned': 0,
            'files_organized': 0,
            'bytes_moved': 0,
            'symlinks_created': 0,
            'errors': []
        }
        
        # Perfect structure for music production + code (ENHANCED from SUPER_REORGANIZER)
        self.structure = {
            'CODE': {
                'Python': ['Scripts', 'Libraries', 'Projects'],
                'JavaScript': ['Node', 'React', 'Utils'],
                'Shell': ['Automation', 'Build', 'Deploy'],
                'Configuration': ['Settings', 'Configs', 'Env'],
                'Other': []
            },
            'MUSIC_PRODUCTION': {
                'Sample_Libraries': ['Drums', 'Instruments', 'FX', 'Loops'],
                'Projects': ['2026_Active', '2025_Archive', 'Templates'],
                'Presets': ['Synths', 'Effects', 'Chains'],
                'Instruments': ['Kontakt', 'VST', 'AU'],
                'Kits': ['Drum_Kits', 'Sample_Packs', 'Construction_Kits']
            },
            'AUDIO': {
                'Samples_By_Type': ['Kicks', 'Snares', 'Hats', 'Percussion', 'Bass', 'Synth', 'Vocals'],
                'Samples_By_BPM': ['80-100', '100-120', '120-140', '140-160', '160-180'],
                'Samples_By_Key': ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'Mixed'],
                'Loops': ['Drum_Loops', 'Music_Loops', 'FX_Loops'],
                'Field_Recordings': [],
                'Raw_Audio': []
            },
            'DOCUMENTATION': {
                'Guides': ['Audio', 'Code', 'System', 'Music'],
                'Reference': ['Manuals', 'Specs', 'API_Docs'],
                'Notes': ['Project_Notes', 'Ideas', 'Plans'],
                'History': ['2020', '2021', '2022', '2023', '2024', '2025'],
                'MC96': ['Accessibility', 'Features', 'Development']
            },
            'ARCHIVES': {
                'Backups': ['2020', '2021', '2022', '2023', '2024', '2025'],
                'Old_Projects': ['Music', 'Code', 'Design'],
                'Historical': ['Documents', 'Media', 'Records'],
                'Migration': ['From_4TB', 'From_RED_DRAGON', 'From_GABRIEL']
            },
            'MEDIA': {
                'Video': ['Documentaries', 'Series', 'Movies', 'Tutorials'],
                'Images': ['Wallpapers', 'Photos', 'Graphics', 'UI_Assets'],
                'Design': ['Projects', 'Templates', 'Resources']
            },
            'INSTALLERS': {
                'Audio_Software': ['DAW', 'Plugins', 'Utilities'],
                'Development': ['IDEs', 'Languages', 'Tools'],
                'System': ['macOS', 'Windows', 'Linux'],
                'Drivers': []
            },
            'PROJECTS': {
                'Active_2026': ['NoizyLab', 'MC96', 'NoizyFish', 'MissionControl'],
                'Archive': ['Completed', 'Paused', 'Reference'],
                'Collaboration': ['Shared', 'Public', 'Private']
            },
            'DATA': {
                'Databases': ['JSON', 'SQL', 'NoSQL'],
                'Logs': ['System', 'Application', 'Error'],
                'Metadata': ['File_DBs', 'Analysis', 'Reports'],
                'Configuration': ['Settings', 'Profiles', 'Presets']
            }
        }
    
    def calculate_hash(self, file_path: Path) -> Optional[str]:
        """Calculate SHA-256 hash for duplicate detection"""
        try:
            sha256 = hashlib.sha256()
            with open(file_path, 'rb') as f:
                for chunk in iter(lambda: f.read(8192), b''):
                    sha256.update(chunk)
            return sha256.hexdigest()
        except:
            return None
    
    def extract_metadata(self, file_path: Path) -> Dict:
        """Extract comprehensive file metadata"""
        metadata = {
            'path': str(file_path),
            'name': file_path.name,
            'extension': file_path.suffix.lower(),
            'size': 0,
            'hash': None,
            'category': None,
            'tags': []
        }
        
        try:
            stat = file_path.stat()
            metadata['size'] = stat.st_size
            metadata['hash'] = self.calculate_hash(file_path)
            
            # Track duplicates
            if metadata['hash']:
                if metadata['hash'] in self.file_hashes:
                    self.duplicates.append({
                        'original': self.file_hashes[metadata['hash']],
                        'duplicate': str(file_path),
                        'size': metadata['size']
                    })
                else:
                    self.file_hashes[metadata['hash']] = str(file_path)
        except:
            pass
        
        return metadata
    
    def categorize_file(self, file_path: Path) -> Tuple[str, str, str]:
        """
        Intelligently categorize file with music production focus
        ENHANCED: Added key detection, better installers, year-based archives
        """
        ext = file_path.suffix.lower()
        name = file_path.name.lower()
        parent = file_path.parent.name.lower()
        
        # CODE (Enhanced with more languages)
        code_exts = {'.py', '.js', '.ts', '.jsx', '.tsx', '.java', '.cpp', '.c', '.h', 
                     '.cs', '.go', '.rs', '.rb', '.php', '.swift', '.kt', '.sh', '.bash', '.zsh'}
        if ext in code_exts:
            if ext == '.py':
                return ('CODE', 'Python', 'Scripts')
            elif ext in {'.js', '.jsx', '.ts', '.tsx'}:
                return ('CODE', 'JavaScript', 'Node')
            elif ext in {'.sh', '.bash', '.zsh'}:
                return ('CODE', 'Shell', 'Automation')
            return ('CODE', 'Other', '')
        
        # AUDIO SAMPLES - Detailed categorization (ENHANCED with Key detection)
        audio_exts = {'.aif', '.aiff', '.wav', '.mp3', '.flac', '.ogg', '.m4a'}
        if ext in audio_exts:
            # Key detection (e.g., "bass_C.wav", "synth_Dmin.aif", "lead_Am.wav")
            key_match = re.search(r'[\s_-]([A-G](?:m|maj|min)?)[_\s\.]', name)
            if key_match:
                key = key_match.group(1)[0].upper()  # Get root note
                return ('AUDIO', 'Samples_By_Key', key)
            
            # BPM detection (e.g., "EL-D 128 01.aif", "track_140bpm.wav")
            bpm_match = re.search(r'[\s_-](\d{2,3})[\s_-]|(\d{2,3})\s*bpm', name)
            if bpm_match:
                bpm = int(bpm_match.group(1) or bpm_match.group(2))
                if 80 <= bpm <= 100:
                    return ('AUDIO', 'Samples_By_BPM', '80-100')
                elif 100 < bpm <= 120:
                    return ('AUDIO', 'Samples_By_BPM', '100-120')
                elif 120 < bpm <= 140:
                    return ('AUDIO', 'Samples_By_BPM', '120-140')
                elif 140 < bpm <= 160:
                    return ('AUDIO', 'Samples_By_BPM', '140-160')
                elif 160 < bpm <= 180:
                    return ('AUDIO', 'Samples_By_BPM', '160-180')
            
            # Type detection
            if any(x in name for x in ['kick', 'bd', 'bassdrum']):
                return ('AUDIO', 'Samples_By_Type', 'Kicks')
            elif any(x in name for x in ['snare', 'sd', 'snr']):
                return ('AUDIO', 'Samples_By_Type', 'Snares')
            elif any(x in name for x in ['hat', 'hh', 'hihat']):
                return ('AUDIO', 'Samples_By_Type', 'Hats')
            elif any(x in name for x in ['perc', 'percussion', 'conga', 'bongo']):
                return ('AUDIO', 'Samples_By_Type', 'Percussion')
            elif 'bass' in name:
                return ('AUDIO', 'Samples_By_Type', 'Bass')
            elif any(x in name for x in ['synth', 'lead', 'pad']):
                return ('AUDIO', 'Samples_By_Type', 'Synth')
            elif any(x in name for x in ['vocal', 'vox', 'voice']):
                return ('AUDIO', 'Samples_By_Type', 'Vocals')
            elif 'loop' in name:
                loop_type = 'Drum_Loops' if 'drum' in name else 'Music_Loops'
                return ('AUDIO', 'Loops', loop_type)
            
            return ('AUDIO', 'Raw_Audio', '')
        
        # MUSIC PRODUCTION FORMATS
        if ext in {'.kit', '.ssd'}:
            return ('MUSIC_PRODUCTION', 'Kits', 'Drum_Kits')
        elif ext == '.nki':
            return ('MUSIC_PRODUCTION', 'Instruments', 'Kontakt')
        elif ext in {'.rx2', '.rex'}:
            return ('MUSIC_PRODUCTION', 'Sample_Libraries', 'Loops')
        elif ext in {'.ncw', '.tci', '.xpak'}:
            return ('MUSIC_PRODUCTION', 'Sample_Libraries', 'FX')
        
        # DOCUMENTATION (Enhanced with MC96, guides, year detection)
        doc_exts = {'.md', '.txt', '.pdf', '.doc', '.docx', '.rtf'}
        if ext in doc_exts:
            if 'mc96' in name or 'mission' in name:
                return ('DOCUMENTATION', 'MC96', 'Development')
            elif 'guide' in name or 'tutorial' in name:
                return ('DOCUMENTATION', 'Guides', 'Audio')
            # Year-based history
            for year in ['2020', '2021', '2022', '2023', '2024', '2025']:
                if year in name or year in parent:
                    return ('DOCUMENTATION', 'History', year)
            return ('DOCUMENTATION', 'Notes', 'Project_Notes')
        
        # DATA (Enhanced with SQL and better categorization)
        data_exts = {'.json', '.xml', '.yaml', '.yml', '.csv', '.sql'}
        if ext in data_exts:
            if ext == '.json':
                return ('DATA', 'Databases', 'JSON')
            elif ext == '.sql':
                return ('DATA', 'Databases', 'SQL')
            return ('DATA', 'Configuration', 'Settings')
        
        # MEDIA (Enhanced with better video categorization)
        if ext in {'.mp4', '.mov', '.avi', '.mkv'}:
            if 'documentary' in parent or 'documentaries' in parent:
                return ('MEDIA', 'Video', 'Documentaries')
            elif 'series' in parent:
                return ('MEDIA', 'Video', 'Series')
            elif 'tutorial' in parent or 'tutorial' in name:
                return ('MEDIA', 'Video', 'Tutorials')
            return ('MEDIA', 'Video', 'Movies')
        
        if ext in {'.png', '.jpg', '.jpeg', '.gif', '.svg', '.bmp', '.webp'}:
            if 'wallpaper' in parent or 'wallpaper' in name:
                return ('MEDIA', 'Images', 'Wallpapers')
            elif 'ui' in name or 'icon' in name:
                return ('MEDIA', 'Images', 'UI_Assets')
            return ('MEDIA', 'Images', 'Photos')
        
        # INSTALLERS (NEW - Enhanced detection)
        if ext in {'.dmg', '.pkg', '.exe', '.msi', '.deb', '.rpm'}:
            if any(x in name for x in ['vst', 'au', 'plugin', 'kontakt', 'logic', 'ableton']):
                return ('INSTALLERS', 'Audio_Software', 'Plugins')
            elif any(x in name for x in ['python', 'node', 'java', 'vscode', 'xcode']):
                return ('INSTALLERS', 'Development', 'IDEs')
            return ('INSTALLERS', 'System', 'macOS')
        
        # ARCHIVES (Enhanced with year detection)
        if any(x in parent for x in ['backup', 'archive', 'old']):
            for year in ['2020', '2021', '2022', '2023', '2024', '2025']:
                if year in parent or year in name:
                    return ('ARCHIVES', 'Backups', year)
            return ('ARCHIVES', 'Old_Projects', 'Music')
        
        # PROJECTS
        if any(x in parent for x in ['noizylab', 'mc96', 'noizyfish', 'mission']):
            if 'noizylab' in parent:
                return ('PROJECTS', 'Active_2026', 'NoizyLab')
            elif 'mc96' in parent:
                return ('PROJECTS', 'Active_2026', 'MC96')
            elif 'noizyfish' in parent:
                return ('PROJECTS', 'Active_2026', 'NoizyFish')
            return ('PROJECTS', 'Active_2026', 'MissionControl')
        
        return ('DATA', 'Configuration', 'Settings')
    
    def scan_drive(self, path: Path = None) -> List[Path]:
        """Scan drive for files"""
        if path is None:
            path = self.source_drive
        
        all_files = []
        ignored_dirs = {
            '.Spotlight-V100', '.Trashes', '.fseventsd', '.TemporaryItems',
            '.DocumentRevisions-V100', 'PERFECT_ORGANIZED_2026', '.git'
        }
        
        for root, dirs, files in os.walk(path):
            dirs[:] = [d for d in dirs if d not in ignored_dirs and not d.startswith('.')]
            
            for file in files:
                if not file.startswith('.'):
                    file_path = Path(root) / file
                    all_files.append(file_path)
        
        self.stats['total_files'] = len(all_files)
        return all_files
    
    def analyze_music_library(self, files: List[Path]) -> Dict:
        """Analyze music library structure"""
        analysis = {
            'audio_files': 0,
            'kits': 0,
            'instruments': 0,
            'bpm_distribution': defaultdict(int),
            'formats': defaultdict(int),
            'total_size': 0
        }
        
        for file in files:
            ext = file.suffix.lower()
            
            if ext in {'.aif', '.aiff', '.wav', '.mp3'}:
                analysis['audio_files'] += 1
                analysis['formats'][ext] += 1
                
                # BPM detection
                bpm_match = re.search(r'[\s_-](\d{2,3})[\s_-]', file.name.lower())
                if bpm_match:
                    bpm = int(bpm_match.group(1))
                    analysis['bpm_distribution'][f'{bpm}'] += 1
                
                try:
                    analysis['total_size'] += file.stat().st_size
                except:
                    pass
            
            elif ext in {'.kit', '.ssd'}:
                analysis['kits'] += 1
            elif ext == '.nki':
                analysis['instruments'] += 1
        
        return analysis
    
    @staticmethod
    def human_readable_size(size: int) -> str:
        """Convert bytes to human format"""
        for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
            if size < 1024.0:
                return f"{size:.2f} {unit}"
            size /= 1024.0
        return f"{size:.2f} PB"
    
    def get_stats(self) -> Dict:
        """Get current organization statistics"""
        return {
            'total_files': self.stats['total_files'],
            'files_processed': self.stats['files_processed'],
            'files_moved': self.stats['files_moved'],
            'duplicates_found': len(self.duplicates),
            'space_saved': self.human_readable_size(self.stats['space_saved']),
            'categories': dict(self.stats['categories'])
        }
    
    def create_music_database(self, files: List[Path], output_path: Path) -> Dict:
        """Create searchable music sample database"""
        database = {
            'created': datetime.now().isoformat(),
            'total_samples': 0,
            'samples': []
        }
        
        audio_exts = {'.aif', '.aiff', '.wav', '.mp3', '.flac'}
        
        for file in files:
            if file.suffix.lower() in audio_exts:
                # Extract BPM
                bpm = None
                bpm_match = re.search(r'[\s_-](\d{2,3})[\s_-]|(\d{2,3})\s*bpm', file.name.lower())
                if bpm_match:
                    bpm = int(bpm_match.group(1) or bpm_match.group(2))
                
                # Categorize
                sample_type = 'Unknown'
                if any(x in file.name.lower() for x in ['kick', 'bd']):
                    sample_type = 'Kick'
                elif any(x in file.name.lower() for x in ['snare', 'sd']):
                    sample_type = 'Snare'
                elif any(x in file.name.lower() for x in ['hat', 'hh']):
                    sample_type = 'Hat'
                elif 'bass' in file.name.lower():
                    sample_type = 'Bass'
                elif any(x in file.name.lower() for x in ['synth', 'lead']):
                    sample_type = 'Synth'
                elif 'loop' in file.name.lower():
                    sample_type = 'Loop'
                
                try:
                    size = file.stat().st_size
                except:
                    size = 0
                
                database['samples'].append({
                    'name': file.name,
                    'path': str(file),
                    'type': sample_type,
                    'bpm': bpm,
                    'format': file.suffix.lower(),
                    'size': size,
                    'size_human': self.human_readable_size(size)
                })
        
        database['total_samples'] = len(database['samples'])
        
        # Save database
        with open(output_path, 'w') as f:
            json.dump(database, f, indent=2)
        
        return database
    
    def organize_with_symlinks(self, source: str, dest: str, 
                               create_by_bpm: bool = True,
                               create_by_key: bool = True,
                               create_by_instrument: bool = True) -> Dict:
        """
        Organize files with symlinks (no duplication)
        
        Creates multiple access paths to same files:
        - By instrument type
        - By BPM range
        - By musical key
        - Original archive
        
        Args:
            source: Source directory to organize
            dest: Destination directory for organized structure
            create_by_bpm: Create BPM-based organization
            create_by_key: Create key-based organization
            create_by_instrument: Create instrument-based organization
        
        Returns:
            Dictionary with organization stats
        """
        source_path = Path(source)
        dest_path = Path(dest)
        
        print(f"\n🗂️  ORGANIZING: {source_path.name}")
        print(f"📁 DESTINATION: {dest_path}")
        print("=" * 80)
        
        # Create base structure
        dest_path.mkdir(parents=True, exist_ok=True)
        
        # Organization categories
        by_instrument = defaultdict(list)
        by_bpm = defaultdict(list)
        by_key = defaultdict(list)
        raw_archive = []
        
        total_files = 0
        symlinks_created = 0
        
        # Scan and categorize
        print("\n📊 Phase 1: Scanning files...")
        for file_path in source_path.rglob('*'):
            if not file_path.is_file():
                continue
            
            ext = file_path.suffix.lower()
            if ext not in {'.aif', '.aiff', '.wav', '.mp3', '.flac', '.ogg'}:
                continue
            
            total_files += 1
            name_lower = file_path.stem.lower()
            
            # Detect instrument
            if create_by_instrument:
                if any(kw in name_lower for kw in ['kick', 'bd', 'bassdrum']):
                    by_instrument['Drums/Kicks'].append(file_path)
                elif any(kw in name_lower for kw in ['snare', 'sd']):
                    by_instrument['Drums/Snares'].append(file_path)
                elif any(kw in name_lower for kw in ['hat', 'hh', 'hihat']):
                    by_instrument['Drums/Hats'].append(file_path)
                elif any(kw in name_lower for kw in ['perc', 'conga', 'bongo', 'shaker', 'tambourine']):
                    by_instrument['Drums/Percussion'].append(file_path)
                elif any(kw in name_lower for kw in ['bass', 'sub']):
                    by_instrument['Bass'].append(file_path)
                elif any(kw in name_lower for kw in ['synth', 'pad', 'lead', 'organ', 'piano', 'rhodes']):
                    by_instrument['Synths_Keys'].append(file_path)
                elif any(kw in name_lower for kw in ['guitar', 'guit', 'acoustic', 'electric', 'banjo', 'mandolin', 'ukulele']):
                    by_instrument['Guitar_Strings'].append(file_path)
                elif any(kw in name_lower for kw in ['vocal', 'voice', 'choir', 'singing']):
                    by_instrument['Vocals'].append(file_path)
                elif any(kw in name_lower for kw in ['brass', 'horn', 'trumpet', 'sax', 'trombone']):
                    by_instrument['Brass_Winds'].append(file_path)
                elif any(kw in name_lower for kw in ['fx', 'ambient', 'atmosphere', 'texture', 'forest', 'bird', 'cricket']):
                    by_instrument['FX_Ambience'].append(file_path)
            
            # Detect BPM
            if create_by_bpm:
                bpm_match = re.search(r'[\s_-](\d{2,3})[\s_-]|(\d{2,3})\s*bpm', name_lower)
                if bpm_match:
                    bpm = int(bpm_match.group(1) or bpm_match.group(2))
                    if 80 <= bpm < 100:
                        by_bpm['80-100_BPM'].append(file_path)
                    elif 100 <= bpm < 120:
                        by_bpm['100-120_BPM'].append(file_path)
                    elif 120 <= bpm < 140:
                        by_bpm['120-140_BPM'].append(file_path)
                    elif 140 <= bpm < 160:
                        by_bpm['140-160_BPM'].append(file_path)
                    elif 160 <= bpm <= 180:
                        by_bpm['160-180_BPM'].append(file_path)
            
            # Detect key
            if create_by_key:
                key_match = re.search(r'[\s_-]([A-G](?:m|maj|min)?)[_\s\.]', file_path.name)
                if key_match:
                    key = key_match.group(1)[0].upper()
                    by_key[f'{key}_Major'].append(file_path)
            
            # Add to raw archive
            raw_archive.append(file_path)
        
        print(f"✅ Found {total_files:,} files\n")
        
        # Create symlinks
        print("📊 Phase 2: Creating organized structure...")
        
        if create_by_instrument and by_instrument:
            print("\n🎸 Creating instrument-based organization...")
            inst_dir = dest_path / '01_By_Instrument'
            for category, files in by_instrument.items():
                cat_dir = inst_dir / category
                cat_dir.mkdir(parents=True, exist_ok=True)
                for file_path in files:
                    symlink = cat_dir / file_path.name
                    try:
                        if not symlink.exists():
                            symlink.symlink_to(file_path)
                            symlinks_created += 1
                    except:
                        pass
                print(f"   {category:25} : {len(files):>5,} files")
        
        if create_by_bpm and by_bpm:
            print("\n🎵 Creating BPM-based organization...")
            bpm_dir = dest_path / '02_By_BPM'
            for category, files in sorted(by_bpm.items()):
                cat_dir = bpm_dir / category
                cat_dir.mkdir(parents=True, exist_ok=True)
                for file_path in files:
                    symlink = cat_dir / file_path.name
                    try:
                        if not symlink.exists():
                            symlink.symlink_to(file_path)
                            symlinks_created += 1
                    except:
                        pass
                print(f"   {category:25} : {len(files):>5,} files")
        
        if create_by_key and by_key:
            print("\n🎹 Creating key-based organization...")
            key_dir = dest_path / '03_By_Musical_Key'
            for category, files in sorted(by_key.items()):
                cat_dir = key_dir / category
                cat_dir.mkdir(parents=True, exist_ok=True)
                for file_path in files:
                    symlink = cat_dir / file_path.name
                    try:
                        if not symlink.exists():
                            symlink.symlink_to(file_path)
                            symlinks_created += 1
                    except:
                        pass
                print(f"   {category:25} : {len(files):>5,} files")
        
        # Create raw archive reference
        print("\n📦 Creating raw archive...")
        archive_dir = dest_path / '04_Raw_Archive'
        archive_dir.mkdir(parents=True, exist_ok=True)
        for file_path in raw_archive:
            symlink = archive_dir / file_path.name
            try:
                if not symlink.exists():
                    symlink.symlink_to(file_path)
                    symlinks_created += 1
            except:
                pass
        print(f"   Raw_Archive                : {len(raw_archive):>5,} files")
        
        # Summary
        print("\n" + "=" * 80)
        print("✅ ORGANIZATION COMPLETE!")
        print(f"📊 Total Files: {total_files:,}")
        print(f"🔗 Symlinks Created: {symlinks_created:,}")
        print(f"💾 Disk Space Used: <1 MB (symlinks only)")
        print(f"📁 Organized To: {dest_path}")
        
        return {
            'total_files': total_files,
            'symlinks_created': symlinks_created,
            'by_instrument': len(by_instrument),
            'by_bpm': len(by_bpm),
            'by_key': len(by_key),
            'destination': str(dest_path)
        }


# Quick access functions for GABRIEL integration
def quick_scan(path: str) -> Dict:
    """Quick scan of directory"""
    organizer = FileOrganizer(path)
    files = organizer.scan_drive()
    return organizer.analyze_music_library(files)


def create_music_db(path: str, output: str) -> Dict:
    """Create music database from directory"""
    organizer = FileOrganizer(path)
    files = organizer.scan_drive()
    return organizer.create_music_database(files, Path(output))


def organize_music(source: str, dest: str) -> Dict:
    """
    Organize music library with symlinks
    
    Creates multiple access paths:
    - By instrument type (Drums/Bass/Synths/etc.)
    - By BPM range (80-180)
    - By musical key (C-B)
    - Raw archive (all files)
    
    Args:
        source: Source directory to organize
        dest: Destination for organized structure
    
    Returns:
        Organization statistics
    
    Example:
        >>> organize_music("/Volumes/12TB 1/NoizyFish_Fishnet", 
        ...                "/Volumes/12TB 1/_2026_ORGANIZED_MUSIC/NoizyFish")
    """
    organizer = FileOrganizer()
    return organizer.organize_with_symlinks(
        source=source,
        dest=dest,
        create_by_bpm=True,
        create_by_key=True,
        create_by_instrument=True
    )


if __name__ == "__main__":
    print("🗂️  GABRIEL File Organization Engine")
    print("Import this module into gabriel_ultimate.py for full integration")
    print("\nExample usage:")
    print("  from file_organizer import organize_music")
    print("  organize_music('/path/to/music', '/path/to/organized')")
