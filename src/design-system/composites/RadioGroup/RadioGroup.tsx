import { useId, useState, type ReactNode } from 'react';
import styles from './RadioGroup.module.css';

export const radioGroupAppearances = ['list', 'cards'] as const;
export type RadioGroupAppearance = (typeof radioGroupAppearances)[number];

export interface RadioOption<T extends string = string> {
  value: T;
  label: ReactNode;
  /** Secondary text announced with the option. */
  description?: ReactNode;
  disabled?: boolean;
}

export interface RadioGroupOwnProps<T extends string = string> {
  /** Visible group label; the fieldset's accessible name. */
  legend: ReactNode;
  /** Hint announced when the group is entered. */
  description?: ReactNode;
  options: readonly RadioOption<T>[];
  /** Controlled value. Omit with defaultValue for an uncontrolled group. */
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
  /** Form field name. Generated when omitted; set it when the group submits with a form. */
  name?: string;
  /** `list`: plain radios. `cards`: each option is a bordered, selectable card, for options with descriptions. */
  appearance?: RadioGroupAppearance;
  /** Error message. Announced with the group and shown with an icon, not color alone. */
  error?: ReactNode;
  required?: boolean;
  disabled?: boolean;
}

export type RadioGroupProps<T extends string = string> = RadioGroupOwnProps<T>;

export const radioGroupDefaults = { appearance: 'list' } as const satisfies Partial<RadioGroupOwnProps>;

/**
 * One choice from a set, on native radio buttons in a fieldset: Tab enters the group once, arrow
 * keys move and select, and the browser supplies the semantics and forced-colors rendering.
 */
export function RadioGroup<T extends string = string>({
  legend,
  description,
  options,
  value,
  defaultValue,
  onChange,
  name,
  appearance = radioGroupDefaults.appearance,
  error,
  required = false,
  disabled = false,
}: RadioGroupProps<T>) {
  const baseId = useId();
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const selected = value ?? uncontrolled;
  const descriptionId = description ? `${baseId}-description` : undefined;
  const errorId = error ? `${baseId}-error` : undefined;

  return (
    <fieldset
      role="radiogroup"
      className={[styles.group, styles[appearance]].join(' ')}
      aria-describedby={[descriptionId, errorId].filter(Boolean).join(' ') || undefined}
      aria-invalid={error ? true : undefined}
      disabled={disabled}
    >
      <legend className={styles.legend}>
        {legend}
        {required && (
          <span className={styles.required} aria-hidden="true">
            {' '}
            (required)
          </span>
        )}
      </legend>
      {description && (
        <p id={descriptionId} className={styles.description}>
          {description}
        </p>
      )}
      <div className={styles.options}>
        {options.map((option) => {
          const id = `${baseId}-${option.value}`;
          const optionDescriptionId = option.description ? `${id}-description` : undefined;
          return (
            <div key={option.value} className={styles.option} data-checked={selected === option.value || undefined}>
              <input
                id={id}
                type="radio"
                className={styles.radio}
                name={name ?? baseId}
                value={option.value}
                checked={selected === option.value}
                disabled={option.disabled}
                required={required}
                aria-describedby={optionDescriptionId}
                onChange={() => {
                  setUncontrolled(option.value);
                  onChange?.(option.value);
                }}
              />
              <label htmlFor={id} className={styles.label}>
                {option.label}
              </label>
              {option.description && (
                <p id={optionDescriptionId} className={styles.optionDescription}>
                  {option.description}
                </p>
              )}
            </div>
          );
        })}
      </div>
      {error && (
        <p id={errorId} className={styles.error}>
          <svg className={styles.errorIcon} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 4.5v4.5M8 11v.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
          <span>{error}</span>
        </p>
      )}
    </fieldset>
  );
}
