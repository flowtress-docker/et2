# Agent Context Pack (6-File Method)

This branch holds a **token-budgeted context pack** for AI agents working on the **et2** Wokwi CLI demo platform. Load these files in order before planning or editing code.

> **Source method:** [flowtress-docker/6-files-context-method](https://github.com/flowtress-docker/6-files-context-method) (template mirrored in `method/` on this branch). The upstream repo was not available at generation time; this pack follows the same six-file layout used across flowtress-docker projects.

## The Six Files

| # | File | Purpose | When to read |
|---|------|---------|--------------|
| 1 | [research/01-landscape.md](research/01-landscape.md) | Platform comparison (Wokwi, Tinkercad, SPICE, KiCad, etc.) | Choosing tools or explaining trade-offs |
| 2 | [research/02-tinkercad-apis.md](research/02-tinkercad-apis.md) | Why browser-only platforms lack APIs | Evaluating non-Wokwi automation |
| 3 | [research/03-repo-index.md](research/03-repo-index.md) | Curated GitHub repos with verdicts | Finding libraries or reference implementations |
| 4 | [research/04-context7-findings.md](research/04-context7-findings.md) | Context7 MCP excerpts (Wokwi + EDA) | API syntax, CLI commands, YAML scenarios |
| 5 | [research/05-working-examples.md](research/05-working-examples.md) | Runnable snippets and integration patterns | Implementing demos or bridges |
| 6 | [research/06-practical-guide.md](research/06-practical-guide.md) | Decision tree and step-by-step methods | End-to-end automation workflows |

## Project Quick Facts

- **Primary stack:** Wokwi CLI + PlatformIO + YAML automation scenarios
- **Architecture:** Demo code lives on isolated `demo/*` branches; `main` / `context` hold workflow scripts and docs only
- **Implementation plan:** [07-wokwi-cli-demos.md](07-wokwi-cli-demos.md)
- **Run demos:** `./run-demo.sh <name>` or `./run-all-demos.sh` (requires `WOKWI_CLI_TOKEN`)
- **Regenerate file 4:** `node scripts/generate-context7-wokwi.js` then merge into `research/04-context7-findings.md`

## Agent Rules

1. Prefer **Wokwi CLI** for programmable MCU demos (official API, CI, scenarios).
2. Do not merge demo firmware into `main` or `context`; use git worktrees / `demo/*` branches.
3. Follow TDD: write `scenarios/demo.yaml` before firmware (RED → GREEN → REFACTOR).
4. Set `build_dir = build` in `platformio.ini` so `wokwi-cli` finds firmware artifacts.
5. Validate part controls and scenario steps against [research/04-context7-findings.md](research/04-context7-findings.md).

## Supplementary Files

- [README.md](README.md) — human-oriented project overview
- [AGENTS.md](AGENTS.md) — tool-specific rules (GitNexus, skills)
- [method/README.md](method/README.md) — reusable 6-file method template
