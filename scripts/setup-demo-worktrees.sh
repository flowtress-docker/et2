#!/usr/bin/env bash
# Back-compat wrapper: ensures all origin branches have worktrees (including demos).
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec "$SCRIPT_DIR/setup-all-worktrees.sh" "$@"
