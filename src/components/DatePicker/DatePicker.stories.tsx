// Story names MUST match the Flutter Widgetbook use-case names.
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { DatePicker, DateRangePicker } from './DatePicker';

const today = new Date();

const meta = {
  title: 'Components/DateRangePicker',
  component: DateRangePicker,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Trigger that opens quick ranges plus a two-month calendar. Nothing changes until Apply; Cancel or Esc discards. `presets` is configurable (pass [] to hide the list). DatePicker is the single-day version: picking a day applies it immediately.',
      },
      story: { inline: false, iframeHeight: 520 },
    },
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['small', 'medium', 'large'] },
    calendarSize: { control: 'inline-radio', options: ['small', 'medium', 'large'] },
    weekStartsOn: { control: 'inline-radio', options: ['sunday', 'monday'] },
    placement: { control: 'select', options: ['bottom-start', 'bottom-end', 'top-start', 'top-end'] },
    presets: { control: false },
    value: { control: false },
    defaultValue: { control: false },
    minDate: { control: false },
    maxDate: { control: false },
    isDateDisabled: { control: false },
  },
  args: { 'aria-label': 'Date range', maxDate: today, onChange: fn() },
  decorators: [(Story) => <div style={{ height: 480, width: 760 }}><Story /></div>],
} satisfies Meta<typeof DateRangePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

/** As on the dashboard: no future dates. */
export const Default: Story = {};

export const WithValue: Story = {
  args: {
    defaultValue: {
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6),
      end: today,
    },
  },
};

export const CustomPresets: Story = {
  args: {
    presets: [
      { label: 'Yesterday', range: () => {
        const d = new Date(); d.setDate(d.getDate() - 1); d.setHours(0, 0, 0, 0);
        return { start: d, end: d };
      } },
      { label: 'This year', range: () => {
        const now = new Date(); now.setHours(0, 0, 0, 0);
        return { start: new Date(now.getFullYear(), 0, 1), end: now };
      } },
    ],
  },
};

export const WithoutPresets: Story = {
  args: { presets: [] },
};

export const WithLabel: Story = {
  args: { 'aria-label': undefined, label: 'Statement period', required: true, description: 'Up to 12 months.' },
};

export const Error: Story = {
  args: { 'aria-label': undefined, label: 'Statement period', error: 'Pick a period.' },
};

/** Single day: `DatePicker`. */
export const SingleDate: Story = {
  render: () => <DatePicker label="Opening date" maxDate={today} onChange={fn()} />,
};
