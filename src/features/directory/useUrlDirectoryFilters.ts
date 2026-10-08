import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { parseFilters, toSearchParams, type DirectoryFilters } from './filters';

/**
 * Directory filters stored in the URL, so a filtered view can be bookmarked, shared and
 * restored with Back. Typing replaces the history entry; choosing a filter adds one.
 */
export function useUrlDirectoryFilters() {
  const [search, setSearch] = useSearchParams();
  const filters = useMemo(() => parseFilters(search), [search]);
  const setFilters = useCallback(
    (next: DirectoryFilters) => {
      setSearch(toSearchParams(next), { replace: next.query !== filters.query, preventScrollReset: true });
    },
    [filters.query, setSearch],
  );
  return [filters, setFilters] as const;
}
