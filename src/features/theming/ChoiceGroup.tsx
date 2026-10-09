import { useId, type ReactNode } from 'react';
import styles from './ChoiceGroup.module.css';

export interface Choice<T extends string> {
  value: T;
  label: ReactNode;
}

export interface ChoiceGroupProps<T extends string> {
  /** Visible group label; also the radio group's accessible name. */
  legend: string;
  value: T;
  options: readonly Choice<T>[];
  onChange: (value: T) => void;
}

/**
 * One choice from a few, shown as joined segments over native radio buttons: Tab enters the
 * group once, arrow keys move and select, and the browser supplies the semantics.
 */
export function ChoiceGroup<T extends string>({ legend, value, options, onChange }: ChoiceGroupProps<T>) {
  const name = useId();
  return (
    <fieldset className={styles.group}>
      <legend className={styles.legend}>{legend}</legend>
      <div className={styles.segments}>
        {options.map((option) => (
          <label key={option.value} className={styles.segment}>
            <input
              type="radio"
              className={styles.radio}
              name={name}
              value={option.value}
              checked={option.value === value}
              onChange={() => onChange(option.value)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
