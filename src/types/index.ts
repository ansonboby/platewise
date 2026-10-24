// ─── Core Domain Types ────────────────────────────────────────────────────────

export type Unit = 'kg' | 'portions';

export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'Event';

export type FoodCategory =
  | 'Rice & Grains'
  | 'Breads & Rotis'
  | 'Curries & Gravies'
  | 'Dal & Lentils'
  | 'Vegetables'
  | 'Salads'
  | 'Snacks & Fried'
  | 'Sweets & Desserts'
  | 'Beverages'
  | 'Other';

export interface MealLog {
  id: string;
  date: string;          // ISO date string YYYY-MM-DD
  mealType: MealType;
  foodItem: string;
  category: FoodCategory;
  unit: Unit;
  quantityPrepared: number;
  quantityServed: number;
  quantityRemaining: number;
  costPerUnit: number;   // ₹ per kg or ₹ per portion
  notes: string;
  isDemo: boolean;
  createdAt: string;     // ISO timestamp
}

export type SurplusStatus = 'Available' | 'Reserved' | 'Collected' | 'Expired';

export interface SurplusListing {
  id: string;
  mealLogId?: string;    // optional link to meal log
  foodItem: string;
  quantity: number;
  unit: Unit;
  preparedAt: string;    // ISO timestamp
  collectionDeadline: string; // ISO timestamp
  handlingNotes: string;
  contactInfo: string;
  status: SurplusStatus;
  reservedBy?: string;
  isDemo: boolean;
  createdAt: string;
}

// ─── Analytics Types ──────────────────────────────────────────────────────────

export interface WasteByDay {
  day: string;
  wasteKg: number;
  wastePortions: number;
  wastePercent: number;
}

export interface WasteByMeal {
  mealType: MealType;
  avgWastePercent: number;
  totalWaste: number;
  count: number;
}

export interface CategoryWaste {
  category: FoodCategory;
  totalWaste: number;
  unit: Unit;
  avgWastePercent: number;
  count: number;
}

export interface OverproductionAlert {
  foodItem: string;
  mealType: MealType;
  occurrences: number;
  avgWastePercent: number;
  lastDate: string;
}

// ─── Forecasting Types ────────────────────────────────────────────────────────

export interface ForecastInput {
  targetDate: string;       // ISO date
  mealType: MealType;
  foodItem: string;
  unit: Unit;
  attendanceHint?: number;  // optional manual attendance estimate
}

export interface ForecastResult {
  predictedDemand: number;
  recommendedPreparation: number;  // includes buffer
  bufferPercent: number;
  confidence: 'high' | 'medium' | 'low';
  dataPointsUsed: number;
  reasoning: string[];
  isUsingDemoData: boolean;
  historicalAccuracy?: number;     // MAE % if enough data
}

// ─── Dashboard Types ──────────────────────────────────────────────────────────

export interface DashboardStats {
  totalPrepared: number;
  totalServed: number;
  totalSurplus: number;
  wastePercent: number;
  surplusCostINR: number;
  unit: Unit;
}

export interface TrendPoint {
  date: string;
  prepared: number;
  served: number;
  surplus: number;
  wastePercent: number;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionLabel?: string;
}

// ─── Navigation ───────────────────────────────────────────────────────────────

export type PageId = 'dashboard' | 'meal-logging' | 'analytics' | 'forecast' | 'surplus';
