#!/bin/bash
set -e

MANIFEST=$1
ORG="noizy-ai"
ARCHIVE="/Volumes/FISH/NOIZY_MIGRATION_20260329"

mkdir -p $ARCHIVE/mirrors $ARCHIVE/logs

echo "=== NOIZY Mirror & Push ==="
cat $MANIFEST | jq -r '.projects[] | .name' | while read project; do
  echo ""
  echo "Processing: $project"
  
  local_path=$(cd ~; find . -name "$project" -type d 2>/dev/null | head -1)
  if [ -z "$local_path" ]; then
    echo "✗ Not found: $project"
    continue
  fi
  
  mirror_path="$ARCHIVE/mirrors/$project.git"
  git clone --mirror "$local_path" "$mirror_path" 2>&1 | tee -a "$ARCHIVE/logs/$project.log"
  
  git -C "$mirror_path" push --mirror git@github.com:$ORG/$project.git 2>&1 | tee -a "$ARCHIVE/logs/$project.log"
  echo "✓ $project pushed"
done

echo ""
echo "✓ Migration complete. archives at $ARCHIVE"
