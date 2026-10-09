import { useEffect, useMemo, useState } from 'react';
import { ScrollRegion, useThemeScope } from '@/design-system/layout';
import { Text } from '@/design-system/primitives';
import { tokenValueIn } from '@/design-system/tokens';
import { tokenManifest } from '@/design-system/tokens/manifest';
import { loadSource } from './sourceFiles';
import { contextLabel, TokenSwatch } from './TokenChain';
import { cssVarIndex, tokenReadsOf, type TokenRead } from './tokenReads';
import styles from './ComponentReference.module.css';

const tierOrder = ['component', 'semantic', 'reference'];

/** Every token a component's files read, with each value resolved for the current context. */
export function TokensRead({ sourcePaths }: { sourcePaths: readonly string[] }) {
  const scope = useThemeScope();
  const [reads, setReads] = useState<TokenRead[] | null>(null);
  const records = useMemo(() => new Map(tokenManifest.map((record) => [record.path, record])), []);

  useEffect(() => {
    let active = true;
    const index = cssVarIndex(tokenManifest);
    void Promise.all(sourcePaths.map(async (path) => ({ path, text: await loadSource(path) }))).then((files) => {
      if (active) setReads(tokenReadsOf(files, index));
    });
    return () => {
      active = false;
    };
  }, [sourcePaths]);

  if (!reads) {
    return (
      <Text role="status" tone="muted">
        Reading source files…
      </Text>
    );
  }
  if (reads.length === 0) {
    return <Text>Its own files read no tokens. It is styled entirely by the components it renders.</Text>;
  }

  const rows = reads
    .map((read) => ({ read, record: records.get(read.path) }))
    .sort((a, b) => tierOrder.indexOf(a.record?.tier ?? '') - tierOrder.indexOf(b.record?.tier ?? '') || a.read.path.localeCompare(b.read.path));
  const caption = `${reads.length} tokens read, resolved for ${contextLabel(scope)}`;

  return (
    <ScrollRegion aria-label={caption}>
      <table className={styles.readTable}>
        <caption className={styles.readCaption}>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Token</th>
            <th scope="col">Tier</th>
            <th scope="col">Read through</th>
            <th scope="col">In this context</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ read, record }) => {
            const value = record && tokenValueIn(record, scope);
            return (
              <tr key={read.path}>
                <th scope="row">
                  <code>{read.path}</code>
                </th>
                <td>{record?.tier ?? 'unknown'}</td>
                <td>{read.via}</td>
                <td>
                  {value && record && (
                    <span className={styles.tokenValues}>
                      <TokenSwatch type={record.type} value={value.resolved} />
                      <code>{value.resolved}</code>
                      {value.authored !== value.resolved && <code className={styles.muted}>{value.authored}</code>}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </ScrollRegion>
  );
}
