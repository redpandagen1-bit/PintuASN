'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Clock, 
  BookOpen, 
  CheckCircle, 
  X, 
  ChevronRight 
} from 'lucide-react';

interface TryoutCardProps {
  tryout: {
    id: string;
    title: string;
    date: string;
    duration: string;
    questions: string;
    status: 'available' | 'finished' | 'locked';
    score: number | null;
    category: string;
  };
}

export default function TryoutCard({ tryout }: TryoutCardProps) {
  const isFinished = tryout.status === 'finished';
  const isLocked = tryout.status === 'locked';

  const getCategoryStyle = (cat: string) => {
    switch(cat) {
      case 'Premium': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Free': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Event': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="group bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 flex flex-col h-full hover:border-blue-100/50 relative">
      
      {/* Top Decorative Line */}
      <div className={`h-1.5 w-full ${isLocked ? 'bg-slate-200' : 'bg-gradient-to-r from-blue-400 to-indigo-500'}`} />

      <div className="p-6 flex-1">
        <div className="flex justify-between items-start mb-4">
          <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide border ${getCategoryStyle(tryout.category)}`}>
            {tryout.category}
          </span>
          {isFinished && (
            <span className="text-slate-400 text-xs flex items-center bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
              <CheckCircle size={14} className="mr-1.5 text-emerald-500" /> Selesai
            </span>
          )}
          {isLocked && <div className="p-1.5 bg-slate-100 rounded-full text-slate-400"><X size={14} /></div>}
        </div>
        
        <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-2 group-hover:text-blue-700 transition-colors">
          {tryout.title}
        </h3>
        
        <div className="flex items-center space-x-4 text-slate-500 text-sm mb-5">
          <div className="flex items-center bg-slate-50 px-2 py-1 rounded">
            <Clock size={14} className="mr-1.5 text-slate-400" /> {tryout.duration}
          </div>
          <div className="flex items-center bg-slate-50 px-2 py-1 rounded">
            <BookOpen size={14} className="mr-1.5 text-slate-400" /> {tryout.questions}
          </div>
        </div>

        {isFinished && tryout.score && (
          <div className="mb-4 bg-gradient-to-br from-slate-50 to-white border border-slate-100 p-4 rounded-xl flex justify-between items-center shadow-inner">
            <span className="text-sm font-medium text-slate-600">Nilai Kamu</span>
            <div className="flex items-center">
              <span className={`font-bold text-xl ${tryout.score >= 400 ? 'text-emerald-600' : 'text-slate-700'}`}>
                {tryout.score}
              </span>
              <span className="text-xs text-slate-400 ml-1">/ 550</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-5 pt-0">
        {isFinished ? (
          <Link href={`/dashboard/tryout/${tryout.id}/review`}>
            <button className="w-full py-2.5 rounded-xl border-2 border-slate-100 text-slate-600 font-semibold hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300">
              Lihat Pembahasan
            </button>
          </Link>
        ) : isLocked ? (
          <button className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-400 font-medium cursor-not-allowed flex items-center justify-center space-x-2" disabled>
            <span>Belum Dimulai</span>
          </button>
        ) : (
          <Link href={`/dashboard/tryout/${tryout.id}/start`}>
            <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 flex justify-center items-center group/btn active:scale-95">
              Kerjakan Sekarang 
              <ChevronRight size={18} className="ml-1.5 transition-transform group-hover/btn:translate-x-1" />
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}
