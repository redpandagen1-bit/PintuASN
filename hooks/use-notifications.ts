'use client';

import { useState, useEffect, useCallback } from 'react';

export interface AppNotification {
  id:         string;
  type:       string;        // 'broadcast' | 'reminder' | 'system'
  title:      string;
  body:       string | null;
  link:       string | null;
  is_read:    boolean;
  created_at: string;
}

/** Format ISO date → "5 menit lalu", "2 jam lalu", "3 hari lalu", dst. */
export function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const sec  = Math.floor(diff / 1000);
  if (sec < 60)   return 'Baru saja';
  const min = Math.floor(sec / 60);
  if (min < 60)   return `${min} menit lalu`;
  const hr = Math.floor(min / 60);
  if (hr < 24)    return `${hr} jam lalu`;
  const day = Math.floor(hr / 24);
  if (day < 7)    return `${day} hari lalu`;
  const wk = Math.floor(day / 7);
  if (wk < 4)     return `${wk} minggu lalu`;
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function useNotifications(pollMs = 60_000) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [loading,       setLoading]       = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications');
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, pollMs);
    const onFocus  = () => refresh();
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [refresh, pollMs]);

  const markAsRead = useCallback(async (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, is_read: true } : n)));
    setUnreadCount(c => Math.max(0, c - 1));
    await fetch('/api/notifications/read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    }).catch(() => {});
  }, []);

  const markAllAsRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
    await fetch('/api/notifications/read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    }).catch(() => {});
  }, []);

  return { notifications, unreadCount, loading, refresh, markAsRead, markAllAsRead };
}
