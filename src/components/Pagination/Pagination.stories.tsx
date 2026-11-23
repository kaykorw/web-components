// Story names MUST match the Flutter Widgetbook use-case names.
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useArgs } from 'storybook/preview-api';
import { fn } from 'storybook/test';

import { Pagination } from './Pagination';

const meta = {
  title: 'Components/Pagination',
  component: Pagination,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: { page: 1, pageCount: 1, onPageChange: fn(), showLabel: true, compact: false, siblingCount: 1 },
  render: function Render(args) {
    const [, updateArgs] = useArgs();
    return (
      <Pagination
        {...args}
        onPageChange={(page) => {
          args.onPageChange(page);
          updateArgs({ page });
        }}
      />
    );
  },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

/** As in the Accounts table: one page. */
export const Default: Story = {};

export const ManyPages: Story = {
  args: { page: 5, pageCount: 20 },
};

export const Compact: Story = {
  args: { page: 2, pageCount: 8, compact: true },
};
