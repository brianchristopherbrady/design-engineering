import type { CatalogEntry } from '@/domain/system';

const sectionByKind = { decision: 'decisions', component: 'components', foundation: 'foundations', pattern: 'patterns' } as const;

/** Site URL of a catalog entry. Mirrors the app's route table; documentation.test.ts checks they agree. */
export function entryHref(entry: Pick<CatalogEntry, 'id' | 'kind'>): string {
  return `/${sectionByKind[entry.kind]}/${entry.id}`;
}
