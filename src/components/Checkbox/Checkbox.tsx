import {
    forwardRef,
    useCallback,
    useId,
    useLayoutEffect,
    useRef,
    type InputHTMLAttributes,
    type ReactNode,
  } from 'react';
  
  import styles from './Checkbox.module.css';
  
  export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
    /** Text next to the box. Clicking it toggles the checkbox. Without a label, pass `aria-label`. */
    label?: ReactNode;
    /** Helper text under the label. Read by screen readers after the label. */
    description?: ReactNode;
    /** Shows a dash: some, but not all, children are selected. Clicking it checks the box. */
    indeterminate?: boolean;
    /** Error message. Turns the box red and marks the input invalid. */
    error?: string;
  }
  
  /**
   * Native `<input type="checkbox">` underneath, so `checked`/`defaultChecked`,
   * `onChange`, `name`, `value`, `required` and form libraries (react-hook-form's
   * `register`) work as usual.
   */
  export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
    {
      label,
      description,
      indeterminate = false,
      error,
      disabled,
      id,
      className,
      'aria-describedby': ariaDescribedBy,
      'aria-invalid': ariaInvalid,
      ...inputProps
    },
    forwardedRef,
  ) {
    const innerRef = useRef<HTMLInputElement | null>(null);
    const autoId = useId();
    const inputId = id ?? autoId;
    const descriptionId = description ? `${inputId}-description` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;
  
    // `indeterminate` only exists as a DOM property, not an HTML attribute.
    // Runs after every render because a click clears it in the DOM.
    useLayoutEffect(() => {
      if (innerRef.current) innerRef.current.indeterminate = indeterminate;
    });
  
    const setRefs = useCallback(
      (node: HTMLInputElement | null) => {
        innerRef.current = node;
        if (typeof forwardedRef === 'function') forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      },
      [forwardedRef],
    );
  
    const describedBy = [ariaDescribedBy, descriptionId, errorId].filter(Boolean).join(' ') || undefined;
    const rootClasses = [styles.root, disabled && styles.disabled, error && styles.invalid, className]
      .filter(Boolean)
      .join(' ');
  
    return (
      <div className={rootClasses}>
        <span className={styles.control}>
          <input
            {...inputProps}
            ref={setRefs}
            id={inputId}
            type="checkbox"
            className={styles.input}
            disabled={disabled}
            aria-invalid={error ? true : ariaInvalid}
            aria-describedby={describedBy}
          />
          <span className={styles.box} aria-hidden="true">
            <svg className={styles.check} viewBox="0 0 16 16" focusable="false">
              <path d="M3.5 8.5l3 3 6-7" />
            </svg>
            <svg className={styles.dash} viewBox="0 0 16 16" focusable="false">
              <path d="M4 8h8" />
            </svg>
          </span>
        </span>
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
          </label>
        )}
        {description && (
          <span id={descriptionId} className={styles.description}>
            {description}
          </span>
        )}
        {error && (
          <span id={errorId} className={styles.error}>
            {error}
          </span>
        )}
      </div>
    );
  });