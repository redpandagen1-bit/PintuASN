import { createClient } from '@/lib/supabase/server';
import { auth } from '@clerk/nextjs/server';

export type SubscriptionTier = 'free' | 'premium' | 'platinum';

export interface UserSubscription {
  tier: SubscriptionTier;
  subscriptionEnd: string | null;
  subscriptionStart: string | null;
  isActive: boolean;
  isPremium: boolean;
  isPlatinum: boolean;
}

/**
 * Ambil data subscription user yang sedang login
 * Gunakan ini di Server Components / API Routes
 */
export async function getUserSubscription(): Promise<UserSubscription | null> {
  try {
    const { userId } = await auth();
    if (!userId) return null;

    const supabase = await createClient();
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('subscription_tier, subscription_start, subscription_end')
      .eq('user_id', userId)
      .single();

    if (error || !profile) return null;

    const tier = (profile.subscription_tier as SubscriptionTier) || 'free';
    const subscriptionEnd = profile.subscription_end ?? null;

    // Cek apakah subscription masih aktif
    const isActive = tier !== 'free'
      ? subscriptionEnd ? new Date(subscriptionEnd) > new Date() : true
      : false;

    return {
      tier,
      subscriptionEnd,
      subscriptionStart: profile.subscription_start ?? null,
      isActive,
      isPremium: (tier === 'premium' || tier === 'platinum') && isActive,
      isPlatinum: tier === 'platinum' && isActive,
    };
  } catch (error) {
    console.error('getUserSubscription error:', error);
    return null;
  }
}

/**
 * Cek apakah user punya akses premium
 * Shorthand untuk penggunaan di banyak tempat
 */
export async function hasPreminumAccess(): Promise<boolean> {
  const sub = await getUserSubscription();
  return sub?.isPremium ?? false;
}