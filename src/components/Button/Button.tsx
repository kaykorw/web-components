import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

import styles from './Button.module.css';

/** Same values as Flutter `AppButtonVariant`. */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'link' | 'danger';
/** Same values as Flutter `AppButtonSize`. */
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * primary: main action ("New account"). secondary: white with a border ("Filters", "Cancel").
   * ghost: no border ("Reset"). link: text only ("Back to login"). danger: destructive.
   */
  variant?: ButtonVariant;
  /** Height: 32, 40 or 48 px. */
  size?: ButtonSize;
  /** Icon before the label, e.g. `<Icon name="plus" />`. */
  leadingIcon?: ReactNode;
  /** Icon after the label, e.g. `<Icon name="chevronDown" />`. */
  trailingIcon?: ReactNode;
  /** Square button showing only `children` as the icon. Requires `aria-label`. */
  iconOnly?: boolean;
  /** Stretch to the width of the container. */
  fullWidth?: boolean;
  /** Toggle state, e.g. a "Filters" button while its popover is open. Sets `aria-pressed`. */
  selected?: boolean;
  /** Shows a spinner, keeps the width, ignores clicks. Stays focusable. */
  loading?: boolean;
  disabled?: boolean;
  children?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'medium',
    leadingIcon,
    trailingIcon,
    iconOnly = false,
    fullWidth = false,
    selected,
    loading = false,
    disabled = false,
    type = 'button',
    className,
    children,
    onClick,
    ...rest
  },
  ref,
) {
  const classes = [
    styles.button,
    styles[variant],
    styles[size],
    iconOnly && styles.iconOnly,
    fullWidth && styles.fullWidth,
    selected && styles.selected,
    loading && styles.loading,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      {...rest}
      ref={ref}
      type={type}
      className={classes}
      disabled={disabled}
      aria-pressed={selected}
      aria-disabled={loading || undefined}
      aria-busy={loading || undefined}
      onClick={loading ? undefined : onClick}
    >
      <span className={styles.content}>
        {leadingIcon && <span className={styles.icon}>{leadingIcon}</span>}
        {iconOnly ? <span className={styles.icon}>{children}</span> : children}
        {trailingIcon && <span className={styles.icon}>{trailingIcon}</span>}
      </span>
      {loading && <span className={styles.spinner} aria-hidden="true" />}
    </button>
  );
});
