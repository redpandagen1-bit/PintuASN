'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { UserButton } from '@clerk/nextjs';

const navigation = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Riwayat', href: '/dashboard/history' },
  { name: 'Profil', href: '/dashboard/profile' },
];

interface MobileNavProps {
  className?: string;
}

export function MobileNav({ className }: MobileNavProps) {
  const pathname = usePathname();

  return (
    <div className={cn('flex flex-col space-y-4', className)}>
      {/* Logo */}
      <div className="flex items-center space-x-2 pb-4 border-b border-slate-200">
        <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center" aria-hidden="true">
          <span className="text-white font-bold text-sm">CPNS</span>
        </div>
        <span className="font-bold text-xl text-slate-900">SKD Tryout</span>
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-col space-y-2" aria-label="Navigasi seluler">
        {navigation.map((item) => (
          <Button
            key={item.name}
            variant={pathname === item.href ? 'default' : 'ghost'}
            asChild
            className="justify-start"
            aria-current={pathname === item.href ? 'page' : undefined}
          >
            <Link href={item.href}>
              {item.name}
            </Link>
          </Button>
        ))}
      </nav>

      {/* User Section */}
      <div className="pt-4 border-t border-slate-200 mt-auto">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600">Akun Saya</span>
          <UserButton
            appearance={{
              elements: {
                avatarBox: 'w-8 h-8',
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
