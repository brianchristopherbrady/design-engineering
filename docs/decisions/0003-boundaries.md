# 0003 — Enforcing boundaries with small scripts

**Status:** accepted

## Context

Imports must flow toward lower layers: the design system may not import domain, feature, content
or app code, and the domain may not import features or the app. Layers should be consumed through
deliberate public entries, without cycles.

## Decision

`scripts/architecture/check-boundaries.mjs` resolves every import in `src/` (via
`ts.preProcessFile`, so strings and comments are ignored) and checks it against a layer table in
`scripts/architecture/boundaries.mjs`. It also reports public-entry bypasses, sibling-feature
imports, router imports in the design system or domain, and cycles. `check-styles.mjs` applies the
styling rules. Both run in `npm run lint`. Their own behavior is tested in `*.test.mjs`.

## Alternatives considered

- **ESLint `no-restricted-imports`.** Pattern-based; relative paths that climb between layers are
  hard to express, and it cannot detect cycles.
- **`eslint-plugin-boundaries` or `dependency-cruiser`.** Capable and configurable, but each adds a
  dependency and configuration language. For a repository meant to be read end to end, a short
  script that the Overview page links to and displays is more instructive.

## Consequences

- Violations appear at lint time rather than in the editor as you type.
- The script is ~250 lines that the team maintains. If the project grows, replacing it with a
  dedicated tool is straightforward because the rules are already written down as data.
