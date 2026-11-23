import type { HTMLAttributes, ReactNode } from 'react';

import styles from './IconTile.module.css';

/** Same values as Flutter `AppIconTileTone`. */
export type IconTileTone = 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
/** 32, 40 or 64 px. Same values as Flutter `AppIconTileSize`. */
export type IconTileSize = 'small' | 'medium' | 'large';

export interface IconTileProps extends HTMLAttributes<HTMLSpanElement> {
  /** The icon, e.g. `<Icon name="mail" />`. It's resized to fit the tile. */
  children: ReactNode;
  tone?: IconTileTone;
  size?: IconTileSize;
}

/** Icon on a tinted rounded square, as on the stat cards and the "Verify your email" card. */
export function IconTile({ children, tone = 'primary', size = 'small', className, ...rest }: IconTileProps) {
  return (
    <span
      aria-hidden="true"
      {...rest}
      className={[styles.tile, styles[tone], styles[size], className].filter(Boolean).join(' ')}
    >
      {children}
    </span>
  );
}
