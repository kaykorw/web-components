import type { HTMLAttributes, ReactNode } from 'react';

import styles from './FormField.module.css';

export interface FormFieldProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Field label, e.g. "Account name". */
  label?: ReactNode;
  /** id of the control the label points to. */
  htmlFor?: string;
  /** Shows a red asterisk after the label. Also set `required` on the control itself. */
  required?: boolean;
  /** Helper text under the control. */
  description?: ReactNode;
  /** Error message under the control. Replaces the description. */
  error?: ReactNode;
  /** id for the description/error text, so the control can reference it with aria-describedby. */
  messageId?: string;
  /** Right side of the label row, e.g. a character counter or a "Forgot password?" link. */
  labelAside?: ReactNode;
  children: ReactNode;
}

/**
 * Label + control + helper or error text. TextField, Textarea and Select use it;
 * wrap any custom control (DatePicker, VerificationCodeInput...) with it for the same layout.
 */
export function FormField({
  label,
  htmlFor,
  required,
  description,
  error,
  messageId,
  labelAside,
  className,
  children,
  ...rest
}: FormFieldProps) {
  const message = error ?? description;
  return (
    <div {...rest} className={[styles.field, className].filter(Boolean).join(' ')}>
      {(label || labelAside) && (
        <div className={styles.labelRow}>
          {label && (
            <label htmlFor={htmlFor} className={styles.label}>
              {label}
              {required && (
                <span className={styles.required} aria-hidden="true">
                  *
                </span>
              )}
            </label>
          )}
          {labelAside && <span className={styles.aside}>{labelAside}</span>}
        </div>
      )}
      {children}
      {message && (
        <span id={messageId} className={error ? styles.error : styles.description}>
          {message}
        </span>
      )}
    </div>
  );
}
