'use client';

import { useEffect } from 'react';
import { ErrorState } from '@/components/shared/error-state';

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    // Log error to external service (optional)
    console.error('Dashboard Error:', error);
    
    // You could send this to an error reporting service like Sentry
    // reportError(error);
  }, [error]);

  // Determine error type and show appropriate message
  const getErrorInfo = () => {
    const errorMessage = error.message.toLowerCase();
    
    if (errorMessage.includes('unauthorized') || errorMessage.includes('forbidden')) {
      return {
        title: "Akses Ditolak",
        message: "Anda tidak memiliki izin untuk mengakses halaman ini. Silakan login kembali.",
        showRetry: false,
        action: {
          label: "Kembali ke Login",
          onClick: () => window.location.href = '/',
          variant: "default" as const
        }
      };
    }
    
    if (errorMessage.includes('not found') || errorMessage.includes('404')) {
      return {
        title: "Halaman Tidak Ditemukan",
        message: "Halaman yang Anda cari tidak tersedia atau telah dipindahkan.",
        showRetry: false,
        action: {
          label: "Kembali ke Dashboard",
          onClick: () => window.location.href = '/dashboard',
          variant: "outline" as const
        }
      };
    }
    
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      return {
        title: "Koneksi Gagal",
        message: "Tidak dapat terhubung ke server. Periksa koneksi internet Anda dan coba lagi.",
        showRetry: true,
        icon: "triangle" as const
      };
    }
    
    // Default error
    return {
      title: "Terjadi Kesalahan",
      message: "Terjadi kesalahan yang tidak terduga di dashboard. Tim teknisi kami telah diberitahu.",
      showRetry: true
    };
  };

  const errorInfo = getErrorInfo();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-lg p-6">
        <ErrorState
          title={errorInfo.title}
          message={errorInfo.message}
          showRetry={errorInfo.showRetry}
          onRetry={reset}
          action={errorInfo.action}
          icon={errorInfo.icon as 'circle' | 'triangle'}
        />
        
        {/* Development info - only in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm font-medium text-red-800 mb-2">Debug Info:</p>
            <p className="text-xs text-red-600 font-mono break-all">
              Error: {error.message}
            </p>
            {error.stack && (
              <details className="mt-2">
                <summary className="text-xs text-red-600 cursor-pointer">View Stack</summary>
                <pre className="text-xs text-red-600 mt-2 whitespace-pre-wrap break-all">
                  {error.stack}
                </pre>
              </details>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
