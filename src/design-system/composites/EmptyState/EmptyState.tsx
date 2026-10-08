import type { ReactNode } from 'react';
import { Stack } from '../../layout';
import { Heading, Text } from '../../primitives';
import styles from './EmptyState.module.css';

export interface EmptyStateProps {
  title: ReactNode;
  /** Explain why nothing is shown and what the person can do about it. */
  description?: ReactNode;
  /** A way forward, such as a button that clears filters. */
  action?: ReactNode;
  /** Heading level that fits the surrounding outline. Default 2. */
  headingLevel?: 2 | 3 | 4;
}

/** Explains an empty result and offers a next step instead of showing a blank region. */
export function EmptyState({ title, description, action, headingLevel = 2 }: EmptyStateProps) {
  return (
    <Stack gap="small" align="start" className={styles.empty}>
      <Heading level={headingLevel} size="medium">
        {title}
      </Heading>
      {description && <Text tone="muted">{description}</Text>}
      {action}
    </Stack>
  );
}
