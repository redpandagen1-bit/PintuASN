import { Suspense } from 'react';
import { currentUser } from '@clerk/nextjs/server';
import { getProfile, getUserStats } from '@/lib/supabase/queries';
import ProfileContent from './profile-content';

export default async function ProfilePage() {
  const user = await currentUser();
  if (!user) {
    throw new Error('User not found');
  }

  const userId = user.id;

  // Fetch profile data
  const profile = await getProfile(userId);
  
  // Fetch user statistics
  const stats = await getUserStats(userId);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProfileContent 
        initialProfile={profile}
        initialStats={stats}
      />
    </Suspense>
  );
}
