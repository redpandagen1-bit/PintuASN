// components/mobile/MobilePageWrapper.tsx
// Server component — wraps mobile content + bottom spacer.
// Catatan: dulu memanggil currentUser() untuk menghitung inisial yang TIDAK
// pernah dipakai → setiap halaman mobile boros 1 round-trip ke Clerk. Dihapus.

interface MobilePageWrapperProps {
  children: React.ReactNode;
}

export function MobilePageWrapper({ children }: MobilePageWrapperProps) {
  return (
    <div className="md:hidden">
      {children}
      {/* Spacer bawah — BottomNav 58px + breathing room (FAB melayang ke atas, tak makan ruang konten) */}
      <div className="h-[72px]" />
    </div>
  );
}
