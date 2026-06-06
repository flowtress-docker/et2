#!/usr/bin/env python3
"""Compress a markdown file using deterministic rules (no API)."""

from __future__ import annotations

import os
import sys
from pathlib import Path

from .detect import should_compress
from .rules_compress import compress_markdown
from .validate import validate


def compress_file_rules(filepath: Path) -> bool:
    filepath = filepath.resolve()
    if not filepath.exists():
        raise FileNotFoundError(filepath)
    if not should_compress(filepath):
        print("skip: not natural language")
        return False

    original = filepath.read_text(errors="ignore")
    if not original.strip():
        print("skip: empty")
        return False

    backup = filepath.with_name(filepath.stem + ".original.md")
    force = os.environ.get("FORCE", "0") == "1"
    if backup.exists() and not force:
        print(f"skip: backup exists {backup}")
        return False
    if backup.exists() and force:
        original = backup.read_text(errors="ignore")
        backup.unlink()

    compressed = compress_markdown(original)
    if compressed.strip() == original.strip():
        print("skip: no change")
        return False

    backup.write_text(original)
    filepath.write_text(compressed)

    result = validate(backup, filepath)
    if not result.is_valid:
        filepath.write_text(original)
        backup.unlink(missing_ok=True)
        print("failed validation:")
        for err in result.errors:
            print(f"  - {err}")
        return False

    print(f"ok: {filepath}")
    print(f"backup: {backup}")
    return True


def main() -> None:
    if len(sys.argv) != 2:
        print("Usage: python3 -m scripts.compress_rules_only <filepath>")
        sys.exit(1)
    ok = compress_file_rules(Path(sys.argv[1]))
    sys.exit(0 if ok else 2)


if __name__ == "__main__":
    main()
