// Story names MUST match the Flutter Widgetbook use-case names.
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Icon } from '../Icon';
import { StatCard } from './StatCard';

const meta = {
  title: 'Components/StatCard',
  component: StatCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: 'One metric: icon tile, label, large value and a caption. Values are passed in already formatted.' } },
  },
  argTypes: {
    iconTone: { control: 'select', options: ['primary', 'success', 'warning', 'danger', 'neutral'] },
    icon: { control: false },
  },
  args: {
    label: 'Money in',
    value: 'RWF 1,615',
    caption: 'Credits posted to your accounts',
    icon: <Icon name="arrowDownToLine" />,
    loading: false,
    style: { width: 400 },
  },
} satisfies Meta<typeof StatCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithTrend: Story = {
  args: { trend: { value: '+12%', direction: 'up', label: 'vs last week' } },
};

export const Loading: Story = {
  args: { loading: true },
};

/** The three cards from the dashboard. */
export const Group: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, width: 1100 }}>
      <StatCard label="Money in" value="RWF 1,615" caption="Credits posted to your accounts" icon={<Icon name="arrowDownToLine" />} />
      <StatCard label="Money out" value="RWF 872" caption="Debits posted from your accounts" icon={<Icon name="arrowUpFromLine" />} />
      <StatCard label="Net" value="RWF 743" caption="Money in minus money out" icon={<Icon name="hourglass" />} />
    </div>
  ),
};
