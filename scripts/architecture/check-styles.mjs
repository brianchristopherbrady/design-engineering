// @ts-check
/**
 * Style rules that CSS tooling cannot express on its own:
 * - every CSS Module declares the cascade layer that matches its folder;
 * - components never use raw colors or reference palette tokens;
 * - every var(--token) exists, so a typo cannot silently fall back to nothing.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

/** @param {string} file posix path */
export function expectedLayer(file) {
  if (file.startsWith('src/design-system/layout/')) return 'layout';
  if (file.startsWith('src/design-system/primitives/') || file.startsWith('src/design-system/composites/')) {
    return 'components';
  }
  return 'product';
}

/**
 * @param {string} file posix path
 * @param {string} css
 * @param {Set<string>} knownProperties custom properties defined by the token build
 * @returns {string[]} problems
 */
export function checkStylesheet(file, css, knownProperties) {
  const problems = [];
  const source = css.replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, ' '));
  const lineOf = (/** @type {number} */ index) => source.slice(0, index).split('\n').length;

  if (file.endsWith('.module.css')) {
    const layer = expectedLayer(file);
    if (!new RegExp(`@layer\\s+${layer}\\s*\\{`).test(source)) {
      problems.push(`${file}: wrap rules in "@layer ${layer} { … }" so cascade order does not depend on import order.`);
    }
  }

  for (const match of source.matchAll(/#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab|lab|lch)\(/gi)) {
    problems.push(`${file}:${lineOf(match.index)}: raw color "${match[0]}". Use a semantic token.`);
  }

  const declared = new Set([...source.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]));
  for (const match of source.matchAll(/var\(\s*(--[\w-]+)/g)) {
    const name = match[1];
    if (name.startsWith('--color-')) {
      problems.push(`${file}:${lineOf(match.index)}: ${name} is a reference palette token. Use a semantic role.`);
    } else if (!name.startsWith('--_') && !declared.has(name) && !knownProperties.has(name)) {
      problems.push(`${file}:${lineOf(match.index)}: ${name} is not a generated token or a local --_ property.`);
    }
  }
  return problems;
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const isCli = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isCli) {
  const tokensCss = readFileSync(join(root, 'src/design-system/tokens/generated/tokens.css'), 'utf8');
  const known = new Set([...tokensCss.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]));

  /** @param {string} dir @returns {string[]} */
  const walk = (dir) =>
    readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
      entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)],
    );

  const sheets = walk(join(root, 'src'))
    .map((file) => relative(root, file).split(sep).join('/'))
    .filter((file) => file.endsWith('.css') && !file.includes('/tokens/generated/'));

  const problems = sheets.flatMap((file) => checkStylesheet(file, readFileSync(join(root, file), 'utf8'), known));
  if (problems.length) {
    console.error(`Style check failed with ${problems.length} problem(s):\n  ${problems.join('\n  ')}`);
    process.exit(1);
  }
  console.log(`Style check OK: ${sheets.length} stylesheets use known semantic tokens and declare their layers.`);
}
