#!/usr/bin/env python3
"""
╔════════════════════════════════════════════════════════════════════════════════╗
║                                                                                ║
║  🎵 GABRIEL 12TB MUSIC ORGANIZER                                              ║
║                                                                                ║
║  Automated organization with symlinks                                         ║
║  No file duplication - Instant access by Instrument/BPM/Key                   ║
║                                                                                ║
╚════════════════════════════════════════════════════════════════════════════════╝
"""

import sys
sys.path.insert(0, '/Users/rsp_ms/GABRIEL')
from file_organizer import organize_music
from pathlib import Path

def main():
    print("🎵 GABRIEL 12TB MUSIC ORGANIZER")
    print("=" * 80)
    
    # Configuration
    tasks = [
        {
            'name': 'NoizyFish Original Music Archive',
            'source': '/Volumes/12TB 1/NoizyFish_Fishnet/🎵 Original_Music_Archive',
            'dest': '/Volumes/12TB 1/_2026_ORGANIZED_MUSIC/NoizyFish_Collection',
            'files': 16158
        },
        {
            'name': 'NOIZYVOX Voice Samples',
            'source': '/Volumes/12TB 1/NOIZYVOX/VOICES',
            'dest': '/Volumes/12TB 1/_2026_ORGANIZED_MUSIC/NOIZYVOX_Collection',
            'files': 140
        }
    ]
    
    print("\n📋 ORGANIZATION TASKS:")
    for i, task in enumerate(tasks, 1):
        print(f"\n{i}. {task['name']}")
        print(f"   Source: {task['source']}")
        print(f"   Dest:   {task['dest']}")
        print(f"   Files:  {task['files']:,}")
    
    print("\n" + "=" * 80)
    choice = input("\nExecute all tasks? (y/n): ").lower()
    
    if choice != 'y':
        print("❌ Cancelled")
        return
    
    # Execute
    print("\n" + "=" * 80)
    print("🚀 STARTING ORGANIZATION")
    print("=" * 80)
    
    results = []
    for task in tasks:
        source_path = Path(task['source'])
        if not source_path.exists():
            print(f"\n⚠️  Skipping: {task['name']} (source not found)")
            continue
        
        print(f"\n\n{'=' * 80}")
        print(f"📦 TASK: {task['name']}")
        print(f"{'=' * 80}\n")
        
        try:
            result = organize_music(task['source'], task['dest'])
            results.append({
                'task': task['name'],
                'result': result,
                'success': True
            })
        except Exception as e:
            print(f"\n❌ ERROR: {e}")
            results.append({
                'task': task['name'],
                'error': str(e),
                'success': False
            })
    
    # Summary
    print("\n\n" + "=" * 80)
    print("📊 ORGANIZATION SUMMARY")
    print("=" * 80)
    
    total_files = 0
    total_symlinks = 0
    
    for r in results:
        print(f"\n{r['task']}")
        if r['success']:
            print(f"  ✅ Success")
            print(f"  Files: {r['result']['total_files']:,}")
            print(f"  Symlinks: {r['result']['symlinks_created']:,}")
            print(f"  Destination: {r['result']['destination']}")
            total_files += r['result']['total_files']
            total_symlinks += r['result']['symlinks_created']
        else:
            print(f"  ❌ Failed: {r['error']}")
    
    print(f"\n{'=' * 80}")
    print(f"TOTAL FILES ORGANIZED: {total_files:,}")
    print(f"TOTAL SYMLINKS CREATED: {total_symlinks:,}")
    print(f"DISK SPACE USED: <1 MB")
    print(f"{'=' * 80}")
    
    print("\n🎉 ORGANIZATION COMPLETE!")
    print("\n📁 Access your music:")
    print("   • By Instrument: .../01_By_Instrument/")
    print("   • By BPM: .../02_By_BPM/")
    print("   • By Key: .../03_By_Musical_Key/")
    print("   • Original: .../04_Raw_Archive/")

if __name__ == "__main__":
    main()
