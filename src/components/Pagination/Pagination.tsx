import type { HTMLAttributes } from 'react';

import { Icon } from '../Icon';
import styles from './Pagination.module.css';
import { getPageItems } from './pageItems';

export interface PaginationProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  /** Current page, starting at 1. */
  page: number;
  /** Total number of pages. */
  pageCount: number;
  onPageChange: (page: number) => void;
  /** Page numbers shown on each side of the current one before "…". */
  siblingCount?: number;
  /** "Page 1 of 1" on the left. */
  showLabel?: boolean;
  /** Hide the page numbers and keep only the arrows (compact layouts, phones). */
  compact?: boolean;
  /** Builds the label. Default: "Page {page} of {pageCount}". */
  formatLabel?: (page: number, pageCount: number) => string;
  previousLabel?: string;
  nextLabel?: string;
}

/** Page navigation, as in the Accounts table footer: "Page 1 of 1", arrows and page numbers. */
export function Pagination({
  page,
  pageCount,
  onPageChange,
  siblingCount = 1,
  showLabel = true,
  compact = false,
  formatLabel = (current, total) => `Page ${current} of ${total}`,
  previousLabel = 'Previous page',
  nextLabel = 'Next page',
  className,
  ...rest
}: PaginationProps) {
  const total = Math.max(1, pageCount);
  const current = Math.min(Math.max(1, page), total);
  const items = getPageItems(current, total, siblingCount);

  return (
    <nav aria-label="Pagination" {...rest} className={[styles.root, className].filter(Boolean).join(' ')}>
      {showLabel && (
        <span className={styles.label} aria-live="polite">
          {formatLabel(current, total)}
        </span>
      )}
      <div className={styles.controls}>
        <button
          type="button"
          className={styles.arrow}
          aria-label={previousLabel}
          disabled={current <= 1}
          onClick={() => onPageChange(current - 1)}
        >
          <Icon name="chevronLeft" size={16} />
        </button>
        {!compact &&
          items.map((item, index) =>
            item === 'ellipsis' ? (
              <span key={`ellipsis-${index}`} className={styles.ellipsis} aria-hidden="true">
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                className={[styles.page, item === current && styles.current].filter(Boolean).join(' ')}
                aria-label={`Page ${item}`}
                aria-current={item === current ? 'page' : undefined}
                onClick={() => onPageChange(item)}
              >
                {item}
              </button>
            ),
          )}
        <button
          type="button"
          className={styles.arrow}
          aria-label={nextLabel}
          disabled={current >= total}
          onClick={() => onPageChange(current + 1)}
        >
          <Icon name="chevronRight" size={16} />
        </button>
      </div>
    </nav>
  );
}
