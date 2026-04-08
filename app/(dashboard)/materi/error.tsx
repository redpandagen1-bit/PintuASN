'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function MateriError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log ke console untuk debugging (bisa diganti Sentry/logging service)
    console.error('[MateriError]', error.message, error.digest);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-50 mb-4">
        <AlertTriangle className="text-red-500" size={28} />
      </div>

      <h2 className="text-lg font-bold text-slate-800 mb-1">
        Gagal Memuat Materi
      </h2>
      <p className="text-sm text-slate-500 max-w-sm mb-6">
        Terjadi kesalahan saat mengambil data materi. Ini biasanya sementara —
        coba refresh halaman.
      </p>

      {/* Hanya tampilkan detail error di development */}
      {process.env.NODE_ENV === 'development' && error.message && (
        <div className="w-full max-w-md mb-6 text-left bg-slate-100 rounded-xl px-4 py-3">
          <p className="text-xs font-mono text-slate-500 break-all">{error.message}</p>
          {error.digest && (
            <p className="text-xs text-slate-400 mt-1">digest: {error.digest}</p>
          )}
        </div>
      )}

      <div className="flex gap-3">
        <Button
          onClick={reset}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <RefreshCw size={15} />
          Coba Lagi
        </Button>
        <Button
          variant="outline"
          onClick={() => window.location.href = '/dashboard'}
        >
          Ke Dashboard
        </Button>
      </div>
    </div>
  );
}