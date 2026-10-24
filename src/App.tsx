import { useState, useCallback } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Dashboard } from '@/pages/Dashboard';
import { MealLogging } from '@/pages/MealLogging';
import { Analytics } from '@/pages/Analytics';
import { Forecast } from '@/pages/Forecast';
import { SurplusRescue } from '@/pages/SurplusRescue';
import { useMealLogs } from '@/hooks/useMealLogs';
import { useSurplus } from '@/hooks/useSurplus';
import * as storage from '@/lib/storage';
import type { PageId } from '@/types';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');

  const { logs, add: addLog, update: updateLog, remove: removeLog, reload: reloadLogs } = useMealLogs();
  const {
    listings,
    add: addSurplus,
    updateStatus,
    remove: removeSurplus,
    reload: reloadSurplus,
    expireOverdue,
  } = useSurplus();

  const handleResetDemo = useCallback(() => {
    if (window.confirm('Reset all data to demo dataset? This will remove any entries you have added.')) {
      storage.resetToDemo();
      reloadLogs();
      reloadSurplus();
    }
  }, [reloadLogs, reloadSurplus]);

  function renderPage() {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard logs={logs} onNavigate={setCurrentPage} />;
      case 'meal-logging':
        return (
          <MealLogging
            logs={logs}
            onAdd={addLog}
            onUpdate={updateLog}
            onDelete={removeLog}
          />
        );
      case 'analytics':
        return <Analytics logs={logs} />;
      case 'forecast':
        return <Forecast logs={logs} />;
      case 'surplus':
        return (
          <SurplusRescue
            listings={listings}
            onAdd={addSurplus}
            onStatusChange={updateStatus}
            onDelete={removeSurplus}
            onExpireOverdue={expireOverdue}
          />
        );
    }
  }

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage} onResetDemo={handleResetDemo}>
      {renderPage()}
    </Layout>
  );
}
