import { Inter } from 'next/font/google'
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
  return (
    <div className={`${inter.className} min-h-screen bg-slate-50`}>
      {/* Navbar - Full Width Background, Content Contained */}
      <Navbar />

      {/* Main Container - Max-width wrapper for centered layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Flex Layout for Sidebar + Content */}
        <div className="flex gap-6 lg:gap-8">
          {/* Sidebar - Sticky positioning, desktop only */}
          <Sidebar />
          
          {/* Main Content Area - Fills remaining space */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}