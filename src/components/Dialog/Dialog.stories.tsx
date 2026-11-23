// Story names MUST match the Flutter Widgetbook use-case names.
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useArgs } from 'storybook/preview-api';
import { fn } from 'storybook/test';

import { Button } from '../Button/Button';
import { Select } from '../Select';
import { TextField } from '../TextField';
import { Dialog } from './Dialog';

const meta = {
  title: 'Components/Dialog',
  component: Dialog,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Modal dialog (`placement="center"`) or side sheet (`placement="right"`). Focus stays inside, Esc and a backdrop click close it (unless `dismissible={false}`), and the page behind is blurred.',
      },
      story: { inline: false, iframeHeight: 640 },
    },
  },
  argTypes: {
    placement: { control: 'inline-radio', options: ['center', 'right', 'left'] },
    size: { control: 'inline-radio', options: ['small', 'medium', 'large'] },
    footerLayout: { control: 'inline-radio', options: ['end', 'stretch'] },
    children: { control: false },
    footer: { control: false },
  },
  args: {
    open: true,
    onOpenChange: fn(),
    title: 'Delete this account?',
    description: 'The account will be closed and its balance moved to the parent account. You can’t undo this.',
    placement: 'center',
    size: 'small',
    dismissible: true,
  },
  render: function Render(args) {
    const [, updateArgs] = useArgs();
    const close = () => updateArgs({ open: false });
    return (
      <>
        <Button onClick={() => updateArgs({ open: true })}>Open</Button>
        <Dialog
          {...args}
          onOpenChange={(open) => {
            args.onOpenChange(open);
            updateArgs({ open });
          }}
          footer={
            args.footer ?? (
              <>
                <Button variant="secondary" onClick={close}>
                  Cancel
                </Button>
                <Button variant="danger" onClick={close}>
                  Delete account
                </Button>
              </>
            )
          }
        />
      </>
    );
  },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** The New Account sheet. */
export const Sheet: Story = {
  args: {
    placement: 'right',
    size: 'medium',
    title: 'New Account',
    description: 'Open a new account to hold and move funds.',
    children: (
      <div style={{ display: 'grid', gap: 20 }}>
        <TextField label="Account name" required placeholder="e.g. John Doe" autoFocus />
        <Select
          label="Account type"
          required
          defaultValue="INDIVIDUAL"
          options={[
            { value: 'INDIVIDUAL', label: 'Individual' },
            { value: 'BUSINESS', label: 'Business' },
          ]}
        />
        <TextField label="Notes" placeholder="Primary personal account" />
      </div>
    ),
    footer: (
      <>
        <Button variant="secondary" size="large">
          Cancel
        </Button>
        <Button size="large" disabled>
          Create Account
        </Button>
      </>
    ),
  },
};

export const Large: Story = {
  args: {
    size: 'large',
    title: 'Statement preview',
    description: 'November 2026',
    children: <p style={{ margin: 0 }}>Long content scrolls inside the dialog while the header and footer stay put.</p>,
    footer: <Button>Download PDF</Button>,
  },
};

/** Must be finished or cancelled: no Esc, no backdrop click. */
export const NotDismissible: Story = {
  args: { dismissible: false, hideCloseButton: true },
};
