import type { MealType, FoodCategory, Unit } from '@/types';

export const MEAL_TYPES: MealType[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Event'];

export const FOOD_CATEGORIES: FoodCategory[] = [
  'Rice & Grains',
  'Breads & Rotis',
  'Curries & Gravies',
  'Dal & Lentils',
  'Vegetables',
  'Salads',
  'Snacks & Fried',
  'Sweets & Desserts',
  'Beverages',
  'Other',
];

export const UNITS: Unit[] = ['kg', 'portions'];

export const UNIT_LABELS: Record<Unit, string> = {
  kg: 'Kilograms (kg)',
  portions: 'Portions',
};

/** Default cost per unit in INR — editable per log entry */
export const DEFAULT_COST_PER_UNIT: Record<Unit, number> = {
  kg: 120,       // ₹120/kg average bulk food
  portions: 45,  // ₹45/portion average
};

/** Buffer percentages for recommended preparation */
export const SAFETY_BUFFER: Record<'high' | 'medium' | 'low', number> = {
  high: 0.05,    // 5% buffer when confidence is high
  medium: 0.10,  // 10% buffer when confidence is medium
  low: 0.20,     // 20% buffer when confidence is low
};

export const STATUS_COLORS = {
  Available: 'bg-forest-100 text-forest-700',
  Reserved:  'bg-amber-100 text-amber-700',
  Collected: 'bg-blue-100 text-blue-700',
  Expired:   'bg-stone-100 text-stone-500',
} as const;

export const IMPACT_COLORS = {
  high:   'bg-red-50 border-red-200 text-red-700',
  medium: 'bg-amber-50 border-amber-200 text-amber-700',
  low:    'bg-forest-50 border-forest-200 text-forest-700',
} as const;

export const CHART_COLORS = {
  prepared:  '#2d632d',
  served:    '#63a063',
  surplus:   '#f97316',
  waste:     '#ef4444',
  forecast:  '#6366f1',
};

export const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Food safety time limits after preparation (hours) */
export const FOOD_SAFETY_HOURS = 4;
