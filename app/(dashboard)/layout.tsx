'use client';

import { Inter } from 'next/font/google'
import { usePathname } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  // Hide layout only on the active exam page, not result/review
  const isExamPage = pathname
    ? /^\/exam\/[^/]+$/.test(pathname)
    : false

  if (isExamPage) {
    return (
      <div className={`${inter.className} min-h-screen bg-slate-50`}>
        {children}
      </div>
    )
  }

  return (
    <div className={`${inter.className} min-h-screen bg-slate-50`}>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="flex gap-6 lg:gap-8">
          <Sidebar />
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}