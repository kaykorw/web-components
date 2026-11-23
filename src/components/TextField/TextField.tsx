import {
  forwardRef,
  useCallback,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';

import control from '../FormField/controlStyles.module.css';
import { FormField } from '../FormField';
import { Icon } from '../Icon';

/** 32 / 40 / 48 px. Same values as Flutter `AppFieldSize`. */
export type FieldSize = 'small' | 'medium' | 'large';

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  /** Label above the field, e.g. "Account name". Without it, pass `aria-label`. */
  label?: ReactNode;
  /** Helper text under the field. */
  description?: ReactNode;
  /** Error message. Turns the border red and marks the input invalid. */
  error?: string;
  /** Icon at the start, e.g. `<Icon name="search" />`. */
  leadingIcon?: ReactNode;
  /** Icon or small button at the end. */
  trailing?: ReactNode;
  /** Fixed text before the value, e.g. "RWF". */
  prefix?: ReactNode;
  /** Fixed text after the value, e.g. "%". */
  suffix?: ReactNode;
  /** Shows an × button while there's a value. Fires onChange with an empty value, then onClear. */
  clearable?: boolean;
  onClear?: () => void;
  size?: FieldSize;
  /** Class for the outer wrapper (label + field + message). Use it to set the width. */
  className?: string;
  /** Class for the input element itself. */
  inputClassName?: string;
}

// Guarded so the module also loads during server rendering.
const setNativeValue =
  typeof HTMLInputElement === 'undefined'
    ? undefined
    : Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;

/** Single-line text input with Kayko's field styling. All native input props work. */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  {
    label,
    description,
    error,
    leadingIcon,
    trailing,
    prefix,
    suffix,
    clearable = false,
    onClear,
    size = 'medium',
    required,
    disabled,
    id,
    className,
    inputClassName,
    style,
    onChange,
    'aria-describedby': ariaDescribedBy,
    ...rest
  },
  forwardedRef,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const messageId = `${inputId}-message`;
  const hasMessage = !!(error ?? description);
  const innerRef = useRef<HTMLInputElement | null>(null);
  const [uncontrolledHasValue, setUncontrolledHasValue] = useState(
    () => rest.defaultValue !== undefined && String(rest.defaultValue) !== '',
  );
  const hasValue = rest.value !== undefined ? String(rest.value) !== '' : uncontrolledHasValue;

  const setRefs = useCallback(
    (node: HTMLInputElement | null) => {
      innerRef.current = node;
      if (typeof forwardedRef === 'function') forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    },
    [forwardedRef],
  );

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setUncontrolledHasValue(event.target.value !== '');
    onChange?.(event);
  }

  function clear() {
    const input = innerRef.current;
    if (!input) return;
    // Goes through React's onChange so controlled and uncontrolled fields both update.
    setNativeValue?.call(input, '');
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.focus();
    onClear?.();
  }

  const describedBy = [ariaDescribedBy, hasMessage ? messageId : undefined].filter(Boolean).join(' ') || undefined;

  return (
    <FormField
      label={label}
      htmlFor={inputId}
      required={required}
      description={description}
      error={error}
      messageId={messageId}
      className={className}
      style={style}
    >
      <div
        className={[control.control, control[size], error && control.invalid, disabled && control.disabled]
          .filter(Boolean)
          .join(' ')}
        onMouseDown={(event) => {
          // Clicking the padding or an icon focuses the input.
          if (event.target === event.currentTarget) {
            event.preventDefault();
            innerRef.current?.focus();
          }
        }}
      >
        {leadingIcon && <span className={control.adornment}>{leadingIcon}</span>}
        {prefix && <span className={control.affix}>{prefix}</span>}
        <input
          {...rest}
          ref={setRefs}
          id={inputId}
          required={required}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={[control.input, inputClassName].filter(Boolean).join(' ')}
          onChange={handleChange}
        />
        {suffix && <span className={control.affix}>{suffix}</span>}
        {clearable && hasValue && !disabled && (
          <button type="button" className={control.clear} aria-label="Clear" onClick={clear}>
            <Icon name="close" size={14} />
          </button>
        )}
        {trailing && <span className={control.adornment}>{trailing}</span>}
      </div>
    </FormField>
  );
});
