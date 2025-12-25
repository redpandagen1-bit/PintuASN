'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface LoadingSkeletonProps {
  className?: string;
}

// Generic Card Skeleton
export function CardSkeleton({ className }: LoadingSkeletonProps) {
  return (
    <Card className={className}>
      <CardHeader className="space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="flex justify-between">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-16" />
        </div>
      </CardContent>
    </Card>
  );
}

// List Item Skeleton
export function ListItemSkeleton({ className }: LoadingSkeletonProps) {
  return (
    <div className={`flex items-center justify-between p-4 border rounded-lg ${className}`}>
      <div className="space-y-2 flex-1">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <Skeleton className="h-6 w-16" />
    </div>
  );
}

// Attempt History Card Skeleton
export function AttemptHistorySkeleton({ className }: LoadingSkeletonProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-3/4" />
            <div className="flex gap-4">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-12" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <div className="grid grid-cols-3 gap-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 flex-1" />
        </div>
      </CardContent>
    </Card>
  );
}

// Question Skeleton
export function QuestionSkeleton({ className }: LoadingSkeletonProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center gap-4 mb-6">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
      
      <div className="space-y-4">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-11/12" />
        <Skeleton className="h-5 w-4/5" />
      </div>
      
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Stats Card Skeleton
export function StatsCardSkeleton({ className }: LoadingSkeletonProps) {
  return (
    <div className={`grid grid-cols-2 gap-4 ${className}`}>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="text-center p-4 bg-slate-50 rounded-lg">
          <Skeleton className="h-8 w-16 mx-auto mb-2" />
          <Skeleton className="h-4 w-20 mx-auto" />
        </div>
      ))}
    </div>
  );
}

// Timer Skeleton
export function TimerSkeleton({ className }: LoadingSkeletonProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex gap-1">
        <Skeleton className="h-12 w-8 rounded" />
        <span className="text-2xl font-bold text-slate-900">:</span>
        <Skeleton className="h-12 w-8 rounded" />
        <span className="text-2xl font-bold text-slate-900">:</span>
        <Skeleton className="h-12 w-8 rounded" />
      </div>
    </div>
  );
}

// Profile Card Skeleton
export function ProfileCardSkeleton({ className }: LoadingSkeletonProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-center">Profil Saya</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="text-center space-y-2">
            <Skeleton className="h-6 w-32 mx-auto" />
            <Skeleton className="h-5 w-20 mx-auto" />
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
        
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  );
}

// Package Card Skeleton
export function PackageCardSkeleton({ className }: LoadingSkeletonProps) {
  return (
    <Card className={`hover:shadow-lg transition-shadow duration-200 ${className}`}>
      <CardHeader className="pb-3">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  );
}
