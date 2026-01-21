import { redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { OnboardingForm } from '@/components/auth/onboarding-form';

export default async function OnboardingPage() {
  const user = await currentUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  // Check if profile already complete
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, phone, date_of_birth, gender, profile_completed')
    .eq('user_id', user.id)
    .single();

  // If profile is completed, redirect to dashboard
  if (profile?.profile_completed === true) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Lengkapi Profil Anda</h1>
          <p className="text-muted-foreground mt-2">
            Sebelum memulai, lengkapi data diri Anda
          </p>
        </div>
        
        <OnboardingForm 
          userId={user.id} 
          defaultName={user.firstName || ''}
        />
      </div>
    </div>
  );
}