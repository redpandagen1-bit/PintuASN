'use client';

// app/(auth)/sign-in/[[...sign-in]]/page.tsx — v6
// Google-only (sign-in & sign-up jadi satu tombol). Desain sengaja polos:
// judul, satu tombol, satu kalimat penjelas. Tidak ada kartu statistik.

import { useEffect, useState } from 'react';
import { SignIn as ClerkSignIn } from '@clerk/nextjs';

// Cast: Clerk v6 types don't expose `localization` on component; it lives on ClerkProvider.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SignIn = ClerkSignIn as React.ComponentType<any>;

export default function SignInPage() {
  // Dukung deep-link ?plan=premium/platinum dari halaman harga di landing
  // page — diteruskan ke onboarding supaya konteks paket yang dipilih tidak
  // hilang. Baca langsung dari URL (bukan useSearchParams) supaya halaman
  // client ini tidak perlu dibungkus <Suspense>.
  const [redirectUrl, setRedirectUrl] = useState('/dashboard');

  useEffect(() => {
    const plan = new URLSearchParams(window.location.search).get('plan');
    if (plan) setRedirectUrl(`/onboarding?plan=${plan}`);
  }, []);

  return (
    <div className="auth-variant-navy w-full">
      <style dangerouslySetInnerHTML={{ __html: PAGE_CSS }} />

      <div className="si-card">
        {/* ── Judul ──────────────────────────────────────── */}
        <header className="si-head">
          <h1 className="si-title">
            Masuk ke{' '}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo-navbar-sky.svg" alt="PintuASN" className="si-title-logo" />
          </h1>
          <p className="si-sub">
            Satu akun untuk semua latihan, tryout, dan hasil belajarmu.
          </p>
        </header>

        {/* ── Clerk SignIn (Google-only) ─────────────────────
            Strategi email/password dinonaktifkan dari Clerk Dashboard, jadi
            Clerk hanya merender tombol Google. `elements` di bawah cuma jaring
            pengaman visual (sembunyikan divider/form email kalau ada) supaya
            tampilan tetap rapi walau konfigurasi dashboard belum sempurna. */}
        <div className="si-form">
          <SignIn
            routing="hash"
            forceRedirectUrl={redirectUrl}
            appearance={{
              elements: {
                header: '!hidden',
                headerTitle: '!hidden',
                headerSubtitle: '!hidden',
                footer: '!hidden',
                footerAction: '!hidden',
                footerPages: '!hidden',
                dividerRow: '!hidden',
                formFieldRow__identifier: '!hidden',
                formFieldRow__password: '!hidden',
                formButtonPrimary: '!hidden',
                alternativeMethods: '!hidden',
                socialButtonsBlockButton: 'h-12 text-[0.95rem] font-semibold',
              },
              layout: { socialButtonsPlacement: 'top', logoPlacement: 'none' },
              variables: {
                colorPrimary:         '#0ea5e9',
                colorText:            '#0f172a',
                colorTextSecondary:   '#64748b',
                colorBackground:      '#ffffff',
                colorInputBackground: '#ffffff',
                colorInputText:       '#0f172a',
                borderRadius:         '0.875rem',
                fontFamily:           'var(--font-jakarta)',
                fontSize:             '14px',
              },
            }}
          />
        </div>

        {/* ── Catatan & legal ───────────────────────────── */}
        <p className="si-note">
          Belum punya akun? Akunmu dibuat otomatis saat pertama kali masuk.
        </p>

        <p className="si-legal">
          Dengan melanjutkan, kamu menyetujui{' '}
          <a href="/syarat-ketentuan">Syarat &amp; Ketentuan</a> kami.
        </p>
      </div>
    </div>
  );
}

const PAGE_CSS = `
.si-card{background:#fff;border:1px solid #e2e8f0;border-radius:20px;
  padding:32px 28px;box-shadow:0 1px 2px rgba(15,23,42,.04),0 12px 32px -18px rgba(15,23,42,.22)}
.si-head{text-align:center;margin-bottom:24px}
.si-title{font-family:var(--font-headline),'Plus Jakarta Sans',sans-serif;
  font-size:28px;line-height:1.15;font-weight:800;letter-spacing:-.025em;color:#0f172a;margin:0 0 10px;
  display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:8px 10px}
.si-title-logo{height:38px;width:auto;display:inline-block;vertical-align:middle;transform:translateY(6px)}
.si-sub{font-size:14.5px;line-height:1.6;color:#64748b;margin:0 auto;max-width:19rem}
.si-form .cl-rootBox,.si-form .cl-card{width:100%;box-shadow:none!important;background:transparent!important;
  border:none!important;padding:0!important;margin:0!important}
.si-form .cl-main{gap:0!important}
/* Clerk tetap merender <form> kosong (email/password dimatikan di dashboard) —
   sembunyikan supaya tidak menyisakan ruang kosong di bawah tombol Google. */
.si-form .cl-form{display:none!important}
.si-form .cl-socialButtonsBlockButton{height:48px!important;border-radius:12px!important;
  border:1px solid #cbd5e1!important;font-weight:600!important}
.si-form .cl-socialButtonsBlockButton:hover{border-color:#0ea5e9!important;background:#f8fafc!important}
.si-note{margin:20px 0 0;text-align:center;font-size:13px;line-height:1.6;color:#64748b}
.si-legal{margin:16px 0 0;text-align:center;font-size:12px;line-height:1.6;color:#94a3b8}
.si-legal a{color:#0ea5e9;font-weight:600;text-decoration:none}
.si-legal a:hover{text-decoration:underline}
@media(max-width:420px){.si-card{padding:26px 20px}.si-title{font-size:25px}.si-title-logo{height:32px}.si-sub{font-size:13.5px}}
`;
