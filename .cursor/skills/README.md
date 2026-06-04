# Caveman skills (workspace install)

Vendored from [JuliusBrussee/caveman](https://github.com/JuliusBrussee/caveman) `main` (`skills/*`).

| Directory | Purpose |
|-----------|---------|
| `caveman/` | Terse replies (workspace default: **ultra**) |
| `caveman-commit/` | Conventional Commits, compressed |
| `caveman-review/` | One-line PR review comments |
| `caveman-compress/` | Compress markdown memory files (`scripts/` for CLI) |
| `caveman-help/` | Help / command list |
| `caveman-stats/` | Token savings stats |
| `cavecrew/` | Caveman mode for agent teams |

Refresh from upstream:

```bash
git clone --depth 1 https://github.com/JuliusBrussee/caveman.git /tmp/caveman-upstream
for d in /tmp/caveman-upstream/skills/*/; do
  cp -a "$d" ".cursor/skills/$(basename "$d")"
done
# Re-apply workspace default in caveman/SKILL.md if needed (ultra + .mdc rule).
```

## Matt Pocock ([mattpocock/skills](https://github.com/mattpocock/skills))

| Directory | Source | Purpose |
|-----------|--------|---------|
| `handoff/` | `skills/productivity/handoff` | Session handoff notes for next agent |
| `tdd/` | `skills/engineering/tdd` | TDD workflow (+ `deep-modules.md`, `tests.md`, etc.) |
| `grill-with-docs/` | `skills/engineering/grill-with-docs` | Doc-driven design review (+ ADR/CONTEXT formats) |

Refresh:

```bash
git clone --depth 1 https://github.com/mattpocock/skills.git /tmp/mattpocock-skills
cp -a /tmp/mattpocock-skills/skills/productivity/handoff .cursor/skills/handoff
cp -a /tmp/mattpocock-skills/skills/engineering/tdd .cursor/skills/tdd
cp -a /tmp/mattpocock-skills/skills/engineering/grill-with-docs .cursor/skills/grill-with-docs
```
