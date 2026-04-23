// app/(auth)/sign-up/[[...sign-up]]/page.tsx — Sign-up v2 (Redesigned)

import { SignUp as ClerkSignUp } from '@clerk/nextjs';

// Cast to any to allow Clerk runtime props (localization) not yet typed in v6
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SignUp = ClerkSignUp as React.ComponentType<any>;

// ── Component ─────────────────────────────────────────────────

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const { plan }    = await searchParams;
  const redirectUrl = plan ? `/onboarding?plan=${plan}` : '/onboarding';

  return (
    <div className="w-full">

      {/* ── Header ─────────────────────────────────────── */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-3"
          style={{ background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.2)' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-semibold tracking-widest text-emerald-600 uppercase">
            Mulai Gratis Sekarang
          </span>
        </div>
        <h2 className="text-[1.55rem] font-extrabold tracking-tight leading-tight mb-1.5"
          style={{ fontFamily:'var(--font-headline)', color:'#0a1628' }}>
          Buka{' '}
          <span style={{ background:'linear-gradient(125deg,#10b981,#0ea5e9)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
            Pintu Karir ASN
          </span>
          {' '}Anda
        </h2>
        <p className="text-[0.83rem] text-slate-500">
          Daftar gratis dan mulai persiapan CPNS hari ini
        </p>
      </div>

      {/* ── Clerk SignUp ─────────────────────────────── */}
      <SignUp
        forceRedirectUrl={redirectUrl}
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
              'focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400',
              'hover:border-slate-300',
            ].join(' '),
            formFieldInputShowPasswordButton: 'text-slate-400 hover:text-slate-600',

            /* Primary button */
            formButtonPrimary: [
              'w-full h-11 rounded-xl',
              'text-white text-[0.875rem] font-semibold',
              'transition-all duration-200 shadow-md active:scale-[0.98]',
            ].join(' '),

            /* Footer */
            footerActionLink:  'text-emerald-600 hover:text-emerald-700 font-semibold transition-colors',
            footer:            'hidden',
            footerAction:      'hidden',

            /* Error */
            formFieldErrorText: 'text-[0.74rem] text-red-500 mt-1',
            alert:              'rounded-xl bg-red-50 border border-red-200 text-red-700 text-[0.79rem] p-3',

            /* Header (hidden — we use custom) */
            headerTitle:    'hidden',
            headerSubtitle: 'hidden',
            header:         'hidden',

            /* OTP */
            otpCodeFieldInput: [
              'w-10 h-12 rounded-xl border border-slate-200 bg-white',
              'text-center text-lg font-bold text-slate-800',
              'focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400',
            ].join(' '),

            /* Terms */
            footerActionText: 'text-[0.73rem] text-slate-400',
          },
          layout: {
            socialButtonsPlacement: 'top',
            logoPlacement:          'none',
          },
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
        localization={{
          formFieldLabel__emailAddress:       'Alamat Email',
          formFieldLabel__password:           'Kata Sandi',
          formFieldLabel__firstName:          'Nama Depan',
          formFieldLabel__lastName:           'Nama Belakang',
          formFieldPlaceholder__emailAddress: 'nama@email.com',
          formButtonPrimary:                  'Buat Akun Gratis',
          socialButtonsBlockButton__google:   'Daftar dengan Google',
        }}
      />

      {/* ── Footer link ─────────────────────────────── */}
      <p className="text-center text-[0.81rem] text-slate-500 mt-5">
        Sudah punya akun?{' '}
        <a href="/sign-in" className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors">
          Masuk sekarang
        </a>
      </p>

      {/* ── Trust indicators ─────────────────────────── */}
      <div className="flex items-center justify-center gap-3 mt-5 pt-4 border-t border-slate-100">
        <TrustChip color="#10b981" text="Gratis selamanya" />
        <Dot />
        <TrustChip color="#0ea5e9" text="Data terenkripsi" />
        <Dot />
        <TrustChip color="#f9bd22" text="50K+ peserta" />
      </div>

    </div>
  );
}

// ── Small helpers ──────────────────────────────────────────────

function Dot() {
  return <span className="text-slate-200 text-base leading-none">·</span>;
}

function TrustChip({ color, text }: { color: string; text: string }) {
  return (
    <div className="flex items-center gap-1">
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
      <span className="text-[10.5px] text-slate-400">{text}</span>
    </div>
  );
}
