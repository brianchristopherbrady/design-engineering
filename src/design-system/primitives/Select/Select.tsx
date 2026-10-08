import type { ComponentPropsWithRef } from 'react';
import styles from './Select.module.css';

/** A styled native `<select>`. Keeps the platform picker, keyboard behavior and mobile UI. */
export type SelectProps = ComponentPropsWithRef<'select'>;

/** Choose one option from a short list. Pair with Field or a visible `<label>`. */
export function Select({ className, ...rest }: SelectProps) {
  return <select className={[styles.select, className].filter(Boolean).join(' ')} {...rest} />;
}
