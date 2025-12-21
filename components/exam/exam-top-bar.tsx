'use client';

import { Clock, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TimerDisplay {
  formatted: string;
  isWarning: boolean;
}

interface ExamTopBarProps {
  timer: TimerDisplay;
  packageTitle: string;
  onSubmit: () => void;
  isSaving: boolean;
}

export function ExamTopBar({
  timer,
  packageTitle,
  onSubmit,
  isSaving,
}: ExamTopBarProps) {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="w-full px-4 py-3">
        {/* Desktop Layout */}
        <div className="hidden lg:flex items-center justify-between">
          {/* Left: Timer */}
          <div className="flex items-center gap-2">
            <Clock className={cn(
              "h-5 w-5",
              timer.isWarning ? "text-red-600" : "text-slate-600"
            )} />
            <span className={cn(
              "font-mono text-lg font-semibold",
              timer.isWarning ? "text-red-600" : "text-slate-900"
            )}>
              {timer.formatted}
            </span>
            {timer.isWarning && (
              <Badge variant="destructive" className="ml-2">
                Segera Habis!
              </Badge>
            )}
          </div>

          {/* Center: Package Title */}
          <h1 className="text-lg font-semibold text-slate-900 truncate max-w-md">
            {packageTitle}
          </h1>

          {/* Right: Saving Indicator + Submit Button */}
          <div className="flex items-center gap-3">
            {isSaving && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Menyimpan...</span>
              </div>
            )}
            <Button
              onClick={onSubmit}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Submit Ujian
            </Button>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden">
          <div className="flex items-center justify-between">
            {/* Left: Timer */}
            <div className="flex items-center gap-2">
              <Clock className={cn(
                "h-4 w-4",
                timer.isWarning ? "text-red-600" : "text-slate-600"
              )} />
              <span className={cn(
                "font-mono text-base font-semibold",
                timer.isWarning ? "text-red-600" : "text-slate-900"
              )}>
                {timer.formatted}
              </span>
              {timer.isWarning && (
                <Badge variant="destructive" className="text-xs">
                  !
                </Badge>
              )}
            </div>

            {/* Right: Saving Indicator + Submit Button */}
            <div className="flex items-center gap-2">
              {isSaving && (
                <Loader2 className="h-4 w-4 animate-spin text-slate-600" />
              )}
              <Button
                onClick={onSubmit}
                disabled={isSaving}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Submit
              </Button>
            </div>
          </div>

          {/* Package Title (hidden on mobile, shown separately in page) */}
          {packageTitle && (
            <div className="hidden">
              {/* This is intentionally hidden - package title should be shown in the page itself on mobile */}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
