#!/usr/bin/env python3
"""
╔════════════════════════════════════════════════════════════════════════════════╗
║                                                                                ║
║  🚀 GABRIEL DEPLOYMENT SYSTEM                                                  ║
║                                                                                ║
║  Unified deployment replacing all bash/bat scripts                            ║
║  Cross-platform: Mac → Windows GABRIEL PC                                     ║
║                                                                                ║
║  Absorbed from: DEPLOY_ULTRA_X10000.sh, ABSORB_THE_CLEANER.sh,               ║
║                 COMPLETE_GABRIEL_MIGRATION.sh, DEPLOY_TO_GABRIEL_PC.sh        ║
║                                                                                ║
╚════════════════════════════════════════════════════════════════════════════════╝
"""

import os
import sys
import shutil
import subprocess
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional
import json

class GABRIELDeployer:
    """Unified deployment system for GABRIEL"""
    
    def __init__(self):
        self.pc_ip = "192.168.1.24"
        self.pc_user = "rsp_ms"
        self.pc_share = "SharedMusic"
        self.mount_point = Path("/Volumes/GABRIEL_ULTRA")
        self.ultra_root = self.mount_point / "GABRIEL_ULTRA_X10000"
        self.stats = {
            'deployed': 0,
            'absorbed': 0,
            'errors': []
        }
    
    def print_banner(self, text: str, char: str = "="):
        """Print formatted banner"""
        print(f"\n{char * 80}")
        print(f"  {text}")
        print(f"{char * 80}\n")
    
    def mount_gabriel(self) -> bool:
        """Mount GABRIEL PC via SMB"""
        self.print_banner("📡 Connecting to GABRIEL PC")
        
        # Try to create mount point (may need sudo)
        try:
            self.mount_point.mkdir(parents=True, exist_ok=True)
        except PermissionError:
            print(f"⚠️  Cannot create {self.mount_point} (need sudo)")
            print(f"   Using current directory instead")
            self.mount_point = Path.cwd() / "GABRIEL_MOUNT"
            self.ultra_root = self.mount_point / "GABRIEL_ULTRA_X10000"
            self.mount_point.mkdir(parents=True, exist_ok=True)
        
        # Check if already mounted
        result = subprocess.run(['mount'], capture_output=True, text=True)
        if str(self.mount_point) in result.stdout:
            print(f"✅ Already mounted: {self.mount_point}")
            return True
        
        # Mount
        mount_cmd = f"//{self.pc_user}@{self.pc_ip}/{self.pc_share}"
        try:
            subprocess.run(
                ['mount_smbfs', mount_cmd, str(self.mount_point)],
                check=True,
                capture_output=True
            )
            print(f"✅ Mounted GABRIEL: {self.mount_point}")
            return True
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to mount GABRIEL")
            print(f"   Run manually: mount_smbfs {mount_cmd} {self.mount_point}")
            self.stats['errors'].append(f"Mount failed: {e}")
            return False
    
    def create_structure(self) -> bool:
        """Create GABRIEL ULTRA directory structure"""
        self.print_banner("📁 Creating Directory Structure")
        
        dirs = [
            'core', 'agents', 'network', 'storage', 'monitoring',
            'logs', 'config', 'backups', 'docs', 'imported',
            'imported/python', 'imported/javascript', 'imported/configs',
            'imported/docs', 'imported/data', 'imported/assets', 'imported/archives'
        ]
        
        for dir_name in dirs:
            dir_path = self.ultra_root / dir_name
            dir_path.mkdir(parents=True, exist_ok=True)
            print(f"✓ {dir_name}/")
        
        print(f"\n✅ Structure created at: {self.ultra_root}")
        return True
    
    def deploy_core_systems(self) -> bool:
        """Deploy core GABRIEL systems"""
        self.print_banner("🚀 Deploying Core Systems")
        
        gabriel_root = Path("/Users/rsp_ms/GABRIEL")
        red_dragon = Path("/Volumes/RED DRAGON")
        
        # Core files to deploy
        deployments = {
            'core': [
                'gabriel_ultimate.py',
                'file_organizer.py',
                'migration_orchestrator.py',
                'diagnostic_fix.py',
                'organize_12tb.py'
            ],
            'docs': [
                '12TB_ORGANIZATION_PLAN.md',
                'EXECUTION_READY.md',
                'QUICKSTART.md'
            ]
        }
        
        for dest_dir, files in deployments.items():
            for filename in files:
                # Try GABRIEL first
                source = gabriel_root / filename
                if not source.exists():
                    # Try RED DRAGON
                    source = red_dragon / filename
                
                if source.exists():
                    dest = self.ultra_root / dest_dir / filename
                    try:
                        shutil.copy2(source, dest)
                        print(f"✓ {filename} → {dest_dir}/")
                        self.stats['deployed'] += 1
                    except Exception as e:
                        print(f"✗ Failed: {filename} ({e})")
                        self.stats['errors'].append(f"Deploy {filename}: {e}")
                else:
                    print(f"- Skipped: {filename} (not found)")
        
        print(f"\n✅ Deployed {self.stats['deployed']} files")
        return True
    
    def absorb_the_cleaner(self, source_path: str) -> bool:
        """Absorb code from THE CLEANER or any directory"""
        self.print_banner(f"🔥 Absorbing Code from: {source_path}")
        
        source = Path(source_path)
        if not source.exists():
            print(f"❌ Source not found: {source}")
            return False
        
        absorbed_log = self.ultra_root / f"ABSORPTION_LOG_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
        
        with open(absorbed_log, 'w') as log:
            log.write(f"GABRIEL ULTRA - ABSORPTION LOG\n")
            log.write(f"Source: {source}\n")
            log.write(f"Timestamp: {datetime.now()}\n")
            log.write("=" * 80 + "\n\n")
            
            for file_path in source.rglob('*'):
                if not file_path.is_file():
                    continue
                
                if file_path.name.startswith('.'):
                    continue
                
                ext = file_path.suffix.lower()
                
                # Categorize
                if ext in {'.py', '.pyw'}:
                    dest_dir = self.ultra_root / 'imported' / 'python'
                elif ext in {'.js', '.jsx', '.ts', '.tsx'}:
                    dest_dir = self.ultra_root / 'imported' / 'javascript'
                elif ext in {'.json', '.yaml', '.yml', '.toml', '.ini', '.env'}:
                    dest_dir = self.ultra_root / 'imported' / 'configs'
                elif ext in {'.md', '.txt', '.pdf', '.doc', '.docx'}:
                    dest_dir = self.ultra_root / 'imported' / 'docs'
                elif ext in {'.csv', '.xlsx', '.xls', '.db', '.sqlite'}:
                    dest_dir = self.ultra_root / 'imported' / 'data'
                elif ext in {'.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico'}:
                    dest_dir = self.ultra_root / 'imported' / 'assets'
                else:
                    dest_dir = self.ultra_root / 'imported' / 'archives'
                
                dest_dir.mkdir(parents=True, exist_ok=True)
                dest_file = dest_dir / file_path.name
                
                try:
                    shutil.copy2(file_path, dest_file)
                    log.write(f"✓ {file_path.name} → {dest_dir.name}/\n")
                    self.stats['absorbed'] += 1
                    print(f"✓ {file_path.name}", end='\r')
                except Exception as e:
                    log.write(f"✗ {file_path.name}: {e}\n")
                    self.stats['errors'].append(f"Absorb {file_path.name}: {e}")
        
        print(f"\n✅ Absorbed {self.stats['absorbed']} files")
        print(f"📋 Log: {absorbed_log}")
        return True
    
    def create_requirements(self) -> bool:
        """Create requirements.txt for GABRIEL ULTRA"""
        self.print_banner("📦 Creating Requirements")
        
        requirements = """# GABRIEL ULTRA Requirements

# Core dependencies
psutil>=5.9.0
aiohttp>=3.8.0
websockets>=10.0

# Optional - Enhanced features
Pillow>=9.0.0
mutagen>=1.45.0
black>=22.0.0
isort>=5.10.0

# Monitoring
prometheus-client>=0.14.0

# Utilities
python-dotenv>=0.20.0
pyyaml>=6.0
click>=8.0.0
rich>=12.0.0
"""
        
        req_file = self.ultra_root / 'requirements.txt'
        req_file.write_text(requirements)
        print(f"✅ Created: {req_file}")
        return True
    
    def create_windows_launcher(self) -> bool:
        """Create Windows batch launcher"""
        self.print_banner("🪟 Creating Windows Launcher")
        
        launcher = """@echo off
REM GABRIEL ULTRA - Windows Launcher
color 0B
title GABRIEL ULTRA Control

:MENU
cls
echo.
echo ╔═══════════════════════════════════════════════════════════════════╗
echo ║                                                                   ║
echo ║         🚀 GABRIEL ULTRA - CONTROL CENTER                         ║
echo ║                                                                   ║
echo ╚═══════════════════════════════════════════════════════════════════╝
echo.
echo  MAIN MENU
echo  ════════════════════════════════════════════════════════════════════
echo.
echo  [1] Run GABRIEL Ultimate
echo  [2] Organize Music Files
echo  [3] Run Diagnostics
echo  [4] View System Status
echo  [5] Exit
echo.
set /p choice="Enter choice: "

if "%choice%"=="1" goto RUN_GABRIEL
if "%choice%"=="2" goto ORGANIZE
if "%choice%"=="3" goto DIAGNOSTICS
if "%choice%"=="4" goto STATUS
if "%choice%"=="5" goto EXIT

:RUN_GABRIEL
cls
echo Running GABRIEL Ultimate...
python core\\gabriel_ultimate.py
pause
goto MENU

:ORGANIZE
cls
echo Music Organization...
python core\\organize_12tb.py
pause
goto MENU

:DIAGNOSTICS
cls
echo Running Diagnostics...
python core\\diagnostic_fix.py
pause
goto MENU

:STATUS
cls
echo System Status:
echo ═══════════════════════════════════════════════════════════════════
dir /s core
pause
goto MENU

:EXIT
exit
"""
        
        launcher_file = self.ultra_root / 'GABRIEL_LAUNCHER.bat'
        launcher_file.write_text(launcher)
        print(f"✅ Created: {launcher_file}")
        return True
    
    def verify_deployment(self) -> bool:
        """Verify deployment was successful"""
        self.print_banner("✓ Verifying Deployment")
        
        checks = {
            'Core directory': self.ultra_root / 'core',
            'Agents directory': self.ultra_root / 'agents',
            'Imported directory': self.ultra_root / 'imported',
            'Requirements file': self.ultra_root / 'requirements.txt',
            'Windows launcher': self.ultra_root / 'GABRIEL_LAUNCHER.bat'
        }
        
        passed = 0
        for name, path in checks.items():
            if path.exists():
                print(f"✓ {name}")
                passed += 1
            else:
                print(f"✗ {name} MISSING")
        
        print(f"\n{passed}/{len(checks)} checks passed")
        return passed == len(checks)
    
    def generate_report(self) -> None:
        """Generate deployment report"""
        self.print_banner("📊 Deployment Report")
        
        report = f"""# GABRIEL ULTRA Deployment Report

**Date:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
**Destination:** `{self.ultra_root}`

## Statistics

- Files Deployed: {self.stats['deployed']}
- Files Absorbed: {self.stats['absorbed']}
- Errors: {len(self.stats['errors'])}

## Location

Network Path: `\\\\{self.pc_ip}\\{self.pc_share}\\GABRIEL_ULTRA_X10000\\`
Local Mount: `{self.ultra_root}`

## To Start GABRIEL

On Windows PC:
1. Navigate to: `\\\\{self.pc_ip}\\{self.pc_share}\\GABRIEL_ULTRA_X10000`
2. Run: `GABRIEL_LAUNCHER.bat`

## System Structure

```
GABRIEL_ULTRA_X10000/
├── core/          - Main systems
├── agents/        - AI agents
├── network/       - Network management
├── imported/      - Absorbed code
└── docs/          - Documentation
```

## Next Steps

1. Install dependencies: `pip install -r requirements.txt`
2. Run diagnostics: `python core/diagnostic_fix.py`
3. Launch GABRIEL: `python core/gabriel_ultimate.py`

---
**Deployment Complete!** ✅
"""
        
        report_file = self.ultra_root / 'DEPLOYMENT_REPORT.md'
        report_file.write_text(report)
        print(f"✅ Report: {report_file}")
        
        print(f"\n📊 Summary:")
        print(f"   Deployed: {self.stats['deployed']} files")
        print(f"   Absorbed: {self.stats['absorbed']} files")
        print(f"   Errors: {len(self.stats['errors'])}")


def main():
    """Main deployment workflow"""
    deployer = GABRIELDeployer()
    
    print("""
╔════════════════════════════════════════════════════════════════════════════════╗
║                                                                                ║
║  🚀 GABRIEL ULTRA DEPLOYMENT SYSTEM                                            ║
║                                                                                ║
║  Unified Python deployment replacing all bash/bat scripts                     ║
║                                                                                ║
╚════════════════════════════════════════════════════════════════════════════════╝
    """)
    
    print("Options:")
    print("  1. Full Deployment (mount + deploy + absorb)")
    print("  2. Deploy Core Only")
    print("  3. Absorb Code Only")
    print("  4. Verify Existing")
    print()
    
    choice = input("Enter choice (1-4): ").strip()
    
    if choice == "1":
        # Full deployment
        if not deployer.mount_gabriel():
            return 1
        deployer.create_structure()
        deployer.deploy_core_systems()
        
        cleaner_path = input("\nPath to absorb (or press Enter to skip): ").strip()
        if cleaner_path:
            deployer.absorb_the_cleaner(cleaner_path)
        
        deployer.create_requirements()
        deployer.create_windows_launcher()
        deployer.verify_deployment()
        deployer.generate_report()
        
    elif choice == "2":
        if not deployer.mount_gabriel():
            return 1
        deployer.create_structure()
        deployer.deploy_core_systems()
        deployer.create_requirements()
        deployer.create_windows_launcher()
        deployer.verify_deployment()
        
    elif choice == "3":
        if not deployer.mount_gabriel():
            return 1
        cleaner_path = input("Path to absorb: ").strip()
        deployer.absorb_the_cleaner(cleaner_path)
        
    elif choice == "4":
        if not deployer.mount_gabriel():
            return 1
        deployer.verify_deployment()
    
    print("\n✅ Done!")
    return 0


if __name__ == "__main__":
    sys.exit(main())
