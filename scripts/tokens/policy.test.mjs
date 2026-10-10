// @ts-check
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { tokenManifest } from '../../src/design-system/tokens/generated/manifest';
import { crossComponentReads, inLane, policyExceptions, stylesheetReads } from '../../src/design-system/tokens/policy';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
/** @param {string} dir @returns {string[]} */
const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((entry) => (entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)]));
const sheets = walk(join(root, 'src'))
  .map((file) => relative(root, file).split(sep).join('/'))
  .filter((file) => file.endsWith('.css') && !file.includes('/generated/'));
const reads = sheets.flatMap((file) => stylesheetReads(file, readFileSync(join(root, file), 'utf8')));
const byVar = new Map(tokenManifest.map((record) => [record.cssVar, record]));
const componentPathOf = (/** @type {string} */ cssVar) => {
  const record = byVar.get(cssVar);
  return record?.tier === 'component' ? record.path : undefined;
};

/**
 * Tokens that one modifier's files set directly: with every other modifier held fixed, the file
 * that set the value differs between that modifier's contexts.
 * @param {'product' | 'density'} modifier
 */
function overriddenBy(modifier) {
  return tokenManifest
    .filter((record) => record.dependsOn.includes(modifier) && record.variants)
    .filter((record) => {
      /** @type {Map<string, Set<string>>} */
      const groups = new Map();
      for (const variant of record.variants ?? []) {
        const rest = Object.entries(variant.input).filter(([name]) => name !== modifier).map((pair) => pair.join('=')).join(',');
        groups.set(rest, (groups.get(rest) ?? new Set()).add(variant.source ?? record.source));
      }
      return [...groups.values()].some((sources) => sources.size > 1);
    })
    .map((record) => record.path);
}

describe('token dependency policy', () => {
  it('reads stylesheets and the manifest', () => {
    expect(sheets.length).toBeGreaterThan(30);
    expect(reads.length).toBeGreaterThan(200);
  });

  it('keeps every reference token the same in all permutations (invariant-reference)', () => {
    const varying = tokenManifest.filter((record) => record.tier === 'reference' && record.dependsOn.length > 0).map((record) => record.path);
    expect(varying).toEqual([]);
  });

  it('never reads a reference color in a stylesheet (palette-isolation)', () => {
    const colors = reads
      .filter((read) => {
        const record = byVar.get(read.cssVar);
        return record?.tier === 'reference' && record.type === 'color';
      })
      .map((read) => `${read.file}:${read.line} ${read.cssVar}`);
    expect(colors).toEqual([]);
  });

  it('reads another component’s tokens only where the policy declares it (component-ownership)', () => {
    const undeclared = crossComponentReads(reads, componentPathOf)
      .filter((finding) => !finding.exception)
      .map((finding) => `${finding.file}:${finding.line} reads ${finding.path}`);
    expect(undeclared).toEqual([]);
  });

  it('keeps no exception that the code no longer needs', () => {
    const findings = crossComponentReads(reads, componentPathOf);
    const unused = policyExceptions
      .filter((exception) => !findings.some((finding) => finding.exception === exception))
      .map((exception) => `${exception.file} ${exception.token}`);
    expect(unused).toEqual([]);
  });

  it('keeps product and density overrides inside their lanes (modifier-lanes)', () => {
    const product = overriddenBy('product');
    const density = overriddenBy('density');
    expect(product.length).toBeGreaterThan(0);
    expect(density.length).toBeGreaterThan(0);
    expect(product.filter((path) => !inLane('product', path))).toEqual([]);
    expect(density.filter((path) => !inLane('density', path))).toEqual([]);
  });

  it('makes compact density shorten button padding along with control height', () => {
    expect(overriddenBy('density')).toEqual(expect.arrayContaining(['button.padding-inline.medium', 'control.height.medium']));
  });
});
