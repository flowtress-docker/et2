#!/usr/bin/env python3
"""
Interactive Wokwi Demo Server
Wraps Wokwi CLI to run microprocessor simulations on-demand.
Serves a web frontend where users control light source parameters
and see actual LDR + LCD readings from simulated hardware.
"""

import os
import re
import subprocess
import tempfile
import time
from pathlib import Path

from flask import Flask, jsonify, request, send_from_directory

app = Flask(__name__)

# Paths
PROJECT_ROOT = Path(__file__).parent.resolve()
WOKWI_DIR = PROJECT_ROOT / "wokwi-project"
STATIC_DIR = PROJECT_ROOT / "static"

# Cache for recent simulation results
# Key: lux_value, Value: {lux, adc, timestamp}
SIMULATION_CACHE = {}
CACHE_TTL_SECONDS = 300


def run_simulation(lux_value: int, timeout_ms: int = 8000) -> dict:
    """
    Run a Wokwi CLI simulation with a temporary scenario that sets
    the photoresistor lux value, then parse serial output for LUX/ADC.
    """
    lux_value = max(0, min(100, lux_value))

    # Check cache
    now = time.time()
    cached = SIMULATION_CACHE.get(lux_value)
    if cached and (now - cached["timestamp"]) < CACHE_TTL_SECONDS:
        return cached

    # Build temporary scenario YAML
    scenario_content = f"""name: 'Interactive Light Sensor'
version: 1
author: 'Demo Bot'

steps:
  - set-control:
      part-id: ldr
      control: lux
      value: {lux_value}
  - delay: 500ms
  - wait-serial: 'LUX:'
"""

    with tempfile.NamedTemporaryFile(
        mode="w", suffix=".yaml", delete=False, dir=WOKWI_DIR
    ) as f:
        f.write(scenario_content)
        scenario_path = f.name

    try:
        # Run Wokwi CLI
        cmd = [
            "wokwi-cli",
            str(WOKWI_DIR),
            "--scenario",
            scenario_path,
            "--timeout",
            str(timeout_ms),
            "--serial-log-file",
            "/dev/stderr",
        ]

        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=(timeout_ms / 1000) + 5,
        )

        # Parse serial output from stdout + stderr
        output = result.stdout + "\n" + result.stderr

        # Extract LUX and ADC values
        lux_match = re.search(r"LUX:(\d+)", output)
        adc_match = re.search(r"ADC:(\d+)", output)

        lux_reading = int(lux_match.group(1)) if lux_match else lux_value
        adc_reading = int(adc_match.group(1)) if adc_match else None

        response = {
            "input_lux": lux_value,
            "reading_lux": lux_reading,
            "reading_adc": adc_reading,
            "cli_exit_code": result.returncode,
            "timestamp": now,
            "raw_output": output[-2000:] if len(output) > 2000 else output,
        }

        # Cache result
        SIMULATION_CACHE[lux_value] = response
        return response

    except subprocess.TimeoutExpired:
        return {
            "input_lux": lux_value,
            "error": "Wokwi CLI timed out",
            "timestamp": now,
        }
    except FileNotFoundError:
        return {
            "input_lux": lux_value,
            "error": "wokwi-cli not found. Install: curl -L https://wokwi.com/ci/install.sh | sh",
            "timestamp": now,
        }
    except subprocess.CalledProcessError as e:
        # wokwi-cli exists but failed (e.g. missing token)
        output = e.stdout + "\n" + e.stderr if hasattr(e, 'stdout') else str(e)
        if "WOKWI_CLI_TOKEN" in output or "token" in output.lower():
            return {
                "input_lux": lux_value,
                "error": "WOKWI_CLI_TOKEN not set. Get your token at https://wokwi.com/dashboard/ci and export WOKWI_CLI_TOKEN=<token>",
                "raw_output": output[-1000:] if len(output) > 1000 else output,
                "timestamp": now,
            }
        return {
            "input_lux": lux_value,
            "error": f"wokwi-cli failed (exit {e.returncode}): {output[-500:]}",
            "timestamp": now,
        }
    except Exception as e:
        return {
            "input_lux": lux_value,
            "error": str(e),
            "timestamp": now,
        }
    finally:
        # Clean up temp scenario
        try:
            os.unlink(scenario_path)
        except OSError:
            pass


@app.route("/visual-demo/", defaults={"path": "index.html"})
@app.route("/visual-demo/<path:path>")
def serve_static(path):
    """Serve the interactive demo frontend."""
    return send_from_directory(STATIC_DIR, path)


@app.route("/api/simulate", methods=["POST"])
def api_simulate():
    """Run a Wokwi simulation with the requested lux value."""
    data = request.get_json(force=True, silent=True) or {}
    lux = data.get("lux", 50)
    try:
        lux = int(lux)
    except (ValueError, TypeError):
        lux = 50

    result = run_simulation(lux)
    return jsonify(result)


@app.route("/api/health")
def api_health():
    """Health check."""
    wokwi_ok = os.system("which wokwi-cli >/dev/null 2>&1") == 0
    return jsonify(
        {
            "status": "ok",
            "wokwi_cli_installed": wokwi_ok,
            "wokwi_project_dir": str(WOKWI_DIR),
        }
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
