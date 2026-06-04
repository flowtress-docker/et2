# CONTEXT.md Format

## Structure

```md
# {Context Name}

{One or two sentence description of what this context is and why it exists.}

## Language

**Order**:
{A one or two sentence description of the term}
_Avoid_: Purchase, transaction

**Invoice**:
A request for payment sent to a customer after delivery.
_Avoid_: Bill, payment request

**Customer**:
A person or organization that places orders.
_Avoid_: Client, buyer, account
```

## Rules

- **Opinionated.** Multiple words for same concept → pick best; rest under `_Avoid_`.
- **Tight defs.** 1–2 sentences. What it IS, not what it does.
- **Project-specific terms only.** No general programming concepts (timeouts, error types, utils) unless unique to this context.
- **Subheadings** when natural clusters; flat list OK for one cohesive area.

## Single vs multi-context repos

**Single (most repos):** one root `CONTEXT.md`.

**Multiple:** root `CONTEXT-MAP.md` lists contexts, paths, relations:

```md
# Context Map

## Contexts

- [Ordering](./src/ordering/CONTEXT.md) — receives and tracks customer orders
- [Billing](./src/billing/CONTEXT.md) — generates invoices and processes payments
- [Fulfillment](./src/fulfillment/CONTEXT.md) — manages warehouse picking and shipping

## Relationships

- **Ordering → Fulfillment**: Ordering emits `OrderPlaced` events; Fulfillment consumes them to start picking
- **Fulfillment → Billing**: Fulfillment emits `ShipmentDispatched` events; Billing consumes them to generate invoices
- **Ordering ↔ Billing**: Shared types for `CustomerId` and `Money`
```

Skill infers structure:

- `CONTEXT-MAP.md` → read map for contexts
- root `CONTEXT.md` only → single context
- neither → create root `CONTEXT.md` lazily on first term

Multi-context: infer topic's context; if unclear, ask.
