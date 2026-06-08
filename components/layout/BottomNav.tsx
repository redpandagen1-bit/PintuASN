'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { id: 'home',      label: 'Home',      href: '/dashboard',  icon: 'nav_home' },
  { id: 'statistik', label: 'Statistik', href: '/statistics', icon: 'nav_statistik' },
  { id: 'roadmap',   label: 'Roadmap',   href: '/roadmap',    icon: 'nav_roadmap' },
  { id: 'akun',      label: 'Akun',      href: '/profile',    icon: 'nav_profil' },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden bg-white border-t border-slate-200">
      <div className="flex w-full pb-safe">
        {NAV_ITEMS.map(({ id, label, href, icon }) => {
          const isActive =
            pathname === href ||
            (href !== '/dashboard' && pathname?.startsWith(href));

          return (
            <Link
              key={id}
              href={href}
              className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 transition-all active:scale-95"
            >
              <div
                className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 ${
                  isActive ? 'bg-slate-800' : 'bg-transparent'
                }`}
              >
                {/* 
                  Nav SVG pakai currentColor — inject via CSS filter trick
                  active: kuning, inactive: slate-400
                */}
                <img
                  src={`/images/icons/${icon}.svg`}
                  alt={label}
                  width={22}
                  height={22}
                  style={{
                    filter: isActive
                      ? 'brightness(0) saturate(100%) invert(79%) sepia(61%) saturate(500%) hue-rotate(1deg) brightness(103%)'  /* → #f9bd22 gold */
                      : 'brightness(0) saturate(100%) invert(63%) sepia(8%) saturate(487%) hue-rotate(182deg) brightness(95%)', /* → slate-400 */
                  }}
                />
              </div>
              <span
                className={`text-[10px] font-semibold leading-none transition-colors duration-200 ${
                  isActive ? 'text-slate-800' : 'text-slate-400'
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}