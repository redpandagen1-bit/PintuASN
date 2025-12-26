'use client';

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Search, Home } from 'lucide-react';

interface NotFoundStateProps {
  title?: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  };
  showHome?: boolean;
  className?: string;
}

export function NotFoundState({ 
  title = "Halaman Tidak Ditemukan", 
  message = "Maaf, halaman yang Anda cari tidak tersedia atau telah dipindahkan.",
  action,
  showHome = true,
  className = ""
}: NotFoundStateProps) {
  const defaultActions = [
    ...(showHome ? [{
      label: "Kembali ke Dashboard",
      onClick: () => window.location.href = '/dashboard',
      variant: 'default' as const
    }] : []),
    ...(action ? [action] : [])
  ];

  return (
    <div className={`w-full max-w-md mx-auto p-6 ${className}`}>
      <Alert className="flex flex-col items-center text-center">
        <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
          <Search className="h-8 w-8 text-slate-400" />
        </div>
        
        <AlertTitle className="text-xl mb-3">{title}</AlertTitle>
        
        <AlertDescription className="text-base leading-relaxed mb-6">
          {message}
        </AlertDescription>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          {defaultActions.map((actionItem, index) => (
            <Button 
              key={index}
              onClick={actionItem.onClick}
              variant={actionItem.variant || 'default'}
              className="w-full sm:w-auto"
            >
              {actionItem.label === "Kembali ke Dashboard" && (
                <Home className="h-4 w-4 mr-2" />
              )}
              {actionItem.label}
            </Button>
          ))}
        </div>
      </Alert>
    </div>
  );
}

// Specific 404 State Components
export function PageNotFound({ className }: { className?: string }) {
  return (
    <NotFoundState
      title="Halaman Tidak Ditemukan"
      message="Halaman yang Anda cari tidak ada atau telah dihapus."
      className={className}
    />
  );
}

export function ExamNotFound({ onBack, className }: { onBack?: () => void; className?: string }) {
  return (
    <NotFoundState
      title="Ujian Tidak Ditemukan"
      message="Ujian yang Anda cari tidak tersedia atau telah berakhir."
      action={{
        label: "Kembali ke Daftar Ujian",
        onClick: onBack || (() => window.location.href = '/packages'),
        variant: "outline"
      }}
      showHome={false}
      className={className}
    />
  );
}

export function PackageNotFound({ className }: { className?: string }) {
  return (
    <NotFoundState
      title="Paket Tidak Ditemukan"
      message="Paket tryout yang Anda cari tidak tersedia."
      className={className}
    />
  );
}

export function AttemptNotFound({ onBack, className }: { onBack?: () => void; className?: string }) {
  return (
    <NotFoundState
      title="Percobaan Tidak Ditemukan"
      message="Data percobaan ujian ini tidak dapat ditemukan atau tidak valid."
      action={{
        label: "Lihat Riwayat Percobaan",
        onClick: onBack || (() => window.location.href = '/history'),
        variant: "outline"
      }}
      showHome={false}
      className={className}
    />
  );
}
