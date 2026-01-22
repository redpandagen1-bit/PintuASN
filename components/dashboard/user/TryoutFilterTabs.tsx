'use client';

import { useState } from 'react';

interface TryoutFilterTabsProps {
  onFilterChange?: (filter: string) => void;
}

export default function TryoutFilterTabs({ onFilterChange }: TryoutFilterTabsProps) {
  const [activeTab, setActiveTab] = useState('Semua');
  const tabs = ['Semua', 'Gratis', 'Premium', 'Platinum'];

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    onFilterChange?.(tab);
  };

  return (
    <div className="bg-slate-100/80 p-1.5 rounded-xl flex gap-1">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => handleTabClick(tab)}
          className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
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
