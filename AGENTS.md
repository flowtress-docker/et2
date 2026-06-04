## Six-File Context Pack

**Primary spec:** [`staging/v2/docs/grill-me_sesh/`](staging/v2/docs/grill-me_sesh/) (manifest, glossary, invariants, status matrix) plus root [`CONTEXT.md`](CONTEXT.md) glossary.

**v1 invariants (non-negotiable):**

- Real Wokwi emulation only — no client-side hardware fakes ([`invariants.yaml`](staging/v2/docs/grill-me_sesh/invariants.yaml))
- Unmatched prompts → present nearest variant and wait for operator confirmation before generate
- Generated projects under `.et2/projects/<id>/` (gitignored)

**Research appendix:** [`research/01-landscape.md`](research/01-landscape.md) through [`research/06-practical-guide.md`](research/06-practical-guide.md) — landscape and Wokwi CLI reference only; not the product spec.

**Active implementation:** [`staging/v2/scripts/variants.js`](staging/v2/scripts/variants.js) (template variant recipes).

**Legacy on `main`:** `demo/*` branches and `./run-demo.sh` worktrees remain for historical Wokwi CLI demos; they are not the north star for the agentic plugin on `staging/v2`.

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **et2** (282 symbols, 320 relationships, 7 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/et2/context` | Codebase overview, check index freshness |
| `gitnexus://repo/et2/clusters` | All functional areas |
| `gitnexus://repo/et2/processes` | All execution flows |
| `gitnexus://repo/et2/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
