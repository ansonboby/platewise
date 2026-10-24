# PlateWise — Food Waste Intelligence Platform

A polished, functional hackathon MVP that helps college canteens, hostels and event organisers reduce food waste by recording meal data, identifying overproduction patterns, forecasting demand, and coordinating surplus redistribution.

![PlateWise Dashboard](https://via.placeholder.com/1200x630/2d632d/ffffff?text=PlateWise+Dashboard)

---

## Features

| Feature | Description |
|---|---|
| **Dashboard** | At-a-glance KPIs: food prepared, served, surplus, waste %, estimated cost, trend chart, and AI-style recommendations |
| **Meal Logging** | Log food with date, meal type, item, category, quantities (kg or portions), and cost — with full input validation |
| **Analytics** | Waste breakdown by day-of-week, meal type, and food category; repeated overproduction detection |
| **Demand Forecasting** | Weighted moving average + day-of-week seasonality; confidence levels; optional attendance hint; reasoning exposed |
| **Surplus Rescue** | List surplus food with handling notes, collection deadlines, and food safety reminders; Reserve / Collect / Expire workflow |

---

## Tech Stack

- **React 18** + **Vite 6** + **TypeScript 5**
- **Tailwind CSS 3** — off-white / deep forest-green design system
- **Recharts 2** — area and bar charts
- **Lucide React** — icons
- **Vitest** — unit tests for analytics and forecasting logic
- **localStorage** — persistent client-side storage (swap out `src/lib/storage.ts` for a real backend)

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9 (or pnpm / yarn)

### Install & Run

```bash
# Clone or enter the project folder
cd platewise

# Install dependencies
npm install

# Start dev server (opens at http://localhost:5173)
npm run dev
```

### Run Tests

```bash
npm test
```

### Production Build

```bash
npm run build
npm run preview   # Preview at http://localhost:4173
```

---

## Project Structure

```
src/
├── components/
│   ├── layout/       — Sidebar, TopBar, Layout shell
│   ├── dashboard/    — StatCard, WasteTrendChart, RecommendationCard
│   ├── meals/        — MealLogForm, MealLogTable
│   ├── surplus/      — SurplusForm, SurplusCard
│   └── ui/           — Button, Badge, Input, Select, Modal, EmptyState
├── lib/
│   ├── analytics.ts  — Pure functions: stats, trends, insights (testable)
│   ├── forecasting.ts— Pure forecasting logic: WMA + seasonality (testable)
│   ├── storage.ts    — localStorage abstraction (swap for real API here)
│   └── constants.ts  — App-wide constants
├── data/
│   └── seedData.ts   — 43 realistic demo meal logs + 4 surplus listings
├── hooks/
│   ├── useMealLogs.ts
│   └── useSurplus.ts
├── pages/
│   ├── Dashboard.tsx
│   ├── MealLogging.tsx
│   ├── Analytics.tsx
│   ├── Forecast.tsx
│   └── SurplusRescue.tsx
├── types/
│   └── index.ts      — All TypeScript types
└── __tests__/
    ├── analytics.test.ts
    └── forecasting.test.ts
```

---

## Forecasting Algorithm

PlateWise uses a **Weighted Moving Average (WMA)** with **day-of-week seasonality**:

1. Filter historical logs for the same `foodItem + mealType + unit` combination.
2. Apply exponential recency weights (`0.9^rank` — newer = higher weight).
3. Multiply by a day-of-week factor (Friday = 1.10×, Sunday = 0.70×, etc.).
4. Optionally blend with an attendance hint (40% attendance / 60% history).
5. Add a safety buffer (5% high confidence, 10% medium, 20% low).

The algorithm exposes full reasoning for every prediction. Historical accuracy (MAPE) is computed via leave-one-out validation when ≥ 5 data points exist.

---

## Data Model

All data is stored in `localStorage` under two keys:
- `platewise_meal_logs` — array of `MealLog` objects
- `platewise_surplus` — array of `SurplusListing` objects

Demo data is seeded on first load (guarded by `platewise_seeded_v1`). Click **Reset Demo** in the top bar to restore it.

### Adding a Backend

Replace the functions in `src/lib/storage.ts` with `fetch()` calls to your API. The hooks (`useMealLogs`, `useSurplus`) and all pages remain unchanged.

---

## Design

| Token | Value |
|---|---|
| Background | `#f8f7f4` (cream) |
| Primary | `#2d632d` (forest-600) |
| Text | `#1c1917` (stone-900) |
| Card shadow | `0 1px 3px rgba(0,0,0,0.06)` |
| Border radius | `0.75–1rem` |
| Font | Inter (Google Fonts) |

---

## Important Notes

- **No external APIs or AI keys** are required. All forecasting is local, deterministic math.
- Demo data is clearly labelled with `isDemo: true` and a "Demo" badge throughout the UI.
- The Surplus Rescue workflow is **simulated** — it does not connect to real NGOs or recipients.
- Food safety reminders are informational — verify local food safety regulations before redistribution.

---

## License

MIT
