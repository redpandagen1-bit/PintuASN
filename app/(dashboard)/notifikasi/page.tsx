'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, Megaphone, Target, Info, ChevronLeft, CheckCheck } from 'lucide-react';
import { useNotifications, formatRelativeTime, type AppNotification } from '@/hooks/use-notifications';

function typeIcon(type: string) {
  switch (type) {
    case 'broadcast': return { Icon: Megaphone, color: 'text-[#F5A623]', bg: 'bg-[#F5A623]/12' };
    case 'reminder':  return { Icon: Target,    color: 'text-emerald-600', bg: 'bg-emerald-50' };
    default:          return { Icon: Info,      color: 'text-[#1B2B5E]', bg: 'bg-[#1B2B5E]/8' };
  }
}

export default function NotifikasiPage() {
  const router = useRouter();
  const { notifications, loading, markAsRead, markAllAsRead } = useNotifications();
  const [initialUnread, setInitialUnread] = useState<Set<string> | null>(null);

  // Tangkap snapshot unread saat pertama load, lalu tandai semua dibaca
  useEffect(() => {
    if (!loading && initialUnread === null) {
      setInitialUnread(new Set(notifications.filter(n => !n.is_read).map(n => n.id)));
      markAllAsRead();
    }
  }, [loading, notifications, initialUnread, markAllAsRead]);

  const wasUnread = (n: AppNotification) => initialUnread?.has(n.id) ?? false;

  const handleClick = (n: AppNotification) => {
    markAsRead(n.id);
    if (n.link) router.push(n.link);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#1B2B5E] px-4 py-3.5 flex items-center gap-3 shadow-sm">
        <Link href="/dashboard" className="p-1 -ml-1 rounded-lg hover:bg-white/10 transition-colors">
          <ChevronLeft className="w-5 h-5 text-white" />
        </Link>
        <div className="flex-1">
          <h1 className="text-base font-extrabold text-white leading-tight" style={{ fontFamily: 'var(--font-jakarta)' }}>
            Notifikasi
          </h1>
          <p className="text-[11px] text-white/55">Info & pengingat untukmu</p>
        </div>
        <Bell className="w-5 h-5 text-[#F5A623]" />
      </div>

      {/* List */}
      <div className="px-3 py-3">
        {loading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-white rounded-2xl animate-pulse border border-slate-100" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
              <Bell className="w-7 h-7 text-slate-300" />
            </div>
            <p className="text-sm font-bold text-slate-600">Belum ada notifikasi</p>
            <p className="text-xs text-slate-400 mt-1 max-w-[220px]">
              Info penting & pengingat belajar akan muncul di sini.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => {
              const { Icon, color, bg } = typeIcon(n.type);
              const unread = wasUnread(n);
              return (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={`w-full text-left flex items-start gap-3 px-3.5 py-3 rounded-2xl border transition-all active:scale-[0.99] ${
                    unread ? 'bg-white border-[#1B2B5E]/15 shadow-sm' : 'bg-white border-slate-100'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                      <p className={`text-sm leading-snug flex-1 ${unread ? 'font-extrabold text-slate-800' : 'font-semibold text-slate-700'}`}>
                        {n.title}
                      </p>
                      {unread && <span className="w-2 h-2 rounded-full bg-[#F5A623] mt-1.5 flex-shrink-0" />}
                    </div>
                    {n.body && (
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.body}</p>
                    )}
                    <p className="text-[11px] text-slate-400 mt-1">{formatRelativeTime(n.created_at)}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {notifications.length > 0 && (
          <button
            onClick={markAllAsRead}
            className="mt-4 mx-auto flex items-center gap-1.5 text-xs font-semibold text-[#1B2B5E] hover:text-[#1B2B5E]/70 transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            Tandai semua dibaca
          </button>
        )}
      </div>
    </div>
  );
}
