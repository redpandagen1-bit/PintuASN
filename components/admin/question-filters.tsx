'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

export function QuestionFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page'); // Reset to page 1
    router.push(`/admin/questions?${params.toString()}`);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Cari soal..."
          defaultValue={searchParams.get('search') || ''}
          onChange={(e) => {
            const timer = setTimeout(() => {
              updateFilter('search', e.target.value);
            }, 500);
            return () => clearTimeout(timer);
          }}
          className="pl-10"
        />
      </div>

      {/* Category Filter */}
      <Select
        defaultValue={searchParams.get('category') || 'all'}
        onValueChange={(value) => updateFilter('category', value)}
      >
        <SelectTrigger className="w-full md:w-40">
          <SelectValue placeholder="Kategori" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Kategori</SelectItem>
          <SelectItem value="TWK">TWK</SelectItem>
          <SelectItem value="TIU">TIU</SelectItem>
          <SelectItem value="TKP">TKP</SelectItem>
        </SelectContent>
      </Select>

      {/* Difficulty Filter */}
      <Select
        defaultValue={searchParams.get('difficulty') || 'all'}
        onValueChange={(value) => updateFilter('difficulty', value)}
      >
        <SelectTrigger className="w-full md:w-40">
          <SelectValue placeholder="Tingkat" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Tingkat</SelectItem>
          <SelectItem value="easy">Mudah</SelectItem>
          <SelectItem value="medium">Sedang</SelectItem>
          <SelectItem value="hard">Sulit</SelectItem>
        </SelectContent>
      </Select>

      {/* Status Filter */}
      <Select
        defaultValue={searchParams.get('status') || 'all'}
        onValueChange={(value) => updateFilter('status', value)}
      >
        <SelectTrigger className="w-full md:w-40">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Status</SelectItem>
          <SelectItem value="draft">Draft</SelectItem>
          <SelectItem value="published">Published</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}