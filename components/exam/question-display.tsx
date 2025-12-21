'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Flag } from 'lucide-react';

export interface QuestionWithChoices {
  id: string;
  category: string;
  content: string;
  image_url?: string;
  choices: Array<{
    id: string;
    label: string;
    content: string;
  }>;
}

interface QuestionDisplayProps {
  question: QuestionWithChoices;
  currentIndex: number;
  totalQuestions: number;
  selectedAnswer?: string;
  onAnswerSelect: (choiceId: string) => void;
  isFlagged: boolean;
  onToggleFlag: () => void;
}

export function QuestionDisplay({
  question,
  currentIndex,
  totalQuestions,
  selectedAnswer,
  onAnswerSelect,
  isFlagged,
  onToggleFlag
}: QuestionDisplayProps) {
  // Detect if all choices have short text for 2-column layout
  const hasShortText = question.choices.every(c => c.content.length < 50);
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        {/* Question Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Badge 
              variant="secondary"
              className={cn(
                "text-sm font-semibold px-3 py-1",
                question.category === 'TWK' && 'bg-blue-100 text-blue-800 border-blue-300',
                question.category === 'TIU' && 'bg-green-100 text-green-800 border-green-300',
                question.category === 'TKP' && 'bg-purple-100 text-purple-800 border-purple-300'
              )}
            >
              {question.category}
            </Badge>
            <span className="text-sm text-slate-600 font-medium">
              Soal {currentIndex + 1} dari {totalQuestions}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleFlag}
            className={cn(
              isFlagged && "text-orange-600 hover:text-orange-700"
            )}
          >
            <Flag className={cn("h-4 w-4", isFlagged && "fill-current")} />
          </Button>
        </div>

        {/* Question Content */}
        <div className="space-y-6">
          {/* Question Text */}
          <div className="text-base leading-relaxed text-slate-900 font-medium">
            {question.content}
          </div>

          {/* Question Image (if exists) */}
          {question.image_url && (
            <div className="flex justify-center">
              <img 
                src={question.image_url} 
                alt="Gambar soal"
                className="max-w-full h-auto rounded-lg border border-slate-200 shadow-sm"
                style={{ maxHeight: '300px', objectFit: 'contain' }}
              />
            </div>
          )}

          {/* Answer Choices */}
          <RadioGroup 
            value={selectedAnswer || ''} 
            onValueChange={onAnswerSelect}
            className={cn(
              "gap-3",
              hasShortText ? "grid grid-cols-1 md:grid-cols-2" : "space-y-3"
            )}
          >
            {question.choices.map((choice) => (
              <div key={choice.id}>
                <Label
                  htmlFor={choice.id}
                  className={cn(
                    "flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200",
                    "hover:border-slate-300 hover:bg-slate-50",
                    selectedAnswer === choice.id
                      ? "border-blue-600 bg-blue-50"
                      : "border-slate-200 bg-white"
                  )}
                >
                  <RadioGroupItem 
                    value={choice.id} 
                    id={choice.id}
                    className="mt-1"
                  />
                  <div className="flex items-start gap-3 flex-1">
                    <Badge 
                      variant="outline" 
                      className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                    >
                      {choice.label}
                    </Badge>
                    <div className="flex-1 text-slate-900 leading-relaxed text-left">
                      {choice.content}
                    </div>
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
}
