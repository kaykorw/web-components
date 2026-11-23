import { useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react';

import { Checkbox } from '../Checkbox';
import { Icon } from '../Icon';
import styles from './Table.module.css';

export type SortDirection = 'asc' | 'desc';

export interface TableSort {
  key: string;
  direction: SortDirection;
}

export interface TableColumn<Row> {
  /** Unique id. Also the default property to show (`row[key]`) and the sort key. */
  key: string;
  /** Header text, e.g. "Account ID". */
  header: ReactNode;
  /** Custom cell, e.g. `(row) => <StatusBadge tone="success" dot>{row.status}</StatusBadge>`. */
  cell?: (row: Row, index: number) => ReactNode;
  /** CSS width, e.g. 160 or "30%". */
  width?: number | string;
  align?: 'start' | 'center' | 'end';
  /** Clicking the header calls onSortChange. Sorting the data is up to you (client or server). */
  sortable?: boolean;
  /** Grey secondary text, e.g. dates (as in the Opened column). */
  muted?: boolean;
}

export interface TableProps<Row> {
  columns: TableColumn<Row>[];
  rows: Row[];
  /** Stable id per row (used for selection and React keys). */
  getRowId: (row: Row) => string;
  /** Accessible name of the table, e.g. "Accounts". */
  caption: string;
  /** Show the caption visually above the table. */
  showCaption?: boolean;
  /** Checkbox column with select-all, as in the Accounts table. */
  selectable?: boolean;
  /** Selected row ids (controlled). */
  selectedIds?: string[];
  /** Initially selected row ids (uncontrolled). */
  defaultSelectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  /** Current sort, shown as an arrow in the header. */
  sort?: TableSort;
  onSortChange?: (sort: TableSort) => void;
  /** Makes rows clickable (and focusable: Enter opens). */
  onRowClick?: (row: Row) => void;
  /** Shows placeholder rows instead of data. */
  loading?: boolean;
  loadingRowCount?: number;
  /** Shown when there are no rows. */
  emptyState?: ReactNode;
  /** comfortable: 56 px rows (screenshot). compact: 44 px. */
  density?: 'comfortable' | 'compact';
  /** Keep the header visible while the body scrolls (set a max height on the table via className/style). */
  stickyHeader?: boolean;
  /** Under the rows, e.g. <Pagination />. */
  footer?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/** Data table with Kayko's styling: optional selection, sorting, loading and empty states, and a footer. */
export function Table<Row>({
  columns,
  rows,
  getRowId,
  caption,
  showCaption = false,
  selectable = false,
  selectedIds,
  defaultSelectedIds = [],
  onSelectionChange,
  sort,
  onSortChange,
  onRowClick,
  loading = false,
  loadingRowCount = 5,
  emptyState = 'No results',
  density = 'comfortable',
  stickyHeader = false,
  footer,
  className,
  style,
}: TableProps<Row>) {
  const [internalSelection, setInternalSelection] = useState<string[]>(defaultSelectedIds);
  const selection = selectedIds ?? internalSelection;
  const selectedSet = new Set(selection);
  const ids = rows.map(getRowId);
  const selectedOnPage = ids.filter((id) => selectedSet.has(id)).length;
  const allSelected = ids.length > 0 && selectedOnPage === ids.length;
  const someSelected = selectedOnPage > 0 && !allSelected;

  function setSelection(next: string[]) {
    if (selectedIds === undefined) setInternalSelection(next);
    onSelectionChange?.(next);
  }

  function toggleAll() {
    if (allSelected) setSelection(selection.filter((id) => !ids.includes(id)));
    else setSelection([...new Set([...selection, ...ids])]);
  }

  function toggleRow(id: string) {
    setSelection(selectedSet.has(id) ? selection.filter((x) => x !== id) : [...selection, id]);
  }

  function headerSort(column: TableColumn<Row>) {
    if (!column.sortable || !onSortChange) return;
    const direction: SortDirection = sort?.key === column.key && sort.direction === 'asc' ? 'desc' : 'asc';
    onSortChange({ key: column.key, direction });
  }

  const colSpan = columns.length + (selectable ? 1 : 0);
  const alignClass = (align?: TableColumn<Row>['align']) => (align === 'end' ? styles.end : align === 'center' ? styles.center : undefined);

  return (
    <div className={[styles.container, className].filter(Boolean).join(' ')} style={style}>
      <div className={styles.scroll}>
        <table className={[styles.table, styles[density], stickyHeader && styles.sticky].filter(Boolean).join(' ')} aria-busy={loading || undefined}>
          <caption className={showCaption ? styles.caption : styles.srOnly}>{caption}</caption>
          <thead>
            <tr>
              {selectable && (
                <th scope="col" className={styles.selectCell}>
                  <Checkbox
                    aria-label="Select all rows"
                    checked={allSelected}
                    indeterminate={someSelected}
                    disabled={loading || rows.length === 0}
                    onChange={toggleAll}
                  />
                </th>
              )}
              {columns.map((column) => {
                const isSorted = sort?.key === column.key;
                const ariaSort = isSorted ? (sort.direction === 'asc' ? 'ascending' : 'descending') : column.sortable ? 'none' : undefined;
                return (
                  <th
                    key={column.key}
                    scope="col"
                    aria-sort={ariaSort}
                    className={alignClass(column.align)}
                    style={{ width: column.width }}
                  >
                    {column.sortable && onSortChange ? (
                      <button type="button" className={styles.sortButton} onClick={() => headerSort(column)}>
                        {column.header}
                        <span className={[styles.sortIcon, isSorted && styles.sortActive].filter(Boolean).join(' ')}>
                          <Icon name={isSorted && sort.direction === 'desc' ? 'arrowDown' : 'arrowUp'} size={14} />
                        </span>
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: loadingRowCount }, (_, i) => (
                <tr key={`loading-${i}`} className={styles.loadingRow}>
                  {selectable && <td className={styles.selectCell} />}
                  {columns.map((column) => (
                    <td key={column.key}>
                      <span className={styles.skeleton} />
                    </td>
                  ))}
                </tr>
              ))}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={colSpan} className={styles.empty}>
                  {emptyState}
                </td>
              </tr>
            )}
            {!loading &&
              rows.map((row, index) => {
                const id = getRowId(row);
                const isSelected = selectedSet.has(id);
                const clickable = !!onRowClick;
                return (
                  <tr
                    key={id}
                    aria-selected={selectable ? isSelected : undefined}
                    className={[clickable && styles.clickable, isSelected && styles.selected].filter(Boolean).join(' ')}
                    tabIndex={clickable ? 0 : undefined}
                    onClick={clickable ? () => onRowClick(row) : undefined}
                    onKeyDown={
                      clickable
                        ? (event: KeyboardEvent<HTMLTableRowElement>) => {
                            if (event.key === 'Enter' && event.target === event.currentTarget) onRowClick(row);
                          }
                        : undefined
                    }
                  >
                    {selectable && (
                      <td className={styles.selectCell} onClick={(event) => event.stopPropagation()}>
                        <Checkbox aria-label={`Select row ${index + 1}`} checked={isSelected} onChange={() => toggleRow(id)} />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td key={column.key} className={[alignClass(column.align), column.muted && styles.muted].filter(Boolean).join(' ') || undefined}>
                        {column.cell ? column.cell(row, index) : String((row as Record<string, unknown>)[column.key] ?? '')}
                      </td>
                    ))}
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  );
}
