import { useEffect, useId, useRef, useState, type ReactNode, type RefObject } from 'react';
import { Inline, Stack } from '@/design-system/layout';
import { Badge, Heading, Text } from '@/design-system/primitives';
import { formatHtml } from './formatHtml';
import { SourceViewer } from './SourceViewer';
import styles from './LiveExample.module.css';

export type ExampleKind = 'recommended' | 'illustrative';

const kindLabel: Record<ExampleKind, string> = {
  recommended: 'Recommended usage',
  illustrative: 'Illustration',
};

export interface LiveExampleProps {
  title: string;
  /**
   * `recommended`: real components used the way production code should use them — copy this.
   * `illustrative`: a contrast or simplified case that exists to explain a rule.
   */
  kind: ExampleKind;
  description?: ReactNode;
  /** Controls that change the preview. Label every control. */
  controls?: ReactNode;
  /** The live preview. */
  children: ReactNode;
  /** File whose source is shown under the preview. */
  sourcePath?: string;
  /** Offer the preview's current DOM. Default true. */
  showHtml?: boolean;
  headingLevel?: 3 | 4;
}

function RenderedHtml({ target }: { target: RefObject<HTMLDivElement | null> }) {
  const [html, setHtml] = useState('');
  const labelId = useId();

  // The preview's DOM is an external system from React's point of view: observe it, don't duplicate it.
  useEffect(() => {
    const node = target.current;
    if (!node) return;
    const update = () => setHtml(formatHtml(node.innerHTML));
    update();
    const observer = new MutationObserver(update);
    observer.observe(node, { subtree: true, childList: true, attributes: true, characterData: true });
    return () => observer.disconnect();
  }, [target]);

  return (
    <>
      <span id={labelId} hidden>
        Rendered HTML
      </span>
      <pre className={styles.html} tabIndex={0} role="region" aria-labelledby={labelId}>
        <code>{html}</code>
      </pre>
    </>
  );
}

/** A documented demo: preview, optional controls, the real source file and the rendered HTML. */
export function LiveExample({
  title,
  kind,
  description,
  controls,
  children,
  sourcePath,
  showHtml = true,
  headingLevel = 3,
}: LiveExampleProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [htmlOpen, setHtmlOpen] = useState(false);
  const [sourceOpen, setSourceOpen] = useState(false);

  return (
    <section className={styles.example} data-example-kind={kind}>
      <Stack gap="small" className={styles.intro}>
        <Inline gap="small" justify="between">
          <Heading level={headingLevel} size="small">
            {title}
          </Heading>
          <Badge tone={kind === 'recommended' ? 'success' : 'neutral'} size="small">
            {kindLabel[kind]}
          </Badge>
        </Inline>
        {description && (
          <Text variant="bodySmall" tone="muted" as="div">
            {description}
          </Text>
        )}
      </Stack>
      {controls && <div className={styles.controls}>{controls}</div>}
      <div className={styles.stage} ref={stageRef}>
        {children}
      </div>
      {(sourcePath || showHtml) && (
        <div className={styles.disclosures}>
          {sourcePath && (
            <details className={styles.details} onToggle={(event) => setSourceOpen(event.currentTarget.open)}>
              <summary className={styles.summary}>Source</summary>
              {sourceOpen && <SourceViewer path={sourcePath} />}
            </details>
          )}
          {showHtml && (
            <details className={styles.details} onToggle={(event) => setHtmlOpen(event.currentTarget.open)}>
              <summary className={styles.summary}>Rendered HTML</summary>
              {htmlOpen && <RenderedHtml target={stageRef} />}
            </details>
          )}
        </div>
      )}
    </section>
  );
}
