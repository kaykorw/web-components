// Story names (Default, Checked, Indeterminate, Disabled, Error) MUST match the
// Flutter Widgetbook use-case names. Never rename them once embedded in zeroheight.
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useArgs } from 'storybook/preview-api';
import { fn } from 'storybook/test';

import { Checkbox } from './Checkbox';

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Lets people turn one option on or off, or pick several options from a list. For a single on/off setting that applies immediately, use a switch instead.',
      },
    },
  },
  argTypes: {
    checked: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
    disabled: { control: 'boolean' },
    label: { control: 'text' },
    description: { control: 'text' },
    error: { control: 'text' },
  },
  args: {
    label: 'Email me a receipt',
    checked: false,
    indeterminate: false,
    disabled: false,
    onChange: fn(),
  },
  // Clicking the checkbox updates the `checked` control, so the canvas and the
  // Controls panel never disagree.
  render: function Render(args) {
    const [, updateArgs] = useArgs();
    return (
      <Checkbox
        {...args}
        onChange={(event) => {
          args.onChange?.(event);
          updateArgs({ checked: event.target.checked, indeterminate: false });
        }}
      />
    );
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { description: 'Sent to the address on your account.' },
};

export const Checked: Story = {
  args: { checked: true },
};

export const Indeterminate: Story = {
  args: { label: 'Select all products', indeterminate: true },
};

export const Disabled: Story = {
  args: { checked: true, disabled: true },
};

export const Error: Story = {
  args: { label: 'I accept the terms', error: 'Accept the terms to continue.' },
};
