#!/usr/bin/env bash
# Capture a screenshot of a Wokwi demo at a specific simulation time
# Usage: ./screenshot-demo.sh <demo-name> <time-ms> <output-file>
# Example: ./screenshot-demo.sh smart-thermostat 3000 screenshots/alarm.png

set -euo pipefail

DEMO_NAME="${1:-}"
TIME_MS="${2:-}"
OUTPUT="${3:-}"
WORKTREE_BASE=".worktrees"

if [[ -z "$DEMO_NAME" || -z "$TIME_MS" || -z "$OUTPUT" ]]; then
  echo "Usage: $0 <demo-name> <time-ms> <output-file>"
  exit 1
fi

WORKTREE_DIR="$WORKTREE_BASE/demo-$DEMO_NAME"
if [[ ! -d "$WORKTREE_DIR" ]]; then
  echo "Error: Demo '$DEMO_NAME' not found"
  exit 1
fi

cd "$WORKTREE_DIR"
mkdir -p "$(dirname "$OUTPUT")"

exec wokwi-cli . \
  --screenshot-part esp \
  --screenshot-time "$TIME_MS" \
  --screenshot-file "$OUTPUT"
