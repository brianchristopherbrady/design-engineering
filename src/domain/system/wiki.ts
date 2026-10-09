/** The wiki's sections and the catalog ids of their articles, in reading order. */
export const wikiGroups = [
  { heading: 'Introduction', ids: ['start'] },
  { heading: 'The parts of a system', ids: ['principles', 'design-language', 'design-tokens', 'primitives', 'composites', 'patterns', 'documentation'] },
  { heading: 'Running a system', ids: ['governance', 'migration', 'measure'] },
  { heading: 'Across products and platforms', ids: ['sharing', 'frameworks'] },
] as const satisfies readonly { heading: string; ids: readonly string[] }[];
