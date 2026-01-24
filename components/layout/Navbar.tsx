'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Search, Bell, ChevronDown, LogOut, User as UserIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Navbar() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const firstName = user?.firstName || 'Calon Abdi Negara';
  const userInitials = user?.firstName 
    ? user.firstName.slice(0, 2).toUpperCase()
    : 'CA';

  const handleSignOut = async () => {
    await signOut();
    router.push('/sign-in');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="flex h-20 items-center justify-between">
        
        {/* Left: Logo - Aligned with sidebar (left-6) */}
        <div className="flex items-center gap-3 pl-6 lg:pl-6">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 bg-blue-100 rounded-full blur-sm opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
              <Image
                src="/images/Logo-navbar.svg"
                alt="PintuASN Logo"
                width={80}
                height={80}
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
          <p className="text-xs text-slate-500">Mari belajar hari ini.</p>
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
        <div className="flex items-center gap-4 pr-6 lg:pr-8">
          {/* Notification Bell */}
          <button 
            className="relative p-2.5 rounded-full hover:bg-slate-100 text-slate-600 hover:text-blue-600 transition-all group"
            aria-label="Notifications"
          >
            <Bell size={20} className="group-hover:animate-swing" />
            {/* Notification badge */}
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
          </button>

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
    </header>
  );
}