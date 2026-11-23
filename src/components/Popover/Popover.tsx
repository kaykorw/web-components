import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

import styles from './Popover.module.css';

/** Same values as Flutter `AppPopoverPlacement`. */
export type PopoverPlacement = 'bottom-start' | 'bottom-end' | 'bottom' | 'top-start' | 'top-end' | 'top';

export interface PopoverRenderProps {
  /** Close the popover (e.g. from a Done or Cancel button). */
  close: () => void;
}

export interface PopoverProps {
  /**
   * The element that opens the popover, usually a Button. Pass a function to style it
   * while open, e.g. `(open) => <Button selected={open}>Filters</Button>`.
   */
  trigger: ReactElement | ((open: boolean) => ReactElement);
  /** Panel content. A function receives `{ close }`. */
  children: ReactNode | ((props: PopoverRenderProps) => ReactNode);
  /** Open state (controlled). */
  open?: boolean;
  /** Initial open state (uncontrolled). */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Where the panel sits relative to the trigger. Flips above/below when there's no room. */
  placement?: PopoverPlacement;
  /** Gap between trigger and panel, in px. */
  offset?: number;
  /** Panel width in px, or 'trigger' to match the trigger's width. Defaults to the content's width. */
  width?: number | 'trigger';
  /** Heading row with a divider, e.g. "Filters". Also names the dialog for screen readers. */
  title?: ReactNode;
  /** Footer row with a divider, e.g. Reset + Done. A function receives `{ close }`. */
  footer?: ReactNode | ((props: PopoverRenderProps) => ReactNode);
  /** Remove the panel's inner padding (for menus and custom layouts). */
  flush?: boolean;
  /** Close when clicking outside the panel. */
  closeOnOutsideClick?: boolean;
  /** Accessible name when there's no `title`. Without either, the panel is named after its trigger. */
  'aria-label'?: string;
  className?: string;
}

interface Position {
  top: number;
  left: number;
  width?: number;
  placement: PopoverPlacement;
}

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Floating panel anchored to a trigger: filters, pickers, menus. Esc or an outside click closes it. */
export function Popover({
  trigger,
  children,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  placement = 'bottom-start',
  offset = 8,
  width,
  title,
  footer,
  flush = false,
  closeOnOutsideClick = true,
  'aria-label': ariaLabel,
  className,
}: PopoverProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = openProp ?? internalOpen;
  const anchorRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<Position | null>(null);
  const panelId = useId();
  const titleId = useId();
  const anchorId = useId();

  const setOpen = useCallback(
    (next: boolean) => {
      if (openProp === undefined) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [openProp, onOpenChange],
  );

  const close = useCallback(() => {
    setOpen(false);
    // Return focus to the trigger (looked up by id so `close` can be handed to render functions).
    document.getElementById(anchorId)?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
  }, [setOpen, anchorId]);

  const updatePosition = useCallback(() => {
    const anchor = anchorRef.current;
    const panel = panelRef.current;
    if (!anchor || !panel) return;
    const a = anchor.getBoundingClientRect();
    const panelHeight = panel.offsetHeight;
    const panelWidth = width === 'trigger' ? a.width : panel.offsetWidth;
    const below = placement.startsWith('bottom');
    const fitsBelow = a.bottom + offset + panelHeight <= window.innerHeight;
    const fitsAbove = a.top - offset - panelHeight >= 0;
    const goBelow = below ? fitsBelow || !fitsAbove : !(fitsAbove || !fitsBelow);
    const align = placement.endsWith('-end') ? 'end' : placement.endsWith('-start') ? 'start' : 'center';
    let left = align === 'start' ? a.left : align === 'end' ? a.right - panelWidth : a.left + a.width / 2 - panelWidth / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - panelWidth - 8));
    const top = goBelow ? a.bottom + offset : a.top - offset - panelHeight;
    const side = goBelow ? 'bottom' : 'top';
    setPosition({
      top,
      left,
      width: width === 'trigger' ? a.width : typeof width === 'number' ? width : undefined,
      placement: (align === 'center' ? side : `${side}-${align}`) as PopoverPlacement,
    });
  }, [placement, offset, width]);

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open, updatePosition]);

  // Move focus into the panel when it opens.
  useEffect(() => {
    if (!open || !position) return;
    const panel = panelRef.current;
    if (panel && !panel.contains(document.activeElement)) {
      (panel.querySelector<HTMLElement>(FOCUSABLE) ?? panel).focus();
    }
  }, [open, position]);

  // Outside click and Escape.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (panelRef.current?.contains(target) || anchorRef.current?.contains(target)) return;
      if (closeOnOutsideClick) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.stopPropagation();
        close();
      }
    }
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, closeOnOutsideClick, setOpen, close]);

  const triggerElement = typeof trigger === 'function' ? trigger(open) : trigger;
  const renderProps = { close };
  const content = typeof children === 'function' ? children(renderProps) : children;
  const footerContent = typeof footer === 'function' ? footer(renderProps) : footer;

  // A position from a previous opening is ignored until it's measured again.
  const shown = open ? position : null;
  const panelStyle: CSSProperties = shown
    ? { top: shown.top, left: shown.left, width: shown.width }
    : { top: 0, left: 0, visibility: 'hidden', width: width === 'trigger' ? undefined : typeof width === 'number' ? width : undefined };

  return (
    <>
      <span ref={anchorRef} id={anchorId} className={styles.anchor} onClick={() => setOpen(!open)}>
        {isValidElement(triggerElement)
          ? cloneElement(triggerElement as ReactElement<Record<string, unknown>>, {
              'aria-expanded': open,
              'aria-haspopup': 'dialog',
              'aria-controls': open ? panelId : undefined,
            })
          : triggerElement}
      </span>
      {open &&
        createPortal(
          <div
            ref={panelRef}
            id={panelId}
            role="dialog"
            aria-labelledby={title ? titleId : ariaLabel ? undefined : anchorId}
            aria-label={title ? undefined : ariaLabel}
            tabIndex={-1}
            data-placement={shown?.placement}
            className={[styles.panel, className].filter(Boolean).join(' ')}
            style={panelStyle}
          >
            {title && (
              <div id={titleId} className={styles.header}>
                {title}
              </div>
            )}
            <div className={flush ? styles.bodyFlush : styles.body}>{content}</div>
            {footerContent && <div className={styles.footer}>{footerContent}</div>}
          </div>,
          document.body,
        )}
    </>
  );
}
