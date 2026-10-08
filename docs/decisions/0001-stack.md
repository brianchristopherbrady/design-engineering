# 0001 — Stack and dependencies

**Status:** accepted

## Context

The repository started empty. The brief asked for React, strict TypeScript, Vite and CSS Modules
with native custom properties, a lightweight router with URL search parameters, a small and
justified dependency list, and our own design-system surface instead of a styled library. The
development machine runs Node 20.

## Decision

- **React 19 + TypeScript (strict, `noUncheckedIndexedAccess`) + Vite 7.**
- **CSS Modules + custom properties + cascade layers.** No CSS-in-JS runtime and no utility
  framework; tokens arrive as CSS variables generated from one source.
- **React Router 7 in declarative mode** (`BrowserRouter`, `Routes`, `useSearchParams`). It is
  larger than minimal routers, but its search-param and history behavior is mature and well
  documented, which matters because Back/Forward through filters is a requirement. Router
  transitions are disabled (`useTransitions={false}`) because the catalog search box is a
  controlled input bound to the URL.
- **No component library and no headless library.** Nothing on the site needs a dialog, menu,
  combobox or tabs; native `button`, `a`, `input`, `select`, `details` and `progress` cover every
  interaction. If a complex widget becomes necessary, prefer a proven accessible headless
  implementation over a hand-rolled one.
- **Testing:** Vitest + Testing Library in jsdom for behavior; Playwright + `@axe-core/playwright`
  against the production build for layout, keyboard and automated accessibility checks.
- **Linting:** ESLint with typescript-eslint (type-aware), react-hooks and jsx-a11y; architecture
  rules live in small scripts (see 0003).

## Consequences

- Three runtime dependencies. Everything else is development tooling.
- Several newer majors require Node 22; upgrading is documented in `docs/maintenance.md`.
- Code blocks are unhighlighted to avoid a syntax-highlighting dependency.
