'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Edit, Phone, Mail, Calendar } from 'lucide-react';
import type { Profile } from '@/types/database';
import { ProfileEditDialog } from './profile-edit-dialog';
import { AppIcon } from '@/components/shared/app-icon';

interface ProfileCardProps {
  profile: Profile;
  onProfileUpdate: (profile: Profile) => void;
}

type Tier = 'free' | 'premium' | 'platinum';

const TIER_CONFIG: Record<Tier, { iconFile: string; label: string; badgeClass: string }> = {
  free:     { iconFile: 'tier_gratis',   label: 'Member Gratis',   badgeClass: 'bg-slate-100 text-slate-600' },
  premium:  { iconFile: 'tier_premium',  label: 'Premium Member',  badgeClass: 'bg-yellow-100 text-yellow-700' },
  platinum: { iconFile: 'tier_platinum', label: 'Platinum Member', badgeClass: 'bg-purple-100 text-purple-700' },
};

export function ProfileCard({ profile, onProfileUpdate }: ProfileCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleProfileUpdate = (updatedProfile: Profile) => {
    onProfileUpdate(updatedProfile);
    setIsEditDialogOpen(false);
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  };

  const tier = (profile.subscription_tier as Tier) ?? 'free';
  const tierConfig = TIER_CONFIG[tier] ?? TIER_CONFIG.free;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Profil Saya</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">

          {/* Avatar and Basic Info */}
          <div className="flex flex-col items-center space-y-4">
            <Avatar
              className="h-24 w-24"
              src={profile.avatar_url}
              alt={profile.full_name || 'User'}
              fallback={getInitials(profile.full_name || '')}
            />

            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold text-slate-900">
                {profile.full_name || 'Belum ada nama'}
              </h2>

              {/* Role badge */}
              {profile.role && (
                <Badge variant={profile.role === 'admin' ? 'default' : 'secondary'}>
                  {profile.role === 'admin' ? 'Administrator' : 'Pengguna'}
                </Badge>
              )}

              {/* Tier badge dengan AppIcon */}
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${tierConfig.badgeClass}`}>
                <AppIcon name={tierConfig.iconFile} size={16} />
                {tierConfig.label}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-slate-600">
              <Mail className="h-4 w-4" />
              <span className="text-sm">{profile.email}</span>
            </div>

            {profile.phone && (
              <div className="flex items-center gap-3 text-slate-600">
                <Phone className="h-4 w-4" />
                <span className="text-sm">{profile.phone}</span>
              </div>
            )}

            <div className="flex items-center gap-3 text-slate-600">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">
                Bergabung sejak{' '}
                {new Date(profile.created_at).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>

          {/* Edit Profile Button */}
          <Button
            onClick={() => setIsEditDialogOpen(true)}
            className="w-full"
            variant="outline"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Profil
          </Button>
        </CardContent>
      </Card>

      <ProfileEditDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        profile={profile}
        onProfileUpdate={handleProfileUpdate}
      />
    </>
  );
}