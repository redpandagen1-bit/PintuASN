// app/(auth)/sign-up/[[...sign-up]]/page.tsx — v4 (globals-driven)

import { SignUp as ClerkSignUp } from '@clerk/nextjs';

// Cast: Clerk v6 types; localization lives on ClerkProvider (app/layout.tsx)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SignUp = ClerkSignUp as React.ComponentType<any>;

// ── Component ───────────────────────────────────────────────────
export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const { plan }    = await searchParams;
  const redirectUrl = plan ? `/onboarding?plan=${plan}` : '/onboarding';

  return (
    <div className="auth-variant-emerald w-full">

      {/* ── Header ──────────────────────────────────────── */}
      <div className="text-center mb-7">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-3"
          style={{ background:'rgba(16,185,129,.08)', border:'1px solid rgba(16,185,129,.2)' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/>
          <span className="text-[10px] font-semibold tracking-widest text-emerald-600 uppercase">
            Mulai Gratis Sekarang
          </span>
        </div>
        <h2 className="text-2xl font-extrabold tracking-tight leading-snug text-slate-900 mb-1.5"
          style={{ fontFamily:'var(--font-headline)' }}>
          Buka{' '}
          <span style={{ background:'linear-gradient(125deg,#10b981,#0ea5e9)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
            Pintu Karir ASN
          </span>
          {' '}Anda
        </h2>
        <p className="text-[0.82rem] text-slate-500">
          Daftar gratis dan mulai persiapan CPNS hari ini
        </p>
      </div>

      {/* ── Clerk SignUp ─────────────────────────────────── */}
      {/* Styling is driven by app/globals.css (.cl-*) + appearance.variables.
          appearance.elements only hides Clerk-native header/footer. */}
      <SignUp
        forceRedirectUrl={redirectUrl}
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
            colorPrimary:         '#10b981',
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
          Sudah punya akun?{' '}
          <a href="/sign-in" className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors">
            Masuk sekarang
          </a>
        </p>
        <div className="flex items-center justify-center gap-4">
          <Chip color="#10b981" text="Gratis selamanya" />
          <Chip color="#0ea5e9" text="Data terenkripsi" />
          <Chip color="#f9bd22" text="12K+ peserta" />
        </div>
      </div>

    </div>
  );
}

// ── Small chip ─────────────────────────────────────────────────
function Chip({ color, text }: { color: string; text: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background:color }}/>
      <span className="text-[10.5px] text-slate-400">{text}</span>
    </div>
  );
}
