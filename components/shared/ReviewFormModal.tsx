'use client';

import { useState } from 'react';
import { Star, X, Loader2, CheckCircle2 } from 'lucide-react';

interface ReviewFormModalProps {
  packageId: string;
  packageTitle: string;
  attemptId: string;
  isOpen: boolean;
  onClose: () => void;
}

const RATING_LABELS: Record<number, string> = {
  1: 'Kurang',
  2: 'Cukup',
  3: 'Baik',
  4: 'Bagus',
  5: 'Sangat Bagus',
};

export function ReviewFormModal({ packageId, packageTitle, attemptId, isOpen, onClose }: ReviewFormModalProps) {
  const [rating, setRating]     = useState(0);
  const [hovered, setHovered]   = useState(0);
  const [comment, setComment]   = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async () => {
    if (rating === 0) { setError('Pilih rating terlebih dahulu.'); return; }
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch(`/api/packages/${packageId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment, attempt_id: attemptId }),
      });
      if (!res.ok) {
        const j = await res.json();
        setError(j.error ?? 'Gagal mengirim ulasan.');
        return;
      }
      setSubmitted(true);
    } catch {
      setError('Terjadi kesalahan, coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const displayRating = hovered || rating;

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={submitted ? onClose : undefined} />
      <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh] pb-[env(safe-area-inset-bottom)]">
        {submitted ? (
          <div className="flex flex-col items-center justify-center py-10 px-6 text-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 size={32} className="text-emerald-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">Terima kasih!</h3>
              <p className="text-sm text-slate-500">Ulasanmu sudah kami terima dan akan membantu peserta lain.</p>
            </div>
            <button
              onClick={onClose}
              className="px-8 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-700 transition-colors"
            >
              Tutup
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-800">Bagaimana pengalamanmu?</h3>
                <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[240px]">{packageTitle}</p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            {/* Body */}
            <div className="px-5 py-5 space-y-4">
              {/* Star picker */}
              <div className="flex flex-col items-center gap-2.5">
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      onMouseEnter={() => setHovered(s)}
                      onMouseLeave={() => setHovered(0)}
                      onClick={() => setRating(s)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        size={30}
                        className={s <= displayRating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-slate-200 fill-slate-200'}
                      />
                    </button>
                  ))}
                </div>
                {displayRating > 0 && (
                  <span className="text-sm font-semibold text-slate-600">{RATING_LABELS[displayRating]}</span>
                )}
              </div>

              {/* Comment */}
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
                  Ceritakan pengalamanmu <span className="text-slate-400 font-normal">(opsional)</span>
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  maxLength={300}
                  rows={3}
                  placeholder="Bagaimana soal-soalnya? Apakah sesuai standar SKD?"
                  className="w-full text-sm text-slate-700 placeholder:text-slate-400 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-200 resize-none"
                />
                <p className="text-right text-[11px] text-slate-400 mt-1">{comment.length}/300</p>
              </div>

              {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Lewati
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || rating === 0}
                  className="flex-1 py-2.5 text-sm font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 size={14} className="animate-spin" /> : null}
                  Kirim Ulasan
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
