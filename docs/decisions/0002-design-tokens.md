# 0002 — Design tokens: DTCG source, resolver themes, small generator

**Status:** accepted

## Context

The brief asked for one authoritative token source, preferably in the Design Tokens Community
Group (DTCG) format, generating CSS custom properties and TypeScript keys, with reference,
semantic and optional component tiers, light and dark themes, and a build that fails on missing
references or cycles. It also asked for a token explorer driven by the same data.

## Decision

- Tokens are DTCG 2025.10 files in `src/design-system/tokens/source/`. Themes use the DTCG
  **Resolver module**: `system-lab.resolver.json` lists sets (reference, semantic, component) and a
  `theme` modifier with `light` and `dark` contexts. Each tier is tagged with a vendor extension
  (`org.systemlab.tier`) used only for documentation.
- A generator of a few hundred lines (`scripts/tokens/pipeline.mjs`) flattens the files, applies
  `$type` inheritance, validates values per type, resolves aliases, detects missing references and
  cycles, checks that both themes define the same tokens, and rejects duplicate paths and CSS name
  collisions. It writes:
  - `tokens.css` — one `:root` block for theme-independent tokens, one block per theme for
    theme-dependent tokens (including anything that aliases them), and a `prefers-color-scheme`
    block for "System". Aliases stay as `var()` references so the chain is visible in DevTools.
  - `tokens.ts` — typed key unions (`SpaceToken`, `SurfaceToken` …) for component props and a
    `TokenPath` union with `cssVar()`.
  - `manifest.ts` — every token with authored and resolved values and alias chains per theme, used
    by the explorer and the contrast test.
- Theme-dependent tokens are redeclared inside `[data-theme]` selectors, so any element can start
  a nested theme scope. This is why the Themes foundation and the playground can show light and dark side by side.

## Alternatives considered

- **Style Dictionary or Terrazzo.** Both are capable and would be the right call for multi-platform
  output. They add dependencies and configuration that would hide the mechanics this site teaches.
- **Separate hand-written CSS and TypeScript maps.** Rejected: two sources drift.
- **`light-dark()` in a single block.** Compact, but it hides the "themes swap semantic mappings"
  idea and does not support nested theme scopes as clearly.

## Consequences

- Only the DTCG features used here are supported; others fail loudly.
- Container and media query thresholds cannot be tokens (CSS disallows `var()` in query
  conditions). They are documented beside each rule.
- Generated files are committed and checked for freshness in `npm run lint`.
