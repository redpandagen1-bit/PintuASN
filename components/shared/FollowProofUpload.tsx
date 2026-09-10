'use client';

// ============================================================
// components/shared/FollowProofUpload.tsx
// Step upload bukti follow Instagram/TikTok @pintuasnofficial.
// Dipakai di ExamInstructionsModal (paket) dan FollowProofDialog (promo).
// ============================================================

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { Instagram, Upload, X, Loader2, ShieldCheck, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M16.6 5.82c-.86-.86-1.35-2.02-1.35-3.32h-2.84v13.64c0 1.4-1.14 2.54-2.54 2.54a2.54 2.54 0 0 1 0-5.08c.24 0 .47.03.69.1V10.7a5.4 5.4 0 0 0-.69-.05 5.38 5.38 0 1 0 5.38 5.38V9.02a8.17 8.17 0 0 0 4.75 1.52V7.7a5.36 5.36 0 0 1-3.4-1.88Z" />
    </svg>
  );
}

const IG_URL   = 'https://instagram.com/pintuasnofficial';
const TIKTOK_URL = 'https://www.tiktok.com/@pintuasnofficial';
const REVIEW_DELAY_MS = 3800;

interface Props {
  context: { packageId?: string; eventId?: string };
  onApproved: () => void;
  onCancel?: () => void;
}

export function FollowProofUpload({ context, onApproved, onCancel }: Props) {
  const [igFile, setIgFile]   = useState<File | null>(null);
  const [ttFile, setTtFile]   = useState<File | null>(null);
  const [igPreview, setIgPreview] = useState<string | null>(null);
  const [ttPreview, setTtPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const igInputRef = useRef<HTMLInputElement>(null);
  const ttInputRef = useRef<HTMLInputElement>(null);

  const pick = (slot: 'ig' | 'tt', file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('File harus berupa gambar.'); return; }
    setError(null);
    const url = URL.createObjectURL(file);
    if (slot === 'ig') { setIgFile(file); setIgPreview(url); }
    else               { setTtFile(file); setTtPreview(url); }
  };

  const handleSubmit = async () => {
    if (!igFile && !ttFile) {
      setError('Upload minimal 1 screenshot bukti follow.');
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      if (igFile) fd.append('files', igFile);
      if (ttFile) fd.append('files', ttFile);
      if (context.packageId) fd.append('packageId', context.packageId);
      if (context.eventId)   fd.append('eventId', context.eventId);

      const res  = await fetch('/api/follow-proof/upload', { method: 'POST', body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Gagal upload screenshot');

      setUploading(false);
      setReviewing(true);
      setTimeout(() => onApproved(), REVIEW_DELAY_MS);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal upload screenshot');
      setUploading(false);
    }
  };

  if (reviewing) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
        <div className="relative">
          <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center">
            <Loader2 size={26} className="text-emerald-600 animate-spin" />
          </div>
        </div>
        <div className="space-y-1">
          <p className="font-semibold text-slate-800">Screenshot sedang direview admin</p>
          <p className="text-sm text-slate-500">Mohon tunggu sebentar, ya...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-3">
        <p className="text-sm text-emerald-900 leading-relaxed">
          Follow akun instagram dan tiktok resmi pintuasn <span className="font-bold">@pintuasnofficial</span> lalu
          upload screenshot disini.
        </p>
        <div className="flex flex-wrap gap-2">
          <a
            href={IG_URL} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-gradient-to-r from-fuchsia-600 via-pink-600 to-orange-500 text-white hover:opacity-90 transition"
          >
            <Instagram size={14} /> Follow Instagram <ExternalLink size={11} className="opacity-80" />
          </a>
          <a
            href={TIKTOK_URL} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition"
          >
            <TikTokIcon className="w-3.5 h-3.5" /> Follow TikTok <ExternalLink size={11} className="opacity-80" />
          </a>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Instagram slot */}
        <button
          type="button"
          onClick={() => igInputRef.current?.click()}
          className="relative aspect-[3/4] rounded-xl border-2 border-dashed border-slate-300 hover:border-fuchsia-400 bg-slate-50 overflow-hidden flex flex-col items-center justify-center gap-1.5 transition-colors"
        >
          {igPreview ? (
            <>
              <Image src={igPreview} alt="Bukti Instagram" fill className="object-cover" unoptimized />
              <span
                role="button"
                onClick={e => { e.stopPropagation(); setIgFile(null); setIgPreview(null); }}
                className="absolute top-1.5 right-1.5 bg-black/60 text-white rounded-full p-1 hover:bg-black/80"
              >
                <X size={12} />
              </span>
            </>
          ) : (
            <>
              <Instagram size={20} className="text-fuchsia-500" />
              <span className="text-[11px] font-semibold text-slate-500 px-2 text-center">Screenshot Instagram</span>
              <Upload size={13} className="text-slate-400" />
            </>
          )}
        </button>
        <input ref={igInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
          onChange={e => pick('ig', e.target.files?.[0] ?? null)} />

        {/* TikTok slot */}
        <button
          type="button"
          onClick={() => ttInputRef.current?.click()}
          className="relative aspect-[3/4] rounded-xl border-2 border-dashed border-slate-300 hover:border-slate-500 bg-slate-50 overflow-hidden flex flex-col items-center justify-center gap-1.5 transition-colors"
        >
          {ttPreview ? (
            <>
              <Image src={ttPreview} alt="Bukti TikTok" fill className="object-cover" unoptimized />
              <span
                role="button"
                onClick={e => { e.stopPropagation(); setTtFile(null); setTtPreview(null); }}
                className="absolute top-1.5 right-1.5 bg-black/60 text-white rounded-full p-1 hover:bg-black/80"
              >
                <X size={12} />
              </span>
            </>
          ) : (
            <>
              <TikTokIcon className="w-5 h-5 text-slate-700" />
              <span className="text-[11px] font-semibold text-slate-500 px-2 text-center">Screenshot TikTok</span>
              <Upload size={13} className="text-slate-400" />
            </>
          )}
        </button>
        <input ref={ttInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
          onChange={e => pick('tt', e.target.files?.[0] ?? null)} />
      </div>

      <p className="text-[11px] text-slate-400 flex items-center gap-1">
        <ShieldCheck size={12} /> Upload minimal 1 screenshot — usahakan lampirkan keduanya ya.
      </p>

      {error && <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

      <div className="flex gap-2 pt-1">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={uploading} className="flex-1">
            Batal
          </Button>
        )}
        <Button type="button" onClick={() => void handleSubmit()} disabled={uploading || (!igFile && !ttFile)} className="flex-1">
          {uploading ? <><Loader2 size={14} className="mr-2 animate-spin" /> Mengupload...</> : 'Kirim Bukti'}
        </Button>
      </div>
    </div>
  );
}
