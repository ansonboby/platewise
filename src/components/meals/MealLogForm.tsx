import { useState, type FormEvent } from 'react';
import { PlusCircle, X, Save, Info } from 'lucide-react';
import type { MealLog, MealType, FoodCategory, Unit } from '@/types';
import { MEAL_TYPES, FOOD_CATEGORIES, UNITS, DEFAULT_COST_PER_UNIT } from '@/lib/constants';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

function generateId() {
  return `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

interface MealLogFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (log: MealLog) => void;
  initial?: Partial<MealLog>;
}

type FormErrors = Partial<Record<keyof MealLog | 'totals', string>>;

export function MealLogForm({ open, onClose, onSave, initial }: MealLogFormProps) {
  const today = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState(initial?.date ?? today);
  const [mealType, setMealType] = useState<MealType>(initial?.mealType ?? 'Lunch');
  const [foodItem, setFoodItem] = useState(initial?.foodItem ?? '');
  const [category, setCategory] = useState<FoodCategory>(initial?.category ?? 'Other');
  const [unit, setUnit] = useState<Unit>(initial?.unit ?? 'kg');
  const [prepared, setPrepared] = useState(initial?.quantityPrepared?.toString() ?? '');
  const [served, setServed] = useState(initial?.quantityServed?.toString() ?? '');
  const [remaining, setRemaining] = useState(initial?.quantityRemaining?.toString() ?? '');
  const [costPerUnit, setCostPerUnit] = useState(
    initial?.costPerUnit?.toString() ?? String(DEFAULT_COST_PER_UNIT[initial?.unit ?? 'kg']),
  );
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [errors, setErrors] = useState<FormErrors>({});

  // Auto-fill remaining = prepared - served when both filled
  const handleServedChange = (val: string) => {
    setServed(val);
    const p = parseFloat(prepared);
    const s = parseFloat(val);
    if (!isNaN(p) && !isNaN(s) && p >= s && remaining === '') {
      setRemaining(String(Math.round((p - s) * 100) / 100));
    }
  };

  // When unit changes, reset cost to default
  const handleUnitChange = (val: string) => {
    const u = val as Unit;
    setUnit(u);
    if (!initial?.costPerUnit) setCostPerUnit(String(DEFAULT_COST_PER_UNIT[u]));
  };

  function validate(): FormErrors {
    const errs: FormErrors = {};
    if (!date) errs.date = 'Date is required.';
    if (new Date(date) > new Date(today)) errs.date = 'Date cannot be in the future.';
    if (!foodItem.trim()) errs.foodItem = 'Food item name is required.';
    if (foodItem.trim().length < 2) errs.foodItem = 'Name must be at least 2 characters.';

    const p = parseFloat(prepared);
    const s = parseFloat(served);
    const r = parseFloat(remaining);
    const c = parseFloat(costPerUnit);

    if (isNaN(p) || p <= 0) errs.quantityPrepared = 'Enter a positive quantity prepared.';
    if (isNaN(s) || s < 0) errs.quantityServed = 'Enter a non-negative quantity served.';
    if (isNaN(r) || r < 0) errs.quantityRemaining = 'Enter a non-negative quantity remaining.';
    if (isNaN(c) || c < 0) errs.costPerUnit = 'Enter a valid cost (≥ 0).';

    if (!isNaN(p) && !isNaN(s) && s > p) {
      errs.quantityServed = 'Served cannot exceed prepared.';
    }
    if (!isNaN(p) && !isNaN(r) && r > p) {
      errs.quantityRemaining = 'Remaining cannot exceed prepared.';
    }
    if (!isNaN(p) && !isNaN(s) && !isNaN(r)) {
      const sum = s + r;
      const diff = Math.abs(sum - p);
      if (diff > 0.01) {
        errs.totals = `Served (${s}) + Remaining (${r}) = ${Math.round(sum * 100) / 100}, but Prepared = ${p}. These should match.`;
      }
    }

    return errs;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const log: MealLog = {
      id: initial?.id ?? generateId(),
      date,
      mealType,
      foodItem: foodItem.trim(),
      category,
      unit,
      quantityPrepared: parseFloat(prepared),
      quantityServed: parseFloat(served),
      quantityRemaining: parseFloat(remaining),
      costPerUnit: parseFloat(costPerUnit),
      notes: notes.trim(),
      isDemo: false,
      createdAt: initial?.createdAt ?? new Date().toISOString(),
    };

    onSave(log);
    onClose();
  }

  const wastePercent =
    parseFloat(prepared) > 0 && !isNaN(parseFloat(remaining))
      ? Math.round((parseFloat(remaining) / parseFloat(prepared)) * 1000) / 10
      : null;

  return (
    <Modal open={open} onClose={onClose} title={initial?.id ? 'Edit Meal Log' : 'Log a Meal'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Row 1: Date + Meal type */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Date"
            type="date"
            value={date}
            max={today}
            onChange={e => { setDate(e.target.value); setErrors({}); }}
            error={errors.date}
          />
          <Select
            label="Meal Type"
            value={mealType}
            onChange={e => setMealType(e.target.value as MealType)}
            options={MEAL_TYPES.map(m => ({ value: m, label: m }))}
          />
        </div>

        {/* Row 2: Food item + Category */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Food Item"
            placeholder="e.g. Chicken Biryani"
            value={foodItem}
            onChange={e => { setFoodItem(e.target.value); setErrors(p => ({ ...p, foodItem: undefined })); }}
            error={errors.foodItem}
          />
          <Select
            label="Category"
            value={category}
            onChange={e => setCategory(e.target.value as FoodCategory)}
            options={FOOD_CATEGORIES.map(c => ({ value: c, label: c }))}
          />
        </div>

        {/* Unit selector — prominent */}
        <div className="bg-stone-50/80 border border-stone-200/80 rounded-2xl p-3.5">
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 text-forest-600" />
              Measurement Unit
            </p>
            <span className="text-[11px] text-stone-400">Fixed for this record</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5 bg-stone-200/50 p-1 rounded-xl">
            {UNITS.map(u => (
              <button
                type="button"
                key={u}
                onClick={() => handleUnitChange(u)}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all duration-150 flex items-center justify-center gap-2 ${
                  unit === u
                    ? 'bg-white text-forest-800 shadow-sm ring-1 ring-stone-900/5'
                    : 'text-stone-500 hover:text-stone-800 hover:bg-white/40'
                }`}
              >
                <span>{u === 'kg' ? '⚖️ Kilograms (kg)' : '🍽️ Portioned Meals'}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Row 3: Quantities */}
        <div className="grid grid-cols-3 gap-3.5">
          <Input
            label={`Prepared (${unit})`}
            type="number"
            min="0"
            step={unit === 'kg' ? '0.1' : '1'}
            placeholder="0"
            value={prepared}
            onChange={e => { setPrepared(e.target.value); setErrors({}); }}
            error={errors.quantityPrepared}
          />
          <Input
            label={`Served (${unit})`}
            type="number"
            min="0"
            step={unit === 'kg' ? '0.1' : '1'}
            placeholder="0"
            value={served}
            onChange={e => { handleServedChange(e.target.value); setErrors(p => ({ ...p, quantityServed: undefined, totals: undefined })); }}
            error={errors.quantityServed}
          />
          <div>
            <Input
              label={`Remaining (${unit})`}
              type="number"
              min="0"
              step={unit === 'kg' ? '0.1' : '1'}
              placeholder="0"
              value={remaining}
              onChange={e => { setRemaining(e.target.value); setErrors(p => ({ ...p, quantityRemaining: undefined, totals: undefined })); }}
              error={errors.quantityRemaining}
            />
            {wastePercent !== null && (
              <div className="mt-1.5 flex items-center gap-1.5">
                <div className="flex-1 h-1.5 rounded-full bg-stone-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      wastePercent > 25 ? 'bg-red-500' : wastePercent > 12 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(wastePercent, 100)}%` }}
                  />
                </div>
                <span className={`text-[11px] font-bold tabular-nums ${wastePercent > 20 ? 'text-red-600' : wastePercent > 10 ? 'text-amber-600' : 'text-forest-600'}`}>
                  {wastePercent}%
                </span>
              </div>
            )}
          </div>
        </div>

        {errors.totals && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-xs text-red-700">
            ⚠ {errors.totals}
          </div>
        )}

        {/* Cost */}
        <Input
          label={`Cost per ${unit} (₹)`}
          type="number"
          min="0"
          step="1"
          value={costPerUnit}
          onChange={e => setCostPerUnit(e.target.value)}
          error={errors.costPerUnit}
          helper={`Default ₹${DEFAULT_COST_PER_UNIT[unit]}/${unit}. Adjust if different.`}
        />

        {/* Notes */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-stone-700">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={2}
            placeholder="e.g. Special event, rainy day lower turnout..."
            className="w-full border border-stone-200 rounded-xl py-2 px-3 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-400 resize-none"
          />
        </div>

        <div className="flex gap-3 pt-1">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            <X className="h-4 w-4" />
            Cancel
          </Button>
          <Button type="submit" variant="primary" className="flex-1">
            <Save className="h-4 w-4" />
            Save Entry
          </Button>
        </div>
      </form>
    </Modal>
  );
}

interface AddMealButtonProps {
  onClick: () => void;
}

export function AddMealButton({ onClick }: AddMealButtonProps) {
  return (
    <Button onClick={onClick} variant="primary" size="md">
      <PlusCircle className="h-4 w-4" />
      Log a Meal
    </Button>
  );
}
