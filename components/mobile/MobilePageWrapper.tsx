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
      {/* Spacer bawah — BottomNav ~66px + 16px breathing room = 82px ≈ h-20 */}
      <div className="h-20" />
    </div>
  );
}
