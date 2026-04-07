#!/usr/bin/env python3
"""
🎪 Bobby Master Control - Ultimate Bobby Management Suite
Integration hub for all Bobby agents and tools.
"""

import os
import sys
import json
import argparse
from pathlib import Path
import subprocess
import threading
import time

# Import all Bobby modules
try:
    from bobby_dashboard_elite import BobbyDashboard
    from bobby_commander import BobbyCommander
    from bobby_ai import BobbyAI
    from bobby_media_migrator import BobbyMediaMigrator
except ImportError as e:
    print(f"⚠️ Import error: {e}")
    print("Make sure all Bobby modules are in the same directory")

class BobbyMaster:
    def __init__(self):
        self.version = "2.0.0"
        self.agents = {
            "dashboard": None,
            "commander": None,
            "ai": None,
            "media_migrator": None
        }
        
    def print_master_banner(self):
        """Epic master control banner"""
        banner = """
    ██████╗  ██████╗ ██████╗ ██████╗ ██╗   ██╗
    ██╔══██╗██╔═══██╗██╔══██╗██╔══██╗╚██╗ ██╔╝
    ██████╔╝██║   ██║██████╔╝██████╔╝ ╚████╔╝ 
    ██╔══██╗██║   ██║██╔══██╗██╔══██╗  ╚██╔╝  
    ██████╔╝╚██████╔╝██████╔╝██████╔╝   ██║   
    ╚═════╝  ╚═════╝ ╚═════╝ ╚═════╝    ╚═╝   
                                              
    🎪 BOBBY MASTER CONTROL 🎪
        Ultimate Management Suite
           Version {version}
        """.format(version=self.version)
        print("\033[95m" + banner + "\033[0m")
        
    def system_status(self):
        """Check system status and dependencies"""
        print("🔍 System Status Check")
        print("=" * 30)
        
        # Check Python version
        python_version = f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}"
        print(f"🐍 Python: {python_version} ✅")
        
        # Check fileicon
        try:
            subprocess.run(["fileicon", "--version"], capture_output=True, check=True)
            print("🖼️  fileicon: Available ✅")
        except (FileNotFoundError, subprocess.CalledProcessError):
            print("🖼️  fileicon: Missing ❌")
            print("   Install with: brew install fileicon")
            
        # Check Bobby modules
        modules = {
            "Dashboard Elite": "bobby_dashboard_elite.py",
            "Commander": "bobby_commander.py", 
            "AI Agent": "bobby_ai.py",
            "Media Migrator": "bobby_media_migrator.py"
        }
        
        for name, filename in modules.items():
            if Path(filename).exists():
                print(f"🚀 {name}: Available ✅")
            else:
                print(f"🚀 {name}: Missing ❌")
                
        # Check configuration
        if Path("bobby_config.json").exists():
            print("⚙️  Configuration: Found ✅")
        else:
            print("⚙️  Configuration: Not found ⚠️")
            
        print()
        
    def interactive_menu(self):
        """Interactive master control menu"""
        while True:
            print("\n🎪 Bobby Master Control")
            print("=" * 25)
            print("1. 🎨 Launch Dashboard Elite")
            print("2. 💻 Run Commander CLI")
            print("3. 🧠 AI Agent Insights")
            print("4. 🎬 Audio & Video Mission Control")
            print("5. 🔧 System Status")
            print("6. ⚙️  Configuration Wizard")
            print("7. 📊 Combined Statistics")
            print("8. 🚀 Super Ritual (All Agents)")
            print("9. 📖 Help & Documentation")
            print("10. 🚪 Exit")
            
            choice = input("\nSelect option (1-10): ").strip()
            
            if choice == "1":
                self.launch_dashboard()
            elif choice == "2":
                self.launch_commander()
            elif choice == "3":
                self.show_ai_insights()
            elif choice == "4":
                self.launch_media_mission_control()
            elif choice == "5":
                self.system_status()
            elif choice == "6":
                self.configuration_wizard()
            elif choice == "7":
                self.combined_statistics()
            elif choice == "8":
                self.super_ritual()
            elif choice == "9":
                self.show_help()
            elif choice == "10":
                print("👋 Goodbye from Bobby Master Control!")
                break
            else:
                print("❌ Invalid option. Please try again.")
                
    def launch_dashboard(self):
        """Launch the GUI dashboard"""
        print("🎨 Launching Bobby Dashboard Elite...")
        try:
            dashboard = BobbyDashboard()
            dashboard.run()
        except Exception as e:
            print(f"❌ Failed to launch dashboard: {e}")
            
    def launch_commander(self):
        """Launch the CLI commander"""
        print("💻 Launching Bobby Commander...")
        try:
            commander = BobbyCommander()
            commander.print_banner()
            
            # Simple CLI interface
            print("\nCommander Options:")
            print("1. Normal Ritual")
            print("2. Preview Mode")
            print("3. Configuration")
            
            choice = input("Select option (1-3): ").strip()
            
            if choice == "1":
                if commander.check_dependencies() and commander.validate_paths():
                    commander.ritualize_folders()
            elif choice == "2":
                if commander.check_dependencies() and commander.validate_paths():
                    commander.ritualize_folders(preview=True)
            elif choice == "3":
                commander.create_config_wizard()
                
        except Exception as e:
            print(f"❌ Failed to launch commander: {e}")
            
    def show_ai_insights(self):
        """Show AI insights"""
        print("🧠 Bobby AI Insights")
        print("=" * 20)
        
        try:
            ai = BobbyAI()
            insights = ai.generate_insights()
            recommendations = ai.generate_recommendations()
            
            if insights:
                print("\n🔍 Current Insights:")
                for insight in insights:
                    print(f"  {insight}")
            else:
                print("\n🔍 No insights available yet.")
                
            if recommendations:
                print("\n💡 Recommendations:")
                for rec in recommendations:
                    print(f"  {rec}")
                    
            print(f"\n🚫 Smart Exclude Patterns: {ai.smart_exclude_patterns()}")
            
        except Exception as e:
            print(f"❌ AI Error: {e}")
            
    def launch_media_mission_control(self):
        """Launch Audio & Video Mission Control"""
        print("🎬 Audio & Video Mission Control")
        print("=" * 35)
        
        try:
            migrator = BobbyMediaMigrator()
            
            print("\nMission Control Options:")
            print("1. 🔍 Scan Aquarium for Media Files")
            print("2. 💾 Show Available Volumes")
            print("3. 🚀 Quick Migration to Best Volume")
            print("4. 🌊 Distribute Across Multiple Volumes")
            print("5. 🙏 HAND OF GOD - Emergency Evacuation")
            print("6. 📊 Media Analysis Report")
            print("7. 🔙 Return to Main Menu")
            
            choice = input("\nSelect mission (1-7): ").strip()
            
            if choice == "1":
                print("\n🔍 Scanning NoizyFish Aquarium...")
                aquarium_path = "/Users/rsp_ms/NoizyFish_Aquarium"
                if Path(aquarium_path).exists():
                    media_files, total_size = migrator.scan_media_files(aquarium_path)
                    audio_count = len(media_files["audio"])
                    video_count = len(media_files["video"])
                    
                    print(f"\n📊 Media Scan Results:")
                    print(f"🎵 Audio files: {audio_count}")
                    print(f"🎬 Video files: {video_count}")
                    print(f"💾 Total size: {migrator.format_size(total_size)}")
                else:
                    print("❌ Aquarium path not found!")
                    
            elif choice == "2":
                migrator.print_volume_info()
                
            elif choice == "3":
                print("\n🚀 Quick Migration Mode")
                confirm = input("Execute quick migration to best available volume? (y/n): ")
                if confirm.lower().startswith('y'):
                    # Run the full migrator
                    print("Launching full migration interface...")
                    from bobby_media_migrator import main as run_migrator
                    run_migrator()
                    
            elif choice == "4":
                print("\n🌊 Distribution Mode")
                confirm = input("Distribute media files across multiple volumes? (y/n): ")
                if confirm.lower().startswith('y'):
                    print("Launching distribution interface...")
                    from bobby_media_migrator import main as run_migrator
                    run_migrator()
                    
            elif choice == "5":
                print("\n🙏 HAND OF GOD MODE")
                print("⚡ Divine intervention for emergency media evacuation!")
                confirm = input("Activate divine powers? (y/n): ")
                if confirm.lower().startswith('y'):
                    aquarium_path = "/Users/rsp_ms/NoizyFish_Aquarium"
                    if Path(aquarium_path).exists():
                        media_files, total_size = migrator.scan_media_files(aquarium_path)
                        if media_files["audio"] or media_files["video"]:
                            success = migrator.hand_of_god_migration(aquarium_path, media_files, total_size)
                            if success:
                                print("🌟 DIVINE INTERVENTION SUCCESSFUL!")
                            else:
                                print("💀 Even divine powers have limits...")
                        else:
                            print("✅ No media files found to evacuate!")
                    else:
                        print("❌ Aquarium path not found!")
                        
            elif choice == "6":
                print("\n📊 Generating Media Analysis Report...")
                aquarium_path = "/Users/rsp_ms/NoizyFish_Aquarium"
                if Path(aquarium_path).exists():
                    media_files, total_size = migrator.scan_media_files(aquarium_path)
                    
                    # Generate detailed report
                    print("\n" + "=" * 50)
                    print("📊 BOBBY MEDIA ANALYSIS REPORT")
                    print("=" * 50)
                    print(f"📁 Source: {aquarium_path}")
                    print(f"🎵 Audio files: {len(media_files['audio'])}")
                    print(f"🎬 Video files: {len(media_files['video'])}")
                    print(f"💾 Total size: {migrator.format_size(total_size)}")
                    
                    if media_files["audio"]:
                        largest_audio = max(media_files["audio"], key=lambda x: x["size"])
                        print(f"🎵 Largest audio: {Path(largest_audio['path']).name} ({largest_audio['size_formatted']})")
                        
                    if media_files["video"]:
                        largest_video = max(media_files["video"], key=lambda x: x["size"])
                        print(f"🎬 Largest video: {Path(largest_video['path']).name} ({largest_video['size_formatted']})")
                        
                    print("=" * 50)
                else:
                    print("❌ Aquarium path not found!")
                    
            elif choice == "7":
                return
            else:
                print("❌ Invalid mission selected.")
                
        except Exception as e:
            print(f"❌ Mission Control Error: {e}")
            
    def configuration_wizard(self):
        """Unified configuration wizard"""
        print("🔧 Bobby Configuration Wizard")
        print("=" * 30)
        
        config = {}
        config_path = Path("bobby_config.json")
        
        # Load existing config
        if config_path.exists():
            try:
                with open(config_path, 'r') as f:
                    config = json.load(f)
            except:
                pass
                
        # Configure Bobby icon path
        current_icon = config.get("bobby_icon_path", "")
        print(f"\nCurrent Bobby icon: {current_icon}")
        new_icon = input("Enter Bobby icon path (or press Enter to keep current): ").strip()
        if new_icon:
            config["bobby_icon_path"] = new_icon
            
        # Configure target directory
        current_target = config.get("target_root", "")
        print(f"\nCurrent target directory: {current_target}")
        new_target = input("Enter target directory (or press Enter to keep current): ").strip()
        if new_target:
            config["target_root"] = new_target
            
        # Advanced options
        print("\nAdvanced Options:")
        config["auto_backup"] = input("Enable auto backup? (y/n): ").lower().startswith('y')
        config["verbose_logging"] = input("Enable verbose logging? (y/n): ").lower().startswith('y')
        
        # Exclude patterns
        exclude_input = input("Enter exclude patterns (comma-separated): ").strip()
        if exclude_input:
            config["exclude_patterns"] = [p.strip() for p in exclude_input.split(',')]
        else:
            config["exclude_patterns"] = [".git", ".DS_Store", "__pycache__"]
            
        # Save configuration
        with open(config_path, 'w') as f:
            json.dump(config, f, indent=2)
            
        print("✅ Configuration saved!")
        
    def combined_statistics(self):
        """Show combined statistics from all agents"""
        print("📊 Combined Bobby Statistics")
        print("=" * 30)
        
        # Check for log files
        log_files = ["bobby_ritual.log"]
        ai_data_file = "bobby_ai_data.json"
        
        total_operations = 0
        total_successes = 0
        
        # Parse log files
        for log_file in log_files:
            if Path(log_file).exists():
                try:
                    with open(log_file, 'r') as f:
                        lines = f.readlines()
                        for line in lines:
                            if "Icon applied" in line:
                                total_successes += 1
                                total_operations += 1
                            elif "Failed to apply" in line:
                                total_operations += 1
                except:
                    pass
                    
        # AI data
        if Path(ai_data_file).exists():
            try:
                with open(ai_data_file, 'r') as f:
                    ai_data = json.load(f)
                    history_count = len(ai_data.get("success_history", []))
                    print(f"🧠 AI Learning Records: {history_count}")
            except:
                pass
                
        print(f"📈 Total Operations: {total_operations}")
        print(f"✅ Total Successes: {total_successes}")
        if total_operations > 0:
            success_rate = (total_successes / total_operations) * 100
            print(f"🎯 Overall Success Rate: {success_rate:.1f}%")
            
    def super_ritual(self):
        """Run super ritual with all agents"""
        print("🚀 Super Ritual - All Agents Activated!")
        print("=" * 40)
        
        # Initialize AI
        ai = BobbyAI()
        
        # Get AI recommendations
        recommendations = ai.generate_recommendations()
        if recommendations:
            print("🧠 AI Pre-flight Recommendations:")
            for rec in recommendations:
                print(f"  {rec}")
                
        # Confirm execution
        confirm = input("\nProceed with Super Ritual? (y/n): ").lower().startswith('y')
        if not confirm:
            print("Super Ritual cancelled.")
            return
            
        # Run with Commander engine
        try:
            commander = BobbyCommander()
            
            if commander.check_dependencies() and commander.validate_paths():
                print("🎯 Executing Super Ritual...")
                commander.ritualize_folders(verbose=True)
                print("🌟 Super Ritual completed!")
            else:
                print("❌ Pre-flight checks failed.")
                
        except Exception as e:
            print(f"❌ Super Ritual error: {e}")
            
    def show_help(self):
        """Show help and documentation"""
        help_text = """
    📖 Bobby Master Control Help
    ============================
    
    🎨 Dashboard Elite:
       - Modern GUI interface
       - Real-time monitoring
       - Visual statistics
       - Configuration management
       
    💻 Commander CLI:
       - Command-line interface
       - Batch processing
       - Advanced options
       - Progress tracking
       
    🧠 AI Agent:
       - Machine learning insights
       - Performance optimization
       - Smart recommendations
       - Pattern recognition
       
    🚀 Super Ritual:
       - All agents combined
       - AI-optimized execution
       - Maximum performance
       - Comprehensive logging
       
    Configuration Files:
    - bobby_config.json: Main configuration
    - bobby_ai_data.json: AI learning data
    - bobby_ritual.log: Operation logs
    
    Dependencies:
    - fileicon: brew install fileicon
    - Python 3.6+
    - tkinter (for GUI)
    
    For more help, visit the documentation or check the README.md
        """
        print(help_text)

def main():
    """Main entry point for Bobby Master Control"""
    master = BobbyMaster()
    
    parser = argparse.ArgumentParser(description="Bobby Master Control")
    parser.add_argument("--dashboard", action="store_true", help="Launch dashboard directly")
    parser.add_argument("--commander", action="store_true", help="Launch commander directly")
    parser.add_argument("--ai", action="store_true", help="Show AI insights")
    parser.add_argument("--status", action="store_true", help="Show system status")
    parser.add_argument("--super", action="store_true", help="Run super ritual")
    
    args = parser.parse_args()
    
    master.print_master_banner()
    
    # Direct commands
    if args.dashboard:
        master.launch_dashboard()
    elif args.commander:
        master.launch_commander()
    elif args.ai:
        master.show_ai_insights()
    elif args.status:
        master.system_status()
    elif args.super:
        master.super_ritual()
    else:
        # Interactive menu
        master.system_status()
        master.interactive_menu()

if __name__ == "__main__":
    main()