#!/usr/bin/env bash
# Demo worktrees under .worktrees/ (run from container root or via setup-git-scaffold.sh)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONTAINER="${CONTAINER_ROOT:-$(cd "$SCRIPT_DIR/.." && pwd)}"
if [[ "$(basename "$CONTAINER")" == "main" ]]; then
  CONTAINER="$(dirname "$CONTAINER")"
fi

BARE_DIR="${GIT_DIR:-$CONTAINER/.bare}"
WORKTREE_BASE="$CONTAINER/.worktrees"
mkdir -p "$WORKTREE_BASE"

if [[ ! -d "$BARE_DIR" ]]; then
  echo "Error: $BARE_DIR missing. Run ./scripts/setup-git-scaffold.sh first."
  exit 1
fi

DEMOS=(smart-thermostat motion-alarm auto-blinds weather-station touch-ui)

git --git-dir="$BARE_DIR" fetch origin --prune

for demo in "${DEMOS[@]}"; do
  branch="demo/$demo"
  dir="$WORKTREE_BASE/demo-$demo"
  start_point=""
  if git --git-dir="$BARE_DIR" show-ref --verify --quiet "refs/heads/$branch"; then
    start_point="$branch"
  elif git --git-dir="$BARE_DIR" show-ref --verify --quiet "refs/remotes/origin/$branch"; then
    start_point="origin/$branch"
  else
    echo "⚠️  Skip $demo: branch $branch not in .bare"
    continue
  fi

  if [[ -d "$dir" ]]; then
    if [[ -f "$dir/.git" ]] || [[ -d "$dir/.git" ]]; then
      echo "✓ Exists: $dir"
      continue
    fi
    echo "⚠️  Removing stale $dir"
    rm -rf "$dir"
  fi

  echo "▶ worktree add $dir ← $branch"
  git --git-dir="$BARE_DIR" worktree add "$dir" "$start_point"
done

echo ""
git --git-dir="$BARE_DIR" worktree list
