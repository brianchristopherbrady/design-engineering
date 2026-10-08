import { useId, type ComponentPropsWithRef, type ReactNode } from 'react';
import styles from './Progress.module.css';

export interface ProgressOwnProps {
  /** Visible label; also the progress element's accessible name. */
  label: ReactNode;
  value: number;
  /** Default 100. */
  max?: number;
  /** Visible value summary, such as "3 of 7 steps". Defaults to a rounded percentage. */
  valueText?: ReactNode;
}

/** `className` styles the wrapper; every other prop goes to the native `<progress>`. */
export type ProgressProps = ProgressOwnProps &
  Omit<ComponentPropsWithRef<'progress'>, keyof ProgressOwnProps | 'children'>;

/** Determinate progress with a visible, programmatically associated label. */
export function Progress({ label, value, max = 100, valueText, className, id, ...rest }: ProgressProps) {
  const generatedId = useId();
  const progressId = id ?? generatedId;
  const percent = max > 0 ? Math.round((Math.min(Math.max(value, 0), max) / max) * 100) : 0;

  return (
    <div className={[styles.progress, className].filter(Boolean).join(' ')}>
      <div className={styles.header}>
        <label htmlFor={progressId} className={styles.label}>
          {label}
        </label>
        <span className={styles.value}>{valueText ?? `${percent}%`}</span>
      </div>
      <progress id={progressId} className={styles.bar} value={value} max={max} {...rest}>
        {percent}%
      </progress>
    </div>
  );
}
