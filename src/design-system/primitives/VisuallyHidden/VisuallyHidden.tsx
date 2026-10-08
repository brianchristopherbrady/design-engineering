import type { ComponentPropsWithRef } from 'react';
import styles from './VisuallyHidden.module.css';

export type VisuallyHiddenProps = ComponentPropsWithRef<'span'>;

/** Text for assistive technology that would be redundant on screen, such as context for a repeated button label. */
export function VisuallyHidden({ className, ...rest }: VisuallyHiddenProps) {
  return <span className={[styles.hidden, className].filter(Boolean).join(' ')} {...rest} />;
}
