#!/usr/bin/env python3
"""
🔥 METABEAST - ADVANCED METADATA & FILE INTELLIGENCE ENGINE 🔥

The ultimate file analysis and organization system.
Extracts metadata, finds duplicates, maps relationships, and builds intelligent file networks.

Author: ENGR_KEITH + AI Family Collective
Mission: Perfect file intelligence and organization
"""

import os
import sys
import hashlib
import json
import mimetypes
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Set, Tuple, Optional
from collections import defaultdict
import re

# Try to import optional advanced libraries
try:
    from PIL import Image
    HAS_PIL = True
except:
    HAS_PIL = False

try:
    import mutagen
    HAS_MUTAGEN = True
except:
    HAS_MUTAGEN = False


class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BOLD = '\033[1m'
    END = '\033[0m'


class MetaBeast:
    """
    🦁 METABEAST - The Ultimate File Intelligence System
    
    Capabilities:
    - SHA-256 hash calculation for exact duplicate detection
    - Comprehensive metadata extraction (size, dates, permissions)
    - Audio file analysis (sample rate, bit depth, duration)
    - Image analysis (dimensions, format, color mode)
    - File relationship mapping (imports, references, dependencies)
    - Smart categorization and tagging
    - Duplicate detection and space recovery
    - File network graph generation
    """
    
    def __init__(self, verbose: bool = True):
        self.verbose = verbose
        
        # Data stores
        self.file_database = {}
        self.hash_index = defaultdict(list)
        self.duplicates = []
        self.relationships = defaultdict(list)
        self.categories = defaultdict(list)
        self.tags_index = defaultdict(set)
        
        # Statistics
        self.stats = {
            'total_files': 0,
            'total_size': 0,
            'analyzed': 0,
            'duplicates_found': 0,
            'duplicate_size': 0,
            'relationships_mapped': 0,
            'errors': 0
        }
        
        # File type mappings
        self.audio_extensions = {'.aif', '.aiff', '.wav', '.mp3', '.flac', '.ogg', '.m4a', '.aac'}
        self.image_extensions = {'.png', '.jpg', '.jpeg', '.gif', '.svg', '.bmp', '.webp', '.ico'}
        self.code_extensions = {'.py', '.js', '.ts', '.jsx', '.tsx', '.java', '.cpp', '.c', '.h', 
                               '.cs', '.go', '.rs', '.rb', '.php', '.swift', '.kt', '.sh', '.bash'}
        self.doc_extensions = {'.md', '.txt', '.pdf', '.doc', '.docx', '.rtf', '.odt'}
        self.data_extensions = {'.json', '.xml', '.yaml', '.yml', '.csv', '.sql', '.db'}
    
    def log(self, message: str, level: str = "info"):
        """Pretty logging"""
        if not self.verbose:
            return
            
        prefix = {
            "info": f"{Colors.CYAN}ℹ",
            "success": f"{Colors.GREEN}✓",
            "warning": f"{Colors.YELLOW}⚠",
            "error": f"{Colors.RED}✗",
            "header": f"{Colors.BOLD}{Colors.CYAN}▶"
        }.get(level, "•")
        
        print(f"{prefix} {message}{Colors.END}")
    
    def calculate_hash(self, file_path: Path, algorithm: str = 'sha256') -> Optional[str]:
        """
        Calculate cryptographic hash of file for duplicate detection
        
        Args:
            file_path: Path to file
            algorithm: Hash algorithm (sha256, md5, sha1)
        
        Returns:
            Hex digest string or None on error
        """
        try:
            hash_obj = hashlib.new(algorithm)
            
            with open(file_path, 'rb') as f:
                # Read in chunks for memory efficiency
                for chunk in iter(lambda: f.read(8192), b''):
                    hash_obj.update(chunk)
            
            return hash_obj.hexdigest()
            
        except Exception as e:
            if self.verbose:
                self.log(f"Hash error for {file_path.name}: {e}", "error")
            return None
    
    def extract_basic_metadata(self, file_path: Path) -> Dict:
        """Extract basic filesystem metadata"""
        metadata = {
            'path': str(file_path),
            'name': file_path.name,
            'stem': file_path.stem,
            'extension': file_path.suffix.lower(),
            'size': 0,
            'size_human': '0 B',
            'created': None,
            'modified': None,
            'accessed': None,
            'permissions': None,
            'is_hidden': file_path.name.startswith('.'),
            'mime_type': None,
            'category': None,
            'tags': [],
            'hash': None
        }
        
        try:
            stat = file_path.stat()
            metadata['size'] = stat.st_size
            metadata['size_human'] = self.human_readable_size(stat.st_size)
            metadata['created'] = datetime.fromtimestamp(stat.st_ctime).isoformat()
            metadata['modified'] = datetime.fromtimestamp(stat.st_mtime).isoformat()
            metadata['accessed'] = datetime.fromtimestamp(stat.st_atime).isoformat()
            metadata['permissions'] = oct(stat.st_mode)[-3:]
            
            # Mime type
            mime_type, _ = mimetypes.guess_type(str(file_path))
            metadata['mime_type'] = mime_type
            
            # Category
            metadata['category'] = self.categorize_file(file_path)
            
            # Tags
            metadata['tags'] = self.generate_tags(file_path, metadata)
            
        except Exception as e:
            self.log(f"Basic metadata error for {file_path.name}: {e}", "error")
            
        return metadata
    
    def extract_audio_metadata(self, file_path: Path) -> Dict:
        """Extract audio-specific metadata"""
        audio_meta = {
            'duration': None,
            'sample_rate': None,
            'bit_depth': None,
            'channels': None,
            'format': None,
            'artist': None,
            'title': None,
            'album': None,
            'bpm': None
        }
        
        if not HAS_MUTAGEN:
            return audio_meta
        
        try:
            audio = mutagen.File(str(file_path))
            if audio:
                audio_meta['duration'] = audio.info.length if hasattr(audio.info, 'length') else None
                audio_meta['sample_rate'] = audio.info.sample_rate if hasattr(audio.info, 'sample_rate') else None
                audio_meta['channels'] = audio.info.channels if hasattr(audio.info, 'channels') else None
                audio_meta['bit_depth'] = audio.info.bits_per_sample if hasattr(audio.info, 'bits_per_sample') else None
                
                # Extract tags
                if hasattr(audio, 'tags') and audio.tags:
                    audio_meta['artist'] = str(audio.tags.get('artist', [''])[0])
                    audio_meta['title'] = str(audio.tags.get('title', [''])[0])
                    audio_meta['album'] = str(audio.tags.get('album', [''])[0])
                    
        except Exception as e:
            if self.verbose:
                self.log(f"Audio metadata error for {file_path.name}: {e}", "error")
        
        return audio_meta
    
    def extract_image_metadata(self, file_path: Path) -> Dict:
        """Extract image-specific metadata"""
        image_meta = {
            'width': None,
            'height': None,
            'format': None,
            'mode': None,
            'dpi': None
        }
        
        if not HAS_PIL:
            return image_meta
        
        try:
            with Image.open(file_path) as img:
                image_meta['width'] = img.width
                image_meta['height'] = img.height
                image_meta['format'] = img.format
                image_meta['mode'] = img.mode
                image_meta['dpi'] = img.info.get('dpi')
                
        except Exception as e:
            if self.verbose:
                self.log(f"Image metadata error for {file_path.name}: {e}", "error")
        
        return image_meta
    
    def categorize_file(self, file_path: Path) -> str:
        """Intelligently categorize file based on extension and content"""
        ext = file_path.suffix.lower()
        name = file_path.name.lower()
        
        # Audio files
        if ext in self.audio_extensions:
            if any(x in name for x in ['drum', 'kick', 'snare', 'hihat', 'cymbal', 'tom']):
                return 'AUDIO_DRUMS'
            elif any(x in name for x in ['loop', 'beat']):
                return 'AUDIO_LOOPS'
            elif any(x in name for x in ['bass', 'synth', 'lead', 'pad']):
                return 'AUDIO_INSTRUMENTS'
            return 'AUDIO_SAMPLES'
        
        # Music production
        if ext in {'.kit', '.ssd', '.nki', '.rx2', '.ncw', '.tci', '.xpak'}:
            return 'MUSIC_PRODUCTION'
        
        # Code
        if ext in self.code_extensions:
            return 'CODE'
        
        # Images
        if ext in self.image_extensions:
            return 'IMAGES'
        
        # Documentation
        if ext in self.doc_extensions:
            return 'DOCUMENTATION'
        
        # Data
        if ext in self.data_extensions:
            return 'DATA'
        
        # Scripts
        if ext in {'.sh', '.bash', '.zsh', '.ps1', '.bat'}:
            return 'SCRIPTS'
        
        # Web
        if ext in {'.html', '.css', '.scss', '.sass', '.less'}:
            return 'WEB'
        
        # Configuration
        if ext in {'.conf', '.config', '.ini', '.env'} or name in {'.gitignore', '.dockerignore'}:
            return 'CONFIG'
        
        return 'OTHER'
    
    def generate_tags(self, file_path: Path, metadata: Dict) -> List[str]:
        """Generate smart tags for file"""
        tags = []
        
        name = file_path.name.lower()
        category = metadata.get('category', '')
        
        # Size-based tags
        size = metadata.get('size', 0)
        if size > 100 * 1024 * 1024:  # > 100MB
            tags.append('large')
        elif size < 1024:  # < 1KB
            tags.append('tiny')
        
        # Audio-specific tags
        if 'AUDIO' in category:
            if any(x in name for x in ['128', '130', '135', '140', '145']):
                tags.append('bpm_tagged')
            if any(x in name for x in ['c', 'd', 'e', 'f', 'g', 'a', 'b']):
                tags.append('key_tagged')
        
        # Code-specific tags
        if category == 'CODE':
            if 'test' in name or 'spec' in name:
                tags.append('test')
            if 'config' in name or 'setup' in name:
                tags.append('configuration')
            if name.startswith('_') or name.startswith('.'):
                tags.append('hidden')
        
        # Project-related tags
        if 'noizy' in name:
            tags.append('noizylab')
        if 'mc96' in name:
            tags.append('mc96')
        
        return tags
    
    def find_duplicates(self):
        """Identify all duplicate files by hash"""
        self.log("🔍 Finding duplicates...", "header")
        
        duplicate_groups = {}
        
        for hash_value, files in self.hash_index.items():
            if len(files) > 1:
                # Found duplicates
                original = files[0]
                dupes = files[1:]
                
                duplicate_groups[hash_value] = {
                    'original': original,
                    'duplicates': dupes,
                    'count': len(files),
                    'size': self.file_database[original]['size'],
                    'total_waste': self.file_database[original]['size'] * (len(files) - 1)
                }
                
                self.stats['duplicates_found'] += len(dupes)
                self.stats['duplicate_size'] += duplicate_groups[hash_value]['total_waste']
        
        self.duplicates = duplicate_groups
        
        if duplicate_groups:
            self.log(f"Found {self.stats['duplicates_found']} duplicate files", "success")
            self.log(f"Potential space savings: {self.human_readable_size(self.stats['duplicate_size'])}", "success")
        else:
            self.log("No duplicates found", "info")
    
    def find_relationships(self, file_path: Path) -> List[str]:
        """Find files related to this file (imports, references)"""
        relationships = []
        
        if file_path.suffix == '.py':
            relationships.extend(self._find_python_imports(file_path))
        elif file_path.suffix in {'.js', '.ts', '.jsx', '.tsx'}:
            relationships.extend(self._find_js_imports(file_path))
        
        return relationships
    
    def _find_python_imports(self, file_path: Path) -> List[str]:
        """Find Python imports"""
        imports = []
        
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            
            # Match import statements
            patterns = [
                r'from\s+([\w.]+)\s+import',
                r'import\s+([\w.]+)'
            ]
            
            for pattern in patterns:
                matches = re.findall(pattern, content)
                imports.extend(matches)
                
        except:
            pass
        
        return imports
    
    def _find_js_imports(self, file_path: Path) -> List[str]:
        """Find JavaScript/TypeScript imports"""
        imports = []
        
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            
            # Match import statements
            patterns = [
                r'import\s+.*\s+from\s+[\'"](.+)[\'"]',
                r'require\([\'"](.+)[\'"]\)'
            ]
            
            for pattern in patterns:
                matches = re.findall(pattern, content)
                imports.extend(matches)
                
        except:
            pass
        
        return imports
    
    def analyze_file(self, file_path: Path) -> Dict:
        """Perform complete analysis of a single file"""
        
        # Basic metadata
        metadata = self.extract_basic_metadata(file_path)
        
        # Calculate hash
        metadata['hash'] = self.calculate_hash(file_path)
        if metadata['hash']:
            self.hash_index[metadata['hash']].append(str(file_path))
        
        # Type-specific metadata
        ext = file_path.suffix.lower()
        
        if ext in self.audio_extensions:
            metadata['audio'] = self.extract_audio_metadata(file_path)
        
        if ext in self.image_extensions:
            metadata['image'] = self.extract_image_metadata(file_path)
        
        # Find relationships
        metadata['relationships'] = self.find_relationships(file_path)
        if metadata['relationships']:
            self.stats['relationships_mapped'] += len(metadata['relationships'])
        
        # Store in database
        file_key = str(file_path)
        self.file_database[file_key] = metadata
        
        # Index by category
        if metadata['category']:
            self.categories[metadata['category']].append(file_key)
        
        # Index by tags
        for tag in metadata['tags']:
            self.tags_index[tag].add(file_key)
        
        # Update stats
        self.stats['total_files'] += 1
        self.stats['total_size'] += metadata['size']
        self.stats['analyzed'] += 1
        
        return metadata
    
    def scan_directory(self, directory: Path, recursive: bool = True):
        """Scan entire directory and analyze all files"""
        self.log(f"📂 Scanning: {directory}", "header")
        
        try:
            if recursive:
                pattern = '**/*'
            else:
                pattern = '*'
            
            for file_path in directory.glob(pattern):
                if file_path.is_file() and not file_path.name.startswith('.'):
                    try:
                        self.analyze_file(file_path)
                        
                        if self.stats['analyzed'] % 100 == 0:
                            self.log(f"Analyzed {self.stats['analyzed']} files...", "info")
                            
                    except Exception as e:
                        self.stats['errors'] += 1
                        if self.verbose:
                            self.log(f"Error analyzing {file_path.name}: {e}", "error")
        
        except Exception as e:
            self.log(f"Directory scan error: {e}", "error")
        
        # Find duplicates after scan
        self.find_duplicates()
    
    @staticmethod
    def human_readable_size(size: int) -> str:
        """Convert bytes to human-readable format"""
        for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
            if size < 1024.0:
                return f"{size:.2f} {unit}"
            size /= 1024.0
        return f"{size:.2f} PB"
    
    def generate_report(self) -> Dict:
        """Generate comprehensive analysis report"""
        report = {
            'timestamp': datetime.now().isoformat(),
            'statistics': self.stats,
            'categories': {cat: len(files) for cat, files in self.categories.items()},
            'tags': {tag: len(files) for tag, files in self.tags_index.items()},
            'duplicates': len(self.duplicates),
            'space_analysis': {
                'total_size': self.human_readable_size(self.stats['total_size']),
                'duplicate_waste': self.human_readable_size(self.stats['duplicate_size']),
                'potential_savings': f"{(self.stats['duplicate_size'] / self.stats['total_size'] * 100):.1f}%" if self.stats['total_size'] > 0 else "0%"
            }
        }
        
        return report
    
    def print_report(self):
        """Print beautiful report to console"""
        print(f"\n{Colors.BOLD}{Colors.CYAN}{'='*80}{Colors.END}")
        print(f"{Colors.BOLD}{Colors.CYAN}{'METABEAST ANALYSIS REPORT'.center(80)}{Colors.END}")
        print(f"{Colors.BOLD}{Colors.CYAN}{'='*80}{Colors.END}\n")
        
        print(f"{Colors.BOLD}📊 FILE STATISTICS{Colors.END}")
        print(f"  Total Files: {self.stats['total_files']}")
        print(f"  Total Size: {self.human_readable_size(self.stats['total_size'])}")
        print(f"  Analyzed: {self.stats['analyzed']}")
        print(f"  Errors: {self.stats['errors']}")
        
        print(f"\n{Colors.BOLD}🗂️  CATEGORIES{Colors.END}")
        for category, files in sorted(self.categories.items(), key=lambda x: len(x[1]), reverse=True):
            print(f"  {category}: {len(files)} files")
        
        print(f"\n{Colors.BOLD}🏷️  TOP TAGS{Colors.END}")
        sorted_tags = sorted(self.tags_index.items(), key=lambda x: len(x[1]), reverse=True)[:10]
        for tag, files in sorted_tags:
            print(f"  {tag}: {len(files)} files")
        
        print(f"\n{Colors.BOLD}🔄 DUPLICATES{Colors.END}")
        print(f"  Duplicate Files: {self.stats['duplicates_found']}")
        print(f"  Wasted Space: {self.human_readable_size(self.stats['duplicate_size'])}")
        if self.stats['total_size'] > 0:
            percent = (self.stats['duplicate_size'] / self.stats['total_size']) * 100
            print(f"  Potential Savings: {percent:.1f}%")
        
        print(f"\n{Colors.BOLD}🔗 RELATIONSHIPS{Colors.END}")
        print(f"  Relationships Mapped: {self.stats['relationships_mapped']}")
        
        print(f"\n{Colors.GREEN}{Colors.BOLD}✓ ANALYSIS COMPLETE{Colors.END}\n")
    
    def save_database(self, output_path: Path):
        """Save complete database to JSON"""
        self.log(f"💾 Saving database to {output_path}", "header")
        
        data = {
            'metadata': {
                'timestamp': datetime.now().isoformat(),
                'version': '1.0.0',
                'generator': 'MetaBeast'
            },
            'statistics': self.stats,
            'files': self.file_database,
            'categories': {cat: list(files) for cat, files in self.categories.items()},
            'tags': {tag: list(files) for tag, files in self.tags_index.items()},
            'duplicates': self.duplicates
        }
        
        try:
            with open(output_path, 'w') as f:
                json.dump(data, f, indent=2)
            
            self.log(f"Database saved successfully", "success")
            
        except Exception as e:
            self.log(f"Error saving database: {e}", "error")


def main():
    """Main entry point for MetaBeast CLI"""
    import argparse
    
    parser = argparse.ArgumentParser(
        description="🦁 MetaBeast - Advanced File Intelligence Engine"
    )
    parser.add_argument('directory', type=str, help='Directory to analyze')
    parser.add_argument('-o', '--output', type=str, help='Output JSON database file')
    parser.add_argument('-r', '--recursive', action='store_true', default=True, help='Recursive scan')
    parser.add_argument('-q', '--quiet', action='store_true', help='Quiet mode')
    
    args = parser.parse_args()
    
    # Create MetaBeast instance
    beast = MetaBeast(verbose=not args.quiet)
    
    # Scan directory
    directory = Path(args.directory)
    if not directory.exists():
        print(f"{Colors.RED}✗ Directory not found: {directory}{Colors.END}")
        sys.exit(1)
    
    beast.scan_directory(directory, recursive=args.recursive)
    
    # Print report
    beast.print_report()
    
    # Save database if requested
    if args.output:
        output_path = Path(args.output)
        beast.save_database(output_path)


if __name__ == "__main__":
    main()
