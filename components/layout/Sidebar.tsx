'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BarChart2,
  BookOpen,
  PlayCircle,
  History,
  ShoppingCart,
  MessageCircle,
  Zap,
  Users
} from 'lucide-react';
import { MAIN_MENU_ITEMS, SECONDARY_MENU_ITEMS } from '@/constants/menu-items';

// Icon mapping
const ICON_MAP = {
  LayoutDashboard,
  BarChart2,
  BookOpen,
  PlayCircle,
  History,
  ShoppingCart,
  MessageCircle,
  Zap,
  Users
};

export function Sidebar() {
  const pathname = usePathname();

  const getIcon = (iconName: string) => {
    const Icon = ICON_MAP[iconName as keyof typeof ICON_MAP];
    return Icon || LayoutDashboard;
  };

  return (
    <aside className="hidden lg:flex flex-col fixed left-6 w-72 bg-white border border-slate-200 z-40 transition-all duration-300 rounded-3xl shadow-lg top-28 bottom-8">
      
      {/* Main Menu - Scrollable Area */}
      <div className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar">
        {/* Main Menu Section */}
        <div className="space-y-1 mb-2">
          <p className="px-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 select-none">
            Menu Utama
          </p>
          {MAIN_MENU_ITEMS.map((item) => {
            const Icon = getIcon(item.icon);
            const isActive = pathname === item.href || 
                            (item.href !== '/dashboard' && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`group relative flex items-center gap-3 px-3 py-2.5 mx-1 rounded-lg transition-all duration-200 font-medium text-sm ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon 
                  size={20} 
                  className={`flex-shrink-0 transition-colors duration-200 ${
                    isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                <span className="flex-1 truncate">{item.label}</span>
                
                {/* Optional: Chevron or Dot for active state styling enhancement */}
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mr-1" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Separator */}
        <div className="my-6 mx-2 border-t border-slate-100" />

        {/* Secondary Menu Section */}
        <div className="space-y-1">
          <p className="px-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 select-none">
            Lainnya
          </p>
          {SECONDARY_MENU_ITEMS.map((item) => {
            const Icon = getIcon(item.icon);
            const isActive = pathname === item.href ||
                            (item.href !== '/dashboard' && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`group relative flex items-center gap-3 px-3 py-2.5 mx-1 rounded-lg transition-all duration-200 font-medium text-sm ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon 
                  size={20} 
                  className={`flex-shrink-0 transition-colors duration-200 ${
                    isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                <span className="flex-1 truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Footer Area */}
      <div className="p-4 border-t border-slate-50 text-center">
        <p className="text-[10px] text-slate-300">
          © 2026 PintuASN. v1.0.0
        </p>
      </div>
    </aside>
  );
}