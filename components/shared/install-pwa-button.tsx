'use client';

import { useState } from 'react';
import { Download, X, Share, MoreHorizontal } from 'lucide-react';
import { usePWAInstall } from '@/hooks/use-pwa-install';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function InstallPWAButton() {
  const { install, canInstall, platform } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installing, setInstalling] = useState(false);

  if (!canInstall) return null;

  const handleClick = async () => {
    if (platform === 'ios') {
      setShowIOSGuide(true);
      return;
    }

    setInstalling(true);
    await install();
    setInstalling(false);
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={installing}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-slate-900 text-xs font-bold shadow-sm transition-all active:scale-95 disabled:opacity-60"
        aria-label="Install aplikasi"
      >
        <Download size={13} />
        <span className="hidden sm:inline">Install App</span>
      </button>

      {/* iOS Install Guide Dialog */}
      <Dialog open={showIOSGuide} onOpenChange={setShowIOSGuide}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/Logo.svg" alt="PintuASN" width={20} height={20} />
              </div>
              Install PintuASN di iPhone
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pb-2">
            <p className="text-sm text-slate-600">
              Ikuti 3 langkah mudah untuk menambahkan PintuASN ke layar utama iPhone kamu:
            </p>

            <div className="space-y-3">
              {/* Step 1 */}
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Buka di Safari</p>
                  <p className="text-xs text-slate-500">Pastikan kamu menggunakan browser Safari bawaan iPhone</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                    Tap tombol <Share size={14} className="text-sky-500" />
                  </p>
                  <p className="text-xs text-slate-500">Tombol Share ada di bagian bawah layar Safari</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Pilih "Add to Home Screen"</p>
                  <p className="text-xs text-slate-500">Scroll ke bawah menu Share dan tap opsi tersebut</p>
                </div>
              </div>
            </div>

            {/* Visual hint for non-Safari */}
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 flex items-start gap-2">
              <div className="text-amber-500 flex-shrink-0 mt-0.5">
                <MoreHorizontal size={16} />
              </div>
              <p className="text-xs text-amber-700">
                Jika menggunakan Chrome/browser lain di iPhone, buka menu <strong>⋯</strong> lalu pilih <strong>"Open in Safari"</strong> terlebih dahulu.
              </p>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 text-white text-sm font-bold hover:bg-slate-700 transition-colors"
            >
              Mengerti
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
