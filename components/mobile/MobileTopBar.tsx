'use client';

// components/mobile/MobileTopBar.tsx
// Navbar khusus dashboard PWA mobile:
//  - kiri  : tombol "Download Aplikasi" (gaya sama dengan landing page)
//  - kanan : foto + nama user (display only, tidak bisa diklik)

import Link from 'next/link';
import { useUser } from '@clerk/nextjs';

export function MobileTopBar() {
  const { user } = useUser();

  const displayName = user?.fullName || user?.firstName || 'Pengguna';
  const initials = user?.firstName ? user.firstName.slice(0, 2).toUpperCase() : 'U';

  return (
    <header className="md:hidden sticky top-0 z-40 -mt-2 flex items-center justify-between gap-3 bg-white border-b border-slate-100 px-4 py-2.5 shadow-sm">
      {/* Tombol Download Aplikasi — gaya sama dengan landing page */}
      <Link
        href="/install"
        aria-label="Download Aplikasi"
        className="inline-flex items-center gap-1.5 bg-slate-800 text-yellow-400 font-extrabold text-[12.5px] px-3 py-2 rounded-[10px] whitespace-nowrap shadow-[0_6px_16px_rgba(30,41,59,.22)] active:scale-[.97] transition-transform"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" />
        </svg>
        Download Aplikasi
      </Link>

      {/* Foto + nama user — display only (tidak bisa diklik) */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-sm font-bold text-slate-800 leading-tight truncate max-w-[120px]">
          {displayName}
        </span>
        {user?.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.imageUrl}
            alt={displayName}
            width={34}
            height={34}
            className="w-[34px] h-[34px] rounded-full object-cover ring-2 ring-white shadow flex-shrink-0"
          />
        ) : (
          <div className="w-[34px] h-[34px] rounded-full bg-gradient-to-tr from-slate-700 to-slate-800 text-white flex items-center justify-center font-bold text-xs shadow ring-2 ring-white flex-shrink-0">
            {initials}
          </div>
        )}
      </div>
    </header>
  );
}
