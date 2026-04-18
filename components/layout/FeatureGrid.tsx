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
    <section className="lg:hidden mb-4">
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {FEATURE_GRID_ITEMS.map((item) => {
          const Icon = getIcon(item.icon);
          const isActive = pathname === item.href ||
                          (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`group flex flex-col items-center justify-center p-2 sm:p-3 rounded-xl sm:rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'bg-slate-800 text-white shadow-lg shadow-slate-600/30'
                  : 'bg-white text-slate-600 hover:bg-slate-50 hover:shadow-md border border-slate-100'
              }`}
            >
              {/* Icon Container */}
              <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center mb-1 sm:mb-2 transition-all duration-200 ${
                isActive ? 'bg-slate-800' : 'bg-slate-800 group-hover:bg-slate-700'
              }`}>
                <Icon
                  className={`h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-200 text-yellow-400 ${
                    isActive ? '' : 'group-hover:scale-110'
                  }`}
                />
              </div>

              {/* Label */}
              <span className={`text-[10px] sm:text-xs font-semibold text-center leading-tight line-clamp-2 ${
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