'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart2,
  BookOpen,
  PlayCircle,
  History,
  ShoppingCart,
  MessageCircle,
  Zap,
  Users
} from 'lucide-react';
import { FEATURE_GRID_ITEMS } from '@/constants/menu-items';

// Icon mapping
const ICON_MAP = {
  BarChart2,
  BookOpen,
  PlayCircle,
  History,
  ShoppingCart,
  MessageCircle,
  Zap,
  Users
};

export function FeatureGrid() {
  const pathname = usePathname();

  const getIcon = (iconName: string) => {
    const Icon = ICON_MAP[iconName as keyof typeof ICON_MAP];
    return Icon || BarChart2;
  };

  return (
    <section className="lg:hidden mb-6">
      {/* Feature Grid Container */}
      <div className="grid grid-cols-4 gap-3 sm:gap-4">
        {FEATURE_GRID_ITEMS.map((item) => {
          const Icon = getIcon(item.icon);
          const isActive = pathname === item.href || 
                          (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`group flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-white text-slate-600 hover:bg-slate-50 hover:shadow-md border border-slate-100'
              }`}
            >
              {/* Icon Container */}
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-200 ${
                isActive
                  ? 'bg-white/20'
                  : 'bg-slate-100 group-hover:bg-blue-50'
              }`}>
                <Icon 
                  size={24} 
                  className={`transition-transform duration-200 ${
                    isActive 
                      ? 'text-white' 
                      : 'text-blue-600 group-hover:scale-110'
                  }`}
                />
              </div>
              
              {/* Label */}
              <span className={`text-xs font-semibold text-center leading-tight line-clamp-2 ${
                isActive ? 'text-white' : 'text-slate-700'
              }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
