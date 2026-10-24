import { useEffect, useMemo } from 'react';
import { PackageOpen, ShieldAlert } from 'lucide-react';
import type { SurplusListing } from '@/types';
import { SurplusForm, AddSurplusButton, SurplusCard } from '@/components/surplus/SurplusForm';
import { EmptyState } from '@/components/ui/EmptyState';
import { useState } from 'react';

interface SurplusRescueProps {
  listings: SurplusListing[];
  onAdd: (listing: SurplusListing) => void;
  onStatusChange: (id: string, status: SurplusListing['status'], reservedBy?: string) => void;
  onDelete: (id: string) => void;
  onExpireOverdue: () => void;
}

const STATUS_FILTERS = ['All', 'Available', 'Reserved', 'Collected', 'Expired'] as const;

export function SurplusRescue({ listings, onAdd, onStatusChange, onDelete, onExpireOverdue }: SurplusRescueProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [filter, setFilter] = useState<typeof STATUS_FILTERS[number]>('All');

  // Auto-expire overdue listings on mount and every 60s
  useEffect(() => {
    onExpireOverdue();
    const interval = setInterval(onExpireOverdue, 60_000);
    return () => clearInterval(interval);
  }, [onExpireOverdue]);

  const filtered = useMemo(
    () => (filter === 'All' ? listings : listings.filter(l => l.status === filter)),
    [listings, filter],
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: listings.length };
    for (const l of listings) c[l.status] = (c[l.status] ?? 0) + 1;
    return c;
  }, [listings]);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-stone-900 tracking-tight">
            Surplus Redistribution Network
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 font-medium mt-0.5">
            Coordinate rapid volunteer pickup for freshly prepared surplus before safety windows expire.
          </p>
        </div>
        <AddSurplusButton onClick={() => setFormOpen(true)} />
      </div>

      {/* Safety & Workflow Advisories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Food safety reminder */}
        <div className="bg-gradient-to-r from-red-500/10 via-red-500/5 to-transparent border border-red-300/80 rounded-2xl p-4 text-xs text-red-950 flex items-start gap-3 shadow-2xs">
          <div className="p-2 rounded-xl bg-red-100 text-red-700 border border-red-200 shrink-0">
            <ShieldAlert className="h-4 w-4" />
          </div>
          <div className="space-y-1">
            <p className="font-bold text-red-900 text-xs">Food Safety Compliance Protocol</p>
            <p className="text-red-900/80 leading-relaxed">
              Hot dishes must stay above 60°C or undergo active chilling below 5°C within 2 hours.
              Do not redistribute past collection deadlines. Always conduct olfactory and visual inspection prior to handover.
            </p>
          </div>
        </div>

        {/* Simulated workflow notice */}
        <div className="bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-transparent border border-blue-300/80 rounded-2xl p-4 text-xs text-blue-950 flex items-start gap-3 shadow-2xs">
          <div className="p-2 rounded-xl bg-blue-100 text-blue-700 border border-blue-200 shrink-0">
            <PackageOpen className="h-4 w-4" />
          </div>
          <div className="space-y-1">
            <p className="font-bold text-blue-900 text-xs">Simulated Dispatch Routing</p>
            <p className="text-blue-900/80 leading-relaxed">
              Recipient and volunteer actions are simulated in this hackathon environment.
              In full deployment, status changes trigger webhook dispatches to registered local food banks and NGOs.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Segment Pill Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-white p-2.5 rounded-2xl border border-stone-200/70 shadow-xs">
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_FILTERS.map(s => {
            const active = filter === s;
            return (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 flex items-center gap-1.5 ${
                  active
                    ? 'bg-forest-600 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/70'
                }`}
              >
                <span>{s}</span>
                {counts[s] !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      active ? 'bg-forest-700/80 text-white' : 'bg-stone-200/70 text-stone-600'
                    }`}
                  >
                    {counts[s]}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <p className="text-xs text-stone-400 font-medium px-2">
          Auto-refreshing expiry timers every 60s
        </p>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<PackageOpen className="h-8 w-8 text-forest-600" />}
          title={filter === 'All' ? 'No surplus listings' : `No ${filter} listings`}
          description={
            filter === 'All'
              ? 'When meal preparation exceeds consumption, post surplus here to coordinate rescue operations.'
              : `Switch to "All" to inspect listings with other lifecycle statuses.`
          }
          action={filter === 'All' ? <AddSurplusButton onClick={() => setFormOpen(true)} /> : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(listing => (
            <SurplusCard
              key={listing.id}
              listing={listing}
              onStatusChange={onStatusChange}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      <SurplusForm open={formOpen} onClose={() => setFormOpen(false)} onSave={onAdd} />
    </div>
  );
}
