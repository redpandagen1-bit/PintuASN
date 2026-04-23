'use client';

// app/(auth)/sign-in/[[...sign-in]]/page.tsx — Sign-in v2 (Redesigned)

import { useEffect, useRef } from 'react';
import { SignIn as ClerkSignIn } from '@clerk/nextjs';

// Cast to any to allow Clerk runtime props (localization) not yet typed in v6
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SignIn = ClerkSignIn as React.ComponentType<any>;

// ── Indonesian error overrides ─────────────────────────────────

const ERROR_MAP: [RegExp, string][] = [
  [/external account was not found|account was not found|the.*account.*not found/i,       'Akun Google ini belum terdaftar. Silakan daftar terlebih dahulu.'],
  [/couldn'?t find your account|could not locate|no account.*found/i,                    'Akun tidak ditemukan. Periksa kembali email Anda.'],
  [/isn'?t registered|not registered|no account.*email|email.*not.*registered/i,         'Email ini belum terdaftar. Silakan daftar terlebih dahulu.'],
];

function replaceErrorTexts(root: HTMLElement) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node: Text | null;
  while ((node = walker.nextNode() as Text | null)) {
    const text = node.nodeValue;
    if (!text) continue;
    for (const [pattern, replacement] of ERROR_MAP) {
      if (pattern.test(text)) { node.nodeValue = replacement; break; }
    }
  }
}

// ── Component ─────────────────────────────────────────────────

export default function SignInPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    replaceErrorTexts(root);
    const observer = new MutationObserver(() => replaceErrorTexts(root));
    observer.observe(root, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full">

      {/* ── Header ─────────────────────────────────────── */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-3"
          style={{ background:'rgba(14,165,233,0.08)', border:'1px solid rgba(14,165,233,0.2)' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
          <span className="text-[10px] font-semibold tracking-widest text-sky-600 uppercase">
            Selamat Datang Kembali
          </span>
        </div>
        <h2 className="text-[1.55rem] font-extrabold tracking-tight leading-tight mb-1.5"
          style={{ fontFamily:'var(--font-headline)', color:'#0a1628' }}>
          Lanjutkan{' '}
          <span style={{ background:'linear-gradient(125deg,#0ea5e9,#10b981)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
            Persiapan CPNS
          </span>
          {' '}Anda
        </h2>
        <p className="text-[0.83rem] text-slate-500">
          Masuk ke akun untuk melanjutkan belajar
        </p>
      </div>

      {/* ── Clerk SignIn ─────────────────────────────── */}
      <SignIn
        routing="hash"
        signUpUrl="/sign-up"
        appearance={{
          elements: {
            rootBox: 'w-full',
            card:    'w-full shadow-none border-0 bg-transparent p-0',

            /* Social buttons */
            socialButtonsBlockButton: [
              'w-full flex items-center justify-center gap-2.5',
              'h-11 rounded-xl border bg-white',
              'text-[0.85rem] font-medium text-slate-700',
              'hover:bg-slate-50 hover:border-slate-300',
              'transition-all duration-150 shadow-sm',
              'border-slate-200',
            ].join(' '),
            socialButtonsBlockButtonText: 'text-[0.85rem] font-medium',
            socialButtonsProviderIcon:    'w-[18px] h-[18px]',

            /* Divider */
            dividerRow:  'my-4',
            dividerLine: 'bg-slate-200',
            dividerText: 'text-[0.73rem] text-slate-400 px-2',

            /* Form fields */
            formFieldLabel: 'text-[0.79rem] font-semibold text-slate-700 mb-1',
            formFieldInput: [
              'h-11 rounded-xl border bg-white',
              'text-[0.875rem] text-slate-800 placeholder:text-slate-400',
              'px-3.5 transition-all duration-150',
              'border-slate-200',
              'focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400',
              'hover:border-slate-300',
            ].join(' '),
            formFieldInputShowPasswordButton: 'text-slate-400 hover:text-slate-600',

            /* Primary button — gradient */
            formButtonPrimary: [
              'w-full h-11 rounded-xl',
              'text-white text-[0.875rem] font-semibold',
              'transition-all duration-200 shadow-md active:scale-[0.98]',
            ].join(' '),

            /* Footer */
            footerActionLink:  'text-sky-600 hover:text-sky-700 font-semibold transition-colors',
            footer:            'hidden',
            footerAction:      'hidden',

            /* Error */
            formFieldErrorText: 'text-[0.74rem] text-red-500 mt-1',
            alert:              'rounded-xl bg-red-50 border border-red-200 text-red-700 text-[0.79rem] p-3',

            /* Header (hidden — we use custom) */
            headerTitle:    'hidden',
            headerSubtitle: 'hidden',
            header:         'hidden',

            /* Forgot password */
            formFieldAction: 'text-[0.74rem] text-sky-600 hover:text-sky-700 font-medium',

            /* OTP */
            otpCodeFieldInput: [
              'w-10 h-12 rounded-xl border border-slate-200 bg-white',
              'text-center text-lg font-bold text-slate-800',
              'focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400',
            ].join(' '),

            /* Identity preview */
            identityPreviewText:       'text-[0.85rem] text-slate-700',
            identityPreviewEditButton: 'text-sky-600 hover:text-sky-700',
          },
          layout: {
            socialButtonsPlacement: 'top',
            logoPlacement:          'none',
          },
          variables: {
            colorPrimary:         '#0ea5e9',
            colorText:            '#0f172a',
            colorTextSecondary:   '#64748b',
            colorBackground:      '#ffffff',
            colorInputBackground: '#ffffff',
            colorInputText:       '#0f172a',
            borderRadius:         '0.75rem',
            fontFamily:           'var(--font-inter)',
            fontSize:             '14px',
          },
        }}
        localization={{
          formFieldLabel__emailAddress:       'Alamat Email',
          formFieldLabel__password:           'Kata Sandi',
          formFieldPlaceholder__emailAddress: 'nama@email.com',
          formButtonPrimary:                  'Masuk ke Akun',
          footerActionLink__signUp:           'Daftar',
          socialButtonsBlockButton__google:   'Lanjutkan dengan Google',
          signIn__password__forgotPasswordLink: 'Lupa kata sandi?',
        }}
      />

      {/* ── Footer link ─────────────────────────────── */}
      <p className="text-center text-[0.81rem] text-slate-500 mt-5">
        Belum punya akun?{' '}
        <a href="/sign-up" className="text-sky-600 hover:text-sky-700 font-semibold transition-colors">
          Daftar gratis sekarang
        </a>
      </p>

      {/* ── Trust badge ─────────────────────────────── */}
      <div className="flex items-center justify-center gap-3 mt-5 pt-4 border-t border-slate-100">
        <TrustItem icon="lock">SSL 256-bit</TrustItem>
        <Dot />
        <TrustItem icon="shield">Data aman</TrustItem>
        <Dot />
        <TrustItem icon="star">50K+ peserta</TrustItem>
      </div>

    </div>
  );
}

// ── Small helpers ──────────────────────────────────────────────

function Dot() {
  return <span className="text-slate-200 text-base leading-none">·</span>;
}

function TrustItem({ icon, children }: { icon: 'lock' | 'shield' | 'star'; children: React.ReactNode }) {
  const icons = {
    lock:   <path d="M3.5 6.5V5a3 3 0 016 0v1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>,
    shield: <path d="M7 2L2 4.5v4C2 11.1 4.2 13.4 7 14c2.8-.6 5-2.9 5-5.5v-4L7 2z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>,
    star:   <path d="M7 1l1.5 3.3L12 4.85 9.5 7.3l.6 3.5L7 9.1l-3.1 1.7.6-3.5L2 4.85l3.5-.55L7 1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>,
  };
  const viewBoxes = { lock: '0 0 13 14', shield: '0 0 14 14', star: '0 0 14 14' };
  return (
    <div className="flex items-center gap-1">
      <svg width="12" height="12" viewBox={viewBoxes[icon]} fill="none" className="text-slate-400">
        {icon === 'lock' && <rect x="2" y="6" width="9" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.2" />}
        {icons[icon]}
      </svg>
      <span className="text-[10.5px] text-slate-400">{children}</span>
    </div>
  );
}
