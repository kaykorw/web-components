import { forwardRef, useId, useState, type ChangeEvent, type ReactNode, type TextareaHTMLAttributes } from 'react';

import control from '../FormField/controlStyles.module.css';
import { FormField } from '../FormField';
import styles from './Textarea.module.css';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: ReactNode;
  description?: ReactNode;
  error?: string;
  /** Shows "12 / 200" next to the label. Needs `maxLength`. */
  showCount?: boolean;
  /** vertical (default) lets people drag the height; none fixes it. */
  resize?: 'vertical' | 'none';
  /** Class for the outer wrapper. Use it to set the width. */
  className?: string;
}

/** Multi-line text input with the same styling as TextField. */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  {
    label,
    description,
    error,
    showCount = false,
    resize = 'vertical',
    rows = 4,
    required,
    disabled,
    id,
    className,
    style,
    onChange,
    maxLength,
    'aria-describedby': ariaDescribedBy,
    ...rest
  },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const messageId = `${inputId}-message`;
  const [uncontrolledLength, setUncontrolledLength] = useState(() => String(rest.defaultValue ?? '').length);
  const length = rest.value !== undefined ? String(rest.value).length : uncontrolledLength;

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setUncontrolledLength(event.target.value.length);
    onChange?.(event);
  }

  const describedBy =
    [ariaDescribedBy, error ?? description ? messageId : undefined].filter(Boolean).join(' ') || undefined;

  return (
    <FormField
      label={label}
      htmlFor={inputId}
      required={required}
      description={description}
      error={error}
      messageId={messageId}
      labelAside={showCount && maxLength ? `${length} / ${maxLength}` : undefined}
      className={className}
      style={style}
    >
      <div
        className={[control.control, styles.control, error && control.invalid, disabled && control.disabled]
          .filter(Boolean)
          .join(' ')}
      >
        <textarea
          {...rest}
          ref={ref}
          id={inputId}
          rows={rows}
          required={required}
          disabled={disabled}
          maxLength={maxLength}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={[control.input, styles.textarea, styles[resize]].join(' ')}
          onChange={handleChange}
        />
      </div>
    </FormField>
  );
});
