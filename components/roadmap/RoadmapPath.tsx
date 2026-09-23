'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { PathSection, PathNode, PhaseStatus } from '@/types/roadmap';
import {
  Map, Lock, Check, Star, BookOpen, PenLine, ClipboardList, Trophy, Target,
  Crown, ArrowRight, X,
} from 'lucide-react';

interface RoadmapPathProps {
  sections: PathSection[];
}

// ─────────────────────────────────────────────────────────────
// Layout geometry — dihitung sekali (pure function of section
// lengths), bukan hasil pengukuran DOM, jadi aman untuk SSR dan
// tidak memicu layout thrashing saat render.
// ─────────────────────────────────────────────────────────────
const NODE_GAP    = 124; // jarak vertikal antar spot (px)
const HEADER_GAP  = 100; // ruang vertikal untuk kartu judul section (px)
const TOP_PADDING = 34;

type LayoutItem =
  | { type: 'header'; y: number; section: PathSection }
  | { type: 'node'; y: number; x: number; node: PathNode; globalIndex: number };
type NodeItem = Extract<LayoutItem, { type: 'node' }>;

const round2 = (n: number) => Math.round(n * 100) / 100;

function buildLayout(sections: PathSection[]) {
  const items: LayoutItem[] = [];
  const points: { x: number; y: number }[] = [];
  let cursor = TOP_PADDING;
  let globalIndex = 0;

  for (const section of sections) {
    items.push({ type: 'header', y: cursor, section });
    cursor += HEADER_GAP;

    for (const node of section.nodes) {
      // Gelombang organik dua-frekuensi, deterministik dari index.
      // Dibulatkan karena Math.sin di Node vs browser bisa beda di digit
      // terakhir → atribut SSR tidak cocok saat hydration.
      const x = 50
        + 27 * Math.sin(globalIndex * 0.95)
        + 8  * Math.sin(globalIndex * 2.15 + 1);
      const clampedX = round2(Math.min(82, Math.max(18, x)));

      items.push({ type: 'node', y: cursor, x: clampedX, node, globalIndex });
      points.push({ x: clampedX, y: cursor });

      cursor += NODE_GAP;
      globalIndex += 1;
    }

    cursor += 12;
  }

  // Ruang ekstra di bawah agar kartu detail spot terakhir tidak terpotong.
  return { items, points, totalHeight: cursor + 110 };
}

// Catmull-Rom → cubic Bezier, menghasilkan kurva jalan yang halus
// melewati semua titik spot secara berurutan.
function smoothPathD(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const cp1x = round2(p1.x + (p2.x - p0.x) / 6);
    const cp1y = round2(p1.y + (p2.y - p0.y) / 6);
    const cp2x = round2(p2.x - (p3.x - p1.x) / 6);
    const cp2y = round2(p2.y - (p3.y - p1.y) / 6);
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

// ─────────────────────────────────────────────────────────────
// Background parallax — garis kontur peta topografi (tile SVG).
// Semua kontur tertutup & berada di dalam tile agar tiling mulus.
// ─────────────────────────────────────────────────────────────
const TOPO_TILE = 260;
const TOPO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="260" height="260" viewBox="0 0 260 260" fill="none" stroke="#1B2B5E" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" opacity="0.1">
<path d="M30 80 C30 50 60 38 85 45 C112 52 120 78 110 100 C100 122 70 125 50 115 C35 107 30 95 30 80 Z"/>
<path d="M45 80 C45 60 65 53 82 58 C100 63 104 80 97 95 C90 108 70 110 58 104 C49 99 45 90 45 80 Z"/>
<path d="M60 80 C60 70 70 67 79 70 C88 73 89 82 85 89 C80 95 70 95 65 92 C61 89 60 85 60 80 Z"/>
<path d="M150 190 C150 165 175 150 200 157 C225 164 238 185 228 208 C218 230 188 234 168 224 C155 217 150 205 150 190 Z"/>
<path d="M168 190 C168 175 182 168 196 172 C211 176 217 188 211 201 C205 214 187 216 176 210 C170 206 168 199 168 190 Z"/>
<path d="M186 191 C186 183 193 180 199 182 C205 184 207 190 204 196 C201 201 193 201 189 198 C187 196 186 194 186 191 Z"/>
<path d="M150 60 C160 48 182 46 196 56 C208 65 204 80 190 84 C176 88 158 84 151 75 C147 70 147 64 150 60 Z"/>
<path d="M40 170 C52 160 74 162 82 175 C88 186 78 196 62 196 C48 196 36 190 35 181 C34 176 36 173 40 170 Z"/>
<path d="M236 36 v10 M231 41 h10 M24 236 v10 M19 241 h10 M122 128 v8 M118 132 h8"/>
<path d="M118 222 l7 -11 l7 11 M130 222 l5 -7 l5 7" stroke-width="1.1"/>
</svg>`;
const TOPO_BG = `url("data:image/svg+xml,${encodeURIComponent(TOPO_SVG)}")`;

const BLOB_TILE_H = 560;
const BLOB_BG = [
  'radial-gradient(circle at 18% 22%, rgba(245,166,35,0.13), transparent 110px)',
  'radial-gradient(circle at 82% 58%, rgba(59,130,246,0.10), transparent 130px)',
  'radial-gradient(circle at 30% 88%, rgba(16,185,129,0.08), transparent 100px)',
].join(', ');

// ─────────────────────────────────────────────────────────────
// Spot visual
// ─────────────────────────────────────────────────────────────
const kindIcon: Record<PathNode['kind'], React.ElementType> = {
  reading: BookOpen,
  quiz:    PenLine,
  tryout:  ClipboardList,
  target:  Target,
  trophy:  Trophy,
};

const kindLabel: Record<PathNode['kind'], string> = {
  reading: 'Materi',
  quiz:    'Drilling',
  tryout:  'Tryout',
  target:  'Target',
  trophy:  'Pencapaian',
};

const ctaLabel: Record<PathNode['kind'], string> = {
  reading: 'Mulai belajar',
  quiz:    'Mulai drilling',
  tryout:  'Kerjakan tryout',
  target:  'Lihat progres',
  trophy:  'Lihat progres',
};

// Koin 3D: face (permukaan) + edge (ketebalan di bawahnya).
const spotSkin: Record<PhaseStatus, { face: string; edge: string; icon: string }> = {
  completed: {
    face: 'bg-gradient-to-b from-[#3b5ba8] to-[#1B2B5E]',
    edge: 'bg-[#0f1a3d]',
    icon: 'text-white',
  },
  active: {
    face: 'bg-gradient-to-b from-[#FFC857] to-[#F5A623]',
    edge: 'bg-[#c27c0e]',
    icon: 'text-white',
  },
  locked: {
    face: 'bg-gradient-to-b from-slate-100 to-slate-200',
    edge: 'bg-slate-300',
    icon: 'text-slate-400',
  },
};

function Spot({
  item, isLast, isOpen, shakeNonce, onToggle,
}: {
  item: NodeItem;
  isLast: boolean;
  isOpen: boolean;
  shakeNonce: number | null;
  onToggle: (item: NodeItem) => void;
}) {
  const { node, x, y, globalIndex } = item;
  const Icon = node.status === 'locked' ? Lock : node.status === 'completed' ? Check : kindIcon[node.kind];
  const skin = spotSkin[node.status];
  const bubbleOnLeft = x >= 50;

  return (
    <div
      data-path-node
      data-active={node.status === 'active' ? '' : undefined}
      style={{ left: `${x}%`, top: `${y}px`, transitionDelay: `${(globalIndex % 5) * 70}ms` }}
      className={cn('path-node group/node absolute', isOpen && 'z-20')}
    >
      {/* Penanda spot aktif */}
      {node.status === 'active' && (
        <div className="spot-marker pointer-events-none absolute left-1/2 -top-11 z-10">
          <div className="relative bg-[#1B2B5E] text-white text-[10px] font-black tracking-wider px-2.5 py-1 rounded-lg shadow-md">
            MULAI
            <span className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-2 h-2 rotate-45 bg-[#1B2B5E]" />
          </div>
        </div>
      )}

      <button
        type="button"
        data-spot-ui
        onClick={() => onToggle(item)}
        aria-label={`${node.label}${node.status === 'locked' ? ' (terkunci)' : ''}`}
        aria-expanded={isOpen}
        className="group/spot relative block w-[68px] h-[68px] outline-none focus-visible:ring-4 focus-visible:ring-[#F5A623]/40 rounded-full"
      >
        {/* Bayangan di tanah */}
        <span className="absolute left-1/2 -bottom-3 -translate-x-1/2 w-16 h-3.5 rounded-[50%] bg-[radial-gradient(closest-side,rgba(15,23,42,0.22),transparent)]" />

        <span
          key={shakeNonce ?? 'still'}
          className={cn('absolute inset-0', shakeNonce !== null && 'spot-shake')}
        >
          {/* Ketebalan koin */}
          <span className={cn('absolute inset-0 rounded-full translate-y-[6px]', skin.edge)} />

          {/* Permukaan koin */}
          <span
            className={cn(
              'absolute inset-0 rounded-full flex items-center justify-center transition-transform duration-150 ease-out',
              'group-hover/spot:-translate-y-0.5 group-active/spot:translate-y-[5px]',
              skin.face,
              node.status === 'active' && 'path-node-pulse',
              isOpen && 'translate-y-[3px]',
            )}
          >
            <span className="absolute inset-[5px] rounded-full border-2 border-white/25" />
            <span className="absolute top-[7px] left-[15px] w-5 h-2.5 rounded-full bg-white/35 -rotate-[25deg]" />
            <Icon className={cn('relative w-6 h-6', skin.icon)} strokeWidth={2.6} />
          </span>
        </span>

        {node.status === 'completed' && (
          <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#F5A623] border-2 border-white shadow flex items-center justify-center">
            <Star className="w-3 h-3 text-white fill-white" />
          </span>
        )}
        {isLast && node.status === 'completed' && (
          <span className="absolute -bottom-1 -left-1 text-base leading-none">🏁</span>
        )}
      </button>

      {/* Label singkat: hover di desktop, selalu tampil di perangkat sentuh */}
      {!isOpen && (
        <div
          className={cn(
            'spot-label pointer-events-none absolute top-[34px] -translate-y-1/2 w-32 sm:w-40 rounded-xl bg-white/95 border border-slate-100 shadow-md px-2.5 py-1.5 transition-opacity duration-200',
            bubbleOnLeft ? 'right-[4.9rem] text-right' : 'left-[4.9rem] text-left',
            node.status === 'active'
              ? 'opacity-100'
              : 'opacity-0 group-hover/node:opacity-100',
          )}
        >
          <p className={cn(
            'text-[11px] font-bold leading-snug',
            node.status === 'locked' ? 'text-slate-400' : 'text-[#1B2B5E]',
          )}>
            {node.label}
          </p>
        </div>
      )}
    </div>
  );
}

// Kartu detail yang muncul saat spot di-tap
function SpotCard({
  item, prevLabel, onClose,
}: {
  item: NodeItem;
  prevLabel: string | null;
  onClose: () => void;
}) {
  const { node, x, y } = item;
  const KindIcon = kindIcon[node.kind];

  const status = {
    completed: { text: 'Selesai',          className: 'bg-emerald-50 text-emerald-700' },
    active:    { text: 'Spot saat ini',    className: 'bg-amber-50 text-amber-700' },
    locked:    { text: 'Terkunci',         className: 'bg-slate-100 text-slate-500' },
  }[node.status];

  return (
    <div
      data-spot-ui
      role="dialog"
      aria-label={node.label}
      className="spot-card absolute z-30 w-[260px] max-w-[calc(100%-24px)]"
      style={{
        top: `${y + 50}px`,
        left: `clamp(12px, calc(${x}% - 130px), calc(100% - 272px))`,
      }}
    >
      <div className="rounded-2xl bg-white border border-slate-100 shadow-xl shadow-slate-900/10 p-3.5">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            <KindIcon className="w-3.5 h-3.5" />
            {kindLabel[node.kind]}
          </span>
          <div className="flex items-center gap-1.5">
            <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', status.className)}>
              {status.text}
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup"
              className="w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <p className="mt-2 text-sm font-extrabold text-[#1B2B5E] leading-snug" style={{ fontFamily: 'var(--font-jakarta)' }}>
          {node.label}
        </p>
        <p className="mt-1 text-xs text-slate-500 leading-relaxed">{node.tooltip}</p>

        {node.status === 'locked' ? (
          <div className="mt-3 flex items-start gap-2 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2">
            <Lock className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
            <p className="text-[11px] text-slate-500 leading-snug">
              Selesaikan <span className="font-bold text-slate-700">{prevLabel ?? 'spot sebelumnya'}</span> untuk membuka spot ini.
            </p>
          </div>
        ) : (
          <>
            {node.needsUpgrade && (
              <p className="mt-2.5 flex items-center gap-1.5 text-[11px] font-semibold text-blue-600">
                <Crown className="w-3.5 h-3.5" />
                Konten ini membutuhkan paket {node.tier === 'platinum' ? 'Platinum' : 'Premium'}
              </p>
            )}
            <Link
              href={node.href}
              className={cn(
                'mt-3 flex items-center justify-center gap-1.5 w-full rounded-xl py-2.5 text-xs font-extrabold transition-transform active:scale-[0.98]',
                node.status === 'active'
                  ? 'bg-[#F5A623] text-white shadow-[0_4px_0_#c27c0e] active:shadow-none active:translate-y-[4px]'
                  : 'bg-[#1B2B5E] text-white shadow-[0_4px_0_#0f1a3d] active:shadow-none active:translate-y-[4px]',
              )}
            >
              {node.status === 'completed' ? 'Buka lagi' : ctaLabel[node.kind]}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

function SectionHeader({ y, section }: { y: number; section: PathSection }) {
  const doneCount = section.nodes.filter(n => n.status === 'completed').length;
  const isActive  = section.nodes.some(n => n.status === 'active');
  const isDone    = doneCount === section.nodes.length;

  return (
    <div
      data-path-node
      style={{ top: `${y}px` }}
      className="path-node absolute left-1/2 w-[92%] max-w-xs"
    >
      <div className={cn(
        'flex items-center gap-2.5 bg-white/95 backdrop-blur-[2px] rounded-2xl border shadow-sm px-3.5 py-2.5',
        isActive ? 'border-[#F5A623]/40' : 'border-slate-100',
      )}>
        <div className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
          isDone ? 'bg-emerald-50' : isActive ? 'bg-[#F5A623]/15' : 'bg-[#1B2B5E]/8',
        )}>
          {isDone
            ? <Check className="w-4 h-4 text-emerald-600" strokeWidth={3} />
            : <Map className={cn('w-4 h-4', isActive ? 'text-[#F5A623]' : 'text-[#1B2B5E]')} />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-extrabold text-[#1B2B5E] truncate">{section.title}</p>
          <p className="text-[10px] text-slate-400 truncate">{section.countLabel}</p>
        </div>
        <div className="flex-shrink-0 text-right">
          <p className="text-xs font-extrabold text-[#1B2B5E] leading-none">
            {doneCount}<span className="text-slate-300 font-normal">/{section.nodes.length}</span>
          </p>
          <div className="mt-1 w-10 h-1 rounded-full bg-slate-100 overflow-hidden">
            <div
              className={cn('h-full rounded-full', isDone ? 'bg-emerald-500' : 'bg-[#F5A623]')}
              style={{ width: `${(doneCount / section.nodes.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function RoadmapPath({ sections }: RoadmapPathProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const topoRef      = useRef<HTMLDivElement>(null);
  const blobRef      = useRef<HTMLDivElement>(null);
  // Halaman merender 2 instance (desktop & mobile) → id clipPath harus unik.
  const clipId = `road-progress-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;

  const [openId, setOpenId] = useState<string | null>(null);
  const [shake,  setShake]  = useState<{ id: string; n: number } | null>(null);
  const [drawn,  setDrawn]  = useState(false);

  const { items, points, totalHeight } = useMemo(() => buildLayout(sections), [sections]);
  const pathD = useMemo(() => smoothPathD(points), [points]);
  const nodeItems = useMemo(() => items.filter((i): i is NodeItem => i.type === 'node'), [items]);

  const completedCount = nodeItems.filter(i => i.node.status === 'completed').length;
  const progressPct = nodeItems.length > 0 ? Math.round((completedCount / nodeItems.length) * 100) : 0;
  const lastNodeIndex = nodeItems.length - 1;
  const activeIndex = nodeItems.findIndex(i => i.node.status === 'active');
  // Jalan yang sudah dilalui = dari awal sampai spot aktif (atau seluruhnya
  // bila semua selesai). Jalan selalu turun ke bawah, jadi cukup di-clip per y.
  const traveledY = activeIndex >= 0
    ? nodeItems[activeIndex].y
    : completedCount > 0 ? totalHeight : 0;
  const openItem = openId ? nodeItems.find(i => i.node.id === openId) ?? null : null;

  const toggleSpot = useCallback((item: NodeItem) => {
    if (item.node.status === 'locked') {
      setShake(prev => ({ id: item.node.id, n: (prev?.n ?? 0) + 1 }));
    }
    setOpenId(prev => (prev === item.node.id ? null : item.node.id));
  }, []);

  // Garis progres "tergambar" setelah mount (SSR mulai dari 0%).
  // Pakai timer, bukan rAF: rAF tertahan di tab latar belakang sehingga
  // progres bisa tetap kosong.
  useEffect(() => {
    const timer = window.setTimeout(() => setDrawn(true), 60);
    return () => window.clearTimeout(timer);
  }, []);

  // Tutup kartu saat tap di luar spot/kartu atau tekan Escape.
  useEffect(() => {
    if (!openId) return;
    const onPointer = (e: PointerEvent) => {
      if (!(e.target as Element | null)?.closest('[data-spot-ui]')) setOpenId(null);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpenId(null); };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [openId]);

  // Reveal-on-scroll: satu IntersectionObserver untuk semua spot,
  // hanya memicu transform/opacity — murah untuk main thread & GPU-friendly.
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const targets = root.querySelectorAll<HTMLElement>('[data-path-node]');
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' },
    );

    targets.forEach(t => observer.observe(t));
    return () => observer.disconnect();
  }, [items]);

  // Background parallax: layer kontur & blob bergulir lebih lambat dari
  // konten. Satu listener scroll (capture → menangkap scroll container mana
  // pun), di-throttle per frame, hanya menulis transform.
  useEffect(() => {
    const root = containerRef.current;
    if (!root || root.offsetParent === null) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const wrap = (v: number, tile: number) => ((v % tile) + tile) % tile;
    let frame = 0;
    const update = () => {
      frame = 0;
      const scrolled = -root.getBoundingClientRect().top;
      if (topoRef.current) {
        topoRef.current.style.transform = `translate3d(0, ${wrap(scrolled * 0.35, TOPO_TILE)}px, 0)`;
      }
      if (blobRef.current) {
        blobRef.current.style.transform = `translate3d(0, ${wrap(scrolled * 0.6, BLOB_TILE_H)}px, 0)`;
      }
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };

    update();
    window.addEventListener('scroll', onScroll, { passive: true, capture: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll, { capture: true });
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  // Roadmap panjang: bawa user langsung ke spot aktif. Instance yang
  // tersembunyi (desktop vs mobile, display:none) tidak punya offsetParent.
  useEffect(() => {
    const root = containerRef.current;
    if (!root || root.offsetParent === null || activeIndex < 3) return;

    const target = root.querySelector<HTMLElement>('[data-active]');
    if (!target) return;

    // Instan (bukan smooth): scroll ribuan px terasa lambat, dan spot di
    // sekitar spot aktif tetap punya animasi pop-in saat masuk viewport.
    const timer = window.setTimeout(() => {
      target.scrollIntoView({ block: 'center' });
    }, 150);
    return () => window.clearTimeout(timer);
  }, [activeIndex]);

  return (
    <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="relative z-10 bg-white px-5 pt-5 pb-4 border-b border-slate-100">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1B2B5E]/8 flex items-center justify-center flex-shrink-0">
              <Map className="w-4.5 h-4.5 text-[#1B2B5E]" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-[#1B2B5E]" style={{ fontFamily: 'var(--font-jakarta)' }}>
                Peta Perjalanan Belajar
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Tap spot untuk melihat detail dan mulai</p>
            </div>
          </div>
          <div className="flex flex-col items-end flex-shrink-0">
            <span className="text-sm font-extrabold text-[#1B2B5E]">
              {completedCount}
              <span className="text-slate-300 font-normal text-xs">/{nodeItems.length}</span>
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5">{progressPct}% selesai</span>
          </div>
        </div>

        <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#1B2B5E] to-[#F5A623] rounded-full transition-all duration-1000"
            style={{ width: `${drawn ? progressPct : 0}%` }}
          />
        </div>
      </div>

      {/* ── Path map ───────────────────────────────────────── */}
      <div
        ref={containerRef}
        className="relative path-map-bg overflow-hidden"
        style={{ height: `${totalHeight}px` }}
      >
        {/* Background parallax */}
        <div
          ref={blobRef}
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 will-change-transform"
          style={{ top: -BLOB_TILE_H, backgroundImage: BLOB_BG, backgroundSize: `420px ${BLOB_TILE_H}px` }}
        />
        <div
          ref={topoRef}
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 will-change-transform"
          style={{ top: -TOPO_TILE, backgroundImage: TOPO_BG, backgroundSize: `${TOPO_TILE}px ${TOPO_TILE}px` }}
        />

        {/* Jalan */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox={`0 0 100 ${totalHeight}`}
          preserveAspectRatio="none"
          fill="none"
          aria-hidden
        >
          <path d={pathD} stroke="#CBD5E1" strokeWidth="22" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          <path d={pathD} stroke="#E8EDF4" strokeWidth="18" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          {/* Bagian yang sudah dilalui. Sengaja pakai clip vertikal, bukan
              stroke-dasharray: dengan non-scaling-stroke pola dash dihitung
              di ruang layar sehingga berulang dan menggelapkan ujung jalan. */}
          <defs>
            <clipPath id={clipId}>
              <rect
                x="-10"
                y="0"
                width="120"
                height={traveledY}
                className="path-progress"
                style={{ transform: `scaleY(${drawn ? 1 : 0})` }}
              />
            </clipPath>
          </defs>
          {traveledY > 0 && (
            <path
              d={pathD}
              stroke="#1B2B5E"
              strokeWidth="18"
              strokeLinecap="round"
              clipPath={`url(#${clipId})`}
              vectorEffect="non-scaling-stroke"
            />
          )}
          <path
            d={pathD}
            stroke="#FFFFFF"
            strokeWidth="2.5"
            strokeDasharray="7 10"
            strokeLinecap="round"
            opacity="0.9"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {items.map((item) =>
          item.type === 'header'
            ? <SectionHeader key={`h-${item.section.id}`} y={item.y} section={item.section} />
            : (
              <Spot
                key={item.node.id}
                item={item}
                isLast={item.globalIndex === lastNodeIndex}
                isOpen={openId === item.node.id}
                shakeNonce={shake?.id === item.node.id ? shake.n : null}
                onToggle={toggleSpot}
              />
            ),
        )}

        {openItem && (
          <SpotCard
            key={openItem.node.id}
            item={openItem}
            prevLabel={openItem.globalIndex > 0 ? nodeItems[openItem.globalIndex - 1].node.label : null}
            onClose={() => setOpenId(null)}
          />
        )}
      </div>
    </section>
  );
}
