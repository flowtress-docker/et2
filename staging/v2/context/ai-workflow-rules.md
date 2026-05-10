# AI Workflow Rules

## Approach

Build this project incrementally using a spec-driven workflow. Context files define what to build, how to build it, and the current state of progress. Always implement against these specs — do not infer or invent behavior from scratch.

Kimi Code is the orchestrator. It reads the context files, runs the scripts, and validates results. When Kimi Code is asked to "build the Wokwi simulations," it follows the pipeline defined in `project-overview.md` and `architecture.md`.

## Scoping Rules

- Work on one feature unit at a time: one script, one variant configuration, or one bugfix.
- Prefer small, verifiable increments over large speculative changes.
- Do not combine unrelated system boundaries in a single implementation step.

## When to Split Work

Split an implementation step if it combines:

- Generation logic changes and orchestration changes
- Multiple unrelated variant configs (e.g. adding both ESP32 and Pico variants in one go)
- Behavior not clearly defined in the context files

If a change cannot be verified end to end quickly (`pio run` + `wokwi-cli` passes), the scope is too broad — split it.

## Handling Missing Requirements

- Do not invent product behavior not defined in the context files.
- If a requirement is ambiguous, resolve it in the relevant context file before implementing.
- If a requirement is missing, add it as an open question in `progress-tracker.md` before continuing.

## Protected Files

Do not modify the following unless explicitly instructed:

- `wokwi-project/` — Canonical base demo (source of truth for `templates/base/`)
- `templates/base/` — Copied from `wokwi-project/`; regenerate rather than edit in place
- Any third-party library internals (PlatformIO packages, Node modules)

## Keeping Docs in Sync

Update the relevant context file whenever implementation changes:

- System architecture or boundaries → `architecture.md`
- Storage model or file organization decisions → `architecture.md`
- Code conventions or standards → `code-standards.md`
- Feature scope or success criteria → `project-overview.md`
- Workflow or scoping rules → `ai-workflow-rules.md`

## Before Moving to the Next Unit

1. The current unit works end to end within its defined scope.
2. No invariant defined in `architecture.md` was violated.
3. `progress-tracker.md` reflects the completed work.
4. `pio run` passes for the affected variant(s).
5. `wokwi-cli` simulation passes for the affected variant(s) (if applicable).
