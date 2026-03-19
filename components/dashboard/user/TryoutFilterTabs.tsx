'use client';

import { useState } from 'react';

export type TryoutFilter = 'Semua' | 'Gratis' | 'Premium' | 'Platinum';

interface TryoutFilterTabsProps {
  activeFilter?: TryoutFilter;
  onFilterChange?: (filter: TryoutFilter) => void;
}

export default function TryoutFilterTabs({ 
  activeFilter,
  onFilterChange 
}: TryoutFilterTabsProps) {
  const [internalTab, setInternalTab] = useState<TryoutFilter>('Semua');
  
  // Gunakan controlled (dari parent) atau uncontrolled (internal state)
  const activeTab = activeFilter ?? internalTab;

  const tabs: TryoutFilter[] = ['Semua', 'Gratis', 'Premium', 'Platinum'];

  const handleTabClick = (tab: TryoutFilter) => {
    if (!activeFilter) setInternalTab(tab);
    onFilterChange?.(tab);
  };

  return (
    <div className="bg-slate-100/80 p-1 rounded-xl flex gap-1">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => handleTabClick(tab)}
          className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
            tab === activeTab
              ? 'bg-white text-slate-800 shadow-sm'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}