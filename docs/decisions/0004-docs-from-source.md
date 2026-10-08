# 0004 — Documentation reads the code

**Status:** accepted

## Context

Documentation that copies code drifts. The brief required source views of real files that work
in the production build, props tables, rendered HTML and a clear distinction between teaching
examples and production patterns.

## Decision

- **Source views** use `import.meta.glob(…, { query: '?raw' })` in
  `src/features/docs/sourceFiles.ts`. Each file becomes a small lazily loaded chunk in the
  production build. `src/test/documentation.test.ts` fails if a catalog entry or component doc points at
  a missing file.
- **Props tables** are written by hand but typed with `propsTable<ComponentOwnProps>()`, whose
  parameter requires exactly one entry per own prop. Adding, renaming or removing a prop without
  updating the docs is a type error. Descriptions and type strings are still prose.
- **Rendered HTML** is read from the live preview's DOM with a `MutationObserver`, so it always
  matches what the component actually renders.
- **Live examples** import real components. Each is labelled *Production pattern* (the way the app
  uses it) or *Teaching example* (simplified or contrasting code that exists to explain an idea).
- **Every exported design-system component** must have a reference entry; the documentation test
  enforces it.

## Alternatives considered

- **Storybook / MDX.** Excellent for larger systems, but a second build and runtime for a site
  whose purpose is to be the documentation.
- **react-docgen-typescript.** Generates prop tables from types automatically, at the cost of a
  heavier build-time dependency and less control over teaching-oriented descriptions.

## Consequences

- Prop type strings in tables can still be wrong in wording; the compiler only checks the keys.
- The glob makes every matching file available as a lazy chunk; the build output lists many small
  `*.js` files that are only fetched when a source view opens.
