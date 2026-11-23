/** "Nineth sub-account" -> "NS", "Business Account" -> "BA", "kayko" -> "K". Same rule as Flutter. */
export function getInitials(name: string, max = 2): string {
  return name
    .trim()
    .split(/[\s\-_.]+/)
    .filter(Boolean)
    .slice(0, max)
    .map((word) => word[0]!.toUpperCase())
    .join('');
}
