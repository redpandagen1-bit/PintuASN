'use client';

// app/(auth)/sign-in/[[...sign-in]]/page.tsx — v4 (globals-driven)

import { useEffect, useRef } from 'react';
import { SignIn as ClerkSignIn } from '@clerk/nextjs';

// Cast: Clerk v6 types don't expose `localization` on component; it lives on ClerkProvider.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SignIn = ClerkSignIn as React.ComponentType<any>;

// ── Indonesian error overrides ──────────────────────────────────
const ERROR_MAP: [RegExp, string][] = [
  [/external account was not found|account was not found|the.*account.*not found/i,
   'Akun Google ini belum terdaftar. Silakan daftar terlebih dahulu.'],
  [/couldn'?t find your account|could not locate|no account.*found/i,
   'Akun tidak ditemukan. Periksa kembali email Anda.'],
  [/isn'?t registered|not registered|no account.*email|email.*not.*registered/i,
   'Email ini belum terdaftar. Silakan daftar terlebih dahulu.'],
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

// ── Component ───────────────────────────────────────────────────
export default function SignInPage() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    replaceErrorTexts(root);
    const obs = new MutationObserver(() => replaceErrorTexts(root));
    obs.observe(root, { childList: true, subtree: true, characterData: true });
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="auth-variant-navy w-full">

      {/* ── Header ──────────────────────────────────────── */}
      <div className="flex flex-col items-center text-center mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-3"
          style={{ background:'rgba(14,165,233,.08)', border:'1px solid rgba(14,165,233,.2)' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"/>
          <span className="text-[10px] font-semibold tracking-widest text-sky-600 uppercase">
            Selamat Datang Kembali
          </span>
        </div>
        <h2 className="text-[1.65rem] font-extrabold tracking-tight leading-[1.15] text-slate-900 mb-2"
          style={{ fontFamily:'var(--font-headline)' }}>
          <span className="block">Lanjutkan</span>
          <span className="block" style={{ background:'linear-gradient(125deg,#0ea5e9,#10b981)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
            Persiapan CPNS
          </span>
        </h2>
        <p className="text-[0.82rem] text-slate-500 max-w-[18rem]">
          Masuk ke akun untuk melanjutkan belajar
        </p>
      </div>

      {/* ── Clerk SignIn ─────────────────────────────────── */}
      {/* Styling is driven by app/globals.css (.cl-*) + appearance.variables.
          appearance.elements only hides Clerk-native header/footer. */}
      <SignIn
        routing="hash"
        signUpUrl="/sign-up"
        appearance={{
          elements: {
            header: '!hidden',
            headerTitle: '!hidden',
            headerSubtitle: '!hidden',
            footer: '!hidden',
            footerAction: '!hidden',
            footerPages: '!hidden',
          },
          layout: { socialButtonsPlacement: 'top', logoPlacement: 'none' },
          variables: {
            colorPrimary:         '#0f172a',
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
      />

      {/* ── Custom footer ─────────────────────────────── */}
      <div className="mt-6 pt-5 border-t border-slate-100 space-y-3">
        <p className="text-center text-[0.82rem] text-slate-500">
          Belum punya akun?{' '}
          <a href="/sign-up" className="text-sky-600 hover:text-sky-700 font-semibold transition-colors">
            Daftar gratis sekarang
          </a>
        </p>
        <div className="flex items-center justify-center gap-4">
          <TrustChip icon="lock"   text="SSL 256-bit" />
          <TrustChip icon="shield" text="Data aman" />
          <TrustChip icon="users"  text="12K+ peserta" />
        </div>
      </div>

    </div>
  );
}

// ── Trust chip ────────────────────────────────────────────────────
type TrustIcon = 'lock' | 'shield' | 'users';

const TRUST_ICONS: Record<TrustIcon, React.ReactNode> = {
  lock: (
    <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
      <rect x="2" y="6.5" width="10" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M4.5 6.5V5a2.5 2.5 0 015 0v1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  ),
  shield: (
    <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
      <path d="M7 1.5L2 4v4.5C2 11.1 4.2 13.1 7 13.5c2.8-.4 5-2.4 5-5V4L7 1.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
    </svg>
  ),
  users: (
    <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
      <circle cx="5" cy="4" r="2" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M1 12c0-2.2 1.8-4 4-4s4 1.8 4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <circle cx="10.5" cy="4.5" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M13 11c0-1.7-1.1-3-2.5-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  ),
};

function TrustChip({ icon, text }: { icon: TrustIcon; text: string }) {
  return (
    <div className="flex items-center gap-1 text-slate-400">
      {TRUST_ICONS[icon]}
      <span className="text-[10.5px]">{text}</span>
    </div>
  );
}
