'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { MAIN_MENU_ITEMS, SECONDARY_MENU_ITEMS } from '@/constants/menu-items';

type Tier = 'free' | 'premium' | 'platinum';

function NavIcon({ iconFile, isActive }: { iconFile: string; isActive: boolean }) {
  return (
    <img
      src={`/images/icons/${iconFile}.svg`}
      alt={iconFile}
      width={28}
      height={28}
      className="flex-shrink-0 transition-all duration-200"
      style={{ opacity: isActive ? 1 : 0.85 }}
    />
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [userTier, setUserTier] = useState<Tier>('free');

  useEffect(() => {
    fetch('/api/profile')
      .then((r) => r.json())
      .then((data) => {
        const tier: Tier =
          data?.profile?.subscription_tier ?? data?.subscription_tier ?? 'free';
        setUserTier(tier);
      })
      .catch(() => setUserTier('free'));
  }, []);

  return (
    <aside className="hidden lg:flex flex-col sticky top-[4.5rem] w-72 h-[calc(100vh-5rem)] bg-white border border-slate-200 transition-all duration-300 rounded-3xl shadow-lg flex-shrink-0">

      {/* ── Menu area ── */}
      <div className="flex-1 overflow-y-auto py-5 px-3 min-h-0">

        {/* Main Menu */}
        <div className="space-y-0.5 mb-2">
          <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 select-none">
            Menu Utama
          </p>
          {MAIN_MENU_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`group relative flex items-center gap-3 px-2 py-2 mx-1 rounded-xl transition-all duration-200 font-medium text-sm ${
                  isActive
                    ? 'bg-slate-800 text-yellow-400 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <NavIcon iconFile={item.iconFile} isActive={isActive} />
                <span className="flex-1 truncate text-[13px]">{item.label}</span>
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 mr-1 flex-shrink-0" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Separator */}
        <div className="my-3 mx-2 border-t border-slate-100" />

        {/* Secondary Menu */}
        <div className="space-y-0.5">
          <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 select-none">
            Lainnya
          </p>
          {SECONDARY_MENU_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`group relative flex items-center gap-3 px-2 py-2 mx-1 rounded-xl transition-all duration-200 font-medium text-sm ${
                  isActive
                    ? 'bg-slate-800 text-yellow-400 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <NavIcon iconFile={item.iconFile} isActive={isActive} />
                <span className="flex-1 truncate text-[13px]">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── Bottom section ── */}
      <div className="flex-shrink-0 px-4 pb-4 pt-2">

        {/* FREE */}
        {userTier === 'free' && (
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center gap-2.5 mb-2">
              <img
                src="/images/icons/tier_gratis.svg"
                alt="gratis"
                width={22}
                height={22}
                className="flex-shrink-0"
              />
              <h3 className="text-white font-bold text-sm leading-tight">
                Upgrade ke <span className="text-yellow-400">Premium</span>
              </h3>
            </div>
            <p className="text-slate-400 text-xs mb-3 leading-relaxed">
              Akses tryout premium & materi video SKD lengkap.
            </p>
            <div className="h-px bg-white/10 mb-3" />
            <div className="grid grid-cols-3 gap-1.5 mb-3">
              {[
                { file: 'riwayat_free', label: 'Riwayat' },
                { file: 'video_skd_free', label: 'Video SKD' },
                { file: 'analisis_free', label: 'Analisis' },
              ].map(({ file, label }) => (
                <div
                  key={file}
                  className="bg-white/5 border border-white/10 rounded-lg py-2 text-center"
                >
                  <img
                    src={`/images/icons/${file}.svg`}
                    alt={label}
                    width={22}
                    height={22}
                    className="mx-auto mb-1"
                  />
                  <p className="text-slate-500 text-[9px] font-medium">{label}</p>
                </div>
              ))}
            </div>
            <Link href="/beli-paket">
              <button className="w-full bg-yellow-400 text-slate-900 font-bold py-2 px-4 rounded-xl hover:bg-yellow-300 transition-all duration-200 text-xs shadow-md">
                Lihat Paket →
              </button>
            </Link>
          </div>
        )}

        {/* PREMIUM */}
        {userTier === 'premium' && (
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center gap-2.5 mb-2">
              <img
                src="/images/icons/tier_premium.svg"
                alt="premium"
                width={22}
                height={22}
                className="flex-shrink-0"
              />
              <h3 className="text-white font-bold text-sm leading-tight">
                Upgrade ke <span className="text-yellow-400">Platinum</span>
              </h3>
            </div>
            <p className="text-slate-400 text-xs mb-3 leading-relaxed">
              Fitur eksklusif & video series SKD lengkap.
            </p>
            <div className="h-px bg-white/10 mb-3" />
            <div className="grid grid-cols-3 gap-1.5 mb-3">
              {[
                { file: 'riwayat_premium', label: 'Riwayat' },
                { file: 'video_skd_premium', label: 'Video SKD' },
                { file: 'analisis_premium', label: 'Analisis' },
              ].map(({ file, label }) => (
                <div
                  key={file}
                  className="bg-white/5 border border-white/10 rounded-lg py-2 text-center"
                >
                  <img
                    src={`/images/icons/${file}.svg`}
                    alt={label}
                    width={22}
                    height={22}
                    className="mx-auto mb-1"
                  />
                  <p className="text-slate-400 text-[9px] font-medium">{label}</p>
                </div>
              ))}
            </div>
            <div className="mb-3">
              <p className="text-slate-500 text-xs line-through leading-none mb-0.5">
                Rp 119.000
              </p>
              <p className="text-white font-bold text-lg leading-none">Rp 29.000</p>
            </div>
            <Link href="/beli-paket">
              <button className="w-full bg-yellow-400 text-slate-900 font-bold py-2 px-4 rounded-xl hover:bg-yellow-300 transition-all duration-200 text-xs shadow-md">
                Upgrade Sekarang →
              </button>
            </Link>
          </div>
        )}

        {/* PLATINUM */}
        {userTier === 'platinum' && (
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center gap-2.5 mb-3">
              <img
                src="/images/icons/tier_platinum.svg"
                alt="platinum"
                width={30}
                height={30}
                className="flex-shrink-0 rounded-lg"
              />
              <div>
                <p className="text-white font-bold text-sm leading-none">
                  Member <span className="text-yellow-400">Platinum</span>
                </p>
                <p className="text-slate-400 text-[10px] mt-0.5">Level tertinggi aktif ✓</p>
              </div>
            </div>
            <div className="h-px bg-white/10 mb-3" />
            <div className="flex items-start gap-2 mb-3">
              <Sparkles size={12} className="text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-slate-300 text-xs leading-relaxed">
                Kamu sudah di puncak! Maksimalkan analisis, video SKD, dan riwayat tak terbatas.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                ['∞', 'Riwayat'],
                ['HD', 'Video SKD'],
                ['Pro', 'Analisis'],
              ].map(([val, lbl]) => (
                <div
                  key={lbl}
                  className="bg-white/5 border border-white/10 rounded-lg py-2 text-center"
                >
                  <p className="text-yellow-400 text-[12px] font-black leading-none">{val}</p>
                  <p className="text-slate-400 text-[9px] mt-1">{lbl}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-center text-[10px] text-slate-400 mt-3">
          © 2026 PintuASN. v1.0.0
        </p>
      </div>
    </aside>
  );
}