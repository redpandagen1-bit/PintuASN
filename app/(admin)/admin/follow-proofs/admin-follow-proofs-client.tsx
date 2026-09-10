'use client';

// ============================================================
// app/(admin)/admin/follow-proofs/admin-follow-proofs-client.tsx
// ============================================================

import React, { useState } from 'react';
import Image from 'next/image';
import { Eye, Loader2, X, ImageOff, Package, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import type { FollowProofSubmission } from '@/types/follow-proof';

type Row = FollowProofSubmission & {
  packages: { title: string } | null;
  events: { title: string } | null;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

interface Props { initialSubmissions: Row[] }

export default function AdminFollowProofsClient({ initialSubmissions }: Props) {
  const [submissions, setSubmissions] = useState<Row[]>(initialSubmissions);
  const [viewing, setViewing]   = useState<Row | null>(null);
  const [urls, setUrls]         = useState<string[]>([]);
  const [loadingView, setLoadingView] = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const openView = async (row: Row) => {
    setViewing(row);
    setUrls([]);
    setError(null);
    setLoadingView(true);
    try {
      const res  = await fetch(`/api/admin/follow-proofs/${row.id}/view`, { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Gagal memuat gambar');
      setUrls(json.urls ?? []);
      setSubmissions(prev => prev.map(s => s.id === row.id ? { ...s, viewed_at: s.viewed_at ?? new Date().toISOString() } : s));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memuat gambar');
    } finally {
      setLoadingView(false);
    }
  };

  const closeView = async () => {
    const row = viewing;
    setViewing(null);
    setUrls([]);
    if (!row || row.file_deleted_at) return;
    // Sudah dilihat → hapus filenya dari storage supaya tidak membebani kuota.
    try {
      await fetch(`/api/admin/follow-proofs/${row.id}`, { method: 'DELETE' });
      setSubmissions(prev => prev.map(s => s.id === row.id ? { ...s, file_deleted_at: new Date().toISOString(), storage_paths: [] } : s));
    } catch { /* cron backstop akan bersihkan nanti */ }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Bukti Follow Sosmed</h1>
        <p className="text-slate-500 text-sm mt-1">
          Screenshot otomatis diterima saat diupload user. File dihapus dari storage begitu kamu selesai melihatnya
          (atau otomatis setelah 3 hari kalau belum sempat dibuka) — supaya kuota storage tidak penuh.
        </p>
      </div>

      <div className="space-y-3">
        {submissions.length === 0 && (
          <p className="text-center text-slate-400 py-12">Belum ada submission bukti follow.</p>
        )}

        {submissions.map(row => {
          const contextLabel = row.packages?.title
            ? row.packages.title
            : row.events?.title
            ? row.events.title
            : '—';
          const contextIcon = row.package_id ? <Package size={12} /> : <Tag size={12} />;
          const isGone = !!row.file_deleted_at;

          return (
            <Card key={row.id} className="overflow-hidden">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-mono text-xs text-slate-500">{row.user_id}</p>
                    <Badge variant={row.viewed_at ? 'secondary' : 'default'}>
                      {row.viewed_at ? 'Sudah dilihat' : 'Belum dilihat'}
                    </Badge>
                    {isGone && <Badge variant="outline">File terhapus</Badge>}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 flex-wrap">
                    <span className="flex items-center gap-1">{contextIcon} {contextLabel}</span>
                    <span>{formatDate(row.created_at)}</span>
                  </div>
                </div>
                <Button size="sm" variant="outline" disabled={isGone} onClick={() => void openView(row)} className="flex items-center gap-1.5">
                  <Eye size={14} /> Lihat
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!viewing} onOpenChange={v => { if (!v) void closeView(); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Screenshot Bukti Follow</DialogTitle>
            <DialogDescription>File akan otomatis dihapus dari storage setelah kamu menutup jendela ini.</DialogDescription>
          </DialogHeader>

          {loadingView && (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-slate-400" />
            </div>
          )}

          {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

          {!loadingView && !error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {urls.length === 0 ? (
                <div className="col-span-2 flex flex-col items-center justify-center py-10 text-slate-400">
                  <ImageOff size={24} />
                  <p className="text-sm mt-2">Tidak ada gambar</p>
                </div>
              ) : urls.map((url, i) => (
                <div key={i} className="relative aspect-[3/4] rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                  <Image src={url} alt={`Bukti ${i + 1}`} fill className="object-contain" unoptimized />
                </div>
              ))}
            </div>
          )}

          <Button variant="outline" onClick={() => void closeView()} className="flex items-center gap-2 mt-2">
            <X size={14} /> Tutup &amp; Hapus File
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
