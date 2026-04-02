// ============================================================
// app/(dashboard)/materi/page.tsx
// ============================================================

import { Suspense }     from 'react';
import { currentUser } from '@clerk/nextjs/server';
import { getAllMaterials, getUserTier } from '@/lib/supabase/queries';
import MateriPageClient from './materi-client';
import { Skeleton }    from '@/components/ui/skeleton';

export interface Material {
  id:               string;
  title:            string;
  description:      string | null;
  category:         'TWK' | 'TIU' | 'TKP' | 'INFORMASI';
  type:             'video' | 'pdf';
  content_url:      string;
  tier:             'free' | 'premium' | 'platinum';
  duration_minutes: number | null;
  is_active:        boolean;
  is_new:           boolean;
  order_index:      number;
  created_at:       string;
}

// ─────────────────────────────────────────────────────────────

async function MateriContent() {
  const user = await currentUser();
  if (!user) throw new Error('User not found');

  // OPTIMASI: fetch semua materi + tier user secara paralel
  const [materials, userTier] = await Promise.all([
    getAllMaterials(),       // semua materi (tanpa filter tier)
    getUserTier(user.id),   // tier user untuk cek akses di client
  ]);

  return (
    <MateriPageClient
      materials={materials as Material[]}
      userTier={userTier}
    />
  );
}

// ─────────────────────────────────────────────────────────────

export default function MateriPage() {
  return (
    <Suspense fallback={<MateriSkeleton />}>
      <MateriContent />
    </Suspense>
  );
}

function MateriSkeleton() {
  return (
    <div className="space-y-6 pb-10">
      <Skeleton className="h-40 w-full rounded-2xl" />
      <Skeleton className="h-14 w-full rounded-2xl" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-slate-100 overflow-hidden">
            <Skeleton className="aspect-video w-full" />
            <div className="p-5 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-9 w-full mt-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}