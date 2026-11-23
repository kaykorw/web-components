/**
 * Page numbers with "ellipsis" gaps: (5, 20, 1) -> 1 … 4 5 6 … 20.
 * Always shows the first and last page. Same rule as Flutter appPageItems().
 */
export function getPageItems(page: number, pageCount: number, siblingCount = 1): (number | 'ellipsis')[] {
  const totalShown = siblingCount * 2 + 5; // first, last, current, 2 gaps
  if (pageCount <= totalShown) return Array.from({ length: pageCount }, (_, i) => i + 1);

  const left = Math.max(page - siblingCount, 1);
  const right = Math.min(page + siblingCount, pageCount);
  const showLeftGap = left > 3;
  const showRightGap = right < pageCount - 2;

  if (!showLeftGap) {
    const count = 3 + siblingCount * 2;
    return [...Array.from({ length: count }, (_, i) => i + 1), 'ellipsis', pageCount];
  }
  if (!showRightGap) {
    const count = 3 + siblingCount * 2;
    return [1, 'ellipsis', ...Array.from({ length: count }, (_, i) => pageCount - count + i + 1)];
  }
  return [1, 'ellipsis', ...Array.from({ length: right - left + 1 }, (_, i) => left + i), 'ellipsis', pageCount];
}
