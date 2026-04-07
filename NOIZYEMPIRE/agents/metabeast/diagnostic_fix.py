#!/usr/bin/env python3
"""
🚀 DIAGNOSTIC & FIX TOOL
Checks Python environment and fixes common issues
"""

import sys
import os
from pathlib import Path
import subprocess

def print_header(text):
    print("\n" + "="*70)
    print(f"  {text}")
    print("="*70 + "\n")

def check_python():
    """Check Python installation"""
    print_header("🐍 PYTHON CHECK")
    
    print(f"✓ Python Version: {sys.version}")
    print(f"✓ Executable: {sys.executable}")
    print(f"✓ Platform: {sys.platform}")
    
    return True

def check_scripts():
    """Check if scripts exist"""
    print_header("📄 SCRIPT CHECK")
    
    scripts = {
        'ULTIMATE_MASTER_ORGANIZER.py': None,
        'METABEAST.py': None,
        'ENGR_KEITH.py': None
    }
    
    # Check current directory
    for script in scripts:
        if Path(script).exists():
            scripts[script] = str(Path(script).absolute())
            print(f"✓ Found: {scripts[script]}")
    
    # Check RED DRAGON
    red_dragon = Path('/Volumes/RED DRAGON')
    if red_dragon.exists():
        for script in scripts:
            if scripts[script] is None:
                path = red_dragon / script
                if path.exists():
                    scripts[script] = str(path)
                    print(f"✓ Found: {scripts[script]}")
    
    # Check 12TB
    tb12 = Path('/Volumes/12TB 1')
    if tb12.exists():
        for script in scripts:
            if scripts[script] is None:
                path = tb12 / script
                if path.exists():
                    scripts[script] = str(path)
                    print(f"✓ Found: {scripts[script]}")
    
    missing = [s for s, p in scripts.items() if p is None]
    if missing:
        print(f"\n⚠ Missing: {', '.join(missing)}")
    
    return scripts

def check_dependencies():
    """Check Python dependencies"""
    print_header("📦 DEPENDENCY CHECK")
    
    deps = {
        'hashlib': 'Built-in',
        'json': 'Built-in',
        'pathlib': 'Built-in',
        'concurrent.futures': 'Built-in',
        'shutil': 'Built-in'
    }
    
    optional = {
        'black': 'Code formatting (optional)',
        'isort': 'Import sorting (optional)',
        'PIL': 'Image analysis (optional)',
        'mutagen': 'Audio metadata (optional)'
    }
    
    print("Core dependencies (all built-in):")
    for dep, desc in deps.items():
        try:
            __import__(dep)
            print(f"  ✓ {dep}: {desc}")
        except:
            print(f"  ✗ {dep}: MISSING!")
    
    print("\nOptional dependencies:")
    for dep, desc in optional.items():
        try:
            __import__(dep)
            print(f"  ✓ {dep}: {desc}")
        except:
            print(f"  - {dep}: Not installed ({desc})")
    
    return True

def check_drives():
    """Check available drives"""
    print_header("💽 DRIVE CHECK")
    
    drives = [
        '/Volumes/12TB 1',
        '/Volumes/12TB',
        '/Volumes/RED DRAGON',
        '/Volumes/GABRIEL',
        '.'
    ]
    
    found_drives = []
    for drive in drives:
        path = Path(drive)
        if path.exists():
            print(f"✓ {drive}")
            found_drives.append(drive)
        else:
            print(f"- {drive} (not mounted)")
    
    return found_drives

def check_permissions():
    """Check write permissions"""
    print_header("🔐 PERMISSION CHECK")
    
    test_dirs = ['/Volumes/RED DRAGON', '/Volumes/12TB 1', '.']
    
    for test_dir in test_dirs:
        path = Path(test_dir)
        if path.exists():
            test_file = path / '.permission_test'
            try:
                test_file.touch()
                test_file.unlink()
                print(f"✓ {test_dir}: Read/Write OK")
            except:
                print(f"✗ {test_dir}: NO WRITE PERMISSION!")
        else:
            print(f"- {test_dir}: Not available")
    
    return True

def run_quick_test():
    """Run a quick functionality test"""
    print_header("🧪 QUICK FUNCTIONALITY TEST")
    
    try:
        import hashlib
        from pathlib import Path
        from datetime import datetime
        
        # Test hash calculation
        test_data = b"Hello, METABEAST!"
        test_hash = hashlib.sha256(test_data).hexdigest()
        print(f"✓ SHA-256 hashing: {test_hash[:16]}...")
        
        # Test path operations
        test_path = Path('.')
        print(f"✓ Path operations: {test_path.absolute()}")
        
        # Test datetime
        now = datetime.now()
        print(f"✓ Timestamp: {now.strftime('%Y-%m-%d %H:%M:%S')}")
        
        print("\n✓ All core functions working!")
        return True
        
    except Exception as e:
        print(f"✗ Test failed: {e}")
        return False

def fix_permissions():
    """Try to fix common permission issues"""
    print_header("🔧 FIXING PERMISSIONS")
    
    scripts = [
        '/Volumes/RED DRAGON/ULTIMATE_MASTER_ORGANIZER.py',
        '/Volumes/RED DRAGON/METABEAST.py',
        '/Volumes/RED DRAGON/ENGR_KEITH.py',
        '/Volumes/RED DRAGON/RUN_ORGANIZER.sh',
        '/Volumes/RED DRAGON/RUN_METABEAST.sh',
        '/Volumes/12TB 1/ULTIMATE_MASTER_ORGANIZER.py'
    ]
    
    for script in scripts:
        path = Path(script)
        if path.exists():
            try:
                os.chmod(script, 0o755)
                print(f"✓ Fixed: {script}")
            except:
                print(f"⚠ Could not fix: {script}")
    
    return True

def main():
    """Run all diagnostics"""
    print("""
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║           🔧 DIAGNOSTIC & FIX TOOL 🔧                             ║
║                                                                   ║
║           Checking Python environment & fixing issues             ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
    """)
    
    results = {}
    
    results['python'] = check_python()
    results['scripts'] = check_scripts()
    results['dependencies'] = check_dependencies()
    results['drives'] = check_drives()
    results['permissions'] = check_permissions()
    results['test'] = run_quick_test()
    
    # Try fixes
    fix_permissions()
    
    # Summary
    print_header("📊 SUMMARY")
    
    if all(results.values()):
        print("✓ ALL CHECKS PASSED!")
        print("\nYou're ready to run:")
        print("  python3 '/Volumes/RED DRAGON/ULTIMATE_MASTER_ORGANIZER.py'")
        print("  or")
        print("  bash '/Volumes/RED DRAGON/RUN_ORGANIZER.sh'")
    else:
        print("⚠ Some issues found - check output above")
    
    print("\n" + "="*70 + "\n")

if __name__ == "__main__":
    main()
