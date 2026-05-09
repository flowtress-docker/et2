#!/usr/bin/env bash
# Start the interactive Wokwi demo server
# Serves at http://<tailscale-ip>:8080/visual-demo/

set -euo pipefail

cd "$(dirname "$0")"

# Ensure wokwi-cli is in PATH
export PATH="/Users/lab/bin:$PATH"

# Use virtualenv if present
if [[ -d ".venv" ]]; then
  source .venv/bin/activate
fi

# Check dependencies
if ! command -v flask &>/dev/null; then
  echo "Installing Python dependencies..."
  pip install -r requirements.txt
fi

if ! command -v wokwi-cli &>/dev/null; then
  echo "Warning: wokwi-cli not found. Install with: curl -L https://wokwi.com/ci/install.sh | sh"
fi

export FLASK_APP=app.py
export FLASK_ENV=development

echo "Starting server on http://0.0.0.0:8080/visual-demo/"
flask run --host=0.0.0.0 --port=8080
