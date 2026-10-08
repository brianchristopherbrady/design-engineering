import { describe, expect, it } from 'vitest';
import * as composites from '@/design-system/composites';
import * as layout from '@/design-system/layout';
import * as primitives from '@/design-system/primitives';
import { componentDocs, playgroundStories } from '@/content/components';
import { foundationTopics } from '@/content/foundations';
import { entryHref, patternDocs } from '@/content/patterns';
import { catalog, entriesOfKind } from '@/domain/system';
import { hasSource } from '@/features/docs';
import { paths } from '@/app/paths';

const siteSources = import.meta.glob<string>(['/src/**/*.{ts,tsx}', '!/src/test/documentation.test.ts', '!/src/**/generated/**'], {
  query: '?raw',
  import: 'default',
  eager: true,
});
const projectText = import.meta.glob<string>(['/docs/**/*.md', '/README.md', '/e2e/**/*.ts', '/scripts/**/*.mjs', '/index.html'], {
  query: '?raw',
  import: 'default',
  eager: true,
});

const ids = (kind: 'component' | 'foundation' | 'pattern') => entriesOfKind(kind).map((entry) => entry.id).sort();

describe('the catalog drives the site', () => {
  it('has a ComponentDoc for every component entry and no orphan docs', () => {
    expect(componentDocs.map((doc) => doc.id).sort()).toEqual(ids('component'));
  });

  it('has a topic for every foundation and a page for every pattern', () => {
    expect(foundationTopics.map((topic) => topic.id).sort()).toEqual(ids('foundation'));
    expect(patternDocs.map((doc) => doc.id).sort()).toEqual(ids('pattern'));
  });

  it('documents every component the design system exports', () => {
    const exported = [layout, primitives, composites]
      .flatMap((module) => Object.entries(module))
      .filter(([name, value]) => typeof value === 'function' && /^[A-Z]/.test(name) && name !== 'LinkProvider')
      .map(([name]) => name)
      .sort();
    const documented = entriesOfKind('component').map((entry) => entry.name);
    expect(exported.filter((name) => !documented.includes(name))).toEqual([]);
  });

  it('gives every playground story a documented component', () => {
    const documented = new Set(componentDocs.map((doc) => doc.id));
    for (const story of playgroundStories) expect(documented.has(story.id), story.id).toBe(true);
  });

  it('points every source reference at a file that exists', () => {
    for (const entry of catalog) expect(hasSource(entry.sourcePath), `${entry.id}: ${entry.sourcePath}`).toBe(true);
    for (const doc of componentDocs) {
      for (const path of doc.sourcePaths) expect(hasSource(path), `${doc.id}: ${path}`).toBe(true);
    }
  });

  it('builds entry links that match the app routes', () => {
    for (const entry of catalog) {
      const expected = { component: paths.component, foundation: paths.foundation, pattern: paths.pattern }[entry.kind](entry.id);
      expect(entryHref(entry)).toBe(expected);
    }
  });
});

describe('links', () => {
  const known = new Set(catalog.map((entry) => entryHref(entry)));
  const sectionRoots = new Set<string>([paths.overview, paths.foundations, paths.components, paths.playground, paths.patterns]);
  const isRoute = (href: string) => {
    const path = href.split(/[?#]/)[0] ?? '';
    return sectionRoots.has(path) || known.has(path);
  };

  it('only links to routes that exist', () => {
    const broken = Object.entries(siteSources).flatMap(([file, source]) =>
      [...source.matchAll(/href(?:="|: ')(\/[^"']*)["']/g)]
        .map((match) => match[1] ?? '')
        .filter((href) => !isRoute(href))
        .map((href) => `${file}: ${href}`),
    );
    expect(broken).toEqual([]);
  });
});

describe('terminology', () => {
  it('contains no course or lesson vocabulary anywhere in the site, docs or tests', () => {
    const banned = /\b(lessons?|curricul\w*|coursework)\b/i;
    const hits = Object.entries({ ...siteSources, ...projectText })
      .filter(([, text]) => banned.test(text))
      .map(([file, text]) => `${file}: ${banned.exec(text)?.[0] ?? ''}`);
    expect(hits).toEqual([]);
  });
});
