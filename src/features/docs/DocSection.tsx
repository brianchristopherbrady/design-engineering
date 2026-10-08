import type { ReactNode } from 'react';
import { Stack } from '@/design-system/layout';
import { Heading } from '@/design-system/primitives';
import styles from './DocSection.module.css';

export interface DocSectionProps {
  /** Fragment id, so "On this page" links can target the section. */
  id: string;
  title: ReactNode;
  level?: 2 | 3;
  children: ReactNode;
}

/** A titled documentation section that can be linked to directly. Not a landmark: its heading is enough. */
export function DocSection({ id, title, level = 2, children }: DocSectionProps) {
  return (
    <section id={id} className={styles.section}>
      <Stack gap="medium">
        <Heading level={level}>{title}</Heading>
        {children}
      </Stack>
    </section>
  );
}

/**
 * Typographic rhythm for authored documentation: paragraphs, lists, tables and
 * small headings written as plain semantic HTML inside it.
 */
export function Prose({ children }: { children: ReactNode }) {
  return <div className={styles.prose}>{children}</div>;
}

/** A labelled aside for tradeoffs, warnings and asides that should not interrupt the main text. */
export function Note({ title, children }: { title: string; children: ReactNode }) {
  return (
    <aside className={styles.note} aria-label={title}>
      <p className={styles.noteTitle}>{title}</p>
      <div className={styles.prose}>{children}</div>
    </aside>
  );
}
