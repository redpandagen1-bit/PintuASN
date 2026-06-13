'use client';

import React, { useState, useEffect, useCallback } from 'react';
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

  useEffect(() => {
    if (total < 2) return;
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [next, total]);

  if (total === 0) return null;

  return (
    <section
      className="relative w-full rounded-3xl overflow-hidden shadow-xl aspect-[16/9] md:aspect-[3/1]"
    >
      {banners.map((b, i) => (
        <Link
          key={b.id}
          href={b.button_link}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
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
          />
          {/* Desktop (3:1) */}
          <Image
            src={b.image_url}
            alt={b.title}
            fill
            className="object-cover hidden md:block"
            priority={i === 0}
            sizes="1200px"
          />
        </Link>
      ))}

      {total > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={e => { e.preventDefault(); setCurrent(i); }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current ? 'w-8 bg-white' : 'w-2 bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}