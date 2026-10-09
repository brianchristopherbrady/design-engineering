/** The site's name, shown in the header, the footer and every browser tab title. */
export const appName = 'Design System Lab';

/** Deployment base path without the trailing slash: "" locally, "/design-system-lab" on GitHub Pages. */
export const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Route paths. The route table in routes.tsx and every link built by the app use these. */
export const paths = {
  overview: '/',
  guides: '/guides',
  guide: (id: string) => `/guides/${id}`,
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
  { href: paths.guides, label: 'Wiki' },
  { href: paths.foundations, label: 'Foundations' },
  { href: paths.components, label: 'Components' },
  { href: paths.playground, label: 'Playground' },
  { href: paths.patterns, label: 'Patterns' },
] as const;
