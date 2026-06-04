# et2 — Agent Context Branch

This branch holds **structured context for AI agents** working on the **et2 v2 plugin** (Cursor / et2 tooling). It is not the application runtime branch: demo firmware and legacy Wokwi worktrees live on **`main`**.

## Purpose

- Give agents a **token-budgeted** context pack instead of the full monorepo
- Separate **v2 plugin architecture** (staging) from **legacy Wokwi CLI demos** (main worktrees)
- Version context alongside code so prompts stay reproducible

## Where to Start

| Resource | Description |
|----------|-------------|
| [CONTEXT.md](CONTEXT.md) | Layer 2 glossary and index to the six-file research pack (`research/01`–`06`) |
| [staging/v2/docs/grill-me_sesh/](staging/v2/docs/grill-me_sesh/) | Layer 1 canonical output from grill-with-docs (decisions, glossary, architecture YAML) |
| [staging/v2/context/](staging/v2/context/) | Layer 3 appendix markdown (architecture, standards, UI, progress) |
| [method/README.md](method/README.md) | Three-layer context model and six-file generation method |
| [AGENTS.md](AGENTS.md) | Tool-specific rules (skills, MCP) |

Read **Layer 1** (`grill-me_sesh`) for et2 v2 truth, then **CONTEXT.md**, then appendix files only as needed.

## Branch Layout

```
context branch (this branch)
├── CONTEXT.md              ← agent entry (Layer 2)
├── research/01–06.md       ← six-file appendix (Layer 3)
├── staging/v2/
│   ├── docs/grill-me_sesh/ ← canonical session (Layer 1)
│   └── context/*.md        ← staging supplements (Layer 3)
└── method/                 ← reusable method docs

main branch
├── run-demo.sh, visual-demo/, …
└── .worktrees/             ← legacy Wokwi demo branches (demo/*)
```

**Main** retains the original Wokwi CLI demo platform: isolated git worktrees under `.worktrees/`, workflow scripts, and per-demo branches. Do not expect v2 plugin implementation files here on `context`; use `staging/v2` artifacts and research files for agent work.

## Doc sources on this branch

Merged from read-only branches (docs and agent skills only — no firmware or build scripts):

| Branch | Contents brought in |
|--------|---------------------|
| `origin/cursor/generate-six-file-context-70a7` | Six-file pack, `CONTEXT.md`, `method/`, `research/`, grill-me_sesh |
| `origin/staging/v2` | Latest compressed context appendix + Wokwi publisher design spec |
| `origin/cursor/git-scaffold-a2c7` | `.cursor/skills`, `docs/GIT-SCAFFOLD.md`, caveman ultra rule |
| `origin/cursor/dev-env-cloud-a2c7` | Cursor Cloud Wokwi notes in `AGENTS.md` (legacy `main` demos) |

## Syncing from staging

Canonical grill-with-docs output lives under `staging/v2/docs/grill-me_sesh/` and `staging/v2/context/`. To refresh from `origin/staging/v2` on a writable branch:

```bash
git checkout origin/staging/v2 -- staging/v2/docs/grill-me_sesh staging/v2/context
```

## References

- Six-file method: [method/README.md](method/README.md)
- Upstream method template: [flowtress-docker/6-files-context-method](https://github.com/flowtress-docker/6-files-context-method)
