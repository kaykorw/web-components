// Story names MUST match the Flutter Widgetbook use-case names.
// Never rename a story once it's embedded in zeroheight.
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { Icon } from '../Icon';
import { Button } from './Button';

const iconOptions = {
  none: undefined,
  plus: <Icon name="plus" />,
  filter: <Icon name="filter" />,
  search: <Icon name="search" />,
  chevronDown: <Icon name="chevronDown" />,
  refresh: <Icon name="refresh" />,
};

const meta = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Triggers an action. One primary button per view; secondary for supporting actions ("Filters", "Cancel"), ghost for low-emphasis actions ("Reset"), link for navigation-like actions ("Back to login"), danger for destructive ones.',
      },
    },
  },
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'ghost', 'link', 'danger'] },
    size: { control: 'inline-radio', options: ['small', 'medium', 'large'] },
    leadingIcon: { control: 'select', options: Object.keys(iconOptions), mapping: iconOptions },
    trailingIcon: { control: 'select', options: Object.keys(iconOptions), mapping: iconOptions },
  },
  args: {
    children: 'Button',
    variant: 'primary',
    size: 'medium',
    disabled: false,
    loading: false,
    fullWidth: false,
    onClick: fn(),
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Secondary: Story = {
  args: { variant: 'secondary' },
};

export const Ghost: Story = {
  args: { variant: 'ghost', children: 'Reset', leadingIcon: <Icon name="refresh" /> },
};

export const Link: Story = {
  args: { variant: 'link', children: 'Back to login' },
};

export const Danger: Story = {
  args: { variant: 'danger', children: 'Delete' },
};

export const WithIcon: Story = {
  args: { children: 'New account', leadingIcon: <Icon name="plus" /> },
};

/** Toggle state, e.g. the Filters button while its popover is open. */
export const Selected: Story = {
  args: { variant: 'secondary', children: 'Filters', leadingIcon: <Icon name="filter" />, selected: true },
};

export const IconOnly: Story = {
  args: { variant: 'secondary', iconOnly: true, children: <Icon name="more" />, 'aria-label': 'More actions' },
};

export const FullWidth: Story = {
  args: { children: 'Verify and sign in', size: 'large', fullWidth: true },
  decorators: [(Story) => <div style={{ width: 400 }}><Story /></div>],
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const Loading: Story = {
  args: { loading: true },
};
