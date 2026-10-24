/**
 * forecasting.ts — Pure demand forecasting logic.
 * No UI or storage dependencies. Fully testable.
 *
 * Algorithm:
 *   1. Filter historical consumption data for the same foodItem + mealType.
 *   2. Apply day-of-week seasonality weights.
 *   3. Compute weighted moving average of served quantities.
 *   4. Add a safety buffer based on data confidence.
 *   5. Optionally incorporate an attendance hint.
 */

import type { MealLog, ForecastInput, ForecastResult } from '@/types';
import { SAFETY_BUFFER } from '@/lib/constants';

// ─── Day-of-Week Seasonality Weights ─────────────────────────────────────────
// Based on typical college canteen patterns (Mon=1 through Sun=0)
const DOW_WEIGHTS: Record<number, number> = {
  0: 0.70, // Sunday   — low attendance
  1: 1.00, // Monday   — baseline
  2: 1.05, // Tuesday
  3: 1.00, // Wednesday
  4: 0.95, // Thursday
  5: 1.10, // Friday   — higher demand
  6: 0.75, // Saturday — reduced
};

// ─── Recency Weights for Moving Average ──────────────────────────────────────
// More recent data points receive higher weight.
function recencyWeight(rankFromLatest: number): number {
  // Exponential decay: w = 0.9^rank
  return Math.pow(0.9, rankFromLatest);
}

// ─── Mean Absolute Error (for historical accuracy) ───────────────────────────
export function computeMAE(actual: number[], predicted: number[]): number {
  if (actual.length === 0 || actual.length !== predicted.length) return 0;
  const sum = actual.reduce((s, a, i) => s + Math.abs(a - predicted[i]), 0);
  return Math.round((sum / actual.length) * 10) / 10;
}

export function computeMAPE(actual: number[], predicted: number[]): number {
  if (!actual.length) return 0;
  const nonZero = actual
    .map((a, i) => (a > 0 ? Math.abs((a - predicted[i]) / a) * 100 : null))
    .filter((v): v is number => v !== null);
  if (!nonZero.length) return 0;
  return Math.round((nonZero.reduce((s, v) => s + v, 0) / nonZero.length) * 10) / 10;
}

// ─── Main Forecast Function ───────────────────────────────────────────────────

export function generateForecast(
  input: ForecastInput,
  allLogs: MealLog[],
): ForecastResult {
  const targetDow = new Date(input.targetDate + 'T12:00:00').getDay();
  const dowWeight = DOW_WEIGHTS[targetDow] ?? 1.0;

  // Filter relevant history: same food item AND meal type AND unit
  const relevant = allLogs
    .filter(
      l =>
        l.foodItem.toLowerCase() === input.foodItem.toLowerCase() &&
        l.mealType === input.mealType &&
        l.unit === input.unit,
    )
    .sort((a, b) => b.date.localeCompare(a.date)); // newest first

  const reasoning: string[] = [];
  let isUsingDemoData = false;
  let historicalAccuracy: number | undefined;

  // ── Case: Not enough data ─────────────────────────────────────────────────
  if (relevant.length < 3) {
    isUsingDemoData = relevant.some(l => l.isDemo) || relevant.length === 0;

    // Fallback: use average served across all logs of the same unit
    const fallback = allLogs
      .filter(l => l.unit === input.unit && l.mealType === input.mealType)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 10);

    const avgServed =
      fallback.length > 0
        ? fallback.reduce((s, l) => s + l.quantityServed, 0) / fallback.length
        : input.unit === 'kg' ? 30 : 150;

    const predicted = Math.round(avgServed * dowWeight * 10) / 10;
    const confidence = 'low';
    const buffer = SAFETY_BUFFER[confidence];
    const recommended = Math.round(predicted * (1 + buffer) * 10) / 10;

    const earlyReasons = [
      `Only ${relevant.length} record(s) found for "${input.foodItem}" at ${input.mealType}.`,
      `Falling back to average across all ${input.mealType} records (${fallback.length} entries).`,
      `Day-of-week factor applied: ${(dowWeight * 100).toFixed(0)}% of baseline.`,
      `Low confidence → ${(buffer * 100).toFixed(0)}% safety buffer added.`,
      isUsingDemoData ? 'Prediction relies on demo/simulated data.' : '',
    ].filter(Boolean) as string[];
    reasoning.push(...earlyReasons);

    return {
      predictedDemand: predicted,
      recommendedPreparation: recommended,
      bufferPercent: buffer * 100,
      confidence,
      dataPointsUsed: fallback.length,
      reasoning,
      isUsingDemoData,
    };
  }

  // ── Case: Enough data — weighted moving average ───────────────────────────
  isUsingDemoData = relevant.every(l => l.isDemo);

  const windowSize = Math.min(relevant.length, 8); // cap at 8 most recent
  const window = relevant.slice(0, windowSize);

  const totalWeight = window.reduce((s, _, i) => s + recencyWeight(i), 0);
  const weightedServed = window.reduce(
    (s, log, i) => s + log.quantityServed * recencyWeight(i),
    0,
  );
  const baselineServed = weightedServed / totalWeight;

  // Apply day-of-week adjustment
  const predicted = Math.round(baselineServed * dowWeight * 10) / 10;

  // Apply attendance hint if provided
  let finalPredicted = predicted;
  if (input.attendanceHint && input.attendanceHint > 0) {
    // Interpolate between pure history (60%) and attendance hint (40%)
    const historicalPerPerson =
      baselineServed / (window[0]?.quantityPrepared || 1) *
      (input.attendanceHint);
    finalPredicted = Math.round(
      (predicted * 0.6 + historicalPerPerson * 0.4) * 10,
    ) / 10;
    reasoning.push(
      `Attendance hint of ${input.attendanceHint} used (40% weight) alongside historical data (60% weight).`,
    );
  }

  // Confidence based on data points and variance
  const served = window.map(l => l.quantityServed);
  const mean = served.reduce((s, v) => s + v, 0) / served.length;
  const variance = served.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / served.length;
  const cv = mean > 0 ? Math.sqrt(variance) / mean : 1; // coefficient of variation

  const confidence: 'high' | 'medium' | 'low' =
    window.length >= 6 && cv < 0.15
      ? 'high'
      : window.length >= 4 || cv < 0.3
      ? 'medium'
      : 'low';

  const buffer = SAFETY_BUFFER[confidence];
  const recommended = Math.round(finalPredicted * (1 + buffer) * 10) / 10;

  // Historical accuracy (leave-one-out on last 3 points if possible)
  if (relevant.length >= 5) {
    const actuals: number[] = [];
    const preds: number[] = [];
    for (let i = 0; i < Math.min(3, relevant.length - 2); i++) {
      const testLog = relevant[i];
      const trainingWindow = relevant.slice(i + 1, i + 5);
      const tw = trainingWindow.reduce((s, _, j) => s + recencyWeight(j), 0);
      const wServed = trainingWindow.reduce(
        (s, l, j) => s + l.quantityServed * recencyWeight(j),
        0,
      );
      const trainDow = new Date(testLog.date + 'T12:00:00').getDay();
      const trainPred = (wServed / tw) * (DOW_WEIGHTS[trainDow] ?? 1);
      actuals.push(testLog.quantityServed);
      preds.push(Math.round(trainPred * 10) / 10);
    }
    historicalAccuracy = computeMAPE(actuals, preds);
  }

  const lateReasons = [
    `Based on ${window.length} most recent records for "${input.foodItem}" at ${input.mealType}.`,
    `Weighted moving average of served quantity: ${baselineServed.toFixed(1)} ${input.unit}.`,
    `Day-of-week adjustment (${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][targetDow]}): ×${dowWeight.toFixed(2)}.`,
    `Data consistency (CV): ${(cv * 100).toFixed(0)}% → ${confidence} confidence.`,
    `Safety buffer: ${(buffer * 100).toFixed(0)}% added to account for uncertainty.`,
    isUsingDemoData ? 'All data points are from the demo dataset.' : '',
    historicalAccuracy !== undefined
      ? `Historical forecast error (MAPE): ~${historicalAccuracy}% on last 3 recorded meals.`
      : '',
  ].filter(Boolean) as string[];
  reasoning.push(...lateReasons);

  return {
    predictedDemand: finalPredicted,
    recommendedPreparation: recommended,
    bufferPercent: buffer * 100,
    confidence,
    dataPointsUsed: window.length,
    reasoning,
    isUsingDemoData,
    historicalAccuracy,
  };
}

// ─── Multi-Item Forecast ──────────────────────────────────────────────────────

export function forecastForDate(
  date: string,
  allLogs: MealLog[],
): Array<{ foodItem: string; result: ForecastResult } & ForecastInput> {
  // Get unique food items from last 14 days
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 14);
  const recent = allLogs.filter(l => new Date(l.date) >= cutoff);

  const seen = new Set<string>();
  const items: ForecastInput[] = [];

  for (const log of recent) {
    const key = `${log.foodItem}|${log.mealType}|${log.unit}`;
    if (!seen.has(key)) {
      seen.add(key);
      items.push({
        targetDate: date,
        mealType: log.mealType,
        foodItem: log.foodItem,
        unit: log.unit,
      });
    }
  }

  return items.map(input => ({
    ...input,
    result: generateForecast(input, allLogs),
  }));
}
