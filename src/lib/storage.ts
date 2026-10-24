/**
 * storage.ts — localStorage abstraction layer
 *
 * All persistence goes through this module. Swap out the implementation
 * here when a real backend is added (e.g., replace with fetch() calls).
 */

import type { MealLog, SurplusListing } from '@/types';
import { DEMO_MEAL_LOGS, DEMO_SURPLUS_LISTINGS } from '@/data/seedData';

const KEYS = {
  MEAL_LOGS: 'platewise_meal_logs',
  SURPLUS: 'platewise_surplus',
  SEEDED: 'platewise_seeded_v1',
} as const;

// ─── Seeding ──────────────────────────────────────────────────────────────────

export function ensureSeeded(): void {
  if (localStorage.getItem(KEYS.SEEDED)) return;
  localStorage.setItem(KEYS.MEAL_LOGS, JSON.stringify(DEMO_MEAL_LOGS));
  localStorage.setItem(KEYS.SURPLUS, JSON.stringify(DEMO_SURPLUS_LISTINGS));
  localStorage.setItem(KEYS.SEEDED, 'true');
}

export function clearAllData(): void {
  Object.values(KEYS).forEach(k => localStorage.removeItem(k));
}

export function resetToDemo(): void {
  clearAllData();
  ensureSeeded();
}

// ─── Meal Logs ────────────────────────────────────────────────────────────────

export function getMealLogs(): MealLog[] {
  try {
    const raw = localStorage.getItem(KEYS.MEAL_LOGS);
    return raw ? (JSON.parse(raw) as MealLog[]) : [];
  } catch {
    return [];
  }
}

export function saveMealLogs(logs: MealLog[]): void {
  localStorage.setItem(KEYS.MEAL_LOGS, JSON.stringify(logs));
}

export function addMealLog(log: MealLog): MealLog[] {
  const logs = getMealLogs();
  const updated = [log, ...logs];
  saveMealLogs(updated);
  return updated;
}

export function updateMealLog(updated: MealLog): MealLog[] {
  const logs = getMealLogs().map(l => (l.id === updated.id ? updated : l));
  saveMealLogs(logs);
  return logs;
}

export function deleteMealLog(id: string): MealLog[] {
  const logs = getMealLogs().filter(l => l.id !== id);
  saveMealLogs(logs);
  return logs;
}

// ─── Surplus ─────────────────────────────────────────────────────────────────

export function getSurplusListings(): SurplusListing[] {
  try {
    const raw = localStorage.getItem(KEYS.SURPLUS);
    return raw ? (JSON.parse(raw) as SurplusListing[]) : [];
  } catch {
    return [];
  }
}

export function saveSurplusListings(listings: SurplusListing[]): void {
  localStorage.setItem(KEYS.SURPLUS, JSON.stringify(listings));
}

export function addSurplusListing(listing: SurplusListing): SurplusListing[] {
  const listings = getSurplusListings();
  const updated = [listing, ...listings];
  saveSurplusListings(updated);
  return updated;
}

export function updateSurplusListing(updated: SurplusListing): SurplusListing[] {
  const listings = getSurplusListings().map(l => (l.id === updated.id ? updated : l));
  saveSurplusListings(listings);
  return listings;
}

export function deleteSurplusListing(id: string): SurplusListing[] {
  const listings = getSurplusListings().filter(l => l.id !== id);
  saveSurplusListings(listings);
  return listings;
}
