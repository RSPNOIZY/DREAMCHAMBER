#!/usr/bin/env python3
import glob, re

files = glob.glob("/Users/m2ultra/.claude/session-env/*/sessionstart-hook-0.sh")
print(f"Found {len(files)} files")
fixed = 0
for f in files:
    with open(f) as fh:
        content = fh.read()
    original = content
    content = re.sub(
        r"^(export NOIZY_SESSION_START=)(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2})$",
        r'\1"\2T\3"',
        content, flags=re.MULTILINE
    )
    content = re.sub(
        r'^(export NOIZY_PROJECT_ROOT=)(/[^\s"]+)$',
        r'\1"\2"',
        content, flags=re.MULTILINE
    )
    if content != original:
        with open(f, "w") as fh:
            fh.write(content)
        fixed += 1
        print(f"Fixed: {f}")
print(f"Total fixed: {fixed}")
