'use client';

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  };
  showRetry?: boolean;
  onRetry?: () => void;
  className?: string;
  icon?: 'circle' | 'triangle';
}

export function ErrorState({ 
  title = "Terjadi Kesalahan", 
  message = "Terjadi kesalahan yang tidak terduga. Silakan coba lagi nanti.",
  action,
  showRetry = false,
  onRetry,
  className = "",
  icon = 'circle'
}: ErrorStateProps) {
  const ErrorIcon = icon === 'triangle' ? AlertTriangle : AlertCircle;

  return (
    <div className={`w-full max-w-md mx-auto p-6 ${className}`}>
      <Alert variant="destructive" className="flex flex-col items-start">
        <div className="flex items-center gap-2 mb-3">
          <ErrorIcon className="h-5 w-5" />
          <AlertTitle className="text-lg">{title}</AlertTitle>
        </div>
        <AlertDescription className="text-base leading-relaxed mb-4">
          {message}
        </AlertDescription>
        
        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          {showRetry && onRetry && (
            <Button 
              onClick={onRetry}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Coba Lagi
            </Button>
          )}
          
          {action && (
            <Button 
              onClick={action.onClick}
              variant={action.variant || 'default'}
              className="w-full sm:w-auto"
            >
              {action.label}
            </Button>
          )}
        </div>
      </Alert>
    </div>
  );
}

// Specific Error State Components
export function NetworkError({ onRetry, className }: { onRetry?: () => void; className?: string }) {
  return (
    <ErrorState
      title="Koneksi Gagal"
      message="Tidak dapat terhubung ke server. Periksa koneksi internet Anda dan coba lagi."
      showRetry={!!onRetry}
      onRetry={onRetry}
      className={className}
      icon="triangle"
    />
  );
}

export function UnauthorizedError({ className }: { className?: string }) {
  return (
    <ErrorState
      title="Akses Ditolak"
      message="Anda tidak memiliki izin untuk mengakses halaman ini. Silakan login kembali."
      action={{
        label: "Kembali ke Dashboard",
        onClick: () => window.location.href = '/dashboard',
        variant: "default"
      }}
      className={className}
      icon="triangle"
    />
  );
}

export function NotFoundError({ onBack, className }: { onBack?: () => void; className?: string }) {
  return (
    <ErrorState
      title="Halaman Tidak Ditemukan"
      message="Halaman yang Anda cari tidak tersedia atau telah dipindahkan."
      action={{
        label: "Kembali",
        onClick: onBack || (() => window.history.back()),
        variant: "outline"
      }}
      className={className}
      icon="circle"
    />
  );
}

export function DataError({ onRetry, className }: { onRetry?: () => void; className?: string }) {
  return (
    <ErrorState
      title="Data Tidak Valid"
      message="Terjadi masalah saat memuat data. Data yang diterima tidak sesuai format yang diharapkan."
      showRetry={!!onRetry}
      onRetry={onRetry}
      className={className}
      icon="triangle"
    />
  );
}

export function ServerError({ onRetry, className }: { onRetry?: () => void; className?: string }) {
  return (
    <ErrorState
      title="Kesalahan Server"
      message="Terjadi masalah pada server kami. Tim teknisi sedang menanganinya."
      showRetry={!!onRetry}
      onRetry={onRetry}
      className={className}
      icon="triangle"
    />
  );
}
