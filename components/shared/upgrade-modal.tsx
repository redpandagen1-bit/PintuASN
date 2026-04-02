'use client';

// ============================================================
// components/shared/upgrade-modal.tsx
// ============================================================

import { useEffect }   from 'react';
import Link            from 'next/link';
import { X, Lock, Zap, Crown, ArrowRight } from 'lucide-react';

interface UpgradeModalProps {
  isOpen:       boolean;
  onClose:      () => void;
  requiredTier: 'premium' | 'platinum';
  contentTitle: string;
}

export function UpgradeModal({ isOpen, onClose, requiredTier, contentTitle }: UpgradeModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const isPlatinum = requiredTier === 'platinum';
  const Icon       = isPlatinum ? Crown : Zap;

  const config = {
    iconBg:     isPlatinum ? 'bg-purple-100'  : 'bg-blue-100',
    iconColor:  isPlatinum ? 'text-purple-600' : 'text-blue-600',
    badgeBg:    isPlatinum ? 'bg-purple-500'   : 'bg-blue-500',
    label:      isPlatinum ? 'Platinum'         : 'Premium',
    btnBg:      isPlatinum
      ? 'bg-purple-600 hover:bg-purple-700'
      : 'bg-blue-600 hover:bg-blue-700',
    gradient:   isPlatinum ? 'from-purple-50 to-white' : 'from-blue-50 to-white',
    features: isPlatinum
      ? ['Akses semua tryout & materi', 'Live class & webinar eksklusif',
         'Konsultasi dengan mentor', 'Grup belajar khusus Platinum', 'Roadmap belajar personal']
      : ['Akses semua tryout Premium', 'Akses semua materi Premium',
         'Statistik & analisis performa', 'Simulasi ujian penuh SKD', 'Pembahasan setiap soal'],
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`bg-gradient-to-b ${config.gradient} px-6 pt-6 pb-5`}>
          <div className="flex justify-end mb-3">
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-black/5 transition-colors">
              <X size={18} className="text-slate-400" />
            </button>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className={`w-16 h-16 ${config.iconBg} rounded-2xl flex items-center justify-center mb-3 relative`}>
              <Icon size={28} className={config.iconColor} />
              <div className="absolute -top-1 -right-1 bg-red-500 rounded-full p-1">
                <Lock size={10} className="text-white" />
              </div>
            </div>

            <div className={`inline-flex items-center gap-1.5 ${config.badgeBg} text-white text-xs font-black px-3 py-1 rounded-full mb-3`}>
              <Icon size={11} /> Konten {config.label}
            </div>

            <h2 className="text-lg font-black text-slate-900 mb-1">Akses Terkunci</h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              <span className="font-semibold text-slate-700">"{contentTitle}"</span>{' '}
              hanya tersedia untuk member{' '}
              <span className="font-bold">{config.label}</span>.
              Upgrade sekarang untuk membuka konten ini.
            </p>
          </div>
        </div>

        {/* Fitur */}
        <div className="px-6 py-4 border-t border-slate-100">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
            Yang kamu dapatkan
          </p>
          <ul className="space-y-2">
            {config.features.map((f, i) => (
              <li key={i} className="flex items-center gap-2.5 text-sm text-slate-700">
                <div className={`w-5 h-5 ${config.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}>
                  <Icon size={11} className={config.iconColor} />
                </div>
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="px-6 pb-6 pt-2 flex flex-col gap-2">
          <Link href="/beli-paket" onClick={onClose}>
            <button className={`w-full py-3 rounded-xl ${config.btnBg} text-white font-black text-sm flex items-center justify-center gap-2 transition-colors`}>
              Upgrade ke {config.label} <ArrowRight size={15} />
            </button>
          </Link>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-sm transition-colors"
          >
            Nanti Saja
          </button>
        </div>
      </div>
    </div>
  );
}