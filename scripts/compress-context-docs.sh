#!/usr/bin/env bash
# Compress context-related markdown via caveman-compress (needs ANTHROPIC_API_KEY or `claude` CLI).
# Manual compress already applied? Skips files with existing .original.md unless FORCE=1.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
COMPRESS_DIR="$ROOT/.cursor/skills/caveman-compress"
FILES=(
  "$ROOT/docs/GIT-SCAFFOLD.md"
  "$ROOT/CONTEXT.md"
  "$ROOT/AGENTS.md"
  "$ROOT/staging/v2/context/project-overview.md"
  "$ROOT/staging/v2/context/architecture.md"
  "$ROOT/staging/v2/context/ai-workflow-rules.md"
  "$ROOT/staging/v2/context/ui-context.md"
  "$ROOT/staging/v2/context/code-standards.md"
  "$ROOT/staging/v2/context/progress-tracker.md"
  "$ROOT/research/04-context7-findings.md"
  "$ROOT/.cursor/skills/grill-with-docs/CONTEXT-FORMAT.md"
  "$ROOT/.cursor/skills/grill-with-docs/ADR-FORMAT.md"
)

if [[ ! -d "$COMPRESS_DIR/scripts" ]]; then
  echo "Error: caveman-compress skill missing at $COMPRESS_DIR"
  exit 1
fi

for f in "${FILES[@]}"; do
  [[ -f "$f" ]] || continue
  if [[ -f "${f%.md}.original.md" && "${FORCE:-0}" != "1" ]]; then
    echo "skip (has backup): $f"
    continue
  fi
  echo "▶ $f"
  (cd "$COMPRESS_DIR" && python3 -m scripts "$(realpath "$f")") || echo "⚠️  failed: $f"
done
