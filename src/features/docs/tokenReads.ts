import {
  borderTokenPaths,
  columnWidthTokenPaths,
  elevationTokenPaths,
  radiusTokenPaths,
  spaceTokenPaths,
  stylesheetReads,
  surfaceTokenPaths,
} from '@/design-system/tokens';

/** Vocabulary helpers a component calls to turn a prop value into a token reference. */
const vocabularies: Record<string, { prop: string; paths: readonly (string | null)[] }> = {
  spaceValue: { prop: 'space props (gap, padding)', paths: Object.values(spaceTokenPaths) },
  radiusValue: { prop: 'radius prop', paths: Object.values(radiusTokenPaths) },
  elevationValue: { prop: 'elevation prop', paths: Object.values(elevationTokenPaths) },
  borderValue: { prop: 'border prop', paths: Object.values(borderTokenPaths) },
  surfaceValue: { prop: 'surface prop', paths: Object.values(surfaceTokenPaths) },
  columnWidthValue: { prop: 'minColumnWidth prop', paths: Object.values(columnWidthTokenPaths) },
};

export interface TokenRead {
  path: string;
  /** Where the read happens: a stylesheet, or a prop vocabulary used by the implementation. */
  via: string;
  file: string;
}

export interface SourceText {
  path: string;
  text: string;
}

export interface TokenIndex {
  /** Token path of a custom property, including a typography sub-property. */
  pathOfVar: (cssVar: string) => string | undefined;
  /** Every token path that starts with a prefix, for `cssVar(`size.container.${width}`)`. */
  withPrefix: (prefix: string) => string[];
}

/**
 * Every token a component's own files read, derived from the source text rather than listed by
 * hand: `var()` reads in its stylesheets, plus the prop vocabularies and `cssVar()` calls in its code.
 */
export function tokenReadsOf(files: readonly SourceText[], { pathOfVar, withPrefix }: TokenIndex): TokenRead[] {
  const seen = new Map<string, TokenRead>();
  const add = (read: TokenRead) => {
    if (!seen.has(read.path)) seen.set(read.path, read);
  };
  for (const { path: file, text } of files) {
    if (file.endsWith('.css')) {
      for (const read of stylesheetReads(file, text)) {
        const path = pathOfVar(read.cssVar);
        if (path) add({ path, via: 'stylesheet', file });
      }
    } else if (/\.tsx?$/.test(file)) {
      for (const match of text.matchAll(/\b(\w+Value)\(/g)) {
        const vocabulary = vocabularies[match[1] ?? ''];
        if (!vocabulary) continue;
        for (const path of vocabulary.paths) if (path) add({ path, via: vocabulary.prop, file });
      }
      for (const match of text.matchAll(/\bcssVar\(\s*'([\w.-]+)'\s*\)/g)) {
        if (match[1]) add({ path: match[1], via: 'inline style', file });
      }
      for (const match of text.matchAll(/\bcssVar\(\s*`([\w.-]+)\$\{/g)) {
        for (const path of withPrefix(match[1] ?? '')) add({ path, via: 'inline style', file });
      }
    }
  }
  return [...seen.values()];
}

const typographyFields = ['font-family', 'font-size', 'font-weight', 'letter-spacing', 'line-height'];

/** Builds the lookups tokenReadsOf needs from manifest records. */
export function cssVarIndex(records: readonly { path: string; cssVar: string; type: string }[]): TokenIndex {
  const map = new Map<string, string>();
  for (const record of records) {
    map.set(record.cssVar, record.path);
    if (record.type === 'typography') for (const field of typographyFields) map.set(`${record.cssVar}-${field}`, record.path);
  }
  return {
    pathOfVar: (cssVar) => map.get(cssVar),
    withPrefix: (prefix) => (prefix ? records.filter((record) => record.path.startsWith(prefix)).map((record) => record.path) : []),
  };
}
