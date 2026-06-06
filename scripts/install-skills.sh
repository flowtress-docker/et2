#!/usr/bin/env bash
# Install et2/skills into agent discovery paths (.cursor/skills).
# Canonical source: skills/ at repo root (et2-only resources).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/skills"
CURSOR_DEST="$ROOT/.cursor/skills"

if [[ ! -d "$SRC" ]]; then
  echo "Missing $SRC — run sync or copy skills first." >&2
  exit 1
fi

mkdir -p "$CURSOR_DEST"

link_or_copy() {
  local rel_from="$1"
  local to="$2"
  rm -rf "$to"
  if (cd "$(dirname "$to")" && ln -sfn "$rel_from" "$(basename "$to")") 2>/dev/null; then
    :
  else
    cp -a "$ROOT/$rel_from" "$to"
  fi
}

for dir in "$SRC"/*; do
  [[ -d "$dir" ]] || continue
  name="$(basename "$dir")"
  link_or_copy "skills/$name" "$CURSOR_DEST/$name"
done

echo "Installed et2 skills into $CURSOR_DEST"
echo "GitNexus skill paths: skills/gitnexus/ (see AGENTS.md)"
