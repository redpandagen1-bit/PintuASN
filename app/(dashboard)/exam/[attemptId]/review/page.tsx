import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getReviewDataAdmin } from '@/lib/supabase/queries';
import ReviewContent from './review-content';
import { MobilePageWrapper } from '@/components/mobile/MobilePageWrapper';
import { MobilePembahasan }  from '@/components/mobile/MobilePembahasan';

export default async function ReviewPage({
  params
}: {
  params: Promise<{ attemptId: string }>
}) {
  // Auth guard — mobile PWA may not send Supabase cookies on direct navigation
  // Use Clerk userId + admin client to bypass RLS, validate ownership explicitly
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const { attemptId } = await params;

  // Explicit try-catch so any DB error redirects gracefully instead of crashing
  // (admin client bypasses RLS so this should never fail for a valid, owned attempt)
  let reviewData: Awaited<ReturnType<typeof getReviewDataAdmin>>;
  try {
    reviewData = await getReviewDataAdmin(attemptId, userId);
  } catch (err) {
    console.error('[ReviewPage] Failed to load review data:', err);
    redirect('/history');
    // redirect() throws internally so the lines below never execute in this branch
    return null;
  }

  return (
    <>
      <MobilePageWrapper>
        <MobilePembahasan reviewData={reviewData} />
      </MobilePageWrapper>
      <div className="hidden md:block">
        <ReviewContent reviewData={reviewData} />
      </div>
    </>
  );
}