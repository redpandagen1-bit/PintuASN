'use client';

import { useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AttemptHistoryCard } from '@/components/shared/attempt-history-card';
import { Button } from '@/components/ui/button';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  History, 
  TrendingUp, 
  Calendar,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import type { AttemptHistoryData, UserStats } from '@/lib/supabase/queries';

interface HistoryContentProps {
  initialHistory: AttemptHistoryData;
  initialStats: UserStats;
  initialSort: 'newest' | 'oldest' | 'highest_score';
  initialFilter: 'all' | 'passed' | 'failed';
}

export default function HistoryContent({ 
  initialHistory, 
  initialStats,
  initialSort,
  initialFilter
}: HistoryContentProps) {
  const [sort, setSort] = useState(initialSort);
  const [filter, setFilter] = useState(initialFilter);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateURL = (newSort: string, newFilter: string, newPage: number = 1) => {
    const params = new URLSearchParams(searchParams);
    params.set('sort', newSort);
    params.set('filter', newFilter);
    params.set('page', newPage.toString());
    
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSortChange = (value: string) => {
    const newSort = value as 'newest' | 'oldest' | 'highest_score';
    setSort(newSort);
    updateURL(newSort, filter);
  };

  const handleFilterChange = (value: string) => {
    const newFilter = value as 'all' | 'passed' | 'failed';
    setFilter(newFilter);
    updateURL(sort, newFilter);
  };

  const handlePageChange = (page: number) => {
    updateURL(sort, filter, page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const sortOptions = [
    { value: 'newest', label: 'Terbaru', icon: Calendar },
    { value: 'oldest', label: 'Tertua', icon: Clock },
    { value: 'highest_score', label: 'Skor Tertinggi', icon: TrendingUp },
  ];

  const filterOptions = [
    { value: 'all', label: 'Semua' },
    { value: 'passed', label: 'Lulus' },
    { value: 'failed', label: 'Tidak Lulus' },
  ];

  const getPaginationItems = () => {
    const items = [];
    const { currentPage, totalPages } = initialHistory;

    // Previous
    items.push(
      <PaginationItem key="prev">
        <PaginationPrevious 
          onClick={() => handlePageChange(currentPage - 1)}
          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
        />
      </PaginationItem>
    );

    // Show first page
    if (currentPage > 3) {
      items.push(
        <PaginationItem key="first">
          <PaginationLink 
            onClick={() => handlePageChange(1)}
            className="cursor-pointer"
          >
            1
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Ellipsis
    if (currentPage > 4) {
      items.push(
        <PaginationItem key="ellipsis-start">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Show pages around current page
    const startPage = Math.max(1, Math.min(totalPages - 4, currentPage - 2));
    const endPage = Math.min(totalPages, Math.max(5, currentPage + 2));

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => handlePageChange(i)}
            isActive={i === currentPage}
            className="cursor-pointer"
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Ellipsis
    if (currentPage < totalPages - 3) {
      items.push(
        <PaginationItem key="ellipsis-end">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Show last page
    if (currentPage < totalPages - 2) {
      items.push(
        <PaginationItem key="last">
          <PaginationLink 
            onClick={() => handlePageChange(totalPages)}
            className="cursor-pointer"
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Next
    items.push(
      <PaginationItem key="next">
        <PaginationNext 
          onClick={() => handlePageChange(currentPage + 1)}
          className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
        />
      </PaginationItem>
    );

    return items;
  };

  if (initialHistory.attempts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <History className="h-8 w-8 text-slate-600" />
            <h1 className="text-3xl font-bold text-slate-900">Riwayat Percobaan</h1>
          </div>
          
          <div className="grid grid-cols-2 gap-4 max-w-md">
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <div className="text-2xl font-bold text-slate-900">{initialStats.totalAttempts}</div>
              <div className="text-sm text-slate-600">Total Percobaan</div>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{initialStats.bestScore}</div>
              <div className="text-sm text-slate-600">Skor Terbaik</div>
            </div>
          </div>
        </div>

        {/* Empty State */}
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-32 h-32 bg-slate-100 rounded-full flex items-center justify-center mb-6">
            <History className="h-16 w-16 text-slate-400" />
          </div>
          <h2 className="text-2xl font-semibold text-slate-900 mb-2">Belum ada percobaan</h2>
          <p className="text-slate-600 mb-6">Mulai tryout pertama Anda untuk melihat riwayat di sini</p>
          <Button asChild>
            <Link href="/packages">
              <Clock className="h-4 w-4 mr-2" />
              Mulai Tryout
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <History className="h-8 w-8 text-slate-600" />
          <h1 className="text-3xl font-bold text-slate-900">Riwayat Percobaan</h1>
        </div>
        
        <div className="grid grid-cols-2 gap-4 max-w-md">
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <div className="text-2xl font-bold text-slate-900">{initialStats.totalAttempts}</div>
            <div className="text-sm text-slate-600">Total Percobaan</div>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{initialStats.bestScore}</div>
            <div className="text-sm text-slate-600">Skor Terbaik</div>
          </div>
        </div>
      </div>

      {/* Filters and Sorting */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700">Urutkan:</span>
          <Select value={sort} onValueChange={handleSortChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <option.icon className="h-4 w-4" />
                    {option.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700">Filter:</span>
          <Select value={filter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {filterOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="text-sm text-slate-600">
          Menampilkan {initialHistory.attempts.length} dari {initialHistory.totalCount} percobaan
        </div>
      </div>

      {/* Attempts List */}
      <div className="space-y-6 mb-8">
        {initialHistory.attempts.map((attempt) => (
          <AttemptHistoryCard 
            key={attempt.id} 
            attempt={attempt} 
          />
        ))}
      </div>

      {/* Pagination */}
      {initialHistory.totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              {getPaginationItems()}
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}