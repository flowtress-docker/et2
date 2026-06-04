# AI Workflow Rules

## Approach

Incremental, spec-driven. Context files = what/how/state. Implement from specs — don't invent behavior.

Kimi Code orchestrates: read context, run scripts, validate. "Build Wokwi sims" → follow `project-overview.md` + `architecture.md`.

## Scoping Rules

- One unit: one script, one variant config, or one bugfix.
- Small verifiable steps over big speculative diffs.
- Don't mix unrelated boundaries in one step.

## When to Split Work

Split if combining:

- Generation + orchestration changes
- Multiple unrelated variant configs (e.g. ESP32 + Pico same step)
- Behavior not in context files

Can't verify E2E fast (`pio run` + `wokwi-cli`) → scope too broad → split.

## Handling Missing Requirements

- Don't invent behavior outside context files.
- Ambiguous → fix context file first.
- Missing → open question in `progress-tracker.md` before code.

## Protected Files

Don't modify unless told:

- `wokwi-project/` — canonical base for `templates/base/`
- `templates/base/` — regenerate, don't edit in place
- Third-party lib internals (PlatformIO pkgs, node_modules)

## Keeping Docs in Sync

Update context when implementation changes:

- Architecture/boundaries/storage → `architecture.md`
- Code conventions → `code-standards.md`
- Scope/success criteria → `project-overview.md`
- Workflow/scoping → `ai-workflow-rules.md`

## Before Next Unit

1. Current unit works E2E in scope.
2. No `architecture.md` invariant violated.
3. `progress-tracker.md` updated.
4. `pio run` OK for affected variant(s).
5. `wokwi-cli` OK if applicable.
