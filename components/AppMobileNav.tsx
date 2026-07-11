import React from 'react';
import { TabType, NavItem } from '../utils/navigation';
import { HealthProfileCompletionLabel } from './HealthProfileCompletionLabel';
import { trackHealthProfileOpened } from '../utils/healthProfileAnalytics';

interface AppMobileNavProps {
  activeTab: TabType;
  bottomNavItems: NavItem[];
  navigateTo: (tab: TabType) => void;
  setShowSidebar: (next: boolean) => void;
  healthProfileCompletionPercent?: number | null;
}

export const AppMobileNav: React.FC<AppMobileNavProps> = ({
  activeTab,
  bottomNavItems,
  navigateTo,
  setShowSidebar,
  healthProfileCompletionPercent = null,
}) => {
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-[500] md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-auto max-w-md bg-white/90 dark:bg-slate-900/88 backdrop-blur-2xl border border-slate-200 dark:border-slate-700 px-5 py-2.5 flex justify-between items-center rounded-t-3xl shadow-[0_-12px_40px_rgba(0,0,0,0.14)]">
      {bottomNavItems.map((item) => (
        <button
          key={item.id}
          data-testid={`mobile-nav-${item.id}`}
          onClick={() => {
            if (item.id === 'profile') {
              trackHealthProfileOpened('nav', healthProfileCompletionPercent);
            }
            navigateTo(item.id as TabType);
          }}
          className={`flex flex-col items-center gap-0.5 transition-all max-w-[4.5rem] ${activeTab === item.id ? 'text-luna-purple scale-110' : 'text-slate-400'}`}
        >
          <span className="text-xl">{item.icon}</span>
          <span className="text-[7px] font-black uppercase tracking-widest leading-tight text-center">{item.label}</span>
          {item.id === 'profile' && healthProfileCompletionPercent != null && healthProfileCompletionPercent < 100 && (
            <HealthProfileCompletionLabel percent={healthProfileCompletionPercent} compact className="text-[7px] font-bold tabular-nums" />
          )}
        </button>
      ))}
      <button
        data-testid="mobile-nav-menu"
        onClick={() => setShowSidebar(true)}
        className="flex flex-col items-center gap-1 text-slate-400"
      >
        <span className="text-xl">☰</span>
        <span className="text-[8px] font-black uppercase tracking-widest">Menu</span>
      </button>
      </div>
    </nav>
  );
};
