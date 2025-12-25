'use client';

import { useState, useMemo } from 'react';
import { ReviewQuestionCard } from '@/components/exam/review-question-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { ArrowLeft, Filter } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { ReviewData, ReviewFilter } from '@/types/database';

export default function ReviewContent({ reviewData }: { reviewData: ReviewData }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState<ReviewFilter>('all');
  
  const questionsPerPage = 10;

  // Filter questions based on selected filter
  const filteredQuestions = useMemo(() => {
    switch (activeFilter) {
      case 'all':
        return reviewData.questions;
      
      case 'incorrect':
        return reviewData.questions.filter(
          q => q.category !== 'TKP' && q.isCorrect === false
        );
      
      case 'low_score':
        return reviewData.questions.filter(
          q => q.category === 'TKP' && (q.score === null || q.score < 4)
        );
      
      case 'TWK':
        return reviewData.questions.filter(q => q.category === 'TWK');
      
      case 'TIU':
        return reviewData.questions.filter(q => q.category === 'TIU');
      
      case 'TKP':
        return reviewData.questions.filter(q => q.category === 'TKP');
      
      default:
        return reviewData.questions;
    }
  }, [reviewData.questions, activeFilter]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredQuestions.length / questionsPerPage);
  const startIndex = (currentPage - 1) * questionsPerPage;
  const endIndex = startIndex + questionsPerPage;
  const currentQuestions = filteredQuestions.slice(startIndex, endIndex);

  // Reset to page 1 when filter changes
  const handleFilterChange = (filter: ReviewFilter) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

  // Handle page change with scroll to top
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filterOptions: { value: ReviewFilter; label: string; count?: number }[] = [
    { value: 'all', label: 'Semua Soal', count: reviewData.questions.length },
    { value: 'incorrect', label: 'Salah Saja', count: reviewData.questions.filter(q => q.category !== 'TKP' && q.isCorrect === false).length },
    { value: 'low_score', label: 'Skor Rendah', count: reviewData.questions.filter(q => q.category === 'TKP' && (q.score === null || q.score < 4)).length },
    { value: 'TWK', label: 'TWK', count: reviewData.questions.filter(q => q.category === 'TWK').length },
    { value: 'TIU', label: 'TIU', count: reviewData.questions.filter(q => q.category === 'TIU').length },
    { value: 'TKP', label: 'TKP', count: reviewData.questions.filter(q => q.category === 'TKP').length },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Dashboard
            </Button>
          </Link>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              Pembahasan Soal
            </CardTitle>
            <div className="text-slate-600">
              {reviewData.attempt.packages?.title} - {new Date(reviewData.attempt.submitted_at || reviewData.attempt.started_at).toLocaleDateString('id-ID')}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {reviewData.questions.filter(q => q.category === 'TWK').length}
                </div>
                <div className="text-sm text-blue-600">Soal TWK</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {reviewData.questions.filter(q => q.category === 'TIU').length}
                </div>
                <div className="text-sm text-green-600">Soal TIU</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {reviewData.questions.filter(q => q.category === 'TKP').length}
                </div>
                <div className="text-sm text-purple-600">Soal TKP</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b pb-4 mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-slate-500" />
          <div className="flex gap-2 flex-wrap">
            {filterOptions.map((option) => (
              <Button
                key={option.value}
                variant={activeFilter === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => handleFilterChange(option.value)}
                className="flex items-center gap-2"
              >
                {option.label}
                <Badge variant="secondary" className="text-xs">
                  {option.count || 0}
                </Badge>
              </Button>
            ))}
          </div>
        </div>
        
        <div className="mt-3 text-sm text-slate-600">
          Menampilkan {currentQuestions.length} dari {filteredQuestions.length} soal
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-6 mb-8">
        {currentQuestions.length > 0 ? (
          currentQuestions.map((question) => (
            <ReviewQuestionCard key={question.id} question={question} />
          ))
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="text-slate-500 mb-4">
                Tidak ada soal yang cocok dengan filter yang dipilih
              </div>
              <Button 
                variant="outline" 
                onClick={() => handleFilterChange('all')}
              >
                Tampilkan Semua Soal
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={cn(
                    currentPage === 1 && "pointer-events-none opacity-50"
                  )}
                />
              </PaginationItem>
              
              {/* Show first page */}
              {currentPage > 3 && (
                <>
                  <PaginationItem>
                    <PaginationLink onClick={() => handlePageChange(1)}>
                      1
                    </PaginationLink>
                  </PaginationItem>
                  {currentPage > 4 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
                </>
              )}
              
              {/* Show pages around current page */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                if (pageNum > totalPages) return null;
                
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      onClick={() => handlePageChange(pageNum)}
                      isActive={currentPage === pageNum}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              {/* Show last page */}
              {currentPage < totalPages - 2 && (
                <>
                  {currentPage < totalPages - 3 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
                  <PaginationItem>
                    <PaginationLink onClick={() => handlePageChange(totalPages)}>
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>
                </>
              )}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={cn(
                    currentPage === totalPages && "pointer-events-none opacity-50"
                  )}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
