'use client';

// components/mobile/MobileHeader.tsx
// Sticky top app bar for mobile PWA — avatar + notification bell

import Link from 'next/link';
import Image from 'next/image';
import { AppIcon } from '@/components/shared/app-icon';

interface MobileHeaderProps {
  userImageUrl?: string | null;
  userInitials?: string;
  unreadCount?: number;
}

export function MobileHeader({
  userImageUrl,
  userInitials = 'U',
  unreadCount = 0,
}: MobileHeaderProps) {
  return (
    <header className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-2.5 bg-md-surface-container-low">
      {/* Logo */}
      <Image
        src="/images/logo-navbar-sky.svg"
        alt="PintuASN"
        width={100}
        height={28}
        priority
        className="h-7 w-auto"
      />

      {/* Right side: notifikasi + avatar */}
      <div className="flex items-center gap-2">

        {/* Notification bell — pakai AppIcon */}
        <button
          className="relative w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-md3-sm active-press"
          aria-label="Notifikasi"
        >
          <AppIcon name="notifikasi" size={24} />
          {unreadCount > 0 && (
            <span className="absolute top-0.5 right-0.5 min-w-[14px] h-[14px] bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-bold text-white leading-none">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Avatar */}
        <Link href="/profile" className="active-press">
          <div className="w-9 h-9 rounded-full overflow-hidden bg-md-surface-container-high border-2 border-md-secondary-container flex items-center justify-center flex-shrink-0">
            {userImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={userImageUrl}
                alt="Foto profil"
                className="w-full h-full object-cover"
              />
            ) : (
              <span
                className="text-xs font-black text-md-primary"
                style={{ fontFamily: 'var(--font-jakarta)' }}
              >
                {userInitials}
              </span>
            )}
          </div>
        </Link>
      </div>
    </header>
  );
}