// Story names MUST match the Flutter Widgetbook use-case names.
import type { Meta, StoryObj } from '@storybook/react-vite';

import { StatusBadge } from './StatusBadge';

const meta = {
  title: 'Components/StatusBadge',
  component: StatusBadge,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Short status label, e.g. an account state in a table. Use `dot` for live states ("ACTIVE"); leave it off for attributes ("Parent").',
      },
    },
  },
  argTypes: {
    tone: { control: 'select', options: ['success', 'warning', 'danger', 'info', 'neutral'] },
    size: { control: 'inline-radio', options: ['small', 'medium'] },
  },
  args: { children: 'ACTIVE', tone: 'success', dot: true, size: 'medium' },
} satisfies Meta<typeof StatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {};

export const Warning: Story = {
  args: { tone: 'warning', dot: false, children: 'Parent' },
};

export const Danger: Story = {
  args: { tone: 'danger', children: 'INACTIVE' },
};

export const Info: Story = {
  args: { tone: 'info', children: 'PENDING' },
};

export const Neutral: Story = {
  args: { tone: 'neutral', dot: false, children: 'Draft' },
};

/** Every tone side by side. */
export const AllTones: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 8 }}>
      <StatusBadge {...args} tone="success">ACTIVE</StatusBadge>
      <StatusBadge {...args} tone="warning">Parent</StatusBadge>
      <StatusBadge {...args} tone="danger">INACTIVE</StatusBadge>
      <StatusBadge {...args} tone="info">PENDING</StatusBadge>
      <StatusBadge {...args} tone="neutral">Draft</StatusBadge>
    </div>
  ),
};
