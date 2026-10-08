import { useState } from 'react';
import { Stack } from '@/design-system/layout';
import { SourceViewer } from './SourceViewer';
import styles from './SourceList.module.css';

export interface SourceReference {
  /** Repository-relative path. */
  path: string;
  /** What to look for in this file. */
  note: string;
}

function SourceItem({ source }: { source: SourceReference }) {
  const [open, setOpen] = useState(false);
  return (
    <details className={styles.details} onToggle={(event) => setOpen(event.currentTarget.open)}>
      <summary className={styles.summary}>
        <span className={styles.summaryText}>
          <code className={styles.path}>{source.path}</code>
          <span className={styles.note}>{source.note}</span>
        </span>
      </summary>
      {open && (
        <div className={styles.body}>
          <SourceViewer path={source.path} />
        </div>
      )}
    </details>
  );
}

/** Collapsible source files, each with a note on why it matters. A file loads when it is opened. */
export function SourceList({ sources }: { sources: readonly SourceReference[] }) {
  return (
    <Stack as="ul" gap="extraSmall">
      {sources.map((source) => (
        <li key={source.path}>
          <SourceItem source={source} />
        </li>
      ))}
    </Stack>
  );
}
