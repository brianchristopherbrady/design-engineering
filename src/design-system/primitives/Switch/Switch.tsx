import { useId, type ComponentPropsWithRef, type ReactNode } from 'react';
import styles from './Switch.module.css';

export interface SwitchOwnProps {
  /** Visible label naming the setting, not the state ("Compact rows", not "On"). */
  label: ReactNode;
  /** Hint announced with the switch. */
  description?: ReactNode;
}

export type SwitchProps = SwitchOwnProps & Omit<ComponentPropsWithRef<'input'>, keyof SwitchOwnProps | 'type' | 'role'>;

/**
 * An on/off setting that applies immediately. A native checkbox with role="switch",
 * so it keeps form participation, Space to toggle and checked/disabled states.
 */
export function Switch({ label, description, id, className, ...rest }: SwitchProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const descriptionId = description ? `${inputId}-description` : undefined;
  return (
    <div className={[styles.switch, className].filter(Boolean).join(' ')}>
      <span className={styles.control}>
        <input
          id={inputId}
          type="checkbox"
          role="switch"
          className={styles.input}
          aria-describedby={descriptionId}
          {...rest}
        />
        <span className={styles.track} aria-hidden="true">
          <span className={styles.thumb} />
        </span>
      </span>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
      {description && (
        <p id={descriptionId} className={styles.description}>
          {description}
        </p>
      )}
    </div>
  );
}
