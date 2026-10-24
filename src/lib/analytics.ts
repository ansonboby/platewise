/**
 * analytics.ts — Pure functions for food-waste analysis.
 * No UI dependencies. All inputs and outputs are plain objects.
 */

import type {
  MealLog,
  WasteByDay,
  WasteByMeal,
  CategoryWaste,
  OverproductionAlert,
  DashboardStats,
  TrendPoint,
  Recommendation,
  MealType,
  FoodCategory,
} from '@/types';
import { DAYS_OF_WEEK } from '@/lib/constants';

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function wastePercent(prepared: number, remaining: number): number {
  if (prepared <= 0) return 0;
  return Math.round((remaining / prepared) * 1000) / 10; // one decimal
}

export function surplusCost(remaining: number, costPerUnit: number): number {
  return remaining * costPerUnit;
}

export function totalSurplusCost(logs: MealLog[]): number {
  return logs.reduce((sum, l) => sum + surplusCost(l.quantityRemaining, l.costPerUnit), 0);
}

function groupBy<T>(arr: T[], key: (item: T) => string): Record<string, T[]> {
  return arr.reduce<Record<string, T[]>>((acc, item) => {
    const k = key(item);
    if (!acc[k]) acc[k] = [];
    acc[k].push(item);
    return acc;
  }, {});
}

function average(nums: number[]): number {
  if (!nums.length) return 0;
  return nums.reduce((s, n) => s + n, 0) / nums.length;
}

// ─── Dashboard Stats ─────────────────────────────────────────────────────────

/**
 * Compute top-level dashboard stats for a given unit filter.
 * Because kg and portions cannot be mixed, we compute stats per unit and
 * the caller renders them separately or picks the dominant unit.
 */
export function computeDashboardStats(logs: MealLog[]): {
  kg: DashboardStats;
  portions: DashboardStats;
  combined: { wastePercent: number; surplusCostINR: number; totalEntries: number };
} {
  const kgLogs = logs.filter(l => l.unit === 'kg');
  const portionLogs = logs.filter(l => l.unit === 'portions');

  function statsFor(subset: MealLog[], unit: 'kg' | 'portions'): DashboardStats {
    const prepared = subset.reduce((s, l) => s + l.quantityPrepared, 0);
    const served = subset.reduce((s, l) => s + l.quantityServed, 0);
    const surplus = subset.reduce((s, l) => s + l.quantityRemaining, 0);
    const cost = totalSurplusCost(subset);
    return {
      totalPrepared: Math.round(prepared * 10) / 10,
      totalServed: Math.round(served * 10) / 10,
      totalSurplus: Math.round(surplus * 10) / 10,
      wastePercent: wastePercent(prepared, surplus),
      surplusCostINR: Math.round(cost),
      unit,
    };
  }

  const kg = statsFor(kgLogs, 'kg');
  const portions = statsFor(portionLogs, 'portions');

  // Combined cost and blended waste percent (weighted by entry count)
  const totalCost = kg.surplusCostINR + portions.surplusCostINR;
  const totalPrepared = kgLogs.reduce((s, l) => s + l.quantityPrepared, 0) +
    portionLogs.reduce((s, l) => s + l.quantityPrepared, 0);
  const totalSurplus = kgLogs.reduce((s, l) => s + l.quantityRemaining, 0) +
    portionLogs.reduce((s, l) => s + l.quantityRemaining, 0);

  return {
    kg,
    portions,
    combined: {
      wastePercent: wastePercent(totalPrepared, totalSurplus),
      surplusCostINR: Math.round(totalCost),
      totalEntries: logs.length,
    },
  };
}

// ─── Trend (last N days) ─────────────────────────────────────────────────────

export function computeTrend(logs: MealLog[], days = 14): TrendPoint[] {
  const byDate = groupBy(logs, l => l.date);
  const result: TrendPoint[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayLogs = byDate[dateStr] ?? [];

    const prepared = dayLogs.reduce((s, l) => s + l.quantityPrepared, 0);
    const served = dayLogs.reduce((s, l) => s + l.quantityServed, 0);
    const surplus = dayLogs.reduce((s, l) => s + l.quantityRemaining, 0);

    result.push({
      date: dateStr,
      prepared: Math.round(prepared * 10) / 10,
      served: Math.round(served * 10) / 10,
      surplus: Math.round(surplus * 10) / 10,
      wastePercent: wastePercent(prepared, surplus),
    });
  }

  return result;
}

// ─── Waste by Day of Week ────────────────────────────────────────────────────

export function computeWasteByDayOfWeek(logs: MealLog[]): WasteByDay[] {
  const byDow = groupBy(logs, l => String(new Date(l.date).getDay()));

  return DAYS_OF_WEEK.map((day, idx) => {
    const dayLogs = byDow[String(idx)] ?? [];
    const kgLogs = dayLogs.filter(l => l.unit === 'kg');
    const portionLogs = dayLogs.filter(l => l.unit === 'portions');

    const totalKgPrepared = kgLogs.reduce((s, l) => s + l.quantityPrepared, 0);
    const totalKgRemaining = kgLogs.reduce((s, l) => s + l.quantityRemaining, 0);
    const totalPortionsPrepared = portionLogs.reduce((s, l) => s + l.quantityPrepared, 0);
    const totalPortionsRemaining = portionLogs.reduce((s, l) => s + l.quantityRemaining, 0);

    const allPrepared = totalKgPrepared + totalPortionsPrepared;
    const allRemaining = totalKgRemaining + totalPortionsRemaining;

    return {
      day,
      wasteKg: Math.round(totalKgRemaining * 10) / 10,
      wastePortions: Math.round(totalPortionsRemaining),
      wastePercent: wastePercent(allPrepared, allRemaining),
    };
  });
}

// ─── Waste by Meal Type ──────────────────────────────────────────────────────

export function computeWasteByMealType(logs: MealLog[]): WasteByMeal[] {
  const byMeal = groupBy(logs, l => l.mealType);

  return Object.entries(byMeal).map(([mealType, mealLogs]) => {
    const percents = mealLogs.map(l => wastePercent(l.quantityPrepared, l.quantityRemaining));
    const totalWaste = mealLogs.reduce((s, l) => s + l.quantityRemaining, 0);
    return {
      mealType: mealType as MealType,
      avgWastePercent: Math.round(average(percents) * 10) / 10,
      totalWaste: Math.round(totalWaste * 10) / 10,
      count: mealLogs.length,
    };
  }).sort((a, b) => b.avgWastePercent - a.avgWastePercent);
}

// ─── Waste by Category ───────────────────────────────────────────────────────

export function computeWasteByCategory(logs: MealLog[]): CategoryWaste[] {
  const byCat = groupBy(logs, l => l.category);

  return Object.entries(byCat).map(([category, catLogs]) => {
    const percents = catLogs.map(l => wastePercent(l.quantityPrepared, l.quantityRemaining));
    const totalWaste = catLogs.reduce((s, l) => s + l.quantityRemaining, 0);
    // Use the unit of the majority of entries
    const kgCount = catLogs.filter(l => l.unit === 'kg').length;
    const unit: 'kg' | 'portions' = kgCount >= catLogs.length / 2 ? 'kg' : 'portions';
    return {
      category: category as FoodCategory,
      totalWaste: Math.round(totalWaste * 10) / 10,
      unit,
      avgWastePercent: Math.round(average(percents) * 10) / 10,
      count: catLogs.length,
    };
  }).sort((a, b) => b.avgWastePercent - a.avgWastePercent);
}

// ─── Overproduction Alerts ───────────────────────────────────────────────────

const OVERPRODUCTION_THRESHOLD = 15; // percent
const MIN_OCCURRENCES = 2;

export function computeOverproductionAlerts(logs: MealLog[]): OverproductionAlert[] {
  // Group by foodItem + mealType
  const key = (l: MealLog) => `${l.foodItem}|||${l.mealType}`;
  const grouped = groupBy(logs, key);

  return Object.entries(grouped)
    .map(([k, entries]) => {
      const [foodItem, mealType] = k.split('|||');
      const overProduced = entries.filter(
        l => wastePercent(l.quantityPrepared, l.quantityRemaining) >= OVERPRODUCTION_THRESHOLD,
      );
      const avgWaste = average(
        overProduced.map(l => wastePercent(l.quantityPrepared, l.quantityRemaining)),
      );
      const lastDate = [...entries].sort((a, b) => b.date.localeCompare(a.date))[0].date;
      return {
        foodItem,
        mealType: mealType as MealType,
        occurrences: overProduced.length,
        avgWastePercent: Math.round(avgWaste * 10) / 10,
        lastDate,
      };
    })
    .filter(a => a.occurrences >= MIN_OCCURRENCES)
    .sort((a, b) => b.occurrences - a.occurrences || b.avgWastePercent - a.avgWastePercent);
}

// ─── Recommendations ─────────────────────────────────────────────────────────

export function generateRecommendations(logs: MealLog[]): Recommendation[] {
  const recs: Recommendation[] = [];
  const alerts = computeOverproductionAlerts(logs);
  const byMeal = computeWasteByMealType(logs);
  const stats = computeDashboardStats(logs);

  // Recommendation 1: top overproduced item
  if (alerts.length > 0) {
    const top = alerts[0];
    const suggestedReduction = Math.round(top.avgWastePercent * 0.8);
    recs.push({
      id: 'rec-1',
      title: `Reduce ${top.foodItem} preparation by ~${suggestedReduction}%`,
      description: `${top.foodItem} at ${top.mealType} has been overproduced ${top.occurrences} times with an average ${top.avgWastePercent}% waste rate. Reducing preparation by ${suggestedReduction}% could recover significant cost.`,
      impact: top.avgWastePercent > 30 ? 'high' : 'medium',
      actionLabel: 'View in Analytics',
    });
  }

  // Recommendation 2: worst meal type
  const worstMeal = byMeal[0];
  if (worstMeal && worstMeal.avgWastePercent > 10) {
    recs.push({
      id: 'rec-2',
      title: `${worstMeal.mealType} has the highest average waste (${worstMeal.avgWastePercent}%)`,
      description: `Review ${worstMeal.mealType} quantities and consider smaller batch cooking with top-up capability to reduce the ${worstMeal.avgWastePercent}% average waste.`,
      impact: worstMeal.avgWastePercent > 25 ? 'high' : 'medium',
    });
  }

  // Recommendation 3: surplus cost
  if (stats.combined.surplusCostINR > 5000) {
    recs.push({
      id: 'rec-3',
      title: `₹${stats.combined.surplusCostINR.toLocaleString('en-IN')} estimated in wasted food value`,
      description: 'List available surplus on the Surplus Rescue page to coordinate redistribution and reduce the financial loss from discarded food.',
      impact: stats.combined.surplusCostINR > 20000 ? 'high' : 'medium',
      actionLabel: 'Go to Surplus Rescue',
    });
  }

  // Recommendation 4: use forecasting
  if (logs.length >= 10) {
    recs.push({
      id: 'rec-4',
      title: 'Use demand forecasting before each meal',
      description: `With ${logs.length} meal records, PlateWise can generate demand forecasts. Check the Forecast page for tomorrow's recommended preparation quantities.`,
      impact: 'low',
      actionLabel: 'View Forecast',
    });
  }

  return recs;
}
