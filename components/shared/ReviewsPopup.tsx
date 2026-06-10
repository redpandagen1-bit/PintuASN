'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Star, MessageSquare, Loader2 } from 'lucide-react';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user_display: string;
}

interface ReviewsPopupProps {
  packageId: string;
  packageTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

function StarDisplay({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
          className={s <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200 fill-slate-200'}
        />
      ))}
    </div>
  );
}

function relativeDate(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Hari ini';
  if (days === 1) return 'Kemarin';
  if (days < 30) return `${days} hari lalu`;
  const months = Math.floor(days / 30);
  return `${months} bulan lalu`;
}

export function ReviewsPopup({ packageId, packageTitle, isOpen, onClose }: ReviewsPopupProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [avgRating, setAvgRating] = useState(0);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/packages/${packageId}/reviews`);
      const json = await res.json();
      const list: Review[] = json.reviews ?? [];
      setReviews(list);
      if (list.length > 0) {
        setAvgRating(Math.round((list.reduce((s, r) => s + r.rating, 0) / list.length) * 10) / 10);
      }
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [packageId]);

  useEffect(() => {
    if (isOpen) fetchReviews();
  }, [isOpen, fetchReviews]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Ulasan Peserta</h3>
            <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[240px]">{packageTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors flex-shrink-0"
          >
            <X size={15} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-5 py-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 size={24} className="text-slate-400 animate-spin" />
              <p className="text-sm text-slate-400">Memuat ulasan...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                <MessageSquare size={24} className="text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-slate-700">Belum ada ulasan</p>
              <p className="text-xs text-slate-400">Jadilah yang pertama mengulas paket ini setelah kamu mengerjakannya.</p>
            </div>
          ) : (
            <>
              {/* Summary */}
              <div className="flex items-center gap-4 mb-5 p-4 bg-slate-50 rounded-2xl">
                <div className="text-center">
                  <p className="text-4xl font-extrabold text-slate-800 leading-none">{avgRating}</p>
                  <StarDisplay rating={Math.round(avgRating)} size={13} />
                  <p className="text-[11px] text-slate-500 mt-1">{reviews.length} ulasan</p>
                </div>
                <div className="flex-1 space-y-1.5">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = reviews.filter((r) => r.rating === star).length;
                    const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                    return (
                      <div key={star} className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-500 w-4 text-right flex-shrink-0">{star}</span>
                        <Star size={10} className="text-yellow-400 fill-yellow-400 flex-shrink-0" />
                        <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-yellow-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[11px] text-slate-400 w-4 flex-shrink-0">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reviews list */}
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {review.user_display[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-slate-800">{review.user_display}</span>
                        <span className="text-[11px] text-slate-400">{relativeDate(review.created_at)}</span>
                      </div>
                      <StarDisplay rating={review.rating} size={12} />
                      {review.comment && (
                        <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">{review.comment}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
