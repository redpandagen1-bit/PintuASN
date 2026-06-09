// components/mobile/MobilePageWrapper.tsx
// Server component — wraps mobile content with sticky header
// Usage: wrap the mobile section of any dashboard page

import { currentUser } from '@clerk/nextjs/server';

interface MobilePageWrapperProps {
  children: React.ReactNode;
}

export async function MobilePageWrapper({ children }: MobilePageWrapperProps) {
  const user = await currentUser();

  const initials = user
    ? ((user.firstName?.[0] ?? '') + (user.lastName?.[0] ?? '')).toUpperCase() || 'U'
    : 'U';

  return (
    <div className="md:hidden">
      {children}
      {/* Spacer bawah — BottomNav 58px + breathing room (FAB melayang ke atas, tak makan ruang konten) */}
      <div className="h-[72px]" />
    </div>
  );
}
