'use client';

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
  const { unreadCount } = useNotifications();

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
          {id === 'notifikasi' && unreadCount > 0 && (
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

  const roadmapActive = isItemActive('/roadmap');

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="relative flex h-[58px] bg-white border-t border-slate-200 pb-safe">

        {/* Kiri */}
        {LEFT_ITEMS.map((item) => <NavItem key={item.id} {...item} />)}

        {/* ── Tengah: Roadmap FAB (melayang) + label sejajar item lain ── */}
        <Link
          href="/roadmap"
          className="relative flex flex-1 flex-col items-center justify-center gap-1 active:scale-95 transition-transform"
        >
          {/* Spacer seukuran ikon item lain → label "Roadmap" sejajar */}
          <div className="w-8 h-8" aria-hidden />
          {/* FAB di-absolute, melayang ke atas; tidak mengganggu posisi label */}
          <div
            className={`absolute left-1/2 -translate-x-1/2 -top-5 w-[50px] h-[50px] rounded-full ring-4 ring-white shadow-lg shadow-slate-900/25 flex items-center justify-center ${
              roadmapActive ? 'bg-slate-900' : 'bg-slate-800'
            }`}
          >
            <img
              src="/images/icons/nav_roadmap.svg"
              alt="Roadmap"
              width={24}
              height={24}
              style={{ filter: GOLD_FILTER }}
            />
          </div>
          <span
            className={`text-[9px] font-bold leading-none ${
              roadmapActive ? 'text-slate-900' : 'text-slate-800'
            }`}
          >
            Roadmap
          </span>
        </Link>

        {/* Kanan */}
        {RIGHT_ITEMS.map((item) => <NavItem key={item.id} {...item} />)}

      </div>
    </nav>
  );
}
