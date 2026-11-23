// Story names MUST match the Flutter Widgetbook use-case names.
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Icon } from '../Icon';
import { Menu, MenuItem } from './Menu';

const meta = {
  title: 'Components/Menu',
  component: MenuItem,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Rows in a list of choices: date presets, filter categories, action menus, sidebar links. `Menu` wraps them and adds Up/Down arrow navigation.',
      },
    },
  },
  argTypes: { trailing: { control: 'inline-radio', options: ['none', 'chevron', 'check'] } },
  args: { children: 'Last 7 days', selected: false, trailing: 'none' },
  decorators: [(Story) => <div style={{ width: 240 }}><Story /></div>],
} satisfies Meta<typeof MenuItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Selected: Story = {
  args: { selected: true, trailing: 'check' },
};

const presets = ['Select date range', 'Today', 'Last 7 days', 'Last 30 days', 'This month', 'Custom range'];

/** As in the date range picker. */
export const Presets: Story = {
  render: function Render() {
    const [value, setValue] = useState(presets[0]);
    return (
      <Menu role="listbox" aria-label="Date presets">
        {presets.map((item) => (
          <MenuItem key={item} role="option" trailing="check" selected={item === value} onClick={() => setValue(item)}>
            {item}
          </MenuItem>
        ))}
      </Menu>
    );
  },
};

/** As in the Filters panel. */
export const Categories: Story = {
  render: function Render() {
    const [value, setValue] = useState('Status');
    return (
      <Menu role="tablist" aria-label="Filter by">
        {['Status', 'Type', 'Date range'].map((item) => (
          <MenuItem key={item} role="tab" trailing="chevron" selected={item === value} onClick={() => setValue(item)}>
            {item}
          </MenuItem>
        ))}
      </Menu>
    );
  },
};

export const WithIcons: Story = {
  render: () => (
    <Menu role="menu" aria-label="Account actions">
      <MenuItem role="menuitem" leadingIcon={<Icon name="user" />}>View details</MenuItem>
      <MenuItem role="menuitem" leadingIcon={<Icon name="mail" />} description="PDF, last 30 days">
        Send statement
      </MenuItem>
      <MenuItem role="menuitem" leadingIcon={<Icon name="calendar" />} disabled>
        Schedule (soon)
      </MenuItem>
      <MenuItem role="menuitem" danger leadingIcon={<Icon name="close" />}>
        Close account
      </MenuItem>
    </Menu>
  ),
};
