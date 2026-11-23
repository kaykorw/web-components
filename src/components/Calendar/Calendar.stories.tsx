// Story names (Single, Range, Restricted, TwoMonths, Sizes) MUST match the
// Flutter Widgetbook use-case names. Never rename them once embedded in zeroheight.
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { Calendar } from './Calendar';

// Dates relative to today, so every story opens on the current month.
const today = new Date();
const inDays = (days: number) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + days);
const isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6;

const meta = {
  title: 'Components/Calendar',
  component: Calendar,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Pick one day (`mode="single"`) or a start and end day (`mode="range"`). Keyboard: arrows move by day/week, Home/End go to the start/end of the week, Page Up/Down change month (with Shift: year), Enter or Space selects. For a field that opens a calendar, use DatePicker or DateRangePicker.',
      },
    },
  },
  // mode/value/defaultValue/onChange depend on the mode, so they're described here.
  argTypes: {
    mode: {
      control: false,
      description: '`single` picks one day, `range` a start and an end day. Same values as Flutter `AppCalendarMode`.',
      table: { type: { summary: "'single' | 'range'" }, defaultValue: { summary: "'single'" } },
    },
    value: {
      control: false,
      description: 'Selected day or range (controlled).',
      table: { type: { summary: 'single: Date | null · range: DateRange' } },
    },
    defaultValue: {
      control: false,
      description: 'Initially selected day or range (uncontrolled).',
      table: { type: { summary: 'single: Date | null · range: DateRange' } },
    },
    onChange: {
      description: 'single: called with the picked day. range: called after every click, first with `{ start, end: null }`, then with the full range.',
      table: { type: { summary: 'single: (date: Date) => void · range: (range: DateRange) => void' } },
    },
    weekStartsOn: { control: 'inline-radio', options: ['sunday', 'monday'] },
    size: { control: 'inline-radio', options: ['small', 'medium', 'large'] },
    numberOfMonths: { control: { type: 'number', min: 1, max: 3 } },
    locale: { control: 'select', options: ['en-GB', 'en-US', 'fr-FR'] },
    month: { control: false },
    defaultMonth: { control: false },
    minDate: { control: false },
    maxDate: { control: false },
    isDateDisabled: { control: false },
  },
  args: { weekStartsOn: 'sunday', size: 'medium', numberOfMonths: 1, showOutsideDays: true, locale: 'en-GB', onChange: fn() },
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = {
  args: { mode: 'single', defaultValue: today },
};

export const Range: Story = {
  args: { mode: 'range', defaultValue: { start: inDays(-6), end: today } },
};

/** Only the next 60 days, weekdays only. */
export const Restricted: Story = {
  args: { mode: 'single', minDate: today, maxDate: inDays(60), isDateDisabled: isWeekend },
};

/** As in the date range picker: two months, small days, no future dates. */
export const TwoMonths: Story = {
  args: { mode: 'range', numberOfMonths: 2, size: 'small', maxDate: today, defaultMonth: today },
};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 48, alignItems: 'flex-start' }}>
      <Calendar mode="single" size="small" weekStartsOn={args.weekStartsOn} locale={args.locale} />
      <Calendar mode="single" size="medium" weekStartsOn={args.weekStartsOn} locale={args.locale} />
      <Calendar mode="single" size="large" weekStartsOn={args.weekStartsOn} locale={args.locale} />
    </div>
  ),
};
