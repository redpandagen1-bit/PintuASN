import { redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';
import Image from 'next/image';
import { createAdminClient } from '@/lib/supabase/server';
import OnboardingFullForm from '@/components/onboarding/onboarding-full-form';

export default async function OnboardingPage() {
  const user = await currentUser();
  if (!user) redirect('/sign-in');

  const supabase = await createAdminClient();
  const email = user.emailAddresses?.[0]?.emailAddress || '';
  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();

  // If user already completed onboarding, skip to dashboard
  const { data: existing } = await supabase
    .from('profiles')
    .select('onboarding_completed')
    .eq('user_id', user.id)
    .single();

  if (existing?.onboarding_completed === true) redirect('/dashboard');

  // Upsert profile so the row always exists before the form tries to PATCH
  await supabase.from('profiles').upsert(
    {
      user_id: user.id,
      email,
      full_name: fullName || null,
      role: 'user',
      subscription_tier: 'free',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id', ignoreDuplicates: true }
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">

      {/* Logo */}
      <div className="mb-8">
        <Image
          src="/images/logo-navbar.svg"
          alt="PintuASN"
          width={120}
          height={38}
          unoptimized
          priority
        />
      </div>

      {/* Card */}
      <div className="w-full max-w-2xl bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-800">Lengkapi Profil Anda</h1>
          <p className="text-sm text-slate-500 mt-1">
            Isi data diri berikut sebelum mulai belajar. Anda bisa mengubahnya kapan saja di halaman profil.
          </p>
        </div>

        <div className="h-px bg-slate-100 mb-6" />

        <OnboardingFullForm email={email} defaultName={fullName} />
      </div>

    </div>
  );
}
