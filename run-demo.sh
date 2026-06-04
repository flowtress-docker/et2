#!/usr/bin/env bash
# Run a single Wokwi CLI demo from its isolated worktree
# Usage: ./run-demo.sh <demo-name>
# Example: ./run-demo.sh smart-thermostat

set -euo pipefail

DEMO_NAME="${1:-}"
# Demo trees live next to main/ at container root (see docs/GIT-SCAFFOLD.md)
_REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"
_CONTAINER="$(cd "$_REPO_ROOT/.." && pwd)"
WORKTREE_BASE="${WORKTREE_BASE:-$_CONTAINER/.worktrees}"

if [[ -z "$DEMO_NAME" ]]; then
  echo "Usage: $0 <demo-name>"
  echo "Available demos:"
  for d in "$WORKTREE_BASE"/demo-*; do
    [[ -d "$d" ]] || continue
    name=$(basename "$d" | sed 's/^demo-//')
    branch=$(git -C "$d" branch --show-current)
    echo "  - $name  (branch: $branch)"
  done
  exit 1
fi

WORKTREE_DIR="$WORKTREE_BASE/demo-$DEMO_NAME"
if [[ ! -d "$WORKTREE_DIR" ]]; then
  echo "Error: Demo '$DEMO_NAME' not found at $WORKTREE_DIR"
  exit 1
fi

BRANCH=$(git -C "$WORKTREE_DIR" branch --show-current)
echo "▶ Running demo: $DEMO_NAME"
echo "  Worktree: $WORKTREE_DIR"
echo "  Branch:   $BRANCH"
echo ""

cd "$WORKTREE_DIR"

# Check if firmware exists; if not, warn user
if [[ ! -f "build/firmware.bin" && ! -f "build/firmware.hex" && ! -f "build/firmware.uf2" ]]; then
  echo "⚠️  Firmware not found in build/. Run 'pio run' first:"
  echo "   cd $WORKTREE_DIR && pio run"
  echo ""
fi

# Run the scenario
exec wokwi-cli . --scenario scenarios/demo.yaml
