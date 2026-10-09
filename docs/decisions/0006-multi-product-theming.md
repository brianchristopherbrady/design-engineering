# 0006: Products and density as resolver modifiers

## Status

Accepted.

## Context

The system had one axis of variation, light and dark, implemented as two token files swapped by
`data-theme`. A design system that serves several products needs more: each product keeps its own
brand color and shape while sharing components, and dense tools need tighter controls without
forking components. The common alternatives each cost something:

- **A theme per product** (harbor-light, harbor-dark, …) multiplies files by every axis and lets
  them drift apart.
- **Runtime theming in JavaScript** (a theme object in context) couples every component to a
  provider and cannot re-theme an arbitrary DOM region with CSS alone.
- **Emitting every permutation as full CSS** is simple but writes each token 12 times, and grows
  multiplicatively with each new axis.

The DTCG resolver module (2025.10) models exactly this: sets that always apply, and modifiers whose
contexts add or replace tokens, resolved in a stated order.

## Decision

- Describe theme, product and density as three resolver modifiers in `system-lab.resolver.json`.
  Product and density default to an empty context, so the base system is unchanged.
- Mark `theme` as `complete` (every context defines the same tokens) and product and density as
  `overrides` (they may only replace tokens that already exist, keeping type and tier). Violations
  fail the build.
- Resolve all permutations at build time, compute each token's dependency set by comparing resolved
  values across permutations, and emit one CSS block per combination of only those modifiers.
- Expose the result through attributes: `data-theme`, `data-product`, `data-density`. `ThemeScope`
  always writes all three, inheriting omitted values, so any region can be re-themed.
- Products change brand roles and shape only. Surfaces, text, status tones and spacing stay shared,
  which keeps every product inside the contrast tests.
- Generate new products from one brand color with OKLCH ramps and contrast-driven role assignment
  (the theme studio), so adding a product is a reviewed file drop rather than hand-tuned hex values.
  The studio exports every piece the build and type checker need, including shape overrides, the
  resolver entry and the product profile.

## Consequences

- A component never knows which product or density is active; the products matrix proves it by
  rendering one component tree in six combinations.
- The contrast suite runs per product and theme (510 pairs). A new product cannot ship with a
  failing pair.
- CSS stays small (768 lines for 345 tokens across 12 permutations) because unchanged tokens are
  written once.
- A scoped region must set all three attributes. Partial scoping (only `data-product` on a
  subtree) is unsupported; `ThemeScope` makes the correct form the easy one.
- Each new modifier multiplies build-time permutations. That is acceptable for a handful of
  contexts and would need revisiting for, say, per-tenant brands.
