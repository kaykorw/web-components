// Story names MUST match the Flutter Widgetbook use-case names.
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Icon } from '../Icon';
import { IconTile } from './IconTile';

const meta = {
  title: 'Components/IconTile',
  component: IconTile,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    tone: { control: 'select', options: ['primary', 'success', 'warning', 'danger', 'neutral'] },
    size: { control: 'inline-radio', options: ['small', 'medium', 'large'] },
  },
  args: { tone: 'primary', size: 'small', children: <Icon name="arrowDownToLine" /> },
} satisfies Meta<typeof IconTile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** As on the "Verify your email" card. */
export const Large: Story = {
  args: { size: 'large', children: <Icon name="mailCheck" /> },
};

export const Tones: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 12 }}>
      {(['primary', 'success', 'warning', 'danger', 'neutral'] as const).map((tone) => (
        <IconTile key={tone} {...args} tone={tone} />
      ))}
    </div>
  ),
};
