// Story names (Single, Range, Restricted) MUST match the Flutter Widgetbook
// use-case names. Never rename them once embedded in zeroheight.
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
          'Lets people pick one day (`mode="single"`) or a start and end day (`mode="range"`). ' +
          'Keyboard: arrows move by day or week, Home/End jump to the start/end of the week, ' +
          'Page Up/Down change month (with Shift: year), Enter or Space selects.',
      },
    },
  },
  // mode/value/defaultValue/onChange depend on the mode, so they're described
  // here rather than generated from the types.
  argTypes: {
    mode: {
      control: false,
      description: '`single` picks one day, `range` picks a start and an end day. Same values as Flutter `AppCalendarMode`.',
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
      description:
        'single: called with the picked day. range: called after every click, first with `{ start, end: null }`, then with the full range.',
      table: { type: { summary: 'single: (date: Date) => void · range: (range: DateRange) => void' } },
    },
    weekStartsOn: { control: 'inline-radio', options: ['monday', 'sunday'] },
    locale: { control: 'select', options: ['en-GB', 'en-US', 'fr-FR'] },
    defaultMonth: { control: false },
    minDate: { control: false },
    maxDate: { control: false },
    isDateDisabled: { control: false },
  },
  args: {
    weekStartsOn: 'monday',
    locale: 'en-GB',
    onChange: fn(),
  },
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = {
  args: { mode: 'single', defaultValue: today },
};

export const Range: Story = {
  args: { mode: 'range', defaultValue: { start: inDays(2), end: inDays(6) } },
};

/** Only the next 60 days, weekdays only. */
export const Restricted: Story = {
  args: { mode: 'single', minDate: today, maxDate: inDays(60), isDateDisabled: isWeekend },
};
