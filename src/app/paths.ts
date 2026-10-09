/** Deployment base path without the trailing slash: "" locally, "/design-system-lab" on GitHub Pages. */
export const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Route paths. The route table in routes.tsx and every link built by the app use these. */
export const paths = {
  overview: '/',
  foundations: '/foundations',
  foundation: (id: string) => `/foundations/${id}`,
  components: '/components',
  component: (id: string) => `/components/${id}`,
  playground: '/playground',
  playgroundFor: (id: string) => `/playground?component=${encodeURIComponent(id)}`,
  patterns: '/patterns',
  pattern: (id: string) => `/patterns/${id}`,
} as const;

export const sections = [
  { href: paths.overview, label: 'Overview' },
  { href: paths.foundations, label: 'Foundations' },
  { href: paths.components, label: 'Components' },
  { href: paths.playground, label: 'Playground' },
  { href: paths.patterns, label: 'Patterns' },
] as const;
