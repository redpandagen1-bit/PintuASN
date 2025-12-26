'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation'; // ✅ Import useParams
import { ErrorState } from '@/components/shared/error-state';
import { ExamNotFound, AttemptNotFound } from '@/components/shared/not-found-state';

interface ExamErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
  // ❌ HAPUS params dari props
}

export default function ExamError({ error, reset }: ExamErrorProps) {
  const params = useParams(); // ✅ Gunakan useParams hook
  const attemptId = params?.attemptId as string;

  useEffect(() => {
    console.error('Exam Error:', error, 'Attempt ID:', attemptId);
  }, [error, attemptId]); // ✅ Ganti params.attemptId dengan attemptId

  const getErrorInfo = () => {
    const message = error.message.toLowerCase();

    // Not found errors
    if (message.includes('not found') || message.includes('tidak ditemukan')) {
      return {
        component: <ExamNotFound onBack={() => window.location.href = '/packages'} />,
        shouldRender: true
      };
    }

    // Unauthorized errors
    if (message.includes('unauthorized') || message.includes('akses ditolak')) {
      return {
        component: (
          <ErrorState
            title="Akses Ditolak"
            message="Anda tidak memiliki izin untuk mengakses ujian ini."
            action={{
              label: "Kembali ke Paket",
              onClick: () => window.location.href = '/packages',
              variant: 'default' as const
            }}
          />
        ),
        shouldRender: true
      };
    }

    // Attempt not found
    if (message.includes('attempt') && message.includes('not found')) {
      return {
        component: <AttemptNotFound onBack={() => window.location.href = '/history'} />,
        shouldRender: true
      };
    }

    // Network errors
    if (message.includes('network') || message.includes('fetch')) {
      return {
        component: (
          <ErrorState
            title="Masalah Koneksi"
            message="Tidak dapat terhubung ke server. Periksa koneksi internet Anda."
            showRetry={true}
            onRetry={reset}
          />
        ),
        shouldRender: true
      };
    }

    // Generic error
    return {
      component: (
        <ErrorState
          title="Terjadi Kesalahan"
          message="Maaf, terjadi kesalahan saat memuat ujian. Silakan coba lagi."
          showRetry={true}
          onRetry={reset}
          action={{
            label: "Kembali ke Paket",
            onClick: () => window.location.href = '/packages',
            variant: 'outline' as const
          }}
        />
      ),
      shouldRender: true
    };
  };

  const { component } = getErrorInfo();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-lg p-6">
        {component}
      </div>
    </div>
  );
}