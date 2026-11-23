import type { ReactNode } from 'react';

import { Card, type CardProps } from '../Card';
import { Title } from '../Title';
import styles from './ChartCard.module.css';

export interface ChartStat {
  label: ReactNode;
  /** Already formatted, e.g. "RWF 1.6K". */
  value: ReactNode;
  /** positive = green (money in), negative = red (money out), neutral = dark. */
  tone?: 'positive' | 'negative' | 'neutral';
}

export interface ChartCardProps extends Omit<CardProps, 'title' | 'children'> {
  /** e.g. "Transaction volume". */
  title: ReactNode;
  /** e.g. "Money in is everything received, money out is everything sent...". */
  description?: ReactNode;
  /** Controls on the right of the title, e.g. a DateRangePicker. */
  actions?: ReactNode;
  /** Headline numbers between the title and the chart. */
  stats?: ChartStat[];
  /** The chart (BarChart or any other). */
  children: ReactNode;
}

/** Card for a chart: section title, headline numbers, the chart. As in "Transaction volume". */
export function ChartCard({ title, description, actions, stats = [], children, className, ...cardProps }: ChartCardProps) {
  return (
    <Card {...cardProps} as="section" className={[styles.card, className].filter(Boolean).join(' ')}>
      <Title size="section" title={title} description={description} actions={actions} />
      {stats.length > 0 && (
        <dl className={styles.stats}>
          {stats.map((stat, index) => (
            <div key={index} className={styles.stat}>
              <dt className={styles.statLabel}>{stat.label}</dt>
              <dd className={[styles.statValue, styles[stat.tone ?? 'neutral']].join(' ')}>{stat.value}</dd>
            </div>
          ))}
        </dl>
      )}
      <div className={styles.chart}>{children}</div>
    </Card>
  );
}
