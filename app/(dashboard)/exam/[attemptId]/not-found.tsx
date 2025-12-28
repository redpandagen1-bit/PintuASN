'use client';

import { useRouter } from 'next/navigation';
import { ExamNotFound } from '@/components/shared/not-found-state';

export default function ExamNotFoundPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/packages');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-lg p-6">
        <ExamNotFound onBack={handleBack} />
      </div>
    </div>
  );
}