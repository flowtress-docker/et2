#!/usr/bin/env bash
# Run OpenFlowKit locally and open et2 architecture diagrams on localhost.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OFK_DIR="${OPENFLOWKIT_DIR:-$ROOT/.openflowkit}"
OFK_PORT="${OPENFLOWKIT_PORT:-5173}"
INDEX_PORT="${ARCHITECTURE_INDEX_PORT:-8765}"
APP_URL="http://localhost:${OFK_PORT}"

clone_if_needed() {
  if [[ -f "$OFK_DIR/package.json" ]]; then
    return 0
  fi
  echo "Cloning OpenFlowKit into $OFK_DIR …"
  git clone --depth 1 https://github.com/Vrun-design/openflowkit.git "$OFK_DIR"
}

install_if_needed() {
  if [[ -d "$OFK_DIR/node_modules" ]]; then
    return 0
  fi
  echo "Installing OpenFlowKit dependencies (first run may take a few minutes) …"
  (cd "$OFK_DIR" && npm install)
}

regen_index() {
  echo "Generating architecture index for $APP_URL …"
  (cd "$ROOT/scripts" && npm install --silent 2>/dev/null || true)
  node "$ROOT/scripts/generate-architecture-index.mjs" "$ROOT/architecture" "$APP_URL"
}

start_openflowkit() {
  if curl -sf "http://127.0.0.1:${OFK_PORT}/" >/dev/null 2>&1; then
    echo "OpenFlowKit already listening on $APP_URL"
    return 0
  fi
  echo "Starting OpenFlowKit dev server on $APP_URL …"
  (cd "$OFK_DIR" && npm run dev -- --host 127.0.0.1 --port "$OFK_PORT") &
  OFK_PID=$!
  for _ in $(seq 1 90); do
    if curl -sf "http://127.0.0.1:${OFK_PORT}/" >/dev/null 2>&1; then
      echo "OpenFlowKit ready (pid $OFK_PID)"
      return 0
    fi
    sleep 1
  done
  echo "OpenFlowKit failed to start within 90s" >&2
  exit 1
}

start_index() {
  if curl -sf "http://127.0.0.1:${INDEX_PORT}/" >/dev/null 2>&1; then
    echo "Architecture index already on http://127.0.0.1:${INDEX_PORT}/"
    return 0
  fi
  echo "Serving diagram index on http://127.0.0.1:${INDEX_PORT}/"
  python3 -m http.server "$INDEX_PORT" --directory "$ROOT/architecture" --bind 127.0.0.1 &
}

main() {
  clone_if_needed
  install_if_needed
  regen_index
  start_openflowkit
  start_index
  layers_url="$(node -e "const b='$APP_URL'; const u=JSON.parse(require('fs').readFileSync('$ROOT/architecture/viewer-urls.json','utf8'))['et2-system-layers'].viewerUrl; console.log(u.replace(/^https?:\\/\\/[^#]+/, b))")"
  echo ""
  echo "=== et2 architecture (localhost) ==="
  echo "Index:    http://127.0.0.1:${INDEX_PORT}/"
  echo "OpenFlow: ${APP_URL}/#/home"
  echo "Layers:   ${layers_url}"
  echo ""
  echo "Press Ctrl+C to stop background servers started from this script."
  wait
}

main "$@"
