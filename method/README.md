# Six-File Context Method

A repeatable workflow for giving coding agents **structured, bounded context** without dumping the whole repository.

## Why Six Files?

| Problem | How six files help |
|---------|-------------------|
| Token limits | Each file has a single concern; agents load only what they need |
| Stale prompts | Research is version-controlled and regenerated from tools (Context7, web) |
| Lost-in-the-middle | Numbered order gives a stable reading sequence |
| Tool sprawl | File 4 centralizes MCP/library excerpts; file 3 centralizes repo links |

## File Roles

1. **Landscape** — What exists in the problem domain; comparison tables and recommendations.
2. **APIs / constraints** — Official vs unofficial access; what is *not* possible.
3. **Repo index** — Short list of GitHub projects with stars, freshness, and verdict (`works` / `stale`).
4. **Context7 findings** — Quoted snippets from `@upstash/context7-mcp` with library IDs and sources.
5. **Working examples** — Minimal code from real repos or docs.
6. **Practical guide** — Decision tree + numbered procedures agents can execute.

## Generation Pipeline

```bash
# 1–3: Research (web search, manual curation) → research/01–03.md

# 4: Context7 MCP
node scripts/generate-context7-wokwi.js   # or project-specific script
# Merge output into research/04-context7-findings.md

# 5–6: Distill examples and procedures from 01–04 → research/05–06.md

# Manifest
# Write CONTEXT.md linking all six files + project rules
```

## Applying to a New Repo

1. Copy this `method/` folder and `CONTEXT.md` template.
2. Replace research topics (e.g. swap Tinkercad for your domain).
3. Point `AGENTS.md` at `CONTEXT.md` and the six files.
4. Keep generated context on a dedicated branch (e.g. `context`) if `main` should stay code-only.

## References

- Context7 MCP: `@upstash/context7-mcp`
- Example pack: [flowtress-docker/et2](https://github.com/flowtress-docker/et2) branch `context`
