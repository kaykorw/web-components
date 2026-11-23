// Story names MUST match the Flutter Widgetbook use-case names.
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { Button } from '../Button';
import { Card } from '../Card';
import { Icon } from '../Icon';
import { IconTile } from '../IconTile';
import { VerificationCodeInput } from './VerificationCodeInput';

const meta = {
  title: 'Components/VerificationCodeInput',
  component: VerificationCodeInput,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'One box per character for one-time codes. Typing advances, Backspace goes back, arrows move, and pasting fills every box. The first box has autocomplete="one-time-code" so phones can fill it from SMS.',
      },
    },
  },
  argTypes: {
    type: { control: 'inline-radio', options: ['numeric', 'alphanumeric'] },
    size: { control: 'inline-radio', options: ['small', 'medium', 'large'] },
    align: { control: 'inline-radio', options: ['center', 'start'] },
  },
  args: {
    label: 'Verification code',
    length: 6,
    type: 'numeric',
    size: 'medium',
    mask: false,
    disabled: false,
    onChange: fn(),
    onComplete: fn(),
  },
} satisfies Meta<typeof VerificationCodeInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Filled: Story = {
  args: { defaultValue: '482913' },
};

export const Error: Story = {
  args: { defaultValue: '482910', error: 'That code is not right. Check the email and try again.' },
};

export const Masked: Story = {
  args: { defaultValue: '4829', length: 4, mask: true, label: 'PIN' },
};

export const Disabled: Story = {
  args: { disabled: true },
};

/** The full "Verify your email" card, built from Card, IconTile, VerificationCodeInput and Button. */
export const VerifyEmail: Story = {
  render: (args) => (
    <Card style={{ width: 480, textAlign: 'center', borderRadius: 20 }} padding="large">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, padding: '24px 8px' }}>
        <IconTile size="large">
          <Icon name="mailCheck" />
        </IconTile>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: 'var(--kayko-color-text-heading)' }}>
            Verify your email.
          </h1>
          <p style={{ margin: '8px 0 0', color: 'var(--kayko-color-text-subtle)' }}>Verification code has been sent</p>
        </div>
        <VerificationCodeInput {...args} />
        <p style={{ margin: 0, color: 'var(--kayko-color-text-muted)', fontSize: 14 }}>
          Didn&apos;t receive the code? <span style={{ color: 'var(--kayko-color-text-subtle)' }}>Resend code in 47s</span>
        </p>
        <Button size="large" fullWidth disabled>
          Verify and sign in
        </Button>
        <Button variant="link">Back to login</Button>
      </div>
    </Card>
  ),
};
