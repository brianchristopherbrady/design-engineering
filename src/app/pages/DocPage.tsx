import type { ReactNode } from 'react';
import { PageHeader } from '@/design-system/composites';
import { Container } from '@/design-system/layout';
import { OnThisPage } from '@/features/docs';
import { usePageTitle } from '../shell/usePageTitle';
import styles from './DocPageLayout.module.css';

export interface DocPageProps {
  title: string;
  eyebrow?: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  /** Sections for the "On this page" contents. Omit for pages without a contents list. */
  sections?: readonly { id: string; label: string }[];
  /** Page width; workbench pages use wide. */
  width?: 'default' | 'wide';
  children: ReactNode;
}

/** The frame shared by documentation pages: header, optional contents column and content. */
export function DocPage({ title, eyebrow, description, meta, actions, sections, width = 'default', children }: DocPageProps) {
  const titleRef = usePageTitle(title);
  return (
    <Container queryName="page" width={width}>
      <article className={sections ? styles.layout : styles.single}>
        <div className={styles.header}>
          <PageHeader titleRef={titleRef} eyebrow={eyebrow} title={title} description={description} meta={meta} actions={actions} />
        </div>
        {sections && (
          <div className={styles.toc}>
            <OnThisPage items={sections} />
          </div>
        )}
        <div className={styles.content}>{children}</div>
      </article>
    </Container>
  );
}
