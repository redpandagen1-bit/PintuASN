'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft, Share, Plus, MoreVertical, ShieldCheck,
  Smartphone, CheckCircle2, Sparkles, Zap, RefreshCw,
  Download, Info, ChevronDown,
} from 'lucide-react';
import { usePWAInstall } from '@/hooks/use-pwa-install';

type Platform = 'ios' | 'android';

export default function InstallPage() {
  const { install, platform: detected, promptReady, isInstalled } = usePWAInstall();
  const [tab, setTab] = useState<Platform>('android');
  const [mounted, setMounted] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);

  // Sinkronkan tab dengan platform terdeteksi (sekali, saat terdeteksi)
  useEffect(() => {
    setMounted(true);
    if (detected === 'ios') setTab('ios');
    else if (detected === 'android') setTab('android');
  }, [detected]);

  const handleInstall = async () => {
    setInstalling(true);
    await install();
    setInstalling(false);
  };

  const iosSteps = [
    { icon: <Share size={18} />, title: 'Buka lewat Safari', desc: 'Pastikan halaman pintuasn.com dibuka di browser Safari bawaan iPhone/iPad.' },
    { icon: <Share size={18} />, title: 'Tap tombol Share', desc: 'Ikon kotak dengan panah ke atas, ada di bar bawah Safari.' },
    { icon: <Plus size={18} />, title: 'Pilih "Add to Home Screen"', desc: 'Scroll menu Share ke bawah, lalu tap opsi tersebut.' },
    { icon: <CheckCircle2 size={18} />, title: 'Tap "Add"', desc: 'Ikon PintuASN langsung muncul di layar utama. Selesai!' },
  ];

  const androidSteps = [
    { icon: <MoreVertical size={18} />, title: 'Buka menu browser', desc: 'Di Chrome, tap ikon tiga titik (⋮) di pojok kanan atas.' },
    { icon: <Smartphone size={18} />, title: 'Pilih "Install app" / "Add to Home screen"', desc: 'Pilih opsi memasang aplikasi dari menu.' },
    { icon: <CheckCircle2 size={18} />, title: 'Konfirmasi "Install"', desc: 'Ikon PintuASN langsung terpasang di layar utama. Selesai!' },
  ];

  const steps = tab === 'ios' ? iosSteps : androidSteps;

  // Catatan pengaman: tab dibuka tidak cocok dengan perangkat
  const mismatch =
    mounted &&
    ((detected === 'ios' && tab === 'android') || (detected === 'android' && tab === 'ios'));
  const mismatchTarget = detected === 'ios' ? 'iPhone / iPad' : 'Android';

  // Tombol install 1-klik hanya muncul di Android yang promptnya benar-benar siap
  const showInstallButton = tab === 'android' && promptReady && !isInstalled;

  const stepsList = (
    <ol className="space-y-4">
      {steps.map((s, i) => (
        <li key={i} className="flex items-start gap-3">
          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold">
            {i + 1}
          </span>
          <div>
            <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <span className="text-sky-500">{s.icon}</span> {s.title}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">{s.desc}</p>
          </div>
        </li>
      ))}
    </ol>
  );

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm font-bold">
            <ArrowLeft size={16} /> Beranda
          </Link>
          <Image src="/images/logo-navbar-sky.svg" alt="PintuASN" width={92} height={28} unoptimized priority />
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">

        {/* Hero */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white shadow-md border border-slate-100 mb-4">
            <Image src="/images/icon-p-light.svg" alt="Ikon PintuASN" width={64} height={64} unoptimized />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Pasang <span className="text-sky-500">PintuASN</span> di HP-mu
          </h1>
          <p className="text-slate-500 mt-2 max-w-md mx-auto text-sm md:text-base">
            Akses semua tryout &amp; materi langsung dari layar utama secepat aplikasi biasa, tanpa perlu store.
          </p>
        </div>

        {/* Sudah terpasang */}
        {mounted && isInstalled && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 md:p-5 mb-6 flex items-start gap-3 max-w-xl mx-auto">
            <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
              <CheckCircle2 size={18} />
            </div>
            <div className="text-sm">
              <p className="font-bold text-emerald-900 mb-0.5">PintuASN sudah terpasang</p>
              <p className="text-emerald-800">Kamu membuka halaman ini dari aplikasi yang sudah terinstal. Tidak perlu memasang ulang.</p>
            </div>
          </div>
        )}

        {/* Platform tabs */}
        <div className="flex gap-2 mb-5 p-1 bg-slate-100 rounded-xl w-full max-w-xs mx-auto">
          {(['ios', 'android'] as Platform[]).map((p) => (
            <button
              key={p}
              onClick={() => setTab(p)}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                tab === p ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {p === 'ios' ? 'iPhone / iPad' : 'Android'}
            </button>
          ))}
        </div>

        {/* Catatan pengaman jika tab tidak cocok dengan perangkat */}
        {mismatch && (
          <div className="mb-5 rounded-xl bg-sky-50 border border-sky-100 p-3 flex items-start gap-2 text-xs text-sky-800 max-w-xl mx-auto">
            <Info size={15} className="flex-shrink-0 mt-0.5" />
            <p>
              Perangkatmu terdeteksi <span className="font-bold">{mismatchTarget}</span>. Langkah di tab ini
              untuk perangkat lain. Pindah ke tab <span className="font-bold">{mismatchTarget}</span> untuk panduan yang sesuai.
            </p>
          </div>
        )}

        {/* Tombol install 1-klik (hanya Android yang prompt-nya siap) */}
        {showInstallButton && (
          <div className="mb-5 max-w-xl mx-auto">
            <button
              onClick={handleInstall}
              disabled={installing}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-extrabold shadow-sm transition-all active:scale-[0.98] disabled:opacity-60"
            >
              <Download size={18} />
              {installing ? 'Memasang…' : 'Install Sekarang'}
            </button>
            <p className="text-center text-[11px] text-slate-400 mt-2">
              Akan muncul dialog konfirmasi resmi dari browser.
            </p>
          </div>
        )}

        {/* Steps */}
        <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5 md:p-6 max-w-xl mx-auto mb-8">
          {showInstallButton ? (
            <>
              <button
                onClick={() => setManualOpen((o) => !o)}
                className="w-full flex items-center justify-between gap-2 text-base font-bold text-slate-800"
                aria-expanded={manualOpen}
              >
                <span className="flex items-center gap-2">
                  <Smartphone size={18} className="text-sky-500" />
                  Atau pasang manual di Android
                </span>
                <ChevronDown size={18} className={`text-slate-400 transition-transform ${manualOpen ? 'rotate-180' : ''}`} />
              </button>
              {manualOpen && <div className="mt-4">{stepsList}</div>}
            </>
          ) : (
            <>
              <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Smartphone size={18} className="text-sky-500" />
                Cara pasang di {tab === 'ios' ? 'iPhone / iPad' : 'Android'}
              </h2>
              {stepsList}
              {tab === 'ios' && (
                <div className="mt-5 rounded-xl bg-sky-50 border border-sky-100 p-3 text-xs text-sky-800">
                  Menu &ldquo;Add to Home Screen&rdquo; hanya muncul di <span className="font-bold">Safari</span>.
                  Kalau kamu memakai Chrome di iPhone, buka menu lalu pilih &ldquo;Open in Safari&rdquo; dulu.
                </div>
              )}
            </>
          )}
        </div>

        {/* Notice: impostor / belum di store */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 md:p-5 mb-8">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-amber-400 text-slate-900 flex items-center justify-center">
              <ShieldCheck size={18} />
            </div>
            <div className="text-sm leading-relaxed">
              <p className="font-bold text-amber-900 mb-1">
                Aplikasi resmi PintuASN hanya tersedia di sini
              </p>
              <p className="text-amber-800">
                PintuASN belum merilis aplikasi di Google Play Store maupun App Store. Untuk sekarang,
                PintuASN hadir sebagai aplikasi web (PWA) yang bisa langsung kamu tambahkan ke layar
                utama ringan, tanpa unduhan besar, dan otomatis selalu versi terbaru.
              </p>
              <p className="text-amber-800 mt-2">
                Jika kamu menemukan aplikasi bernama &ldquo;PintuASN&rdquo; di Google Play, itu{' '}
                <span className="font-bold">bukan rilisan resmi kami</span>. Demi keamanan akun dan datamu,
                pasang PintuASN hanya melalui <span className="font-bold">pintuasn.com</span> mengikuti
                langkah di atas. Begitu aplikasi resmi tersedia, kami akan mengumumkannya langsung di situs ini.
              </p>
            </div>
          </div>
        </div>

        {/* Perks */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: <Zap size={18} />, label: 'Ringan & cepat' },
            { icon: <RefreshCw size={18} />, label: 'Selalu terbaru' },
            { icon: <Sparkles size={18} />, label: 'Tanpa store' },
          ].map((p) => (
            <div key={p.label} className="rounded-xl bg-white border border-slate-100 shadow-sm py-3 px-2 text-center">
              <div className="text-sky-500 flex justify-center mb-1">{p.icon}</div>
              <p className="text-[11px] md:text-xs font-semibold text-slate-600">{p.label}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Butuh bantuan? Hubungi tim kami lewat halaman <Link href="/faq" className="text-sky-500 font-semibold underline underline-offset-2">FAQ</Link>.
        </p>
      </div>
    </main>
  );
}
