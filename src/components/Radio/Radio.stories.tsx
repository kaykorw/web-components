// Story names MUST match the Flutter Widgetbook use-case names.
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useArgs } from 'storybook/preview-api';
import { fn } from 'storybook/test';

import { RadioGroup } from './Radio';

const statusOptions = [
  { value: 'ACTIVE', label: 'ACTIVE' },
  { value: 'INACTIVE', label: 'INACTIVE' },
];

const meta = {
  title: 'Components/Radio',
  component: RadioGroup,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: 'Pick exactly one option. For several options use Checkbox; for many options use Select.' } },
  },
  argTypes: {
    orientation: { control: 'inline-radio', options: ['vertical', 'horizontal'] },
    value: { control: 'inline-radio', options: ['ACTIVE', 'INACTIVE'] },
  },
  args: { 'aria-label': 'Status', options: statusOptions, orientation: 'vertical', disabled: false, onChange: fn() },
  render: function Render(args) {
    const [, updateArgs] = useArgs();
    return (
      <RadioGroup
        {...args}
        onChange={(value) => {
          args.onChange?.(value);
          updateArgs({ value });
        }}
      />
    );
  },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The Status filter. */
export const Default: Story = {};

export const Selected: Story = {
  args: { value: 'ACTIVE' },
};

export const WithDescriptions: Story = {
  args: {
    'aria-label': undefined,
    label: 'Account type',
    value: 'INDIVIDUAL',
    options: [
      { value: 'INDIVIDUAL', label: 'Individual', description: 'For one person.' },
      { value: 'BUSINESS', label: 'Business', description: 'Can hold sub-accounts.' },
    ],
  },
};

export const Horizontal: Story = {
  args: { orientation: 'horizontal', value: 'ACTIVE' },
};

export const Disabled: Story = {
  args: { disabled: true, value: 'ACTIVE' },
};

export const Error: Story = {
  args: { label: 'Status', 'aria-label': undefined, error: 'Pick a status.' },
};
