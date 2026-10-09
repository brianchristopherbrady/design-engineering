// @ts-check
/**
 * Dependency rules for Design System Lab. Pure: takes source text, returns violations.
 * check-boundaries.mjs supplies files from disk; boundaries.test.mjs supplies fixtures.
 */
import ts from 'typescript';

/**
 * A module root is a folder with a public entry. Imports that cross into another
 * module root must target one of its public entries, never an internal file.
 * @typedef {{ id: string, dir: string, layer: string, publicEntries: string[] }} ModuleRoot
 * @typedef {{ file: string, line: number, specifier: string, rule: string, message: string }} Violation
 */

const DS = ['ds-tokens', 'ds-styles', 'ds-layout', 'ds-primitives', 'ds-composites'];

/** Which layers each layer may import from (besides itself). Lower layers come first. */
export const allowedLayers = /** @type {Record<string, string[]>} */ ({
  'ds-tokens': [],
  'ds-styles': ['ds-tokens'],
  'ds-layout': ['ds-tokens'],
  'ds-primitives': ['ds-tokens', 'ds-layout'],
  'ds-composites': ['ds-tokens', 'ds-layout', 'ds-primitives'],
  domain: [...DS],
  feature: [...DS, 'domain'],
  content: [...DS, 'domain', 'feature'],
  app: [...DS, 'domain', 'feature', 'content'],
  entry: ['ds-styles', 'app'],
  'test-support': [...DS, 'domain', 'feature', 'content', 'app'],
});

/** Packages a layer must not depend on, to keep it framework-portable. */
export const forbiddenPackages = /** @type {Record<string, string[]>} */ ({
  'ds-tokens': ['react-router'],
  'ds-styles': ['react-router'],
  'ds-layout': ['react-router'],
  'ds-primitives': ['react-router'],
  'ds-composites': ['react-router'],
  domain: ['react-router'],
});

/**
 * @param {string} file posix path relative to the repo root
 * @returns {ModuleRoot | undefined}
 */
export function moduleRootOf(file) {
  const parts = file.split('/');
  if (parts[0] !== 'src') return undefined;
  if (file === 'src/main.tsx' || file === 'src/vite-env.d.ts') {
    return { id: 'entry', dir: 'src', layer: 'entry', publicEntries: [] };
  }
  const [, top, area] = parts;
  if (top === 'design-system' && area) {
    const layer = `ds-${area}`;
    if (!(layer in allowedLayers)) return undefined;
    const publicEntries =
      area === 'tokens' ? ['index.ts', 'manifest.ts'] : area === 'styles' ? ['index.css'] : ['index.ts'];
    return { id: layer, dir: `src/design-system/${area}`, layer, publicEntries };
  }
  if (top === 'domain' && area) return { id: `domain/${area}`, dir: `src/domain/${area}`, layer: 'domain', publicEntries: ['index.ts'] };
  if (top === 'features' && area) return { id: `features/${area}`, dir: `src/features/${area}`, layer: 'feature', publicEntries: ['index.ts'] };
  if (top === 'content' && area) return { id: `content/${area}`, dir: `src/content/${area}`, layer: 'content', publicEntries: ['index.ts'] };
  if (top === 'app') return { id: 'app', dir: 'src/app', layer: 'app', publicEntries: ['App.tsx'] };
  if (top === 'test') return { id: 'test-support', dir: 'src/test', layer: 'test-support', publicEntries: [] };
  return undefined;
}

/**
 * Import specifiers with 1-based line numbers. Uses the TypeScript scanner,
 * so imports shown inside strings or comments are ignored.
 * @param {string} source
 */
export function extractImports(source) {
  const info = ts.preProcessFile(source, true, true);
  return info.importedFiles.map((ref) => ({
    specifier: ref.fileName,
    line: source.slice(0, ref.pos).split('\n').length,
  }));
}

const EXTENSIONS = ['', '.ts', '.tsx', '.mjs', '.js', '.css', '.json', '/index.ts', '/index.tsx'];

/**
 * @param {string} fromFile
 * @param {string} specifier
 * @param {(candidate: string) => boolean} exists
 * @returns {{ kind: 'package', name: string } | { kind: 'file', path: string } | { kind: 'raw' } | { kind: 'missing' }}
 */
export function resolveSpecifier(fromFile, specifier, exists) {
  const [bare, query] = specifier.split('?');
  if (query !== undefined && /(^|&)raw(&|$)/.test(query)) return { kind: 'raw' };
  let base;
  if (bare.startsWith('@/')) base = `src/${bare.slice(2)}`;
  else if (bare.startsWith('.')) base = joinPosix(dirnamePosix(fromFile), bare);
  else {
    const name = bare.startsWith('@') ? bare.split('/').slice(0, 2).join('/') : bare.split('/')[0];
    return { kind: 'package', name };
  }
  for (const extension of EXTENSIONS) {
    if (exists(base + extension)) return { kind: 'file', path: base + extension };
  }
  return { kind: 'missing' };
}

/** @param {string} path */
function dirnamePosix(path) {
  return path.slice(0, path.lastIndexOf('/'));
}

/** @param {string} dir @param {string} relative */
function joinPosix(dir, relative) {
  const out = dir.split('/');
  for (const part of relative.split('/')) {
    if (part === '..') out.pop();
    else if (part !== '.' && part !== '') out.push(part);
  }
  return out.join('/');
}

/**
 * @param {Map<string, string>} files posix path → source text (only code files are parsed)
 * @returns {{ violations: Violation[], edges: Array<[string, string]> }}
 */
export function checkBoundaries(files) {
  /** @type {Violation[]} */
  const violations = [];
  /** @type {Array<[string, string]>} */
  const edges = [];
  const exists = (/** @type {string} */ candidate) => files.has(candidate);

  for (const [file, source] of files) {
    if (!/\.(ts|tsx|mjs|js)$/.test(file)) continue;
    const from = moduleRootOf(file);
    if (!from) continue;

    for (const { specifier, line } of extractImports(source)) {
      const report = (/** @type {string} */ rule, /** @type {string} */ message) =>
        violations.push({ file, line, specifier, rule, message });
      const target = resolveSpecifier(file, specifier, exists);

      if (target.kind === 'raw') continue;
      if (target.kind === 'missing') {
        report('unresolved', 'Import does not resolve to a file in the repository.');
        continue;
      }
      if (target.kind === 'package') {
        if (forbiddenPackages[from.layer]?.includes(target.name)) {
          report('forbidden-package', `${from.id} must not depend on "${target.name}".`);
        }
        continue;
      }

      const to = moduleRootOf(target.path);
      if (!to) {
        report('outside-layers', `${target.path} is not inside a known layer.`);
        continue;
      }
      edges.push([file, target.path]);
      if (to.id === from.id) {
        const fileName = target.path.slice(to.dir.length + 1);
        if (to.publicEntries.includes(fileName) && from.layer !== 'app' && from.layer !== 'entry') {
          report('own-public-entry', `Import siblings directly; importing your own ${fileName} invites cycles.`);
        }
        continue;
      }
      if (!allowedLayers[from.layer]?.includes(to.layer) && from.layer !== to.layer) {
        report('layer', `${from.id} (${from.layer}) may not import ${to.id} (${to.layer}).`);
        continue;
      }
      if (from.layer === to.layer && from.layer !== 'test-support') {
        report('sibling-module', `${from.id} may not import its sibling ${to.id}; compose them in a higher layer.`);
        continue;
      }
      const fileName = target.path.slice(to.dir.length + 1);
      if (from.layer !== 'entry' && from.layer !== 'test-support' && !to.publicEntries.includes(fileName)) {
        report('public-entry', `Import ${to.id} through ${to.publicEntries.join(' or ')}, not ${fileName}.`);
      }
    }
  }

  for (const cycle of findCycles(edges)) {
    violations.push({
      file: cycle[0],
      line: 1,
      specifier: '',
      rule: 'cycle',
      message: `Circular import: ${cycle.join(' → ')}`,
    });
  }

  return { violations, edges };
}

/**
 * Depth-first search for import cycles. Each cycle is reported once.
 * @param {Array<[string, string]>} edges
 * @returns {string[][]}
 */
export function findCycles(edges) {
  /** @type {Map<string, string[]>} */
  const graph = new Map();
  for (const [from, to] of edges) {
    if (!graph.has(from)) graph.set(from, []);
    graph.get(from)?.push(to);
  }
  /** @type {string[][]} */
  const cycles = [];
  const seen = new Set();
  /** @type {Map<string, 'visiting' | 'done'>} */
  const state = new Map();
  /** @type {string[]} */
  const stack = [];

  /** @param {string} node */
  function visit(node) {
    state.set(node, 'visiting');
    stack.push(node);
    for (const next of graph.get(node) ?? []) {
      if (state.get(next) === 'visiting') {
        const cycle = [...stack.slice(stack.indexOf(next)), next];
        const key = [...cycle.slice(0, -1)].sort().join('|');
        if (!seen.has(key)) {
          seen.add(key);
          cycles.push(cycle);
        }
      } else if (!state.has(next)) {
        visit(next);
      }
    }
    stack.pop();
    state.set(node, 'done');
  }

  for (const node of graph.keys()) if (!state.has(node)) visit(node);
  return cycles;
}
