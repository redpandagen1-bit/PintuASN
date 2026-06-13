import Image from 'next/image';

export default function OnboardingLoading() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">

      {/* Logo */}
      <div className="mb-8">
        <Image
          src="/images/logo-navbar-sky.svg"
          alt="PintuASN"
          width={120}
          height={38}
          unoptimized
          priority
        />
      </div>

      {/* Spinner */}
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 rounded-full border-[3px] border-slate-200 border-t-sky-500 animate-spin" />
        <p className="text-sm text-slate-500">Menyiapkan profil Anda…</p>
      </div>

      {/* Card skeleton */}
      <div className="w-full max-w-2xl bg-white rounded-2xl border border-slate-100 shadow-sm p-8 mt-8">
        <div className="h-6 w-48 bg-slate-200 rounded animate-pulse mb-3" />
        <div className="h-4 w-full max-w-md bg-slate-100 rounded animate-pulse" />
        <div className="h-px bg-slate-100 my-6" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-11 w-full bg-slate-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>

    </div>
  );
}
