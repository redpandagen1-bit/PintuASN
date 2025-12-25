'use client';

import { useState } from 'react';
import { ProfileCard } from '@/components/shared/profile-card';
import { UserStatsCard } from '@/components/shared/user-stats-card';
import type { Profile } from '@/types/database';
import type { UserStats } from '@/lib/supabase/queries';

interface ProfileContentProps {
  initialProfile: Profile;
  initialStats: UserStats;
}

export default function ProfileContent({ 
  initialProfile, 
  initialStats 
}: ProfileContentProps) {
  const [profile, setProfile] = useState(initialProfile);

  const handleProfileUpdate = (updatedProfile: Profile) => {
    setProfile(updatedProfile);
    // Note: In a real app, you might want to refresh stats too
    // For now, we'll just update the profile
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile */}
        <div className="lg:col-span-1">
          <ProfileCard 
            profile={profile}
            onProfileUpdate={handleProfileUpdate}
          />
        </div>

        {/* Right Column - Statistics */}
        <div className="lg:col-span-2">
          <UserStatsCard
            totalAttempts={initialStats.totalAttempts}
            averageScore={initialStats.averageScore}
            bestScore={initialStats.bestScore}
            passRate={initialStats.passRate}
            recentAttempts={initialStats.recentAttempts}
          />
        </div>
      </div>
    </div>
  );
}
