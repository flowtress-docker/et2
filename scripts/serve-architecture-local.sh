#!/usr/bin/env bash
# Fast local architecture gallery (Mermaid static HTML — no OpenFlowKit clone).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PORT="${ARCHITECTURE_PORT:-8765}"

node "$ROOT/scripts/generate-mermaid-gallery.mjs" "$ROOT/architecture"

if curl -sf "http://127.0.0.1:${PORT}/gallery-mermaid.html" >/dev/null 2>&1; then
  echo "Server already on http://127.0.0.1:${PORT}/"
else
  echo "Serving http://127.0.0.1:${PORT}/gallery-mermaid.html"
  python3 -m http.server "$PORT" --directory "$ROOT/architecture" --bind 127.0.0.1 &
fi

echo ""
echo "=== et2 architecture (fast) ==="
echo "Gallery: http://127.0.0.1:${PORT}/gallery-mermaid.html"
echo ""
echo "OpenFlowKit editor (optional, slow): ./scripts/serve-openflowkit-local.sh"
