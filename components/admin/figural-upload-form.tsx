'use client';

// ============================================================
// components/admin/figural-upload-form.tsx
// Upload BULK soal figural (SVG) via 1 file JSON — preview lalu simpan.
// ============================================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ArrowLeft, Upload, Loader2, AlertCircle, Info, CheckCircle2,
  SkipForward, Image as ImageIcon,
} from 'lucide-react';

interface Props {
  packageId: string;
  packageTitle: string;
}

interface FiguralChoice { label?: string; svg?: string }
interface FiguralQuestion {
  position?: number;
  content?: string;
  question_svg?: string;
  explanation?: string;
  explanation_svg?: string;
  correct_answer?: string;
  difficulty?: string;
  choices?: FiguralChoice[];
}

const LABELS = ['A', 'B', 'C', 'D', 'E'];

// Render SVG via data-URI <img> → AMAN (script di SVG tidak dieksekusi dalam konteks img).
function svgUri(svg?: string) {
  if (!svg) return '';
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function expectedCategory(pos: number) {
  if (pos <= 30) return 'TWK';
  if (pos <= 65) return 'TIU';
  return 'TKP';
}

// Validasi ringan sisi-klien untuk preview (server tetap validasi ulang).
function validateQuestion(q: FiguralQuestion): string[] {
  const errs: string[] = [];
  const pos = Number(q.position);
  if (!q.position || isNaN(pos) || pos < 1 || pos > 110) errs.push('position 1–110 wajib');
  if (!q.question_svg?.includes('<svg')) errs.push('question_svg wajib (SVG)');
  if (!q.correct_answer || !LABELS.includes(q.correct_answer)) errs.push('correct_answer A–E wajib');
  if (!Array.isArray(q.choices) || q.choices.length !== 5) errs.push('harus 5 pilihan');
  else {
    for (const L of LABELS) {
      const c = q.choices.find((x) => x.label === L);
      if (!c) errs.push(`pilihan ${L} hilang`);
      else if (!c.svg?.includes('<svg')) errs.push(`pilihan ${L} svg wajib`);
    }
  }
  return errs;
}

export function FiguralUploadForm({ packageId, packageTitle }: Props) {
  const router = useRouter();
  const [raw, setRaw] = useState('');
  const [questions, setQuestions] = useState<FiguralQuestion[] | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const loadJson = (text: string) => {
    setParseError(null);
    setResult(null);
    setQuestions(null);
    if (!text.trim()) return;
    try {
      const parsed = JSON.parse(text);
      const arr = Array.isArray(parsed) ? parsed : parsed.questions;
      if (!Array.isArray(arr)) {
        setParseError('JSON harus berupa array soal, atau objek dengan field "questions".');
        return;
      }
      setQuestions(arr);
    } catch (e: any) {
      setParseError(`JSON tidak valid: ${e.message}`);
    }
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.name.endsWith('.json')) { setParseError('File harus berformat .json'); return; }
    const text = await f.text();
    setRaw(text);
    loadJson(text);
  };

  const validCount = questions
    ? questions.filter((q) => validateQuestion(q).length === 0).length
    : 0;
  const hasInvalid = questions
    ? questions.some((q) => validateQuestion(q).length > 0)
    : false;

  const handleSubmit = async () => {
    if (!questions) return;
    setSubmitting(true);
    setResult(null);
    try {
      const res = await fetch('/api/admin/upload/figural', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId, questions }),
      });
      const data = await res.json();
      if (!res.ok) {
        setParseError(data.error || 'Gagal menyimpan soal');
        setResult(data);
        return;
      }
      setResult(data);
      if (data.inserted > 0 && (!data.invalid || data.invalid.length === 0)) {
        setTimeout(() => {
          router.push(`/admin/packages/${packageId}`);
          router.refresh();
        }, 2500);
      }
    } catch (e: any) {
      setParseError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={`/admin/packages/${packageId}`}>
          <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" /> Kembali</Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Upload Soal Figural (JSON)</h1>
          <p className="text-sm text-slate-500">Paket: {packageTitle}</p>
        </div>
      </div>

      {/* Panduan */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription className="text-xs leading-relaxed">
          Unggah <strong>1 file JSON</strong> berisi banyak soal figural (TIU posisi 31–65). Tiap soal memuat
          SVG soal, 5 pilihan, jawaban benar, dan pembahasan (opsional) — semua inline. Posisi yang sudah
          terisi akan dilewati otomatis. Kategori ditentukan dari posisi.
        </AlertDescription>
      </Alert>

      {/* Input */}
      <Card>
        <CardHeader><CardTitle className="text-base">1. Pilih file JSON</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <input
            type="file"
            accept=".json,application/json"
            onChange={handleFile}
            className="block w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-slate-800 file:text-white file:text-sm file:font-medium hover:file:bg-slate-700 cursor-pointer"
          />
          <details className="text-xs text-slate-500">
            <summary className="cursor-pointer select-none">atau tempel JSON manual</summary>
            <textarea
              value={raw}
              onChange={(e) => { setRaw(e.target.value); loadJson(e.target.value); }}
              rows={6}
              placeholder='[ { "position": 31, "question_svg": "<svg ...>", "correct_answer": "C", "choices": [...] } ]'
              className="mt-2 w-full rounded-md border border-slate-200 p-2 font-mono text-[11px] resize-y"
            />
          </details>

          {parseError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">{parseError}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Preview */}
      {questions && questions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>2. Preview — {questions.length} soal ({validCount} valid)</span>
              <ImageIcon className="w-4 h-4 text-slate-400" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {questions.map((q, i) => {
              const errs = validateQuestion(q);
              const ok = errs.length === 0;
              const pos = Number(q.position);
              return (
                <div
                  key={i}
                  className={`rounded-xl border p-4 ${ok ? 'border-slate-200' : 'border-rose-300 bg-rose-50/40'}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-slate-800">
                      Soal #{q.position ?? '?'}{' '}
                      {!isNaN(pos) && <span className="text-xs font-normal text-slate-400">({expectedCategory(pos)})</span>}
                    </span>
                    {ok
                      ? <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Valid</span>
                      : <span className="text-[11px] font-semibold text-rose-600 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {errs.length} masalah</span>}
                  </div>

                  {!ok && (
                    <ul className="mb-3 list-disc pl-5 text-[11px] text-rose-600 space-y-0.5">
                      {errs.map((e, j) => <li key={j}>{e}</li>)}
                    </ul>
                  )}

                  {q.content && <p className="text-sm text-slate-700 mb-2">{q.content}</p>}

                  <div className="flex gap-4 flex-wrap">
                    {/* Soal */}
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] text-slate-400 mb-1">SOAL</span>
                      <div className="w-24 h-24 border border-slate-200 rounded-lg bg-white flex items-center justify-center p-1">
                        {q.question_svg
                          ? <img src={svgUri(q.question_svg)} alt="soal" className="max-w-full max-h-full" />
                          : <span className="text-[10px] text-rose-400">kosong</span>}
                      </div>
                    </div>

                    {/* Pilihan */}
                    {LABELS.map((L) => {
                      const c = q.choices?.find((x) => x.label === L);
                      const correct = q.correct_answer === L;
                      return (
                        <div key={L} className="flex flex-col items-center">
                          <span className={`text-[10px] mb-1 ${correct ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                            {L}{correct ? ' ✓' : ''}
                          </span>
                          <div className={`w-20 h-20 border rounded-lg bg-white flex items-center justify-center p-1 ${correct ? 'border-emerald-400 ring-1 ring-emerald-300' : 'border-slate-200'}`}>
                            {c?.svg
                              ? <img src={svgUri(c.svg)} alt={L} className="max-w-full max-h-full" />
                              : <span className="text-[10px] text-rose-400">-</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {(q.explanation || q.explanation_svg) && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <span className="text-[10px] text-slate-400">PEMBAHASAN</span>
                      {q.explanation && <p className="text-xs text-slate-600 mt-1">{q.explanation}</p>}
                      {q.explanation_svg && (
                        <div className="w-28 h-28 border border-slate-200 rounded-lg bg-white flex items-center justify-center p-1 mt-2">
                          <img src={svgUri(q.explanation_svg)} alt="pembahasan" className="max-w-full max-h-full" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Hasil simpan */}
      {result && (
        <Alert variant={result.invalid?.length > 0 || result.error ? 'destructive' : 'default'}>
          {result.invalid?.length > 0 || result.error
            ? <AlertCircle className="h-4 w-4" />
            : <CheckCircle2 className="h-4 w-4" />}
          <AlertDescription className="text-xs space-y-1">
            {result.inserted > 0 && <p className="text-emerald-700 font-semibold">✅ {result.inserted} soal berhasil disimpan.</p>}
            {result.skipped?.length > 0 && (
              <p className="flex items-center gap-1"><SkipForward className="w-3 h-3" /> {result.skipped.length} dilewati (posisi sudah terisi).</p>
            )}
            {result.invalid?.length > 0 && (
              <div>
                <p className="font-semibold text-rose-700">{result.invalid.length} soal ditolak (tidak ada yang disimpan):</p>
                <ul className="list-disc pl-5">
                  {result.invalid.map((iv: any, k: number) => (
                    <li key={k}>Posisi {iv.position ?? '?'}: {iv.errors.join('; ')}</li>
                  ))}
                </ul>
              </div>
            )}
            {result.error && <p className="text-rose-700">{result.error}</p>}
          </AlertDescription>
        </Alert>
      )}

      {/* Submit */}
      {questions && questions.length > 0 && (
        <div className="flex items-center gap-3">
          <Button onClick={handleSubmit} disabled={submitting || hasInvalid || validCount === 0}>
            {submitting
              ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menyimpan…</>
              : <><Upload className="w-4 h-4 mr-2" /> Simpan {validCount} Soal ke Paket</>}
          </Button>
          {hasInvalid && (
            <span className="text-xs text-rose-600">Perbaiki soal yang bermasalah dulu — penyimpanan all-or-nothing.</span>
          )}
        </div>
      )}
    </div>
  );
}
