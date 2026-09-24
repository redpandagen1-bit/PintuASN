import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getReviewDataAdmin, getUserTier } from '@/lib/supabase/queries';
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
  let isPlatinum = false;
  try {
    const [data, tier] = await Promise.all([
      getReviewDataAdmin(attemptId, userId),
      getUserTier(userId),
    ]);
    reviewData = data;
    isPlatinum = tier === 'platinum';
  } catch (err) {
    console.error('[ReviewPage] Failed to load review data:', err);
    redirect('/history');
    // redirect() throws internally so the lines below never execute in this branch
    return null;
  }

  // Waktu pengerjaan per soal = fitur Platinum.
  // Rata-rata dihitung di server; untuk non-Platinum datanya dikosongkan
  // sebelum dikirim ke client agar tidak bisa dibaca lewat DevTools.
  const timed = reviewData.questions
    .map(q => q.timeSpentSeconds ?? 0)
    .filter(t => t > 0);
  const avgTimeSeconds = isPlatinum && timed.length
    ? Math.round(timed.reduce((a, b) => a + b, 0) / timed.length)
    : null;

  if (!isPlatinum) {
    reviewData = {
      ...reviewData,
      questions: reviewData.questions.map(q => ({
        ...q,
        timeSpentSeconds: null,
        userAnswer: q.userAnswer ? { ...q.userAnswer, time_spent_seconds: null } : null,
      })),
    };
  }

  const timeProps = { isPlatinum, avgTimeSeconds };

  return (
    <>
      <MobilePageWrapper>
        <MobilePembahasan reviewData={reviewData} {...timeProps} />
      </MobilePageWrapper>
      <div className="hidden md:block">
        <ReviewContent reviewData={reviewData} {...timeProps} />
      </div>
    </>
  );
}