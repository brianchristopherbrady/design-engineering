import { useId, useState } from 'react';
import { Field } from '@/design-system/composites';
import { Grid, Stack } from '@/design-system/layout';
import { Button, Input, Select, Text } from '@/design-system/primitives';
import { themeNames, type ThemeName } from '@/design-system/tokens';
import { tokenManifest } from '@/design-system/tokens/manifest';
import { TokenSwatch } from './TokenChain';
import styles from './TokenExplorer.module.css';

const tiers = ['all', 'reference', 'semantic', 'component'] as const;
type TierFilter = (typeof tiers)[number];

const ALIAS = /^\{(.+)\}$/;

/**
 * Lists tokens from the generated manifest, the same data the CSS was built from.
 * Alias values are buttons that jump to the referenced token.
 */
export function TokenExplorer({ initialTier = 'semantic' }: { initialTier?: TierFilter }) {
  const [query, setQuery] = useState('');
  const [tier, setTier] = useState<TierFilter>(initialTier);
  const [theme, setTheme] = useState<ThemeName>('light');
  const captionId = useId();

  const terms = query.trim().toLowerCase();
  const rows = tokenManifest.filter(
    (record) =>
      (tier === 'all' || record.tier === tier) &&
      (terms === '' || record.path.includes(terms) || record.cssVar.includes(terms)),
  );

  const follow = (path: string) => {
    setTier('all');
    setQuery(path);
  };

  return (
    <Stack gap="medium">
      <Grid minColumnWidth="extraSmall" gap="medium">
        <Field label="Filter by name">
          {(control) => (
            <Input {...control} type="search" value={query} onChange={(event) => setQuery(event.target.value)} />
          )}
        </Field>
        <Field label="Tier">
          {(control) => (
            <Select {...control} value={tier} onChange={(event) => setTier(event.target.value as TierFilter)}>
              {tiers.map((value) => (
                <option key={value} value={value}>
                  {value === 'all' ? 'All tiers' : value[0]?.toUpperCase() + value.slice(1)}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label="Show values for">
          {(control) => (
            <Select {...control} value={theme} onChange={(event) => setTheme(event.target.value as ThemeName)}>
              {themeNames.map((name) => (
                <option key={name} value={name}>
                  {name === 'light' ? 'Light theme' : 'Dark theme'}
                </option>
              ))}
            </Select>
          )}
        </Field>
      </Grid>

      <Text variant="bodySmall" tone="muted" role="status">
        {rows.length} of {tokenManifest.length} tokens
      </Text>

      <div className={styles.scroller} tabIndex={0} role="region" aria-labelledby={captionId}>
        <table className={styles.table}>
          <caption id={captionId} className={styles.caption}>
            Design tokens ({theme} theme)
          </caption>
          <thead>
            <tr>
              <th scope="col">Token and CSS variable</th>
              <th scope="col">Tier</th>
              <th scope="col">Authored value</th>
              <th scope="col">Resolves to</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((record) => {
              const value = record.values[theme];
              const alias = ALIAS.exec(value.authored)?.[1];
              return (
                <tr key={record.path}>
                  <th scope="row">
                    <code>{record.path}</code>
                    <br />
                    <code className={styles.cssVar}>{record.cssVar}</code>
                    {record.description && <p className={styles.description}>{record.description}</p>}
                  </th>
                  <td>
                    {record.tier}
                    {record.themed && <span className={styles.themed}> · per theme</span>}
                  </td>
                  <td>
                    {alias ? (
                      <Button appearance="ghost" size="small" border="none" onClick={() => follow(alias)}>
                        <code>{value.authored}</code>
                      </Button>
                    ) : (
                      <code className={styles.value}>{value.authored}</code>
                    )}
                  </td>
                  <td>
                    <span className={styles.resolved}>
                      <TokenSwatch type={record.type} value={value.resolved} />
                      <code className={styles.value}>{value.resolved}</code>
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Stack>
  );
}
