import { forwardRef, useId, useMemo, useState, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Button } from '../Button/Button';
import { Calendar, type CalendarSize, type DateRange, type WeekStart } from '../Calendar';
import { isSameDay, startOfMonth } from '../Calendar/calendarUtils';
import { FormField } from '../FormField';
import { Icon } from '../Icon';
import { Menu, MenuItem } from '../Menu';
import { Popover, type PopoverPlacement } from '../Popover';
import type { FieldSize } from '../TextField';
import styles from './DatePicker.module.css';
import { defaultDateRangePresets, type DateRangePreset } from './presets';

// ------------------------------------------------------------------ trigger

interface TriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  text: ReactNode;
  placeholder: boolean;
  open: boolean;
  invalid: boolean;
  size: FieldSize;
  fullWidth: boolean;
}

/** The field-like button: calendar icon, value or placeholder, chevron. */
const PickerTrigger = forwardRef<HTMLButtonElement, TriggerProps>(function PickerTrigger(
  { text, placeholder, open, invalid, size, fullWidth, className, ...rest },
  ref,
) {
  return (
    <button
      {...rest}
      ref={ref}
      type="button"
      aria-invalid={invalid || undefined}
      className={[
        styles.trigger,
        styles[size],
        open && styles.open,
        invalid && styles.invalid,
        fullWidth && styles.fullWidth,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Icon name="calendar" size={18} className={styles.triggerIcon} />
      <span className={placeholder ? styles.placeholder : styles.value}>{text}</span>
      <Icon name="chevronDown" size={16} className={styles.chevron} />
    </button>
  );
});

interface SharedPickerProps {
  /** Label above the trigger. Without it, pass `aria-label`. */
  label?: ReactNode;
  description?: ReactNode;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  size?: FieldSize;
  /** Stretch the trigger to the container's width. */
  fullWidth?: boolean;
  minDate?: Date;
  /** Latest pickable day, e.g. today for "no future dates" (as in the screenshot). */
  maxDate?: Date;
  isDateDisabled?: (date: Date) => boolean;
  weekStartsOn?: WeekStart;
  /** BCP 47 locale for names and the trigger text. */
  locale?: string;
  /** Where the popover opens. */
  placement?: PopoverPlacement;
  /** Day size inside the popover. */
  calendarSize?: CalendarSize;
  'aria-label'?: string;
  className?: string;
}

// --------------------------------------------------------------- DatePicker

export interface DatePickerProps extends SharedPickerProps {
  value?: Date | null;
  defaultValue?: Date | null;
  /** Called when a day is picked. The popover closes right away. */
  onChange?: (date: Date) => void;
  /** Trigger text while nothing is selected. */
  placeholder?: string;
  /** Formats the trigger text. Default: "20 Nov 2026". */
  formatDate?: (date: Date) => string;
}

/** Field that opens a calendar to pick one day. */
export function DatePicker({
  value,
  defaultValue = null,
  onChange,
  placeholder = 'Select date',
  formatDate,
  label,
  description,
  error,
  required,
  disabled = false,
  size = 'medium',
  fullWidth = false,
  minDate,
  maxDate,
  isDateDisabled,
  weekStartsOn = 'sunday',
  locale,
  placement = 'bottom-start',
  calendarSize = 'medium',
  'aria-label': ariaLabel,
  className,
}: DatePickerProps) {
  const [internal, setInternal] = useState<Date | null>(defaultValue);
  const selected = value !== undefined ? value : internal;
  const [open, setOpen] = useState(false);
  const triggerId = useId();
  const messageId = useId();
  const format = useMemo(
    () => formatDate ?? ((date: Date) => new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' }).format(date)),
    [formatDate, locale],
  );

  return (
    <FormField label={label} htmlFor={triggerId} required={required} description={description} error={error} messageId={messageId} className={className}>
      <Popover
        open={open && !disabled}
        onOpenChange={setOpen}
        placement={placement}
        aria-label={typeof label === 'string' ? label : (ariaLabel ?? 'Choose a date')}
        trigger={(isOpen) => (
          <PickerTrigger
            id={triggerId}
            text={selected ? format(selected) : placeholder}
            placeholder={!selected}
            open={isOpen}
            invalid={!!error}
            size={size}
            fullWidth={fullWidth}
            disabled={disabled}
            aria-label={nameWithValue(label, ariaLabel, selected ? format(selected) : placeholder)}
            aria-describedby={error ?? description ? messageId : undefined}
          />
        )}
      >
        {({ close }) => (
          <Calendar
            mode="single"
            value={selected}
            onChange={(date) => {
              if (value === undefined) setInternal(date);
              onChange?.(date);
              close();
            }}
            minDate={minDate}
            maxDate={maxDate}
            isDateDisabled={isDateDisabled}
            weekStartsOn={weekStartsOn}
            locale={locale}
            size={calendarSize}
          />
        )}
      </Popover>
    </FormField>
  );
}

// ---------------------------------------------------------- DateRangePicker

export interface DateRangePickerProps extends SharedPickerProps {
  value?: DateRange;
  defaultValue?: DateRange;
  /** Called on Apply with the new range ({ start: null, end: null } when cleared). */
  onChange?: (range: DateRange) => void;
  /** Quick choices on the left. Pass [] to hide the list. Default: Today, Last 7 days, Last 30 days, This month. */
  presets?: DateRangePreset[];
  /** Trigger text while nothing is selected. Also the first list item, which clears the range. */
  placeholder?: string;
  /** Hide the "Select date range" (clear) item. */
  hideClearOption?: boolean;
  /** List item for picking days by hand. */
  customRangeLabel?: string;
  /** Months shown side by side. */
  numberOfMonths?: number;
  applyLabel?: string;
  cancelLabel?: string;
  /** Formats the trigger text. Default: "1–20 Nov 2026", or the preset's name when it matches one. */
  formatRange?: (range: { start: Date; end: Date }) => string;
}

/**
 * Accessible name for the trigger: "Date range, Last 7 days". It must contain the
 * visible text (WCAG 2.5.3) and tells screen-reader users the current value.
 * A non-text label falls back to the <label for> association.
 */
function nameWithValue(label: ReactNode, ariaLabel: string | undefined, text: string) {
  const name = typeof label === 'string' ? label : label ? undefined : ariaLabel;
  return name ? `${name}, ${text}` : undefined;
}

const EMPTY: DateRange = { start: null, end: null };
const sameRange = (a: DateRange, b: DateRange) =>
  (a.start === null ? b.start === null : isSameDay(a.start, b.start)) &&
  (a.end === null ? b.end === null : isSameDay(a.end, b.end));
const isComplete = (range: DateRange): range is { start: Date; end: Date } => range.start !== null && range.end !== null;

/**
 * Field that opens presets + a two-month calendar to pick a date range, with Cancel/Apply,
 * as on the dashboard. Nothing changes until Apply.
 */
export function DateRangePicker({
  value,
  defaultValue = EMPTY,
  onChange,
  presets,
  placeholder = 'Select date range',
  hideClearOption = false,
  customRangeLabel = 'Custom range',
  numberOfMonths = 2,
  applyLabel = 'Apply',
  cancelLabel = 'Cancel',
  formatRange,
  label,
  description,
  error,
  required,
  disabled = false,
  size = 'medium',
  fullWidth = false,
  minDate,
  maxDate,
  isDateDisabled,
  weekStartsOn = 'sunday',
  locale,
  placement = 'bottom-start',
  calendarSize = 'small',
  'aria-label': ariaLabel,
  className,
}: DateRangePickerProps) {
  const presetList = useMemo(() => presets ?? defaultDateRangePresets(), [presets]);
  const [internal, setInternal] = useState<DateRange>(defaultValue);
  const committed = value ?? internal;
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DateRange>(committed);
  const [customMode, setCustomMode] = useState(false);
  const [month, setMonth] = useState<Date>(() => monthFor(committed));
  const triggerId = useId();
  const messageId = useId();

  /** First visible month: the range's start month, else the current month (as in the screenshot). */
  function monthFor(range: DateRange) {
    return startOfMonth(range.start ?? new Date());
  }

  const matchingPreset = (range: DateRange) =>
    isComplete(range) ? presetList.find((preset) => sameRange(preset.range(), range)) : undefined;

  const defaultFormat = (range: { start: Date; end: Date }) => {
    const formatter = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' });
    return isSameDay(range.start, range.end) ? formatter.format(range.start) : formatter.formatRange(range.start, range.end);
  };

  const triggerText = isComplete(committed)
    ? (formatRange?.(committed) ?? matchingPreset(committed)?.label ?? defaultFormat(committed))
    : placeholder;

  function handleOpenChange(next: boolean) {
    if (next) {
      setDraft(committed);
      setCustomMode(isComplete(committed) && !matchingPreset(committed));
      setMonth(monthFor(committed));
    }
    setOpen(next);
  }

  const draftPreset = matchingPreset(draft);
  const isEmptyDraft = draft.start === null && draft.end === null;
  const canApply = (isComplete(draft) || isEmptyDraft) && !sameRange(draft, committed);

  function apply(close: () => void) {
    if (value === undefined) setInternal(draft);
    onChange?.(draft);
    close();
  }

  return (
    <FormField label={label} htmlFor={triggerId} required={required} description={description} error={error} messageId={messageId} className={className}>
      <Popover
        open={open && !disabled}
        onOpenChange={handleOpenChange}
        placement={placement}
        flush
        aria-label={typeof label === 'string' ? label : (ariaLabel ?? 'Choose a date range')}
        trigger={(isOpen) => (
          <PickerTrigger
            id={triggerId}
            text={triggerText}
            placeholder={!isComplete(committed)}
            open={isOpen}
            invalid={!!error}
            size={size}
            fullWidth={fullWidth}
            disabled={disabled}
            aria-label={nameWithValue(label, ariaLabel, triggerText)}
            aria-describedby={error ?? description ? messageId : undefined}
          />
        )}
      >
        {({ close }) => (
          <div className={styles.rangePanel}>
            {presetList.length > 0 && (
              <Menu role="listbox" aria-label="Quick ranges" className={styles.presets}>
                {!hideClearOption && (
                  <MenuItem
                    role="option"
                    trailing="check"
                    selected={isEmptyDraft && !customMode}
                    onClick={() => {
                      setDraft(EMPTY);
                      setCustomMode(false);
                    }}
                  >
                    {placeholder}
                  </MenuItem>
                )}
                {presetList.map((preset) => (
                  <MenuItem
                    key={preset.label}
                    role="option"
                    trailing="check"
                    selected={!customMode && draftPreset === preset}
                    onClick={() => {
                      const range = preset.range();
                      setDraft(range);
                      setCustomMode(false);
                      setMonth(monthFor(range));
                    }}
                  >
                    {preset.label}
                  </MenuItem>
                ))}
                <MenuItem
                  role="option"
                  trailing="check"
                  selected={customMode || (isComplete(draft) && !draftPreset) || (draft.start !== null && draft.end === null)}
                  onClick={() => {
                    setCustomMode(true);
                    setDraft(EMPTY);
                  }}
                >
                  {customRangeLabel}
                </MenuItem>
              </Menu>
            )}
            <div className={styles.calendarArea}>
              <Calendar
                mode="range"
                value={draft}
                onChange={(range) => {
                  setDraft(range);
                  setCustomMode(!matchingPreset(range));
                }}
                month={month}
                onMonthChange={setMonth}
                numberOfMonths={numberOfMonths}
                minDate={minDate}
                maxDate={maxDate}
                isDateDisabled={isDateDisabled}
                weekStartsOn={weekStartsOn}
                locale={locale}
                size={calendarSize}
              />
              <div className={styles.actions}>
                <Button variant="ghost" onClick={close}>
                  {cancelLabel}
                </Button>
                <Button disabled={!canApply} onClick={() => apply(close)}>
                  {applyLabel}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Popover>
    </FormField>
  );
}
