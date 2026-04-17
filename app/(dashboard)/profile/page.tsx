import { Suspense }           from 'react';
import { currentUser }        from '@clerk/nextjs/server';
import { getProfile, getUserStats } from '@/lib/supabase/queries';
import { createClient }       from '@/lib/supabase/server';
import ProfileContent         from './profile-content';
import { MobilePageWrapper }  from '@/components/mobile/MobilePageWrapper';
import { MobileProfile }      from '@/components/mobile/MobileProfile';

export default async function ProfilePage() {
  const user = await currentUser();
  if (!user) {
    throw new Error('User not found');
  }

  const userId = user.id;

  // Fetch profile — bisa null untuk akun baru
  let profile = await getProfile(userId);

  // Kalau profil belum ada (webhook belum jalan), buat otomatis
  if (!profile) {
    const supabase = await createClient();

    const primaryEmail = user.emailAddresses?.[0]?.emailAddress || null;
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || null;

    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .upsert(
        {
          user_id: userId,
          email: primaryEmail,
          full_name: fullName,
          role: 'user',
          subscription_tier: 'free',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single();

    if (createError) {
      console.error('Auto-create profile error:', createError);
      throw new Error('Gagal membuat profil. Silakan coba lagi.');
    }

    profile = newProfile;
  }

  // Fetch user statistics
  const stats = await getUserStats(userId);

  return (
    <>
      {/* ── Mobile ── */}
      <MobilePageWrapper>
        <MobileProfile
          initialProfile={profile!}
          initialStats={stats}
        />
      </MobilePageWrapper>

      {/* ── Desktop ── */}
      <div className="hidden md:block">
        <Suspense fallback={<div>Loading...</div>}>
          <ProfileContent
            initialProfile={profile!}
            initialStats={stats}
          />
        </Suspense>
      </div>
    </>
  );
}
