#!/bin/bash

MANIFEST=$1
ORG="noizy-ai"

echo "=== Verifying Migration ==="
cat $MANIFEST | jq -r '.projects[] | .name' | while read project; do
  count=$(git ls-remote git@github.com:$ORG/$project.git 2>/dev/null | wc -l)
  if [ $count -gt 0 ]; then
    echo "✓ $project ($count refs)"
  else
    echo "✗ $project (not found or empty)"
  fi
done
