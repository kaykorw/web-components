import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

import styles from './Card.module.css';

/** Same values as Flutter `AppCardVariant`. */
export type CardVariant = 'elevated' | 'outlined' | 'flat';
/** Inner padding: 0, 16, 20 or 24 px. Same values as Flutter `AppCardPadding`. */
export type CardPadding = 'none' | 'small' | 'medium' | 'large';

export interface CardProps extends HTMLAttributes<HTMLElement> {
  /** elevated: border + soft shadow (stat cards). outlined: border only (tables). flat: grey, no border. */
  variant?: CardVariant;
  padding?: CardPadding;
  /** Hover and press styles, for cards that act as a link or button (pass onClick or wrap in <a>). */
  interactive?: boolean;
  /** HTML element to render, e.g. "section" or "article". */
  as?: 'div' | 'section' | 'article' | 'aside' | 'li';
  children?: ReactNode;
}

/** Container with Kayko's card surface. Put anything inside: Title, StatCard content, a Table... */
export const Card = forwardRef<HTMLElement, CardProps>(function Card(
  { variant = 'elevated', padding = 'large', interactive = false, as: Tag = 'div', className, children, ...rest },
  ref,
) {
  return (
    <Tag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- polymorphic element ref
      ref={ref as any}
      {...rest}
      className={[styles.card, styles[variant], styles[`pad-${padding}`], interactive && styles.interactive, className]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </Tag>
  );
});
