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
};

// C: Roadmap dihapus dari sini
// D: Konsultasi dihapus dari sini
const SECONDARY_ITEMS = [
  { id: 'event-promo', label: 'Event & Promo', href: '/promo', icon: 'Zap'   },
  { id: 'grup',        label: 'Grup',          href: '/grup',  icon: 'Users' },
];

export function Sidebar() {
  const pathname = usePathname();

  const getIcon = (iconName: string) => {
    const Icon = ICON_MAP[iconName as keyof typeof ICON_MAP];
    return Icon || LayoutDashboard;
  };

  return (
    <aside className="hidden lg:flex flex-col sticky top-[4.5rem] w-72 h-[calc(100vh-5rem)] bg-white border border-slate-200 transition-all duration-300 rounded-3xl shadow-lg flex-shrink-0">

      {/* Menu area — no scroll */}
      <div className="flex-1 overflow-hidden py-6 px-3">

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

      {/* Upgrade Premium Banner */}
      <div className="flex-shrink-0 p-4">
        <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl p-5 shadow-lg">
          <div className="w-10 h-10 bg-slate-700/50 rounded-xl flex items-center justify-center mb-3">
            <Crown className="text-yellow-400" size={20} />
          </div>
          {/* E: "Premium" berwarna kuning */}
          <h3 className="text-white font-bold text-base mb-1">
            Upgrade <span className="text-yellow-400">Premium</span>
          </h3>
          <p className="text-slate-300 text-xs mb-4 leading-relaxed">
            Akses Paket Tryout Premium dan Materi video lengkap.
          </p>
          <Link href="/beli-paket">
            <button className="w-full bg-white text-slate-800 font-semibold py-2.5 px-4 rounded-xl hover:bg-slate-100 transition-all duration-200 text-sm shadow-md">
              Lihat Paket
            </button>
          </Link>
        </div>
        <p className="text-center text-[10px] text-slate-400 mt-3">
          © 2026 PintuASN. v1.0.0
        </p>
      </div>
    </aside>
  );
}