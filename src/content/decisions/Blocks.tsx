import { Fragment } from 'react';
import { Disclosure } from '@/design-system/composites';
import { ScrollRegion } from '@/design-system/layout';
import { Badge, Icon, Link, Text } from '@/design-system/primitives';
import { sources, type SourceId } from '@/domain/decisions';
import { Note, Prose } from '@/features/docs';
import type { Block, Evidence } from './types';
import styles from './decisions.module.css';

const inline = /(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/;

/** Text with `code`, **strong** and Markdown-style links. */
export function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(inline).map((part, index) => {
        if (part.startsWith('`') && part.endsWith('`') && part.length > 1) return <code key={index}>{part.slice(1, -1)}</code>;
        if (part.startsWith('**') && part.endsWith('**') && part.length > 3) return <strong key={index}>{part.slice(2, -2)}</strong>;
        const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
        if (link) return <Link key={index} href={link[2] ?? ''}>{link[1]}</Link>;
        return <Fragment key={index}>{part}</Fragment>;
      })}
    </>
  );
}

const evidenceBadge: Record<Evidence, { label: string; tone: 'success' | 'warning' | 'info' }> = {
  implemented: { label: 'Implemented in this project', tone: 'success' },
  hypothetical: { label: 'Hypothetical example', tone: 'warning' },
  proposed: { label: 'Proposed, not measured here', tone: 'info' },
  conceptual: { label: 'Conceptual, not implemented', tone: 'info' },
};

export function EvidenceBadge({ evidence }: { evidence: Evidence }) {
  const { label, tone } = evidenceBadge[evidence];
  return (
    <Badge tone={tone} size="small">
      {label}
    </Badge>
  );
}

export function Sources({ ids }: { ids: readonly SourceId[] }) {
  return (
    <ul className={styles.sources}>
      {ids.map((id) => {
        const source = sources.find((candidate) => candidate.id === id);
        return source ? (
          <li key={id}>
            {source.author}. <Link href={source.href}>{source.title}</Link>
            {source.year ? `, ${source.year}` : ''}.
          </li>
        ) : null;
      })}
    </ul>
  );
}

export function BlockView({ block }: { block: Block }) {
  switch (block.kind) {
    case 'text':
      return (
        <Prose>
          {block.paragraphs.map((paragraph) => (
            <p key={paragraph}>
              <Rich text={paragraph} />
            </p>
          ))}
        </Prose>
      );
    case 'list': {
      const List = block.ordered ? 'ol' : 'ul';
      return (
        <Prose>
          <List>
            {block.items.map((item) => (
              <li key={item}>
                <Rich text={item} />
              </li>
            ))}
          </List>
        </Prose>
      );
    }
    case 'steps':
      return (
        <ol className={styles.steps}>
          {block.items.map((step, index) => (
            <li key={step.title} className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">
                {index + 1}
              </span>
              <div className={styles.stepBody}>
                <Text as="span" variant="label">
                  {step.title}
                </Text>
                <Text as="span" variant="bodySmall">
                  <Rich text={step.text} />
                </Text>
                {step.output && (
                  <Text as="span" variant="bodySmall" tone="muted">
                    Output: {step.output}
                  </Text>
                )}
              </div>
            </li>
          ))}
        </ol>
      );
    case 'table':
      if (block.stacked) {
        const [, ...fields] = block.columns;
        return (
          <figure className={styles.figure}>
            {block.evidence && <EvidenceBadge evidence={block.evidence} />}
            <figcaption>{block.caption}</figcaption>
            <ul className={styles.records}>
              {block.rows.map(([name = '', ...values]) => (
                <li key={name} className={styles.record}>
                  <Text as="p" variant="body">
                    <strong>
                      <Rich text={name} />
                    </strong>
                  </Text>
                  <dl>
                    {fields.map((field, index) => (
                      <div key={field}>
                        <dt>{field}</dt>
                        <dd>
                          <Rich text={values[index] ?? ''} />
                        </dd>
                      </div>
                    ))}
                  </dl>
                </li>
              ))}
            </ul>
          </figure>
        );
      }
      return (
        <figure className={styles.figure}>
          {block.evidence && <EvidenceBadge evidence={block.evidence} />}
          <ScrollRegion axis="inline" aria-label={block.caption}>
            <table className={styles.table} data-wide={block.wide || undefined}>
              <caption>{block.caption}</caption>
              <thead>
                <tr>
                  {block.columns.map((column) => (
                    <th key={column} scope="col">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row) => (
                  <tr key={row[0]}>
                    {row.map((cell, index) =>
                      index === 0 ? (
                        <th key={index} scope="row">
                          <Rich text={cell} />
                        </th>
                      ) : (
                        <td key={index}>
                          <Rich text={cell} />
                        </td>
                      ),
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollRegion>
        </figure>
      );
    case 'note':
      return (
        <Note title={block.title}>
          <p>
            <Rich text={block.text} />
          </p>
        </Note>
      );
    case 'visual':
      return (
        <figure className={styles.figure}>
          {block.evidence && <EvidenceBadge evidence={block.evidence} />}
          <block.Visual />
          {block.caption && (
            <figcaption>
              <Rich text={block.caption} />
            </figcaption>
          )}
        </figure>
      );
    case 'code':
      return (
        <figure className={styles.figure}>
          <EvidenceBadge evidence={block.evidence} />
          <ScrollRegion as="pre" axis="inline" className={styles.code} aria-label={block.caption}>
            <code data-language={block.language}>{block.code}</code>
          </ScrollRegion>
          <figcaption>
            <Rich text={block.caption} />
          </figcaption>
        </figure>
      );
    case 'details':
      return (
        <div className={styles.details}>
          {block.items.map((item) => (
            <Disclosure key={item.summary} summary={item.summary}>
              <div className={styles.detailsBody}>
                {item.blocks.map((inner, index) => (
                  <BlockView key={index} block={inner} />
                ))}
              </div>
            </Disclosure>
          ))}
        </div>
      );
    case 'evidence':
      return (
        <ul className={styles.evidence} aria-label="Working examples on this site">
          {block.items.map((item) => (
            <li key={item.href}>
              <Link href={item.href} variant="standalone" className={styles.evidenceLink}>
                {item.label}
                <Icon name="arrowRight" />
              </Link>
              <Text as="span" variant="bodySmall" tone="muted">
                {item.shows}
              </Text>
            </li>
          ))}
        </ul>
      );
  }
}
