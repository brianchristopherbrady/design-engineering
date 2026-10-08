import { describe, expect, it } from 'vitest';
import { catalog } from '@/domain/system';
import { defaultFilters, filterEntries, hasActiveFilters, parseFilters, toSearchParams } from './filters';

describe('directory filters', () => {
  it('round-trips through URL parameters and drops defaults', () => {
    const filters = { query: 'focus', layer: 'Composite', maturity: 'beta' } as const;
    expect(parseFilters(toSearchParams(filters))).toEqual(filters);
    expect(toSearchParams(defaultFilters).toString()).toBe('');
  });

  it('falls back to defaults for unknown values', () => {
    expect(parseFilters(new URLSearchParams('layer=Widget&maturity=gold'))).toEqual(defaultFilters);
  });

  it('matches every term against name, summary, layer and tags', () => {
    const names = filterEntries(catalog, { ...defaultFilters, query: 'form boolean' }).map((entry) => entry.name);
    expect(names).toEqual(['Checkbox', 'Switch']);
  });

  it('combines query, layer and maturity', () => {
    const result = filterEntries(catalog, { query: 'status', layer: 'Primitive', maturity: 'stable' });
    expect(result.map((entry) => entry.id)).toEqual(['badge', 'progress']);
  });

  it('reports active filters, ignoring whitespace-only queries', () => {
    expect(hasActiveFilters({ ...defaultFilters, query: '  ' })).toBe(false);
    expect(hasActiveFilters({ ...defaultFilters, layer: 'Pattern' })).toBe(true);
  });
});
