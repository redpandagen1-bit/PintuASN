'use client';

// app/(auth)/layout.tsx — Auth Layout v3

import Image from 'next/image';
import { useState, useEffect } from 'react';

// ── Data ─────────────────────────────────────────────────────────

const testimonials = [
  {
    quote: 'Latihan soalnya sangat mirip dengan ujian aslinya. Alhamdulillah saya lolos SKD dengan skor 458.',
    author: 'Rina Aprilia',
    role: 'Lolos Kementerian Keuangan',
    initial: 'RA',
    gradient: 'linear-gradient(135deg,#10b981,#0d9488)',
  },
  {
    quote: 'Interface-nya user friendly dan soal-soalnya selalu update. Makasih PintuASN, saya diterima di Kemenag!',
    author: 'M. Reza',
    role: 'Lolos Kementerian Agama',
    initial: 'MR',
    gradient: 'linear-gradient(135deg,#3b82f6,#6366f1)',
  },
  {
    quote: 'Sistem CAT-nya persis seperti aslinya, jadi pas hari H nggak kaget. Highly recommended!',
    author: 'Estiqomah W.',
    role: 'Lolos Kementerian Hukum & HAM',
    initial: 'EW',
    gradient: 'linear-gradient(135deg,#8b5cf6,#ec4899)',
  },
];

const stats = [
  { value: '12K+', label: 'Peserta Aktif',  color: '#0ea5e9' },
  { value: '871',  label: 'Bank Soal',       color: '#10b981' },
  { value: '4.9★', label: 'Rating Pengguna', color: '#f9bd22' },
];

const features = [
  { text: 'Bank soal SKD & SKB update 2026',     color: '#10b981' },
  { text: 'Simulasi CAT persis sistem asli BKN', color: '#0ea5e9' },
  { text: 'Ranking & analisis nilai real-time',  color: '#f9bd22' },
];

// ── Component ─────────────────────────────────────────────────────

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const [current,   setCurrent]   = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setAnimating(true);
      setTimeout(() => { setCurrent(p => (p + 1) % testimonials.length); setAnimating(false); }, 400);
    }, 7000);
    return () => clearInterval(id);
  }, []);

  const t = testimonials[current];

  return (
    <>
      <style>{`
        @keyframes blob1{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(40px,25px) scale(1.06)}}
        @keyframes blob2{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-30px,-35px) scale(1.1)}}
        @keyframes blob3{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-20px,20px) scale(0.93)}}
        @keyframes authIn{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        .auth-in{animation:authIn .5s ease both}
      `}</style>

      <div className="flex" style={{ minHeight:'100dvh' }}>

        {/* ══════ LEFT PANEL — desktop only ══════ */}
        <aside
          className="relative hidden lg:flex lg:w-[52%] flex-col overflow-hidden"
          style={{ background:'linear-gradient(145deg,#020b18 0%,#061828 45%,#0b2236 75%,#040f1d 100%)' }}
        >
          {/* animated blobs */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[-12%] left-[-8%] w-[65%] h-[65%] rounded-full"
              style={{ background:'radial-gradient(circle,#0ea5e9,transparent 65%)', opacity:.18, animation:'blob1 9s ease-in-out infinite' }}/>
            <div className="absolute bottom-[5%] right-[-8%] w-[55%] h-[55%] rounded-full"
              style={{ background:'radial-gradient(circle,#10b981,transparent 65%)', opacity:.15, animation:'blob2 11s ease-in-out infinite' }}/>
            <div className="absolute top-[38%] right-[15%] w-[35%] h-[35%] rounded-full"
              style={{ background:'radial-gradient(circle,#f9bd22,transparent 65%)', opacity:.09, animation:'blob3 13s ease-in-out infinite' }}/>
          </div>
          {/* grid */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.035]"
            style={{ backgroundImage:`linear-gradient(rgba(255,255,255,.7) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.7) 1px,transparent 1px)`, backgroundSize:'56px 56px' }}/>
          {/* top bar */}
          <div className="absolute top-0 left-0 right-0 h-[2px]"
            style={{ background:'linear-gradient(90deg,transparent,#0ea5e9 25%,#10b981 50%,#f9bd22 75%,transparent)' }}/>

          <div className="relative z-10 flex flex-col h-full p-10">
            {/* logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.1)' }}>
                <Image src="/images/Logo.svg" alt="PintuASN" width={22} height={22}/>
              </div>
              <span className="text-lg font-bold text-white" style={{ fontFamily:'var(--font-headline)' }}>
                PintuASN<span style={{ color:'#f9bd22' }}>.com</span>
              </span>
              <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider"
                style={{ background:'rgba(14,165,233,.12)', border:'1px solid rgba(14,165,233,.3)', color:'#38bdf8' }}>
                #1 Indonesia
              </span>
            </div>

            {/* hero */}
            <div className="flex-1 flex flex-col justify-center mt-12">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full w-fit mb-6"
                style={{ background:'rgba(249,189,34,.08)', border:'1px solid rgba(249,189,34,.2)' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#f9bd22] animate-pulse"/>
                <span className="text-[11px] font-semibold tracking-widest text-[#f9bd22] uppercase">Platform CPNS Terpercaya</span>
              </div>

              <h1 className="text-[2.75rem] font-extrabold leading-[1.05] tracking-tight text-white mb-5"
                style={{ fontFamily:'var(--font-headline)' }}>
                Raih Karir{' '}
                <span style={{ background:'linear-gradient(125deg,#38bdf8,#34d399)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                  ASN Impian
                </span>
                <br/>
                <span style={{ color:'#f9bd22' }}>Mulai di Sini</span>
              </h1>

              <p className="text-[#8896aa] text-[0.88rem] leading-relaxed mb-8 max-w-sm">
                Platform tryout CPNS paling akurat dengan sistem CAT real-time.
                Bergabung bersama ribuan peserta yang telah lolos seleksi nasional.
              </p>

              {/* stats */}
              <div className="grid grid-cols-3 gap-3 mb-8">
                {stats.map(s => (
                  <div key={s.label} className="rounded-2xl p-4 text-center"
                    style={{ background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.07)' }}>
                    <div className="text-xl font-extrabold mb-0.5" style={{ color:s.color, fontFamily:'var(--font-headline)' }}>{s.value}</div>
                    <div className="text-[10px] text-[#8896aa] leading-tight">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* features */}
              <div className="space-y-3">
                {features.map(f => (
                  <div key={f.text} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center"
                      style={{ background:`${f.color}18`, border:`1px solid ${f.color}40` }}>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M1.5 5L4 7.5L8.5 2.5" stroke={f.color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span className="text-[0.84rem] text-[#b8c6d9]">{f.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* testimonial */}
            <div className="mt-8">
              <div className="rounded-2xl p-5"
                style={{ background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_,i) => (
                      <svg key={i} width="12" height="12" viewBox="0 0 12 12" fill="#f9bd22">
                        <path d="M6 1l1.236 2.506L10 3.924l-2 1.948.472 2.752L6 7.25 3.528 8.624 4 5.872 2 3.924l2.764-.418L6 1z"/>
                      </svg>
                    ))}
                  </div>
                  <span className="text-[10px] text-[#8896aa]">4.9 · 12.000+ pengguna</span>
                </div>
                <div style={{ opacity:animating?0:1, transform:animating?'translateY(5px)':'translateY(0)', transition:'all .4s ease' }}>
                  <p className="text-[0.82rem] italic text-[#b8c6d9] leading-relaxed mb-4">&ldquo;{t.quote}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-bold text-white"
                      style={{ background:t.gradient }}>{t.initial}</div>
                    <div>
                      <div className="text-[0.81rem] font-semibold text-white">{t.author}</div>
                      <div className="text-[0.72rem]" style={{ color:'#f9bd22cc' }}>{t.role}</div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1.5 mt-4 justify-end">
                  {testimonials.map((_,i) => (
                    <button key={i} onClick={() => setCurrent(i)}
                      className={`rounded-full transition-all duration-300 ${i===current?'w-5 h-1.5 bg-[#f9bd22]':'w-1.5 h-1.5 bg-white/20 hover:bg-white/40'}`}/>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* ══════ RIGHT PANEL ══════ */}
        {/*
          Mobile: dark full-screen gradient, scrollable, form card in middle
          Desktop: light bg, form vertically centered
        */}
        <div
          className="relative w-full lg:w-[48%] flex flex-col bg-[#020b18] lg:bg-transparent"
          style={{ minHeight:'100dvh' }}
        >
          {/* ── Desktop background ── */}
          <div className="absolute inset-0 hidden lg:block" style={{ background:'#f8fafc' }}/>
          <div className="absolute inset-0 hidden lg:block pointer-events-none"
            style={{ backgroundImage:`radial-gradient(ellipse at 75% 10%,#dbeafe 0%,transparent 55%),radial-gradient(ellipse at 15% 90%,#dcfce7 0%,transparent 55%)`, opacity:.6 }}/>
          <div className="absolute top-0 inset-x-0 h-[2px] hidden lg:block"
            style={{ background:'linear-gradient(90deg,transparent,#0ea5e9 30%,#10b981 70%,transparent)' }}/>

          {/* ── Mobile background ── */}
          <div className="absolute inset-0 lg:hidden"
            style={{ background:'linear-gradient(160deg,#020b18 0%,#071422 55%,#040f1d 100%)' }}/>
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none lg:hidden"
            style={{ background:'radial-gradient(circle,#0ea5e9,transparent 70%)', opacity:.13, transform:'translate(40%,-40%)' }}/>
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full pointer-events-none lg:hidden"
            style={{ background:'radial-gradient(circle,#10b981,transparent 70%)', opacity:.1, transform:'translate(-40%,40%)' }}/>

          {/* ══════ MOBILE LAYOUT ══════ */}
          <div className="lg:hidden relative z-10 flex flex-col auth-in px-4 pt-8 pb-10" style={{ minHeight:'100dvh' }}>

            {/* logo */}
            <div className="flex flex-col items-center mb-5">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-2.5"
                style={{ background:'rgba(255,255,255,.08)', border:'1px solid rgba(255,255,255,.12)' }}>
                <Image src="/images/Logo.svg" alt="PintuASN" width={26} height={26}/>
              </div>
              <span className="text-base font-bold text-white" style={{ fontFamily:'var(--font-headline)' }}>
                PintuASN<span style={{ color:'#f9bd22' }}>.com</span>
              </span>
              <span className="text-[11px] text-[#8896aa] mt-0.5">Platform CPNS #1 Indonesia</span>
            </div>

            {/* stats */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {stats.map(s => (
                <div key={s.label} className="rounded-xl py-2.5 text-center"
                  style={{ background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.08)' }}>
                  <div className="text-sm font-extrabold" style={{ color:s.color }}>{s.value}</div>
                  <div className="text-[9px] text-[#8896aa] mt-0.5 leading-tight">{s.label}</div>
                </div>
              ))}
            </div>

            {/* form card — solid white, NO backdrop-filter (Safari overflow bug) */}
            <div className="rounded-2xl bg-white shadow-2xl w-full overflow-hidden">
              <div className="px-6 py-6">
                {children}
              </div>
            </div>

            {/* trust */}
            <div className="flex items-center justify-center gap-1.5 mt-4">
              <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                <rect x="2" y="6" width="10" height="7" rx="1.5" stroke="#8896aa" strokeWidth="1.2"/>
                <path d="M4.5 6V4.5a2.5 2.5 0 015 0V6" stroke="#8896aa" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              <span className="text-[10.5px] text-[#8896aa]">Dilindungi enkripsi SSL 256-bit</span>
            </div>
          </div>

          {/* ══════ DESKTOP LAYOUT ══════ */}
          {/*
            Key fix: give this exact height = 100dvh so flex justify-center
            actually centers the content vertically
          */}
          <div
            className="hidden lg:flex flex-col items-center justify-center relative z-10 auth-in"
            style={{ minHeight:'100dvh', padding:'48px 24px' }}
          >
            <div className="w-full mx-auto" style={{ maxWidth:'400px' }}>
              {children}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
