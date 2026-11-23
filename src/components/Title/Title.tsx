import type { HTMLAttributes, ReactNode } from 'react';

import styles from './Title.module.css';

/** Same values as Flutter `AppTitleSize`. */
export type TitleSize = 'page' | 'section' | 'card';

export interface TitleProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Heading text, e.g. "Accounts". */
  title: ReactNode;
  /** Text under the heading, e.g. "Manage accounts." */
  description?: ReactNode;
  /** Buttons or inputs on the right, e.g. search, Filters, New account. Wraps under the title on narrow screens. */
  actions?: ReactNode;
  /** Something before the title, e.g. a back button or an IconTile. */
  leading?: ReactNode;
  /** page = 24 px (page header), section = 18 px (card/chart header), card = 16 px. */
  size?: TitleSize;
  /** Heading level for screen readers. Defaults: page = 1, section = 2, card = 3. */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

const defaultLevel: Record<TitleSize, 1 | 2 | 3> = { page: 1, section: 2, card: 3 };

/** Page or section heading with an optional description and actions, as on the Accounts page. */
export function Title({ title, description, actions, leading, size = 'page', level, className, ...rest }: TitleProps) {
  const Heading = `h${level ?? defaultLevel[size]}` as const;
  return (
    <div {...rest} className={[styles.root, styles[size], className].filter(Boolean).join(' ')}>
      <div className={styles.main}>
        {leading && <div className={styles.leading}>{leading}</div>}
        <div className={styles.text}>
          <Heading className={styles.heading}>{title}</Heading>
          {description && <p className={styles.description}>{description}</p>}
        </div>
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  );
}
