#!/usr/bin/env bash
# Bare-repo + worktree scaffolding:
#   .bare/           bare object store (gitignored)
#   main/            main branch worktree (project root — run scripts here)
#   .worktrees/      demo/* branch worktrees
#
# Idempotent. See docs/GIT-SCAFFOLD.md
set -euo pipefail

CONTAINER="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# If script lives in main/scripts/, container is parent of main
if [[ "$(basename "$CONTAINER")" == "main" ]]; then
  CONTAINER="$(dirname "$CONTAINER")"
fi

BARE_DIR="$CONTAINER/.bare"
MAIN_DIR="$CONTAINER/main"
MAIN_BRANCH="${MAIN_BRANCH:-main}"
ORIGIN_URL="${ORIGIN_URL:-https://github.com/flowtress-docker/et2.git}"

log() { echo "▶ $*"; }

run_all_worktrees() {
  local script="$CONTAINER/scripts/setup-all-worktrees.sh"
  [[ -f "$MAIN_DIR/scripts/setup-all-worktrees.sh" ]] && script="$MAIN_DIR/scripts/setup-all-worktrees.sh"
  CONTAINER_ROOT="$CONTAINER" GIT_DIR="$BARE_DIR" MAIN_DIR="$MAIN_DIR" bash "$script"
}

if [[ -d "$BARE_DIR" && -d "$MAIN_DIR/.git" || -f "$MAIN_DIR/.git" ]]; then
  log "Scaffold present. Fetch + refresh all worktrees."
  run_all_worktrees
  exit 0
fi

mkdir -p "$CONTAINER"

if [[ -d "$BARE_DIR" ]]; then
  echo "Error: $BARE_DIR exists but $MAIN_DIR is not a worktree. Remove .bare or fix layout."
  exit 1
fi

log "Clone bare repository"
git clone --bare "$ORIGIN_URL" "$BARE_DIR"

log "Create main worktree at main/"
if [[ -d "$MAIN_DIR" ]]; then
  echo "Error: $MAIN_DIR exists. Remove or empty it before first-time scaffold."
  exit 1
fi
git --git-dir="$BARE_DIR" worktree add "$MAIN_DIR" "$MAIN_BRANCH"

log "All branch worktrees"
run_all_worktrees

echo ""
echo "✅ Scaffold ready"
echo "   cd main     # project root"
echo "   .bare/      # bare git dir"
echo "   .worktrees/ # demo branches"
