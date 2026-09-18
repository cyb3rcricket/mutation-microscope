import { describe, it, expect } from 'vitest';
import { formatPercentileRank } from '../utils/format';

describe('formatPercentileRank', () => {
  it('preserves high-quantile precision instead of rounding to 100%', () => {
    expect(formatPercentileRank(99.998)).toBe('99.998%');
    expect(formatPercentileRank(99.999)).toBe('99.999%');
    expect(formatPercentileRank(99.84)).toBe('99.84%');
    expect(formatPercentileRank(99.91)).toBe('99.91%');
  });

  it('uses one decimal place for ranks below 99', () => {
    expect(formatPercentileRank(2.1)).toBe('2.1%');
    expect(formatPercentileRank(50)).toBe('50%');
  });
});
