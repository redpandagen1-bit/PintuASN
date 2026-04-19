'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isExamPage = /^\/exam\/[^/]+$/.test(pathname ?? '');
  const isReviewPage = /^\/exam\/[^/]+\/review/.test(pathname ?? '');

  if (isExamPage) {
    return (
      <div className="min-h-screen bg-slate-50">
        {children}
      </div>
    );
  }

  if (isReviewPage) {
    return (
      <div className="min-h-screen bg-slate-50">
        <main className="w-full">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="bg-[#f8f9ff] min-h-screen">
      {/* Desktop navbar — fixed, hidden on mobile */}
      <div className="hidden md:block">
        <Navbar />
      </div>
      {/* pt-14 = 56px = tinggi navbar (h-14) supaya konten tidak tertutup fixed navbar */}
      <div className="md:pt-14 max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex gap-6 lg:gap-8 items-start min-h-[calc(100vh-3.5rem)]">
          <Sidebar />
          {/* Bottom padding: mobile handled by MobilePageWrapper h-20, desktop explicit */}
          <main className="flex-1 min-w-0 pt-2 md:pb-8">
            {children}
          </main>
        </div>
      </div>
      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  );
}