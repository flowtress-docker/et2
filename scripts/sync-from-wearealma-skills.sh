#!/usr/bin/env bash
# Sync resource skills from flowtress-docker/wearealma @ skills into et2/skills.
# Copies reusable skill resources only — excludes WeAreAlma project context.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$ROOT/skills"
TMP="${TMPDIR:-/tmp}/wearealma-skills-sync"
REPO="${WEAREALMA_REPO:-flowtress-docker/wearealma}"
REF="${WEAREALMA_SKILLS_REF:-skills}"

EXCLUDE_DIRS=(
  'context'
  'staging'
  'architecture'
  'method'
  'docs'
  'projects'
  'apps'
  'src'
  'app'
  'components'
  'lib'
  'prisma'
  'public'
  'trigger'
  'scripts'
  'visual-demo'
  'research'
)

EXCLUDE_FILES=(
  'CONTEXT.md'
  'AGENTS.md'
  'CLAUDE.md'
  'README.md'
  'README-SCAFFOLD.md'
  'package.json'
  'package-lock.json'
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

check_gh_access() {
  if ! command -v gh >/dev/null 2>&1; then
    echo "gh CLI is required." >&2
    exit 1
  fi

  if ! gh api "repos/$REPO" -q .id >/dev/null 2>&1; then
    cat >&2 <<EOF
Cannot access https://github.com/$REPO (branch: $REF).

The Cursor GitHub App for this agent currently has access to flowtress-docker/et2 only.
Grant access to $REPO, then re-run:

  GitHub → Settings → Applications → Cursor → Configure → Repository access
  → add $REPO

Or run locally (with your own gh auth):

  WEAREALMA_REPO=$REPO WEAREALMA_SKILLS_REF=$REF ./scripts/sync-from-wearealma-skills.sh
EOF
    exit 1
  fi
}

clone_upstream() {
  echo "Cloning https://github.com/$REPO @ $REF ..."
  rm -rf "$TMP"
  # Bypass global git url.insteadOf rewrites (et2 installation token is repo-scoped).
  GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_SYSTEM=/dev/null \
    gh repo clone "$REPO" "$TMP" -- --depth 1 --branch "$REF"
}

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

check_gh_access
clone_upstream
mkdir -p "$DEST"

# skills branch may use skills/* or .cursor/skills/* or repo-root skill dirs.
if [[ -d "$TMP/skills" ]]; then
  for child in "$TMP/skills"/*; do
    [[ -e "$child" ]] || continue
    copy_skill_tree "$TMP" "skills/$(basename "$child")"
  done
elif [[ -d "$TMP/.cursor/skills" ]]; then
  for child in "$TMP/.cursor/skills"/*; do
    [[ -e "$child" ]] || continue
    copy_skill_tree "$TMP" ".cursor/skills/$(basename "$child")"
  done
elif [[ -d "$TMP/.claude/skills" ]]; then
  for child in "$TMP/.claude/skills"/*; do
    [[ -e "$child" ]] || continue
    copy_skill_tree "$TMP" ".claude/skills/$(basename "$child")"
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
