# ADR Format

ADRs in `docs/adr/`, sequential: `0001-slug.md`, `0002-slug.md`, …

Create `docs/adr/` lazily — first ADR only.

## Template

```md
# {Short title of the decision}

{1-3 sentences: what's the context, what did we decide, and why.}
```

Single paragraph OK. Value = record *that* + *why* — not long sections.

## Optional sections

Only when they add value. Most ADRs skip.

- **Status** frontmatter (`proposed | accepted | deprecated | superseded by ADR-NNNN`) — when revisited
- **Considered Options** — when rejected alts worth remembering
- **Consequences** — when non-obvious downstream effects

## Numbering

Scan `docs/adr/` for highest number; increment.

## When to offer an ADR

All three true:

1. **Hard to reverse** — changing mind later costs meaningful effort
2. **Surprising without context** — future reader wonders "why this way?"
3. **Real trade-off** — genuine alternatives; picked one for specific reasons

Easy to reverse → skip (just reverse). Not surprising → nobody asks. No alternative → obvious thing, no ADR.

### What qualifies

- **Architectural shape.** Monorepo; event-sourced write + Postgres read model.
- **Integration between contexts.** Events not sync HTTP between Ordering/Billing.
- **Lock-in tech.** DB, bus, auth, deploy target — not every library; ones costly to swap.
- **Boundary/scope.** "Customer context owns customer data; others reference ID only." Explicit nos matter.
- **Deliberate non-obvious choices.** Manual SQL not ORM because X. Stops "fixes" to deliberate code.
- **Constraints not in code.** Compliance blocks AWS. Partner SLA <200ms.
- **Rejected non-obvious alts.** Considered GraphQL, picked REST for subtle reasons — or GraphQL resurfaces in 6mo.
