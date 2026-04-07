#!/usr/bin/env python3
"""
🎬 Bobby Media Migrator - Smart Audio & Video File Management
Advanced agent for moving large media files across volumes with intelligence.
"""

import os
import shutil
import time
from pathlib import Path
import subprocess
from datetime import datetime

class BobbyMediaMigrator:
    def __init__(self):
        self.audio_extensions = {'.mp3', '.wav', '.flac', '.aac', '.m4a', '.ogg', '.wma', '.aiff'}
        self.video_extensions = {'.mp4', '.mov', '.avi', '.mkv', '.wmv', '.flv', '.webm', '.m4v', '.3gp'}
        self.volumes = self.discover_volumes()
        self.migration_stats = {
            "files_moved": 0,
            "total_size": 0,
            "errors": 0,
            "start_time": None
        }
        
    def discover_volumes(self):
        """Discover all available volumes and their free space"""
        volumes = {}
        
        # Get mounted volumes on macOS
        try:
            result = subprocess.run(['df', '-h'], capture_output=True, text=True)
            lines = result.stdout.strip().split('\n')[1:]  # Skip header
            
            for line in lines:
                parts = line.split()
                if len(parts) >= 6:
                    filesystem = parts[0]
                    size = parts[1]
                    used = parts[2]
                    available = parts[3]
                    mount_point = parts[5]
                    
                    # Focus on external volumes and large internal volumes
                    if (mount_point.startswith('/Volumes/') or 
                        mount_point == '/' or 
                        'TB' in available or 
                        'GB' in available):
                        
                        volumes[mount_point] = {
                            "filesystem": filesystem,
                            "total_size": size,
                            "used": used,
                            "available": available,
                            "mount_point": mount_point,
                            "free_bytes": self.parse_size_to_bytes(available)
                        }
        except Exception as e:
            print(f"⚠️ Error discovering volumes: {e}")
            
        return volumes
        
    def parse_size_to_bytes(self, size_str):
        """Parse size string like '1.5TB' to bytes"""
        size_str = size_str.replace(',', '').strip()
        if size_str.endswith('TB') or size_str.endswith('Ti'):
            return float(size_str[:-2]) * 1024 * 1024 * 1024 * 1024
        elif size_str.endswith('GB') or size_str.endswith('Gi'):
            return float(size_str[:-2]) * 1024 * 1024 * 1024
        elif size_str.endswith('MB') or size_str.endswith('Mi'):
            return float(size_str[:-2]) * 1024 * 1024
        elif size_str.endswith('KB') or size_str.endswith('Ki'):
            return float(size_str[:-2]) * 1024
        else:
            try:
                return float(size_str)
            except:
                return 0
                
    def format_size(self, bytes_size):
        """Format bytes to human readable size"""
        for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
            if bytes_size < 1024.0:
                return f"{bytes_size:.1f} {unit}"
            bytes_size /= 1024.0
        return f"{bytes_size:.1f} PB"
        
    def scan_media_files(self, source_path):
        """Scan for audio and video files in the source path"""
        print(f"🔍 Scanning for media files in: {source_path}")
        
        media_files = {
            "audio": [],
            "video": []
        }
        
        total_size = 0
        
        try:
            for root, dirs, files in os.walk(source_path):
                # Skip system directories
                dirs[:] = [d for d in dirs if not d.startswith('.') and d not in ['System', 'Library']]
                
                for file in files:
                    file_path = Path(root) / file
                    file_ext = file_path.suffix.lower()
                    
                    try:
                        file_size = file_path.stat().st_size
                        file_info = {
                            "path": str(file_path),
                            "size": file_size,
                            "size_formatted": self.format_size(file_size),
                            "modified": datetime.fromtimestamp(file_path.stat().st_mtime)
                        }
                        
                        if file_ext in self.audio_extensions:
                            media_files["audio"].append(file_info)
                            total_size += file_size
                        elif file_ext in self.video_extensions:
                            media_files["video"].append(file_info)
                            total_size += file_size
                            
                    except (OSError, PermissionError):
                        continue
                        
        except Exception as e:
            print(f"⚠️ Error scanning {source_path}: {e}")
            
        return media_files, total_size
        
    def find_best_destination(self, required_space):
        """Find the best volume for migration based on available space"""
        suitable_volumes = []
        
        for mount_point, info in self.volumes.items():
            free_bytes = info["free_bytes"]
            
            # Need at least 20% more space than required for safety
            safety_margin = required_space * 1.2
            
            if free_bytes > safety_margin and mount_point != "/":
                suitable_volumes.append({
                    "mount_point": mount_point,
                    "free_space": free_bytes,
                    "available_formatted": info["available"],
                    "score": free_bytes - safety_margin  # Higher score = more free space
                })
                
        # Sort by score (most available space first)
        suitable_volumes.sort(key=lambda x: x["score"], reverse=True)
        
        return suitable_volumes
        
    def create_destination_structure(self, dest_volume, source_base):
        """Create organized destination structure"""
        base_name = Path(source_base).name
        
        destinations = {
            "audio": Path(dest_volume) / "Media_Migration" / base_name / "Audio",
            "video": Path(dest_volume) / "Media_Migration" / base_name / "Video"
        }
        
        for media_type, dest_path in destinations.items():
            dest_path.mkdir(parents=True, exist_ok=True)
            print(f"📁 Created destination: {dest_path}")
            
        return destinations
        
    def move_file_safely(self, source_path, dest_dir):
        """Move file with safety checks and progress"""
        source = Path(source_path)
        dest = dest_dir / source.name
        
        # Handle name conflicts
        counter = 1
        original_dest = dest
        while dest.exists():
            stem = original_dest.stem
            suffix = original_dest.suffix
            dest = original_dest.parent / f"{stem}_{counter}{suffix}"
            counter += 1
            
        try:
            # Copy file
            shutil.move(str(source), str(dest))
            
            # Verify the move
            if dest.exists() and not source.exists():
                self.migration_stats["files_moved"] += 1
                self.migration_stats["total_size"] += dest.stat().st_size
                return True, f"✅ Moved: {source.name}"
            else:
                return False, f"❌ Verification failed: {source.name}"
                
        except Exception as e:
            self.migration_stats["errors"] += 1
            return False, f"❌ Error moving {source.name}: {e}"
            
    def migrate_media_files(self, source_path, media_files, dest_volume):
        """Migrate media files to destination volume"""
        print(f"\n🚀 Starting media migration from {source_path}")
        print(f"📍 Destination volume: {dest_volume}")
        
        self.migration_stats["start_time"] = time.time()
        
        # Create destination structure
        destinations = self.create_destination_structure(dest_volume, source_path)
        
        # Migrate audio files
        if media_files["audio"]:
            print(f"\n🎵 Migrating {len(media_files['audio'])} audio files...")
            for i, file_info in enumerate(media_files["audio"]):
                success, message = self.move_file_safely(file_info["path"], destinations["audio"])
                print(f"  [{i+1}/{len(media_files['audio'])}] {message}")
                
        # Migrate video files
        if media_files["video"]:
            print(f"\n🎬 Migrating {len(media_files['video'])} video files...")
            for i, file_info in enumerate(media_files["video"]):
                success, message = self.move_file_safely(file_info["path"], destinations["video"])
                print(f"  [{i+1}/{len(media_files['video'])}] {message}")
                
        self.print_migration_summary()
        
    def hand_of_god_migration(self, source_path, media_files, total_size):
        """🙏 Hand of God mode - Divine intervention for media migration"""
        print("\n🙏 HAND OF GOD MODE ACTIVATED")
        print("=" * 50)
        print("🌟 Divine intervention engaged for emergency media migration!")
        print("⚡ Finding ANY volume with space - no questions asked!")
        
        # Get ALL volumes, even small ones
        emergency_volumes = []
        for mount_point, info in self.volumes.items():
            free_bytes = info["free_bytes"]
            # Accept any volume with at least 1GB free (emergency mode)
            if free_bytes > 1024 * 1024 * 1024 and mount_point != "/":
                emergency_volumes.append({
                    "mount_point": mount_point,
                    "free_space": free_bytes,
                    "available_formatted": info["available"]
                })
        
        if not emergency_volumes:
            print("💀 DIVINE INTERVENTION FAILED - No volumes found!")
            return False
            
        print(f"🔮 Found {len(emergency_volumes)} volumes for divine distribution:")
        for vol in emergency_volumes:
            print(f"   📍 {vol['mount_point']} - {vol['available_formatted']} available")
            
        # Sort all files by size (biggest first for emergency evacuation)
        all_files = media_files["audio"] + media_files["video"]
        all_files.sort(key=lambda x: x["size"], reverse=True)
        
        print(f"\n⚡ EMERGENCY EVACUATION: Moving {len(all_files)} files...")
        print(f"💾 Total data rescue: {self.format_size(total_size)}")
        
        # Distribute with divine intelligence
        current_volume_idx = 0
        files_moved = 0
        
        for file_info in all_files:
            # Cycle through volumes for optimal distribution
            volume = emergency_volumes[current_volume_idx % len(emergency_volumes)]
            
            # Create emergency structure
            file_path = Path(file_info["path"])
            emergency_dir = Path(volume["mount_point"]) / "EMERGENCY_MEDIA_RESCUE" / "Aquarium_Evacuation"
            
            if file_path.suffix.lower() in self.audio_extensions:
                dest_dir = emergency_dir / "Audio"
            else:
                dest_dir = emergency_dir / "Video"
                
            dest_dir.mkdir(parents=True, exist_ok=True)
            
            # Execute divine move
            success, message = self.move_file_safely(file_info["path"], dest_dir)
            
            if success:
                files_moved += 1
                print(f"  🙏 [{files_moved}/{len(all_files)}] SAVED: {file_path.name} → {volume['mount_point']}")
            else:
                print(f"  💀 FAILED: {message}")
                
            # Rotate to next volume for distribution
            current_volume_idx += 1
            
        print(f"\n🌟 DIVINE INTERVENTION COMPLETE!")
        print(f"✅ Files rescued: {files_moved}/{len(all_files)}")
        
        if files_moved == len(all_files):
            print("🎉 MIRACLE ACHIEVED - All media files saved!")
        else:
            print("⚠️ Partial rescue completed - some files may need manual intervention")
            
        return files_moved > 0
        
    def party_mode_distribution(self, source_path, media_files, total_size):
        """🎉 PARTY MODE - Everybody's Coming to the Party! Smart distribution across your media empire"""
        print("\n🎉 PARTY MODE ACTIVATED - EVERYBODY'S COMING TO THE PARTY!")
        print("=" * 70)
        print("🏰 Analyzing your MEDIA EMPIRE for optimal distribution...")
        
        # Define your volume purposes based on their contents
        volume_specialties = {
            "/Volumes/4TB Lacie": {
                "specialty": "Music Production & Design",
                "audio_priority": 10,
                "video_priority": 8,
                "icon": "🎵"
            },
            "/Volumes/4TB_Utility": {
                "specialty": "Project Backup & Utilities", 
                "audio_priority": 6,
                "video_priority": 9,
                "icon": "🔧"
            },
            "/Volumes/4TB BLK": {
                "specialty": "Sample Libraries & Beats",
                "audio_priority": 10,
                "video_priority": 3,
                "icon": "🥁"
            },
            "/Volumes/4TBSG": {
                "specialty": "NoizyFish Headquarters",
                "audio_priority": 9,
                "video_priority": 7,
                "icon": "🏢"
            },
            "/Volumes/12TB": {
                "specialty": "Movies & Large Media",
                "audio_priority": 5,
                "video_priority": 10,
                "icon": "🎬"
            },
            "/Volumes/JOE": {
                "specialty": "Movies & Live Shows",
                "audio_priority": 7,
                "video_priority": 10,
                "icon": "🎭"
            },
            "/Volumes/MAG 4TB": {
                "specialty": "Instruments & Drums",
                "audio_priority": 9,
                "video_priority": 4,
                "icon": "🎹"
            },
            "/Volumes/RED DRAGON": {
                "specialty": "Massive Sample Empire",
                "audio_priority": 10,
                "video_priority": 2,
                "icon": "🐉"
            },
            "/Volumes/SIDNEY": {
                "specialty": "Movie Vault",
                "audio_priority": 3,
                "video_priority": 10,
                "icon": "🎪"
            },
            "/Volumes/6TB": {
                "specialty": "Samples & Projects",
                "audio_priority": 8,
                "video_priority": 6,
                "icon": "📦"
            }
        }
        
        # Find available party volumes
        party_volumes = []
        for mount_point, info in self.volumes.items():
            if mount_point in volume_specialties:
                free_bytes = info["free_bytes"]
                if free_bytes > 5 * 1024 * 1024 * 1024:  # At least 5GB free
                    specialty_info = volume_specialties[mount_point]
                    party_volumes.append({
                        "mount_point": mount_point,
                        "free_space": free_bytes,
                        "available_formatted": info["available"],
                        "specialty": specialty_info["specialty"],
                        "audio_priority": specialty_info["audio_priority"],
                        "video_priority": specialty_info["video_priority"],
                        "icon": specialty_info["icon"]
                    })
        
        if not party_volumes:
            print("💀 NO PARTY VOLUMES AVAILABLE!")
            return False
            
        print(f"\n🎊 PARTY GUEST LIST - {len(party_volumes)} VOLUMES READY:")
        for vol in party_volumes:
            print(f"   {vol['icon']} {vol['mount_point']} - {vol['specialty']}")
            print(f"     Available: {vol['available_formatted']}")
            
        # Smart distribution based on content type and volume specialty
        audio_files = media_files["audio"]
        video_files = media_files["video"]
        
        # Sort volumes by priority for each media type
        audio_volumes = sorted(party_volumes, key=lambda x: x["audio_priority"], reverse=True)
        video_volumes = sorted(party_volumes, key=lambda x: x["video_priority"], reverse=True)
        
        print(f"\n🎵 AUDIO PARTY PLAN ({len(audio_files)} files):")
        audio_distribution = self.create_smart_distribution(audio_files, audio_volumes)
        
        print(f"\n🎬 VIDEO PARTY PLAN ({len(video_files)} files):")
        video_distribution = self.create_smart_distribution(video_files, video_volumes)
        
        # Execute the party!
        total_moved = 0
        
        print(f"\n🚀 STARTING THE PARTY - MOVING {len(audio_files + video_files)} FILES!")
        
        # Move audio files
        for volume_info, files in audio_distribution.items():
            if files:
                total_moved += self.execute_party_move(
                    files, volume_info, source_path, "Audio", "🎵"
                )
                
        # Move video files  
        for volume_info, files in video_distribution.items():
            if files:
                total_moved += self.execute_party_move(
                    files, volume_info, source_path, "Video", "🎬"
                )
                
        print(f"\n🎉 PARTY COMPLETE!")
        print(f"✨ Total files moved: {total_moved}")
        print(f"🏰 Your media empire has welcomed the Aquarium refugees!")
        
        return total_moved > 0
        
    def create_smart_distribution(self, files, volumes):
        """Create smart distribution plan based on volume priorities and space"""
        distribution = {}
        
        # Sort files by size (largest first)
        sorted_files = sorted(files, key=lambda x: x["size"], reverse=True)
        
        # Distribute files across volumes based on their capacity and priority
        volume_usage = {vol["mount_point"]: 0 for vol in volumes}
        
        for file_info in sorted_files:
            # Find best volume (highest priority with available space)
            best_volume = None
            best_score = -1
            
            for vol in volumes:
                mount_point = vol["mount_point"]
                current_usage = volume_usage[mount_point]
                available_space = vol["free_space"] - current_usage
                
                # Score based on priority and available space
                if available_space > file_info["size"] * 1.1:  # 10% safety margin
                    priority_score = vol.get("audio_priority", 5) if "audio" in str(file_info["path"]).lower() else vol.get("video_priority", 5)
                    space_score = available_space / (1024 * 1024 * 1024)  # GB available
                    total_score = priority_score * 10 + min(space_score, 100)  # Cap space score
                    
                    if total_score > best_score:
                        best_score = total_score
                        best_volume = vol
                        
            if best_volume:
                mount_point = best_volume["mount_point"]
                if mount_point not in distribution:
                    distribution[mount_point] = []
                distribution[mount_point].append(file_info)
                volume_usage[mount_point] += file_info["size"]
                
        # Print distribution plan
        for mount_point, files in distribution.items():
            if files:
                vol_info = next(v for v in volumes if v["mount_point"] == mount_point)
                total_size = sum(f["size"] for f in files)
                print(f"   {vol_info['icon']} {mount_point}: {len(files)} files ({self.format_size(total_size)})")
                
        return distribution
        
    def execute_party_move(self, files, volume_mount, source_path, media_type, icon):
        """Execute the actual file moves for party mode"""
        print(f"\n{icon} Moving {len(files)} {media_type.lower()} files to {volume_mount}...")
        
        # Create party destination
        base_name = Path(source_path).name
        party_dir = Path(volume_mount) / "AQUARIUM_PARTY_2025" / base_name / media_type
        party_dir.mkdir(parents=True, exist_ok=True)
        
        moved_count = 0
        for i, file_info in enumerate(files):
            success, message = self.move_file_safely(file_info["path"], party_dir)
            if success:
                moved_count += 1
                print(f"  🎊 [{i+1}/{len(files)}] {Path(file_info['path']).name}")
            else:
                print(f"  💀 [{i+1}/{len(files)}] FAILED: {Path(file_info['path']).name}")
                
        print(f"✨ {volume_mount}: {moved_count}/{len(files)} files moved successfully!")
        return moved_count
        
    def distribute_across_volumes(self, source_path, media_files, total_size):
        print(f"\n🌊 Distributing {self.format_size(total_size)} across multiple volumes...")
        
        suitable_volumes = self.find_best_destination(total_size)
        
        if not suitable_volumes:
            print("❌ No suitable volumes found for migration!")
            return False
            
        # Sort files by size (largest first for better distribution)
        all_files = media_files["audio"] + media_files["video"]
        all_files.sort(key=lambda x: x["size"], reverse=True)
        
        # Distribute files across volumes
        volume_allocations = {vol["mount_point"]: [] for vol in suitable_volumes}
        volume_usage = {vol["mount_point"]: 0 for vol in suitable_volumes}
        
        for file_info in all_files:
            # Find volume with most available space
            best_volume = min(volume_usage.keys(), key=lambda v: volume_usage[v])
            volume_allocations[best_volume].append(file_info)
            volume_usage[best_volume] += file_info["size"]
            
        # Execute distribution
        for volume, files in volume_allocations.items():
            if files:
                print(f"\n📦 Allocating {len(files)} files to {volume}")
                print(f"   Total size: {self.format_size(sum(f['size'] for f in files))}")
                
                # Create simplified structure for distribution
                base_name = Path(source_path).name
                audio_dest = Path(volume) / "Media_Migration" / base_name / "Audio"
                video_dest = Path(volume) / "Media_Migration" / base_name / "Video"
                
                audio_dest.mkdir(parents=True, exist_ok=True)
                video_dest.mkdir(parents=True, exist_ok=True)
                
                for file_info in files:
                    file_path = Path(file_info["path"])
                    if file_path.suffix.lower() in self.audio_extensions:
                        dest_dir = audio_dest
                    else:
                        dest_dir = video_dest
                        
                    success, message = self.move_file_safely(file_info["path"], dest_dir)
                    print(f"  {message}")
                    
        return True
        
    def print_volume_info(self):
        """Print information about available volumes"""
        print("\n💾 Available Volumes:")
        print("=" * 50)
        
        for mount_point, info in self.volumes.items():
            print(f"📍 {mount_point}")
            print(f"   Available: {info['available']}")
            print(f"   Total: {info['total_size']}")
            print(f"   Used: {info['used']}")
            print()
            
    def print_migration_summary(self):
        """Print migration summary"""
        runtime = time.time() - self.migration_stats["start_time"]
        
        print("\n" + "=" * 60)
        print("🎬 BOBBY MEDIA MIGRATION SUMMARY")
        print("=" * 60)
        print(f"⏱️  Runtime: {runtime:.1f} seconds")
        print(f"📁 Files moved: {self.migration_stats['files_moved']}")
        print(f"💾 Total size: {self.format_size(self.migration_stats['total_size'])}")
        print(f"⚠️  Errors: {self.migration_stats['errors']}")
        
        if self.migration_stats["files_moved"] > 0:
            avg_speed = self.migration_stats["total_size"] / runtime / (1024 * 1024)
            print(f"🚀 Average speed: {avg_speed:.1f} MB/s")
            
        print("=" * 60)

def main():
    """Main media migration interface"""
    print("🎬 Bobby Media Migrator - Smart Audio & Video Management")
    print("=" * 60)
    
    migrator = BobbyMediaMigrator()
    
    # Show available volumes
    migrator.print_volume_info()
    
    # Get source path
    aquarium_path = "/Users/rsp_ms/NoizyFish_Aquarium"
    
    print(f"🔍 Analyzing media files in: {aquarium_path}")
    
    if not Path(aquarium_path).exists():
        print(f"❌ Source path not found: {aquarium_path}")
        return
        
    # Scan for media files
    media_files, total_size = migrator.scan_media_files(aquarium_path)
    
    audio_count = len(media_files["audio"])
    video_count = len(media_files["video"])
    
    print(f"\n📊 Media Analysis Results:")
    print(f"🎵 Audio files: {audio_count}")
    print(f"🎬 Video files: {video_count}")
    print(f"💾 Total size: {migrator.format_size(total_size)}")
    
    if audio_count == 0 and video_count == 0:
        print("✅ No media files found to migrate!")
        return
        
    # Find best migration strategy
    suitable_volumes = migrator.find_best_destination(total_size)
    
    if not suitable_volumes:
        print("❌ No volumes with sufficient space found!")
        print("💡 Consider using distribution mode to spread files across multiple volumes.")
        
        # Offer distribution option
        distribute = input("\n🌊 Would you like to distribute files across multiple volumes? (y/n): ")
        if distribute.lower().startswith('y'):
            success = migrator.distribute_across_volumes(aquarium_path, media_files, total_size)
            if success:
                print("✅ Distribution completed!")
        return
        
        # Show migration options
        print(f"\n🎯 Migration Options:")
        for i, vol in enumerate(suitable_volumes[:3], 1):  # Show top 3 options
            print(f"{i}. {vol['mount_point']} (Available: {vol['available_formatted']})")
            
        print(f"{len(suitable_volumes) + 1}. 🌊 Distribute across multiple volumes")
        print(f"{len(suitable_volumes) + 2}. 🎉 PARTY MODE - Everybody's Coming to the Party!")
        print(f"{len(suitable_volumes) + 3}. 🙏 HAND OF GOD - Emergency evacuation to ANY volume")
        print(f"{len(suitable_volumes) + 4}. ❌ Cancel")
        
        try:
            choice = int(input(f"\nSelect option (1-{len(suitable_volumes) + 4}): "))
            
            if choice <= len(suitable_volumes):
                selected_volume = suitable_volumes[choice - 1]["mount_point"]
                confirm = input(f"\n⚠️ This will move all media files to {selected_volume}. Continue? (y/n): ")
                
                if confirm.lower().startswith('y'):
                    migrator.migrate_media_files(aquarium_path, media_files, selected_volume)
                    print("✅ Migration completed!")
                else:
                    print("❌ Migration cancelled.")
                    
            elif choice == len(suitable_volumes) + 1:
                confirm = input("\n⚠️ This will distribute files across multiple volumes. Continue? (y/n): ")
                if confirm.lower().startswith('y'):
                    success = migrator.distribute_across_volumes(aquarium_path, media_files, total_size)
                    if success:
                        print("✅ Distribution completed!")
                else:
                    print("❌ Distribution cancelled.")
                    
            elif choice == len(suitable_volumes) + 2:
                print("\n🎉 ACTIVATING PARTY MODE...")
                print("🏰 Analyzing your media empire for the ultimate distribution!")
                confirm = input("🎊 Ready to throw the biggest media party ever? (y/n): ")
                if confirm.lower().startswith('y'):
                    success = migrator.party_mode_distribution(aquarium_path, media_files, total_size)
                    if success:
                        print("🎉 THE PARTY WAS EPIC! All files distributed across your empire!")
                    else:
                        print("😢 Party cancelled due to technical difficulties...")
                else:
                    print("🎭 Party postponed.")
                    
            elif choice == len(suitable_volumes) + 3:
                print("\n🙏 ACTIVATING HAND OF GOD MODE...")
                confirm = input("⚡ This will use DIVINE INTERVENTION to save your media files. Continue? (y/n): ")
                if confirm.lower().startswith('y'):
                    success = migrator.hand_of_god_migration(aquarium_path, media_files, total_size)
                    if success:
                        print("🌟 DIVINE INTERVENTION SUCCESSFUL!")
                    else:
                        print("💀 Even divine powers have limits...")
                else:
                    print("🙏 Divine intervention cancelled.")
                    
            else:
                print("❌ Migration cancelled.")
                
        except (ValueError, KeyboardInterrupt):
            print("❌ Operation cancelled.")

if __name__ == "__main__":
    main()