import { forwardRef, useId, type ReactNode, type SelectHTMLAttributes } from 'react';

import control from '../FormField/controlStyles.module.css';
import { FormField } from '../FormField';
import { Icon } from '../Icon';
import type { FieldSize } from '../TextField';
import styles from './Select.module.css';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: ReactNode;
  description?: ReactNode;
  error?: string;
  /** Options to render. Or pass <option>/<optgroup> children. */
  options?: SelectOption[];
  /** Text shown while nothing is selected, e.g. "Choose a type". */
  placeholder?: string;
  size?: FieldSize;
  /** Icon at the start. */
  leadingIcon?: ReactNode;
  /** Class for the outer wrapper. Use it to set the width. */
  className?: string;
}

/**
 * Pick one value from a list, e.g. "Account type". Uses the native <select>, so it's
 * keyboard- and screen-reader-friendly and opens the phone's picker on mobile.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    label,
    description,
    error,
    options,
    placeholder,
    size = 'medium',
    leadingIcon,
    required,
    disabled,
    id,
    className,
    style,
    children,
    'aria-describedby': ariaDescribedBy,
    ...rest
  },
  ref,
) {
  const autoId = useId();
  const selectId = id ?? autoId;
  const messageId = `${selectId}-message`;
  const describedBy =
    [ariaDescribedBy, error ?? description ? messageId : undefined].filter(Boolean).join(' ') || undefined;
  // With a placeholder and no value, start on the placeholder.
  const defaultValue = rest.value === undefined && rest.defaultValue === undefined && placeholder ? '' : rest.defaultValue;

  return (
    <FormField
      label={label}
      htmlFor={selectId}
      required={required}
      description={description}
      error={error}
      messageId={messageId}
      className={className}
      style={style}
    >
      <div
        className={[control.control, control[size], styles.control, styles[size], error && control.invalid, disabled && control.disabled]
          .filter(Boolean)
          .join(' ')}
      >
        {leadingIcon && <span className={control.adornment}>{leadingIcon}</span>}
        <select
          {...rest}
          defaultValue={defaultValue}
          ref={ref}
          id={selectId}
          required={required}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={[control.input, styles.select].join(' ')}
        >
          {placeholder && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}
          {options?.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
          {children}
        </select>
        <span className={styles.chevron} aria-hidden="true">
          <Icon name="chevronDown" size={16} />
        </span>
      </div>
    </FormField>
  );
});
