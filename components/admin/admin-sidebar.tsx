'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  FileQuestion, 
  Package, 
  BookOpen,
  Settings, 
  BarChart3, 
  ArrowLeft, 
  Zap,
  ZapOff,
  RibbonIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ZAxis } from 'recharts';

const menuItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/questions', label: 'Soal', icon: FileQuestion },
  { href: '/admin/packages', label: 'Paket Tryout', icon: Package },
  { href: '/admin/materials', label: 'Materi', icon: BookOpen },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/user-info', label: 'User info', icon: Settings },
  { href: '/admin/events', label: 'Events', icon: Zap },
  { href: '/admin/blog', label: 'Blog', icon: ZapOff },
  { href: '/admin/masukan', label: 'Masukan', icon: RibbonIcon }
];

// ✅ PINDAHKAN SidebarContent KELUAR dari component utama
function SidebarContent({ pathname }: { pathname: string }) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold text-slate-800">Admin Panel</h2>
        <p className="text-sm text-slate-500 mt-1">SKD CPNS Platform</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <Link href="/dashboard">
          <Button variant="outline" className="w-full justify-start gap-2">
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Mobile Sidebar */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <LayoutDashboard className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <SidebarContent pathname={pathname} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}