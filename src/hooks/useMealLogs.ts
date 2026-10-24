import { useState, useCallback } from 'react';
import type { MealLog } from '@/types';
import * as storage from '@/lib/storage';

export function useMealLogs() {
  const [logs, setLogs] = useState<MealLog[]>(() => storage.getMealLogs());

  const add = useCallback((log: MealLog) => {
    const updated = storage.addMealLog(log);
    setLogs(updated);
  }, []);

  const update = useCallback((log: MealLog) => {
    const updated = storage.updateMealLog(log);
    setLogs(updated);
  }, []);

  const remove = useCallback((id: string) => {
    const updated = storage.deleteMealLog(id);
    setLogs(updated);
  }, []);

  const reload = useCallback(() => {
    setLogs(storage.getMealLogs());
  }, []);

  return { logs, add, update, remove, reload };
}
