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
    <section className="relative rounded-3xl overflow-hidden shadow-2xl h-64 md:h-80 lg:h-96 xl:h-[420px] mb-8">
      {BANNER_SLIDES.map((slide, index) => (
        <div 
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src={slide.imagePath}
              alt={slide.title}
              fill
              className="object-cover object-center md:object-[75%_center]"
              priority={index === 0}
              sizes="(max-width: 768px) 100vw, 1400px"
              quality={90}
            />
          </div>
          
          {/* Desktop: Gradient Overlay for Dissolve Effect */}
          <div className="hidden md:block absolute inset-0 z-10">
            {/* Main gradient: solid blue left → transparent right */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 from-0% via-blue-600 via-35% to-transparent to-70%" />
            {/* Accent gradient: adds depth */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/40 from-0% via-indigo-700/30 via-35% to-transparent to-65%" />
          </div>
          
          {/* Pattern Overlay */}
          <div 
            className="hidden md:block absolute inset-0 z-10 opacity-10"
            style={{ 
              backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.4\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
              backgroundSize: '60px 60px',
              maskImage: 'linear-gradient(to right, white 0%, white 50%, transparent 75%)',
              WebkitMaskImage: 'linear-gradient(to right, white 0%, white 50%, transparent 75%)'
            }} 
          />
          
          {/* Content Container - REFINED SPACING */}
          <div className="relative z-20 h-full flex flex-col justify-between px-6 md:px-12 lg:px-16 xl:px-20 py-10 md:py-12 lg:py-14 xl:py-16">
            
            {/* DESKTOP: Text Content */}
            <div className="hidden md:block max-w-xl lg:max-w-2xl">
              <div className="inline-block px-3 py-1.5 lg:px-4 lg:py-2 rounded-full bg-white/25 backdrop-blur-sm border border-white/40 text-white text-xs lg:text-sm font-semibold mb-3 lg:mb-4">
                ✨ Edisi Spesial Minggu Ini
              </div>
              <h2 className="text-2xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-extrabold mb-3 lg:mb-4 xl:mb-5 text-white drop-shadow-lg leading-tight">
                {slide.title}
              </h2>
              <p className="text-blue-50 text-base lg:text-lg xl:text-xl mb-0 font-medium leading-relaxed drop-shadow-md">
                {slide.subtitle}
              </p>
            </div>

            {/* DESKTOP: Button at Bottom */}
            <div className="hidden md:block">
              <Link href={slide.buttonLink}>
                <button className="bg-white text-blue-900 px-6 lg:px-9 xl:px-10 py-3 lg:py-3.5 xl:py-4 rounded-full font-bold shadow-xl hover:shadow-2xl hover:bg-blue-50 transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center text-sm lg:text-base xl:text-lg">
                  {slide.buttonText} 
                  <ChevronRight size={18} className="ml-2 lg:w-5 lg:h-5 xl:w-6 xl:h-6" />
                </button>
              </Link>
            </div>

            {/* MOBILE: Button Only (Centered at Bottom) */}
            <div className="md:hidden flex justify-center mt-auto">
              <Link href={slide.buttonLink} className="w-full max-w-xs">
                <button className="w-full bg-white text-blue-900 px-6 py-3 rounded-full font-bold shadow-2xl transition-all flex items-center justify-center text-sm">
                  {slide.buttonText} 
                  <ChevronRight size={16} className="ml-2" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      ))}
      
      {/* Navigation Dots */}
      <div className="absolute bottom-4 lg:bottom-5 xl:bottom-6 left-1/2 md:left-12 lg:left-16 xl:left-20 -translate-x-1/2 md:translate-x-0 z-30 flex space-x-2">
        {BANNER_SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              index === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/60 hover:bg-white/80'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}