import { Fragment } from 'react';
import { Disclosure } from '@/design-system/composites';
import { ScrollRegion } from '@/design-system/layout';
import { Icon, Link, Text } from '@/design-system/primitives';
import { sources, type SourceId } from '@/domain/planning';
import { findEntry } from '@/domain/system';
import { Note, Prose } from '@/features/docs';
import type { Block } from './types';
import styles from './wiki.module.css';

/** Text with `backticks` rendered as code and **double asterisks** as strong. */
export function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(/(`[^`]+`|\*\*[^*]+\*\*)/).map((part, index) => {
        if (part.startsWith('`') && part.endsWith('`') && part.length > 1) return <code key={index}>{part.slice(1, -1)}</code>;
        if (part.startsWith('**') && part.endsWith('**') && part.length > 3) return <strong key={index}>{part.slice(2, -2)}</strong>;
        return <Fragment key={index}>{part}</Fragment>;
      })}
    </>
  );
}

export const articleHref = (id: string) => `/guides/${id}`;

export function InShort({ items }: { items: readonly string[] }) {
  return (
    <section className={styles.inShort} aria-labelledby="in-short">
      <Text as="span" variant="label" id="in-short" className={styles.inShortLabel}>
        In short
      </Text>
      <ul>
        {items.map((item) => (
          <li key={item}>
            <Icon name="arrowRight" />
            <span>
              <Rich text={item} />
            </span>
          </li>
        ))}
      </ul>
    </section>
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
    case 'points':
      return (
        <ul className={styles.points}>
          {block.items.map((point) => (
            <li key={point.title} className={styles.point}>
              {point.icon && (
                <span className={styles.pointIcon} aria-hidden="true">
                  <Icon name={point.icon} />
                </span>
              )}
              <Text as="span" variant="label">
                {point.title}
              </Text>
              <Text as="span" variant="bodySmall" tone="muted">
                <Rich text={point.text} />
              </Text>
            </li>
          ))}
        </ul>
      );
    case 'steps':
      return (
        <ol className={styles.steps}>
          {block.items.map((step, index) => (
            <li key={step.title} className={styles.step}>
              <span className={styles.stepDot} aria-hidden="true">
                {index + 1}
              </span>
              <div className={styles.stepBody}>
                <Text as="span" variant="label">
                  {step.title}
                </Text>
                <Text as="span" variant="bodySmall" tone="muted">
                  <Rich text={step.text} />
                </Text>
              </div>
            </li>
          ))}
        </ol>
      );
    case 'doDont':
      return (
        <ul className={styles.doDont}>
          {block.items.map((pair) => (
            <li key={pair.dont} className={styles.pair}>
              <div className={styles.dont}>
                <span className={styles.verdict}>
                  <Icon name="close" /> Avoid
                </span>
                <Text as="span" variant="bodySmall">
                  <Rich text={pair.dont} />
                </Text>
              </div>
              <div className={styles.do}>
                <span className={styles.verdict}>
                  <Icon name="check" /> Prefer
                </span>
                <Text as="span" variant="bodySmall">
                  <Rich text={pair.do} />
                </Text>
              </div>
            </li>
          ))}
        </ul>
      );
    case 'checklist':
      return (
        <ul className={styles.checklist}>
          {block.items.map((item) => (
            <li key={item}>
              <span className={styles.checkBox} aria-hidden="true">
                <Icon name="check" />
              </span>
              <Text as="span" variant="bodySmall">
                <Rich text={item} />
              </Text>
            </li>
          ))}
        </ul>
      );
    case 'table':
      return (
        <ScrollRegion axis="inline" aria-label={block.caption}>
          <table className={styles.table}>
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
          <block.Visual />
          {block.caption && (
            <figcaption>
              <Rich text={block.caption} />
            </figcaption>
          )}
        </figure>
      );
    case 'details':
      return (
        <div className={styles.details}>
          {block.items.map((item) => (
            <Disclosure key={item.summary} summary={item.summary}>
              <Prose>
                {item.body.map((paragraph) => (
                  <p key={paragraph}>
                    <Rich text={paragraph} />
                  </p>
                ))}
              </Prose>
            </Disclosure>
          ))}
        </div>
      );
    case 'related':
      return (
        <ul className={styles.related}>
          {block.ids.map((id) => {
            const entry = findEntry(id);
            return entry ? (
              <li key={id}>
                <Link href={articleHref(id)} variant="standalone" className={styles.relatedLink}>
                  <span className={styles.relatedName}>{entry.name}</span>
                  <Icon name="arrowRight" />
                </Link>
                <Text as="span" variant="bodySmall" tone="muted">
                  {entry.summary}
                </Text>
              </li>
            ) : null;
          })}
        </ul>
      );
  }
}
