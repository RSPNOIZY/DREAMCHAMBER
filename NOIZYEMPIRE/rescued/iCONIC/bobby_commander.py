#!/usr/bin/env python3
"""
🌟 Bobby CLI Commander - Advanced Command Line Interface
Elite command-line version with powerful features and automation.
"""

import os
import sys
import json
import time
import argparse
from pathlib import Path
import subprocess
from datetime import datetime
import threading
import signal

class BobbyCommander:
    def __init__(self):
        self.config = self.load_config()
        self.stats = {
            "total_folders": 0,
            "icons_applied": 0,
            "icons_preserved": 0,
            "errors": 0,
            "start_time": None
        }
        self.is_running = True
        
    def load_config(self):
        """Load configuration"""
        default_config = {
            "bobby_icon_path": "/Users/rob/Desktop/bobby_bg.png",
            "target_root": "/Users/rob/Documents",
            "icon_file_name": "Icon\r",
            "exclude_patterns": [".git", ".DS_Store", "__pycache__", ".vscode"],
            "log_file": "bobby_ritual.log"
        }
        
        config_path = Path("bobby_config.json")
        if config_path.exists():
            try:
                with open(config_path, 'r') as f:
                    saved_config = json.load(f)
                    default_config.update(saved_config)
            except Exception as e:
                print(f"⚠️ Failed to load config: {e}")
                
        return default_config
        
    def log(self, message, level="INFO", color=True):
        """Enhanced logging with colors and file output"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_entry = f"[{timestamp}] {level}: {message}"
        
        # Console output with colors
        if color and sys.stdout.isatty():
            colors = {
                "INFO": "\033[36m",      # Cyan
                "SUCCESS": "\033[92m",   # Green
                "ERROR": "\033[91m",     # Red
                "WARNING": "\033[93m",   # Yellow
                "RESET": "\033[0m"
            }
            colored_entry = f"{colors.get(level, '')}{log_entry}{colors['RESET']}"
            print(colored_entry)
        else:
            print(log_entry)
            
        # File output
        try:
            with open(self.config["log_file"], 'a') as f:
                f.write(log_entry + "\n")
        except:
            pass
            
    def print_banner(self):
        """Print epic ASCII banner"""
        banner = """
    ██████╗  ██████╗ ██████╗ ██████╗ ██╗   ██╗
    ██╔══██╗██╔═══██╗██╔══██╗██╔══██╗╚██╗ ██╔╝
    ██████╔╝██║   ██║██████╔╝██████╔╝ ╚████╔╝ 
    ██╔══██╗██║   ██║██╔══██╗██╔══██╗  ╚██╔╝  
    ██████╔╝╚██████╔╝██████╔╝██████╔╝   ██║   
    ╚═════╝  ╚═════╝ ╚═════╝ ╚═════╝    ╚═╝   
                                              
    🚀 BOBBY COMMANDER ELITE 🚀
    Advanced Icon Automation System
        """
        print("\033[95m" + banner + "\033[0m")
        
    def check_dependencies(self):
        """Check for required dependencies"""
        self.log("Checking dependencies...", "INFO")
        
        try:
            result = subprocess.run(["fileicon", "--version"], 
                                  capture_output=True, text=True, check=True)
            self.log("✅ fileicon found", "SUCCESS")
            return True
        except (FileNotFoundError, subprocess.CalledProcessError):
            self.log("❌ fileicon not found. Install with: brew install fileicon", "ERROR")
            return False
            
    def validate_paths(self):
        """Validate configuration paths"""
        if not Path(self.config["bobby_icon_path"]).exists():
            self.log(f"❌ Bobby icon not found: {self.config['bobby_icon_path']}", "ERROR")
            return False
            
        if not Path(self.config["target_root"]).exists():
            self.log(f"❌ Target directory not found: {self.config['target_root']}", "ERROR")
            return False
            
        self.log("✅ All paths validated", "SUCCESS")
        return True
        
    def has_custom_icon(self, folder_path):
        """Check if folder has custom icon"""
        icon_file = Path(folder_path) / self.config["icon_file_name"]
        return icon_file.exists()
        
    def apply_icon(self, folder_path, preview=False):
        """Apply Bobby icon to folder"""
        if preview:
            self.log(f"PREVIEW: Would apply icon to {folder_path}", "INFO")
            return True
            
        try:
            subprocess.run([
                "fileicon", "set", folder_path, self.config["bobby_icon_path"]
            ], check=True, capture_output=True)
            self.log(f"✅ Icon applied: {folder_path}", "SUCCESS")
            self.stats["icons_applied"] += 1
            return True
        except subprocess.CalledProcessError:
            self.log(f"⚠️ Failed to apply icon: {folder_path}", "ERROR")
            self.stats["errors"] += 1
            return False
            
    def signal_handler(self, signum, frame):
        """Handle interrupt signals gracefully"""
        self.log("\n🛑 Ritual interrupted by user", "WARNING")
        self.is_running = False
        
    def ritual_progress_bar(self, current, total, width=50):
        """Display progress bar"""
        if total == 0:
            percent = 0
        else:
            percent = (current / total) * 100
        filled = int(width * current // total) if total > 0 else 0
        bar = "█" * filled + "░" * (width - filled)
        sys.stdout.write(f"\r🔄 Progress: |{bar}| {percent:.1f}% ({current}/{total})")
        sys.stdout.flush()
        
    def ritualize_folders(self, preview=False, verbose=False, batch_size=10):
        """Main folder processing with enhanced features"""
        signal.signal(signal.SIGINT, self.signal_handler)
        
        self.stats["start_time"] = time.time()
        mode = "PREVIEW" if preview else "LIVE"
        self.log(f"🚀 Starting Bobby ritual in {mode} mode...", "INFO")
        
        # First pass: count total folders
        total_folders = 0
        for root, dirs, _ in os.walk(self.config["target_root"]):
            dirs[:] = [d for d in dirs if not any(pattern in d for pattern in self.config["exclude_patterns"])]
            total_folders += len(dirs)
            
        self.log(f"📊 Found {total_folders} folders to process", "INFO")
        processed = 0
        
        # Second pass: process folders
        try:
            for root, dirs, _ in os.walk(self.config["target_root"]):
                if not self.is_running:
                    break
                    
                # Filter excluded patterns
                dirs[:] = [d for d in dirs if not any(pattern in d for pattern in self.config["exclude_patterns"])]
                
                batch_folders = []
                for folder in dirs:
                    if not self.is_running:
                        break
                        
                    folder_path = os.path.join(root, folder)
                    batch_folders.append(folder_path)
                    
                    if len(batch_folders) >= batch_size:
                        self.process_batch(batch_folders, preview, verbose)
                        processed += len(batch_folders)
                        self.ritual_progress_bar(processed, total_folders)
                        batch_folders = []
                        
                # Process remaining folders in batch
                if batch_folders:
                    self.process_batch(batch_folders, preview, verbose)
                    processed += len(batch_folders)
                    self.ritual_progress_bar(processed, total_folders)
                    
        except Exception as e:
            self.log(f"💥 Unexpected error: {str(e)}", "ERROR")
            
        print()  # New line after progress bar
        self.print_final_stats()
        
    def process_batch(self, folders, preview, verbose):
        """Process a batch of folders"""
        for folder_path in folders:
            self.stats["total_folders"] += 1
            
            if not self.has_custom_icon(folder_path):
                self.apply_icon(folder_path, preview)
            else:
                if verbose:
                    self.log(f"🛡️ Custom icon preserved: {folder_path}", "INFO")
                self.stats["icons_preserved"] += 1
                
            time.sleep(0.01)  # Small delay to prevent overwhelming the system
            
    def print_final_stats(self):
        """Print final statistics"""
        runtime = time.time() - self.stats["start_time"]
        
        print("\n" + "="*60)
        print("📊 BOBBY RITUAL STATISTICS")
        print("="*60)
        print(f"⏱️  Runtime: {runtime:.2f} seconds")
        print(f"📁 Total folders: {self.stats['total_folders']}")
        print(f"✅ Icons applied: {self.stats['icons_applied']}")
        print(f"🛡️  Icons preserved: {self.stats['icons_preserved']}")
        print(f"⚠️  Errors: {self.stats['errors']}")
        
        if self.stats["total_folders"] > 0:
            success_rate = ((self.stats["icons_applied"] + self.stats["icons_preserved"]) / 
                          self.stats["total_folders"]) * 100
            print(f"🎯 Success rate: {success_rate:.1f}%")
            
        print("="*60)
        
    def create_config_wizard(self):
        """Interactive configuration wizard"""
        print("\n🧙 Bobby Configuration Wizard")
        print("="*40)
        
        # Bobby icon path
        current_icon = self.config["bobby_icon_path"]
        print(f"\nCurrent Bobby icon: {current_icon}")
        new_icon = input("Enter new Bobby icon path (or press Enter to keep current): ").strip()
        if new_icon:
            self.config["bobby_icon_path"] = new_icon
            
        # Target directory
        current_target = self.config["target_root"]
        print(f"\nCurrent target directory: {current_target}")
        new_target = input("Enter new target directory (or press Enter to keep current): ").strip()
        if new_target:
            self.config["target_root"] = new_target
            
        # Save configuration
        config_path = Path("bobby_config.json")
        with open(config_path, 'w') as f:
            json.dump(self.config, f, indent=2)
            
        self.log("💾 Configuration saved!", "SUCCESS")

def main():
    """Main CLI entry point"""
    parser = argparse.ArgumentParser(
        description="🚀 Bobby Commander Elite - Advanced Icon Automation",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  bobby_commander.py                    # Run normal ritual
  bobby_commander.py --preview          # Preview mode (no changes)
  bobby_commander.py --verbose          # Verbose output
  bobby_commander.py --config           # Configuration wizard
  bobby_commander.py --stats            # Show statistics only
        """
    )
    
    parser.add_argument("--preview", action="store_true",
                       help="Preview mode - show what would be done without making changes")
    parser.add_argument("--verbose", "-v", action="store_true",
                       help="Enable verbose output")
    parser.add_argument("--config", action="store_true",
                       help="Run configuration wizard")
    parser.add_argument("--batch-size", type=int, default=10,
                       help="Number of folders to process in each batch")
    parser.add_argument("--stats", action="store_true",
                       help="Show previous ritual statistics")
    parser.add_argument("--no-banner", action="store_true",
                       help="Skip the ASCII banner")
    
    args = parser.parse_args()
    
    commander = BobbyCommander()
    
    if not args.no_banner:
        commander.print_banner()
        
    if args.config:
        commander.create_config_wizard()
        return
        
    if args.stats:
        commander.print_final_stats()
        return
        
    # Check dependencies and validate paths
    if not commander.check_dependencies():
        return
        
    if not commander.validate_paths():
        return
        
    # Run the ritual
    commander.ritualize_folders(
        preview=args.preview,
        verbose=args.verbose,
        batch_size=args.batch_size
    )

if __name__ == "__main__":
    main()