// Story names MUST match the Flutter Widgetbook use-case names.
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useMemo, useState } from 'react';

import { AvatarLabel } from '../Avatar';
import { Button } from '../Button';
import { Icon } from '../Icon';
import { Pagination } from '../Pagination';
import { StatusBadge } from '../StatusBadge';
import { Table, type TableColumn, type TableSort } from './Table';

interface Account {
  id: string;
  name: string;
  type: 'INDIVIDUAL' | 'BUSINESS';
  parent?: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  opened: string;
}

const ordinals = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Nineth'];
const accounts: Account[] = [
  ...ordinals
    .map((word, i) => ({
      id: String(26019381231 + i),
      name: `${word} sub-account`,
      type: 'INDIVIDUAL' as const,
      status: 'ACTIVE' as const,
      opened: `2026-11-16, 16:${String(43 + Math.floor(i / 2)).padStart(2, '0')}`,
    }))
    .reverse(),
  { id: '26019381230', name: 'Business Account', type: 'BUSINESS', parent: true, status: 'ACTIVE', opened: '2026-11-10, 12:47' },
];

const columns: TableColumn<Account>[] = [
  { key: 'id', header: 'Account ID', width: '18%', sortable: true },
  {
    key: 'name',
    header: 'Name',
    sortable: true,
    cell: (row) => (
      <AvatarLabel
        title={row.name}
        description={row.type}
        extra={row.parent ? <StatusBadge tone="warning">Parent</StatusBadge> : undefined}
      />
    ),
  },
  {
    key: 'status',
    header: 'Status',
    width: '16%',
    cell: (row) => (
      <StatusBadge tone={row.status === 'ACTIVE' ? 'success' : 'danger'} dot>
        {row.status}
      </StatusBadge>
    ),
  },
  { key: 'opened', header: 'Opened', width: '18%', sortable: true, muted: true },
];

const meta = {
  title: 'Components/Table',
  component: Table<Account>,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Rows of records. Columns render any content via `cell` (AvatarLabel, StatusBadge...). Optional checkbox selection with select-all, sortable headers (you sort the data), clickable rows, loading and empty states, and a footer for Pagination.',
      },
    },
  },
  argTypes: {
    density: { control: 'inline-radio', options: ['comfortable', 'compact'] },
    columns: { control: false },
    rows: { control: false },
    getRowId: { control: false },
    footer: { control: false },
  },
  args: {
    caption: 'Accounts',
    columns,
    rows: accounts,
    getRowId: (row) => row.id,
    selectable: true,
    loading: false,
    density: 'comfortable',
    footer: <Pagination page={1} pageCount={1} onPageChange={() => {}} />,
  },
} satisfies Meta<typeof Table<Account>>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The Accounts table. */
export const Default: Story = {};

export const Sortable: Story = {
  render: function Render(args) {
    const [sort, setSort] = useState<TableSort>({ key: 'opened', direction: 'desc' });
    const sorted = useMemo(() => {
      const key = sort.key as keyof Account;
      return [...accounts].sort((a, b) => String(a[key]).localeCompare(String(b[key])) * (sort.direction === 'asc' ? 1 : -1));
    }, [sort]);
    return <Table {...args} rows={sorted} sort={sort} onSortChange={setSort} />;
  },
};

export const Clickable: Story = {
  args: { selectable: false, onRowClick: () => {} },
};

export const Compact: Story = {
  args: { density: 'compact', selectable: false },
};

export const Loading: Story = {
  args: { loading: true },
};

export const Empty: Story = {
  args: {
    rows: [],
    emptyState: (
      <div style={{ display: 'grid', gap: 12, justifyItems: 'center' }}>
        <span>No accounts match these filters.</span>
        <Button variant="secondary" size="small" leadingIcon={<Icon name="refresh" />}>
          Reset filters
        </Button>
      </div>
    ),
  },
};
