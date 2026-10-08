import { useId, type ReactNode } from 'react';
import type { TokenPath } from '@/design-system/tokens';
import { tokenManifest } from '@/design-system/tokens/manifest';
import { TokenSwatch } from '@/features/docs';
import styles from './foundations.module.css';

const byPath = new Map(tokenManifest.map((record) => [record.path, record]));

export function tokenRecord(path: string) {
  return byPath.get(path);
}

export interface TokenTableProps {
  caption: string;
  paths: readonly TokenPath[];
  /** Renders a live sample that uses the token through its CSS variable. */
  preview?: (cssVar: string, path: TokenPath) => ReactNode;
}

/** Tokens with their authored and resolved values in both themes, read from the generated manifest. */
export function TokenTable({ caption, paths, preview }: TokenTableProps) {
  const captionId = useId();
  return (
    <div className={styles.scroller} tabIndex={0} role="region" aria-labelledby={captionId}>
      <table className={styles.table}>
        <caption id={captionId} className={styles.caption}>
          {caption}
        </caption>
        <thead>
          <tr>
            <th scope="col">Token</th>
            <th scope="col">Light</th>
            <th scope="col">Dark</th>
            {preview && <th scope="col">Sample</th>}
          </tr>
        </thead>
        <tbody>
          {paths.map((path) => {
            const record = byPath.get(path);
            if (!record) return null;
            return (
              <tr key={path}>
                <th scope="row">
                  <code>{path}</code>
                  <br />
                  <code className={styles.muted}>{record.cssVar}</code>
                </th>
                {(['light', 'dark'] as const).map((theme) => (
                  <td key={theme}>
                    <span className={styles.value}>
                      <TokenSwatch type={record.type} value={record.values[theme].resolved} />
                      <code>{record.values[theme].authored}</code>
                    </span>
                  </td>
                ))}
                {preview && <td>{preview(`var(${record.cssVar})`, path)}</td>}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
