#!/usr/bin/env bash
# Copy skills from this branch into another worktree/branch (.cursor/skills + rules).
set -euo pipefail

SRC_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST_ROOT="${1:-$(pwd)}"

if [[ ! -d "$SRC_ROOT/.cursor/skills" ]]; then
  echo "Run from et2 skills branch root." >&2
  exit 1
fi

mkdir -p "$DEST_ROOT/.cursor/skills" "$DEST_ROOT/.cursor/rules"
rsync -a --delete "$SRC_ROOT/.cursor/skills/" "$DEST_ROOT/.cursor/skills/"
rsync -a "$SRC_ROOT/.cursor/rules/" "$DEST_ROOT/.cursor/rules/"

echo "Installed skills → $DEST_ROOT/.cursor/skills"
echo "Installed rules  → $DEST_ROOT/.cursor/rules"
