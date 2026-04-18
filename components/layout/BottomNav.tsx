'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BarChart2, Map, User } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'home',     label: 'Home',      href: '/dashboard',   icon: Home },
  { id: 'statistik',label: 'Statistik', href: '/statistics',  icon: BarChart2 },
  { id: 'roadmap',  label: 'Roadmap',   href: '/roadmap',     icon: Map },
  { id: 'akun',     label: 'Akun',      href: '/profile',     icon: User },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="glass-nav fixed bottom-0 left-0 right-0 z-50 flex md:hidden">
      <div className="flex w-full pb-safe">
        {NAV_ITEMS.map(({ id, label, href, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/dashboard' && pathname?.startsWith(href));
          return (
            <Link
              key={id}
              href={href}
              className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 transition-all active:scale-95"
            >
              <div className={`relative flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-200
                ${isActive ? 'bg-pn-navy' : 'bg-transparent'}`}>
                <Icon
                  size={18}
                  className={`transition-colors duration-200 ${isActive ? 'text-pn-gold' : 'text-slate-500'}`}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
              </div>
              <span className={`text-[10px] font-semibold leading-none transition-colors duration-200
                ${isActive ? 'text-pn-navy' : 'text-slate-400'}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
