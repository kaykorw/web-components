import { forwardRef, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from 'react';

import { Icon } from '../Icon';
import styles from './Menu.module.css';

/** Same values as Flutter `AppMenuItemTrailing`. */
export type MenuItemTrailing = 'none' | 'chevron' | 'check';

export interface MenuItemProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Item text, e.g. "Status" or "Last 7 days". */
  children: ReactNode;
  /** Highlighted as the current choice (light blue). */
  selected?: boolean;
  /** Icon before the label. */
  leadingIcon?: ReactNode;
  /** chevron: opens more (Filters categories). check: shows a check when selected (presets). Or any node. */
  trailing?: MenuItemTrailing | ReactNode;
  /** Smaller second line under the label. */
  description?: ReactNode;
  /** Red text for destructive actions ("Delete account"). */
  danger?: boolean;
}

/**
 * One row in a list of choices: filter categories, date presets, dropdown menus, sidebar links.
 * Set `role` to fit the list: "option" (listbox), "tab" (tablist), "menuitem" or "menuitemradio" (menu).
 */
export const MenuItem = forwardRef<HTMLButtonElement, MenuItemProps>(function MenuItem(
  { children, selected = false, leadingIcon, trailing = 'none', description, danger = false, role, className, type = 'button', ...rest },
  ref,
) {
  const selectionProps =
    role === 'option' || role === 'tab'
      ? { 'aria-selected': selected }
      : role === 'menuitemradio' || role === 'menuitemcheckbox'
        ? { 'aria-checked': selected }
        : { 'aria-current': selected ? ('true' as const) : undefined };

  const trailingNode =
    trailing === 'chevron' ? (
      <Icon name="chevronRight" size={16} />
    ) : trailing === 'check' ? (
      selected ? <Icon name="check" size={16} /> : null
    ) : trailing === 'none' ? null : (
      trailing
    );

  return (
    <button
      {...rest}
      {...selectionProps}
      ref={ref}
      type={type}
      role={role}
      className={[styles.item, selected && styles.selected, danger && styles.danger, className].filter(Boolean).join(' ')}
    >
      {leadingIcon && <span className={styles.leading}>{leadingIcon}</span>}
      <span className={styles.text}>
        <span className={styles.label}>{children}</span>
        {description && <span className={styles.description}>{description}</span>}
      </span>
      {trailingNode && <span className={trailing === 'chevron' ? styles.chevron : styles.trailing}>{trailingNode}</span>}
    </button>
  );
});

export interface MenuProps extends HTMLAttributes<HTMLDivElement> {
  /** listbox (pick one value), menu (actions), tablist (switch panels) or none for plain lists. */
  role?: 'listbox' | 'menu' | 'tablist' | 'list';
  /** Accessible name of the list. */
  'aria-label'?: string;
  children: ReactNode;
}

/** Vertical list of MenuItems. Up/Down arrows move between items. */
export function Menu({ role = 'list', className, children, onKeyDown, ...rest }: MenuProps) {
  return (
    <div
      {...rest}
      role={role === 'list' ? undefined : role}
      aria-orientation={role === 'tablist' ? 'vertical' : undefined}
      className={[styles.menu, className].filter(Boolean).join(' ')}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
        const items = [...event.currentTarget.querySelectorAll<HTMLButtonElement>(`.${styles.item}:not(:disabled)`)];
        const index = items.indexOf(document.activeElement as HTMLButtonElement);
        if (index === -1) return;
        event.preventDefault();
        items[(index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length]?.focus();
      }}
    >
      {children}
    </div>
  );
}
