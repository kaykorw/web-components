import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

import styles from './Button.module.css';

/** Same values as Flutter `AppButtonVariant`. */
export type ButtonVariant = 'primary' | 'secondary' | 'danger';
/** Same values as Flutter `AppButtonSize`. */
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style. Use one primary button per view. */
  variant?: ButtonVariant;
  /** Height and padding: 32, 40 or 48 px. */
  size?: ButtonSize;
  /** Shows a spinner, keeps the button's width and ignores clicks. The button stays focusable. */
  loading?: boolean;
  /** Blocks interaction and greys the button out. */
  disabled?: boolean;
  /** Button label. Keep it short: a verb, sentence case. */
  children: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'medium',
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
  const classes = [styles.button, styles[variant], styles[size], loading && styles.loading, className]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      {...rest}
      ref={ref}
      type={type}
      className={classes}
      disabled={disabled}
      // While loading the button keeps focus (aria-disabled instead of disabled),
      // so keyboard users don't lose their place after pressing it.
      aria-disabled={loading || undefined}
      aria-busy={loading || undefined}
      onClick={loading ? undefined : onClick}
    >
      <span className={styles.label}>{children}</span>
      {loading && <span className={styles.spinner} aria-hidden="true" />}
    </button>
  );
});
