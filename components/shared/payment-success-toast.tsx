'use client';

// components/shared/payment-success-toast.tsx
// Tampilkan notifikasi sukses pembayaran jika URL mengandung ?payment=success
// Letakkan di dalam DashboardPage (client wrapper)

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { CheckCircle2, X } from 'lucide-react';

export default function PaymentSuccessToast() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const pathname     = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (searchParams.get('payment') === 'success') {
      setVisible(true);

      // Hapus query param dari URL tanpa reload halaman
      router.replace(pathname, { scroll: false });

      // Auto-dismiss setelah 5 detik
      const t = setTimeout(() => setVisible(false), 5000);
      return () => clearTimeout(t);
    }
  }, [searchParams, router, pathname]);

  if (!visible) return null;

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="flex items-start gap-3 bg-white border border-emerald-200 shadow-xl rounded-2xl px-4 py-4">
        {/* Icon */}
        <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
          <CheckCircle2 size={20} className="text-emerald-600" />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-800">Pembayaran Berhasil! 🎉</p>
          <p className="text-xs text-slate-500 mt-0.5">
            Paket kamu sudah aktif. Selamat belajar!
          </p>
        </div>

        {/* Close button */}
        <button
          onClick={() => setVisible(false)}
          className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full hover:bg-slate-100 transition"
        >
          <X size={14} className="text-slate-400" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="mt-1.5 mx-1 h-1 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-emerald-400 rounded-full animate-[shrink_5s_linear_forwards]" />
      </div>
    </div>
  );
}