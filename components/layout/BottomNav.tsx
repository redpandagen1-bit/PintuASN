'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useNotifications } from '@/hooks/use-notifications';

const GOLD_FILTER  = 'brightness(0) saturate(100%) invert(79%) sepia(61%) saturate(500%) hue-rotate(1deg) brightness(103%)';   /* → #f9bd22 */
const SLATE_FILTER = 'brightness(0) saturate(100%) invert(63%) sepia(8%) saturate(487%) hue-rotate(182deg) brightness(95%)';   /* → slate-400 */

// Item kiri & kanan (roadmap = FAB tengah, terpisah)
const LEFT_ITEMS = [
  { id: 'home',      label: 'Home',      href: '/dashboard',  icon: 'nav_home' },
  { id: 'statistik', label: 'Statistik', href: '/statistics', icon: 'nav_statistik' },
] as const;

const RIGHT_ITEMS = [
  { id: 'notifikasi', label: 'Notifikasi', href: '/notifikasi', icon: 'nav_notifikasi' },
  { id: 'akun',       label: 'Akun',       href: '/profile',    icon: 'nav_profil' },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const { unreadCount, refresh } = useNotifications();

  // Segarkan jumlah unread tiap kali pindah halaman (mis. setelah membuka /notifikasi
  // yang otomatis menandai semua dibaca), agar badge langsung ikut hilang.
  useEffect(() => { refresh(); }, [pathname, refresh]);

  const isItemActive = (href: string) =>
    pathname === href || (href !== '/dashboard' && pathname?.startsWith(href));

  const NavItem = ({ id, label, href, icon }: { id: string; label: string; href: string; icon: string }) => {
    const isActive = isItemActive(href);
    return (
      <Link
        key={id}
        href={href}
        className="flex flex-1 flex-col items-center justify-center gap-1 transition-all active:scale-95"
      >
        <div
          className={`relative flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${
            isActive ? 'bg-slate-800' : 'bg-transparent'
          }`}
        >
          <img
            src={`/images/icons/${icon}.svg`}
            alt={label}
            width={20}
            height={20}
            style={{ filter: isActive ? GOLD_FILTER : SLATE_FILTER }}
          />
          {/* Badge unread khusus notifikasi */}
          {id === 'notifikasi' && unreadCount > 0 && pathname !== '/notifikasi' && (
            <span className="absolute -top-1 -right-1 min-w-[15px] h-[15px] px-1 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-bold text-white leading-none">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
        <span
          className={`text-[9px] font-semibold leading-none transition-colors duration-200 ${
            isActive ? 'text-slate-800' : 'text-slate-400'
          }`}
        >
          {label}
        </span>
      </Link>
    );
  };

  // FAB tengah: "Mulai Tryout" → /daftar-tryout (dulu Roadmap).
  const tryoutActive = isItemActive('/daftar-tryout') || isItemActive('/packages');

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="relative flex h-[58px] bg-white border-t border-slate-200 pb-safe">

        {/* Kiri */}
        {LEFT_ITEMS.map((item) => <NavItem key={item.id} {...item} />)}

        {/* ── Tengah: Mulai Tryout FAB (melayang) + label sejajar item lain ── */}
        <Link
          href="/daftar-tryout"
          className="relative flex flex-1 flex-col items-center justify-center gap-1 active:scale-95 transition-transform"
        >
          {/* Spacer seukuran ikon item lain → label sejajar */}
          <div className="w-8 h-8" aria-hidden />
          {/* FAB di-absolute, melayang ke atas; tidak mengganggu posisi label.
              Icon daftar_tryout.svg sudah full-color (kotak navy-emas dengan gradient,
              sama seperti di menu grid) — dulu di-GOLD_FILTER (filter buat ikon garis
              monokrom) sehingga detailnya hilang jadi blok kuning polos. Sekarang
              ditampilkan apa adanya, tanpa filter. rounded-full (bukan rounded-2xl) —
              balik ke bentuk bulat/setengah-lingkaran seperti FAB Roadmap sebelumnya;
              sudut ikon aslinya yang transparan (rounded-square) otomatis kepotong rapi
              oleh clip lingkaran, jadi tetap penuh tanpa celah. */}
          <div
            className={`absolute left-1/2 -translate-x-1/2 -top-5 w-[54px] h-[54px] rounded-full ring-4 shadow-lg shadow-slate-900/25 overflow-hidden transition-all ${
              tryoutActive ? 'ring-amber-300' : 'ring-white'
            }`}
          >
            <img
              src="/images/icons/daftar_tryout.svg"
              alt="Mulai Tryout"
              width={54}
              height={54}
              className="w-full h-full object-cover"
            />
          </div>
          <span
            className={`text-[9px] font-bold leading-none ${
              tryoutActive ? 'text-slate-900' : 'text-slate-800'
            }`}
          >
            Tryout
          </span>
        </Link>

        {/* Kanan */}
        {RIGHT_ITEMS.map((item) => <NavItem key={item.id} {...item} />)}

      </div>
    </nav>
  );
}
