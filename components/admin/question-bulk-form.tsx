'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Loader2, X, Save, ChevronLeft, ChevronRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface QuestionBulkFormProps {
  packageId: string;
  packageTitle: string;
}

type QuestionDraft = {
  number: number;
  category: 'TWK' | 'TIU' | 'TKP';
  content: string;
  image_url: string;
  explanation: string;
  explanation_image_url: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  choices: Array<{
    label: string;
    content: string;
    image_url?: string;
    is_answer: boolean;
    score: number | null;
  }>;
  status: 'empty' | 'incomplete' | 'complete';
  isExisting: boolean;
};

// Helper: Determine category from question number
function getCategoryFromNumber(num: number): 'TWK' | 'TIU' | 'TKP' {
  if (num >= 1 && num <= 30) return 'TWK';
  if (num >= 31 && num <= 65) return 'TIU';
  return 'TKP';
}

export function QuestionBulkForm({ packageId, packageTitle }: QuestionBulkFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentNumber, setCurrentNumber] = useState(1);
  const [drafts, setDrafts] = useState<Record<number, QuestionDraft>>({});
  const [imageFiles, setImageFiles] = useState<Record<string, File>>({});
  const draftsRef = useRef<Record<number, QuestionDraft>>({}); // ADD THIS

  const currentCategory = getCategoryFromNumber(currentNumber);
  const isTKP = currentCategory === 'TKP';
  const isTIU = currentCategory === 'TIU';

  // Load existing questions from database
  useEffect(() => {
    async function loadExistingQuestions() {
      try {
        const response = await fetch(`/api/admin/packages/${packageId}/questions`);
        if (!response.ok) throw new Error('Failed to load questions');

        const data = await response.json();
        const existingDrafts: Record<number, QuestionDraft> = {};

        console.log('📦 Raw data from API:', data);

        // Map existing questions to draft format
        data.questions.forEach((q: any) => {
          console.log(`📝 Processing question at position ${q.position}:`, q);

          const draft: QuestionDraft = {
            number: q.position,
            category: q.category,
            content: q.content || '',
            image_url: q.image_url || '',
            explanation: q.explanation || '', // FIXED: Make sure this is loaded
            explanation_image_url: q.explanation_image_url || '',
            topic: q.topic || '',
            difficulty: q.difficulty || 'medium',
            choices: Array.isArray(q.choices) ? q.choices.map((c: any) => ({
              label: c.label,
              content: c.content || '',
              image_url: c.image_url || '',
              is_answer: c.is_answer || false,
              score: c.score !== undefined && c.score !== null ? c.score : null,
            })) : [],
            status: 'complete',
            isExisting: true,
          };

          existingDrafts[q.position] = draft;
        });

        setDrafts(existingDrafts);
        draftsRef.current = existingDrafts; // ADD THIS LINE
        console.log(`✅ Loaded ${Object.keys(existingDrafts).length} existing questions`);
        console.log('📊 All drafts:', existingDrafts);
      } catch (error) {
        console.error('Error loading questions:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadExistingQuestions();
  }, [packageId]);

  // Get question status
  const getQuestionStatus = (draft: QuestionDraft): 'empty' | 'incomplete' | 'complete' => {
    if (!draft.content.trim()) return 'empty';

    const allChoicesFilled = draft.choices.every((c) => c.content.trim());
    if (!allChoicesFilled) return 'incomplete';

    const hasExplanation = draft.explanation.trim();
    if (!hasExplanation) return 'incomplete';

    // TWK/TIU: Must have exactly 1 correct answer
    if (draft.category !== 'TKP') {
      const correctCount = draft.choices.filter((c) => c.is_answer).length;
      if (correctCount !== 1) return 'incomplete';
    }

    // TKP: Must have all scores filled and unique
    if (draft.category === 'TKP') {
      const scores = draft.choices.map((c) => c.score);
      const hasNullScore = scores.some((s) => s === null);
      if (hasNullScore) return 'incomplete';

      const uniqueScores = new Set(scores.filter((s) => s !== null));
      if (uniqueScores.size !== 5) return 'incomplete';

      const allValid = scores.every((s) => s !== null && s >= 1 && s <= 5);
      if (!allValid) return 'incomplete';
    }

    return 'complete';
  };

  // Initialize or get current draft
  const getCurrentDraft = (): QuestionDraft => {
    // USE REF instead of state
    const existingDraft = draftsRef.current[currentNumber];

    if (existingDraft) {
      console.log(`🔍 Loading EXISTING draft for question #${currentNumber}`);
      console.log(`   - Explanation from draftsRef: "${existingDraft.explanation}"`);

      // Deep clone to avoid reference issues
      const cloned = {
        ...existingDraft,
        explanation: existingDraft.explanation || '', // Ensure never undefined
        choices: existingDraft.choices.map(c => ({ ...c })),
      };

      console.log(`   - Cloned explanation: "${cloned.explanation}"`);
      return cloned;
    }

    console.log(`🆕 Creating NEW draft for question #${currentNumber}`);

    return {
      number: currentNumber,
      category: currentCategory,
      content: '',
      image_url: '',
      explanation: '',
      explanation_image_url: '',
      topic: '',
      difficulty: 'medium',
      choices: [
        { label: 'A', content: '', image_url: '', is_answer: false, score: null },
        { label: 'B', content: '', image_url: '', is_answer: false, score: null },
        { label: 'C', content: '', image_url: '', is_answer: false, score: null },
        { label: 'D', content: '', image_url: '', is_answer: false, score: null },
        { label: 'E', content: '', image_url: '', is_answer: false, score: null },
      ],
      status: 'empty',
      isExisting: false,
    };
  };

  const [formData, setFormData] = useState<QuestionDraft>(() => {
    // Initialize with empty draft to avoid accessing drafts before load
    return {
      number: 1,
      category: 'TWK',
      content: '',
      image_url: '',
      explanation: '',
      explanation_image_url: '',
      topic: '',
      difficulty: 'medium',
      choices: [
        { label: 'A', content: '', image_url: '', is_answer: false, score: null },
        { label: 'B', content: '', image_url: '', is_answer: false, score: null },
        { label: 'C', content: '', image_url: '', is_answer: false, score: null },
        { label: 'D', content: '', image_url: '', is_answer: false, score: null },
        { label: 'E', content: '', image_url: '', is_answer: false, score: null },
      ],
      status: 'empty',
      isExisting: false,
    };
  });

  // Update form when changing question number OR when drafts change
  useEffect(() => {
    if (isLoading) return; // Don't update while loading

    const draft = getCurrentDraft();
    console.log(`✏️ Setting form data for question #${currentNumber}:`, draft);
    console.log(`   - Content exists: ${!!draft.content}`);
    console.log(`   - Explanation exists: ${!!draft.explanation}`);
    console.log(`   - Explanation length: ${draft.explanation.length}`);

    setFormData(draft);
  }, [currentNumber, isLoading]); // Remove drafts dependency

  // Calculate progress - USE REF
  const allDrafts = Object.values(draftsRef.current);
  const completedCount = allDrafts.filter((d) => d.status === 'complete').length;
  const incompleteCount = allDrafts.filter((d) => d.status === 'incomplete').length;
  const emptyCount = 110 - completedCount - incompleteCount;
  const progress = Math.round((completedCount / 110) * 100);

  // Save current draft before switching question
  const saveCurrentDraft = () => {
    console.log(`💾 Saving draft for question #${currentNumber}:`, formData);
    console.log(`   - Content exists: ${!!formData.content}`);
    console.log(`   - Explanation exists: ${!!formData.explanation}`);
    console.log(`   - Explanation value: "${formData.explanation.substring(0, 50)}..."`);

    const status = getQuestionStatus(formData);

    // Deep clone with explanation preserved
    const updatedDraft: QuestionDraft = {
      ...formData,
      explanation: formData.explanation || '', // Ensure explanation is never null/undefined
      choices: formData.choices.map(c => ({ ...c })),
      status,
    };

    console.log(`   - Updated draft explanation: "${updatedDraft.explanation.substring(0, 50)}..."`);

    setDrafts(prev => {
      const updated = { ...prev, [currentNumber]: updatedDraft };
      draftsRef.current = updated; // ADD THIS LINE
      console.log(`📊 Drafts after save:`, updated[currentNumber]);
      return updated;
    });
  };

  // Navigation with auto-save
  const goToQuestion = (num: number) => {
    saveCurrentDraft();
    setCurrentNumber(num);
  };

  const goToNext = () => {
    if (currentNumber < 110) goToQuestion(currentNumber + 1);
  };

  const goToPrev = () => {
    if (currentNumber > 1) goToQuestion(currentNumber - 1);
  };

  // Handle image upload for question
  const handleQuestionImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran file maksimal 5MB');
        return;
      }
      const key = `q${currentNumber}`;
      setImageFiles({ ...imageFiles, [key]: file });

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image_url: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle image upload for explanation (TIU only)
  const handleExplanationImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran file maksimal 5MB');
        return;
      }
      const key = `q${currentNumber}_explanation`;
      setImageFiles({ ...imageFiles, [key]: file });

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, explanation_image_url: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle image upload for choice (TIU only)
  const handleChoiceImageChange = (label: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran file maksimal 5MB');
        return;
      }
      const key = `q${currentNumber}_${label}`;
      setImageFiles({ ...imageFiles, [key]: file });

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          choices: formData.choices.map((c) =>
            c.label === label ? { ...c, image_url: reader.result as string } : c
          ),
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit all drafts
  const handleSubmitAll = async () => {
    saveCurrentDraft();

    const allDraftsAfterSave = { ...drafts, [currentNumber]: { ...formData, status: getQuestionStatus(formData) } };
    const completed = Object.values(allDraftsAfterSave).filter((d) => d.status === 'complete');

    if (completed.length === 0) {
      alert('Belum ada soal yang lengkap untuk disimpan');
      return;
    }

    if (!confirm(`Simpan ${completed.length} soal lengkap ke database?`)) {
      return;
    }

    setIsSaving(true);

    try {
      const uploadedUrls: Record<string, string> = {};

      for (const [key, file] of Object.entries(imageFiles)) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('packageId', packageId);

        const res = await fetch('/api/admin/upload/image', {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          const { url } = await res.json();
          uploadedUrls[key] = url;
        }
      }

      for (const draft of completed) {
        const questionImageUrl = uploadedUrls[`q${draft.number}`] || draft.image_url || '';
        const explanationImageUrl = uploadedUrls[`q${draft.number}_explanation`] || draft.explanation_image_url || '';

        const choices = draft.choices.map((c) => ({
          label: c.label,
          content: c.content,
          image_url: uploadedUrls[`q${draft.number}_${c.label}`] || c.image_url || '',
          is_answer: c.is_answer,
          score: c.score || (draft.category === 'TKP' ? 3 : 0),
        }));

        const response = await fetch('/api/admin/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            category: draft.category,
            content: draft.content,
            image_url: questionImageUrl,
            explanation: draft.explanation,
            explanation_image_url: explanationImageUrl,
            topic: draft.topic,
            difficulty: draft.difficulty,
            choices,
            package_id: packageId,
            position: draft.number,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(`Soal #${draft.number}: ${data.error}`);
        }
      }

      alert(`✅ Berhasil menyimpan ${completed.length} soal!`);
      router.push(`/admin/packages/${packageId}`);
      router.refresh();
    } catch (error: any) {
      alert('❌ ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-3 text-lg">Memuat soal...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/admin/packages/${packageId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-slate-900">Edit Soal Paket</h1>
          <p className="text-slate-600 mt-1">Paket: {packageTitle}</p>
        </div>
        <Button
          onClick={handleSubmitAll}
          disabled={isSaving || completedCount === 0}
          size="lg"
          className="gap-2"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <Save className="h-5 w-5" />
              Simpan Semua ({completedCount})
            </>
          )}
        </Button>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="py-3">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-3 text-sm">
                  <span className="font-medium text-slate-700">
                    Lengkap: <span className="text-blue-600">{completedCount}</span>
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="font-medium text-slate-700">
                    Belum Lengkap: <span className="text-red-600">{incompleteCount}</span>
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="font-medium text-slate-700">
                    Kosong: <span className="text-slate-600">{emptyCount}</span>
                  </span>
                </div>
                <p className="text-sm font-bold text-blue-900">{progress}%</p>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Layout: Form + Navigator */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
        {/* Left: Question Form */}
        <div className="space-y-4">
          {/* Navigation Buttons */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPrev}
              disabled={currentNumber === 1}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Sebelumnya
            </Button>
            <span className="text-lg font-bold text-slate-900">
              Soal #{currentNumber} - {currentCategory}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNext}
              disabled={currentNumber === 110}
              className="gap-2"
            >
              Selanjutnya
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6 space-y-4">
              {/* Difficulty & Topic */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="difficulty" className="text-sm">Tingkat Kesulitan</Label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(value: any) => setFormData({ ...formData, difficulty: value })}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Mudah</SelectItem>
                      <SelectItem value="medium">Sedang</SelectItem>
                      <SelectItem value="hard">Sulit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="topic" className="text-sm">Topik</Label>
                  <Input
                    id="topic"
                    placeholder="Contoh: Pancasila"
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    className="h-9"
                  />
                </div>
              </div>

              {/* Question Text */}
              <div className="space-y-2">
                <Label htmlFor="content" className="text-sm">
                  Pertanyaan <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="content"
                  placeholder="Tulis pertanyaan di sini..."
                  rows={3}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                />
              </div>

              {/* Question Image */}
              <div className="space-y-2">
                <Label className="text-sm">Upload Gambar Soal (Optional)</Label>
                <div className="flex items-start gap-3">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleQuestionImageChange}
                    className="h-9"
                  />
                  {formData.image_url && (
                    <div className="relative">
                      <img
                        src={formData.image_url}
                        alt="Preview"
                        className="w-20 h-20 object-cover rounded border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-1 -right-1 h-5 w-5"
                        onClick={() => {
                          setFormData({ ...formData, image_url: '' });
                          const key = `q${currentNumber}`;
                          const newFiles = { ...imageFiles };
                          delete newFiles[key];
                          setImageFiles(newFiles);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Choices */}
              <div className="space-y-3">
                <Label className="text-sm">
                  Pilihan Jawaban <span className="text-red-500">*</span>
                </Label>

                <div className="space-y-2">
                  {formData.choices.map((choice, index) => (
                    <div
                      key={choice.label}
                      className={cn(
                        'p-3 border-2 rounded-lg',
                        !isTKP && choice.is_answer && 'border-blue-500 bg-blue-50'
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 font-semibold text-xs shrink-0 mt-1">
                          {index + 1}
                        </span>

                        <div className="flex-1 space-y-2">
                          <Input
                            placeholder={`Pilihan ${choice.label}`}
                            value={choice.content}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                choices: formData.choices.map((c) =>
                                  c.label === choice.label ? { ...c, content: e.target.value } : c
                                ),
                              })
                            }
                            className="h-9"
                            required
                          />

                          {/* TIU: Image upload per choice */}
                          {isTIU && (
                            <div className="flex items-center gap-2">
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleChoiceImageChange(choice.label, e)}
                                className="text-xs h-8"
                              />
                              {choice.image_url && (
                                <img
                                  src={choice.image_url}
                                  alt={`Choice ${choice.label}`}
                                  className="w-12 h-12 object-cover rounded border"
                                />
                              )}
                            </div>
                          )}
                        </div>

                        {/* Radio/Score on the RIGHT */}
                        {!isTKP ? (
                          <RadioGroup
                            value={formData.choices.find((c) => c.is_answer)?.label || ''}
                            onValueChange={(label) =>
                              setFormData({
                                ...formData,
                                choices: formData.choices.map((c) => ({
                                  ...c,
                                  is_answer: c.label === label,
                                })),
                              })
                            }
                          >
                            <RadioGroupItem value={choice.label} className="mt-1" />
                          </RadioGroup>
                        ) : (
                          <div className="w-20">
                            <Label className="text-xs text-slate-600">
                              Skor <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              type="number"
                              min="1"
                              max="5"
                              placeholder="1-5"
                              value={choice.score === null ? '' : choice.score}
                              onChange={(e) => {
                                const val = e.target.value === '' ? null : parseInt(e.target.value);
                                setFormData({
                                  ...formData,
                                  choices: formData.choices.map((c) =>
                                    c.label === choice.label ? { ...c, score: val } : c
                                  ),
                                });
                              }}
                              className="h-9"
                              required
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* TKP: Score validation warning */}
                {isTKP && (() => {
                  const scores = formData.choices.map((c) => c.score).filter((s) => s !== null);
                  const uniqueScores = new Set(scores);
                  const hasDuplicate = scores.length > 0 && uniqueScores.size !== scores.length;

                  if (hasDuplicate) {
                    return (
                      <p className="text-xs text-red-600">
                        ⚠️ Setiap pilihan harus memiliki skor yang berbeda (1-5)
                      </p>
                    );
                  }
                })()}
              </div>

              {/* Explanation */}
              <div className="space-y-2">
                <Label htmlFor="explanation" className="text-sm">
                  Pembahasan <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="explanation"
                  placeholder="Penjelasan jawaban yang benar..."
                  rows={3}
                  value={formData.explanation}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                  required
                />
              </div>

              {/* Explanation Image (TIU only) */}
              {isTIU && (
                <div className="space-y-2">
                  <Label className="text-sm">Upload Gambar Pembahasan (Optional untuk TIU)</Label>
                  <div className="flex items-start gap-3">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleExplanationImageChange}
                      className="h-9"
                    />
                    {formData.explanation_image_url && (
                      <div className="relative">
                        <img
                          src={formData.explanation_image_url}
                          alt="Explanation"
                          className="w-20 h-20 object-cover rounded border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-1 -right-1 h-5 w-5"
                          onClick={() => {
                            setFormData({ ...formData, explanation_image_url: '' });
                            const key = `q${currentNumber}_explanation`;
                            const newFiles = { ...imageFiles };
                            delete newFiles[key];
                            setImageFiles(newFiles);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Question Navigator */}
        <div className="lg:sticky lg:top-4 lg:self-start">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Navigasi Soal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-6 gap-1">
                {Array.from({ length: 110 }, (_, i) => i + 1).map((num) => {
                  const draft = draftsRef.current[num]; // USE REF
                  const status = draft?.status || 'empty';
                  const isCurrent = num === currentNumber;

                  return (
                    <button
                      key={num}
                      onClick={() => goToQuestion(num)}
                      className={cn(
                        'h-8 w-full rounded text-xs font-semibold transition-all',
                        isCurrent && 'bg-slate-800 text-white ring-2 ring-slate-400',
                        !isCurrent && status === 'complete' && 'bg-blue-500 text-white',
                        !isCurrent && status === 'incomplete' && 'bg-red-500 text-white',
                        !isCurrent && status === 'empty' && 'bg-white text-slate-700 border border-slate-300',
                        'hover:opacity-80'
                      )}
                      title={`Soal ${num} - ${getCategoryFromNumber(num)} (${status})`}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4 text-xs text-slate-600">
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-slate-800 rounded"></div>
                  <span>Aktif</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span>Lengkap</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span>Belum Lengkap</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-white border border-slate-300 rounded"></div>
                  <span>Kosong</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}