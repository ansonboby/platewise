import type { MealLog, SurplusListing } from '@/types';

/**
 * DEMO DATA — Simulated meal records for a college canteen over the past 30 days.
 * All entries are labelled isDemo: true and are seeded on first app load.
 * They represent realistic patterns: weekday breakfast underestimates,
 * Friday evening surpluses, and recurring biryani overproduction.
 */

function daysAgo(n: number): string {
  const d = new Date('2026-10-24');
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

function isoTS(dateStr: string, hour: number): string {
  return `${dateStr}T${String(hour).padStart(2, '0')}:00:00.000Z`;
}

export const DEMO_MEAL_LOGS: MealLog[] = [
  // ── Week 1 (21–24 days ago) ──────────────────────────────────────────────
  {
    id: 'demo-001', date: daysAgo(24), mealType: 'Breakfast', foodItem: 'Idli & Sambar',
    category: 'Rice & Grains', unit: 'portions', quantityPrepared: 180, quantityServed: 162,
    quantityRemaining: 18, costPerUnit: 35, notes: 'Monday – moderate turnout', isDemo: true,
    createdAt: isoTS(daysAgo(24), 9),
  },
  {
    id: 'demo-002', date: daysAgo(24), mealType: 'Lunch', foodItem: 'Chicken Biryani',
    category: 'Rice & Grains', unit: 'kg', quantityPrepared: 45, quantityServed: 32,
    quantityRemaining: 13, costPerUnit: 180, notes: 'Overestimated; 29% wasted', isDemo: true,
    createdAt: isoTS(daysAgo(24), 13),
  },
  {
    id: 'demo-003', date: daysAgo(24), mealType: 'Lunch', foodItem: 'Dal Tadka',
    category: 'Dal & Lentils', unit: 'kg', quantityPrepared: 30, quantityServed: 26,
    quantityRemaining: 4, costPerUnit: 80, notes: '', isDemo: true,
    createdAt: isoTS(daysAgo(24), 13),
  },
  {
    id: 'demo-004', date: daysAgo(23), mealType: 'Breakfast', foodItem: 'Poha & Jalebi',
    category: 'Snacks & Fried', unit: 'portions', quantityPrepared: 200, quantityServed: 195,
    quantityRemaining: 5, costPerUnit: 30, notes: 'Tuesday – high demand', isDemo: true,
    createdAt: isoTS(daysAgo(23), 8),
  },
  {
    id: 'demo-005', date: daysAgo(23), mealType: 'Lunch', foodItem: 'Rajma Chawal',
    category: 'Dal & Lentils', unit: 'kg', quantityPrepared: 40, quantityServed: 38,
    quantityRemaining: 2, costPerUnit: 90, notes: 'Popular item', isDemo: true,
    createdAt: isoTS(daysAgo(23), 13),
  },
  {
    id: 'demo-006', date: daysAgo(23), mealType: 'Dinner', foodItem: 'Paneer Butter Masala',
    category: 'Curries & Gravies', unit: 'kg', quantityPrepared: 25, quantityServed: 16,
    quantityRemaining: 9, costPerUnit: 220, notes: 'Low attendance Tuesday evening', isDemo: true,
    createdAt: isoTS(daysAgo(23), 19),
  },
  {
    id: 'demo-007', date: daysAgo(22), mealType: 'Breakfast', foodItem: 'Upma & Coconut Chutney',
    category: 'Rice & Grains', unit: 'portions', quantityPrepared: 160, quantityServed: 140,
    quantityRemaining: 20, costPerUnit: 28, notes: '', isDemo: true,
    createdAt: isoTS(daysAgo(22), 8),
  },
  {
    id: 'demo-008', date: daysAgo(22), mealType: 'Lunch', foodItem: 'Chicken Biryani',
    category: 'Rice & Grains', unit: 'kg', quantityPrepared: 42, quantityServed: 28,
    quantityRemaining: 14, costPerUnit: 180, notes: 'Recurring overproduction Wednesday', isDemo: true,
    createdAt: isoTS(daysAgo(22), 13),
  },
  {
    id: 'demo-009', date: daysAgo(21), mealType: 'Lunch', foodItem: 'Veg Pulao',
    category: 'Rice & Grains', unit: 'kg', quantityPrepared: 35, quantityServed: 33,
    quantityRemaining: 2, costPerUnit: 100, notes: '', isDemo: true,
    createdAt: isoTS(daysAgo(21), 13),
  },
  {
    id: 'demo-010', date: daysAgo(21), mealType: 'Dinner', foodItem: 'Chole Bhature',
    category: 'Dal & Lentils', unit: 'portions', quantityPrepared: 120, quantityServed: 95,
    quantityRemaining: 25, costPerUnit: 55, notes: 'Thursday dinner; 21% waste', isDemo: true,
    createdAt: isoTS(daysAgo(21), 19),
  },

  // ── Week 2 (14–20 days ago) ──────────────────────────────────────────────
  {
    id: 'demo-011', date: daysAgo(20), mealType: 'Breakfast', foodItem: 'Puri & Aloo Sabzi',
    category: 'Breads & Rotis', unit: 'portions', quantityPrepared: 220, quantityServed: 205,
    quantityRemaining: 15, costPerUnit: 40, notes: 'Friday – high footfall', isDemo: true,
    createdAt: isoTS(daysAgo(20), 8),
  },
  {
    id: 'demo-012', date: daysAgo(20), mealType: 'Lunch', foodItem: 'Chicken Biryani',
    category: 'Rice & Grains', unit: 'kg', quantityPrepared: 50, quantityServed: 31,
    quantityRemaining: 19, costPerUnit: 180, notes: 'Friday biryani – 38% wasted again', isDemo: true,
    createdAt: isoTS(daysAgo(20), 13),
  },
  {
    id: 'demo-013', date: daysAgo(20), mealType: 'Snack', foodItem: 'Samosa & Tea',
    category: 'Snacks & Fried', unit: 'portions', quantityPrepared: 150, quantityServed: 148,
    quantityRemaining: 2, costPerUnit: 20, notes: '', isDemo: true,
    createdAt: isoTS(daysAgo(20), 16),
  },
  {
    id: 'demo-014', date: daysAgo(19), mealType: 'Lunch', foodItem: 'Matar Paneer',
    category: 'Curries & Gravies', unit: 'kg', quantityPrepared: 20, quantityServed: 18,
    quantityRemaining: 2, costPerUnit: 200, notes: 'Saturday – minimal staff', isDemo: true,
    createdAt: isoTS(daysAgo(19), 13),
  },
  {
    id: 'demo-015', date: daysAgo(17), mealType: 'Breakfast', foodItem: 'Paratha & Curd',
    category: 'Breads & Rotis', unit: 'portions', quantityPrepared: 185, quantityServed: 170,
    quantityRemaining: 15, costPerUnit: 38, notes: '', isDemo: true,
    createdAt: isoTS(daysAgo(17), 8),
  },
  {
    id: 'demo-016', date: daysAgo(17), mealType: 'Lunch', foodItem: 'Dal Makhani',
    category: 'Dal & Lentils', unit: 'kg', quantityPrepared: 28, quantityServed: 25,
    quantityRemaining: 3, costPerUnit: 110, notes: '', isDemo: true,
    createdAt: isoTS(daysAgo(17), 13),
  },
  {
    id: 'demo-017', date: daysAgo(16), mealType: 'Lunch', foodItem: 'Chicken Biryani',
    category: 'Rice & Grains', unit: 'kg', quantityPrepared: 44, quantityServed: 29,
    quantityRemaining: 15, costPerUnit: 180, notes: 'Tuesday – same pattern', isDemo: true,
    createdAt: isoTS(daysAgo(16), 13),
  },
  {
    id: 'demo-018', date: daysAgo(16), mealType: 'Dinner', foodItem: 'Mixed Veg Sabzi',
    category: 'Vegetables', unit: 'kg', quantityPrepared: 22, quantityServed: 20,
    quantityRemaining: 2, costPerUnit: 70, notes: '', isDemo: true,
    createdAt: isoTS(daysAgo(16), 19),
  },
  {
    id: 'demo-019', date: daysAgo(15), mealType: 'Breakfast', foodItem: 'Dosa & Chutney',
    category: 'Rice & Grains', unit: 'portions', quantityPrepared: 210, quantityServed: 200,
    quantityRemaining: 10, costPerUnit: 32, notes: 'Wednesday – good turnout', isDemo: true,
    createdAt: isoTS(daysAgo(15), 8),
  },
  {
    id: 'demo-020', date: daysAgo(15), mealType: 'Event', foodItem: 'Veg Biryani',
    category: 'Rice & Grains', unit: 'kg', quantityPrepared: 60, quantityServed: 52,
    quantityRemaining: 8, costPerUnit: 130, notes: 'Cultural event – better utilisation', isDemo: true,
    createdAt: isoTS(daysAgo(15), 13),
  },

  // ── Week 3 (7–13 days ago) ───────────────────────────────────────────────
  {
    id: 'demo-021', date: daysAgo(14), mealType: 'Lunch', foodItem: 'Chicken Biryani',
    category: 'Rice & Grains', unit: 'kg', quantityPrepared: 46, quantityServed: 30,
    quantityRemaining: 16, costPerUnit: 180, notes: 'Thursday – 35% wasted', isDemo: true,
    createdAt: isoTS(daysAgo(14), 13),
  },
  {
    id: 'demo-022', date: daysAgo(13), mealType: 'Breakfast', foodItem: 'Idli & Sambar',
    category: 'Rice & Grains', unit: 'portions', quantityPrepared: 190, quantityServed: 172,
    quantityRemaining: 18, costPerUnit: 35, notes: '', isDemo: true,
    createdAt: isoTS(daysAgo(13), 8),
  },
  {
    id: 'demo-023', date: daysAgo(13), mealType: 'Lunch', foodItem: 'Chicken Biryani',
    category: 'Rice & Grains', unit: 'kg', quantityPrepared: 48, quantityServed: 29,
    quantityRemaining: 19, costPerUnit: 180, notes: 'Friday – highest single-week waste', isDemo: true,
    createdAt: isoTS(daysAgo(13), 13),
  },
  {
    id: 'demo-024', date: daysAgo(13), mealType: 'Snack', foodItem: 'Kachori & Chutney',
    category: 'Snacks & Fried', unit: 'portions', quantityPrepared: 100, quantityServed: 88,
    quantityRemaining: 12, costPerUnit: 25, notes: '', isDemo: true,
    createdAt: isoTS(daysAgo(13), 16),
  },
  {
    id: 'demo-025', date: daysAgo(11), mealType: 'Lunch', foodItem: 'Dal Tadka',
    category: 'Dal & Lentils', unit: 'kg', quantityPrepared: 32, quantityServed: 30,
    quantityRemaining: 2, costPerUnit: 80, notes: '', isDemo: true,
    createdAt: isoTS(daysAgo(11), 13),
  },
  {
    id: 'demo-026', date: daysAgo(10), mealType: 'Breakfast', foodItem: 'Puri & Aloo Sabzi',
    category: 'Breads & Rotis', unit: 'portions', quantityPrepared: 215, quantityServed: 200,
    quantityRemaining: 15, costPerUnit: 40, notes: '', isDemo: true,
    createdAt: isoTS(daysAgo(10), 8),
  },
  {
    id: 'demo-027', date: daysAgo(10), mealType: 'Lunch', foodItem: 'Chicken Biryani',
    category: 'Rice & Grains', unit: 'kg', quantityPrepared: 43, quantityServed: 27,
    quantityRemaining: 16, costPerUnit: 180, notes: 'Consistent Friday overproduction', isDemo: true,
    createdAt: isoTS(daysAgo(10), 13),
  },
  {
    id: 'demo-028', date: daysAgo(9), mealType: 'Lunch', foodItem: 'Kadai Paneer',
    category: 'Curries & Gravies', unit: 'kg', quantityPrepared: 18, quantityServed: 16,
    quantityRemaining: 2, costPerUnit: 230, notes: '', isDemo: true,
    createdAt: isoTS(daysAgo(9), 13),
  },
  {
    id: 'demo-029', date: daysAgo(9), mealType: 'Dinner', foodItem: 'Khichdi',
    category: 'Rice & Grains', unit: 'kg', quantityPrepared: 20, quantityServed: 18,
    quantityRemaining: 2, costPerUnit: 60, notes: 'Saturday light dinner', isDemo: true,
    createdAt: isoTS(daysAgo(9), 19),
  },

  // ── Week 4 (1–7 days ago) ────────────────────────────────────────────────
  {
    id: 'demo-030', date: daysAgo(7), mealType: 'Breakfast', foodItem: 'Paratha & Curd',
    category: 'Breads & Rotis', unit: 'portions', quantityPrepared: 180, quantityServed: 165,
    quantityRemaining: 15, costPerUnit: 38, notes: '', isDemo: true,
    createdAt: isoTS(daysAgo(7), 8),
  },
  {
    id: 'demo-031', date: daysAgo(7), mealType: 'Lunch', foodItem: 'Chicken Biryani',
    category: 'Rice & Grains', unit: 'kg', quantityPrepared: 44, quantityServed: 28,
    quantityRemaining: 16, costPerUnit: 180, notes: 'Monday – same issue persists', isDemo: true,
    createdAt: isoTS(daysAgo(7), 13),
  },
  {
    id: 'demo-032', date: daysAgo(6), mealType: 'Lunch', foodItem: 'Rajma Chawal',
    category: 'Dal & Lentils', unit: 'kg', quantityPrepared: 38, quantityServed: 36,
    quantityRemaining: 2, costPerUnit: 90, notes: '', isDemo: true,
    createdAt: isoTS(daysAgo(6), 13),
  },
  {
    id: 'demo-033', date: daysAgo(6), mealType: 'Dinner', foodItem: 'Aloo Gobi',
    category: 'Vegetables', unit: 'kg', quantityPrepared: 18, quantityServed: 15,
    quantityRemaining: 3, costPerUnit: 65, notes: '', isDemo: true,
    createdAt: isoTS(daysAgo(6), 19),
  },
  {
    id: 'demo-034', date: daysAgo(5), mealType: 'Breakfast', foodItem: 'Upma & Coconut Chutney',
    category: 'Rice & Grains', unit: 'portions', quantityPrepared: 165, quantityServed: 148,
    quantityRemaining: 17, costPerUnit: 28, notes: '', isDemo: true,
    createdAt: isoTS(daysAgo(5), 8),
  },
  {
    id: 'demo-035', date: daysAgo(5), mealType: 'Lunch', foodItem: 'Chicken Biryani',
    category: 'Rice & Grains', unit: 'kg', quantityPrepared: 45, quantityServed: 29,
    quantityRemaining: 16, costPerUnit: 180, notes: 'Wednesday biryani – consistent waste', isDemo: true,
    createdAt: isoTS(daysAgo(5), 13),
  },
  {
    id: 'demo-036', date: daysAgo(4), mealType: 'Lunch', foodItem: 'Palak Dal',
    category: 'Dal & Lentils', unit: 'kg', quantityPrepared: 26, quantityServed: 24,
    quantityRemaining: 2, costPerUnit: 85, notes: '', isDemo: true,
    createdAt: isoTS(daysAgo(4), 13),
  },
  {
    id: 'demo-037', date: daysAgo(4), mealType: 'Dinner', foodItem: 'Paneer Butter Masala',
    category: 'Curries & Gravies', unit: 'kg', quantityPrepared: 22, quantityServed: 14,
    quantityRemaining: 8, costPerUnit: 220, notes: 'Thursday – low dinner attendance', isDemo: true,
    createdAt: isoTS(daysAgo(4), 19),
  },
  {
    id: 'demo-038', date: daysAgo(3), mealType: 'Breakfast', foodItem: 'Idli & Sambar',
    category: 'Rice & Grains', unit: 'portions', quantityPrepared: 195, quantityServed: 178,
    quantityRemaining: 17, costPerUnit: 35, notes: '', isDemo: true,
    createdAt: isoTS(daysAgo(3), 8),
  },
  {
    id: 'demo-039', date: daysAgo(3), mealType: 'Lunch', foodItem: 'Chicken Biryani',
    category: 'Rice & Grains', unit: 'kg', quantityPrepared: 48, quantityServed: 30,
    quantityRemaining: 18, costPerUnit: 180, notes: 'Friday – worst week this month', isDemo: true,
    createdAt: isoTS(daysAgo(3), 13),
  },
  {
    id: 'demo-040', date: daysAgo(3), mealType: 'Snack', foodItem: 'Bread Pakora & Chutney',
    category: 'Snacks & Fried', unit: 'portions', quantityPrepared: 120, quantityServed: 110,
    quantityRemaining: 10, costPerUnit: 22, notes: '', isDemo: true,
    createdAt: isoTS(daysAgo(3), 16),
  },
  {
    id: 'demo-041', date: daysAgo(2), mealType: 'Lunch', foodItem: 'Veg Thali',
    category: 'Other', unit: 'portions', quantityPrepared: 130, quantityServed: 115,
    quantityRemaining: 15, costPerUnit: 65, notes: 'Saturday reduced menu', isDemo: true,
    createdAt: isoTS(daysAgo(2), 13),
  },
  {
    id: 'demo-042', date: daysAgo(1), mealType: 'Lunch', foodItem: 'Chicken Biryani',
    category: 'Rice & Grains', unit: 'kg', quantityPrepared: 40, quantityServed: 26,
    quantityRemaining: 14, costPerUnit: 180, notes: 'Yesterday – still overproduced', isDemo: true,
    createdAt: isoTS(daysAgo(1), 13),
  },
  {
    id: 'demo-043', date: daysAgo(1), mealType: 'Dinner', foodItem: 'Dal Makhani',
    category: 'Dal & Lentils', unit: 'kg', quantityPrepared: 24, quantityServed: 22,
    quantityRemaining: 2, costPerUnit: 110, notes: '', isDemo: true,
    createdAt: isoTS(daysAgo(1), 19),
  },
];

function hoursFromNow(h: number): string {
  const d = new Date();
  d.setHours(d.getHours() + h);
  return d.toISOString();
}

export const DEMO_SURPLUS_LISTINGS: SurplusListing[] = [
  {
    id: 'surplus-001',
    mealLogId: 'demo-039',
    foodItem: 'Chicken Biryani',
    quantity: 12,
    unit: 'kg',
    preparedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    collectionDeadline: hoursFromNow(1.5),
    handlingNotes: 'Keep covered. Refrigerate if not collected within 2 hours. Do not reheat more than once.',
    contactInfo: 'Canteen Manager — Ext 201 / Block A Kitchen',
    status: 'Available',
    isDemo: true,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 'surplus-002',
    foodItem: 'Bread Pakora & Chutney',
    quantity: 30,
    unit: 'portions',
    preparedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    collectionDeadline: hoursFromNow(0.5),
    handlingNotes: 'Consume immediately. Fried items lose quality quickly; not suitable for storage.',
    contactInfo: 'Snack Counter — Block B Ground Floor',
    status: 'Reserved',
    reservedBy: 'Student Welfare Team',
    isDemo: true,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'surplus-003',
    foodItem: 'Paneer Butter Masala',
    quantity: 6,
    unit: 'kg',
    preparedAt: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
    collectionDeadline: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    handlingNotes: 'Was refrigerated immediately. Past safe collection window — do not distribute.',
    contactInfo: 'Canteen Manager — Ext 201',
    status: 'Expired',
    isDemo: true,
    createdAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'surplus-004',
    foodItem: 'Veg Thali',
    quantity: 20,
    unit: 'portions',
    preparedAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    collectionDeadline: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
    handlingNotes: 'Collected successfully by NGO partner. Marked as distributed.',
    contactInfo: 'Weekend Canteen — Ext 215',
    status: 'Collected',
    reservedBy: 'Annadaan Foundation (Simulated)',
    isDemo: true,
    createdAt: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(),
  },
];
