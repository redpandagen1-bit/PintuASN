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
  Zap,
  Users,
  Crown,
  MessageCircle,
} from 'lucide-react';
import { MAIN_MENU_ITEMS } from '@/constants/menu-items';

const ICON_MAP = {
  LayoutDashboard,
  BarChart2,
  BookOpen,
  PlayCircle,
  History,
  ShoppingCart,
  Zap,
  Users,
  MessageCircle,
};

const SECONDARY_ITEMS = [
  { id: 'event-promo',  label: 'Event & Promo', href: '/events-promo',       icon: 'Zap'           },
  { id: 'grup',         label: 'Grup',          href: '/grup',        icon: 'Users'         },
  { id: 'konsultasi',   label: 'Konsultasi',    href: '/konsultasi',  icon: 'MessageCircle' },
];

export function Sidebar() {
  const pathname = usePathname();

  const getIcon = (iconName: string) => {
    const Icon = ICON_MAP[iconName as keyof typeof ICON_MAP];
    return Icon || LayoutDashboard;
  };

  return (
    <aside className="hidden lg:flex flex-col sticky top-[4rem] w-72 max-h-[calc(100vh-4.75rem)] bg-white border border-slate-200 transition-all duration-300 rounded-3xl shadow-lg flex-shrink-0 self-start">
      {/* Scrollable menu area */}
      <div className="flex-1 overflow-y-auto min-h-0 py-4 px-3 custom-scrollbar">

        {/* Main Menu */}
        <div className="space-y-1 mb-2">
          <p className="px-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 select-none">
            Menu Utama
          </p>
          {MAIN_MENU_ITEMS.map((item) => {
            const Icon = getIcon(item.icon);
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`group relative flex items-center gap-3 px-3 py-2.5 mx-1 rounded-lg transition-all duration-200 font-medium text-sm ${
                  isActive
                    ? 'bg-slate-800 text-yellow-400 shadow-sm'
                    : 'text-slate-800 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon
                  size={20}
                  className={`flex-shrink-0 transition-colors duration-200 ${
                    isActive ? 'text-yellow-400' : 'text-slate-600 group-hover:text-white'
                  }`}
                />
                <span className="flex-1 truncate">{item.label}</span>
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 mr-1" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Separator */}
        <div className="my-4 mx-2 border-t border-slate-100" />

        {/* Secondary Menu */}
        <div className="space-y-1">
          <p className="px-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 select-none">
            Lainnya
          </p>
          {SECONDARY_ITEMS.map((item) => {
            const Icon = getIcon(item.icon);
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`group relative flex items-center gap-3 px-3 py-2.5 mx-1 rounded-lg transition-all duration-200 font-medium text-sm ${
                  isActive
                    ? 'bg-slate-800 text-yellow-400 shadow-sm'
                    : 'text-slate-800 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon
                  size={20}
                  className={`flex-shrink-0 transition-colors duration-200 ${
                    isActive ? 'text-yellow-400' : 'text-slate-600 group-hover:text-white'
                  }`}
                />
                <span className="flex-1 truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Upgrade Premium Banner — compact */}
      <div className="flex-shrink-0 px-3 pb-3 pt-2">
        <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="text-yellow-400 flex-shrink-0" size={16} />
            <h3 className="text-white font-bold text-sm">Upgrade Premium</h3>
          </div>
          <p className="text-slate-300 text-xs mb-3 leading-relaxed">
            Akses Paket Tryout Premium dan Materi video lengkap.
          </p>
          <Link href="/pricing">
            <button className="w-full bg-white text-slate-800 font-semibold py-2 px-4 rounded-xl hover:bg-slate-100 transition-all duration-200 text-xs shadow-md">
              Lihat Paket
            </button>
          </Link>
        </div>
        <p className="text-center text-[10px] text-slate-400 mt-2">
          © 2026 PintuASN. v1.0.0
        </p>
      </div>
    </aside>
  );
}