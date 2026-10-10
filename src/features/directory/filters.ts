import {
  componentLayers,
  entryKinds,
  kindLabels,
  maturities,
  type CatalogEntry,
  type ComponentLayer,
  type EntryKind,
  type Maturity,
} from '@/domain/system';

export interface DirectoryFilters {
  query: string;
  /** Resource type: component, foundation, pattern or design decision. */
  type: EntryKind | 'all';
  /** Component layer. Only components have one, so a specific layer matches only components. */
  layer: ComponentLayer | 'all';
  maturity: Maturity | 'all';
}

export const defaultFilters: DirectoryFilters = { query: '', type: 'all', layer: 'all', maturity: 'all' };

/** URL parameter names. Short and stable, because people share these URLs. */
const params = { query: 'q', type: 'type', layer: 'layer', maturity: 'maturity' } as const;

/** Resource types that older links passed as a layer, before type and layer were separate filters. */
const legacyLayerTypes: Readonly<Record<string, EntryKind>> = { Decision: 'decision', Foundation: 'foundation', Pattern: 'pattern' };

function isType(value: string | null | undefined): value is EntryKind {
  return entryKinds.includes(value as EntryKind);
}

function isLayer(value: string | null): value is ComponentLayer {
  return componentLayers.includes(value as ComponentLayer);
}

function isMaturity(value: string | null): value is Maturity {
  return maturities.includes(value as Maturity);
}

/** Reads filters from the URL. Unknown values fall back to defaults instead of failing. */
export function parseFilters(search: URLSearchParams): DirectoryFilters {
  const layer = search.get(params.layer);
  const maturity = search.get(params.maturity);
  const type = search.get(params.type) ?? (layer ? legacyLayerTypes[layer] : undefined);
  return {
    query: search.get(params.query) ?? '',
    type: isType(type) ? type : 'all',
    layer: isLayer(layer) ? layer : 'all',
    maturity: isMaturity(maturity) ? maturity : 'all',
  };
}

/** Writes only non-default values, so the unfiltered directory has a clean URL. */
export function toSearchParams(filters: DirectoryFilters): URLSearchParams {
  const search = new URLSearchParams();
  if (filters.query) search.set(params.query, filters.query);
  if (filters.type !== 'all') search.set(params.type, filters.type);
  if (filters.layer !== 'all') search.set(params.layer, filters.layer);
  if (filters.maturity !== 'all') search.set(params.maturity, filters.maturity);
  return search;
}

/** Changes the resource type, clearing a component layer that the new type cannot match. */
export function withType(filters: DirectoryFilters, type: DirectoryFilters['type']): DirectoryFilters {
  return { ...filters, type, layer: type === 'component' ? filters.layer : 'all' };
}

export function hasActiveFilters(filters: DirectoryFilters): boolean {
  return filters.query.trim() !== '' || filters.type !== 'all' || filters.layer !== 'all' || filters.maturity !== 'all';
}

/** Every whitespace-separated term must appear in the name, summary, resource type, component layer or a tag. */
function matchesQuery(entry: CatalogEntry, query: string): boolean {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;
  const haystack = [entry.name, entry.summary, kindLabels[entry.kind], entry.layer ?? '', ...entry.tags].join(' ').toLowerCase();
  return terms.every((term) => haystack.includes(term));
}

/** Derives the visible entries. Nothing here is stored. */
export function filterEntries(entries: readonly CatalogEntry[], filters: DirectoryFilters): CatalogEntry[] {
  return entries.filter(
    (entry) =>
      matchesQuery(entry, filters.query) &&
      (filters.type === 'all' || entry.kind === filters.type) &&
      (filters.layer === 'all' || entry.layer === filters.layer) &&
      (filters.maturity === 'all' || entry.maturity === filters.maturity),
  );
}
