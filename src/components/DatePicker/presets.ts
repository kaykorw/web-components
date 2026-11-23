import { addDays, startOfDay, startOfMonth, type DateRange } from '../Calendar/calendarUtils';

/** A quick choice in the DateRangePicker list. `range` is called when it's shown or picked, so it's always relative to now. */
export interface DateRangePreset {
  label: string;
  range: () => DateRange;
}

/** The presets from the screenshot: Today, Last 7 days, Last 30 days, This month. */
export function defaultDateRangePresets(): DateRangePreset[] {
  const today = () => startOfDay(new Date());
  return [
    { label: 'Today', range: () => ({ start: today(), end: today() }) },
    { label: 'Last 7 days', range: () => ({ start: addDays(today(), -6), end: today() }) },
    { label: 'Last 30 days', range: () => ({ start: addDays(today(), -29), end: today() }) },
    { label: 'This month', range: () => ({ start: startOfMonth(today()), end: today() }) },
  ];
}
