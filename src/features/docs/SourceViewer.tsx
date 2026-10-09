import { useEffect, useId, useState, type ReactNode } from 'react';
import { loadSource } from './sourceFiles';
import styles from './SourceViewer.module.css';

type SourceState = { status: 'loading' } | { status: 'ready'; text: string } | { status: 'error'; message: string };

export interface SourceViewerProps {
  /** Repository-relative path, e.g. "src/design-system/primitives/Button/Button.tsx". */
  path: string;
  /** Why this file matters here. */
  description?: ReactNode;
}

/** Shows the current contents of a repository file. Long lines scroll inside the block, not the page. */
export function SourceViewer({ path, description }: SourceViewerProps) {
  const [state, setState] = useState<SourceState>({ status: 'loading' });
  const captionId = useId();

  useEffect(() => {
    let current = true;
    setState({ status: 'loading' });
    loadSource(path).then(
      (text) => current && setState({ status: 'ready', text }),
      (error: unknown) => current && setState({ status: 'error', message: error instanceof Error ? error.message : String(error) }),
    );
    // Ignore a slower response for a path that is no longer shown.
    return () => {
      current = false;
    };
  }, [path]);

  return (
    <figure className={styles.figure}>
      <figcaption id={captionId} className={styles.caption}>
        <code className={styles.path}>{path}</code>
        {description && <span className={styles.description}>{description}</span>}
      </figcaption>
      {state.status === 'ready' && (
        <pre className={styles.code} data-theme="dark" tabIndex={0} role="region" aria-labelledby={captionId}>
          <code>{state.text}</code>
        </pre>
      )}
      {state.status === 'loading' && (
        <p className={styles.message} role="status">
          Loading source…
        </p>
      )}
      {state.status === 'error' && (
        <p className={styles.message} role="alert">
          Could not load this file: {state.message}
        </p>
      )}
    </figure>
  );
}
