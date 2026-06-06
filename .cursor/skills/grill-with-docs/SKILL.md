---
name: grill-with-docs
description: Grilling session that challenges your plan against the existing domain model, sharpens terminology, and updates documentation (CONTEXT.md, ADRs) inline as decisions crystallise. Use when user wants to stress-test a plan against their project's language and documented decisions.
---

<what-to-do>

Interview me relentlessly about every aspect of this plan until we reach shared understanding. Walk down each branch of design tree, resolving dependencies between decisions one-by-one. For each question, provide your recommended answer.

Ask questions one at time, waiting for feedback on each question before continuing.

If question can be answered by exploring codebase, explore codebase instead.

</what-to-do>

<supporting-info>

## Domain awareness

During codebase exploration, also look for existing documentation:

### File structure

Most repos have single context:
```
/
├── CONTEXT.md
├── docs/
│   └── adr/
│       ├── 0001-event-sourced-orders.md
│       └── 0002-postgres-for-write-model.md
└── src/
```

If a `CONTEXT-MAP.md` exists at the root, the repo has multiple contexts. The map points to where each one lives:
```
/
├── CONTEXT-MAP.md
├── docs/
│   └── adr/                          ← system-wide decisions
├── src/
│   ├── ordering/
│   │   ├── CONTEXT.md
│   │   └── docs/adr/                 ← context-specific decisions
│   └── billing/
│       ├── CONTEXT.md
│       └── docs/adr/
```

Create files lazily — only when you have something to write. If no `CONTEXT.md` exists, create one when the first term is resolved. If no `docs/adr/` exists, create it when the first ADR is needed.

## During session

### Challenge against glossary

When the user uses a term that conflicts with the existing language in `CONTEXT.md`, call it out immediately. "Your glossary defines 'cancellation' as X, but you seem to mean Y — which is it?"

### Sharpen fuzzy language

When user uses vague or overloaded terms, propose precise canonical term. "You're saying 'account' — do you mean Customer or User? Those are different things."

### Discuss concrete scenarios

When domain relationships are being discussed, stress-test them with specific scenarios. Invent scenarios that probe edge cases and force user to be precise about boundaries between concepts.

### Cross-reference with code

When user states how something works, check whether code agrees. If you find contradiction, surface it: "Your code cancels entire Orders, but you said partial cancellation is possible — → right?"

### Update CONTEXT.md inline

When a term is resolved, update `CONTEXT.md` right there. Don't batch these up — capture them as they happen. Use the format in [CONTEXT-FORMAT.md](./CONTEXT-FORMAT.md).

`CONTEXT.md` should be totally devoid of implementation details. Do not treat `CONTEXT.md` as a spec, a scratch pad, or a repository for implementation decisions. It is a glossary and nothing else.

### Offer ADRs sparingly

Only offer to create ADR when all three are true:

1. **Hard to reverse** — cost of changing your mind later is meaningful
2. **Surprising without context** — future reader will wonder "why did they do it this way?"
3. **result of real trade-off** — there were genuine alternatives and you picked one for specific reasons

If any of three is missing, skip ADR. Use format in [ADR-FORMAT.md](./ADR-FORMAT.md).

</supporting-info>