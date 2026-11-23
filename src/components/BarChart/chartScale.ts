/**
 * Axis maximum and ticks like the Transaction volume chart: 20 % headroom, rounded
 * up to a "nice" number, split into `tickCount` equal steps (500 -> 0,150,300,450,600).
 * Same rule as Flutter appChartTicks().
 */
export function chartTicks(maxValue: number, tickCount = 4): number[] {
  if (!(maxValue > 0)) return Array.from({ length: tickCount + 1 }, (_, i) => i);
  const target = maxValue * 1.2;
  const magnitude = 10 ** Math.floor(Math.log10(target));
  const nice = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].find((step) => step * magnitude >= target)! * magnitude;
  return Array.from({ length: tickCount + 1 }, (_, i) => (nice / tickCount) * i);
}

/** 1615 -> "1.6K", 872 -> "872", 2500000 -> "2.5M". */
export function compactNumber(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1e9) return `${+(value / 1e9).toFixed(1)}B`;
  if (abs >= 1e6) return `${+(value / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `${+(value / 1e3).toFixed(1)}K`;
  return `${+value.toFixed(2)}`;
}
