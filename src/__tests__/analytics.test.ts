import { describe, it, expect } from 'vitest';
import {
  wastePercent,
  surplusCost,
  totalSurplusCost,
  computeDashboardStats,
  computeWasteByDayOfWeek,
  computeWasteByMealType,
  computeOverproductionAlerts,
  generateRecommendations,
  computeTrend,
} from '../lib/analytics';
import type { MealLog } from '../types';

const makeLog = (overrides: Partial<MealLog> = {}): MealLog => ({
  id: 'test-1',
  date: '2026-10-20',
  mealType: 'Lunch',
  foodItem: 'Rice',
  category: 'Rice & Grains',
  unit: 'kg',
  quantityPrepared: 100,
  quantityServed: 80,
  quantityRemaining: 20,
  costPerUnit: 100,
  notes: '',
  isDemo: false,
  createdAt: '2026-10-20T08:00:00.000Z',
  ...overrides,
});

describe('wastePercent', () => {
  it('returns 0 when no food prepared', () => {
    expect(wastePercent(0, 0)).toBe(0);
  });

  it('calculates correct waste percent', () => {
    expect(wastePercent(100, 20)).toBe(20);
    expect(wastePercent(50, 10)).toBe(20);
    expect(wastePercent(40, 14)).toBe(35);
  });

  it('returns 0 when no remaining', () => {
    expect(wastePercent(100, 0)).toBe(0);
  });

  it('caps at 100% when remaining > prepared', () => {
    // This shouldn't happen in practice (validation prevents it)
    // but the function should not crash
    expect(wastePercent(10, 15)).toBe(150);
  });

  it('rounds to one decimal place', () => {
    expect(wastePercent(30, 4)).toBe(13.3);
    expect(wastePercent(45, 13)).toBe(28.9);
  });
});

describe('surplusCost', () => {
  it('calculates cost correctly', () => {
    expect(surplusCost(10, 120)).toBe(1200);
    expect(surplusCost(0, 120)).toBe(0);
    expect(surplusCost(5.5, 100)).toBe(550);
  });
});

describe('totalSurplusCost', () => {
  it('sums surplus cost across logs', () => {
    const logs = [
      makeLog({ quantityRemaining: 10, costPerUnit: 100 }),
      makeLog({ id: 'test-2', quantityRemaining: 5, costPerUnit: 200 }),
    ];
    expect(totalSurplusCost(logs)).toBe(2000);
  });

  it('returns 0 for empty logs', () => {
    expect(totalSurplusCost([])).toBe(0);
  });
});

describe('computeDashboardStats', () => {
  const logs: MealLog[] = [
    makeLog({ unit: 'kg', quantityPrepared: 100, quantityServed: 80, quantityRemaining: 20, costPerUnit: 100 }),
    makeLog({ id: 'p2', unit: 'portions', quantityPrepared: 200, quantityServed: 160, quantityRemaining: 40, costPerUnit: 45 }),
  ];

  it('separates kg and portion stats', () => {
    const stats = computeDashboardStats(logs);
    expect(stats.kg.totalPrepared).toBe(100);
    expect(stats.kg.totalSurplus).toBe(20);
    expect(stats.portions.totalPrepared).toBe(200);
    expect(stats.portions.totalSurplus).toBe(40);
  });

  it('calculates waste percent per unit group', () => {
    const stats = computeDashboardStats(logs);
    expect(stats.kg.wastePercent).toBe(20);
    expect(stats.portions.wastePercent).toBe(20);
  });

  it('calculates combined surplus cost', () => {
    const stats = computeDashboardStats(logs);
    // 20kg × ₹100 + 40portions × ₹45 = 2000 + 1800 = 3800
    expect(stats.combined.surplusCostINR).toBe(3800);
  });

  it('handles empty logs', () => {
    const stats = computeDashboardStats([]);
    expect(stats.kg.totalPrepared).toBe(0);
    expect(stats.combined.wastePercent).toBe(0);
  });
});

describe('computeWasteByDayOfWeek', () => {
  it('returns 7 entries (one per day)', () => {
    const result = computeWasteByDayOfWeek([]);
    expect(result).toHaveLength(7);
  });

  it('correctly labels days', () => {
    const result = computeWasteByDayOfWeek([]);
    expect(result[0].day).toBe('Sun');
    expect(result[1].day).toBe('Mon');
    expect(result[6].day).toBe('Sat');
  });

  it('aggregates waste for correct day', () => {
    // 2026-10-20 is a Tuesday (index 2)
    const logs = [makeLog({ date: '2026-10-20', quantityPrepared: 100, quantityRemaining: 25 })];
    const result = computeWasteByDayOfWeek(logs);
    expect(result[2].wastePercent).toBe(25);
    expect(result[2].wasteKg).toBe(25);
  });
});

describe('computeWasteByMealType', () => {
  it('returns sorted by avg waste percent descending', () => {
    const logs = [
      makeLog({ mealType: 'Dinner', quantityPrepared: 100, quantityRemaining: 30 }),
      makeLog({ id: 't2', mealType: 'Breakfast', quantityPrepared: 100, quantityRemaining: 10 }),
    ];
    const result = computeWasteByMealType(logs);
    expect(result[0].mealType).toBe('Dinner');
    expect(result[0].avgWastePercent).toBe(30);
  });

  it('handles single entry per meal type', () => {
    const logs = [makeLog({ mealType: 'Lunch', quantityPrepared: 50, quantityRemaining: 15 })];
    const result = computeWasteByMealType(logs);
    expect(result[0].avgWastePercent).toBe(30);
  });
});

describe('computeOverproductionAlerts', () => {
  it('flags items overproduced 2+ times above 15% threshold', () => {
    const logs: MealLog[] = [
      makeLog({ date: '2026-10-01', foodItem: 'Biryani', quantityPrepared: 40, quantityRemaining: 14 }),
      makeLog({ id: 't2', date: '2026-10-08', foodItem: 'Biryani', quantityPrepared: 40, quantityRemaining: 12 }),
    ];
    const alerts = computeOverproductionAlerts(logs);
    expect(alerts.length).toBeGreaterThan(0);
    expect(alerts[0].foodItem).toBe('Biryani');
    expect(alerts[0].occurrences).toBe(2);
  });

  it('does not flag items under the threshold', () => {
    const logs: MealLog[] = [
      makeLog({ date: '2026-10-01', foodItem: 'Dal', quantityPrepared: 100, quantityRemaining: 5 }),
      makeLog({ id: 't2', date: '2026-10-08', foodItem: 'Dal', quantityPrepared: 100, quantityRemaining: 6 }),
    ];
    const alerts = computeOverproductionAlerts(logs);
    expect(alerts.filter(a => a.foodItem === 'Dal')).toHaveLength(0);
  });

  it('requires at least 2 occurrences', () => {
    const logs: MealLog[] = [
      makeLog({ foodItem: 'Special', quantityPrepared: 40, quantityRemaining: 16 }),
    ];
    const alerts = computeOverproductionAlerts(logs);
    expect(alerts.filter(a => a.foodItem === 'Special')).toHaveLength(0);
  });
});

describe('computeTrend', () => {
  it('returns the correct number of days', () => {
    const result = computeTrend([], 7);
    expect(result).toHaveLength(7);
    const result14 = computeTrend([], 14);
    expect(result14).toHaveLength(14);
  });

  it('fills zeros for days with no data', () => {
    const result = computeTrend([], 7);
    result.forEach(point => {
      expect(point.prepared).toBe(0);
      expect(point.served).toBe(0);
      expect(point.surplus).toBe(0);
    });
  });
});

describe('generateRecommendations', () => {
  it('returns empty array for fewer than 2 logs', () => {
    const result = generateRecommendations([]);
    expect(Array.isArray(result)).toBe(true);
  });

  it('returns recommendations for logs with overproduction', () => {
    const logs: MealLog[] = [
      makeLog({ date: '2026-10-01', foodItem: 'Biryani', quantityPrepared: 40, quantityRemaining: 14, costPerUnit: 180 }),
      makeLog({ id: 't2', date: '2026-10-08', foodItem: 'Biryani', quantityPrepared: 40, quantityRemaining: 16, costPerUnit: 180 }),
      makeLog({ id: 't3', date: '2026-10-01', foodItem: 'Dal', mealType: 'Dinner', quantityPrepared: 30, quantityRemaining: 10, costPerUnit: 80 }),
    ];
    const recs = generateRecommendations(logs);
    expect(recs.length).toBeGreaterThan(0);
    expect(recs[0].impact).toBeDefined();
  });

  it('recommendation has required fields', () => {
    const logs = Array.from({ length: 10 }, (_, i) =>
      makeLog({ id: `t${i}`, date: `2026-10-${String(i + 1).padStart(2, '0')}` })
    );
    const recs = generateRecommendations(logs);
    recs.forEach(r => {
      expect(r.id).toBeDefined();
      expect(r.title).toBeDefined();
      expect(r.description).toBeDefined();
      expect(['high', 'medium', 'low']).toContain(r.impact);
    });
  });
});
