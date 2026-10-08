import { EmptyState } from '@/design-system/composites';
import { Grid, Stack } from '@/design-system/layout';
import { Button, Heading, Text } from '@/design-system/primitives';
import { EntryCard, entriesOfKind, type EntryLayer } from '@/domain/system';
import { defaultFilters, DirectoryFilters, filterEntries, useUrlDirectoryFilters } from '@/features/directory';
import { paths } from '../paths';
import { DocPage } from './DocPage';

const components = entriesOfKind('component');
const layers: EntryLayer[] = ['Layout', 'Primitive', 'Composite'];
const layerDescriptions: Record<string, string> = {
  Layout: 'Space and structure. They read spacing and size tokens and never draw content.',
  Primitive: 'Single-purpose elements built on native HTML.',
  Composite: 'Compositions of primitives with structure and behavior of their own.',
};

export function ComponentsIndexPage() {
  const [filters, setFilters] = useUrlDirectoryFilters();
  const results = filterEntries(components, filters);

  return (
    <DocPage
      title="Components"
      eyebrow="Design system"
      description="Every component with its props, defaults, token traces, live examples, accessibility notes and source. Filters are stored in the URL so a filtered view can be shared."
    >
      <Stack gap="extraLarge">
        <DirectoryFilters
          filters={filters}
          onChange={setFilters}
          layers={layers}
          resultCount={results.length}
          totalCount={components.length}
          label="Filter components"
        />
        {results.length === 0 ? (
          <EmptyState
            title="No components match these filters"
            description="Try a broader search term, or clear the filters to see all components."
            action={<Button onClick={() => setFilters(defaultFilters)}>Clear filters</Button>}
          />
        ) : (
          layers.map((layer) => {
            const group = results.filter((entry) => entry.layer === layer);
            if (group.length === 0) return null;
            return (
              <section key={layer} aria-labelledby={`layer-${layer}`}>
                <Stack gap="medium">
                  <Stack gap="extraSmall">
                    <Heading level={2} size="medium" id={`layer-${layer}`}>
                      {layer} ({group.length})
                    </Heading>
                    <Text tone="muted">{layerDescriptions[layer]}</Text>
                  </Stack>
                  <Grid as="ul" minColumnWidth="medium" gap="medium">
                    {group.map((entry) => (
                      <li key={entry.id}>
                        <EntryCard entry={entry} href={paths.component(entry.id)} headingLevel={3} />
                      </li>
                    ))}
                  </Grid>
                </Stack>
              </section>
            );
          })
        )}
      </Stack>
    </DocPage>
  );
}
