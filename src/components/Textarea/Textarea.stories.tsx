// Story names MUST match the Flutter Widgetbook use-case names.
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { Textarea } from './Textarea';

const meta = {
  title: 'Components/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: { resize: { control: 'inline-radio', options: ['vertical', 'none'] } },
  args: { label: 'Notes', placeholder: 'Primary personal account', rows: 4, onChange: fn(), style: { width: 360 } },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithCount: Story = {
  args: { maxLength: 200, showCount: true, defaultValue: 'Used for salary payments.' },
};

export const Error: Story = {
  args: { required: true, error: 'Add a note.' },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'Read-only note' },
};
