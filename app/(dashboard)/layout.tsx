'use client';

import { Inter } from 'next/font/google';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

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
      <div className={`${inter.className} min-h-screen bg-slate-50`}>
        {children}
      </div>
    );
  }

  if (isReviewPage) {
    return (
      <div className={`${inter.className} min-h-screen bg-slate-50`}>
        <main className="w-full">{children}</main>
      </div>
    );
  }

  return (
    <div className={`${inter.className} bg-slate-50 min-h-screen`}>
      <Navbar />
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex gap-6 lg:gap-8 items-start min-h-[calc(100vh-3.5rem)]">
          <Sidebar />
          <main className="flex-1 min-w-0 pt-2 pb-6 lg:pb-8">{children}</main>
        </div>
      </div>
    </div>
  );
}