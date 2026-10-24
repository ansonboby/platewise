import { useState } from 'react';
import { Pencil, Trash2, ChevronDown, ChevronUp, Search, Filter, X, ClipboardList } from 'lucide-react';
import type { MealLog, MealType, Unit } from '@/types';
import { MEAL_TYPES } from '@/lib/constants';
import { wastePercent } from '@/lib/analytics';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';

function wasteBadgeVariant(pct: number): 'success' | 'warning' | 'danger' | 'muted' {
  if (pct === 0) return 'success';
  if (pct < 10) return 'muted';
  if (pct < 20) return 'warning';
  return 'danger';
}

interface MealLogTableProps {
  logs: MealLog[];
  onEdit: (log: MealLog) => void;
  onDelete: (id: string) => void;
}

export function MealLogTable({ logs, onEdit, onDelete }: MealLogTableProps) {
  const [search, setSearch] = useState('');
  const [filterMeal, setFilterMeal] = useState<MealType | 'All'>('All');
  const [filterUnit, setFilterUnit] = useState<Unit | 'All'>('All');
  const [sortKey, setSortKey] = useState<'date' | 'wastePercent' | 'quantityPrepared'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  function toggleSort(key: typeof sortKey) {
    if (sortKey === key) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('desc'); }
  }

  const filtered = logs
    .filter(l => {
      if (filterMeal !== 'All' && l.mealType !== filterMeal) return false;
      if (filterUnit !== 'All' && l.unit !== filterUnit) return false;
      if (search && !l.foodItem.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      let av: number, bv: number;
      if (sortKey === 'date') {
        av = new Date(a.date).getTime();
        bv = new Date(b.date).getTime();
      } else if (sortKey === 'wastePercent') {
        av = wastePercent(a.quantityPrepared, a.quantityRemaining);
        bv = wastePercent(b.quantityPrepared, b.quantityRemaining);
      } else {
        av = a.quantityPrepared;
        bv = b.quantityPrepared;
      }
      return sortDir === 'asc' ? av - bv : bv - av;
    });

  function SortIcon({ col }: { col: typeof sortKey }) {
    if (sortKey !== col) return <ChevronDown className="h-3 w-3 opacity-30" />;
    return sortDir === 'asc'
      ? <ChevronUp className="h-3 w-3 text-forest-600" />
      : <ChevronDown className="h-3 w-3 text-forest-600" />;
  }

  return (
    <div className="p-1 rounded-2xl bg-gradient-to-b from-stone-200/60 to-stone-200/30 ring-1 ring-stone-900/5 shadow-card transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:shadow-card-hover flex flex-col">
      <div className="bg-white rounded-[calc(1rem-0.25rem)] border border-stone-100/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] overflow-hidden flex flex-col">
        {/* Filters */}
        <div className="p-4 bg-stone-50/50 border-b border-stone-200/60 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex-1 min-w-[200px] max-w-md">
            <Input
              placeholder="Search dish or food item…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              icon={<Search className="h-3.5 w-3.5" />}
              className="!py-1.5"
            />
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-1.5 bg-white border border-stone-200 rounded-xl px-2.5 py-0.5 shadow-2xs">
              <Filter className="h-3.5 w-3.5 text-stone-400" />
              <select
                value={filterMeal}
                onChange={e => setFilterMeal(e.target.value as MealType | 'All')}
                className="text-xs font-semibold text-stone-700 bg-transparent py-1 pr-2 outline-none cursor-pointer"
              >
                <option value="All">All meals</option>
                {MEAL_TYPES.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div className="bg-white border border-stone-200 rounded-xl px-2.5 py-0.5 shadow-2xs">
              <select
                value={filterUnit}
                onChange={e => setFilterUnit(e.target.value as Unit | 'All')}
                className="text-xs font-semibold text-stone-700 bg-transparent py-1 pr-2 outline-none cursor-pointer"
              >
                <option value="All">All units</option>
                <option value="kg">kg only</option>
                <option value="portions">Portions only</option>
              </select>
            </div>
            <span className="text-xs font-bold text-stone-500 bg-stone-100 px-2.5 py-1 rounded-lg border border-stone-200/60">
              {filtered.length} entries
            </span>
          </div>
        </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="h-6 w-6" />}
          title="No entries found"
          description={logs.length === 0 ? 'Add your first meal log using the button above.' : 'Try adjusting filters or search.'}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200/80 bg-stone-50/60 text-left">
                {[
                  { key: 'date' as const, label: 'Date' },
                  { key: null, label: 'Meal' },
                  { key: null, label: 'Food Item' },
                  { key: 'quantityPrepared' as const, label: 'Prepared' },
                  { key: null, label: 'Served' },
                  { key: null, label: 'Remaining' },
                  { key: 'wastePercent' as const, label: 'Waste %' },
                  { key: null, label: 'Cost Est.' },
                  { key: null, label: 'Actions' },
                ].map(({ key, label }, i) => (
                  <th
                    key={i}
                    onClick={key ? () => toggleSort(key) : undefined}
                    className={`px-4.5 py-3 text-[11px] font-bold uppercase tracking-wider text-stone-500 ${key ? 'cursor-pointer hover:text-stone-800 select-none' : ''}`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{label}</span>
                      {key && <SortIcon col={key} />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map(log => {
                const wastePct = wastePercent(log.quantityPrepared, log.quantityRemaining);
                const costEst = Math.round(log.quantityRemaining * log.costPerUnit);
                return (
                  <tr key={log.id} className="hover:bg-forest-50/20 transition-colors group">
                    <td className="px-4.5 py-3.5 text-stone-600 font-mono text-xs whitespace-nowrap">
                      {new Date(log.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </td>
                    <td className="px-4.5 py-3.5">
                      <Badge variant={log.mealType === 'Event' ? 'info' : 'muted'} size="sm">
                        {log.mealType}
                      </Badge>
                    </td>
                    <td className="px-4.5 py-3.5 font-bold text-stone-900 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span>{log.foodItem}</span>
                        {log.isDemo && (
                          <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 border border-amber-200">
                            Demo
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4.5 py-3.5 text-stone-600 font-medium tabular-nums">{log.quantityPrepared} <span className="text-[11px] text-stone-400">{log.unit}</span></td>
                    <td className="px-4.5 py-3.5 text-stone-600 font-medium tabular-nums">{log.quantityServed} <span className="text-[11px] text-stone-400">{log.unit}</span></td>
                    <td className="px-4.5 py-3.5 font-semibold text-stone-800 tabular-nums">{log.quantityRemaining} <span className="text-[11px] text-stone-400">{log.unit}</span></td>
                    <td className="px-4.5 py-3.5">
                      <Badge variant={wasteBadgeVariant(wastePct)} size="sm" className="font-mono font-bold">
                        {wastePct}%
                      </Badge>
                    </td>
                    <td className="px-4.5 py-3.5 font-semibold text-stone-700 font-mono text-xs tabular-nums">
                      {costEst > 0 ? `₹${costEst.toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td className="px-4.5 py-3.5">
                      <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" onClick={() => onEdit(log)} className="!p-1.5 hover:bg-stone-100 rounded-lg">
                          <Pencil className="h-3.5 w-3.5 text-stone-600" />
                        </Button>
                        {confirmDeleteId === log.id ? (
                          <div className="flex items-center gap-1">
                            <Button variant="danger" size="sm" onClick={() => { onDelete(log.id); setConfirmDeleteId(null); }} className="text-xs px-2 py-1">
                              Delete
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setConfirmDeleteId(null)} className="!p-1.5">
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ) : (
                          <Button variant="ghost" size="sm" onClick={() => setConfirmDeleteId(log.id)} className="!p-1.5 text-stone-400 hover:text-red-600 rounded-lg">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      </div>
    </div>
  );
}
