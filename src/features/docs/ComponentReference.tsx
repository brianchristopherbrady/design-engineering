import { useState, type ReactNode } from 'react';
import { Inline, Stack } from '@/design-system/layout';
import { Badge, Icon, Link, Text } from '@/design-system/primitives';
import { tokenManifest } from '@/design-system/tokens/manifest';
import { MaturityBadge, type CatalogEntry } from '@/domain/system';
import { ApiTable } from './ApiTable';
import { DocSection, Prose } from './DocSection';
import type { ComponentDoc, PropTokenTrace } from './docTypes';
import { SourceList } from './SourceList';
import { TokenChain, TokenSwatch } from './TokenChain';
import styles from './ComponentReference.module.css';

type TokenRecord = (typeof tokenManifest)[number];
let index: Map<string, TokenRecord> | undefined;
// Built on first use rather than at import, so the manifest stays out of bundles that never render a reference.
const manifestByPath = () => (index ??= new Map(tokenManifest.map((record) => [record.path, record])));

export const componentSections = [
  { id: 'overview', label: 'Overview' },
  { id: 'examples', label: 'Examples' },
  { id: 'api', label: 'Props' },
  { id: 'tokens', label: 'Tokens' },
  { id: 'behavior', label: 'Behavior and accessibility' },
  { id: 'guidance', label: 'Guidance' },
  { id: 'source', label: 'Source' },
] as const;

function BulletList({ items }: { items: readonly ReactNode[] }) {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

function TraceItem({ trace }: { trace: PropTokenTrace }) {
  const [open, setOpen] = useState(false);
  return (
    <li>
      <details className={styles.details} onToggle={(event) => setOpen(event.currentTarget.open)}>
        <summary className={styles.summary}>
          <code>{trace.prop}</code> <Icon name="arrowRight" /> <code>{trace.property}</code> <Icon name="arrowRight" />{' '}
          <code>{trace.token}</code>
        </summary>
        {open && <TokenChain path={trace.token} />}
      </details>
    </li>
  );
}

export interface ComponentReferenceProps {
  entry: CatalogEntry;
  doc: ComponentDoc;
  /** Link to the playground for this component, when it has a story. */
  playgroundHref?: string;
}

/** Renders the reference for one component from its catalog entry and typed ComponentDoc. */
export function ComponentReference({ entry, doc, playgroundHref }: ComponentReferenceProps) {
  return (
    <Stack gap="extraExtraLarge">
      <DocSection id="overview" title="Overview">
        <Inline gap="small">
          <Badge tone="info" appearance="outlined">
            {entry.layer}
          </Badge>
          <MaturityBadge maturity={entry.maturity} />
          {playgroundHref && (
            <Link href={playgroundHref} variant="standalone" className={styles.playgroundLink}>
              Open in playground <Icon name="arrowRight" />
            </Link>
          )}
        </Inline>
        <Prose>
          <p>{doc.purpose}</p>
        </Prose>
        <div className={styles.columns}>
          <Prose>
            <h3>Use it for</h3>
            <BulletList items={doc.whenToUse} />
          </Prose>
          <Prose>
            <h3>Not for</h3>
            <BulletList items={doc.whenNotToUse} />
          </Prose>
        </div>
      </DocSection>

      <DocSection id="examples" title="Examples">
        <doc.Example />
      </DocSection>

      <DocSection id="api" title="Props">
        {doc.props.length > 0 && <ApiTable caption={`${entry.name} props`} props={doc.props} />}
        <Prose>
          <p>{doc.nativeProps}</p>
          {doc.precedence.length > 0 && (
            <>
              <h3>Defaults, combinations and precedence</h3>
              <BulletList items={doc.precedence} />
            </>
          )}
        </Prose>
      </DocSection>

      <DocSection id="tokens" title="Tokens">
        {doc.propTokens.length > 0 && (
          <>
            <Prose>
              <h3>From prop to token</h3>
              <p>
                Each row follows a prop value to the CSS property it sets and the first token that property reads. Open a
                row to see the alias chain down to the reference value in both themes.
              </p>
            </Prose>
            <ul className={styles.traces}>
              {doc.propTokens.map((trace) => (
                <TraceItem key={`${trace.prop}:${trace.property}`} trace={trace} />
              ))}
            </ul>
          </>
        )}
        <Prose>
          <h3>Every token read</h3>
        </Prose>
        {doc.tokens.length === 0 ? (
          <Text>This component does not read tokens directly.</Text>
        ) : (
          <ul className={styles.tokens}>
            {doc.tokens.map((path) => {
              const record = manifestByPath().get(path);
              return (
                <li key={path} className={styles.token}>
                  <code>{path}</code>
                  {record && (
                    <span className={styles.tokenValues}>
                      <span className={styles.muted}>{record.tier}</span>
                      <TokenSwatch type={record.type} value={record.values.light.resolved} />
                      <code>{record.values.light.authored}</code>
                      {record.themed && (
                        <>
                          <span className={styles.muted}>light ·</span>
                          <TokenSwatch type={record.type} value={record.values.dark.resolved} />
                          <code>{record.values.dark.authored}</code>
                          <span className={styles.muted}>dark</span>
                        </>
                      )}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </DocSection>

      <DocSection id="behavior" title="Behavior and accessibility">
        <div className={styles.columns}>
          <Prose>
            <h3>States</h3>
            <BulletList items={doc.states} />
          </Prose>
          <Prose>
            <h3>Accessibility and keyboard</h3>
            <BulletList items={doc.accessibility} />
          </Prose>
        </div>
        <Prose>
          <h3>Responsive behavior</h3>
          <BulletList items={doc.responsive} />
        </Prose>
      </DocSection>

      <DocSection id="guidance" title="Guidance">
        <div className={styles.columns}>
          <Prose>
            <h3>Composition</h3>
            <BulletList items={doc.composition} />
          </Prose>
          <Prose>
            <h3>Common mistakes</h3>
            <BulletList items={doc.mistakes} />
          </Prose>
        </div>
        <Prose>
          <h3>Tradeoffs</h3>
          <BulletList items={doc.tradeoffs} />
        </Prose>
      </DocSection>

      <DocSection id="source" title="Source">
        <SourceList
          sources={doc.sourcePaths.map((path) => ({
            path,
            note: path.endsWith('.css') ? 'Styles: which tokens each class reads' : 'Implementation and public types',
          }))}
        />
      </DocSection>
    </Stack>
  );
}
