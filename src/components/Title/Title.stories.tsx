// Story names MUST match the Flutter Widgetbook use-case names.
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../Button';
import { Icon } from '../Icon';
import { Title } from './Title';

const meta = {
  title: 'Components/Title',
  component: Title,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: { description: { component: 'Heading with description and actions. `page` for page headers, `section` for card and chart headers.' } },
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['page', 'section', 'card'] },
    actions: { control: false },
    leading: { control: false },
  },
  args: { title: 'Accounts', description: 'Manage accounts.', size: 'page' },
} satisfies Meta<typeof Title>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Page: Story = {};

/** As on the Accounts page. */
export const WithActions: Story = {
  args: {
    actions: (
      <>
        <Button variant="secondary" leadingIcon={<Icon name="filter" />}>
          Filters
        </Button>
        <Button leadingIcon={<Icon name="plus" />}>New account</Button>
      </>
    ),
  },
};

/** As on the Transaction volume chart. */
export const Section: Story = {
  args: {
    size: 'section',
    title: 'Transaction volume',
    description: 'Money in is everything received, money out is everything sent, and net is the difference.',
  },
};

export const Card: Story = {
  args: { size: 'card', title: 'Recent activity', description: 'Last 7 days' },
};
