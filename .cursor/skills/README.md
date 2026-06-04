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
