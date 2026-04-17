import { Suspense } from 'react';
import { getReviewData } from '@/lib/supabase/queries';
import ReviewContent from './review-content';
import { MobilePageWrapper } from '@/components/mobile/MobilePageWrapper';
import { MobilePembahasan }  from '@/components/mobile/MobilePembahasan';

export default async function ReviewPage({ 
  params 
}: { 
  params: Promise<{ attemptId: string }> // ✅ FIXED: Promise wrapper
}) {
  const { attemptId } = await params; // ✅ FIXED: Await params
  const reviewData = await getReviewData(attemptId);

  return (
    <>
      <MobilePageWrapper>
        <MobilePembahasan reviewData={reviewData} />
      </MobilePageWrapper>
      <div className="hidden md:block">
        <Suspense fallback={<div>Loading...</div>}>
          <ReviewContent reviewData={reviewData} />
        </Suspense>
      </div>
    </>
  );
}