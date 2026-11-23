// Story names MUST match the Flutter Widgetbook use-case names.
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { Select } from './Select';

const accountTypes = [
  { value: 'INDIVIDUAL', label: 'Individual' },
  { value: 'BUSINESS', label: 'Business' },
  { value: 'JOINT', label: 'Joint', disabled: true },
];

const meta = {
  title: 'Components/Select',
  component: Select,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: { size: { control: 'inline-radio', options: ['small', 'medium', 'large'] } },
  args: {
    label: 'Account type',
    options: accountTypes,
    required: true,
    disabled: false,
    onChange: fn(),
    style: { width: 360 },
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

/** As in the New Account sheet. */
export const Default: Story = {
  args: { defaultValue: 'INDIVIDUAL' },
};

export const Placeholder: Story = {
  args: { placeholder: 'Choose a type' },
};

export const Error: Story = {
  args: { placeholder: 'Choose a type', error: 'Choose an account type.' },
};

export const Disabled: Story = {
  args: { defaultValue: 'BUSINESS', disabled: true },
};
