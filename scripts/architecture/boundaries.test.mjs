// @ts-check
import { describe, expect, it } from 'vitest';
import { checkBoundaries, extractImports } from './boundaries.mjs';

/** @param {Record<string, string>} files */
const rulesBroken = (files) => checkBoundaries(new Map(Object.entries(files))).violations.map((v) => `${v.file}:${v.rule}`);

const designSystem = {
  'src/design-system/tokens/index.ts': 'export const x = 1;',
  'src/design-system/primitives/index.ts': "export { Badge } from './Badge/Badge';",
  'src/design-system/primitives/Badge/Badge.tsx': 'export const Badge = 1;',
};

describe('dependency boundaries', () => {
  it('allows a domain module to use the design system through its public entry', () => {
    expect(
      rulesBroken({
        ...designSystem,
        'src/domain/system/index.ts': "export * from './Card';",
        'src/domain/system/Card.tsx': "import { Badge } from '@/design-system/primitives';",
      }),
    ).toEqual([]);
  });

  it('stops the design system from importing the domain', () => {
    expect(
      rulesBroken({
        ...designSystem,
        'src/domain/system/index.ts': 'export const catalog = [];',
        'src/design-system/primitives/Badge/Badge.tsx': "import { catalog } from '@/domain/system';",
      }),
    ).toEqual(['src/design-system/primitives/Badge/Badge.tsx:layer']);
  });

  it('stops the domain from importing features', () => {
    expect(
      rulesBroken({
        'src/features/scenarios/index.ts': 'export const useRequest = 1;',
        'src/domain/system/index.ts': "import { useRequest } from '@/features/scenarios';",
      }),
    ).toEqual(['src/domain/system/index.ts:layer']);
  });

  it('requires imports into another layer to use its public entry', () => {
    expect(
      rulesBroken({
        ...designSystem,
        'src/domain/system/index.ts': "import { Badge } from '@/design-system/primitives/Badge/Badge';",
      }),
    ).toEqual(['src/domain/system/index.ts:public-entry']);
  });

  it('stops sibling features from importing each other', () => {
    expect(
      rulesBroken({
        'src/features/scenarios/index.ts': 'export const x = 1;',
        'src/features/directory/index.ts': "import { x } from '../scenarios';",
      }),
    ).toEqual(['src/features/directory/index.ts:sibling-module']);
  });

  it('keeps the router out of the design system', () => {
    expect(rulesBroken({ ...designSystem, 'src/design-system/primitives/Badge/Badge.tsx': "import { Link } from 'react-router';" })).toEqual([
      'src/design-system/primitives/Badge/Badge.tsx:forbidden-package',
    ]);
  });

  it('reports import cycles', () => {
    const broken = rulesBroken({
      'src/domain/system/index.ts': "export * from './a';",
      'src/domain/system/a.ts': "import { b } from './b'; export const a = 1;",
      'src/domain/system/b.ts': "import { a } from './a'; export const b = 1;",
    });
    expect(broken).toContain('src/domain/system/a.ts:cycle');
  });

  it('exempts raw source imports, which read text rather than code', () => {
    expect(
      rulesBroken({
        ...designSystem,
        'src/app/App.tsx': 'export const App = 1;',
        'src/content/components/index.ts': "import source from '@/app/App.tsx?raw';",
      }),
    ).toEqual([]);
  });

  it('ignores import-like text inside strings and comments', () => {
    const source = [
      "// import { x } from '@/app/App';",
      "const example = \"import { y } from '@/features/scenarios'\";",
      "import { Badge } from '@/design-system/primitives';",
    ].join('\n');
    expect(extractImports(source).map((entry) => entry.specifier)).toEqual(['@/design-system/primitives']);
  });
});
