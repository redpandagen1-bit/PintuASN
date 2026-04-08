'use client';

import React from 'react';
import {
  CheckCircle, BarChart2, Award, TrendingUp,
  Clock, Star, Zap, Target, type LucideIcon,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  CheckCircle, BarChart2, Award, TrendingUp, Clock, Star, Zap, Target,
};

interface StatCardProps {
  label:     string;
  value:     string | number;
  iconName:  string;
  iconColor: string;
  iconBg:    string;
}

export default function StatCard({ label, value, iconName, iconColor, iconBg }: StatCardProps) {
  const Icon = ICON_MAP[iconName] ?? BarChart2;

  return (
    <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 border border-slate-100 shadow-sm">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 leading-none">
          {label}
        </p>
        <p className="text-lg font-bold text-slate-800 leading-tight truncate mt-0.5">
          {value}
        </p>
      </div>
    </div>
  );
}