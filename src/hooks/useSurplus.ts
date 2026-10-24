import { useState, useCallback } from 'react';
import type { SurplusListing, SurplusStatus } from '@/types';
import * as storage from '@/lib/storage';

export function useSurplus() {
  const [listings, setListings] = useState<SurplusListing[]>(() =>
    storage.getSurplusListings(),
  );

  const add = useCallback((listing: SurplusListing) => {
    const updated = storage.addSurplusListing(listing);
    setListings(updated);
  }, []);

  const updateStatus = useCallback((id: string, status: SurplusStatus, reservedBy?: string) => {
    const current = storage.getSurplusListings().find(l => l.id === id);
    if (!current) return;
    const updated = storage.updateSurplusListing({ ...current, status, reservedBy });
    setListings(updated);
  }, []);

  const remove = useCallback((id: string) => {
    const updated = storage.deleteSurplusListing(id);
    setListings(updated);
  }, []);

  const reload = useCallback(() => {
    setListings(storage.getSurplusListings());
  }, []);

  // Auto-expire listings past their deadline
  const expireOverdue = useCallback(() => {
    const now = new Date().toISOString();
    const all = storage.getSurplusListings();
    let changed = false;
    const updated = all.map(l => {
      if (l.status === 'Available' && l.collectionDeadline < now) {
        changed = true;
        return { ...l, status: 'Expired' as SurplusStatus };
      }
      return l;
    });
    if (changed) {
      storage.saveSurplusListings(updated);
      setListings(updated);
    }
  }, []);

  return { listings, add, updateStatus, remove, reload, expireOverdue };
}
