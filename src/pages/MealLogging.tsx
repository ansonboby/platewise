import { useState } from 'react';
import type { MealLog } from '@/types';
import { MealLogForm, AddMealButton } from '@/components/meals/MealLogForm';
import { MealLogTable } from '@/components/meals/MealLogTable';
import { Badge } from '@/components/ui/Badge';

interface MealLoggingProps {
  logs: MealLog[];
  onAdd: (log: MealLog) => void;
  onUpdate: (log: MealLog) => void;
  onDelete: (id: string) => void;
}

export function MealLogging({ logs, onAdd, onUpdate, onDelete }: MealLoggingProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editLog, setEditLog] = useState<MealLog | undefined>();

  function handleSave(log: MealLog) {
    if (editLog) onUpdate(log);
    else onAdd(log);
    setEditLog(undefined);
  }

  function handleEdit(log: MealLog) {
    setEditLog(log);
    setFormOpen(true);
  }

  function handleClose() {
    setFormOpen(false);
    setEditLog(undefined);
  }

  const demoCount = logs.filter(l => l.isDemo).length;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-stone-900 tracking-tight">
            Production & Service Logs
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 font-medium mt-0.5">
            Audit daily prepared quantities, served counts, and verified leftover scrap.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-stone-200/80 text-xs font-semibold text-stone-600 shadow-2xs">
            <span>{logs.length} Total Logs</span>
            {demoCount > 0 && (
              <Badge variant="warning" size="sm">
                {demoCount} Demo
              </Badge>
            )}
          </div>
          <AddMealButton onClick={() => setFormOpen(true)} />
        </div>
      </div>

      <MealLogTable logs={logs} onEdit={handleEdit} onDelete={onDelete} />

      <MealLogForm
        open={formOpen}
        onClose={handleClose}
        onSave={handleSave}
        initial={editLog}
      />
    </div>
  );
}
