import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';

import styles from './Calendar.module.css';
import {
  addDays,
  addMonthsClamped,
  clampDay,
  compareDays,
  getMonthGrid,
  getWeekdayDates,
  isDayDisabled,
  isSameDay,
  isSameMonth,
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

export interface CalendarLabels {
  previousMonth: string;
  nextMonth: string;
}

// Props are written as `base & (single | range)`: TypeScript checks that
// `value`/`onChange` match `mode`, and Storybook's docgen can still read the
// shared props for the docs table. The four mode-dependent props are
// documented in Calendar.stories.tsx (argTypes).
export interface CalendarBaseProps {
  /** Earliest day that can be picked. */
  minDate?: Date;
  /** Latest day that can be picked. */
  maxDate?: Date;
  /** Return true to block a day, e.g. weekends or public holidays. */
  isDateDisabled?: (date: Date) => boolean;
  /** First column of the grid. */
  weekStartsOn?: WeekStart;
  /** Month shown first. Defaults to the selected day's month, or today. */
  defaultMonth?: Date;
  /** BCP 47 locale for month and weekday names, e.g. "en-GB" or "fr-FR". Defaults to the browser's. */
  locale?: string;
  /** Text for the month buttons (screen readers). */
  labels?: Partial<CalendarLabels>;
  /** Accessible name of the whole calendar. */
  'aria-label'?: string;
  className?: string;
}

interface SingleSelection {
  /** `single` picks one day, `range` picks a start and an end day. */
  mode?: 'single';
  /** Selected day (controlled). */
  value?: Date | null;
  /** Initially selected day (uncontrolled). */
  defaultValue?: Date | null;
  /** Called with the picked day. */
  onChange?: (date: Date) => void;
}

interface RangeSelection {
  mode: 'range';
  /** Selected range (controlled). */
  value?: DateRange;
  /** Initially selected range (uncontrolled). */
  defaultValue?: DateRange;
  /** Called after every click: first `{ start, end: null }`, then the full range. */
  onChange?: (range: DateRange) => void;
}

export type CalendarSingleProps = CalendarBaseProps & SingleSelection;
export type CalendarRangeProps = CalendarBaseProps & RangeSelection;
export type CalendarProps = CalendarBaseProps & (SingleSelection | RangeSelection);

const EMPTY_RANGE: DateRange = { start: null, end: null };
const DEFAULT_LABELS: CalendarLabels = { previousMonth: 'Previous month', nextMonth: 'Next month' };

/** Both modes are stored as a range internally; single mode uses start === end. */
function readSelection(props: CalendarProps, key: 'value' | 'defaultValue'): DateRange | undefined {
  if (props.mode === 'range') {
    const range = props[key];
    if (range === undefined) return undefined;
    return {
      start: range.start ? startOfDay(range.start) : null,
      end: range.end ? startOfDay(range.end) : null,
    };
  }
  const date = props[key];
  if (date === undefined) return undefined;
  const day = date ? startOfDay(date) : null;
  return { start: day, end: day };
}

export function Calendar(props: CalendarProps) {
  const { minDate, maxDate, isDateDisabled, weekStartsOn = 'monday', defaultMonth, locale, className } = props;
  const isRange = props.mode === 'range';
  const labels = { ...DEFAULT_LABELS, ...props.labels };

  const today = useMemo(() => startOfDay(new Date()), []);
  const bounds = useMemo(
    () => ({
      minDate: minDate && startOfDay(minDate),
      maxDate: maxDate && startOfDay(maxDate),
      isDateDisabled,
    }),
    [minDate, maxDate, isDateDisabled],
  );

  const [internalSelection, setInternalSelection] = useState<DateRange>(
    () => readSelection(props, 'defaultValue') ?? EMPTY_RANGE,
  );
  const controlledSelection = readSelection(props, 'value');
  const selection = controlledSelection ?? internalSelection;

  const [month, setMonth] = useState(() =>
    startOfMonth(defaultMonth ?? selection.start ?? clampDay(today, bounds)),
  );
  const [focusedDay, setFocusedDay] = useState<Date>(() => selection.start ?? clampDay(today, bounds));
  const [previewDay, setPreviewDay] = useState<Date | null>(null);

  const gridRef = useRef<HTMLTableElement>(null);
  const shouldMoveFocus = useRef(false);
  const titleId = useId();

  const format = useMemo(
    () => ({
      monthYear: new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }),
      fullDate: new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
      weekdayShort: new Intl.DateTimeFormat(locale, { weekday: 'narrow' }),
      weekdayLong: new Intl.DateTimeFormat(locale, { weekday: 'long' }),
      day: new Intl.DateTimeFormat(locale, { day: 'numeric' }),
    }),
    [locale],
  );

  const days = useMemo(() => getMonthGrid(month, weekStartsOn), [month, weekStartsOn]);
  const weekdays = useMemo(() => getWeekdayDates(weekStartsOn), [weekStartsOn]);

  // Range waiting for its end day: hovering or focusing a day previews the range.
  const isPending = isRange && selection.start !== null && selection.end === null;
  const shownRange =
    isPending && selection.start && previewDay ? orderRange(selection.start, previewDay) : selection;
  const isPreview = shownRange !== selection;

  // Roving tabindex: exactly one day in the grid is reachable with Tab.
  const tabbableDay = isSameMonth(focusedDay, month)
    ? focusedDay
    : selection.start && isSameMonth(selection.start, month)
      ? selection.start
      : isSameMonth(today, month)
        ? today
        : month;

  useEffect(() => {
    if (!shouldMoveFocus.current) return;
    shouldMoveFocus.current = false;
    gridRef.current?.querySelector<HTMLButtonElement>(`[data-day="${toDayKey(focusedDay)}"]`)?.focus();
  }, [focusedDay, month]);

  const canGoBack = !bounds.minDate || compareDays(addDays(month, -1), bounds.minDate) >= 0;
  const canGoForward = !bounds.maxDate || compareDays(addMonthsClamped(month, 1), bounds.maxDate) <= 0;

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
    setMonth((current) => addMonthsClamped(current, delta));
    setFocusedDay((current) => clampDay(addMonthsClamped(current, delta), bounds));
  }

  function handleGridKeyDown(event: KeyboardEvent<HTMLTableElement>) {
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
        return; // Enter and Space click the focused day button natively.
    }
    event.preventDefault();
    next = clampDay(next, bounds);
    shouldMoveFocus.current = true;
    setFocusedDay(next);
    if (!isSameMonth(next, month)) setMonth(startOfMonth(next));
    if (isPending) setPreviewDay(next);
  }

  const weeks = Array.from({ length: 6 }, (_, w) => days.slice(w * 7, w * 7 + 7));

  return (
    <div
      role="group"
      aria-label={props['aria-label'] ?? (isRange ? 'Choose dates' : 'Choose a date')}
      className={[styles.calendar, className].filter(Boolean).join(' ')}
    >
      <div className={styles.header}>
        <div id={titleId} className={styles.title} aria-live="polite">
          {format.monthYear.format(month)}
        </div>
        <div className={styles.nav}>
          <button
            type="button"
            className={styles.navButton}
            aria-label={labels.previousMonth}
            disabled={!canGoBack}
            onClick={() => changeMonth(-1)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>
          <button
            type="button"
            className={styles.navButton}
            aria-label={labels.nextMonth}
            disabled={!canGoForward}
            onClick={() => changeMonth(1)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>

      <table
        ref={gridRef}
        role="grid"
        aria-labelledby={titleId}
        aria-multiselectable={isRange || undefined}
        className={styles.grid}
        onKeyDown={handleGridKeyDown}
        onMouseLeave={() => setPreviewDay(null)}
      >
        <thead>
          <tr>
            {weekdays.map((date) => (
              <th key={date.getDay()} scope="col" className={styles.weekday} aria-label={format.weekdayLong.format(date)}>
                {format.weekdayShort.format(date)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, w) => (
            <tr key={w}>
              {week.map((day, d) => {
                if (!day) return <td key={d} className={styles.cell} />;

                const { start, end } = shownRange;
                const isSelected = isSameDay(day, selection.start) || isSameDay(day, selection.end);
                const hasSpan = !!start && !!end && !isSameDay(start, end);
                const isBandStart = hasSpan && isSameDay(day, start);
                const isBandEnd = hasSpan && isSameDay(day, end);
                const isBandMiddle =
                  hasSpan && start !== null && end !== null && compareDays(day, start) > 0 && compareDays(day, end) < 0;
                // A previewed range isn't selected yet, so only real selections get aria-selected.
                const isInSelection = isSelected || (!isPreview && isBandMiddle);
                const disabled = isDayDisabled(day, bounds);
                const isToday = isSameDay(day, today);

                const cellClasses = [
                  styles.cell,
                  isBandStart && styles.bandStart,
                  isBandEnd && styles.bandEnd,
                  isBandMiddle && styles.bandMiddle,
                  isPreview && styles.bandPreview,
                ]
                  .filter(Boolean)
                  .join(' ');
                const dayClasses = [styles.day, isSelected && styles.selected, isToday && styles.today]
                  .filter(Boolean)
                  .join(' ');

                return (
                  <td key={d} role="gridcell" aria-selected={isInSelection} className={cellClasses}>
                    <button
                      type="button"
                      data-day={toDayKey(day)}
                      className={dayClasses}
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
}
