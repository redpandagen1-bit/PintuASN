'use client';

// ============================================================
// components/shared/FollowProofUpload.tsx
// Step upload bukti follow Instagram/TikTok @pintuasnofficial.
// Dipakai di ExamInstructionsModal (paket) dan FollowProofDialog (promo).
// ============================================================

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { Instagram, Upload, X, Loader2, ShieldCheck, ExternalLink, CheckCircle2 } from 'lucide-react';
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
const REVIEW_DELAY_MS = 8000;
const SUCCESS_DELAY_MS = 1800;

interface Props {
  context: { packageId?: string; eventId?: string };
  onApproved: () => void;
  onCancel?: () => void;
}

export function FollowProofUpload({ context, onApproved, onCancel }: Props) {
  const [file, setFile]       = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [success, setSuccess]     = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const pick = (picked: File | null) => {
    if (!picked) return;
    if (!picked.type.startsWith('image/')) { setError('File harus berupa gambar.'); return; }
    setError(null);
    setFile(picked);
    setPreview(URL.createObjectURL(picked));
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Upload screenshot bukti follow dulu.');
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('files', file);
      if (context.packageId) fd.append('packageId', context.packageId);
      if (context.eventId)   fd.append('eventId', context.eventId);

      const res  = await fetch('/api/follow-proof/upload', { method: 'POST', body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Gagal upload screenshot');

      setUploading(false);
      setReviewing(true);
      setTimeout(() => {
        setReviewing(false);
        setSuccess(true);
        setTimeout(() => onApproved(), SUCCESS_DELAY_MS);
      }, REVIEW_DELAY_MS);
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

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
        <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircle2 size={30} className="text-emerald-600" />
        </div>
        <div className="space-y-1">
          <p className="font-semibold text-slate-800">Berhasil!</p>
          <p className="text-sm text-slate-500">Terima kasih sudah follow @pintuasnofficial 🎉</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-[1.1fr_1fr] gap-4 sm:gap-6 sm:items-center">
        {/* Kiri: instruksi + tombol follow */}
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-3 flex flex-col justify-center h-full">
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
          <p className="text-[11px] text-slate-500 flex items-start gap-1.5">
            <ShieldCheck size={13} className="shrink-0 mt-0.5" />
            upload screenshot profil @pintuasnofficial yang telah di follow
          </p>
        </div>

        {/* Kanan: upload box */}
        <div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative aspect-[4/3] w-full rounded-xl border-2 border-dashed border-slate-300 hover:border-emerald-400 bg-slate-50 overflow-hidden flex flex-col items-center justify-center gap-1.5 transition-colors"
          >
            {preview ? (
              <>
                <Image src={preview} alt="Bukti follow" fill className="object-contain" unoptimized />
                <span
                  role="button"
                  onClick={e => { e.stopPropagation(); setFile(null); setPreview(null); }}
                  className="absolute top-1.5 right-1.5 bg-black/60 text-white rounded-full p-1 hover:bg-black/80"
                >
                  <X size={12} />
                </span>
              </>
            ) : (
              <>
                <Upload size={20} className="text-slate-400" />
                <span className="text-xs font-semibold text-slate-500 px-2 text-center">Klik untuk upload screenshot</span>
              </>
            )}
          </button>
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
            onChange={e => pick(e.target.files?.[0] ?? null)} />
        </div>
      </div>

      {error && <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

      <div className="flex gap-2 pt-1">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={uploading} className="flex-1">
            Batal
          </Button>
        )}
        <Button type="button" onClick={() => void handleSubmit()} disabled={uploading || !file} className="flex-1">
          {uploading ? <><Loader2 size={14} className="mr-2 animate-spin" /> Mengupload...</> : 'Kirim Bukti'}
        </Button>
      </div>
    </div>
  );
}
