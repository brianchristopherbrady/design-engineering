import { entryLayers, maturities, type CatalogEntry, type EntryLayer, type Maturity } from '@/domain/system';

export interface DirectoryFilters {
  query: string;
  layer: EntryLayer | 'all';
  maturity: Maturity | 'all';
}

export const defaultFilters: DirectoryFilters = { query: '', layer: 'all', maturity: 'all' };

/** URL parameter names. Short and stable, because people share these URLs. */
const params = { query: 'q', layer: 'layer', maturity: 'maturity' } as const;

function isLayer(value: string | null): value is EntryLayer {
  return entryLayers.includes(value as EntryLayer);
}

function isMaturity(value: string | null): value is Maturity {
  return maturities.includes(value as Maturity);
}

/** Reads filters from the URL. Unknown values fall back to defaults instead of failing. */
export function parseFilters(search: URLSearchParams): DirectoryFilters {
  const layer = search.get(params.layer);
  const maturity = search.get(params.maturity);
  return {
    query: search.get(params.query) ?? '',
    layer: isLayer(layer) ? layer : 'all',
    maturity: isMaturity(maturity) ? maturity : 'all',
  };
}

/** Writes only non-default values, so the unfiltered directory has a clean URL. */
export function toSearchParams(filters: DirectoryFilters): URLSearchParams {
  const search = new URLSearchParams();
  if (filters.query) search.set(params.query, filters.query);
  if (filters.layer !== 'all') search.set(params.layer, filters.layer);
  if (filters.maturity !== 'all') search.set(params.maturity, filters.maturity);
  return search;
}

export function hasActiveFilters(filters: DirectoryFilters): boolean {
  return filters.query.trim() !== '' || filters.layer !== 'all' || filters.maturity !== 'all';
}

/** Every whitespace-separated term must appear in the name, summary, layer or a tag. */
function matchesQuery(entry: CatalogEntry, query: string): boolean {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;
  const haystack = [entry.name, entry.summary, entry.layer, ...entry.tags].join(' ').toLowerCase();
  return terms.every((term) => haystack.includes(term));
}

/** Derives the visible entries. Nothing here is stored. */
export function filterEntries(entries: readonly CatalogEntry[], filters: DirectoryFilters): CatalogEntry[] {
  return entries.filter(
    (entry) =>
      matchesQuery(entry, filters.query) &&
      (filters.layer === 'all' || entry.layer === filters.layer) &&
      (filters.maturity === 'all' || entry.maturity === filters.maturity),
  );
}
