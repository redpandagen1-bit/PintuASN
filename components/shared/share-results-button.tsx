'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface ShareResultsButtonProps {
  attemptId: string;
  score: number;
  maxScore: number;
  passed: boolean;
  packageName: string;
}

export function ShareResultsButton({ 
  attemptId,
  score,
  maxScore,
  passed,
  packageName
}: ShareResultsButtonProps) {
  const [isCopied, setIsCopied] = useState(false);

  const generateShareText = () => {
    const percentage = Math.round((score / maxScore) * 100);
    const status = passed ? '🎉 LULUS' : '📚 Belum Lulus';
    
    return `Hasil Tryout SKD CPNS\n📝 ${packageName}\n${status}\n📊 Skor: ${score}/${maxScore} (${percentage}%)\n\nYuk, coba juga di SKD CPNS Tryout Platform!`;
  };

  const generateShareUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/exam/${attemptId}/result`;
    }
    return '';
  };

  const handleCopyLink = async () => {
    const url = generateShareUrl();
    
    try {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      toast.success('Link hasil berhasil disalin!');
      
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      toast.error('Gagal menyalin link');
    }
  };

  const handleShare = async () => {
    const text = generateShareText();
    const url = generateShareUrl();

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Hasil Tryout SKD CPNS',
          text: text,
          url: url,
        });
      } catch (err) {
        // User cancelled or error occurred
        if ((err as Error).name !== 'AbortError') {
          toast.error('Gagal membagikan hasil');
        }
      }
    } else {
      // Fallback: copy text to clipboard
      try {
        await navigator.clipboard.writeText(`${text}\n\n${url}`);
        toast.success('Teks hasil berhasil disalin!');
      } catch (err) {
        toast.error('Gagal menyalin teks');
      }
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="lg"
        onClick={handleCopyLink}
        className="relative"
      >
        {isCopied ? (
          <>
            <Check className="h-4 w-4 mr-2 text-green-600" />
            Tersalin!
          </>
        ) : (
          <>
            <Copy className="h-4 w-4 mr-2" />
            Salin Link
          </>
        )}
      </Button>
      
      <Button
        variant="outline"
        size="lg"
        onClick={handleShare}
      >
        <Share2 className="h-4 w-4 mr-2" />
        Bagikan
      </Button>
    </div>
  );
}
