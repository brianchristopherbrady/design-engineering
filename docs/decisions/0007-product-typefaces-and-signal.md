# 0007: Typefaces and the signal follow the product

## Status

Accepted. Widens the product lane set in 0006, which limited products to brand roles and shape.

## Context

Choosing Harbor or Meadow re-pointed brand colors and corner radii, but every product was still
set in Jost, and the current-page indicator stayed signal red next to teal or violet actions. A
product profile should change how the site looks, including its type, while the site stays Design
System Lab: same name, logo and content.

Three ways to give a product its own type:

- **Override every typography role per product.** Ten composites per product, each repeating the
  sizes, weights and line heights that must stay shared.
- **A product stylesheet that sets `font-family`.** Outside the tokens, so the manifest, the policy
  test and the documentation would not know about it.
- **Typeface roles.** Two semantic tokens that the typography roles alias. A product overrides only
  those.

## Decision

- Add `typeface.display` (headings) and `typeface.text` (body text, labels, captions and controls)
  as semantic `fontFamily` tokens. Typography roles alias them instead of `font.family.sans`; code
  stays on `font.family.mono`.
- Product families are reference tokens in `reference.modes.tokens.json`: IBM Plex Sans for Harbor,
  Fraunces headings over Nunito text for Meadow. All are self-hosted Fontsource variable fonts with
  `font-display: swap` and unicode-range subsets, so a browser downloads only the files that
  rendered text uses.
- Products re-point `signal.current` to `brand.<product>.border` and `signal.glow` to a new
  `brand.<product>.glow` role. The contrast suite checks the indicator at 3:1 on every surface.
- The product lane in `policy.ts` adds `typeface.*` and `signal.*`. Sizes, weights, line heights,
  letter spacing and letter case stay shared.
- Identity stays fixed: the wordmark reads `font.family.sans` directly, and the logo's lens keeps
  its own color roles.
- Every `[data-theme]` element sets `font-family` from `typography.body`, so a nested ThemeScope
  shows its own product's typeface rather than inheriting the page's.
- The theme studio exports the signal and glow with a generated product. It does not choose
  typefaces: a generated product inherits the system's until its file sets `typeface.*`.

## Consequences

- One Product setting changes colors, typefaces, corner shapes and the current-location indicator
  across the whole site; the name, logo, content and type scale do not change.
- The product modifier overrides 22 tokens directly (was 18). Typography composites follow through
  aliases and are declared again under each `[data-product]`, so the CSS grew from 775 to 918 lines.
- The first switch to a product shows a fallback face briefly while its Latin files download
  (about 46 KB for Harbor, 106 KB for Meadow).
- The shared size scale was tuned for Jost's compact x-height (0.46 of the font size). IBM Plex Sans
  (0.516) and Nunito (0.484) would read larger at the same size, so `html` sets
  `font-size-adjust` from `typeface.x-height` (0.46) and every family renders at Jost's x-height.
  Jost is unchanged. Monospace text resets it to `none` wherever the code family is set, so code
  keeps its natural size.
