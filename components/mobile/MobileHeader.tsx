'use client';

// components/mobile/MobileHeader.tsx
// Sticky top app bar for mobile PWA — avatar + notification bell

import Link from 'next/link';
import Image from 'next/image';
import { Bell } from 'lucide-react';

interface MobileHeaderProps {
  userImageUrl?: string | null;
  userInitials?: string;
}

export function MobileHeader({ userImageUrl, userInitials = 'U' }: MobileHeaderProps) {
  return (
    <header className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-2.5 bg-md-surface-container-low">
      {/* Logo */}
      <Image
        src="/images/logo-navbar.svg"
        alt="PintuASN"
        width={100}
        height={28}
        priority
        className="h-7 w-auto"
      />

      {/* Right side: notifikasi + avatar */}
      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <button
          className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-md-primary shadow-md3-sm active-press"
          aria-label="Notifikasi"
        >
          <Bell size={16} strokeWidth={1.8} />
        </button>

        {/* Avatar */}
        <Link href="/profile" className="active-press">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-md-surface-container-high border-2 border-md-secondary-container flex items-center justify-center flex-shrink-0">
            {userImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={userImageUrl}
                alt="Foto profil"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs font-black text-md-primary" style={{ fontFamily: 'var(--font-jakarta)' }}>
                {userInitials}
              </span>
            )}
          </div>
        </Link>
      </div>
    </header>
  );
}
