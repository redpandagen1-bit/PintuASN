'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ChevronDown, ChevronUp, Navigation, Check, Flag, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { QuestionWithChoices } from '@/types/exam';

interface QuestionNavigatorProps {
  questions: QuestionWithChoices[];
  currentIndex: number;
  answers: Map<string, string>;
  flaggedQuestions: Set<string>;
  onNavigate: (index: number) => void;
}

interface CategorySection {
  name: string;
  label: string;
  start: number;
  end: number;
  color: string;
}

const categories: CategorySection[] = [
  { name: 'twk', label: 'TWK', start: 1, end: 30, color: 'blue' },
  { name: 'tiu', label: 'TIU', start: 31, end: 65, color: 'green' },
  { name: 'tkp', label: 'TKP', start: 66, end: 110, color: 'purple' },
];

function CategorySection({
  category,
  questions,
  currentIndex,
  answers,
  flaggedQuestions,
  onNavigate,
  isMobile = false,
}: {
  category: CategorySection;
  questions: QuestionWithChoices[];
  currentIndex: number;
  answers: Map<string, string>;
  flaggedQuestions: Set<string>;
  onNavigate: (index: number) => void;
  isMobile?: boolean;
}) {
  const categoryQuestions = questions.slice(category.start - 1, category.end);
  const answeredCount = categoryQuestions.filter((q, index) => 
    answers.has(q.id)
  ).length;
  
  const gridCols = isMobile ? 'grid-cols-5' : 'grid-cols-5';

  return (
    <AccordionItem value={category.name}>
      <AccordionTrigger className="px-4 py-3 bg-slate-50 hover:bg-slate-100">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-900">
            {category.label}
          </span>
          <Badge variant="secondary" className="text-xs">
            {answeredCount}/{category.end - category.start + 1}
          </Badge>
        </div>
      </AccordionTrigger>
      <AccordionContent className="p-4">
        <div className={cn('grid gap-2', gridCols)}>
          {categoryQuestions.map((q, index) => {
            const globalIndex = category.start - 1 + index;
            const questionId = q.id;
            const isAnswered = answers.has(questionId);
            const isFlagged = flaggedQuestions.has(questionId);
            const isCurrent = globalIndex === currentIndex;

            return (
              <button
                key={questionId}
                data-question-index={globalIndex}
                onClick={() => onNavigate(globalIndex)}
                className={cn(
                  "relative aspect-square rounded-md border-2 font-semibold text-sm transition-all hover:scale-105",
                  isCurrent && "border-green-600 bg-green-100 text-green-800 font-bold",
                  !isCurrent && isAnswered && isFlagged && "border-yellow-600 bg-yellow-100 text-yellow-800",
                  !isCurrent && isAnswered && !isFlagged && "border-blue-600 bg-blue-100 text-blue-800",
                  !isCurrent && !isAnswered && isFlagged && "border-yellow-400 bg-yellow-50 text-yellow-700",
                  !isCurrent && !isAnswered && !isFlagged && "border-slate-300 bg-white text-slate-600"
                )}
              >
                {globalIndex + 1}
                {isFlagged && !isCurrent && (
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-yellow-500 rounded-full"></div>
                )}
              </button>
            );
          })}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

function Legend() {
  return (
    <div className="space-y-2 text-sm">
      <h4 className="font-semibold text-slate-900 mb-2">Legenda:</h4>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded border-2 border-green-600 bg-green-100"></div>
        <span className="text-slate-700">Soal Ini</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded border-2 border-blue-600 bg-blue-100"></div>
        <span className="text-slate-700">Dijawab</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded border-2 border-yellow-400 bg-yellow-50"></div>
        <span className="text-slate-700">Ditandai</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded border-2 border-slate-300 bg-white"></div>
        <span className="text-slate-700">Belum Dijawab</span>
      </div>
    </div>
  );
}

export function QuestionNavigator({
  questions,
  currentIndex,
  answers,
  flaggedQuestions,
  onNavigate,
}: QuestionNavigatorProps) {
  const totalAnswered = answers.size;
  const totalQuestions = questions.length;

  // Smooth scroll to current question when currentIndex changes
  useEffect(() => {
    const currentElement = document.querySelector(`[data-question-index="${currentIndex}"]`);
    if (currentElement) {
      currentElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'nearest',
        inline: 'nearest'
      });
    }
  }, [currentIndex]);

  // Desktop Sidebar
  const DesktopSidebar = () => (
    <div className="hidden lg:block w-80 bg-white border-l border-slate-200 overflow-y-auto">
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Navigation className="h-5 w-5 text-slate-600" />
          <h2 className="text-lg font-semibold text-slate-900">
            Navigasi Soal
          </h2>
        </div>

        {/* Stats */}
        <div className="bg-slate-50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Total Dijawab:</span>
            <Badge variant="outline" className="font-semibold">
              {totalAnswered}/{totalQuestions}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Ditandai:</span>
            <Badge variant="outline" className="font-semibold">
              {flaggedQuestions.size}
            </Badge>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${(totalAnswered / totalQuestions) * 100}%` }}
            />
          </div>
        </div>

        {/* Category Sections */}
        <Accordion type="multiple" defaultValue={["twk", "tiu", "tkp"]}>
          {categories.map((category) => (
            <CategorySection
              key={category.name}
              category={category}
              questions={questions}
              currentIndex={currentIndex}
              answers={answers}
              flaggedQuestions={flaggedQuestions}
              onNavigate={onNavigate}
            />
          ))}
        </Accordion>

        {/* Legend */}
        <div className="pt-4 border-t border-slate-200">
          <Legend />
        </div>
      </div>
    </div>
  );

  // Mobile Bottom Sheet
  const MobileBottomSheet = () => (
    <div className="lg:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="w-full max-w-xs mx-auto block mb-2"
          >
            <Navigation className="h-4 w-4 mr-2" />
            Navigasi Soal
            <Badge variant="secondary" className="ml-2">
              {totalAnswered}/{totalQuestions}
            </Badge>
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5" />
              Navigasi Soal
            </SheetTitle>
            <SheetDescription>
              {totalAnswered} dari {totalQuestions} soal telah dijawab
            </SheetDescription>
          </SheetHeader>
          
          <div className="mt-4 space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-blue-600">{totalAnswered}</div>
                <div className="text-xs text-slate-600">Dijawab</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-yellow-600">{flaggedQuestions.size}</div>
                <div className="text-xs text-slate-600">Ditandai</div>
              </div>
            </div>

            {/* Category Sections */}
            <Accordion type="multiple" defaultValue={["twk", "tiu", "tkp"]}>
              {categories.map((category) => (
                <CategorySection
                  key={category.name}
                  category={category}
                  questions={questions}
                  currentIndex={currentIndex}
                  answers={answers}
                  flaggedQuestions={flaggedQuestions}
                  onNavigate={onNavigate}
                  isMobile={true}
                />
              ))}
            </Accordion>

            {/* Legend */}
            <div className="pt-4 border-t border-slate-200">
              <Legend />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );

  return (
    <>
      <DesktopSidebar />
      <MobileBottomSheet />
    </>
  );
}
