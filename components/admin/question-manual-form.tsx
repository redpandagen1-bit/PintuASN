'use client';

import { useState, useEffect } from 'react';
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
import { ArrowLeft, Loader2, X } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface QuestionManualFormProps {
  packageId: string;
  packageTitle: string;
}

export function QuestionManualForm({ packageId, packageTitle }: QuestionManualFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentQuestionCount, setCurrentQuestionCount] = useState(0);

  // Fetch current question count
  useEffect(() => {
    async function fetchCount() {
      try {
        const res = await fetch(`/api/admin/packages/${packageId}/questions`);
        if (res.ok) {
          const data = await res.json();
          setCurrentQuestionCount(data.questions?.length || 0);
        }
      } catch (error) {
        console.error('Error fetching question count:', error);
      }
    }
    fetchCount();
  }, [packageId]);

  const [formData, setFormData] = useState({
    category: 'TWK',
    content: '',
    image_url: '',
    explanation: '',
    topic: '',
    difficulty: 'medium',
    choices: [
      { label: 'A', content: '', is_answer: false, score: 3 },
      { label: 'B', content: '', is_answer: false, score: 3 },
      { label: 'C', content: '', is_answer: false, score: 3 },
      { label: 'D', content: '', is_answer: false, score: 3 },
      { label: 'E', content: '', is_answer: false, score: 3 },
    ],
  });

  const isTKP = formData.category === 'TKP';
  const nextQuestionNumber = currentQuestionCount + 1;
  const progress = Math.round((currentQuestionCount / 110) * 100);

  // ... rest of the code stays the same until return statement ...

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran file maksimal 5MB');
        return;
      }
      
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let imageUrl = formData.image_url;
      if (imageFile) {
        const formDataImg = new FormData();
        formDataImg.append('file', imageFile);
        formDataImg.append('packageId', packageId);

        const uploadRes = await fetch('/api/admin/upload/image', {
          method: 'POST',
          body: formDataImg,
        });

        if (uploadRes.ok) {
          const { url } = await uploadRes.json();
          imageUrl = url;
        } else {
          throw new Error('Gagal upload gambar');
        }
      }

      const response = await fetch('/api/admin/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          image_url: imageUrl,
          package_id: packageId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Gagal membuat soal');
      }

      if (result.warning) {
        alert('⚠️ ' + result.warning);
      }

      router.push(`/admin/packages/${packageId}`);
      router.refresh();
    } catch (error: any) {
      alert('❌ ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCorrectAnswerChange = (label: string) => {
    setFormData({
      ...formData,
      choices: formData.choices.map((c) => ({
        ...c,
        is_answer: c.label === label,
      })),
    });
  };

  const handleChoiceContentChange = (label: string, content: string) => {
    setFormData({
      ...formData,
      choices: formData.choices.map((c) =>
        c.label === label ? { ...c, content } : c
      ),
    });
  };

  const handleScoreChange = (label: string, score: number) => {
    setFormData({
      ...formData,
      choices: formData.choices.map((c) =>
        c.label === label ? { ...c, score } : c
      ),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/admin/packages/${packageId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-slate-900">Tambah Soal Manual</h1>
          <p className="text-slate-600 mt-1">Paket: {packageTitle}</p>
        </div>
      </div>

      {/* Progress Indicator */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900">
                  📝 Soal ke-{nextQuestionNumber} dari 110
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  {currentQuestionCount} soal sudah dibuat • Tersisa {110 - currentQuestionCount} soal lagi
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-900">{progress}%</p>
              </div>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit}>
        {/* ... rest of form sama seperti sebelumnya ... */}
        <Card>
          <CardHeader>
            <CardTitle>Soal #{nextQuestionNumber}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Category & Difficulty */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="category">
                  Kategori <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TWK">TWK</SelectItem>
                    <SelectItem value="TIU">TIU</SelectItem>
                    <SelectItem value="TKP">TKP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty">Tingkat Kesulitan</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                >
                  <SelectTrigger id="difficulty">
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
                <Label htmlFor="topic">Topik</Label>
                <Input
                  id="topic"
                  placeholder="Contoh: Pancasila"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                />
              </div>
            </div>

            {/* Question Text */}
            <div className="space-y-2">
              <Label htmlFor="content">
                Pertanyaan <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="content"
                placeholder="Tulis pertanyaan di sini..."
                rows={4}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label htmlFor="image">Upload Gambar (Optional)</Label>
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Format: JPG, PNG, WebP • Maksimal 5MB
                  </p>
                </div>
                {imagePreview && (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Choices */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>
                  Pilihan Jawaban <span className="text-red-500">*</span>
                </Label>
                {!isTKP && (
                  <p className="text-sm text-slate-500">
                    ⚪ Pilih jawaban yang benar
                  </p>
                )}
              </div>

              <div className="space-y-3">
                {formData.choices.map((choice, index) => (
                  <div
                    key={choice.label}
                    className={`flex items-start gap-3 p-4 border-2 rounded-lg transition-colors ${
                      !isTKP && choice.is_answer
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 font-semibold text-slate-700">
                        {index + 1}
                      </span>
                      
                      {!isTKP && (
                        <RadioGroup
                          value={formData.choices.find((c) => c.is_answer)?.label || ''}
                          onValueChange={handleCorrectAnswerChange}
                        >
                          <RadioGroupItem value={choice.label} id={choice.label} />
                        </RadioGroup>
                      )}
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm font-semibold">Pilihan {choice.label}:</Label>
                      </div>
                      <Input
                        placeholder={`Isi pilihan ${choice.label}`}
                        value={choice.content}
                        onChange={(e) =>
                          handleChoiceContentChange(choice.label, e.target.value)
                        }
                        required
                      />
                    </div>

                    {isTKP && (
                      <div className="w-24">
                        <Label className="text-xs text-slate-600">Skor</Label>
                        <Input
                          type="number"
                          min="1"
                          max="5"
                          value={choice.score}
                          onChange={(e) =>
                            handleScoreChange(choice.label, parseInt(e.target.value) || 1)
                          }
                          required
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Explanation */}
            <div className="space-y-2">
              <Label htmlFor="explanation">Pembahasan</Label>
              <Textarea
                id="explanation"
                placeholder="Penjelasan jawaban yang benar..."
                rows={3}
                value={formData.explanation}
                onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  'Simpan & Lanjut'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}