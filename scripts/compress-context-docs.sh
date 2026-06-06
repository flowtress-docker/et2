#!/usr/bin/env bash
# Batch compress context markdown via rules-only caveman-compress (no Claude/API).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
COMPRESS_DIR="$ROOT/.cursor/skills/caveman-compress"
FORCE="${FORCE:-0}"

FILES=(
  "$ROOT/context/CONTEXT.md"
  "$ROOT/context/AGENTS.md"
  "$ROOT/context/CLAUDE.md"
  "$ROOT/context/docs/GIT-SCAFFOLD.md"
  "$ROOT/context/research/04-context7-findings.md"
  "$ROOT/context/staging/v2/context/project-overview.md"
  "$ROOT/context/staging/v2/context/architecture.md"
  "$ROOT/context/staging/v2/context/ai-workflow-rules.md"
  "$ROOT/context/staging/v2/context/ui-context.md"
  "$ROOT/context/staging/v2/context/code-standards.md"
  "$ROOT/context/staging/v2/context/progress-tracker.md"
  "$ROOT/.cursor/skills/grill-with-docs/CONTEXT-FORMAT.md"
  "$ROOT/.cursor/skills/grill-with-docs/ADR-FORMAT.md"
  "$ROOT/.cursor/skills/caveman/SKILL.md"
  "$ROOT/.cursor/skills/cavecrew/SKILL.md"
  "$ROOT/.cursor/skills/caveman-commit/SKILL.md"
  "$ROOT/.cursor/skills/caveman-review/SKILL.md"
  "$ROOT/.cursor/skills/caveman-help/SKILL.md"
  "$ROOT/.cursor/skills/handoff/SKILL.md"
  "$ROOT/.cursor/skills/tdd/SKILL.md"
  "$ROOT/.cursor/skills/grill-with-docs/SKILL.md"
)

if [[ ! -f "$COMPRESS_DIR/scripts/rules_compress.py" ]]; then
  echo "Error: rules_compress.py missing in $COMPRESS_DIR/scripts" >&2
  exit 1
fi

for f in "${FILES[@]}"; do
  [[ -f "$f" ]] || { echo "skip (missing): $f"; continue; }
  if [[ -f "${f%.md}.original.md" && "$FORCE" != "1" ]]; then
    echo "skip (has backup): $f"
    continue
  fi
  echo "▶ $f"
  (cd "$COMPRESS_DIR" && python3 -m scripts.compress_rules_only "$(realpath "$f")") || echo "⚠️  failed: $f"
done

echo "done"
