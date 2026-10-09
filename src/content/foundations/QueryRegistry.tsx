import { useEffect, useState } from 'react';
import { Field } from '@/design-system/composites';
import { Inline, ScrollRegion, Stack } from '@/design-system/layout';
import { Badge, Select, Text } from '@/design-system/primitives';
import { loadSource, sourcePaths } from '@/features/docs';
import { parseQueries, type QueryRule } from './queries';
import styles from './products.module.css';

type Filter = 'all' | 'container' | 'size-media' | 'preference';

const isPreference = (rule: QueryRule) => rule.kind === 'media' && /prefers-|forced-colors/.test(rule.condition);

/**
 * Every @container and @media rule in the codebase, read from the real stylesheets at runtime.
 * The audit is where viewport size queries live: only the app shell should have any.
 */
export function QueryRegistry() {
  const [rules, setRules] = useState<QueryRule[] | null>(null);
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    let active = true;
    const files = sourcePaths.filter((path) => path.endsWith('.css') && !path.includes('/generated/'));
    void Promise.all(files.map(async (file) => parseQueries(file, await loadSource(file)))).then((results) => {
      if (active) setRules(results.flat());
    });
    return () => {
      active = false;
    };
  }, []);

  if (!rules) {
    return (
      <Text role="status" tone="muted">
        Reading stylesheets…
      </Text>
    );
  }

  const containers = rules.filter((rule) => rule.kind === 'container');
  const sizeMedia = rules.filter((rule) => rule.kind === 'media' && !isPreference(rule));
  const preferences = rules.filter(isPreference);
  const outsideShell = sizeMedia.filter((rule) => !rule.file.startsWith('src/app/shell/'));
  const visible = { all: rules, container: containers, 'size-media': sizeMedia, preference: preferences }[filter];

  return (
    <Stack gap="medium">
      <Inline gap="small">
        <Badge tone="brand">{containers.length} container</Badge>
        <Badge tone={outsideShell.length === 0 ? 'success' : 'warning'}>{sizeMedia.length} viewport size</Badge>
        <Badge>{preferences.length} preference</Badge>
      </Inline>
      <Text variant="bodySmall" tone="muted">
        {outsideShell.length === 0
          ? `All ${sizeMedia.length} viewport size queries are in the app shell; every component responds to its container.`
          : `${outsideShell.length} viewport size ${outsideShell.length === 1 ? 'query is' : 'queries are'} outside the app shell: ${outsideShell.map((rule) => rule.file.replace(/^src\//, '')).join(', ')}.`}
      </Text>
      <Field label="Show">
        {(control) => (
          <Select {...control} value={filter} onChange={(event) => setFilter(event.target.value as Filter)}>
            <option value="all">All queries</option>
            <option value="container">Container queries</option>
            <option value="size-media">Viewport size queries</option>
            <option value="preference">Preference queries (motion, color scheme, forced colors)</option>
          </Select>
        )}
      </Field>
      <ScrollRegion aria-label="Queries in the codebase">
        <table className={`${styles.table} ${styles.registry}`}>
          <thead>
            <tr>
              <th scope="col">Target</th>
              <th scope="col">Condition</th>
              <th scope="col">Why</th>
              <th scope="col">Where</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((rule) => (
              <tr key={`${rule.file}:${rule.line}`}>
                <th scope="row">{rule.kind === 'container' ? <code>{rule.target}</code> : 'viewport'}</th>
                <td>
                  <code>{rule.condition}</code>
                </td>
                <td>{rule.reason || '—'}</td>
                <td>
                  <code>
                    {rule.file.replace(/^src\//, '')}:{rule.line}
                  </code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollRegion>
    </Stack>
  );
}
