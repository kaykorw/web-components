import { useEffect, useId, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';

import { Icon } from '../Icon';
import styles from './Calendar.module.css';
import {
  addDays,
  addMonthsClamped,
  clampDay,
  compareDays,
  getMonthWeeks,
  getWeekdayDates,
  isDayDisabled,
  isSameDay,
  monthDiff,
  nextRange,
  orderRange,
  startOfDay,
  startOfMonth,
  toDayKey,
  weekdayIndex,
  type DateRange,
  type WeekStart,
} from './calendarUtils';

export type { DateRange, WeekStart } from './calendarUtils';

/** Same values as Flutter `AppCalendarMode`. */
export type CalendarMode = 'single' | 'range';
/** Day size: 28 px (as in the date range picker), 36 px or 44 px. Same values as Flutter. */
export type CalendarSize = 'small' | 'medium' | 'large';

export interface CalendarLabels {
  previousMonth: string;
  nextMonth: string;
}

// Props are `base & (single | range)`: TypeScript checks that value/onChange match
// `mode`, and Storybook's docgen can still read the shared props.
export interface CalendarBaseProps {
  /** Earliest day that can be picked. */
  minDate?: Date;
  /** Latest day that can be picked (e.g. today, for "no future dates"). */
  maxDate?: Date;
  /** Return true to block a day, e.g. weekends or public holidays. */
  isDateDisabled?: (date: Date) => boolean;
  /** First column. The screenshots use Sunday. */
  weekStartsOn?: WeekStart;
  /** How many months to show side by side (the range picker shows 2). */
  numberOfMonths?: number;
  /** First visible month (controlled). Use with onMonthChange. */
  month?: Date;
  /** First visible month at start (uncontrolled). Defaults to the selection, or today. */
  defaultMonth?: Date;
  onMonthChange?: (month: Date) => void;
  /** Show the neighbouring months' days, faded. */
  showOutsideDays?: boolean;
  size?: CalendarSize;
  /** BCP 47 locale for month and weekday names, e.g. "en-GB", "fr-FR". */
  locale?: string;
  /** Text for the month buttons (screen readers). */
  labels?: Partial<CalendarLabels>;
  'aria-label'?: string;
  className?: string;
}

interface SingleSelection {
  /** `single` picks one day, `range` a start and an end day. */
  mode?: 'single';
  value?: Date | null;
  defaultValue?: Date | null;
  onChange?: (date: Date) => void;
}

interface RangeSelection {
  mode: 'range';
  value?: DateRange;
  defaultValue?: DateRange;
  /** Called after every click: first `{ start, end: null }`, then the full range. */
  onChange?: (range: DateRange) => void;
}

export type CalendarSingleProps = CalendarBaseProps & SingleSelection;
export type CalendarRangeProps = CalendarBaseProps & RangeSelection;
export type CalendarProps = CalendarBaseProps & (SingleSelection | RangeSelection);

const EMPTY_RANGE: DateRange = { start: null, end: null };
const DEFAULT_LABELS: CalendarLabels = { previousMonth: 'Previous month', nextMonth: 'Next month' };
const SIZES: Record<CalendarSize, { cell: number; gap: number; font: number }> = {
  small: { cell: 28, gap: 8, font: 13 },
  medium: { cell: 36, gap: 4, font: 14 },
  large: { cell: 44, gap: 4, font: 15 },
};

/** Both modes are stored as a range internally; single mode uses start === end. */
function readSelection(props: CalendarProps, key: 'value' | 'defaultValue'): DateRange | undefined {
  if (props.mode === 'range') {
    const range = props[key];
    if (range === undefined) return undefined;
    return { start: range.start ? startOfDay(range.start) : null, end: range.end ? startOfDay(range.end) : null };
  }
  const date = props[key];
  if (date === undefined) return undefined;
  const day = date ? startOfDay(date) : null;
  return { start: day, end: day };
}

export function Calendar(props: CalendarProps) {
  const {
    minDate,
    maxDate,
    isDateDisabled,
    weekStartsOn = 'sunday',
    numberOfMonths = 1,
    defaultMonth,
    onMonthChange,
    showOutsideDays = true,
    size = 'medium',
    locale,
    className,
  } = props;
  const isRange = props.mode === 'range';
  const labels = { ...DEFAULT_LABELS, ...props.labels };

  const today = useMemo(() => startOfDay(new Date()), []);
  const bounds = useMemo(
    () => ({ minDate: minDate && startOfDay(minDate), maxDate: maxDate && startOfDay(maxDate), isDateDisabled }),
    [minDate, maxDate, isDateDisabled],
  );

  const [internalSelection, setInternalSelection] = useState<DateRange>(
    () => readSelection(props, 'defaultValue') ?? EMPTY_RANGE,
  );
  const controlledSelection = readSelection(props, 'value');
  const selection = controlledSelection ?? internalSelection;

  const [internalMonth, setInternalMonth] = useState(() =>
    startOfMonth(defaultMonth ?? selection.start ?? clampDay(today, bounds)),
  );
  const firstMonth = props.month ? startOfMonth(props.month) : internalMonth;
  const months = useMemo(
    () => Array.from({ length: numberOfMonths }, (_, i) => addMonthsClamped(firstMonth, i)),
    [firstMonth, numberOfMonths],
  );
  const lastMonth = months[months.length - 1]!;

  const [focusedDay, setFocusedDay] = useState<Date>(() => selection.start ?? clampDay(today, bounds));
  const [previewDay, setPreviewDay] = useState<Date | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const shouldMoveFocus = useRef(false);
  const baseId = useId();

  const format = useMemo(
    () => ({
      monthYear: new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }),
      fullDate: new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
      weekdayShort: new Intl.DateTimeFormat(locale, { weekday: 'short' }),
      weekdayLong: new Intl.DateTimeFormat(locale, { weekday: 'long' }),
      day: new Intl.DateTimeFormat(locale, { day: 'numeric' }),
    }),
    [locale],
  );
  const weekdays = useMemo(() => getWeekdayDates(weekStartsOn), [weekStartsOn]);

  const isVisible = (day: Date) => compareDays(day, firstMonth) >= 0 && monthDiff(firstMonth, day) < numberOfMonths;

  // Range waiting for its end day: hovering or focusing a day previews the range.
  const isPending = isRange && selection.start !== null && selection.end === null;
  const shownRange = isPending && selection.start && previewDay ? orderRange(selection.start, previewDay) : selection;
  const isPreview = shownRange !== selection;

  // Roving tabindex: exactly one day across all months is reachable with Tab.
  const tabbableDay = isVisible(focusedDay)
    ? focusedDay
    : selection.start && isVisible(selection.start)
      ? selection.start
      : isVisible(today)
        ? today
        : firstMonth;

  useEffect(() => {
    if (!shouldMoveFocus.current) return;
    shouldMoveFocus.current = false;
    rootRef.current?.querySelector<HTMLButtonElement>(`[data-day="${toDayKey(focusedDay)}"]`)?.focus();
  }, [focusedDay, firstMonth]);

  function setFirstMonth(month: Date) {
    const next = startOfMonth(month);
    if (!props.month) setInternalMonth(next);
    onMonthChange?.(next);
  }

  const canGoBack = !bounds.minDate || compareDays(addDays(firstMonth, -1), bounds.minDate) >= 0;
  const canGoForward = !bounds.maxDate || compareDays(addMonthsClamped(lastMonth, 1), bounds.maxDate) <= 0;

  function select(day: Date) {
    if (isDayDisabled(day, bounds)) return;
    setFocusedDay(day);
    if (props.mode === 'range') {
      const next = nextRange(selection, day);
      if (!controlledSelection) setInternalSelection(next);
      setPreviewDay(null);
      props.onChange?.(next);
    } else {
      if (!controlledSelection) setInternalSelection({ start: day, end: day });
      props.onChange?.(day);
    }
  }

  function changeMonth(delta: number) {
    setFirstMonth(addMonthsClamped(firstMonth, delta));
    setFocusedDay((current) => clampDay(addMonthsClamped(current, delta), bounds));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const from = tabbableDay;
    const column = weekdayIndex(from, weekStartsOn);
    let next: Date;
    switch (event.key) {
      case 'ArrowLeft':
        next = addDays(from, -1);
        break;
      case 'ArrowRight':
        next = addDays(from, 1);
        break;
      case 'ArrowUp':
        next = addDays(from, -7);
        break;
      case 'ArrowDown':
        next = addDays(from, 7);
        break;
      case 'Home':
        next = addDays(from, -column);
        break;
      case 'End':
        next = addDays(from, 6 - column);
        break;
      case 'PageUp':
        next = addMonthsClamped(from, event.shiftKey ? -12 : -1);
        break;
      case 'PageDown':
        next = addMonthsClamped(from, event.shiftKey ? 12 : 1);
        break;
      default:
        return; // Enter and Space click the focused day natively.
    }
    if (!(event.target as HTMLElement).dataset.day) return;
    event.preventDefault();
    next = clampDay(next, bounds);
    shouldMoveFocus.current = true;
    setFocusedDay(next);
    if (compareDays(next, firstMonth) < 0) setFirstMonth(next);
    else if (monthDiff(firstMonth, next) >= numberOfMonths) setFirstMonth(addMonthsClamped(next, -(numberOfMonths - 1)));
    if (isPending) setPreviewDay(next);
  }

  const metrics = SIZES[size];
  const rootStyle = {
    '--cal-cell': `${metrics.cell}px`,
    '--cal-gap': `${metrics.gap}px`,
    '--cal-font': `${metrics.font}px`,
  } as CSSProperties;

  return (
    <div
      ref={rootRef}
      role="group"
      aria-label={props['aria-label'] ?? (isRange ? 'Choose dates' : 'Choose a date')}
      className={[styles.calendar, className].filter(Boolean).join(' ')}
      style={rootStyle}
      onKeyDown={handleKeyDown}
      onMouseLeave={() => setPreviewDay(null)}
    >
      {months.map((month, monthIndex) => {
        const titleId = `${baseId}-title-${monthIndex}`;
        const weeks = getMonthWeeks(month, weekStartsOn);
        return (
          <div key={toDayKey(month)} className={styles.month}>
            <div className={styles.header}>
              {monthIndex === 0 && (
                <button
                  type="button"
                  className={[styles.navButton, styles.prev].join(' ')}
                  aria-label={labels.previousMonth}
                  disabled={!canGoBack}
                  onClick={() => changeMonth(-1)}
                >
                  <Icon name="chevronLeft" size={18} />
                </button>
              )}
              <div id={titleId} className={styles.title} aria-live="polite">
                {format.monthYear.format(month)}
              </div>
              {monthIndex === months.length - 1 && (
                <button
                  type="button"
                  className={[styles.navButton, styles.next].join(' ')}
                  aria-label={labels.nextMonth}
                  disabled={!canGoForward}
                  onClick={() => changeMonth(1)}
                >
                  <Icon name="chevronRight" size={18} />
                </button>
              )}
            </div>
            <table role="grid" aria-labelledby={titleId} aria-multiselectable={isRange || undefined} className={styles.grid}>
              <thead>
                <tr>
                  {weekdays.map((date) => (
                    <th key={date.getDay()} scope="col" className={styles.weekday} aria-label={format.weekdayLong.format(date)}>
                      {format.weekdayShort.format(date).slice(0, 2)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {weeks.map((week) => (
                  <tr key={toDayKey(week[0]!.date)}>
                    {week.map(({ date: day, outside }) => {
                      if (outside) {
                        return (
                          <td key={toDayKey(day)} className={styles.cell} aria-hidden="true">
                            {showOutsideDays && <span className={styles.outside}>{format.day.format(day)}</span>}
                          </td>
                        );
                      }
                      const { start, end } = shownRange;
                      const isSelected = isSameDay(day, selection.start) || isSameDay(day, selection.end);
                      const hasSpan = start !== null && end !== null && !isSameDay(start, end);
                      const isBandStart = hasSpan && isSameDay(day, start);
                      const isBandEnd = hasSpan && isSameDay(day, end);
                      const isBandMiddle =
                        hasSpan && start !== null && end !== null && compareDays(day, start) > 0 && compareDays(day, end) < 0;
                      const disabled = isDayDisabled(day, bounds);
                      const isToday = isSameDay(day, today);
                      const cellClasses = [
                        styles.cell,
                        isBandStart && styles.bandStart,
                        isBandEnd && styles.bandEnd,
                        isBandMiddle && styles.bandMiddle,
                        isPreview && styles.preview,
                      ]
                        .filter(Boolean)
                        .join(' ');
                      return (
                        <td
                          key={toDayKey(day)}
                          role="gridcell"
                          aria-selected={isSelected || (!isPreview && isBandMiddle)}
                          className={cellClasses}
                        >
                          <button
                            type="button"
                            data-day={toDayKey(day)}
                            className={[styles.day, isSelected && styles.selected, isToday && styles.today].filter(Boolean).join(' ')}
                            tabIndex={isSameDay(day, tabbableDay) ? 0 : -1}
                            aria-label={format.fullDate.format(day)}
                            aria-current={isToday ? 'date' : undefined}
                            aria-disabled={disabled || undefined}
                            onClick={() => select(day)}
                            onFocus={() => {
                              setFocusedDay(day);
                              if (isPending) setPreviewDay(day);
                            }}
                            onMouseEnter={() => {
                              if (isPending) setPreviewDay(day);
                            }}
                          >
                            {format.day.format(day)}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}

