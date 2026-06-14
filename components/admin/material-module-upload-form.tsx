'use client';

// ============================================================
// components/admin/material-module-upload-form.tsx
// Upload BULK materi modul via 1 file JSON — preview render lalu simpan.
// ============================================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Upload, Loader2, AlertCircle, Info, CheckCircle2, Download,
  ChevronDown, Trash2, FileJson, ChevronUp,
} from 'lucide-react';
import { toast } from 'sonner';
import { ModuleContent } from '@/components/materi/module-content';

interface ExistingModule {
  id: string; category: string; topic: string; title: string;
  tier: string; read_minutes: number | null;
}
interface QuizItem { question: string; choices: string[]; answer: number; explanation?: string }
interface PageInput { content?: string; info?: string | null; quiz?: QuizItem[] | null }
interface ModuleInput { title?: string; pages?: PageInput[]; content_body?: string; tier?: string; read_minutes?: number; quiz?: QuizItem[] }
interface GroupInput { category?: string; topic?: string; tier?: string; topic_order?: number; modules?: ModuleInput[] }

const SAMPLE = {
  groups: [
    {
      category: 'TWK',
      topic: 'Pilar Negara',
      tier: 'free',
      topic_order: 1,
      modules: [
        {
          title: 'Lahirnya Pancasila',
          read_minutes: 8,
          pages: [
            {
              content:
                '## Latar Belakang\n\nPancasila lahir melalui sidang **BPUPKI** pada 29 Mei – 1 Juni 1945.\n\n| Tanggal | Peristiwa |\n|---|---|\n| 1 Juni 1945 | Pidato Soekarno |\n| 18 Agustus 1945 | Pengesahan Pancasila |',
              info: 'Tanggal kunci yang sering keluar: **1 Juni** (lahir) dan **18 Agustus** (sah).',
              quiz: [
                { question: 'Hari Lahir Pancasila diperingati tanggal…', choices: ['22 Juni', '1 Juni', '18 Agustus'], answer: 1, explanation: 'Pidato Soekarno 1 Juni 1945.' },
              ],
            },
            {
              content:
                '## Nilai-Nilai Pancasila\n\nSetiap sila memuat nilai yang harus diamalkan dalam kehidupan sehari-hari...',
              info: 'Ingat urutan sila dan contoh pengamalannya.',
              quiz: [
                { question: 'Sila yang melambangkan persatuan adalah sila ke…', choices: ['2', '3', '4'], answer: 1, explanation: 'Sila ke-3: Persatuan Indonesia.' },
              ],
            },
          ],
        },
      ],
    },
  ],
};

function normalize(parsed: any): GroupInput[] | null {
  if (Array.isArray(parsed)) return parsed;
  if (Array.isArray(parsed?.groups)) return parsed.groups;
  if (parsed?.category && parsed?.topic) return [parsed];
  return null;
}

export function MaterialModuleUploadForm({ existing }: { existing: ExistingModule[] }) {
  const router = useRouter();
  const [raw, setRaw] = useState('');
  const [groups, setGroups] = useState<GroupInput[] | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [mode, setMode] = useState<'add' | 'overwrite'>('add');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [openPreview, setOpenPreview] = useState<string | null>(null);

  const loadJson = (text: string) => {
    setParseError(null); setResult(null); setGroups(null);
    if (!text.trim()) return;
    try {
      const g = normalize(JSON.parse(text));
      if (!g) { setParseError('Format tidak dikenali — butuh { groups: [...] } atau 1 group.'); return; }
      setGroups(g);
    } catch (e: any) {
      setParseError(`JSON tidak valid: ${e.message}`);
    }
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.name.endsWith('.json')) { setParseError('File harus .json'); return; }
    const text = await f.text();
    setRaw(text); loadJson(text);
  };

  const downloadSample = () => {
    const blob = new Blob([JSON.stringify(SAMPLE, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'contoh_materi_modul.json'; a.click();
    URL.revokeObjectURL(url);
  };

  const totalModules = groups?.reduce((s, g) => s + (g.modules?.length ?? 0), 0) ?? 0;

  const handleSubmit = async () => {
    if (!groups) return;
    if (mode === 'overwrite' && !window.confirm(
      'Mode TIMPA: semua sub-topik lama pada topik yang ada di file ini akan diarsipkan & diganti dengan isi baru. Lanjutkan?'
    )) return;
    setSubmitting(true); setResult(null);
    try {
      const res = await fetch('/api/admin/upload/material-modules', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groups, mode }),
      });
      const data = await res.json();
      setResult(data);
      if (res.ok && (data.invalid?.length ?? 0) === 0 && data.inserted >= 0) {
        toast.success(`${data.inserted} sub-topik tersimpan`);
        if (data.inserted > 0) setTimeout(() => router.refresh(), 1500);
      }
    } catch (e: any) {
      setParseError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteTopic = async (category: string, topic: string) => {
    if (!window.confirm(`Hapus seluruh topik "${topic}" (${category})? Materi diarsipkan, bisa di-upload ulang.`)) return;
    const res = await fetch('/api/admin/material-modules', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, topic }),
    });
    if (res.ok) { toast.success('Topik dihapus'); router.refresh(); }
    else toast.error('Gagal menghapus');
  };

  const deleteModule = async (id: string, title: string) => {
    if (!window.confirm(`Hapus sub-topik "${title}"? Bisa di-upload ulang.`)) return;
    const res = await fetch('/api/admin/material-modules', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (res.ok) { toast.success('Sub-topik dihapus'); router.refresh(); }
    else toast.error('Gagal menghapus');
  };

  // Tukar posisi 1 sub-topik dengan tetangganya, lalu simpan urutan baru (1..n)
  const moveModule = async (mods: ExistingModule[], index: number, dir: 'up' | 'down') => {
    const j = dir === 'up' ? index - 1 : index + 1;
    if (j < 0 || j >= mods.length) return;
    const arr = [...mods];
    [arr[index], arr[j]] = [arr[j], arr[index]];
    const reorder = arr.map((m, i) => ({ id: m.id, sub_order: i + 1 }));
    const res = await fetch('/api/admin/material-modules', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reorder }),
    });
    if (res.ok) { toast.success('Urutan diperbarui'); router.refresh(); }
    else toast.error('Gagal mengubah urutan');
  };

  // Kelompokkan existing per kategori → topik
  const byCatTopic = new Map<string, Map<string, ExistingModule[]>>();
  for (const m of existing) {
    if (!byCatTopic.has(m.category)) byCatTopic.set(m.category, new Map());
    const t = byCatTopic.get(m.category)!;
    if (!t.has(m.topic)) t.set(m.topic, []);
    t.get(m.topic)!.push(m);
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Materi Modul (Bacaan)</h1>
        <p className="text-sm text-slate-500">Upload materi non-video lewat 1 file JSON. Mendukung Markdown, rumus matematika ($…$), SVG, tabel, dan mini-quiz.</p>
      </div>

      {/* Panduan */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-xs text-blue-900 leading-relaxed flex gap-2">
        <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
        <div>
          1 file berisi satu/banyak <strong>topik</strong>, tiap topik punya banyak <strong>sub-topik</strong> (modul).
          Mode <strong>Tambah</strong>: judul yang sudah ada di-skip. Mode <strong>Timpa</strong>: seluruh topik diganti isi baru.
          <button onClick={downloadSample} className="ml-2 inline-flex items-center gap-1 font-semibold underline">
            <Download className="h-3 w-3" /> Unduh contoh JSON
          </button>
        </div>
      </div>

      {/* Input */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
        <p className="text-sm font-semibold text-slate-700">1. Pilih file JSON</p>
        <input type="file" accept=".json,application/json" onChange={handleFile}
          className="block w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-slate-800 file:text-white file:text-sm file:font-medium hover:file:bg-slate-700 cursor-pointer" />
        <details className="text-xs text-slate-500">
          <summary className="cursor-pointer select-none">atau tempel JSON manual</summary>
          <textarea value={raw} onChange={e => { setRaw(e.target.value); loadJson(e.target.value); }}
            rows={6} placeholder='{ "groups": [ { "category": "TWK", "topic": "...", "modules": [...] } ] }'
            className="mt-2 w-full rounded-md border border-slate-200 p-2 font-mono text-[11px] resize-y" />
        </details>

        {/* Mode */}
        <div className="grid grid-cols-2 gap-2">
          {(['add', 'overwrite'] as const).map(m => (
            <button key={m} type="button" onClick={() => setMode(m)}
              className={`text-left px-3 py-2 rounded-lg border text-xs transition-colors ${
                mode === m
                  ? (m === 'add' ? 'border-blue-500 bg-blue-50 text-blue-800 font-semibold' : 'border-amber-500 bg-amber-50 text-amber-800 font-semibold')
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}>
              {m === 'add' ? 'Tambah' : 'Timpa'}
              <span className="block font-normal text-slate-500">
                {m === 'add' ? 'Skip judul yang sudah ada' : 'Ganti seluruh isi topik'}
              </span>
            </button>
          ))}
        </div>

        {parseError && (
          <div className="flex items-center gap-2 text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded p-2">
            <AlertCircle className="h-4 w-4" /> {parseError}
          </div>
        )}
      </div>

      {/* Preview */}
      {groups && groups.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
          <p className="text-sm font-semibold text-slate-700">
            2. Preview — {groups.length} topik, {totalModules} sub-topik
          </p>
          {groups.map((g, gi) => (
            <div key={gi} className="rounded-lg border border-slate-200">
              <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-800">
                  <span className="text-[10px] font-black bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded mr-2">{g.category}</span>
                  {g.topic}
                </span>
                <span className="text-xs text-slate-400">{g.modules?.length ?? 0} sub-topik</span>
              </div>
              <div className="divide-y divide-slate-100">
                {(g.modules ?? []).map((m, mi) => {
                  const key = `${gi}-${mi}`;
                  const isOpen = openPreview === key;
                  return (
                    <div key={mi}>
                      <button onClick={() => setOpenPreview(isOpen ? null : key)}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-slate-50">
                        <span className="text-sm text-slate-700 font-medium">
                          <span className="text-slate-400 mr-1.5">{mi + 1}.</span>{m.title || <em className="text-rose-500">tanpa judul</em>}
                          {(() => {
                            const pc = m.pages?.length ?? (m.content_body ? 1 : 0);
                            return pc ? <span className="ml-2 text-[10px] text-slate-400">· {pc} halaman</span> : null;
                          })()}
                        </span>
                        <ChevronDown size={15} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {isOpen && (
                        <div className="px-4 py-3 bg-white border-t border-slate-100 space-y-4">
                          {(m.pages ?? (m.content_body ? [{ content: m.content_body }] : [])).map((p, pi) => (
                            <div key={pi} className="border border-slate-100 rounded-lg p-3">
                              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-2">Halaman {pi + 1}</p>
                              {p.content
                                ? <ModuleContent body={p.content} />
                                : <p className="text-xs text-rose-500">content kosong</p>}
                              {p.info && (
                                <p className="mt-2 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                                  Info Penting: {p.info}
                                </p>
                              )}
                              {p.quiz?.length ? <p className="mt-1.5 text-[10px] text-sky-600">{p.quiz.length} soal kuis</p> : null}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <button onClick={handleSubmit} disabled={submitting}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-semibold hover:bg-slate-700 disabled:opacity-50">
            {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Menyimpan…</> : <><Upload className="h-4 w-4" /> Simpan {totalModules} Sub-topik</>}
          </button>
        </div>
      )}

      {/* Hasil */}
      {result && (
        <div className={`rounded-xl border p-4 text-xs space-y-1 ${result.invalid?.length || result.error ? 'border-rose-200 bg-rose-50' : 'border-emerald-200 bg-emerald-50'}`}>
          {result.inserted > 0 && <p className="text-emerald-700 font-semibold flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> {result.inserted} sub-topik disimpan.</p>}
          {result.archived > 0 && <p className="text-sky-700">♻️ {result.archived} sub-topik lama diarsipkan (timpa).</p>}
          {result.skipped > 0 && <p className="text-amber-700">{result.skipped} di-skip (judul sudah ada).</p>}
          {result.invalid?.length > 0 && (
            <div className="text-rose-700">
              <p className="font-semibold">Ditolak (tidak ada yang disimpan):</p>
              <ul className="list-disc pl-5">
                {result.invalid.map((iv: any, k: number) => <li key={k}>{iv.group}: {iv.errors.join('; ')}</li>)}
              </ul>
            </div>
          )}
          {result.error && <p className="text-rose-700">{result.error}</p>}
        </div>
      )}

      {/* Daftar existing */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-1.5">
          <FileJson className="h-4 w-4 text-slate-400" /> Materi Tersimpan
        </p>
        {existing.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">Belum ada materi modul. Upload file JSON di atas.</p>
        ) : (
          <div className="space-y-4">
            <p className="text-[11px] text-slate-400">Gunakan panah untuk mengurutkan sub-topik di tiap topik. Urutan ini yang tampil ke pengguna.</p>
            {Array.from(byCatTopic.entries()).map(([cat, topics]) => (
              <div key={cat}>
                <p className="text-[11px] font-black uppercase tracking-wide text-slate-400 mb-1.5">{cat}</p>
                <div className="space-y-3">
                  {Array.from(topics.entries()).map(([topic, mods]) => (
                    <div key={topic} className="rounded-lg border border-slate-200 overflow-hidden">
                      {/* Header topik */}
                      <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b border-slate-200">
                        <span className="text-sm text-slate-700 font-semibold">{topic} <span className="text-xs font-normal text-slate-400">· {mods.length} sub-topik</span></span>
                        <button onClick={() => deleteTopic(cat, topic)} className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500" title="Hapus seluruh topik">
                          <Trash2 size={15} />
                        </button>
                      </div>
                      {/* Daftar sub-topik (bisa diurutkan) */}
                      <div className="divide-y divide-slate-100">
                        {mods.map((m, i) => (
                          <div key={m.id} className="flex items-center gap-2 px-3 py-2">
                            <span className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-[11px] font-bold text-slate-500 flex-shrink-0">{i + 1}</span>
                            <span className="flex-1 min-w-0 text-sm text-slate-700 truncate">{m.title}</span>
                            <div className="flex items-center gap-0.5 flex-shrink-0">
                              <button onClick={() => moveModule(mods, i, 'up')} disabled={i === 0}
                                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:hover:bg-transparent" title="Naik">
                                <ChevronUp size={15} />
                              </button>
                              <button onClick={() => moveModule(mods, i, 'down')} disabled={i === mods.length - 1}
                                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:hover:bg-transparent" title="Turun">
                                <ChevronDown size={15} />
                              </button>
                              <button onClick={() => deleteModule(m.id, m.title)}
                                className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500" title="Hapus sub-topik">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
