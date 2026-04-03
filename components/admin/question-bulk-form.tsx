'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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
import { ArrowLeft, Loader2, X, Save, ChevronLeft, ChevronRight, Info } from 'lucide-react';
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

function getCategoryFromNumber(num: number): 'TWK' | 'TIU' | 'TKP' {
  if (num >= 1 && num <= 30) return 'TWK';
  if (num >= 31 && num <= 65) return 'TIU';
  return 'TKP';
}

// ── Helpers ─────────────────────────────────────────────────────────────
/** Apakah choice dianggap "terisi" — ada text ATAU ada gambar */
function isChoiceFilled(choice: { content: string; image_url?: string }): boolean {
  return !!(choice.content.trim() || choice.image_url);
}

/** Buat preview URL dari File tanpa menyimpan base64 ke state besar */
function createPreview(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
}

export function QuestionBulkForm({ packageId, packageTitle }: QuestionBulkFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentNumber, setCurrentNumber] = useState(1);
  const [drafts, setDrafts] = useState<Record<number, QuestionDraft>>({});
  // imageFiles hanya simpan File object — BUKAN base64
  const [imageFiles, setImageFiles] = useState<Record<string, File>>({});
  // imagePreviews simpan base64 hanya untuk tampilan preview
  const [imagePreviews, setImagePreviews] = useState<Record<string, string>>({});
  const draftsRef = useRef<Record<number, QuestionDraft>>({});

  const currentCategory = getCategoryFromNumber(currentNumber);
  const isTKP = currentCategory === 'TKP';
  const isTIU = currentCategory === 'TIU';

  // ── Load existing questions ──────────────────────────────────────────
  useEffect(() => {
    async function loadExistingQuestions() {
      try {
        const response = await fetch(`/api/admin/packages/${packageId}/questions`);
        if (!response.ok) throw new Error('Failed to load questions');
        const data = await response.json();
        const existingDrafts: Record<number, QuestionDraft> = {};

        data.questions.forEach((q: any) => {
          existingDrafts[q.position] = {
            number: q.position,
            category: q.category,
            content: q.content || '',
            image_url: q.image_url || '',
            explanation: q.explanation || '',
            explanation_image_url: q.explanation_image_url || '',
            topic: q.topic || '',
            difficulty: q.difficulty || 'medium',
            choices: Array.isArray(q.choices) ? q.choices.map((c: any) => ({
              label: c.label,
              content: c.content || '',
              image_url: c.image_url || '',
              is_answer: c.is_answer || false,
              score: c.score ?? null,
            })) : [],
            status: 'complete',
            isExisting: true,
          };
        });

        setDrafts(existingDrafts);
        draftsRef.current = existingDrafts;
      } catch (error) {
        console.error('Error loading questions:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadExistingQuestions();
  }, [packageId]);

  // ── Status logic ─────────────────────────────────────────────────────
  const getQuestionStatus = useCallback((draft: QuestionDraft): 'empty' | 'incomplete' | 'complete' => {
    // Soal dianggap "ada" jika ada text ATAU gambar soal
    const hasQuestion = !!(draft.content.trim() || draft.image_url);
    if (!hasQuestion) return 'empty';

    // Semua choice harus terisi (text atau gambar)
    const allChoicesFilled = draft.choices.every(isChoiceFilled);
    if (!allChoicesFilled) return 'incomplete';

    const hasExplanation = draft.explanation.trim();
    if (!hasExplanation) return 'incomplete';

    if (draft.category !== 'TKP') {
      const correctCount = draft.choices.filter((c) => c.is_answer).length;
      if (correctCount !== 1) return 'incomplete';
    }

    if (draft.category === 'TKP') {
      const scores = draft.choices.map((c) => c.score);
      if (scores.some((s) => s === null)) return 'incomplete';
      const uniqueScores = new Set(scores.filter((s) => s !== null));
      if (uniqueScores.size !== 5) return 'incomplete';
      if (!scores.every((s) => s !== null && s >= 1 && s <= 5)) return 'incomplete';
    }

    return 'complete';
  }, []);

  // ── Form initialization ──────────────────────────────────────────────
  const makeEmptyDraft = useCallback((num: number): QuestionDraft => ({
    number: num,
    category: getCategoryFromNumber(num),
    content: '',
    image_url: '',
    explanation: '',
    explanation_image_url: '',
    topic: '',
    difficulty: 'medium',
    choices: ['A','B','C','D','E'].map(label => ({
      label, content: '', image_url: '', is_answer: false, score: null,
    })),
    status: 'empty',
    isExisting: false,
  }), []);

  const [formData, setFormData] = useState<QuestionDraft>(() => makeEmptyDraft(1));

  useEffect(() => {
    if (isLoading) return;
    const existing = draftsRef.current[currentNumber];
    setFormData(existing
      ? { ...existing, choices: existing.choices.map(c => ({ ...c })) }
      : makeEmptyDraft(currentNumber)
    );
  }, [currentNumber, isLoading, makeEmptyDraft]);

  // ── Auto explanation image — ikut gambar jawaban benar ──────────────
  /**
   * Ketika jawaban yang benar di-set dan pilihan tersebut punya image_url,
   * otomatis set explanation_image_url ke gambar itu.
   */
  const getCorrectChoiceImageUrl = (fd: QuestionDraft): string => {
    const correctChoice = fd.choices.find(c => c.is_answer);
    return correctChoice?.image_url || '';
  };

  // ── Progress calculation ─────────────────────────────────────────────
  const allDrafts = Object.values(draftsRef.current);
  const completedCount = allDrafts.filter(d => d.status === 'complete').length;
  const incompleteCount = allDrafts.filter(d => d.status === 'incomplete').length;
  const emptyCount = 110 - completedCount - incompleteCount;
  const progress = Math.round((completedCount / 110) * 100);

  // ── Save current draft ───────────────────────────────────────────────
  const saveCurrentDraft = useCallback(() => {
    const status = getQuestionStatus(formData);
    const updatedDraft: QuestionDraft = {
      ...formData,
      choices: formData.choices.map(c => ({ ...c })),
      status,
    };
    setDrafts(prev => {
      const updated = { ...prev, [currentNumber]: updatedDraft };
      draftsRef.current = updated;
      return updated;
    });
  }, [formData, currentNumber, getQuestionStatus]);

  const goToQuestion = (num: number) => {
    saveCurrentDraft();
    setCurrentNumber(num);
  };

  // ── Image handlers ───────────────────────────────────────────────────
  const handleQuestionImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('Ukuran file maksimal 5MB'); return; }
    const key = `q${currentNumber}`;
    const preview = await createPreview(file);
    setImageFiles(prev => ({ ...prev, [key]: file }));
    setImagePreviews(prev => ({ ...prev, [key]: preview }));
    setFormData(prev => ({ ...prev, image_url: preview }));
  };

  const handleChoiceImageChange = async (label: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('Ukuran file maksimal 5MB'); return; }
    const key = `q${currentNumber}_${label}`;
    const preview = await createPreview(file);
    setImageFiles(prev => ({ ...prev, [key]: file }));
    setImagePreviews(prev => ({ ...prev, [key]: preview }));

    setFormData(prev => {
      const updatedChoices = prev.choices.map(c =>
        c.label === label ? { ...c, image_url: preview } : c
      );
      // Auto-update explanation_image_url jika ini jawaban yang benar
      const isCorrect = prev.choices.find(c => c.label === label)?.is_answer;
      return {
        ...prev,
        choices: updatedChoices,
        explanation_image_url: isCorrect ? preview : prev.explanation_image_url,
      };
    });
  };

  const handleCorrectAnswerChange = (label: string) => {
    setFormData(prev => {
      const updatedChoices = prev.choices.map(c => ({ ...c, is_answer: c.label === label }));
      const correctChoice = updatedChoices.find(c => c.is_answer);
      // Auto-set explanation_image_url ke gambar jawaban yang benar
      const autoExplanationImage = correctChoice?.image_url || prev.explanation_image_url;
      return {
        ...prev,
        choices: updatedChoices,
        explanation_image_url: autoExplanationImage,
      };
    });
  };

  const removeQuestionImage = () => {
    const key = `q${currentNumber}`;
    setImageFiles(prev => { const n = { ...prev }; delete n[key]; return n; });
    setImagePreviews(prev => { const n = { ...prev }; delete n[key]; return n; });
    setFormData(prev => ({ ...prev, image_url: '' }));
  };

  const removeChoiceImage = (label: string) => {
    const key = `q${currentNumber}_${label}`;
    setImageFiles(prev => { const n = { ...prev }; delete n[key]; return n; });
    setImagePreviews(prev => { const n = { ...prev }; delete n[key]; return n; });
    setFormData(prev => {
      const updatedChoices = prev.choices.map(c =>
        c.label === label ? { ...c, image_url: '' } : c
      );
      // Jika jawaban benar dihapus gambarnya, clear explanation_image_url
      const wasCorrect = prev.choices.find(c => c.label === label)?.is_answer;
      return {
        ...prev,
        choices: updatedChoices,
        explanation_image_url: wasCorrect ? '' : prev.explanation_image_url,
      };
    });
  };

  // ── Submit all ───────────────────────────────────────────────────────
  const handleSubmitAll = async () => {
    saveCurrentDraft();
    const allDraftsAfterSave = {
      ...draftsRef.current,
      [currentNumber]: { ...formData, status: getQuestionStatus(formData) },
    };
    const completed = Object.values(allDraftsAfterSave).filter(d => d.status === 'complete');

    if (completed.length === 0) { alert('Belum ada soal yang lengkap'); return; }
    if (!confirm(`Simpan ${completed.length} soal lengkap ke database?`)) return;

    setIsSaving(true);
    try {
      // Upload semua gambar — hanya File object, bukan base64
      const uploadedUrls: Record<string, string> = {};
      for (const [key, file] of Object.entries(imageFiles)) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('packageId', packageId);
        const res = await fetch('/api/admin/upload/image', { method: 'POST', body: fd });
        if (res.ok) {
          const { url } = await res.json();
          uploadedUrls[key] = url;
        }
      }

      for (const draft of completed) {
        const questionImageUrl = uploadedUrls[`q${draft.number}`] || (draft.image_url?.startsWith('http') ? draft.image_url : '') || '';
        
        // Gambar pembahasan: pakai uploaded URL, atau gambar jawaban benar, atau existing URL
        const correctChoice = draft.choices.find(c => c.is_answer);
        const correctChoiceImageKey = `q${draft.number}_${correctChoice?.label}`;
        const explanationImageUrl =
          uploadedUrls[`q${draft.number}_explanation`] ||
          uploadedUrls[correctChoiceImageKey] ||
          (draft.explanation_image_url?.startsWith('http') ? draft.explanation_image_url : '') ||
          (correctChoice?.image_url?.startsWith('http') ? correctChoice.image_url : '') ||
          '';

        const choices = draft.choices.map(c => {
          const choiceImageKey = `q${draft.number}_${c.label}`;
          const imageUrl = uploadedUrls[choiceImageKey] || (c.image_url?.startsWith('http') ? c.image_url : '') || '';
          return {
            label: c.label,
            // Jika tidak ada text tapi ada gambar, simpan string kosong di content
            content: c.content || '',
            image_url: imageUrl,
            is_answer: c.is_answer,
            score: c.score || (draft.category === 'TKP' ? 3 : 0),
          };
        });

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

  // Gambar preview untuk form yang sedang aktif
  const questionPreview = formData.image_url || '';
  const explanationAutoImage = getCorrectChoiceImageUrl(formData);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/admin/packages/${packageId}`}>
          <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-slate-900">Edit Soal Paket</h1>
          <p className="text-slate-600 mt-1">Paket: {packageTitle}</p>
        </div>
        <Button onClick={handleSubmitAll} disabled={isSaving || completedCount === 0} size="lg" className="gap-2">
          {isSaving
            ? <><Loader2 className="h-5 w-5 animate-spin" />Menyimpan...</>
            : <><Save className="h-5 w-5" />Simpan Semua ({completedCount})</>
          }
        </Button>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="py-3">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-3 text-sm">
                  <span className="font-medium text-slate-700">Lengkap: <span className="text-blue-600">{completedCount}</span></span>
                  <span className="text-slate-500">•</span>
                  <span className="font-medium text-slate-700">Belum Lengkap: <span className="text-red-600">{incompleteCount}</span></span>
                  <span className="text-slate-500">•</span>
                  <span className="font-medium text-slate-700">Kosong: <span className="text-slate-600">{emptyCount}</span></span>
                </div>
                <p className="text-sm font-bold text-blue-900">{progress}%</p>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
        <div className="space-y-4">
          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={() => goToQuestion(currentNumber - 1)} disabled={currentNumber === 1} className="gap-2">
              <ChevronLeft className="h-4 w-4" />Sebelumnya
            </Button>
            <span className="text-lg font-bold text-slate-900">Soal #{currentNumber} - {currentCategory}</span>
            <Button variant="outline" size="sm" onClick={() => goToQuestion(currentNumber + 1)} disabled={currentNumber === 110} className="gap-2">
              Selanjutnya<ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6 space-y-4">
              {/* Difficulty & Topic */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Tingkat Kesulitan</Label>
                  <Select value={formData.difficulty} onValueChange={(v: any) => setFormData({ ...formData, difficulty: v })}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Mudah</SelectItem>
                      <SelectItem value="medium">Sedang</SelectItem>
                      <SelectItem value="hard">Sulit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Topik</Label>
                  <Input placeholder="Contoh: Pancasila" value={formData.topic} onChange={e => setFormData({ ...formData, topic: e.target.value })} className="h-9" />
                </div>
              </div>

              {/* Question Text */}
              <div className="space-y-2">
                <Label className="text-sm">
                  Pertanyaan {!formData.image_url && <span className="text-red-500">*</span>}
                  {formData.image_url && <span className="text-slate-400 text-xs ml-1">(opsional jika ada gambar soal)</span>}
                </Label>
                <Textarea
                  placeholder="Tulis pertanyaan di sini... (opsional jika soal berupa gambar)"
                  rows={3}
                  value={formData.content}
                  onChange={e => setFormData({ ...formData, content: e.target.value })}
                />
              </div>

              {/* Question Image */}
              <div className="space-y-2">
                <Label className="text-sm">Upload Gambar Soal (Optional)</Label>
                <div className="flex items-start gap-3">
                  <Input type="file" accept="image/*" onChange={handleQuestionImageChange} className="h-9" />
                  {questionPreview && (
                    <div className="relative">
                      <img src={questionPreview} alt="Preview" className="w-20 h-20 object-cover rounded border" />
                      <Button type="button" variant="destructive" size="icon" className="absolute -top-1 -right-1 h-5 w-5" onClick={removeQuestionImage}>
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
                  {isTIU && <span className="text-slate-400 text-xs ml-1">(text atau gambar, salah satu wajib)</span>}
                </Label>

                <div className="space-y-2">
                  {formData.choices.map((choice) => {
                    const choiceFilled = isChoiceFilled(choice);
                    return (
                      <div
                        key={choice.label}
                        className={cn(
                          'p-3 border-2 rounded-lg',
                          !isTKP && choice.is_answer && 'border-blue-500 bg-blue-50'
                        )}
                      >
                        <div className="flex items-start gap-2">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 font-semibold text-xs shrink-0 mt-1">
                            {choice.label}
                          </span>

                          <div className="flex-1 space-y-2">
                            <Input
                              placeholder={isTIU ? `Pilihan ${choice.label} (opsional jika ada gambar)` : `Pilihan ${choice.label}`}
                              value={choice.content}
                              onChange={e => setFormData({
                                ...formData,
                                choices: formData.choices.map(c =>
                                  c.label === choice.label ? { ...c, content: e.target.value } : c
                                ),
                              })}
                              className="h-9"
                            />

                            {/* TIU: Image per choice */}
                            {isTIU && (
                              <div className="flex items-center gap-2">
                                <Input
                                  type="file"
                                  accept="image/*"
                                  onChange={e => handleChoiceImageChange(choice.label, e)}
                                  className="text-xs h-8"
                                />
                                {choice.image_url && (
                                  <div className="relative">
                                    <img src={choice.image_url} alt={`Choice ${choice.label}`} className="w-12 h-12 object-cover rounded border" />
                                    <Button type="button" variant="destructive" size="icon" className="absolute -top-1 -right-1 h-4 w-4" onClick={() => removeChoiceImage(choice.label)}>
                                      <X className="h-2 w-2" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Radio / Score */}
                          {!isTKP ? (
                            <RadioGroup
                              value={formData.choices.find(c => c.is_answer)?.label || ''}
                              onValueChange={handleCorrectAnswerChange}
                            >
                              <RadioGroupItem value={choice.label} className="mt-1" />
                            </RadioGroup>
                          ) : (
                            <div className="w-20">
                              <Label className="text-xs text-slate-600">Skor <span className="text-red-500">*</span></Label>
                              <Input
                                type="number" min="1" max="5" placeholder="1-5"
                                value={choice.score === null ? '' : choice.score}
                                onChange={e => {
                                  const val = e.target.value === '' ? null : parseInt(e.target.value);
                                  setFormData({ ...formData, choices: formData.choices.map(c => c.label === choice.label ? { ...c, score: val } : c) });
                                }}
                                className="h-9"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {isTKP && (() => {
                  const scores = formData.choices.map(c => c.score).filter(s => s !== null);
                  const hasDuplicate = scores.length > 0 && new Set(scores).size !== scores.length;
                  if (hasDuplicate) return <p className="text-xs text-red-600">⚠️ Setiap pilihan harus memiliki skor yang berbeda (1-5)</p>;
                })()}
              </div>

              {/* Explanation */}
              <div className="space-y-2">
                <Label className="text-sm">Pembahasan <span className="text-red-500">*</span></Label>
                <Textarea
                  placeholder="Penjelasan jawaban yang benar..."
                  rows={3}
                  value={formData.explanation}
                  onChange={e => setFormData({ ...formData, explanation: e.target.value })}
                />
              </div>

              {/* Explanation Image — auto dari jawaban benar, tidak perlu upload ulang */}
              {isTIU && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">Gambar Pembahasan</Label>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Info className="h-3 w-3" />
                      Otomatis menggunakan gambar jawaban yang benar
                    </span>
                  </div>
                  {explanationAutoImage ? (
                    <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <img src={explanationAutoImage} alt="Auto explanation" className="w-16 h-16 object-cover rounded border" />
                      <div>
                        <p className="text-sm font-medium text-green-800">✅ Gambar otomatis dari jawaban benar</p>
                        <p className="text-xs text-green-600">
                          Jawaban: {formData.choices.find(c => c.is_answer)?.label || '-'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <p className="text-sm text-slate-500">
                        {formData.choices.some(c => c.is_answer)
                          ? 'Jawaban benar belum memiliki gambar'
                          : 'Belum ada jawaban benar yang dipilih'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Navigator */}
        <div className="lg:sticky lg:top-4 lg:self-start">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Navigasi Soal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-6 gap-1">
                {Array.from({ length: 110 }, (_, i) => i + 1).map(num => {
                  const draft = draftsRef.current[num];
                  const status = draft?.status || 'empty';
                  const isCurrent = num === currentNumber;
                  return (
                    <button
                      key={num}
                      onClick={() => goToQuestion(num)}
                      className={cn(
                        'h-8 w-full rounded text-xs font-semibold transition-all hover:opacity-80',
                        isCurrent && 'bg-slate-800 text-white ring-2 ring-slate-400',
                        !isCurrent && status === 'complete' && 'bg-blue-500 text-white',
                        !isCurrent && status === 'incomplete' && 'bg-red-500 text-white',
                        !isCurrent && status === 'empty' && 'bg-white text-slate-700 border border-slate-300',
                      )}
                      title={`Soal ${num} - ${getCategoryFromNumber(num)} (${status})`}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4 text-xs text-slate-600">
                {[
                  { cls: 'bg-slate-800', label: 'Aktif' },
                  { cls: 'bg-blue-500', label: 'Lengkap' },
                  { cls: 'bg-red-500', label: 'Belum Lengkap' },
                  { cls: 'bg-white border border-slate-300', label: 'Kosong' },
                ].map(({ cls, label }) => (
                  <div key={label} className="flex items-center gap-1">
                    <div className={cn('w-4 h-4 rounded', cls)} />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}