'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Bell, ChevronDown, LogOut, User as UserIcon, Check, Map } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const NOTIFICATIONS = [
  { id: '1', title: 'Tryout Baru Tersedia', message: 'Paket tryout CPNS 2026 batch 2 sudah tersedia!', time: '5 menit lalu', isRead: false, link: '/dashboard' },
  { id: '2', title: 'Skor Tryout Anda', message: 'Selamat! Anda mendapat skor 450 pada tryout terakhir.', time: '2 jam lalu', isRead: false, link: '/statistics' },
  { id: '3', title: 'Materi Baru Ditambahkan', message: 'Materi TWK: Pancasila dan UUD 1945 telah ditambahkan.', time: '1 hari lalu', isRead: true, link: '/materi' },
];

function getTierLabel(tier: string) {
  if (tier === 'platinum') return 'Platinum Member';
  if (tier === 'premium') return 'Premium Member';
  return 'Member Gratis';
}

export function Navbar() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<string>('free');

  const firstName = user?.firstName || 'Pengguna';
  const userInitials = user?.firstName ? user.firstName.slice(0, 2).toUpperCase() : 'U';
  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then(({ profile }) => {
        if (profile?.subscription_tier) setSubscriptionTier(profile.subscription_tier);
      })
      .catch(() => {});
  }, []);

  const handleSignOut = async () => { await signOut(); router.push('/sign-in'); };
  const markAsRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  const markAllAsRead = () => setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center gap-4">

          {/* Logo */}
          <Link href="/dashboard" className="flex items-center group flex-shrink-0">
            <Image src="/images/logo-navbar.svg" alt="PintuASN" width={100} height={32}
              className="transition-transform duration-300 group-hover:scale-105" unoptimized priority />
          </Link>

          {/* Greeting — setelah logo */}
          <div className="hidden md:block">
            <p className="text-sm font-bold text-slate-800">Halo, {firstName}! 👋</p>
            <p className="text-xs text-slate-500">Semangat Belajar!</p>
          </div>

          {/* Spacer — dorong Roadmap & right actions ke kanan */}
          <div className="flex-1" />

          {/* Roadmap */}
          <Link href="/roadmap" className="flex-shrink-0">
            <button className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-md bg-slate-800 text-white hover:bg-slate-700 transition-all text-sm font-bold shadow-sm">
              <Map size={15} className="text-yellow-400" />
              Roadmap
            </button>
          </Link>

          {/* Right actions */}
          <div className="flex items-center gap-2">

            {/* Bell */}
            <DropdownMenu open={notificationOpen} onOpenChange={setNotificationOpen}>
              <DropdownMenuTrigger asChild>
                <button className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-all" aria-label="Notifications">
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-[16px] h-[16px] bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 mt-1 p-0">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                  <div>
                    <p className="font-bold text-slate-800 text-sm">Notifikasi</p>
                    {unreadCount > 0 && <p className="text-xs text-slate-500">{unreadCount} belum dibaca</p>}
                  </div>
                  {unreadCount > 0 && (
                    <button onClick={markAllAsRead} className="text-xs text-blue-600 hover:text-blue-700 font-medium">Tandai semua dibaca</button>
                  )}
                </div>
                <div className="max-h-[360px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10">
                      <Bell size={24} className="text-slate-300 mb-2" />
                      <p className="text-sm text-slate-500">Tidak ada notifikasi</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {notifications.map(notif => (
                        <Link key={notif.id} href={notif.link}
                          onClick={() => { markAsRead(notif.id); setNotificationOpen(false); }}
                          className={`block px-4 py-3 hover:bg-slate-50 transition-colors ${!notif.isRead ? 'bg-blue-50/40' : ''}`}
                        >
                          <div className="flex items-start gap-2.5">
                            <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${!notif.isRead ? 'bg-blue-500' : 'bg-transparent'}`} />
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm text-slate-800 ${!notif.isRead ? 'font-bold' : 'font-medium'}`}>{notif.title}</p>
                              <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notif.message}</p>
                              <p className="text-xs text-slate-400 mt-1">{notif.time}</p>
                            </div>
                            {!notif.isRead && (
                              <button onClick={e => { e.preventDefault(); e.stopPropagation(); markAsRead(notif.id); }}
                                className="p-1 rounded hover:bg-slate-200 text-slate-400 flex-shrink-0">
                                <Check size={12} />
                              </button>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 p-1 pr-2 rounded-lg hover:bg-slate-100 transition-all group">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-700 to-slate-800 text-white flex items-center justify-center font-bold text-xs shadow ring-2 ring-white">
                    {userInitials}
                  </div>
                  <div className="hidden lg:flex flex-col items-start">
                    <span className="text-xs font-bold text-slate-700 leading-tight">{firstName}</span>
                    <span className="text-[10px] text-slate-400">{getTierLabel(subscriptionTier)}</span>
                  </div>
                  <ChevronDown size={14} className="text-slate-400 hidden lg:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 mt-1">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm">{user?.fullName || firstName}</span>
                    <span className="text-xs font-normal text-slate-500">{user?.primaryEmailAddress?.emailAddress}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                    <UserIcon size={15} /> Profil Saya
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/roadmap" className="flex items-center gap-2 cursor-pointer">
                    <Map size={15} /> Roadmap
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}
                  className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
                  <LogOut size={15} /> Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

          </div>
        </div>
      </div>
    </header>
  );
}