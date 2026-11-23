// Story names MUST match the Flutter Widgetbook use-case names.
import type { Meta, StoryObj } from '@storybook/react-vite';

import { StatusBadge } from '../StatusBadge';
import { Avatar, AvatarLabel } from './Avatar';

const meta = {
  title: 'Components/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: 'Initials (or a photo) for a person or account. `AvatarLabel` adds a title and description next to it.' } },
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['small', 'medium', 'large', 'xlarge'] },
    shape: { control: 'inline-radio', options: ['circle', 'square'] },
  },
  args: { name: 'Nineth sub-account', size: 'medium', shape: 'circle' },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Initials: Story = {};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <Avatar {...args} size="small" />
      <Avatar {...args} size="medium" />
      <Avatar {...args} size="large" />
      <Avatar {...args} size="xlarge" />
    </div>
  ),
};

/** Avatar + title + description, as in the Accounts table Name column. */
export const WithLabel: Story = {
  render: () => <AvatarLabel title="Eighth sub-account" description="INDIVIDUAL" />,
};

export const WithBadge: Story = {
  render: () => (
    <AvatarLabel title="Business Account" description="BUSINESS" extra={<StatusBadge tone="warning">Parent</StatusBadge>} />
  ),
};
