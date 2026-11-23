// Story names MUST match the Flutter Widgetbook use-case names.
import type { Meta, StoryObj } from '@storybook/react-vite';

import { ChartCard } from '../ChartCard';
import { BarChart } from './BarChart';

const volume = [
  { date: '10 Nov', in: 500, out: 300 },
  { date: '11 Nov', in: 0, out: 175 },
  { date: '16 Nov', in: 500, out: 272 },
  { date: '17 Nov', in: 200, out: 125 },
  { date: '18 Nov', in: 315, out: 0 },
  { date: '19 Nov', in: 100, out: 0 },
];

const series = [
  { key: 'in', label: 'Money in', color: 'var(--kayko-color-success-strong)' },
  { key: 'out', label: 'Money out', color: 'var(--kayko-color-danger)' },
];

const rwf = (value: number) => `RWF ${value.toLocaleString('en-US')}`;

const meta = {
  title: 'Components/BarChart',
  component: BarChart<(typeof volume)[number]>,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Bars per category, side by side or stacked. Hover (or focus and use ←/→) to see a tooltip. Screen readers get the full data as a table. Series colours default to the chart palette tokens.',
      },
    },
  },
  argTypes: { data: { control: false }, series: { control: false } },
  args: {
    data: volume,
    categoryKey: 'date',
    series,
    stacked: false,
    height: 240,
    showLegend: true,
    showGrid: true,
    formatValue: rwf,
    'aria-label': 'Money in and out per day, 10 to 19 November',
  },
} satisfies Meta<typeof BarChart<(typeof volume)[number]>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Grouped: Story = {};

export const Stacked: Story = {
  args: { stacked: true },
};

export const SingleSeries: Story = {
  args: { series: [{ key: 'in', label: 'Money in' }] },
};

export const Empty: Story = {
  args: { data: [] },
};

/** The Transaction volume card from the dashboard. */
export const InCard: Story = {
  render: (args) => (
    <ChartCard
      title="Transaction volume"
      description={
        <>
          Money in is everything received, money out is everything sent, and net is the difference.
          <br />
          Hover a day to see its totals.
        </>
      }
      stats={[
        { label: 'Money in', value: 'RWF 1.6K', tone: 'positive' },
        { label: 'Money out', value: 'RWF 872', tone: 'negative' },
      ]}
    >
      <BarChart {...args} />
    </ChartCard>
  ),
};
