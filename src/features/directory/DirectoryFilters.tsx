import { Button, Input, Select } from '@/design-system/primitives';
import { Field } from '@/design-system/composites';
import { maturities, maturityLabels, type EntryLayer } from '@/domain/system';
import { defaultFilters, hasActiveFilters, type DirectoryFilters as Filters } from './filters';
import styles from './DirectoryFilters.module.css';

export interface DirectoryFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  /** Layers offered in the Layer select. */
  layers: readonly EntryLayer[];
  resultCount: number;
  totalCount: number;
  /** Accessible name of the search region. */
  label?: string;
}

/**
 * Search and filter controls. Controlled, so the same UI works with URL state (the
 * Components index) or local state (the directory pattern demo).
 */
export function DirectoryFilters({ filters, onChange, layers, resultCount, totalCount, label = 'Filter entries' }: DirectoryFiltersProps) {
  return (
    <div role="search" className={styles.filters} aria-label={label}>
      <div className={styles.fields}>
        <Field label="Search">
          {(control) => (
            <Input
              {...control}
              type="search"
              value={filters.query}
              placeholder="Name, summary or tag"
              onChange={(event) => onChange({ ...filters, query: event.target.value })}
            />
          )}
        </Field>
        {layers.length > 1 && (
          <Field label="Layer">
            {(control) => (
              <Select
                {...control}
                value={filters.layer}
                onChange={(event) => onChange({ ...filters, layer: event.target.value as Filters['layer'] })}
              >
                <option value="all">All layers</option>
                {layers.map((layer) => (
                  <option key={layer} value={layer}>
                    {layer}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        )}
        <Field label="Maturity">
          {(control) => (
            <Select
              {...control}
              value={filters.maturity}
              onChange={(event) => onChange({ ...filters, maturity: event.target.value as Filters['maturity'] })}
            >
              <option value="all">Any maturity</option>
              {maturities.map((maturity) => (
                <option key={maturity} value={maturity}>
                  {maturityLabels[maturity]}
                </option>
              ))}
            </Select>
          )}
        </Field>
      </div>
      <div className={styles.summary}>
        <p role="status" className={styles.count}>
          Showing {resultCount} of {totalCount}
        </p>
        {hasActiveFilters(filters) && (
          <Button size="small" appearance="ghost" onClick={() => onChange(defaultFilters)}>
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}
