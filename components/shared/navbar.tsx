'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { UserButton } from '@clerk/nextjs';
import { MobileNav } from './mobile-nav';

const navigation = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Riwayat', href: '/dashboard/history' },
  { name: 'Profil', href: '/dashboard/profile' },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo/Brand */}
        <Link href="/dashboard" className="flex items-center space-x-2" aria-label="SKD Tryout - Halaman Dashboard">
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center" aria-hidden="true">
            <span className="text-white font-bold text-sm">CPNS</span>
          </div>
          <span className="font-bold text-xl text-slate-900">SKD Tryout</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6" aria-label="Navigasi utama">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              aria-current={pathname === item.href ? 'page' : undefined}
              className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                pathname === item.href
                  ? 'text-blue-600'
                  : 'text-slate-600'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* User Menu */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Toggle menu navigasi"
                aria-expanded={false}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <MobileNav />
            </SheetContent>
          </Sheet>

          {/* User Button */}
          <UserButton
            appearance={{
              elements: {
                avatarBox: 'w-10 h-10',
              },
            }}
          />
        </div>
      </div>
    </header>
  );
}
