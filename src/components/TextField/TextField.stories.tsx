// Story names MUST match the Flutter Widgetbook use-case names.
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { Icon } from '../Icon';
import { TextField } from './TextField';

const meta = {
  title: 'Components/TextField',
  component: TextField,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Single-line input. Add a label, helper or error text, icons, prefix/suffix, and a clear button. All native input props (type, name, autoComplete, maxLength...) work.',
      },
    },
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['small', 'medium', 'large'] },
    leadingIcon: { control: false },
    trailing: { control: false },
  },
  args: {
    label: 'Account name',
    placeholder: 'e.g. John Doe',
    size: 'medium',
    required: false,
    disabled: false,
    onChange: fn(),
    style: { width: 360 },
  },
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** As in the New Account sheet. */
export const Required: Story = {
  args: { required: true },
};

export const WithDescription: Story = {
  args: { label: 'Notes', placeholder: 'Primary personal account', description: 'Only visible to your team.' },
};

/** As in the Accounts page header. */
export const Search: Story = {
  args: {
    label: undefined,
    'aria-label': 'Search accounts',
    type: 'search',
    placeholder: 'Search accounts...',
    leadingIcon: <Icon name="search" />,
    clearable: true,
    defaultValue: 'Business',
  },
};

export const WithPrefix: Story = {
  args: { label: 'Amount', placeholder: '0', prefix: 'RWF', inputMode: 'decimal' },
};

export const Error: Story = {
  args: { required: true, defaultValue: 'J', error: 'Use at least 2 characters.' },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'Business Account' },
};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 12, width: 360 }}>
      <TextField {...args} label={undefined} aria-label="Small" size="small" placeholder="Small (32 px)" />
      <TextField {...args} label={undefined} aria-label="Medium" size="medium" placeholder="Medium (40 px)" />
      <TextField {...args} label={undefined} aria-label="Large" size="large" placeholder="Large (48 px)" />
    </div>
  ),
};
