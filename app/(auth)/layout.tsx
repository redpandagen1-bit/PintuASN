'use client';

import Image from 'next/image';
import { BookOpen, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function AuthLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  // Testimonials array with 3 testimonials
  const testimonials = [
    {
      quote: "Latihan soalnya sangat mirip dengan ujian aslinya. Alhamdulillah saya lolos SKD dengan skor 458.",
      author: "Rina Aprilia. - Lolos Kementerian Keuangan"
    },
    {
      quote: "Interface-nya user friendly dan soal-soalnya selalu update. Makasih PintuASN, saya diterima di Kemenag!",
      author: "M. Reza. - Lolos Kementerian Agama"
    },
    {
      quote: "Sistem CAT-nya persis seperti aslinya, jadi pas hari H nggak kaget. Highly recommended untuk persiapan CPNS!",
      author: "Estiqomah W. - Lolos Kementerian Hukum dan Hak Asasi Manusia"
    }
  ];

  // State for current testimonial index
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // useEffect for auto-rotating testimonials every 7 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 7000); // 7 seconds
    
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex min-h-screen">
      {/* Left Section - Desktop Only */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between bg-slate-900 p-10 text-white">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/auth-bg.webp"
            alt=""
            fill
            className="object-cover opacity-20"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent" />
        
        {/* Content - relative z-10 */}
        <div className="relative z-10">
          {/* Logo Area */}
          <div className="flex items-center gap-2">
            <Image src="/images/Logo.svg" alt="PintuASN.com" width={32} height={32} />
            <span className="text-xl font-bold">PintuASN.com</span>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-lg space-y-6">
          <h1 className="text-4xl font-extrabold tracking-tight">
            Pintu Masuk Menuju <span className="text-blue-400">Karir ASN Impian</span>
          </h1>
          <p className="text-slate-300">
            Platform tryout CPNS #1 dengan sistem CAT terakurat. Bergabunglah dengan ribuan peserta yang telah lolos seleksi tahun lalu.
          </p>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-blue-400 flex-shrink-0" />
              <span className="text-slate-200">Update Materi 2026</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-blue-400 flex-shrink-0" />
              <span className="text-slate-200">Ranking Nasional Real-time</span>
            </div>
          </div>
        </div>

        {/* Testimonial Carousel - Smooth dissolve transition */}
        <div className="relative z-10">
          <div className="rounded-lg bg-slate-800/50 p-4 backdrop-blur-sm">
            <div className="mb-2 flex items-start gap-2">
              <BookOpen className="h-5 w-5 text-blue-400 mt-0.5" />
              {/* Fixed height container - adjust based on longest testimonial */}
              <div className="relative min-h-[140px] flex-1">
                {testimonials.map((testimonial, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1500 ease-in-out ${
                      index === currentTestimonial ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <blockquote className="space-y-2">
                      <p className="text-sm italic text-slate-300 leading-relaxed">
                        &ldquo;{testimonial.quote}&rdquo;
                      </p>
                      <footer className="text-xs text-slate-400">
                        {testimonial.author}
                      </footer>
                    </blockquote>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex w-full lg:w-1/2 items-center justify-center bg-slate-50 p-8">
        <div className="w-full max-w-[400px] space-y-6">
          {/* Mobile Logo */}
          <div className="flex justify-center lg:hidden">
            <Image src="/images/logo.svg" alt="PintuASN.com" width={40} height={40} />
          </div>
          
          {children}
        </div>
      </div>
    </div>
  );
}
