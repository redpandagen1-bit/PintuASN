'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, Info } from 'lucide-react';
import type { ReviewQuestion, ReviewChoice } from '@/types/database';
import Image from 'next/image';

interface ReviewQuestionCardProps {
  question: ReviewQuestion;
}

export function ReviewQuestionCard({ question }: ReviewQuestionCardProps) {

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'TWK':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'TIU':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'TKP':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getChoiceStyling = (choice: ReviewChoice) => {
    const isUserAnswer = question.userChoice?.id === choice.id;
    const isCorrectAnswer = question.correctChoice?.id === choice.id;
    const isMaxScore = question.category === 'TKP' && choice.score === 5;

    let baseClass = "flex items-start gap-3 p-4 rounded-lg border-2 transition-all duration-200";

    if (question.category === 'TKP') {
      // For TKP questions
      if (isUserAnswer) {
        baseClass += " bg-yellow-50 border-yellow-300";
      } else if (isMaxScore) {
        baseClass += " bg-green-50 border-green-300";
      } else {
        baseClass += " border-slate-200 bg-white";
      }
    } else {
      // For TWK/TIU questions
      if (isUserAnswer && isCorrectAnswer) {
        baseClass += " bg-green-50 border-green-300";
      } else if (isUserAnswer && !isCorrectAnswer) {
        baseClass += " bg-red-50 border-red-300";
      } else if (isCorrectAnswer) {
        baseClass += " bg-green-50 border-green-300";
      } else {
        baseClass += " border-slate-200 bg-white";
      }
    }

    return baseClass;
  };

  const getStatusIndicator = () => {
    if (question.category === 'TKP') {
      return (
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">Poin: {question.score || 0}/5</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-2 text-sm">
          {question.isCorrect ? (
            <>
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-600">Benar</span>
            </>
          ) : (
            <>
              <XCircle className="h-4 w-4 text-red-600" />
              <span className="font-medium text-red-600">Salah</span>
            </>
          )}
        </div>
      );
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge 
              variant="secondary"
              className={cn("text-sm font-semibold px-3 py-1", getCategoryColor(question.category))}
            >
              {question.category}
            </Badge>
            <span className="text-sm text-slate-600 font-medium">
              Soal {question.position}
            </span>
            {getStatusIndicator()}
          </div>
          {question.isFlagged && (
            <Badge variant="outline" className="text-orange-600 border-orange-300">
              Ditandai
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Question Content */}
        <div className="space-y-4">
          <div className="text-base leading-relaxed text-slate-900 font-medium">
            {question.content}
          </div>

          {/* Question Image */}
          {question.image_url && (
            <div className="flex justify-center">
              <Image 
                src={question.image_url} 
                alt="Gambar soal"
                width={600}
                height={300}
                className="max-w-full h-auto rounded-lg border border-slate-200 shadow-sm"
                style={{ maxHeight: '300px', objectFit: 'contain' }}
              />
            </div>
          )}
        </div>

        {/* Answer Choices */}
        <div className="space-y-3">
          {question.choices.map((choice) => {
            const isUserAnswer = question.userChoice?.id === choice.id;
            const isCorrectAnswer = question.correctChoice?.id === choice.id;
            const isMaxScore = question.category === 'TKP' && choice.score === 5;

            return (
              <div key={choice.id} className={getChoiceStyling(choice)}>
                <Badge 
                  variant="outline" 
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                >
                  {choice.label}
                </Badge>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 text-slate-900 leading-relaxed">
                      {choice.content}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {question.category === 'TKP' && (
                        <Badge variant="outline" className="text-xs">
                          {choice.score || 1} poin
                        </Badge>
                      )}
                      {isUserAnswer && (
                        <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                          Jawaban Anda
                        </Badge>
                      )}
                      {isCorrectAnswer && question.category !== 'TKP' && (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                          Benar
                        </Badge>
                      )}
                      {isMaxScore && question.category === 'TKP' && (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                          Poin Maksimal
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Explanation Section */}
        {question.explanation && (
          <div className="border-t pt-4">
            <Accordion type="single" collapsible>
              <AccordionItem value="explanation" className="border-none">
                <AccordionTrigger className="py-2 text-left hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    <span>Lihat Pembahasan</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  <div className="space-y-4">
                    {/* Topic Tags */}
                    {question.topic && (
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs">
                          {question.topic}
                        </Badge>
                      </div>
                    )}
                    
                    {/* Explanation Content */}
                    <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed">
                      <div dangerouslySetInnerHTML={{ 
                        __html: question.explanation.replace(/\n/g, '<br />') 
                      }} />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
