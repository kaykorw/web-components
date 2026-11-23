import type { HTMLAttributes, ReactNode } from 'react';

import styles from './StatusBadge.module.css';

/** Same values as Flutter `AppBadgeTone`. */
export type BadgeTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';
/** Same values as Flutter `AppBadgeSize`. */
export type BadgeSize = 'small' | 'medium';

export interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Colour meaning: success ("ACTIVE"), warning ("Parent"), danger, info, neutral. */
  tone?: BadgeTone;
  /** Coloured dot before the label, for live states such as "ACTIVE". */
  dot?: boolean;
  /** Optional icon before the label (instead of a dot). */
  icon?: ReactNode;
  /** small = 18 px, medium = 20 px high. */
  size?: BadgeSize;
  /** Badge text. Casing is up to you ("ACTIVE", "Parent"). */
  children: ReactNode;
}

export function StatusBadge({
  tone = 'neutral',
  dot = false,
  icon,
  size = 'medium',
  className,
  children,
  ...rest
}: StatusBadgeProps) {
  return (
    <span {...rest} className={[styles.badge, styles[tone], styles[size], className].filter(Boolean).join(' ')}>
      {dot && <span className={styles.dot} aria-hidden="true" />}
      {!dot && icon && <span className={styles.icon}>{icon}</span>}
      {children}
    </span>
  );
}
