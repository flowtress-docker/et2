#!/usr/bin/env bash
# Sync resource skills from wearelama/skills into et2/skills.
# Copies reusable skill resources only — excludes WeAreAlma project context.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$ROOT/skills"
TMP="${TMPDIR:-/tmp}/wearelama-skills-sync"
REF="${WEARELAMA_SKILLS_REF:-main}"

EXCLUDE_DIRS=(
  'wearealma'
  'wearelama'
  'context'
  'staging'
  'architecture'
  'method'
  'docs'
  'projects'
  'apps'
  'ghost-ai'
)

EXCLUDE_FILES=(
  'CONTEXT.md'
  'AGENTS.md'
  'CLAUDE.md'
  'README-SCAFFOLD.md'
)

should_skip_dir() {
  local name="$1"
  for x in "${EXCLUDE_DIRS[@]}"; do
    [[ "$name" == "$x" ]] && return 0
  done
  return 1
}

should_skip_file() {
  local name="$1"
  for x in "${EXCLUDE_FILES[@]}"; do
    [[ "$name" == "$x" ]] && return 0
  done
  return 1
}

echo "Cloning wearelama/skills (ref: $REF) ..."
rm -rf "$TMP"
if command -v gh >/dev/null 2>&1; then
  gh repo clone wearelama/skills "$TMP" -- --depth 1 --branch "$REF" 2>/dev/null \
    || git clone --depth 1 --branch "$REF" https://github.com/wearelama/skills.git "$TMP"
else
  git clone --depth 1 --branch "$REF" https://github.com/wearelama/skills.git "$TMP"
fi

mkdir -p "$DEST"

copy_skill_tree() {
  local src_root="$1"
  local rel="$2"
  local src="$src_root/$rel"
  local name
  name="$(basename "$rel")"

  if should_skip_dir "$name"; then
    echo "skip dir: $rel"
    return 0
  fi

  if [[ -f "$src/SKILL.md" ]]; then
    echo "copy skill: $rel"
    rm -rf "$DEST/$name"
    cp -a "$src" "$DEST/$name"
    return 0
  fi

  if [[ -d "$src" ]]; then
    for child in "$src"/*; do
      [[ -e "$child" ]] || continue
      copy_skill_tree "$src_root" "${rel:+$rel/}$(basename "$child")"
    done
  fi
}

# Prefer explicit skills/ layout; fall back to repo root skill dirs.
if [[ -d "$TMP/skills" ]]; then
  for child in "$TMP/skills"/*; do
    [[ -e "$child" ]] || continue
    copy_skill_tree "$TMP" "skills/$(basename "$child")"
  done
else
  for child in "$TMP"/*; do
    [[ -e "$child" ]] || continue
    base="$(basename "$child")"
    should_skip_file "$base" && continue
    [[ "$base" == .* ]] && continue
    copy_skill_tree "$TMP" "$base"
  done
fi

echo "Synced resource skills into $DEST"
echo "Run ./scripts/install-skills.sh to wire agent directories."
