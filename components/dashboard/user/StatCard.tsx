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

// Icon mapping - add more icons as needed
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
  iconName: IconName; // Changed from icon: LucideIcon
  iconColor: string;
  iconBg: string;
}

export default function StatCard({ 
  label, 
  value, 
  iconName, 
  iconColor, 
  iconBg 
}: StatCardProps) {
  const Icon = ICON_MAP[iconName];

  return (
    <div className="group bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer">
      <div className="flex items-center gap-4">
        {/* Icon Circle */}
        <div className={`flex-shrink-0 w-14 h-14 rounded-2xl ${iconBg} flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
          <Icon className={`w-7 h-7 ${iconColor}`} />
        </div>
        
        {/* Stats Text */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            {label}
          </p>
          <h3 className="text-3xl font-bold text-slate-800 truncate">
            {value}
          </h3>
        </div>
      </div>
    </div>
  );
}
