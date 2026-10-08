// @ts-check
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkBoundaries } from './boundaries.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

/** @param {string} dir @returns {string[]} */
function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const files = new Map(
  walk(join(root, 'src')).map((file) => {
    const posix = relative(root, file).split(sep).join('/');
    return [posix, /\.(ts|tsx|mjs|js)$/.test(posix) ? readFileSync(file, 'utf8') : ''];
  }),
);

const { violations, edges } = checkBoundaries(files);

if (violations.length) {
  console.error(`Dependency boundary check failed with ${violations.length} problem(s):\n`);
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line}  [${v.rule}]  ${v.specifier ? `"${v.specifier}" ` : ''}${v.message}`);
  }
  console.error('\nSee docs/architecture.md for the layer rules.');
  process.exit(1);
}

console.log(`Dependency boundaries OK: ${edges.length} internal imports across ${files.size} files, no cycles.`);
