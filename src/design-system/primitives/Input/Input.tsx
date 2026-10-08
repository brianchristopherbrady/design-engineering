import type { ComponentPropsWithRef } from 'react';
import styles from './Input.module.css';

/**
 * A styled native `<input>`. Supports both modes React offers:
 * controlled (`value` + `onChange`) or uncontrolled (`defaultValue`, read on submit).
 * Pick one for the lifetime of the input. Invalid styling follows `aria-invalid`.
 */
export type InputProps = ComponentPropsWithRef<'input'>;

/** Single-line text entry. Pair with Field for a label, description and error. */
export function Input({ className, type = 'text', ...rest }: InputProps) {
  return <input type={type} className={[styles.input, className].filter(Boolean).join(' ')} {...rest} />;
}
