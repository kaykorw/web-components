// Pure date helpers for Calendar. All dates are local "calendar days"
// (time set to 00:00). Building dates from year/month/day instead of adding
// milliseconds keeps them correct across daylight-saving changes.

/** Same values as Flutter `AppCalendarWeekStart`. */
export type WeekStart = 'monday' | 'sunday';

/** `end` is null while the user has picked only the first day. Same shape as Flutter `AppDateRange`. */
export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export interface DayBounds {
  minDate?: Date;
  maxDate?: Date;
  isDateDisabled?: (date: Date) => boolean;
}

export const startOfDay = (d: Date): Date => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export const startOfMonth = (d: Date): Date => new Date(d.getFullYear(), d.getMonth(), 1);

export const addDays = (d: Date, days: number): Date =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);

const daysInMonth = (year: number, month: number): number => new Date(year, month + 1, 0).getDate();

/** Same day number in another month, clamped (31 Jan + 1 month = 28/29 Feb). */
export function addMonthsClamped(d: Date, months: number): Date {
  const target = new Date(d.getFullYear(), d.getMonth() + months, 1);
  const day = Math.min(d.getDate(), daysInMonth(target.getFullYear(), target.getMonth()));
  return new Date(target.getFullYear(), target.getMonth(), day);
}

export const isSameDay = (a: Date | null | undefined, b: Date | null | undefined): boolean =>
  !!a &&
  !!b &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export const isSameMonth = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

/** Negative if a is before b, 0 if the same day, positive if after. */
export const compareDays = (a: Date, b: Date): number => startOfDay(a).getTime() - startOfDay(b).getTime();

/** Column of `d` in the grid: 0 = first column. */
export const weekdayIndex = (d: Date, weekStartsOn: WeekStart): number =>
  weekStartsOn === 'monday' ? (d.getDay() + 6) % 7 : d.getDay();

/**
 * 42 cells (6 weeks) so the calendar never changes height between months.
 * Cells outside the month are null.
 */
export function getMonthGrid(month: Date, weekStartsOn: WeekStart): (Date | null)[] {
  const first = startOfMonth(month);
  const offset = weekdayIndex(first, weekStartsOn);
  const total = daysInMonth(first.getFullYear(), first.getMonth());
  return Array.from({ length: 42 }, (_, i) => {
    const day = i - offset + 1;
    return day < 1 || day > total ? null : new Date(first.getFullYear(), first.getMonth(), day);
  });
}

/** Seven sample dates, one per column, for weekday headers. */
export function getWeekdayDates(weekStartsOn: WeekStart): Date[] {
  // 1 Jan 2024 was a Monday.
  const firstColumn = weekStartsOn === 'monday' ? new Date(2024, 0, 1) : new Date(2023, 11, 31);
  return Array.from({ length: 7 }, (_, i) => addDays(firstColumn, i));
}

export function isDayDisabled(day: Date, { minDate, maxDate, isDateDisabled }: DayBounds): boolean {
  if (minDate && compareDays(day, minDate) < 0) return true;
  if (maxDate && compareDays(day, maxDate) > 0) return true;
  return isDateDisabled?.(day) ?? false;
}

export function clampDay(day: Date, { minDate, maxDate }: DayBounds): Date {
  if (minDate && compareDays(day, minDate) < 0) return startOfDay(minDate);
  if (maxDate && compareDays(day, maxDate) > 0) return startOfDay(maxDate);
  return day;
}

export const orderRange = (a: Date, b: Date): DateRange =>
  compareDays(a, b) <= 0 ? { start: a, end: b } : { start: b, end: a };

/**
 * Range selection, same rules as Flutter:
 * 1st click sets the start; 2nd click sets the end (swapped if it's earlier);
 * a click on a complete range starts a new one.
 */
export function nextRange(current: DateRange, day: Date): DateRange {
  if (!current.start || current.end) return { start: day, end: null };
  return orderRange(current.start, day);
}

export const toDayKey = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export interface CalendarCell {
  date: Date;
  /** Belongs to the previous or next month (shown faded). */
  outside: boolean;
}

/**
 * The weeks that cover `month`, including the leading/trailing days of the
 * neighbouring months. 4 to 6 weeks, like the screenshot (November 2026 has 5).
 */
export function getMonthWeeks(month: Date, weekStartsOn: WeekStart): CalendarCell[][] {
  const first = startOfMonth(month);
  const start = addDays(first, -weekdayIndex(first, weekStartsOn));
  const total = daysInMonth(first.getFullYear(), first.getMonth());
  const cellCount = Math.ceil((weekdayIndex(first, weekStartsOn) + total) / 7) * 7;
  const weeks: CalendarCell[][] = [];
  for (let i = 0; i < cellCount; i++) {
    const date = addDays(start, i);
    if (i % 7 === 0) weeks.push([]);
    weeks[weeks.length - 1]!.push({ date, outside: !isSameMonth(date, first) });
  }
  return weeks;
}

/** Number of whole months from a to b (b - a). */
export const monthDiff = (a: Date, b: Date): number =>
  (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
