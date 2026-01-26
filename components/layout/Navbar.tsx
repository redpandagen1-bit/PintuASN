'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Search, Bell, ChevronDown, LogOut, User as UserIcon, X, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Dummy notification data - Ganti dengan real data dari backend
const NOTIFICATIONS = [
  {
    id: '1',
    title: 'Tryout Baru Tersedia',
    message: 'Paket tryout CPNS 2026 batch 2 sudah tersedia!',
    time: '5 menit lalu',
    isRead: false,
    link: '/dashboard'
  },
  {
    id: '2',
    title: 'Skor Tryout Anda',
    message: 'Selamat! Anda mendapat skor 450 pada tryout terakhir.',
    time: '2 jam lalu',
    isRead: false,
    link: '/statistics'
  },
  {
    id: '3',
    title: 'Materi Baru Ditambahkan',
    message: 'Materi TWK: Pancasila dan UUD 1945 telah ditambahkan.',
    time: '1 hari lalu',
    isRead: true,
    link: '/materi'
  },
  {
    id: '4',
    title: 'Reminder Belajar',
    message: 'Jangan lupa belajar hari ini! Konsistensi adalah kunci.',
    time: '2 hari lalu',
    isRead: true,
    link: '/dashboard'
  },
];

export function Navbar() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const firstName = user?.firstName || 'Calon Abdi Negara';
  const userInitials = user?.firstName 
    ? user.firstName.slice(0, 2).toUpperCase()
    : 'CA';

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleSignOut = async () => {
    await signOut();
    router.push('/sign-in');
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      {/* Container wrapper for content - matches dashboard container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          
          {/* Left: Logo - DIPERBESAR */}
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 bg-blue-100 rounded-full blur-sm opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
                <Image
                  src="/images/Logo-navbar.svg"
                  alt="PintuASN Logo"
                  width={120}
                  height={120}
                  className="relative transition-transform duration-300 group-hover:scale-105"
                  unoptimized
                />
              </div>
            </Link>
          </div>

          {/* Center-Left: Greeting */}
          <div className="hidden md:block ml-8">
            <h2 className="text-lg font-bold text-slate-800">
              Halo, {firstName}! 👋
            </h2>
            <p className="text-xs text-slate-500">Semangat Belajar!</p>
          </div>

          {/* Center-Right: Search Bar (Desktop only) */}
          <div className="hidden lg:flex items-center flex-1 max-w-lg mx-8">
            <div className="relative w-full group">
              <Search 
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" 
                size={18} 
              />
              <input
                type="text"
                placeholder="Cari materi, soal, atau tryout..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-full border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-300 transition-all text-sm"
              />
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-4">
            {/* Notification Bell with Dropdown */}
            <DropdownMenu open={notificationOpen} onOpenChange={setNotificationOpen}>
              <DropdownMenuTrigger asChild>
                <button 
                  className="relative p-2.5 rounded-full hover:bg-slate-100 text-slate-600 hover:text-blue-600 transition-all group"
                  aria-label="Notifications"
                >
                  <Bell size={20} className="group-hover:animate-swing" />
                  {/* Notification badge */}
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-80 md:w-96 mt-2 p-0">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200">
                  <div>
                    <h3 className="font-bold text-slate-800">Notifikasi</h3>
                    {unreadCount > 0 && (
                      <p className="text-xs text-slate-500 mt-0.5">{unreadCount} notifikasi belum dibaca</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Tandai semua dibaca
                      </button>
                    )}
                  </div>
                </div>

                {/* Notification List */}
                <div className="max-h-[400px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4">
                      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                        <Bell size={28} className="text-slate-400" />
                      </div>
                      <p className="text-sm font-medium text-slate-700">Tidak ada notifikasi</p>
                      <p className="text-xs text-slate-500 mt-1">Notifikasi baru akan muncul di sini</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {notifications.map((notif) => (
                        <Link
                          key={notif.id}
                          href={notif.link}
                          onClick={() => {
                            markAsRead(notif.id);
                            setNotificationOpen(false);
                          }}
                          className={`block p-4 hover:bg-slate-50 transition-colors ${
                            !notif.isRead ? 'bg-blue-50/50' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                              !notif.isRead ? 'bg-blue-500' : 'bg-transparent'
                            }`} />
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-semibold text-slate-800 ${
                                !notif.isRead ? 'font-bold' : ''
                              }`}>
                                {notif.title}
                              </p>
                              <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">
                                {notif.message}
                              </p>
                              <p className="text-xs text-slate-400 mt-1">{notif.time}</p>
                            </div>
                            {!notif.isRead && (
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  markAsRead(notif.id);
                                }}
                                className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors flex-shrink-0"
                                aria-label="Mark as read"
                              >
                                <Check size={14} />
                              </button>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                  <div className="border-t border-slate-200 p-3 flex items-center justify-between">
                    <Link 
                      href="/notifications"
                      onClick={() => setNotificationOpen(false)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Lihat semua notifikasi
                    </Link>
                    <button
                      onClick={clearAll}
                      className="text-xs text-slate-500 hover:text-slate-700"
                    >
                      Hapus semua
                    </button>
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 p-1.5 pr-3 rounded-full hover:bg-slate-100 transition-all group">
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-blue-500/30 ring-2 ring-white">
                    {userInitials}
                  </div>
                  {/* Name (Desktop only) */}
                  <div className="hidden xl:flex flex-col items-start">
                    <span className="text-sm font-bold text-slate-700 leading-tight">
                      {firstName}
                    </span>
                    <span className="text-xs text-slate-500">
                      Premium Member
                    </span>
                  </div>
                  <ChevronDown size={16} className="text-slate-400 group-hover:text-slate-600 transition-colors hidden xl:block" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56 mt-2">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-semibold">{user?.fullName || firstName}</span>
                    <span className="text-xs font-normal text-slate-500">
                      {user?.primaryEmailAddress?.emailAddress}
                    </span>
                  </div>
                </DropdownMenuLabel>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile" className="flex items-center gap-2 cursor-pointer">
                    <UserIcon size={16} />
                    <span>Profil Saya</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  onClick={handleSignOut}
                  className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  <LogOut size={16} />
                  <span>Keluar</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}