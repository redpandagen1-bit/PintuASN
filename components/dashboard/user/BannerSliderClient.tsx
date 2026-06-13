'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link  from 'next/link';

interface BannerItem {
  id: string;
  title: string;
  image_url: string;
  image_url_mobile?: string | null;
  button_link: string;
}

export default function BannerSliderClient({ banners }: { banners: BannerItem[] }) {
  const [current, setCurrent] = useState(0);
  const total = banners.length;

  const next = useCallback(() => setCurrent(p => (p + 1) % total), [total]);
  const prev = useCallback(() => setCurrent(p => (p - 1 + total) % total), [total]);

  useEffect(() => {
    if (total < 2) return;
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [next, total]);

  // ── swipe gesture (PWA mobile) ──────────────────────────────
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);
  const dragged     = useRef(false);
  const SWIPE_THRESHOLD = 40;

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
    dragged.current = false;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };
  const onTouchEnd = () => {
    const dx = touchDeltaX.current;
    if (Math.abs(dx) > SWIPE_THRESHOLD) {
      dragged.current = true;        // tandai agar tap tidak ikut membuka link
      if (dx < 0) next(); else prev();
    }
    touchStartX.current = null;
    touchDeltaX.current = 0;
  };

  if (total === 0) return null;

  return (
    <div className="w-full">
      <section
        className="relative w-full rounded-3xl overflow-hidden shadow-xl aspect-[16/9] md:aspect-[3/1]"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {banners.map((b, i) => (
          <Link
            key={b.id}
            href={b.button_link}
            draggable={false}
            onClick={e => { if (dragged.current) { e.preventDefault(); dragged.current = false; } }}
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === current ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {/* Mobile (16:9) — pakai gambar mobile bila ada, fallback ke desktop (di-crop) */}
            <Image
              src={b.image_url_mobile || b.image_url}
              alt={b.title}
              fill
              className="object-cover md:hidden"
              priority={i === 0}
              sizes="100vw"
              draggable={false}
            />
            {/* Desktop (3:1) */}
            <Image
              src={b.image_url}
              alt={b.title}
              fill
              className="object-cover hidden md:block"
              priority={i === 0}
              sizes="1200px"
              draggable={false}
            />
          </Link>
        ))}
      </section>

      {/* Dot navigasi — di bawah banner agar tidak menutupi desain */}
      {total > 1 && (
        <div className="mt-3 flex justify-center gap-2">
          {banners.map((_, i) => (
            <button
              key={i}
              aria-label={`Pindah ke banner ${i + 1}`}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current ? 'w-8 bg-slate-800' : 'w-2 bg-slate-300 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
