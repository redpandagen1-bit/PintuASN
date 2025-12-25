import { Suspense } from 'react';
import { getReviewData } from '@/lib/supabase/queries';
import ReviewContent from './review-content';

export default async function ReviewPage({ 
  params 
}: { 
  params: Promise<{ attemptId: string }> // ✅ FIXED: Promise wrapper
}) {
  const { attemptId } = await params; // ✅ FIXED: Await params
  const reviewData = await getReviewData(attemptId);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReviewContent reviewData={reviewData} />
    </Suspense>
  );
}