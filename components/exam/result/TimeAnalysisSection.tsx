'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface QuestionData {
  id: string;
  answered_at: string;
  time_spent_seconds: number | null;
  questions: {
    id: string;
    content: string | null;
    category: string;
  } | null;
}

interface TimeAnalysisSectionProps {
  answers: QuestionData[];
  attemptStartTime: string;
}

export default function TimeAnalysisSection({ answers, attemptStartTime }: TimeAnalysisSectionProps) {
  // Calculate time spent per question
  const questionsWithTime = useMemo(() => {
    return answers.map((answer, index) => {
      let timeSpent = answer.time_spent_seconds || 0;
      
      // Fallback: calculate from answered_at if time_spent_seconds is 0
      if (timeSpent === 0 && answer.answered_at) {
        const prevTime = index > 0 
          ? new Date(answers[index - 1].answered_at).getTime()
          : new Date(attemptStartTime).getTime();
        const currentTime = new Date(answer.answered_at).getTime();
        timeSpent = Math.round((currentTime - prevTime) / 1000);
      }
      
      return {
        questionNumber: index + 1,
        question: (answer.questions?.content || '').substring(0, 50) + '...',
        category: answer.questions?.category || '',
        timeSpent: Math.min(timeSpent, 600), // Cap at 10 minutes
      };
    });
  }, [answers, attemptStartTime]);

  // Get top 5 slowest
  const slowestQuestions = useMemo(() => {
    return [...questionsWithTime]
      .sort((a, b) => b.timeSpent - a.timeSpent)
      .slice(0, 5);
  }, [questionsWithTime]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'TWK': return 'bg-blue-100 text-blue-800';
      case 'TIU': return 'bg-green-100 text-green-800';
      case 'TKP': return 'bg-purple-100 text-purple-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  if (questionsWithTime.every(q => q.timeSpent === 0)) {
    return (
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Analisis Waktu Pengerjaan</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Data waktu pengerjaan belum tersedia
          </p>
        </CardContent>
      </Card>
    );
  }

  // Chart data
  const chartData = slowestQuestions.map(q => ({
    soal: `Soal ${q.questionNumber}`,
    waktu: q.timeSpent,
  }));

  return (
    <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>5 Soal Terlama</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="soal" />
              <YAxis label={{ value: 'Detik', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                formatter={(value: number) => [`${formatTime(value)}`, 'Waktu']}
              />
              <Bar dataKey="waktu" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* List */}
      <Card>
        <CardHeader>
          <CardTitle>Detail Soal Terlama</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {slowestQuestions.map((q, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">Soal #{q.questionNumber}</span>
                  <Badge className={getCategoryColor(q.category)}>
                    {q.category}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{q.question}</p>
                <div className="text-sm font-medium text-orange-600">
                  Waktu: {formatTime(q.timeSpent)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
