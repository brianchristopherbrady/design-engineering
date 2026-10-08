import { useId, type ReactNode } from 'react';
import styles from './Field.module.css';

/** Props Field hands to its control. Spread them onto Input, Select or a native control. */
export interface FieldControlProps {
  id: string;
  'aria-describedby'?: string;
  'aria-invalid'?: true;
  required?: boolean;
}

export interface FieldProps {
  /** Visible label. Clicking it focuses the control. */
  label: ReactNode;
  /** Hint shown below the label and announced with the control. */
  description?: ReactNode;
  /** Error message. When present the control is marked invalid and the message is announced with it. */
  error?: ReactNode;
  /** Marks the control required and shows a visual "(required)" note. */
  required?: boolean;
  /** Control id. Generated when omitted. */
  id?: string;
  className?: string;
  /** Render function that receives the wiring for one control. */
  children: (control: FieldControlProps) => ReactNode;
}

/**
 * Associates one control with its label, description and error.
 * The render-function child keeps that wiring visible at the call site.
 */
export function Field({ label, description, error, required = false, id, className, children }: FieldProps) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const descriptionId = description ? `${controlId}-description` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;
  const describedBy = [descriptionId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={[styles.field, className].filter(Boolean).join(' ')}>
      <label htmlFor={controlId} className={styles.label}>
        {label}
        {required && (
          <span className={styles.required} aria-hidden="true">
            {' '}
            (required)
          </span>
        )}
      </label>
      {description && (
        <p id={descriptionId} className={styles.description}>
          {description}
        </p>
      )}
      {children({
        id: controlId,
        'aria-describedby': describedBy,
        'aria-invalid': error ? true : undefined,
        required: required || undefined,
      })}
      {error && (
        <p id={errorId} className={styles.error}>
          <svg className={styles.errorIcon} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 4.5v4.5M8 11v.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
