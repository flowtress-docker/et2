# ADR Format

ADRs live in `docs/adr/` and use sequential numbering: `0001-slug.md`, `0002-slug.md`, etc.

Create the `docs/adr/` directory lazily — only when the first ADR is needed.

## Template
```md
# {Short title of the decision}

{1-3 sentences: what's the context, what did we decide, and why.}
```

That's it. ADR can be single paragraph. value is in recording *that* decision was made and *why* — not in filling out sections.

## Optional sections

Only include these when they add genuine value. Most ADRs won't need them.

- **Status** frontmatter (`proposed | accepted | deprecated | superseded by ADR-NNNN`) — useful when decisions are revisited
- **Considered Options** — only when rejected alternatives are worth remembering
- **Consequences** — only when non-obvious downstream effects need to be called out

## Numbering

Scan `docs/adr/` for the highest existing number and increment by one.

## When to offer ADR

All three of these must be true:

1. **Hard to reverse** — cost of changing your mind later is meaningful
2. **Surprising without context** — future reader will look at code and wonder "why on earth did they do it this way?"
3. **result of real trade-off** — there were genuine alternatives and you picked one for specific reasons

If decision is easy to reverse, skip it — you'll reverse it. If it's not surprising, nobody will wonder why. If there was no real alternative, there's nothing to record beyond "we did obvious thing."

### What qualifies

- **Architectural shape.** "We're using monorepo." "write model is event-sourced, read model is projected into Postgres."
- **Integration patterns between contexts.** "Ordering and Billing communicate via domain events, not synchronous HTTP."
- **Technology choices that carry lock-in.** Database, message bus, auth provider, deployment target. Not every library — ones that would take quarter to swap out.
- **Boundary and scope decisions.** "Customer data is owned by Customer context; other contexts reference it by ID only." explicit no-s are as valuable as yes-s.
- **Deliberate deviations from obvious path.** "We're using manual SQL instead of ORM because X." Anything where reasonable reader would assume opposite. These stop next engineer from "fixing" something that was deliberate.
- **Constraints not visible in code.** "We can't use AWS because of compliance requirements." "Response times must be under 200ms because of partner API contract."
- **Rejected alternatives when rejection is non-obvious.** If you considered GraphQL and picked REST for subtle reasons, record it — otherwise someone will suggest GraphQL again in six months.