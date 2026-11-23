import { useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';

import styles from './BarChart.module.css';
import { chartTicks, compactNumber } from './chartScale';

export interface ChartSeries {
  /** Property of each datum holding this series' value. */
  key: string;
  /** Legend and tooltip name, e.g. "Money in". */
  label: string;
  /** Any CSS colour. Defaults to the chart palette (--kayko-chart-1, -2, ...). */
  color?: string;
}

export interface BarChartProps<Datum extends Record<string, unknown>> {
  data: Datum[];
  /** Property holding each group's label on the x axis, e.g. "date". */
  categoryKey: keyof Datum & string;
  series: ChartSeries[];
  /** Stack the series in one bar instead of side by side. */
  stacked?: boolean;
  /** Plot height in px (without legend). */
  height?: number;
  /** Formats values in the tooltip, e.g. (v) => `RWF ${v.toLocaleString()}`. */
  formatValue?: (value: number) => string;
  /** Formats y-axis ticks. Default: compact numbers (1.6K). */
  formatTick?: (value: number) => string;
  /** Tooltip heading. Default: the category label. */
  formatCategory?: (category: string) => string;
  showLegend?: boolean;
  showGrid?: boolean;
  /** Widest a single bar may get, in px. */
  maxBarWidth?: number;
  /** Shown when `data` is empty. */
  emptyState?: ReactNode;
  /** Accessible summary, e.g. "Money in and out per day, 10 to 19 November". */
  'aria-label': string;
  className?: string;
}

const AXIS_WIDTH = 48;
const X_LABEL_HEIGHT = 28;
const PALETTE = ['var(--kayko-chart-1)', 'var(--kayko-chart-2)', 'var(--kayko-chart-3)', 'var(--kayko-chart-4)', 'var(--kayko-chart-5)'];

/** Bars per category, grouped or stacked, with hover tooltip, legend and keyboard support. */
export function BarChart<Datum extends Record<string, unknown>>({
  data,
  categoryKey,
  series,
  stacked = false,
  height = 240,
  formatValue = (value) => value.toLocaleString(),
  formatTick = compactNumber,
  formatCategory = (category) => category,
  showLegend = true,
  showGrid = true,
  maxBarWidth = 24,
  emptyState = 'No data for this period',
  'aria-label': ariaLabel,
  className,
}: BarChartProps<Datum>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(640);
  const [active, setActive] = useState<number | null>(null);
  const descriptionId = useId();

  useLayoutEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry!.contentRect.width));
    observer.observe(element);
    setWidth(element.clientWidth);
    return () => observer.disconnect();
  }, []);

  const colors = series.map((s, i) => s.color ?? PALETTE[i % PALETTE.length]!);
  const value = (datum: Datum, key: string) => Number(datum[key] ?? 0) || 0;
  const totals = data.map((datum) =>
    stacked ? series.reduce((sum, s) => sum + value(datum, s.key), 0) : Math.max(0, ...series.map((s) => value(datum, s.key))),
  );
  const ticks = chartTicks(Math.max(0, ...totals));
  const top = ticks[ticks.length - 1]!;

  const plotLeft = AXIS_WIDTH;
  const plotWidth = Math.max(0, width - plotLeft);
  const band = data.length ? plotWidth / data.length : plotWidth;
  const y = (v: number) => height - (v / top) * height;
  const groupWidth = Math.min(band * 0.6, stacked ? maxBarWidth * 1.5 : (maxBarWidth + 2) * series.length);
  const barWidth = stacked ? groupWidth : Math.max(2, (groupWidth - 2 * (series.length - 1)) / series.length);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!data.length) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      const delta = event.key === 'ArrowRight' ? 1 : -1;
      setActive((current) => (current === null ? 0 : (current + delta + data.length) % data.length));
    } else if (event.key === 'Escape') {
      setActive(null);
    }
  }

  const activeDatum = active !== null ? data[active] : undefined;
  const tooltipLeft = active !== null ? plotLeft + band * active + band / 2 : 0;
  const tooltipOnLeft = tooltipLeft > width - 220;

  return (
    <figure className={[styles.figure, className].filter(Boolean).join(' ')}>
      <figcaption className={styles.srOnly}>{ariaLabel}</figcaption>
      <div
        ref={containerRef}
        className={styles.plot}
        style={{ height: height + X_LABEL_HEIGHT }}
        tabIndex={data.length ? 0 : -1}
        role="group"
        aria-label={`${ariaLabel}. Use the left and right arrow keys to read each value.`}
        aria-describedby={descriptionId}
        onKeyDown={handleKeyDown}
        onMouseLeave={() => setActive(null)}
        onBlur={() => setActive(null)}
      >
        {data.length === 0 ? (
          <div className={styles.empty}>{emptyState}</div>
        ) : (
          <svg width={width} height={height + X_LABEL_HEIGHT} aria-hidden="true" className={styles.svg}>
            {/* hover column */}
            {active !== null && (
              <rect x={plotLeft + band * active} y={0} width={band} height={height} className={styles.hoverColumn} />
            )}
            {/* grid + y ticks */}
            {ticks.map((tick) => (
              <g key={tick}>
                {showGrid && <line x1={plotLeft} x2={width} y1={y(tick)} y2={y(tick)} className={styles.gridLine} />}
                <text x={plotLeft - 12} y={y(tick)} className={styles.tick} textAnchor="end" dominantBaseline="middle">
                  {formatTick(tick)}
                </text>
              </g>
            ))}
            {/* bars */}
            {data.map((datum, index) => {
              const groupLeft = plotLeft + band * index + (band - groupWidth) / 2;
              let stackBase = 0;
              return (
                <g key={String(datum[categoryKey])} onMouseEnter={() => setActive(index)}>
                  <rect x={plotLeft + band * index} y={0} width={band} height={height} fill="transparent" />
                  {series.map((s, si) => {
                    const v = value(datum, s.key);
                    if (v <= 0) return null;
                    const barHeight = (v / top) * height;
                    const x = stacked ? groupLeft : groupLeft + si * (barWidth + 2);
                    const yTop = stacked ? y(stackBase + v) : y(v);
                    const isTop = !stacked || si === series.length - 1 || series.slice(si + 1).every((n) => value(datum, n.key) <= 0);
                    stackBase += stacked ? v : 0;
                    const r = isTop ? Math.min(3, barWidth / 2, barHeight) : 0;
                    return (
                      <path
                        key={s.key}
                        d={`M${x},${yTop + barHeight} V${yTop + r} Q${x},${yTop} ${x + r},${yTop} H${x + barWidth - r} Q${x + barWidth},${yTop} ${x + barWidth},${yTop + r} V${yTop + barHeight} Z`}
                        fill={colors[si]}
                      />
                    );
                  })}
                  <text x={plotLeft + band * index + band / 2} y={height + 20} className={styles.xLabel} textAnchor="middle">
                    {String(datum[categoryKey])}
                  </text>
                </g>
              );
            })}
          </svg>
        )}
        {activeDatum && (
          <div
            className={styles.tooltip}
            style={{
              left: tooltipOnLeft ? undefined : tooltipLeft + 16,
              right: tooltipOnLeft ? width - tooltipLeft + 16 : undefined,
              top: Math.max(0, height / 2 - 40),
            }}
          >
            <div className={styles.tooltipTitle}>{formatCategory(String(activeDatum[categoryKey]))}</div>
            {series.map((s, si) => (
              <div key={s.key} className={styles.tooltipRow}>
                <span className={styles.dot} style={{ background: colors[si] }} />
                <span className={styles.tooltipLabel}>{s.label}</span>
                <span className={styles.tooltipValue}>{formatValue(value(activeDatum, s.key))}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div id={descriptionId} className={styles.srOnly} aria-live="polite">
        {activeDatum
          ? `${formatCategory(String(activeDatum[categoryKey]))}: ${series
              .map((s) => `${s.label} ${formatValue(value(activeDatum, s.key))}`)
              .join(', ')}`
          : ''}
      </div>
      {showLegend && series.length > 0 && (
        <ul className={styles.legend}>
          {series.map((s, si) => (
            <li key={s.key} className={styles.legendItem}>
              <span className={styles.swatch} style={{ background: colors[si] }} />
              {s.label}
            </li>
          ))}
        </ul>
      )}
      {/* Full data for screen readers */}
      <table className={styles.srOnly}>
        <caption>{ariaLabel}</caption>
        <thead>
          <tr>
            <th scope="col">{categoryKey}</th>
            {series.map((s) => (
              <th key={s.key} scope="col">
                {s.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((datum) => (
            <tr key={String(datum[categoryKey])}>
              <th scope="row">{String(datum[categoryKey])}</th>
              {series.map((s) => (
                <td key={s.key}>{formatValue(value(datum, s.key))}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
