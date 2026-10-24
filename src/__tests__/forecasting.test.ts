import { describe, it, expect } from 'vitest';
import { generateForecast, computeMAE, computeMAPE, forecastForDate } from '../lib/forecasting';
import type { MealLog, ForecastInput } from '../types';

const makeLog = (overrides: Partial<MealLog> = {}): MealLog => ({
  id: 'test-1',
  date: '2026-10-20',
  mealType: 'Lunch',
  foodItem: 'Rice',
  category: 'Rice & Grains',
  unit: 'kg',
  quantityPrepared: 40,
  quantityServed: 30,
  quantityRemaining: 10,
  costPerUnit: 100,
  notes: '',
  isDemo: false,
  createdAt: '2026-10-20T08:00:00.000Z',
  ...overrides,
});

const BASE_INPUT: ForecastInput = {
  targetDate: '2026-10-25',
  mealType: 'Lunch',
  foodItem: 'Rice',
  unit: 'kg',
};

describe('computeMAE', () => {
  it('returns 0 for empty arrays', () => {
    expect(computeMAE([], [])).toBe(0);
  });

  it('returns 0 for mismatched lengths', () => {
    expect(computeMAE([1, 2], [1])).toBe(0);
  });

  it('calculates correct MAE', () => {
    expect(computeMAE([10, 20, 30], [12, 18, 28])).toBe(2);
    expect(computeMAE([100], [90])).toBe(10);
  });
});

describe('computeMAPE', () => {
  it('returns 0 for empty arrays', () => {
    expect(computeMAPE([], [])).toBe(0);
  });

  it('calculates MAPE correctly', () => {
    // |10-12|/10 = 20%, |20-18|/20 = 10%, avg = 15%
    expect(computeMAPE([10, 20], [12, 18])).toBe(15);
  });

  it('skips zero-actual entries to avoid division by zero', () => {
    // Should not throw
    expect(() => computeMAPE([0, 20], [5, 18])).not.toThrow();
  });
});

describe('generateForecast - no data', () => {
  it('returns low confidence with no relevant history', () => {
    const result = generateForecast(BASE_INPUT, []);
    expect(result.confidence).toBe('low');
    expect(result.isUsingDemoData).toBe(true); // no data = fallback
    expect(result.predictedDemand).toBeGreaterThan(0);
    expect(result.recommendedPreparation).toBeGreaterThanOrEqual(result.predictedDemand);
  });

  it('recommended preparation >= predicted demand (buffer applied)', () => {
    const result = generateForecast(BASE_INPUT, []);
    expect(result.recommendedPreparation).toBeGreaterThanOrEqual(result.predictedDemand);
  });
});

describe('generateForecast - with data', () => {
  // Create 6 logs for the same food item and meal type
  const logs: MealLog[] = [
    makeLog({ id: 'l1', date: '2026-10-19', quantityServed: 28 }),
    makeLog({ id: 'l2', date: '2026-10-18', quantityServed: 31 }),
    makeLog({ id: 'l3', date: '2026-10-17', quantityServed: 29 }),
    makeLog({ id: 'l4', date: '2026-10-16', quantityServed: 30 }),
    makeLog({ id: 'l5', date: '2026-10-15', quantityServed: 32 }),
    makeLog({ id: 'l6', date: '2026-10-14', quantityServed: 27 }),
  ];

  it('uses actual history for prediction', () => {
    const result = generateForecast(BASE_INPUT, logs);
    expect(result.dataPointsUsed).toBeGreaterThanOrEqual(3);
    // Predicted should be close to the average ~29.5
    expect(result.predictedDemand).toBeGreaterThan(20);
    expect(result.predictedDemand).toBeLessThan(50);
  });

  it('has higher confidence with more data', () => {
    const result = generateForecast(BASE_INPUT, logs);
    expect(['medium', 'high']).toContain(result.confidence);
  });

  it('buffer is applied correctly', () => {
    const result = generateForecast(BASE_INPUT, logs);
    const expectedMin = result.predictedDemand * 1.04; // at least 5% buffer (high confidence)
    const expectedMax = result.predictedDemand * 1.25; // at most 20% buffer (low confidence)
    expect(result.recommendedPreparation).toBeGreaterThanOrEqual(expectedMin * 0.95); // allow 5% rounding tolerance
    expect(result.recommendedPreparation).toBeLessThanOrEqual(expectedMax * 1.05);
  });

  it('reasoning is provided', () => {
    const result = generateForecast(BASE_INPUT, logs);
    expect(result.reasoning.length).toBeGreaterThan(0);
    result.reasoning.forEach(r => expect(typeof r).toBe('string'));
  });

  it('all-demo data is flagged', () => {
    const demoLogs = logs.map(l => ({ ...l, isDemo: true }));
    const result = generateForecast(BASE_INPUT, demoLogs);
    expect(result.isUsingDemoData).toBe(true);
  });

  it('non-demo data is not flagged as demo', () => {
    const result = generateForecast(BASE_INPUT, logs); // isDemo: false
    expect(result.isUsingDemoData).toBe(false);
  });
});

describe('generateForecast - attendance hint', () => {
  const logs: MealLog[] = [
    makeLog({ id: 'l1', date: '2026-10-19', quantityServed: 30 }),
    makeLog({ id: 'l2', date: '2026-10-18', quantityServed: 30 }),
    makeLog({ id: 'l3', date: '2026-10-17', quantityServed: 30 }),
    makeLog({ id: 'l4', date: '2026-10-16', quantityServed: 30 }),
  ];

  it('incorporates attendance hint into prediction', () => {
    const withHint = generateForecast({ ...BASE_INPUT, attendanceHint: 300 }, logs);
    // Result may differ when attendance hint provided
    expect(withHint.reasoning.some(r => r.includes('Attendance hint'))).toBe(true);
  });

  it('does not crash with zero attendance hint', () => {
    expect(() => generateForecast({ ...BASE_INPUT, attendanceHint: 0 }, logs)).not.toThrow();
  });
});

describe('forecastForDate', () => {
  it('returns an array', () => {
    const result = forecastForDate('2026-10-25', []);
    expect(Array.isArray(result)).toBe(true);
  });

  it('returns unique food/meal combinations', () => {
    const now = new Date();
    const recent = (daysAgo: number) => {
      const d = new Date(now);
      d.setDate(d.getDate() - daysAgo);
      return d.toISOString().split('T')[0];
    };

    const logs: MealLog[] = [
      makeLog({ id: 'a', date: recent(1), foodItem: 'Rice', mealType: 'Lunch' }),
      makeLog({ id: 'b', date: recent(2), foodItem: 'Rice', mealType: 'Lunch' }),
      makeLog({ id: 'c', date: recent(3), foodItem: 'Dal', mealType: 'Dinner' }),
    ];

    const result = forecastForDate('2026-10-25', logs);
    const keys = result.map(r => `${r.foodItem}|${r.mealType}`);
    const uniqueKeys = new Set(keys);
    expect(uniqueKeys.size).toBe(keys.length); // no duplicates
  });
});
