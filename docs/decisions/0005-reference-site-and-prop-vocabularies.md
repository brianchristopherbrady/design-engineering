# 0005: A component reference site with token-backed prop vocabularies

## Status

Accepted.

## Context

The site documented its design system only as a side effect. It now has to be the system's
reference: foundations, components, a playground with real props, and complete interface states.
Visual props had grown ad hoc (`variant`, `min`, short size names) and some styles read semantic
tokens directly with no way to retune one component.

## Decision

- Restructure the site into Overview, Foundations, Components, Playground and Patterns, driven by a
  catalog in `src/domain/system`. Navigation, the Components index and the directory demo read it.
- Introduce shared prop vocabularies (`vocabulary.ts`) for space, radius, elevation, border
  strength, surface, tone and column width. Every visual prop takes a named value that maps to a
  token. Arbitrary CSS values are not accepted.
- Add component tokens for Button, Badge, Card, Dialog, Switch and Skeleton. Components read them
  through private `--_` properties so an explicit prop overrides the token and an unset prop uses it.
- Rename Button `variant` to `appearance` and replace `status.*` colors with six tones of five roles.
- Give `Grid` three derived modes (fixed, responsive, capped) instead of independent props that
  could conflict.
- Build the playground on typed control specs (`ControlSpec<Props>`) so a control can only target a
  real prop with a compatible type, and generate both the preview props and the snippet from the
  same values.
- Keep fixtures, simulated requests and scenarios in content and features; components stay unaware.

## Consequences

- Adding a visual option means adding a token first; the scales stay small and consistent.
- Docs, stories and components import the same option arrays; tests fail when they drift.
- The playground cannot express props whose type is not a string/number union, boolean, text or an
  icon slot (for example Tabs `items`); those components are documented with examples only.
