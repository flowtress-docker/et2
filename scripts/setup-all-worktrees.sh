#!/usr/bin/env bash
# Add a worktree under .worktrees/ for every branch on origin (except main → use main/).
# Idempotent. https://github.com/flowtress-docker/et2
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONTAINER="${CONTAINER_ROOT:-$(cd "$SCRIPT_DIR/.." && pwd)}"
if [[ "$(basename "$CONTAINER")" == "main" ]]; then
  CONTAINER="$(dirname "$CONTAINER")"
fi

BARE_DIR="${GIT_DIR:-$CONTAINER/.bare}"
MAIN_DIR="${MAIN_DIR:-$CONTAINER/main}"
WORKTREE_BASE="$CONTAINER/.worktrees"
ORIGIN_URL="${ORIGIN_URL:-https://github.com/flowtress-docker/et2.git}"
MAIN_BRANCH="${MAIN_BRANCH:-main}"

mkdir -p "$WORKTREE_BASE"

if [[ ! -d "$BARE_DIR" ]]; then
  echo "Error: $BARE_DIR missing. Run ./scripts/setup-git-scaffold.sh first."
  exit 1
fi

branch_to_dir() {
  local branch="$1"
  if [[ "$branch" == demo/* ]]; then
    echo "demo-${branch#demo/}"
  else
    echo "${branch//\//-}"
  fi
}

branch_checked_out() {
  local want="$1" b
  while IFS= read -r b; do
    [[ "$b" == "$want" ]] && return 0
  done < <(
    git --git-dir="$BARE_DIR" worktree list --porcelain |
      awk '/^branch / { b=$2; sub(/^refs\/heads\//, "", b); print b }'
  )
  return 1
}

worktree_path_for_branch() {
  local want="$1"
  git --git-dir="$BARE_DIR" worktree list --porcelain | {
    local path=""
    while read -r line; do
      if [[ "$line" == worktree* ]]; then
        path="${line#worktree }"
      elif [[ "$line" == branch* ]]; then
        local b="${line#branch }"
        b="${b#refs/heads/}"
        if [[ "$b" == "$want" ]]; then
          echo "$path"
          exit 0
        fi
      fi
    done
    exit 1
  }
}

log() { echo "▶ $*"; }

log "Fetch all branches from origin"
git --git-dir="$BARE_DIR" remote set-url origin "$ORIGIN_URL" 2>/dev/null || \
  git --git-dir="$BARE_DIR" remote add origin "$ORIGIN_URL"
git --git-dir="$BARE_DIR" config --unset-all remote.origin.fetch 2>/dev/null || true
git --git-dir="$BARE_DIR" config --add remote.origin.fetch '+refs/heads/*:refs/remotes/origin/*'
git --git-dir="$BARE_DIR" fetch origin --prune

# Sync refs/heads from origin (skip if branch is checked out in a worktree — fetch already updated remote)
while IFS= read -r ref; do
  branch="${ref#origin/}"
  [[ -z "$branch" ]] && continue
  if branch_checked_out "$branch"; then
    continue
  fi
  git --git-dir="$BARE_DIR" update-ref "refs/heads/$branch" "refs/remotes/origin/$branch" 2>/dev/null || true
done < <(git --git-dir="$BARE_DIR" for-each-ref --format='%(refname:short)' refs/remotes/origin/)

added=0
skipped=0

while IFS= read -r branch; do
  [[ -z "$branch" ]] && continue

  if [[ "$branch" == "$MAIN_BRANCH" ]] && [[ -e "$MAIN_DIR/.git" ]]; then
    echo "✓ $MAIN_BRANCH → $MAIN_DIR"
    ((skipped++)) || true
    continue
  fi

  dir_name="$(branch_to_dir "$branch")"
  dir="$WORKTREE_BASE/$dir_name"

  if existing="$(worktree_path_for_branch "$branch" 2>/dev/null)"; then
    echo "✓ $branch → $existing"
    ((skipped++)) || true
    continue
  fi

  if [[ -d "$dir" ]]; then
    if [[ -e "$dir/.git" ]]; then
      echo "✓ Exists: $dir"
      ((skipped++)) || true
      continue
    fi
    echo "⚠️  Removing stale $dir"
    rm -rf "$dir"
  fi

  start_point=""
  if git --git-dir="$BARE_DIR" show-ref --verify --quiet "refs/heads/$branch"; then
    start_point="$branch"
  elif git --git-dir="$BARE_DIR" show-ref --verify --quiet "refs/remotes/origin/$branch"; then
    start_point="origin/$branch"
  else
    echo "⚠️  Skip $branch: no ref"
    ((skipped++)) || true
    continue
  fi

  log "worktree add $dir ← $branch"
  if git --git-dir="$BARE_DIR" show-ref --verify --quiet "refs/heads/$branch"; then
    git --git-dir="$BARE_DIR" worktree add "$dir" "$branch"
  else
    git --git-dir="$BARE_DIR" worktree add -b "$branch" "$dir" "$start_point"
  fi
  ((added++)) || true
done < <(git --git-dir="$BARE_DIR" for-each-ref --format='%(refname:short)' refs/remotes/origin/ | sed 's|^origin/||' | sort -u)

echo ""
echo "Added: $added, skipped: $skipped"
git --git-dir="$BARE_DIR" worktree list
