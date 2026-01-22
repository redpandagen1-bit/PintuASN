'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
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
        <div 
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          {/* Background Image - Always visible */}
          <Image
            src={slide.imagePath}
            alt={slide.title}
            fill
            className="object-cover"
            priority={index === 0}
            sizes="(max-width: 768px) 100vw, 1200px"
          />
          
          {/* Desktop: Blue gradient overlay LEFT to RIGHT (opaque to transparent) */}
          <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-blue-600/95 via-indigo-600/70 to-transparent" />
          
          {/* Desktop: Pattern overlay on gradient area */}
          <div 
            className="hidden md:block absolute inset-0 opacity-10 bg-repeat"
            style={{ 
              backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.4\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
              backgroundSize: '60px 60px'
            }} 
          />
          
          {/* Content Container */}
          <div className="relative z-20 h-full flex items-center justify-between px-6 md:px-12">
            {/* LEFT: Text + Button (Desktop only) */}
            <div className="hidden md:block max-w-2xl">
              <div className="inline-block px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-semibold mb-3">
                ✨ Edisi Spesial Minggu Ini
              </div>
              <h2 className="text-2xl lg:text-4xl xl:text-5xl font-extrabold mb-3 text-white drop-shadow-lg leading-tight">
                {slide.title}
              </h2>
              <p className="text-blue-50 text-base lg:text-lg mb-6 max-w-lg font-medium leading-relaxed">
                {slide.subtitle}
              </p>
              <Link href={slide.buttonLink}>
                <button className="bg-white text-blue-900 px-6 lg:px-8 py-2.5 lg:py-3 rounded-full font-bold shadow-xl hover:shadow-2xl hover:bg-blue-50 transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center text-sm lg:text-base">
                  {slide.buttonText} 
                  <ChevronRight size={18} className="ml-2" />
                </button>
              </Link>
            </div>

            {/* Mobile: Button only at bottom center */}
            <div className="md:hidden absolute bottom-6 left-0 right-0 flex justify-center">
              <Link href={slide.buttonLink}>
                <button className="bg-white text-blue-900 px-6 py-2.5 rounded-full font-bold shadow-xl hover:shadow-2xl transition-all flex items-center text-sm">
                  {slide.buttonText} 
                  <ChevronRight size={16} className="ml-1.5" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      ))}
      
      {/* Navigation Dots */}
      <div className="absolute bottom-4 md:bottom-6 left-6 md:left-12 z-20 flex space-x-2">
        {BANNER_SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
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
