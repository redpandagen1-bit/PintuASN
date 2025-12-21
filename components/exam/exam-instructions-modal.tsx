'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';

interface ExamInstructionsModalProps {
  packageId: string;
}

export function ExamInstructionsModal({ packageId }: ExamInstructionsModalProps) {
  const [open, setOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleStartExam = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/exam/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to start exam');
      }

      const { attemptId } = await response.json();
      router.push(`/exam/${attemptId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg">
          Mulai Tryout
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Petunjuk Ujian</DialogTitle>
          <DialogDescription>
            Mohon baca dan pahami aturan berikut sebelum memulai
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <ul className="space-y-2 text-sm text-slate-700">
            <li>1. Ujian terdiri dari 110 soal dengan durasi 100 menit</li>
            <li>2. Anda tidak dapat menghentikan atau menjeda ujian setelah dimulai</li>
            <li>3. Ujian akan otomatis berakhir jika waktu habis</li>
            <li>4. Jawaban Anda akan tersimpan secara otomatis</li>
          </ul>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="ready"
              checked={isReady}
              onCheckedChange={(checked) => setIsReady(checked as boolean)}
            />
            <label 
              htmlFor="ready" 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Saya sudah siap dan memahami aturan ujian
            </label>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            Batal
          </Button>
          <Button 
            onClick={handleStartExam}
            disabled={!isReady || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memulai...
              </>
            ) : (
              'Mulai Sekarang'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
