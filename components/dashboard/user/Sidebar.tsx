'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import {
  LayoutDashboard,
  BarChart2,
  BookOpen,
  PlayCircle,
  History,
  ShoppingCart,
  Crown,
} from 'lucide-react';
import { MAIN_MENU_ITEMS } from '@/constants/menu-items';

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard,
  BarChart2,
  BookOpen,
  PlayCircle,
  History,
  ShoppingCart,
};

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-slate-100 flex flex-col sticky top-0 h-screen">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-100">
        <Link href="/dashboard">
          <Image
            src="/images/Logo.svg"
            alt="PintuASN"
            width={120}
            height={36}
            priority
          />
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">
          Menu Utama
        </p>
        <ul className="space-y-0.5">
          {MAIN_MENU_ITEMS.map((item) => {
            const Icon = ICON_MAP[item.icon];
            const isActive =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(item.href);

            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                    isActive
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {Icon && (
                    <Icon
                      size={18}
                      className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}
                    />
                  )}
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white opacity-80" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Upgrade Banner */}
      <div className="p-3">
        <div className="bg-slate-800 rounded-2xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Crown size={16} className="text-amber-400" />
            <span className="text-sm font-bold">Upgrade Premium</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            Akses 50+ Paket Tryout dan pembahasan video lengkap.
          </p>
          <Link href="/pricing">
            <button className="w-full bg-white text-slate-800 text-xs font-semibold py-2 rounded-lg hover:bg-slate-100 transition-colors">
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