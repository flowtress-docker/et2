#!/usr/bin/env bash
# Run all Wokwi CLI demos sequentially
# Demos are executed in their isolated git worktrees

set -euo pipefail

WORKTREE_BASE=".worktrees"
FAILED=()

for demo_dir in "$WORKTREE_BASE"/demo-*; do
  [[ -d "$demo_dir" ]] || continue
  name=$(basename "$demo_dir" | sed 's/^demo-//')
  branch=$(git -C "$demo_dir" branch --show-current)

  echo "════════════════════════════════════════════════════"
  echo "  Demo: $name"
  echo "  Branch: $branch"
  echo "════════════════════════════════════════════════════"

  if (cd "$demo_dir" && wokwi-cli . --scenario scenarios/demo.yaml); then
    echo "✅ $name passed"
  else
    echo "❌ $name failed"
    FAILED+=("$name")
  fi
  echo ""
done

echo "════════════════════════════════════════════════════"
echo "  Results"
echo "════════════════════════════════════════════════════"
if [[ ${#FAILED[@]} -eq 0 ]]; then
  echo "✅ All demos passed"
  exit 0
else
  echo "❌ Failed demos:"
  printf '  - %s\n' "${FAILED[@]}"
  exit 1
fi
