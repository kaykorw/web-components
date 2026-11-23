import {
  createContext,
  forwardRef,
  useContext,
  useId,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';

import styles from './Radio.module.css';

interface GroupContextValue {
  name: string;
  value: string | undefined;
  disabled: boolean;
  invalid: boolean;
  onSelect: (value: string) => void;
}

const GroupContext = createContext<GroupContextValue | null>(null);

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  /** Value sent to the group's onChange. */
  value: string;
  /** Text next to the circle. Clicking it selects the option. */
  label?: ReactNode;
  /** Helper text under the label. */
  description?: ReactNode;
}

/** One option. Use inside a RadioGroup, or alone with native `name`/`checked`/`onChange`. */
export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { value, label, description, disabled, id, className, onChange, ...rest },
  ref,
) {
  const group = useContext(GroupContext);
  const autoId = useId();
  const inputId = id ?? autoId;
  const descriptionId = description ? `${inputId}-description` : undefined;
  const isDisabled = disabled || group?.disabled;
  const groupProps = group
    ? { name: group.name, checked: group.value === value, onChange: () => group.onSelect(value) }
    : { onChange };

  return (
    <div
      className={[styles.option, isDisabled && styles.disabled, group?.invalid && styles.invalid, className]
        .filter(Boolean)
        .join(' ')}
    >
      <span className={styles.control}>
        <input
          {...rest}
          {...groupProps}
          ref={ref}
          id={inputId}
          type="radio"
          value={value}
          disabled={isDisabled}
          className={styles.input}
          aria-describedby={descriptionId}
        />
        <span className={styles.circle} aria-hidden="true" />
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
    </div>
  );
});

export interface RadioOption {
  value: string;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps {
  /** Group label (rendered as the fieldset legend). Pass `aria-label` instead to hide it. */
  label?: ReactNode;
  /** Options to render. Or pass <Radio> children for custom layouts. */
  options?: RadioOption[];
  children?: ReactNode;
  /** Selected value (controlled). */
  value?: string;
  /** Initially selected value (uncontrolled). */
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Form field name. Generated if omitted. */
  name?: string;
  orientation?: 'vertical' | 'horizontal';
  disabled?: boolean;
  /** Error message under the options. */
  error?: string;
  'aria-label'?: string;
  className?: string;
}

/** A set of mutually exclusive options, e.g. the Status filter (ACTIVE / INACTIVE). */
export function RadioGroup({
  label,
  options,
  children,
  value,
  defaultValue,
  onChange,
  name,
  orientation = 'vertical',
  disabled = false,
  error,
  className,
  'aria-label': ariaLabel,
}: RadioGroupProps) {
  const autoName = useId();
  const errorId = useId();
  const [internal, setInternal] = useState(defaultValue);
  const selected = value !== undefined ? value : internal;

  const context: GroupContextValue = {
    name: name ?? autoName,
    value: selected,
    disabled,
    invalid: !!error,
    onSelect: (next) => {
      if (value === undefined) setInternal(next);
      onChange?.(next);
    },
  };

  return (
    <fieldset
      className={[styles.group, className].filter(Boolean).join(' ')}
      aria-label={ariaLabel}
      aria-describedby={error ? errorId : undefined}
      aria-invalid={error ? true : undefined}
      disabled={disabled}
    >
      {label && <legend className={styles.legend}>{label}</legend>}
      <div className={[styles.options, styles[orientation]].join(' ')} role="presentation">
        <GroupContext.Provider value={context}>
          {options?.map((option) => (
            <Radio
              key={option.value}
              value={option.value}
              label={option.label}
              description={option.description}
              disabled={option.disabled}
            />
          ))}
          {children}
        </GroupContext.Provider>
      </div>
      {error && (
        <span id={errorId} className={styles.error}>
          {error}
        </span>
      )}
    </fieldset>
  );
}
