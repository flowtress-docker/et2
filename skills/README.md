# et2 skills (resources only)

Agent skills for **flowtress-docker/et2** only. This directory holds reusable skill resources — not WeAreAlma project context (`CONTEXT.md`, `staging/`, app code, app-specific skills, etc.).

**Canonical location:** `skills/` at the et2 repo root. Install into agent directories with:

```bash
./scripts/install-skills.sh
```

## Upstream source

Primary source: **[flowtress-docker/wearealma](https://github.com/flowtress-docker/wearealma/tree/skills)** branch `skills`.

```bash
./scripts/sync-from-wearealma-skills.sh
./scripts/install-skills.sh
```

The sync script copies **resource skills only** and skips WeAreAlma project context (app manifests, `CONTEXT.md`, staging docs, source trees).

> **Cloud agents:** the Cursor GitHub App must include `flowtress-docker/wearealma` in repository access, not just `et2`.

## Contents

| Directory | Source | Purpose |
|-----------|--------|---------|
| `gitnexus/` | wearealma/skills branch | GitNexus MCP tools + `gitnexus://repo/et2/*` resources |
| `caveman/` | [JuliusBrussee/caveman](https://github.com/JuliusBrussee/caveman) | Terse replies |
| `caveman-commit/` | caveman | Conventional Commits, compressed |
| `caveman-review/` | caveman | One-line PR review comments |
| `caveman-compress/` | caveman | Compress markdown memory files |
| `caveman-help/` | caveman | Help / command list |
| `caveman-stats/` | caveman | Token savings stats |
| `cavecrew/` | caveman | Caveman mode for agent teams |
| `handoff/` | [mattpocock/skills](https://github.com/mattpocock/skills) | Session handoff notes |
| `tdd/` | mattpocock/skills | TDD workflow |
| `grill-with-docs/` | mattpocock/skills | Doc-driven design review (format refs only) |

## GitNexus resources (et2)

After indexing, agents can read:

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/et2/context` | Codebase overview, staleness check |
| `gitnexus://repo/et2/clusters` | Functional areas |
| `gitnexus://repo/et2/processes` | Execution flows |
| `gitnexus://repo/et2/process/{name}` | Step-by-step trace |

Refresh index: `npx gitnexus analyze` from repo root.

## Refresh public upstreams

```bash
git clone --depth 1 https://github.com/JuliusBrussee/caveman.git /tmp/caveman-upstream
for d in /tmp/caveman-upstream/skills/*/; do
  cp -a "$d" "skills/$(basename "$d")"
done

git clone --depth 1 https://github.com/mattpocock/skills.git /tmp/mattpocock-skills
cp -a /tmp/mattpocock-skills/skills/productivity/handoff skills/handoff
cp -a /tmp/mattpocock-skills/skills/engineering/tdd skills/tdd
cp -a /tmp/mattpocock-skills/skills/engineering/grill-with-docs skills/grill-with-docs

./scripts/install-skills.sh
```
