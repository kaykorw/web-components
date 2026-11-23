// Story names MUST match the Flutter Widgetbook use-case names.
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Button } from '../Button/Button';
import { Icon } from '../Icon';
import { Menu, MenuItem } from '../Menu';
import { RadioGroup } from '../Radio';
import { Popover } from './Popover';

const meta = {
  title: 'Components/Popover',
  component: Popover,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Floating panel anchored to a trigger. Esc or a click outside closes it and focus returns to the trigger. It flips above the trigger when there is no room below. Use `title` and `footer` for the header and footer rows.',
      },
      story: { inline: false, iframeHeight: 460 },
    },
  },
  argTypes: {
    placement: { control: 'select', options: ['bottom-start', 'bottom-end', 'bottom', 'top-start', 'top-end', 'top'] },
    trigger: { control: false },
    children: { control: false },
    footer: { control: false },
  },
  args: {
    placement: 'bottom-start',
    defaultOpen: true,
    trigger: <Button variant="secondary">Open popover</Button>,
    children: <p style={{ margin: 0, maxWidth: 260 }}>Any content: text, a form, a list, a calendar.</p>,
  },
  decorators: [(Story) => <div style={{ height: 360 }}><Story /></div>],
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithTitle: Story = {
  args: {
    title: 'Share report',
    footer: ({ close }) => (
      <>
        <Button variant="ghost" size="small" onClick={close}>
          Cancel
        </Button>
        <Button size="small" onClick={close}>
          Share
        </Button>
      </>
    ),
  },
};

const categories = ['Status', 'Type', 'Date range'] as const;

function FiltersExample() {
  const [category, setCategory] = useState<(typeof categories)[number]>('Status');
  const [status, setStatus] = useState<string>();
  return (
    <Popover
      defaultOpen
      placement="bottom-end"
      width={560}
      title="Filters"
      flush
      trigger={(open) => (
        <Button variant="secondary" selected={open} leadingIcon={<Icon name="filter" />}>
          Filters
        </Button>
      )}
      footer={({ close }) => (
        <>
          <Button variant="ghost" leadingIcon={<Icon name="refresh" />} disabled={!status} onClick={() => setStatus(undefined)}>
            Reset
          </Button>
          <Button onClick={close}>Done</Button>
        </>
      )}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '190px 1fr', minHeight: 220 }}>
        <Menu role="tablist" aria-label="Filter by" style={{ borderRight: '1px solid var(--kayko-color-border-subtle)' }}>
          {categories.map((item) => (
            <MenuItem key={item} role="tab" trailing="chevron" selected={item === category} onClick={() => setCategory(item)}>
              {item}
            </MenuItem>
          ))}
        </Menu>
        <div style={{ padding: 24 }} role="tabpanel" aria-label={category}>
          {category === 'Status' ? (
            <RadioGroup
              aria-label="Status"
              value={status ?? ''}
              onChange={setStatus}
              options={[
                { value: 'ACTIVE', label: 'ACTIVE' },
                { value: 'INACTIVE', label: 'INACTIVE' },
              ]}
            />
          ) : (
            <span style={{ color: 'var(--kayko-color-text-muted)' }}>{category} options go here.</span>
          )}
        </div>
      </div>
    </Popover>
  );
}

/** The Filters panel from the Accounts page: categories on the left, options on the right. */
export const Filters: Story = {
  render: () => <FiltersExample />,
};

/** Actions menu opened from an icon button. */
export const ActionsMenu: Story = {
  args: {
    placement: 'bottom-end',
    flush: true,
    'aria-label': 'Account actions',
    trigger: <Button variant="secondary" iconOnly aria-label="Account actions"><Icon name="more" /></Button>,
    children: ({ close }) => (
      <Menu role="menu" aria-label="Account actions" style={{ width: 200 }}>
        <MenuItem role="menuitem" leadingIcon={<Icon name="user" />} onClick={close}>View details</MenuItem>
        <MenuItem role="menuitem" leadingIcon={<Icon name="mail" />} onClick={close}>Send statement</MenuItem>
        <MenuItem role="menuitem" danger leadingIcon={<Icon name="close" />} onClick={close}>Close account</MenuItem>
      </Menu>
    ),
  },
};
