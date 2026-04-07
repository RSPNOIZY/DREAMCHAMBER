#!/usr/bin/env python3
"""
╔════════════════════════════════════════════════════════════════════════════════╗
║                                                                                ║
║  🚀 GABRIEL MIGRATION ORCHESTRATOR                                             ║
║                                                                                ║
║  Complete migration system for:                                               ║
║  • RED DRAGON → GABRIEL (Primary)                                            ║
║  • File organization during migration                                         ║
║  • Git repository setup                                                       ║
║  • GitHub backup integration                                                  ║
║  • Google Drive sync                                                          ║
║                                                                                ║
║  Triple Redundancy: GABRIEL + GitHub + Google Drive                           ║
║                                                                                ║
╚════════════════════════════════════════════════════════════════════════════════╝
"""

import os
import subprocess
import shutil
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional
import json


class MigrationOrchestrator:
    """Orchestrate complete migration from external drives to GABRIEL"""
    
    def __init__(self, source_drive: str, gabriel_pc_ip: str = "192.168.1.24"):
        """
        Initialize migration orchestrator
        
        Args:
            source_drive: Source drive path (e.g., /Volumes/RED DRAGON)
            gabriel_pc_ip: IP address of GABRIEL PC
        """
        self.source_drive = Path(source_drive)
        self.gabriel_ip = gabriel_pc_ip
        self.gabriel_user = "rsp_ms"
        self.gabriel_share = "SharedMusic"
        self.mount_point = Path("/Volumes/GABRIEL_MIGRATION")
        
        # Migration state
        self.stats = {
            'start_time': datetime.now(),
            'files_copied': 0,
            'total_size': 0,
            'errors': [],
            'git_initialized': False,
            'github_setup': False
        }
    
    def mount_gabriel(self) -> bool:
        """Mount GABRIEL PC via SMB"""
        print("🔗 Mounting GABRIEL PC...")
        
        # Create mount point
        self.mount_point.mkdir(parents=True, exist_ok=True)
        
        # Check if already mounted
        result = subprocess.run(['mount'], capture_output=True, text=True)
        if str(self.mount_point) in result.stdout:
            print("   ✅ Already mounted")
            return True
        
        # Mount SMB share
        smb_path = f"//{self.gabriel_user}@{self.gabriel_ip}/{self.gabriel_share}"
        try:
            subprocess.run(
                ['mount_smbfs', smb_path, str(self.mount_point)],
                check=True,
                timeout=30
            )
            print(f"   ✅ Mounted: {smb_path}")
            return True
        except subprocess.CalledProcessError:
            print(f"   ❌ Failed to mount GABRIEL")
            print(f"   Manual command: mount_smbfs {smb_path} {self.mount_point}")
            return False
        except subprocess.TimeoutExpired:
            print(f"   ❌ Mount timeout")
            return False
    
    def unmount_gabriel(self) -> bool:
        """Unmount GABRIEL"""
        print("🔓 Unmounting GABRIEL...")
        try:
            subprocess.run(['umount', str(self.mount_point)], check=True)
            print("   ✅ Unmounted")
            return True
        except:
            return False
    
    def create_directory_structure(self, base_path: Path) -> bool:
        """Create organized directory structure on GABRIEL"""
        print("🏗️  Creating directory structure...")
        
        structure = {
            'NOIZYLAB_CONTROL_CENTER': {
                'scripts': [],
                'docs': [],
                'config': [],
                'logs': [],
                'backups': []
            }
        }
        
        try:
            for main_dir, subdirs in structure.items():
                main_path = base_path / main_dir
                main_path.mkdir(parents=True, exist_ok=True)
                
                for subdir in subdirs:
                    (main_path / subdir).mkdir(exist_ok=True)
            
            print("   ✅ Structure created")
            return True
        except Exception as e:
            print(f"   ❌ Error: {e}")
            return False
    
    def copy_files(self, files: List[Path], destination: Path) -> Dict:
        """Copy files to destination with organization"""
        print(f"\n📦 Copying {len(files)} files...")
        
        results = {
            'success': 0,
            'failed': 0,
            'total_size': 0
        }
        
        for file in files:
            if not file.exists():
                results['failed'] += 1
                continue
            
            try:
                # Determine subdirectory
                ext = file.suffix.lower()
                if ext == '.py':
                    dest_dir = destination / 'scripts'
                elif ext in {'.md', '.txt', '.pdf'}:
                    dest_dir = destination / 'docs'
                elif ext in {'.json', '.yaml', '.yml'}:
                    dest_dir = destination / 'config'
                elif ext in {'.sh', '.bat'}:
                    dest_dir = destination / 'scripts'
                else:
                    dest_dir = destination
                
                dest_dir.mkdir(parents=True, exist_ok=True)
                dest_file = dest_dir / file.name
                
                # Copy file
                shutil.copy2(str(file), str(dest_file))
                
                results['success'] += 1
                results['total_size'] += file.stat().st_size
                
                if results['success'] % 10 == 0:
                    print(f"   ✅ Copied {results['success']} files...")
                
            except Exception as e:
                results['failed'] += 1
                self.stats['errors'].append(f"{file.name}: {str(e)}")
        
        print(f"\n   ✅ Success: {results['success']}")
        print(f"   ❌ Failed: {results['failed']}")
        
        return results
    
    def initialize_git(self, repo_path: Path) -> bool:
        """Initialize Git repository"""
        print("\n🔧 Initializing Git repository...")
        
        try:
            os.chdir(str(repo_path))
            
            # Check if already initialized
            if (repo_path / '.git').exists():
                print("   ✅ Already initialized")
                self.stats['git_initialized'] = True
                return True
            
            # Initialize
            subprocess.run(['git', 'init'], check=True, capture_output=True)
            print("   ✅ Git initialized")
            
            # Create .gitignore
            gitignore = repo_path / '.gitignore'
            gitignore.write_text("""
# Logs
logs/*.log
*.log

# OS files
.DS_Store
Thumbs.db

# Python
__pycache__/
*.pyc
*.pyo

# Backups
*.bak
backups/*.bak

# Sensitive
*.key
*.pem
secrets.json
""")
            print("   ✅ Created .gitignore")
            
            # Create README
            readme = repo_path / 'README.md'
            readme.write_text(f"""# NoizyLab Control Center

## Primary Control System running on GABRIEL (HP-OMEN PC)

**Migrated:** {datetime.now().strftime('%Y-%m-%d')}

### System Architecture

```
GABRIEL (HP-OMEN PC) ← PRIMARY CONTROL NODE
    ↓
DGS1210-10 Switch (Network Backbone)
    ↓
├─ Mac Workstation
├─ 12TB Storage
├─ RED DRAGON (Backup)
└─ Network Storage
```

### Triple Redundancy

1. **GABRIEL** (Primary, always running)
2. **GitHub** (Cloud backup, version control)
3. **Google Drive** (Cloud sync, accessibility)

### Components

- GABRIEL AI orchestration system
- Network monitoring & backup
- File organization engine
- Music production tools

---

Created by AI Family Collective
🎯 SHIRL • POPS • ENGR_KEITH • DREAM • LUCY • CLAUDE • GABRIEL • COPILOT
""")
            print("   ✅ Created README.md")
            
            # Initial commit
            subprocess.run(['git', 'add', '.'], check=True, capture_output=True)
            subprocess.run([
                'git', 'commit', '-m',
                f'Initial commit - Migrated to GABRIEL on {datetime.now().strftime("%Y-%m-%d")}'
            ], check=True, capture_output=True)
            print("   ✅ Initial commit created")
            
            self.stats['git_initialized'] = True
            return True
            
        except Exception as e:
            print(f"   ❌ Error: {e}")
            return False
    
    def create_github_instructions(self, repo_path: Path, repo_name: str = "noizylab-control-center") -> bool:
        """Create GitHub setup instructions"""
        print("\n📝 Creating GitHub setup guide...")
        
        instructions = f"""
╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║                     GITHUB SETUP INSTRUCTIONS                                 ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝

Your Git repository is initialized! Next steps:

1️⃣  CREATE GITHUB REPOSITORY:
   • Go to: https://github.com/new
   • Repository name: {repo_name}
   • Make it Private (recommended)
   • DO NOT initialize with README (we already have one)

2️⃣  ON GABRIEL PC (Windows), open PowerShell/CMD in this directory:

   cd {repo_path.name}
   
   git remote add origin https://github.com/YOUR_USERNAME/{repo_name}.git
   git branch -M main
   git push -u origin main

3️⃣  FOR FUTURE UPDATES:

   git add .
   git commit -m "Your commit message"
   git push

4️⃣  AUTOMATED PUSH (Optional):

   Use the provided scripts:
   • Windows: PUSH_TO_GITHUB.bat
   • Mac: scripts/push_to_github.sh

╔═══════════════════════════════════════════════════════════════════════════════╗
║  Your files are now:                                                          ║
║  ✅ On GABRIEL (Primary)                                                      ║
║  ✅ In Git (Version controlled)                                               ║
║  ⏳ Ready for GitHub (Follow steps above)                                     ║
║  ⏳ Ready for Google Drive (Install Google Drive for Desktop on GABRIEL)     ║
╚═══════════════════════════════════════════════════════════════════════════════╝
"""
        
        try:
            guide_path = repo_path / 'GITHUB_SETUP.txt'
            guide_path.write_text(instructions)
            print("   ✅ Created GITHUB_SETUP.txt")
            print(instructions)
            return True
        except Exception as e:
            print(f"   ❌ Error: {e}")
            return False
    
    def create_push_scripts(self, repo_path: Path) -> bool:
        """Create automated push scripts"""
        print("\n📝 Creating push automation scripts...")
        
        # Windows batch script
        batch_script = """@echo off
REM Quick Git Push for GABRIEL
echo ================================================
echo    PUSHING TO GITHUB
echo ================================================
echo.

git add .
git status

echo.
set /p commit_msg="Commit message: "

git commit -m "%commit_msg%"
git push

echo.
echo ✅ Pushed to GitHub
pause
"""
        
        # Mac/Linux shell script
        shell_script = """#!/bin/bash
# Quick Git Push

echo "================================================"
echo "   PUSHING TO GITHUB"
echo "================================================"
echo

git add .
git status

echo
read -p "Commit message: " commit_msg

git commit -m "$commit_msg"
git push

echo
echo "✅ Pushed to GitHub"
"""
        
        try:
            # Windows script
            batch_path = repo_path / 'PUSH_TO_GITHUB.bat'
            batch_path.write_text(batch_script)
            print("   ✅ Created PUSH_TO_GITHUB.bat")
            
            # Shell script
            scripts_dir = repo_path / 'scripts'
            scripts_dir.mkdir(exist_ok=True)
            shell_path = scripts_dir / 'push_to_github.sh'
            shell_path.write_text(shell_script)
            shell_path.chmod(0o755)
            print("   ✅ Created push_to_github.sh")
            
            return True
        except Exception as e:
            print(f"   ❌ Error: {e}")
            return False
    
    def generate_report(self, destination: Path) -> Dict:
        """Generate migration report"""
        duration = datetime.now() - self.stats['start_time']
        
        report = {
            'migration_date': datetime.now().isoformat(),
            'duration': str(duration),
            'source': str(self.source_drive),
            'destination': str(destination),
            'statistics': {
                'files_copied': self.stats['files_copied'],
                'total_size': self.stats['total_size'],
                'errors': len(self.stats['errors'])
            },
            'setup': {
                'git_initialized': self.stats['git_initialized'],
                'github_ready': True,
                'google_drive_ready': False  # Manual setup required
            },
            'next_steps': [
                "1. Follow GITHUB_SETUP.txt instructions",
                "2. Install Google Drive for Desktop on GABRIEL",
                "3. Test system functionality",
                "4. Verify backups"
            ]
        }
        
        # Save JSON report
        report_path = destination / 'MIGRATION_REPORT.json'
        with open(report_path, 'w') as f:
            json.dump(report, f, indent=2)
        
        # Print summary
        print("\n" + "="*80)
        print("✅ MIGRATION COMPLETE!".center(80))
        print("="*80)
        print(f"\n📊 SUMMARY:")
        print(f"   Duration: {duration}")
        print(f"   Files: {self.stats['files_copied']}")
        print(f"   Size: {self._human_size(self.stats['total_size'])}")
        print(f"   Errors: {len(self.stats['errors'])}")
        print(f"\n📁 Location: {destination}")
        print(f"\n📄 Report: {report_path}")
        print("\n" + "="*80)
        
        return report
    
    @staticmethod
    def _human_size(size: int) -> str:
        """Convert bytes to human readable"""
        for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
            if size < 1024.0:
                return f"{size:.2f} {unit}"
            size /= 1024.0
        return f"{size:.2f} PB"


# Quick migration function for GABRIEL integration
def quick_migrate(source: str, files: List[str], gabriel_ip: str = "192.168.1.24") -> Dict:
    """
    Quick migration from external drive to GABRIEL
    
    Args:
        source: Source drive path
        files: List of file paths to migrate
        gabriel_ip: GABRIEL PC IP address
    
    Returns:
        Migration results dictionary
    """
    orchestrator = MigrationOrchestrator(source, gabriel_ip)
    
    # Mount GABRIEL
    if not orchestrator.mount_gabriel():
        return {'status': 'error', 'message': 'Failed to mount GABRIEL'}
    
    # Create structure
    destination = orchestrator.mount_point / 'NOIZYLAB_CONTROL_CENTER'
    orchestrator.create_directory_structure(orchestrator.mount_point)
    
    # Copy files
    file_paths = [Path(f) for f in files]
    results = orchestrator.copy_files(file_paths, destination)
    
    # Initialize Git
    orchestrator.initialize_git(destination)
    orchestrator.create_github_instructions(destination)
    orchestrator.create_push_scripts(destination)
    
    # Generate report
    report = orchestrator.generate_report(destination)
    
    return {
        'status': 'success',
        'files_copied': results['success'],
        'destination': str(destination),
        'report': report
    }


if __name__ == "__main__":
    print("🚀 GABRIEL Migration Orchestrator")
    print("Import this module into gabriel_ultimate.py for full integration")
