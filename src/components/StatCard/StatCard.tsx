import type { ReactNode } from 'react';

import { Card, type CardProps } from '../Card';
import { Icon } from '../Icon';
import { IconTile, type IconTileTone } from '../IconTile';
import styles from './StatCard.module.css';

/** Same values as Flutter `AppTrendDirection`. */
export type TrendDirection = 'up' | 'down' | 'flat';

export interface StatTrend {
  /** Text next to the arrow, e.g. "+12%". */
  value: string;
  direction: TrendDirection;
  /** Colour meaning. By default up = positive (green), down = negative (red). Set to flip it, e.g. for costs. */
  sentiment?: 'positive' | 'negative' | 'neutral';
  /** Text after the value, e.g. "vs last week". */
  label?: string;
}

export interface StatCardProps extends Omit<CardProps, 'children' | 'title'> {
  /** Name of the metric, e.g. "Money in". */
  label: ReactNode;
  /** The number, already formatted, e.g. "RWF 1,615". */
  value: ReactNode;
  /** Explanation under the value, e.g. "Credits posted to your accounts". */
  caption?: ReactNode;
  /** Icon in the tile, e.g. `<Icon name="arrowDownToLine" />`. */
  icon?: ReactNode;
  iconTone?: IconTileTone;
  /** Optional change indicator under the value. */
  trend?: StatTrend;
  /** Shows placeholders while the value loads. */
  loading?: boolean;
}

/** Metric card: icon, label, big value, caption (e.g. "Money in / RWF 1,615"). */
export function StatCard({
  label,
  value,
  caption,
  icon,
  iconTone = 'primary',
  trend,
  loading = false,
  className,
  ...cardProps
}: StatCardProps) {
  const sentiment =
    trend?.sentiment ?? (trend?.direction === 'up' ? 'positive' : trend?.direction === 'down' ? 'negative' : 'neutral');
  return (
    <Card {...cardProps} className={[styles.card, className].filter(Boolean).join(' ')} aria-busy={loading || undefined}>
      <div className={styles.header}>
        {icon && <IconTile tone={iconTone}>{icon}</IconTile>}
        <span className={styles.label}>{label}</span>
      </div>
      {loading ? (
        <span className={[styles.skeleton, styles.valueSkeleton].join(' ')} />
      ) : (
        <span className={styles.value}>{value}</span>
      )}
      {trend && !loading && (
        <span className={[styles.trend, styles[sentiment]].join(' ')}>
          {trend.direction !== 'flat' && <Icon name={trend.direction === 'up' ? 'arrowUp' : 'arrowDown'} size={14} />}
          {trend.value}
          {trend.label && <span className={styles.trendLabel}>{trend.label}</span>}
        </span>
      )}
      {caption &&
        (loading ? (
          <span className={[styles.skeleton, styles.captionSkeleton].join(' ')} />
        ) : (
          <span className={styles.caption}>{caption}</span>
        ))}
    </Card>
  );
}
