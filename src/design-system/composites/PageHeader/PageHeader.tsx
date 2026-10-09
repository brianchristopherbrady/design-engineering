import type { ReactNode, Ref } from 'react';
import { Inline, Stack } from '../../layout';
import { Heading, Text, type HeadingSize } from '../../primitives';
import styles from './PageHeader.module.css';

export interface PageHeaderProps {
  title: ReactNode;
  /** Short context above the title, such as the section name. */
  eyebrow?: ReactNode;
  description?: ReactNode;
  /** Metadata row below the description. */
  meta?: ReactNode;
  /** Page-level actions. */
  actions?: ReactNode;
  /** Visual size of the h1. Default `extraLarge`. */
  titleSize?: Extract<HeadingSize, 'display' | 'extraLarge'>;
  /** Receives the h1, which is focusable (tabIndex -1) so route changes can move focus to it. */
  titleRef?: Ref<HTMLHeadingElement>;
}

/** The introduction of a page: one h1 plus optional context, description, metadata and actions. */
export function PageHeader({ title, eyebrow, description, meta, actions, titleSize = 'extraLarge', titleRef }: PageHeaderProps) {
  return (
    <header className={styles.header}>
      <Stack gap="small">
        {eyebrow && (
          <Text as="p" variant="caption" tone="muted">
            {eyebrow}
          </Text>
        )}
        <Heading level={1} size={titleSize} tabIndex={-1} ref={titleRef}>
          {title}
        </Heading>
        {description && (
          <Text variant="lead" tone="muted">
            {description}
          </Text>
        )}
        {meta}
      </Stack>
      {actions && <Inline gap="small">{actions}</Inline>}
    </header>
  );
}
