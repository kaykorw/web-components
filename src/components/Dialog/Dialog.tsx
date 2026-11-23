import { useEffect, useId, useRef, type ReactNode } from 'react';

import { Icon } from '../Icon';
import styles from './Dialog.module.css';

/** center: modal in the middle. right / left: full-height side sheet. Same values as Flutter. */
export type DialogPlacement = 'center' | 'right' | 'left';
/** center: 400 / 520 / 720 px wide. Sheets: 360 / 440 / 560 px. */
export type DialogSize = 'small' | 'medium' | 'large';

export interface DialogProps {
  open: boolean;
  /** Called with false when the dialog asks to close (× button, Esc, backdrop click). */
  onOpenChange: (open: boolean) => void;
  /** Heading, e.g. "New Account". */
  title: ReactNode;
  /** Text under the heading, e.g. "Open a new account to hold and move funds." */
  description?: ReactNode;
  /** Body: usually a form. Scrolls when it's taller than the screen. */
  children?: ReactNode;
  /** Actions, e.g. Cancel + Create Account. */
  footer?: ReactNode;
  placement?: DialogPlacement;
  size?: DialogSize;
  /** stretch: full-width stacked buttons (default for sheets). end: right-aligned row (default for center). */
  footerLayout?: 'end' | 'stretch';
  /** Esc and backdrop clicks close it. Set false for flows that must be finished or cancelled explicitly. */
  dismissible?: boolean;
  hideCloseButton?: boolean;
  /** Accessible name of the × button. */
  closeLabel?: string;
  className?: string;
}

/**
 * Modal dialog or side sheet (`placement="right"`, as in "New Account"). Built on the
 * native <dialog>: focus stays inside, Esc closes, the page behind is inert and blurred.
 */
export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  placement = 'center',
  size = 'medium',
  footerLayout,
  dismissible = true,
  hideCloseButton = false,
  closeLabel = 'Close',
  className,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const isSheet = placement !== 'center';
  const layout = footerLayout ?? (isSheet ? 'stretch' : 'end');

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      // Focus the first field of the body (or an element with data-autofocus) rather than the × button.
      const preferred =
        dialog.querySelector<HTMLElement>('[data-autofocus]') ??
        dialog.querySelector<HTMLElement>(
          `.${styles.body} :is(input, select, textarea, button, [tabindex]:not([tabindex="-1"])):not(:disabled)`,
        );
      preferred?.focus();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={[styles.dialog, styles[placement], styles[`${isSheet ? 'sheet' : 'center'}-${size}`], className]
        .filter(Boolean)
        .join(' ')}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(event) => {
        // Esc
        event.preventDefault();
        if (dismissible) onOpenChange(false);
      }}
      onClick={(event) => {
        // A click on the <dialog> itself (not its content) is a click on the backdrop.
        if (dismissible && event.target === event.currentTarget) onOpenChange(false);
      }}
    >
      {open && (
        <div className={styles.surface}>
          <header className={styles.header}>
            <div className={styles.headings}>
              <h2 id={titleId} className={styles.title}>
                {title}
              </h2>
              {description && (
                <p id={descriptionId} className={styles.description}>
                  {description}
                </p>
              )}
            </div>
            {!hideCloseButton && (
              <button type="button" className={styles.close} aria-label={closeLabel} onClick={() => onOpenChange(false)}>
                <Icon name="close" size={20} />
              </button>
            )}
          </header>
          {children && <div className={styles.body}>{children}</div>}
          {footer && <footer className={[styles.footer, styles[`footer-${layout}`]].join(' ')}>{footer}</footer>}
        </div>
      )}
    </dialog>
  );
}

export type SheetProps = Omit<DialogProps, 'placement'> & {
  /** Which edge the sheet slides in from. */
  side?: 'right' | 'left';
};

/** Side sheet: a Dialog that fills the height on the right (or left), like "New Account". */
export function Sheet({ side = 'right', ...props }: SheetProps) {
  return <Dialog {...props} placement={side} />;
}
