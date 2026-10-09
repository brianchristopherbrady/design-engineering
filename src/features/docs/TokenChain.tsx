import { Fragment } from 'react';
import { themeNames, type TokenPath } from '@/design-system/tokens';
import { tokenManifest } from '@/design-system/tokens/manifest';
import styles from './TokenExplorer.module.css';

type TokenRecord = (typeof tokenManifest)[number];
let index: Map<string, TokenRecord> | undefined;
// Built on first use rather than at import, so pages that never trace a token do not pull in the manifest.
const byPath = () => (index ??= new Map(tokenManifest.map((record) => [record.path, record])));

export function TokenSwatch({ type, value }: { type: string; value: string }) {
  if (type !== 'color') return null;
  return <span className={styles.swatch} style={{ backgroundColor: value }} aria-hidden="true" />;
}

/** Follows a token's aliases to its final value, once per theme, straight from the generated manifest. */
export function TokenChain({ path }: { path: TokenPath }) {
  const record = byPath().get(path);
  if (!record) return <p>Unknown token {path}</p>;

  return (
    <dl className={styles.chains}>
      {themeNames.map((theme) => {
        const { chain, resolved } = record.values[theme];
        return (
          <Fragment key={theme}>
            <dt className={styles.chainTheme}>{theme === 'light' ? 'Light theme' : 'Dark theme'}</dt>
            <dd className={styles.chain}>
              <ol className={styles.chainList} aria-label={`${path} in the ${theme} theme`}>
                {chain.map((step) => (
                  <li key={step} className={styles.chainStep}>
                    <code>{step}</code>
                    <span className={styles.tier}>{byPath().get(step)?.tier}</span>
                  </li>
                ))}
                <li className={styles.chainStep}>
                  <TokenSwatch type={record.type} value={resolved} />
                  <code>{resolved}</code>
                </li>
              </ol>
            </dd>
          </Fragment>
        );
      })}
    </dl>
  );
}
