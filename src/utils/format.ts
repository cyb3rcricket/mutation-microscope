/**
 * Display helper for percentile ranks. Preserves high-quantile precision
 * so values such as 99.998 are not rounded to 100.0.
 */
export function formatPercentileRank(value: number): string {
  if (value >= 99 && value < 100) {
    return `${Number.parseFloat(value.toFixed(3))}%`;
  }
  return `${Number.parseFloat(value.toFixed(1))}%`;
}
