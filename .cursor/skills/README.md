# et2 skills branch

Agent skills for use across et2 branches. Checkout or sparse-fetch this branch while working elsewhere.

## Install into another branch/worktree

```bash
# from target branch worktree
/path/to/et2/scripts/install-skills.sh
# or copy manually:
rsync -a /path/to/et2/.cursor/skills/ .cursor/skills/
rsync -a /path/to/et2/.cursor/rules/ .cursor/rules/
```

## Sources

| Directory | Upstream |
|-----------|----------|
| `caveman*` + `cavecrew` | [JuliusBrussee/caveman](https://github.com/JuliusBrussee/caveman) |
| `handoff`, `tdd`, `grill-with-docs` | [mattpocock/skills](https://github.com/mattpocock/skills) |

## Default communication

**Caveman ultra forever** — `.cursor/rules/caveman-ultra-default.mdc` (`alwaysApply: true`).

## Compress context docs (no Claude)

```bash
./scripts/compress-context-docs.sh
```

Uses `caveman-compress/scripts/rules_compress.py` — deterministic, no API key.

Single file:

```bash
cd .cursor/skills/caveman-compress
python3 -m scripts.compress_rules_only /absolute/path/to/file.md
```

Backup: `<file>.original.md`. Compressed file overwrites original.

## Refresh upstream

```bash
git clone --depth 1 https://github.com/JuliusBrussee/caveman.git /tmp/caveman-upstream
for d in /tmp/caveman-upstream/skills/*/; do cp -a "$d" .cursor/skills/$(basename "$d"); done

git clone --depth 1 https://github.com/mattpocock/skills.git /tmp/mattpocock-skills
cp -a /tmp/mattpocock-skills/skills/productivity/handoff .cursor/skills/handoff
cp -a /tmp/mattpocock-skills/skills/engineering/tdd .cursor/skills/tdd
cp -a /tmp/mattpocock-skills/skills/engineering/grill-with-docs .cursor/skills/grill-with-docs
```
