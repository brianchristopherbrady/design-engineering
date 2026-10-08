/**
 * Raw text of repository files, loaded lazily through Vite's import.meta.glob.
 * Source views read the real files at build time, so documentation cannot drift
 * into hand-maintained copies. Each file becomes its own small chunk.
 */
const loaders = import.meta.glob<string>(
  [
    '/src/**/*.{ts,tsx,css,json}',
    '/scripts/**/*.mjs',
    '/docs/**/*.md',
    '/e2e/**/*.ts',
    '/eslint.config.js',
    '/vite.config.ts',
  ],
  { query: '?raw', import: 'default' },
);

const byPath = new Map(Object.entries(loaders).map(([key, load]) => [key.slice(1), load]));

/** Every repository-relative path a SourceViewer can show. */
export const sourcePaths: readonly string[] = [...byPath.keys()].sort();

export function hasSource(path: string): boolean {
  return byPath.has(path);
}

export function loadSource(path: string): Promise<string> {
  const load = byPath.get(path);
  return load ? load() : Promise.reject(new Error(`No source file at "${path}".`));
}
