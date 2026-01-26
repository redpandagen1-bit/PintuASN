'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { BANNER_SLIDES } from '@/constants/dashboard-data';

export default function BannerSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % BANNER_SLIDES.length);
    }, 5000);
    
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative rounded-3xl overflow-hidden shadow-2xl h-64 md:h-80 mb-8">
      {BANNER_SLIDES.map((slide, index) => (
        <Link 
          href={slide.buttonLink}
          key={slide.id}
          className={`absolute inset-0 cursor-pointer transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          {/* Background Image - Full display, no overlay */}
          <Image
            src={slide.imagePath}
            alt={slide.title}
            fill
            className="object-cover"
            priority={index === 0}
            sizes="(max-width: 768px) 100vw, 1200px"
          />
          
          {/* Badge "Edisi Spesial 2026" - Top Left */}
          <div className="absolute top-6 left-6 md:top-8 md:left-12 z-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs md:text-sm font-semibold shadow-lg">
              <Sparkles size={16} className="text-yellow-300" />
              Edisi Spesial 2026
            </div>
          </div>
        </Link>
      ))}
      
      {/* Navigation Dots - Bottom Left */}
      <div className="absolute bottom-4 md:bottom-6 left-6 md:left-12 z-20 flex space-x-2">
        {BANNER_SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={(e) => {
              e.preventDefault();
              setCurrentSlide(index);
            }}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              index === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/50 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}