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
      {/* Sidebar (Desktop only) */}
      <Sidebar />

      {/* Navbar - Full Width */}
      <Navbar />

      {/* Main Content Area with sidebar offset */}
      <div className="lg:pl-72">
        {/* Page Content */}
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  )
}