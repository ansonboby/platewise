import type { ReactNode } from 'react';
import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import type { PageId } from '@/types';
import { LayoutDashboard, ClipboardList, BarChart3, TrendingUp, PackageOpen } from 'lucide-react';

interface LayoutProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  onResetDemo: () => void;
  children: ReactNode;
}

const MOBILE_NAV_ITEMS = [
  { id: 'dashboard' as PageId, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'meal-logging' as PageId, label: 'Logging', icon: ClipboardList },
  { id: 'analytics' as PageId, label: 'Analytics', icon: BarChart3 },
  { id: 'forecast' as PageId, label: 'Forecast', icon: TrendingUp },
  { id: 'surplus' as PageId, label: 'Surplus', icon: PackageOpen },
];

export function Layout({ currentPage, onNavigate, onResetDemo, children }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#FBF9F5]">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <Sidebar
          currentPage={currentPage}
          onNavigate={onNavigate}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(c => !c)}
        />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar currentPage={currentPage} onResetDemo={onResetDemo} />

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur-lg border-t border-stone-200/80 z-30 flex justify-around py-2 px-1 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
          {MOBILE_NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const active = currentPage === id;
            return (
              <button
                key={id}
                onClick={() => onNavigate(id)}
                className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-semibold transition-all ${
                  active ? 'text-forest-700 bg-forest-50/80' : 'text-stone-400 hover:text-stone-700'
                }`}
              >
                <Icon className={`h-4.5 w-4.5 ${active ? 'text-forest-700 stroke-[2.2]' : 'text-stone-400'}`} />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>

        <main className="flex-1 overflow-y-auto pb-24 md:pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}
