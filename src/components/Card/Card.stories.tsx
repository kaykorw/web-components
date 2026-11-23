// Story names MUST match the Flutter Widgetbook use-case names.
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Card } from './Card';

const meta = {
  title: 'Components/Card',
  component: Card,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['elevated', 'outlined', 'flat'] },
    padding: { control: 'inline-radio', options: ['none', 'small', 'medium', 'large'] },
  },
  args: {
    variant: 'elevated',
    padding: 'large',
    interactive: false,
    style: { width: 360 },
    children: 'Card content goes here. Put a Title, a list, a form or a table inside.',
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Elevated: Story = {};

export const Outlined: Story = {
  args: { variant: 'outlined' },
};

export const Flat: Story = {
  args: { variant: 'flat' },
};

export const Interactive: Story = {
  args: { interactive: true, tabIndex: 0, children: 'Hover me: the whole card is clickable.' },
};
