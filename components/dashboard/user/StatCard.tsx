'use client';

import React from 'react';
import {
  CheckCircle,
  BarChart2,
  Award,
  TrendingUp,
  Clock,
  Star,
  Zap,
  Target
} from 'lucide-react';

const ICON_MAP = {
  CheckCircle,
  BarChart2,
  Award,
  TrendingUp,
  Clock,
  Star,
  Zap,
  Target,
};

type IconName = keyof typeof ICON_MAP;

interface StatCardProps {
  label: string;
  value: string | number;
  iconName: IconName;
}

export default function StatCard({
  label,
  value,
  iconName,
}: StatCardProps) {
  const Icon = ICON_MAP[iconName];

  return (
    <button
      type="button"
      className="group w-full text-left rounded-2xl border border-slate-200 bg-white p-5 lg:p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-slate-300"
      suppressHydrationWarning
    >
      <div className="flex items-center gap-4" suppressHydrationWarning>
        {/* Icon */}
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 transition-all duration-300 group-hover:bg-slate-700 group-hover:scale-105"
          suppressHydrationWarning
        >
          <Icon className="h-6 w-6 text-yellow-400" />
        </div>

        {/* Text */}
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {label}
          </span>
          <span className="text-2xl font-bold text-slate-800 truncate">
            {value}
          </span>
        </div>
      </div>
    </button>
  );
}