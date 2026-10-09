import { useEffect, useId, useRef, useState, type ReactNode, type RefObject } from 'react';
import { Disclosure } from '@/design-system/composites';
import { Inline, ScrollRegion, Stack } from '@/design-system/layout';
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
      <ScrollRegion as="pre" axis="both" className={styles.html} data-theme="dark" aria-labelledby={labelId}>
        <code>{html}</code>
      </ScrollRegion>
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
            <Disclosure appearance="flush" lazy className={styles.details} summary="Source">
              <SourceViewer path={sourcePath} />
            </Disclosure>
          )}
          {showHtml && (
            <Disclosure appearance="flush" lazy className={styles.details} summary="Rendered HTML">
              <RenderedHtml target={stageRef} />
            </Disclosure>
          )}
        </div>
      )}
    </section>
  );
}
