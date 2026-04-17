'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  BarChart2,
  BookOpen,
  ClipboardList,
  History,
  ShoppingCart,
  Megaphone,
  Users,
  Crown,
  Trophy,
  Sparkles,
} from 'lucide-react';
import { MAIN_MENU_ITEMS } from '@/constants/menu-items';

type Tier = 'free' | 'premium' | 'platinum';

const ICON_MAP = {
  LayoutDashboard,
  BarChart2,
  BookOpen,
  ClipboardList,
  History,
  ShoppingCart,
  Megaphone,
  Users,
};

const SECONDARY_ITEMS = [
  { id: 'event-promo', label: 'Event & Promo', href: '/events-promo', icon: 'Megaphone' },
  { id: 'grup',        label: 'Grup',          href: '/grup',         icon: 'Users' },
];

export function Sidebar() {
  const pathname = usePathname();
  const [userTier, setUserTier] = useState<Tier>('free');

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then(data => {
        const tier: Tier = data?.profile?.subscription_tier ?? data?.subscription_tier ?? 'free';
        setUserTier(tier);
      })
      .catch(() => setUserTier('free'));
  }, []);

  const getIcon = (iconName: string) => {
    const Icon = ICON_MAP[iconName as keyof typeof ICON_MAP];
    return Icon || LayoutDashboard;
  };

  return (
    <aside className="hidden lg:flex flex-col sticky top-[4.5rem] w-72 h-[calc(100vh-5rem)] bg-white border border-slate-200 transition-all duration-300 rounded-3xl shadow-lg flex-shrink-0">

      {/* ── Menu area ─────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto py-5 px-3 min-h-0">

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
        <div className="my-3 mx-2 border-t border-slate-100" />

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

      {/* ── Bottom section ────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 px-4 pb-4 pt-2">

        {/* ── FREE ──────────────────────────────────────────────────────── */}
        {userTier === 'free' && (
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="text-yellow-400 flex-shrink-0" size={15} />
              <h3 className="text-white font-bold text-sm leading-tight">
                Upgrade <span className="text-yellow-400">Premium</span>
              </h3>
            </div>
            <p className="text-slate-300 text-xs mb-2 leading-relaxed">
              Akses Paket Tryout Premium dan Materi video lengkap.
            </p>

            {/* Spacer biar tingginya sama dengan platinum card */}
            <div className="h-px bg-white/10 mb-3" />
            <div className="grid grid-cols-3 gap-1.5 mb-3">
              <div className="bg-white/5 border border-white/10 rounded-lg py-1.5 text-center">
                <p className="text-slate-500 text-[11px] font-black leading-none">✗</p>
                <p className="text-slate-500 text-[9px] mt-0.5">Riwayat</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg py-1.5 text-center">
                <p className="text-slate-500 text-[11px] font-black leading-none">✗</p>
                <p className="text-slate-500 text-[9px] mt-0.5">Video SKD</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg py-1.5 text-center">
                <p className="text-slate-500 text-[11px] font-black leading-none">✗</p>
                <p className="text-slate-500 text-[9px] mt-0.5">Analisis</p>
              </div>
            </div>
            <Link href="/beli-paket">
              <button className="w-full bg-white text-slate-800 font-semibold py-2 px-4 rounded-xl hover:bg-slate-100 transition-all duration-200 text-xs shadow-md">
                Lihat Paket
              </button>
            </Link>
          </div>
        )}

        {/* ── PREMIUM ───────────────────────────────────────────────────── */}
        {userTier === 'premium' && (
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="text-yellow-400 flex-shrink-0" size={15} />
              <h3 className="text-white font-bold text-sm leading-tight">
                Upgrade <span className="text-yellow-400">Platinum</span>
              </h3>
            </div>
            <p className="text-slate-300 text-xs mb-2 leading-relaxed">
              Akses fitur eksklusif & video series SKD lengkap.
            </p>
            <div className="h-px bg-white/10 mb-3" />
            <div className="grid grid-cols-3 gap-1.5 mb-3">
              <div className="bg-white/5 border border-white/10 rounded-lg py-1.5 text-center">
                <p className="text-yellow-400 text-[11px] font-black leading-none">∞</p>
                <p className="text-slate-400 text-[9px] mt-0.5">Riwayat</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg py-1.5 text-center">
                <p className="text-yellow-400 text-[11px] font-black leading-none">HD</p>
                <p className="text-slate-400 text-[9px] mt-0.5">Video SKD</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg py-1.5 text-center">
                <p className="text-yellow-400 text-[11px] font-black leading-none">Pro</p>
                <p className="text-slate-400 text-[9px] mt-0.5">Analisis</p>
              </div>
            </div>
            <div className="mb-3">
              <p className="text-slate-500 text-xs line-through leading-none mb-0.5">
                Rp 119.000
              </p>
              <p className="text-white font-bold text-lg leading-none">
                Rp 29.000
              </p>
            </div>
            <Link href="/beli-paket">
              <button className="w-full bg-white text-slate-800 font-semibold py-2 px-4 rounded-xl hover:bg-slate-100 transition-all duration-200 text-xs shadow-md">
                Upgrade Sekarang
              </button>
            </Link>
          </div>
        )}

        {/* ── PLATINUM ──────────────────────────────────────────────────── */}
        {userTier === 'platinum' && (
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl p-4 shadow-lg">
            {/* Header */}
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-7 h-7 rounded-lg bg-yellow-400/20 flex items-center justify-center flex-shrink-0">
                <Trophy size={14} className="text-yellow-400" />
              </div>
              <div>
                <p className="text-white font-bold text-sm leading-none">
                  Member <span className="text-yellow-400">Platinum</span>
                </p>
                <p className="text-slate-400 text-[10px] mt-0.5">Level tertinggi aktif ✓</p>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-white/10 mb-3" />

            {/* Copy */}
            <div className="flex items-start gap-2 mb-3">
              <Sparkles size={12} className="text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-slate-300 text-xs leading-relaxed">
                Kamu sudah di puncak! Maksimalkan analisis, video SKD, dan riwayat tak terbatas untuk kejar passing grade.
              </p>
            </div>

            {/* Stat pills */}
            <div className="grid grid-cols-3 gap-1.5">
              <div className="bg-white/5 border border-white/10 rounded-lg py-1.5 text-center">
                <p className="text-yellow-400 text-[11px] font-black leading-none">∞</p>
                <p className="text-slate-400 text-[9px] mt-0.5">Riwayat</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg py-1.5 text-center">
                <p className="text-yellow-400 text-[11px] font-black leading-none">HD</p>
                <p className="text-slate-400 text-[9px] mt-0.5">Video SKD</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg py-1.5 text-center">
                <p className="text-yellow-400 text-[11px] font-black leading-none">Pro</p>
                <p className="text-slate-400 text-[9px] mt-0.5">Analisis</p>
              </div>
            </div>
          </div>
        )}

        <p className="text-center text-[10px] text-slate-400 mt-2">
          © 2026 PintuASN. v1.0.0
        </p>
      </div>
    </aside>
  );
}