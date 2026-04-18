'use client';
import { useEffect, useState } from 'react'
import Image from 'next/image';

const examSVG = `<svg viewBox="0 0 420 370" width="100%" style="max-width:620px;filter:drop-shadow(0 24px 64px rgba(0,0,0,0.11));border-radius:16px;overflow:hidden" xmlns="http://www.w3.org/2000/svg">
  <rect width="420" height="370" rx="14" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
  <rect width="420" height="44" rx="14" fill="#1e293b"/>
  <rect y="24" width="420" height="20" fill="#1e293b"/>
  <circle cx="20" cy="22" r="5" fill="#ef4444"/>
  <circle cx="34" cy="22" r="5" fill="#f59e0b"/>
  <circle cx="48" cy="22" r="5" fill="#22c55e"/>
  <rect x="66" y="13" width="288" height="18" rx="5" fill="rgba(255,255,255,0.07)"/>
  <text x="210" y="25" font-family="sans-serif" font-size="9" fill="rgba(255,255,255,0.4)" text-anchor="middle">pintuasn.com/ujian/sesi-1</text>
  <rect x="360" y="10" width="50" height="24" rx="6" fill="#0077B6"/>
  <text x="385" y="25" font-family="sans-serif" font-size="11" font-weight="700" fill="#ffffff" text-anchor="middle">12:47</text>
  <rect y="44" width="420" height="36" fill="#f8fafc"/>
  <rect y="79" width="420" height="1" fill="#e2e8f0"/>
  <text x="20" y="67" font-family="sans-serif" font-size="11" font-weight="700" fill="#1e293b">TWK: Wawasan Kebangsaan</text>
  <text x="320" y="67" font-family="sans-serif" font-size="11" fill="#94a3b8">Soal 15/30</text>
  <rect x="0" y="79" width="420" height="3" fill="#f1f5f9"/>
  <rect x="0" y="79" width="210" height="3" fill="#0077B6"/>
  <rect x="16" y="92" width="388" height="72" rx="8" fill="#fff" stroke="#e2e8f0" stroke-width="1"/>
  <text x="28" y="110" font-family="sans-serif" font-size="10" font-weight="700" fill="#0077B6">Soal No. 15</text>
  <text x="28" y="126" font-family="sans-serif" font-size="10.5" fill="#334155">Contoh penerapan nilai Pancasila sila ke-3</text>
  <text x="28" y="141" font-family="sans-serif" font-size="10.5" fill="#334155">dalam kehidupan berbangsa adalah...</text>
  <text x="28" y="156" font-family="sans-serif" font-size="9.5" fill="#94a3b8">Pilih jawaban yang paling tepat</text>
  <rect x="16" y="172" width="388" height="26" rx="7" fill="#1e293b" stroke="#1e293b" stroke-width="1"/>
  <text x="34" y="189" font-family="sans-serif" font-size="10" font-weight="700" fill="#0077B6">A</text>
  <text x="48" y="189" font-family="sans-serif" font-size="10" fill="#ffffff">Menjaga persatuan dan kesatuan bangsa</text>
  <rect x="16" y="202" width="388" height="26" rx="7" fill="#fff" stroke="#e2e8f0" stroke-width="1"/>
  <text x="34" y="219" font-family="sans-serif" font-size="10" font-weight="700" fill="#94a3b8">B</text>
  <text x="48" y="219" font-family="sans-serif" font-size="10" fill="#475569">Mengutamakan kepentingan pribadi</text>
  <rect x="16" y="232" width="388" height="26" rx="7" fill="#fff" stroke="#e2e8f0" stroke-width="1"/>
  <text x="34" y="249" font-family="sans-serif" font-size="10" font-weight="700" fill="#94a3b8">C</text>
  <text x="48" y="249" font-family="sans-serif" font-size="10" fill="#475569">Bermusyawarah untuk golongan sendiri</text>
  <rect x="16" y="262" width="388" height="26" rx="7" fill="#fff" stroke="#e2e8f0" stroke-width="1"/>
  <text x="34" y="279" font-family="sans-serif" font-size="10" font-weight="700" fill="#94a3b8">D</text>
  <text x="48" y="279" font-family="sans-serif" font-size="10" fill="#475569">Mendahulukan hak daripada kewajiban</text>
  <rect x="16" y="292" width="388" height="26" rx="7" fill="#fff" stroke="#e2e8f0" stroke-width="1"/>
  <text x="34" y="309" font-family="sans-serif" font-size="10" font-weight="700" fill="#94a3b8">E</text>
  <text x="48" y="309" font-family="sans-serif" font-size="10" fill="#475569">Menghormati perbedaan suku dan budaya</text>
  <rect y="329" width="420" height="41" fill="#f8fafc"/>
  <rect y="329" width="420" height="1" fill="#e2e8f0"/>
  <rect x="16" y="339" width="70" height="22" rx="6" fill="#fff" stroke="#e2e8f0" stroke-width="1"/>
  <text x="51" y="354" font-family="sans-serif" font-size="10" fill="#64748b" text-anchor="middle">Sebelum</text>
  <rect x="334" y="339" width="70" height="22" rx="6" fill="#1e293b"/>
  <text x="369" y="354" font-family="sans-serif" font-size="10" fill="#ffffff" text-anchor="middle">Berikut</text>
  <g transform="translate(100,347)">
    <rect x="0" y="0" width="8" height="8" rx="2" fill="#22c55e"/>
    <rect x="11" y="0" width="8" height="8" rx="2" fill="#22c55e"/>
    <rect x="22" y="0" width="8" height="8" rx="2" fill="#22c55e"/>
    <rect x="33" y="0" width="8" height="8" rx="2" fill="#22c55e"/>
    <rect x="44" y="0" width="8" height="8" rx="2" fill="#0077B6"/>
    <rect x="55" y="0" width="8" height="8" rx="2" fill="#e2e8f0"/>
    <rect x="66" y="0" width="8" height="8" rx="2" fill="#e2e8f0"/>
    <rect x="77" y="0" width="8" height="8" rx="2" fill="#e2e8f0"/>
    <text x="98" y="9" font-family="sans-serif" font-size="9" fill="#94a3b8">+21</text>
  </g>
</svg>`;

const dashboardSVG = `<svg viewBox="0 0 860 430" width="100%" xmlns="http://www.w3.org/2000/svg" style="background:#f1f5f9;display:block">
  <defs>
    <linearGradient id="upGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#334155"/>
    </linearGradient>
    <clipPath id="sideClip"><rect width="200" height="430" rx="0"/></clipPath>
  </defs>
  <rect x="0" y="0" width="860" height="44" fill="#ffffff" stroke="#e2e8f0" stroke-width="0.5"/>
  <g transform="translate(8,5) scale(0.082)">
    <path fill="#eea32f" d="M388.22,214.06h-14.5l-1.5,1.5v200.3h-47c.4-1.03-1-2.22-1-2.5v-198.31c-4.4-1.54-8.91-.91-13.51-1-1.52-.03-2.89.72-2.49-1.49l37.98-42.98c3.06-1.58,4.59.38,6.53,2.49,6.53,7.09,12.55,14.82,18.96,22.02,4.04,4.54,12.58,11.94,15.57,16.42.84,1.26,1.24,1.92.96,3.54Z"/>
    <path fill="#26a1ac" d="M372.22,181.09c-1.71.42-1.99-.66-3-1.49-6.91-5.76-12.97-15.07-19.45-21.52l-3-1.01-14,17.09-7.54,6.95c-.25-6.81.3-13.71.04-20.53-1.05-27.43-5.7-52.36-24.06-73.87-34.8-40.79-93.09-53.39-139.33-23.32-5.72,3.72-10.73,10.09-17.1,11.84l-40.55-23.48c16.3-19.17,37.69-34.03,61.47-42.49,68.91-24.51,142.66,1.02,182.35,61.64,21.53,32.89,25.64,71.61,24.17,110.21Z"/>
    <path fill="#183f65" d="M50.22,235.04c-.1-2.21-.59-10.52.94-11.55,1.76-1.17,9.8-.64,12.05.56.09-1.61-.91-2.81-1.04-4.45-1.05-14.01,2.27-28.01,1.09-42.05-.09-1.02-.44-3.45-1.55-3.45h-22c-.51,0-4.67,3.52-7.24,3.82-9.37,1.07-11.66-13.63-2.7-14.79,5.83-.75,7.3,3.45,8.89,3.63.77.09,2.54-.71,4-.7,12.1.04,25.16-.63,37.1,0,1.73.09,2.91.16,4.45,1.05v-6s-20.99-1-20.99-1V39.23l136.83,75.09.12,206.19c.65,3.85,2.48,16.48.05,18.93-16.05,9.25-32.3,18.18-48.32,27.47-19.92,11.56-41.19,22.91-61,34.97-5.53,3.37-13.15,9.33-18.4,11.95-1.51.76-9.46,3.85-10.28,3.03l1-107.89h-16.5c-.85,0-2.3,4.79-7.95,3.98-11.43-1.64-7.12-17.74,2.5-14.54,1.79.59,4.16,3.57,4.45,3.57h38.5v-6.99h-34v-13.99h13v-25.97l-20-1c.13-3.64-.17-7.35,0-10.99,3.56-.57,19.15,1.17,20.56-.94l.44-7.06h-14Z"/>
  </g>
  <text x="42" y="26" font-family="sans-serif" font-size="11" font-weight="800" fill="#1e293b">PintuASN</text>
  <text x="210" y="20" font-family="sans-serif" font-size="10" font-weight="700" fill="#1e293b">Halo, Yan!</text>
  <text x="210" y="33" font-family="sans-serif" font-size="9" fill="#94a3b8">Semangat Belajar!</text>
  <rect x="700" y="10" width="76" height="24" rx="7" fill="#1e293b"/>
  <text x="738" y="26" font-family="sans-serif" font-size="9" font-weight="700" fill="#f3c305" text-anchor="middle">Roadmap</text>
  <circle cx="820" cy="22" r="14" fill="#0077B6"/>
  <text x="820" y="27" font-family="sans-serif" font-size="10" font-weight="800" fill="#ffffff" text-anchor="middle">YA</text>
  <text x="836" y="18" font-family="sans-serif" font-size="8" font-weight="600" fill="#1e293b">Yan</text>
  <text x="836" y="28" font-family="sans-serif" font-size="7" fill="#94a3b8">Member Gratis</text>
  <rect x="8" y="52" width="188" height="372" rx="16" fill="#ffffff" stroke="#e2e8f0" stroke-width="0.8"/>
  <text x="22" y="74" font-family="sans-serif" font-size="8" font-weight="700" fill="#94a3b8" letter-spacing="1.2">MENU UTAMA</text>
  <rect x="26" y="82" width="4" height="4" rx="0.8" fill="#94a3b8"/>
  <rect x="31" y="82" width="4" height="4" rx="0.8" fill="#94a3b8"/>
  <rect x="26" y="87" width="4" height="4" rx="0.8" fill="#94a3b8"/>
  <rect x="31" y="87" width="4" height="4" rx="0.8" fill="#94a3b8"/>
  <text x="42" y="91" font-family="sans-serif" font-size="10" fill="#475569">Dashboard</text>
  <rect x="14" y="100" width="170" height="22" rx="7" fill="#1e293b"/>
  <rect x="26" y="108" width="3" height="7" rx="0.5" fill="#f3c305"/>
  <rect x="30" y="106" width="3" height="9" rx="0.5" fill="#f3c305"/>
  <rect x="34" y="110" width="3" height="5" rx="0.5" fill="#f3c305"/>
  <text x="44" y="115" font-family="sans-serif" font-size="10" font-weight="700" fill="#f3c305">Statistik</text>
  <circle cx="178" cy="111" r="3" fill="#d5b30d"/>
  <path d="M 26,128 L 26,137 Q 30.5,135 35,137 L 35,128 Z" fill="none" stroke="#94a3b8" stroke-width="1.1" stroke-linejoin="round"/>
  <line x1="30.5" y1="128" x2="30.5" y2="136.5" stroke="#94a3b8" stroke-width="0.8"/>
  <text x="42" y="137" font-family="sans-serif" font-size="10" fill="#475569">Materi</text>
  <circle cx="30" cy="155" r="5.5" fill="none" stroke="#94a3b8" stroke-width="1.1"/>
  <path d="M 28.2,152.5 L 33,155 L 28.2,157.5 Z" fill="#94a3b8"/>
  <text x="42" y="159" font-family="sans-serif" font-size="10" fill="#475569">Daftar Tryout</text>
  <circle cx="30" cy="175" r="5.5" fill="none" stroke="#94a3b8" stroke-width="1.1"/>
  <line x1="30" y1="170.5" x2="30" y2="175" stroke="#94a3b8" stroke-width="1.1"/>
  <line x1="30" y1="175" x2="33" y2="177" stroke="#94a3b8" stroke-width="1.1"/>
  <text x="42" y="179" font-family="sans-serif" font-size="10" fill="#475569">Riwayat &amp; Pembahasan</text>
  <path d="M 24,194 L 26,194 L 28.5,201 L 36,201 L 37.5,197 L 28.5,197" fill="none" stroke="#94a3b8" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="30" cy="203.5" r="1.3" fill="#94a3b8"/>
  <circle cx="35" cy="203.5" r="1.3" fill="#94a3b8"/>
  <text x="42" y="202" font-family="sans-serif" font-size="10" fill="#475569">Beli Paket</text>
  <line x1="18" y1="214" x2="186" y2="214" stroke="#f1f5f9" stroke-width="1"/>
  <text x="22" y="228" font-family="sans-serif" font-size="8" font-weight="700" fill="#94a3b8" letter-spacing="1.2">LAINNYA</text>
  <path d="M 34,235 L 27.5,243 L 31.5,243 L 27,251 L 37,241 L 32.5,241 Z" fill="none" stroke="#94a3b8" stroke-width="1.1" stroke-linejoin="round" stroke-linecap="round"/>
  <text x="42" y="245" font-family="sans-serif" font-size="10" fill="#475569">Event &amp; Promo</text>
  <circle cx="28.5" cy="264" r="3.5" fill="none" stroke="#94a3b8" stroke-width="1.1"/>
  <path d="M 23,274 Q 23,269 28.5,269 Q 34,269 34,274" fill="none" stroke="#94a3b8" stroke-width="1.1"/>
  <circle cx="35.5" cy="264" r="2.8" fill="none" stroke="#94a3b8" stroke-width="0.9"/>
  <path d="M 33.5,274 Q 33.5,271 37.5,271" fill="none" stroke="#94a3b8" stroke-width="0.9"/>
  <text x="42" y="270" font-family="sans-serif" font-size="10" fill="#475569">Grup</text>
  <rect x="14" y="284" width="172" height="122" rx="14" fill="#f8fafc" stroke="#e2e8f0" stroke-width="0.8"/>
  <rect x="22" y="294" width="48" height="48" rx="12" fill="#0077B6"/>
  <text x="46" y="326" font-family="sans-serif" font-size="22" font-weight="800" fill="#ffffff" text-anchor="middle">P</text>
  <text x="22" y="360" font-family="sans-serif" font-size="13" font-weight="800" fill="#1e293b">PintuASN</text>
  <text x="22" y="375" font-family="sans-serif" font-size="9" fill="#94a3b8">Simulasi CAT SKD CPNS</text>
  <text x="22" y="388" font-family="sans-serif" font-size="9" fill="#94a3b8">Terpercaya di Indonesia</text>
  <text x="102" y="422" font-family="sans-serif" font-size="8" fill="#94a3b8" text-anchor="middle">© 2026 PintuASN. v1.0.0</text>
  <rect x="206" y="52" width="152" height="76" rx="10" fill="#ffffff" stroke="#e8edf2" stroke-width="0.5"/>
  <rect x="218" y="62" width="26" height="26" rx="7" fill="#1e293b"/>
  <text x="231" y="79" font-family="sans-serif" font-size="12" fill="#0077B6" text-anchor="middle">📄</text>
  <text x="250" y="72" font-family="sans-serif" font-size="9" fill="#94a3b8">Total Tryout</text>
  <text x="250" y="98" font-family="sans-serif" font-size="18" font-weight="800" fill="#1e293b">3</text>
  <text x="250" y="114" font-family="sans-serif" font-size="8" fill="#94a3b8">Paket Selesai</text>
  <rect x="366" y="52" width="152" height="76" rx="10" fill="#ffffff" stroke="#e8edf2" stroke-width="0.5"/>
  <rect x="378" y="62" width="26" height="26" rx="7" fill="#1e293b"/>
  <text x="391" y="79" font-family="sans-serif" font-size="12" fill="#0077B6" text-anchor="middle">🏆</text>
  <text x="412" y="72" font-family="sans-serif" font-size="9" fill="#94a3b8">Skor Tertinggi</text>
  <text x="412" y="98" font-family="sans-serif" font-size="18" font-weight="800" fill="#1e293b">68</text>
  <text x="412" y="114" font-family="sans-serif" font-size="8" fill="#94a3b8">dari 550</text>
  <rect x="526" y="52" width="152" height="76" rx="10" fill="#ffffff" stroke="#e8edf2" stroke-width="0.5"/>
  <rect x="538" y="62" width="26" height="26" rx="7" fill="#1e293b"/>
  <text x="551" y="79" font-family="sans-serif" font-size="12" fill="#0077B6" text-anchor="middle">📈</text>
  <text x="572" y="72" font-family="sans-serif" font-size="9" fill="#94a3b8">Rata-rata Skor</text>
  <text x="572" y="98" font-family="sans-serif" font-size="18" font-weight="800" fill="#1e293b">23</text>
  <text x="572" y="114" font-family="sans-serif" font-size="8" fill="#94a3b8">Stabil</text>
  <rect x="686" y="52" width="162" height="76" rx="10" fill="#ffffff" stroke="#e8edf2" stroke-width="0.5"/>
  <rect x="698" y="62" width="26" height="26" rx="7" fill="#1e293b"/>
  <text x="711" y="79" font-family="sans-serif" font-size="12" fill="#0077B6" text-anchor="middle">✓</text>
  <text x="732" y="72" font-family="sans-serif" font-size="9" fill="#94a3b8">Tingkat Kelulusan</text>
  <text x="732" y="98" font-family="sans-serif" font-size="18" font-weight="800" fill="#1e293b">0%</text>
  <text x="732" y="114" font-family="sans-serif" font-size="8" fill="#94a3b8">Passing Grade</text>
  <rect x="206" y="138" width="472" height="196" rx="10" fill="#ffffff" stroke="#e8edf2" stroke-width="0.5"/>
  <text x="224" y="158" font-family="sans-serif" font-size="11" font-weight="700" fill="#1e293b">Tren Performa Skor</text>
  <text x="224" y="171" font-family="sans-serif" font-size="9" fill="#94a3b8">Perbandingan skor Anda vs Rata-rata</text>
  <circle cx="572" cy="155" r="4" fill="#1e293b"/>
  <text x="580" y="159" font-family="sans-serif" font-size="8" fill="#475569">Skor Kamu</text>
  <circle cx="630" cy="155" r="4" fill="#cbd5e1"/>
  <text x="638" y="159" font-family="sans-serif" font-size="8" fill="#475569">Rata-rata</text>
  <text x="224" y="314" font-family="sans-serif" font-size="8" fill="#94a3b8" text-anchor="end">0</text>
  <text x="224" y="285" font-family="sans-serif" font-size="8" fill="#94a3b8" text-anchor="end">150</text>
  <text x="224" y="254" font-family="sans-serif" font-size="8" fill="#94a3b8" text-anchor="end">300</text>
  <text x="224" y="225" font-family="sans-serif" font-size="8" fill="#94a3b8" text-anchor="end">450</text>
  <text x="224" y="196" font-family="sans-serif" font-size="8" fill="#94a3b8" text-anchor="end">550</text>
  <line x1="230" y1="311" x2="662" y2="311" stroke="#f1f5f9" stroke-width="1"/>
  <line x1="230" y1="282" x2="662" y2="282" stroke="#f1f5f9" stroke-width="1"/>
  <line x1="230" y1="253" x2="662" y2="253" stroke="#f1f5f9" stroke-width="1"/>
  <line x1="230" y1="224" x2="662" y2="224" stroke="#f1f5f9" stroke-width="1"/>
  <line x1="230" y1="193" x2="662" y2="193" stroke="#f1f5f9" stroke-width="1"/>
  <path d="M 270,305 Q 340,302 410,306 Q 480,302 550,305 Q 610,302 650,305" fill="none" stroke="#1e293b" stroke-width="2" stroke-linejoin="round"/>
  <path d="M 270,305 Q 340,303 410,305 Q 480,303 550,305 Q 610,303 650,305" fill="none" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="4 4"/>
  <text x="270" y="323" font-family="sans-serif" font-size="8" fill="#94a3b8" text-anchor="middle">TO-1</text>
  <text x="410" y="323" font-family="sans-serif" font-size="8" fill="#94a3b8" text-anchor="middle">TO-2</text>
  <text x="550" y="323" font-family="sans-serif" font-size="8" fill="#94a3b8" text-anchor="middle">TO-3</text>
  <rect x="686" y="138" width="162" height="196" rx="10" fill="#1e293b"/>
  <text x="704" y="160" font-family="sans-serif" font-size="10" font-weight="700" fill="rgba(255,255,255,0.85)">Peringkat Nasional</text>
  <rect x="818" y="146" width="22" height="22" rx="6" fill="rgba(0,119,182,0.12)"/>
  <text x="829" y="161" font-family="sans-serif" font-size="12" fill="#0077B6" text-anchor="middle">🏆</text>
  <text x="704" y="192" font-family="sans-serif" font-size="26" font-weight="800" fill="#0077B6">#4</text>
  <text x="738" y="192" font-family="sans-serif" font-size="9" fill="rgba(255,255,255,0.45)">/ 5 user</text>
  <text x="704" y="212" font-family="sans-serif" font-size="9" fill="rgba(255,255,255,0.55)">Rata-rata Anda</text>
  <text x="836" y="212" font-family="sans-serif" font-size="9" font-weight="700" fill="#fff" text-anchor="end">23</text>
  <rect x="704" y="218" width="132" height="4" rx="2" fill="rgba(255,255,255,0.1)"/>
  <rect x="704" y="218" width="40" height="4" rx="2" fill="#3b82f6"/>
  <text x="704" y="234" font-family="sans-serif" font-size="8" fill="rgba(255,255,255,0.4)">Anda lebih unggul dari 20%</text>
  <text x="704" y="244" font-family="sans-serif" font-size="8" fill="rgba(255,255,255,0.4)">peserta lain.</text>
  <line x1="704" y1="254" x2="836" y2="254" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
  <text x="704" y="267" font-family="sans-serif" font-size="9" font-weight="700" fill="rgba(255,255,255,0.75)">Distribusi Per Kategori</text>
  <text x="704" y="283" font-family="sans-serif" font-size="8" fill="rgba(255,255,255,0.5)">Wawasan</text>
  <text x="836" y="283" font-family="sans-serif" font-size="8" fill="rgba(255,255,255,0.5)" text-anchor="end">0% Lulus</text>
  <rect x="704" y="287" width="132" height="3" rx="1" fill="rgba(255,255,255,0.1)"/>
  <text x="704" y="301" font-family="sans-serif" font-size="8" fill="rgba(255,255,255,0.5)">Intelegensia</text>
  <text x="836" y="301" font-family="sans-serif" font-size="8" fill="rgba(255,255,255,0.5)" text-anchor="end">0% Lulus</text>
  <rect x="704" y="305" width="132" height="3" rx="1" fill="rgba(255,255,255,0.1)"/>
  <text x="704" y="319" font-family="sans-serif" font-size="8" fill="rgba(255,255,255,0.5)">Karakteristik</text>
  <text x="836" y="319" font-family="sans-serif" font-size="8" fill="rgba(255,255,255,0.5)" text-anchor="end">0% Lulus</text>
  <rect x="704" y="323" width="132" height="3" rx="1" fill="rgba(255,255,255,0.1)"/>
  <rect x="206" y="344" width="310" height="78" rx="10" fill="#ffffff" stroke="#e8edf2" stroke-width="0.5"/>
  <text x="224" y="364" font-family="sans-serif" font-size="10" font-weight="700" fill="#1e293b">Gap Nilai Minimum (Passing Grade)</text>
  <text x="224" y="376" font-family="sans-serif" font-size="8" fill="#94a3b8">Posisi skor rata-rata kamu vs Ambang Batas</text>
  <text x="224" y="393" font-family="sans-serif" font-size="8" fill="#475569">TWK</text>
  <rect x="248" y="386" width="90" height="6" rx="3" fill="#e2e8f0"/>
  <rect x="248" y="386" width="18" height="6" rx="3" fill="#ef4444"/>
  <text x="224" y="407" font-family="sans-serif" font-size="8" fill="#475569">TIU</text>
  <rect x="248" y="400" width="90" height="6" rx="3" fill="#e2e8f0"/>
  <rect x="248" y="400" width="12" height="6" rx="3" fill="#ef4444"/>
  <rect x="524" y="344" width="324" height="78" rx="10" fill="#ffffff" stroke="#e8edf2" stroke-width="0.5"/>
  <text x="542" y="364" font-family="sans-serif" font-size="10" font-weight="700" fill="#1e293b">Distribusi Skor Peserta</text>
  <text x="542" y="376" font-family="sans-serif" font-size="8" fill="#94a3b8">Posisi kamu dalam kurva peserta</text>
  <path d="M 548,410 Q 580,395 620,388 Q 660,395 700,390 Q 730,398 760,406 Q 790,402 820,405" fill="none" stroke="#6366f1" stroke-width="1.5"/>
  <path d="M 548,410 Q 580,395 620,388 Q 660,395 700,390 Q 730,398 760,406 Q 790,402 820,405 L 820,415 L 548,415 Z" fill="rgba(99,102,241,0.08)"/>
</svg>`;

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const nav = document.getElementById('navbar');
    const handleScroll = () => nav?.classList.toggle('scrolled', window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);

    const handleResize = () => { if (window.innerWidth > 768) setMenuOpen(false); };
    window.addEventListener('resize', handleResize);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    function animateCount(el: Element) {
      const target = parseFloat((el as HTMLElement).dataset.target || '0');
      const isDecimal = String((el as HTMLElement).dataset.target).includes('.');
      const duration = 1800;
      const start = performance.now();
      const run = (t: number) => {
        const p = Math.min((t - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        (el as HTMLElement).textContent = isDecimal
          ? (target * eased).toFixed(1)
          : Math.floor(target * eased).toLocaleString('id-ID');
        if (p < 1) requestAnimationFrame(run);
        else (el as HTMLElement).textContent = isDecimal ? target.toFixed(1) : target.toLocaleString('id-ID');
      };
      requestAnimationFrame(run);
    }

    const statObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.querySelectorAll('[data-target]').forEach(animateCount);
          statObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.3 });
    const sb = document.querySelector('.stats-inner');
    if (sb) statObs.observe(sb);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
      statObs.disconnect();
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  function toggleFaq(btn: HTMLElement) {
    const body = btn.nextElementSibling as HTMLElement;
    const isOpen = btn.classList.contains('open');
    document.querySelectorAll('.faq-btn.open').forEach(b => {
      b.classList.remove('open');
      (b.nextElementSibling as HTMLElement).style.maxHeight = '0';
    });
    if (!isOpen) { btn.classList.add('open'); body.style.maxHeight = body.scrollHeight + 'px'; }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "PintuASN",
          "url": "https://pintuasn.com",
          "logo": "https://pintuasn.com/images/Logo.svg",
          "description": "Platform simulasi CAT SKD CPNS terpercaya di Indonesia",
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.9",
            "reviewCount": "12186"
          }
        })}}
      />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}
        :root{
          --white:#ffffff;
          --s50:#f8fafc;
          --s100:#f1f5f9;
          --s200:#e2e8f0;
          --s400:#94a3b8;
          --s600:#475569;
          --s800:#1e293b;
          --s900:#0f172a;
          --y:#0077B6;
          --yl:#EFF6FF;
          --yd:#005A8E;
          --font-d:'Plus Jakarta Sans',sans-serif;
          --font-b:'Plus Jakarta Sans',sans-serif;
        }
        html{scroll-behavior:smooth}
        body{font-family:var(--font-b);background:#fff;color:var(--s800);overflow-x:hidden}

        @keyframes floatY{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-14px) rotate(-2deg)}}
        @keyframes floatY2{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes fadeSlideUp{from{opacity:0;transform:translateY(32px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.45}}
        @keyframes scrollticker{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        @keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}

        .hero-title{animation:fadeSlideUp .8s ease both}
        .hero-sub{animation:fadeSlideUp .8s .15s ease both}
        .hero-cta{animation:fadeSlideUp .8s .3s ease both}
        .hero-proof{animation:fadeSlideUp .8s .45s ease both}
        .hero-mockup{animation:fadeIn .9s .3s ease both}
        .mockup-float{animation:floatY 5s ease-in-out infinite}
        .mockup-float2{animation:floatY2 4.5s ease-in-out infinite .5s}

        .reveal{opacity:0;transform:translateY(28px);transition:opacity .7s cubic-bezier(.4,0,.2,1),transform .7s cubic-bezier(.4,0,.2,1)}
        .reveal.visible{opacity:1;transform:translateY(0)}

        nav{position:fixed;top:0;left:0;right:0;z-index:200;background:rgba(255,255,255,0.94);backdrop-filter:blur(16px);border-bottom:1px solid var(--s100);transition:box-shadow .3s}
        nav.scrolled{box-shadow:0 4px 24px rgba(0,0,0,0.07)}
        .nav-inner{max-width:1180px;margin:0 auto;padding:0 28px;height:68px;display:flex;align-items:center;justify-content:space-between;gap:20px}
        .logo{display:flex;align-items:center;gap:10px;font-family:var(--font-d);font-weight:800;font-size:21px;color:var(--s900);text-decoration:none}
        .logo-badge{width:34px;height:34px;background:var(--y);border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:17px}
        .nav-links{display:flex;gap:28px;list-style:none}
        .nav-links a{font-size:14px;font-weight:600;color:var(--s600);text-decoration:none;transition:color .2s}
        .nav-links a:hover{color:var(--s900)}
        .nav-btns{display:flex;gap:10px;align-items:center}
        .btn-ghost{padding:8px 18px;font-size:14px;font-weight:600;color:var(--s800);border:1.5px solid var(--s200);border-radius:9px;text-decoration:none;transition:all .2s;background:transparent}
        .btn-ghost:hover{border-color:var(--s800);background:var(--s50)}
        .btn-primary{padding:9px 20px;font-size:14px;font-weight:700;color:#fff;background:var(--y);border-radius:9px;text-decoration:none;transition:all .2s}
        .btn-primary:hover{background:var(--yd);transform:translateY(-1px)}

        .hamburger{display:none;flex-direction:column;justify-content:center;gap:5px;cursor:pointer;padding:8px;border:none;background:transparent;z-index:300;border-radius:8px;transition:background .2s}
        .hamburger:hover{background:var(--s100)}
        .hamburger span{display:block;width:22px;height:2px;background:var(--s800);border-radius:2px;transition:all .3s ease}
        .hamburger.open span:nth-child(1){transform:translateY(7px) rotate(45deg)}
        .hamburger.open span:nth-child(2){opacity:0;transform:scaleX(0)}
        .hamburger.open span:nth-child(3){transform:translateY(-7px) rotate(-45deg)}

        .mobile-menu{display:none;position:fixed;top:68px;left:0;right:0;bottom:0;background:#fff;z-index:150;flex-direction:column;padding:8px 20px 24px;overflow-y:auto;animation:slideDown .25s ease both}
        .mobile-menu.open{display:flex}
        .mobile-menu-links{display:flex;flex-direction:column}
        .mobile-menu-links a{font-size:16px;font-weight:600;color:var(--s800);text-decoration:none;padding:16px 4px;border-bottom:1px solid var(--s100);display:flex;align-items:center;justify-content:space-between;transition:color .2s}
        .mobile-menu-links a:hover{color:var(--y)}
        .mobile-menu-links a::after{content:'›';font-size:20px;color:var(--s400)}
        .mobile-menu-btns{display:flex;flex-direction:column;gap:10px;margin-top:20px}
        .mobile-menu-btns a{text-align:center;padding:13px 20px;font-size:15px;font-weight:700;border-radius:10px;text-decoration:none;transition:all .2s}
        .mobile-menu-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.3);z-index:140;top:68px}
        .mobile-menu-overlay.open{display:block}

        .hero{min-height:100vh;display:flex;align-items:center;padding:120px 28px 80px;background:#fff;position:relative;overflow:hidden}
        .hero::before{content:'';position:absolute;top:-80px;right:-80px;width:560px;height:560px;border-radius:50%;background:radial-gradient(circle,rgba(0,119,182,.08) 0%,transparent 70%);pointer-events:none}
        .hero-grid{max-width:1180px;margin:0 auto;width:100%;display:grid;grid-template-columns:1fr 1.2fr;gap:50px;align-items:center}
        .hero-label{display:inline-flex;align-items:center;gap:8px;background:var(--yl);border:1px solid rgba(0,119,182,.35);border-radius:50px;padding:6px 14px;font-size:13px;font-weight:600;color:var(--yd);margin-bottom:24px}
        .hero-label-dot{width:7px;height:7px;border-radius:50%;background:var(--y);animation:pulse 1.8s ease infinite}
        .hero-heading{font-family:var(--font-d);font-weight:800;font-size:clamp(34px,4.5vw,54px);line-height:1.13;color:var(--s900);margin-bottom:22px;letter-spacing:-1px}
        .hero-heading em{font-style:normal;color:var(--y);position:relative;display:inline-block}
        .hero-heading em::after{content:'';position:absolute;bottom:-2px;left:0;right:0;height:3px;background:var(--y);border-radius:2px;opacity:.35}
        .hero-subtext{font-size:17px;line-height:1.75;color:var(--s600);margin-bottom:38px;max-width:480px}
        .hero-cta-row{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:40px}
        .cta-big{padding:14px 30px;font-size:16px;font-weight:700;border-radius:11px;text-decoration:none;display:inline-flex;align-items:center;gap:8px;transition:all .2s}
        .cta-yellow{background:var(--y);color:#fff;box-shadow:0 4px 20px rgba(0,119,182,.3)}
        .cta-yellow:hover{background:var(--yd);transform:translateY(-2px);box-shadow:0 8px 28px rgba(0,119,182,.35)}
        .cta-outline{background:transparent;color:var(--s800);border:1.5px solid var(--s200)}
        .cta-outline:hover{border-color:var(--s800);background:var(--s50)}
        .hero-proof{display:flex;align-items:center;gap:14px}
        .proof-avatars{display:flex}
        .proof-avatar{width:33px;height:33px;border-radius:50%;border:2.5px solid #fff;margin-left:-10px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#fff}
        .proof-avatar:first-child{margin-left:0}
        .proof-text{font-size:13.5px;color:var(--s600)}
        .proof-text strong{color:var(--s900)}
        .stars{color:var(--y);letter-spacing:2px;font-size:13px}
        .hero-right{position:relative;display:flex;justify-content:center;align-items:center}
        .mockup-wrap{position:relative;width:100%}

        .ticker-wrap{background:var(--s50);border-top:1px solid var(--s100);border-bottom:1px solid var(--s100);padding:14px 0;overflow:hidden;position:relative}
        .ticker-wrap::before,.ticker-wrap::after{content:'';position:absolute;top:0;bottom:0;width:80px;z-index:2;pointer-events:none}
        .ticker-wrap::before{left:0;background:linear-gradient(90deg,var(--s50),transparent)}
        .ticker-wrap::after{right:0;background:linear-gradient(270deg,var(--s50),transparent)}
        .ticker-track{display:flex;gap:0;animation:scrollticker 28s linear infinite;width:max-content}
        .ticker-item{display:inline-flex;align-items:center;gap:8px;padding:0 24px;font-size:13px;font-weight:600;color:var(--s600);white-space:nowrap;border-right:1px solid var(--s200)}
        .ticker-dot{width:20px;height:20px;border-radius:6px;background:var(--s800);display:flex;align-items:center;justify-content:center;font-size:10px;flex-shrink:0}

        .stats-bar{background:var(--s800);padding:40px 28px}
        .stats-inner{max-width:1100px;margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr);gap:20px;text-align:center}
        .stat-item{padding:8px;border-right:1px solid rgba(255,255,255,.06)}
        .stat-item:last-child{border-right:none}
        .stat-num{font-family:var(--font-d);font-size:38px;font-weight:800;color:var(--y);display:block;line-height:1}
        .stat-label{font-size:13px;color:rgba(255,255,255,.5);margin-top:6px;font-weight:500}

        section{padding:96px 28px}
        .section-inner{max-width:1180px;margin:0 auto}
        .section-tag{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:700;color:var(--yd);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:14px}
        .section-tag::before{content:'';display:inline-block;width:18px;height:2px;background:var(--y);border-radius:2px}
        .section-title{font-family:var(--font-d);font-size:clamp(26px,3.5vw,40px);font-weight:800;color:var(--s900);line-height:1.2;margin-bottom:16px;letter-spacing:-.5px}
        .section-sub{font-size:17px;color:var(--s600);line-height:1.7;max-width:560px}
        .section-head{margin-bottom:60px}

        .pain-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
        .pain-card{background:#fff;border:1px solid var(--s100);border-radius:18px;padding:36px 28px;transition:transform .3s,box-shadow .3s}
        .pain-card:hover{transform:translateY(-6px);box-shadow:0 16px 48px rgba(0,0,0,.07)}
        .pain-icon-wrap{width:54px;height:54px;border-radius:13px;background:var(--s800);display:flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:20px}
        .pain-card h3{font-family:var(--font-d);font-size:17px;color:var(--s900);margin-bottom:10px}
        .pain-card p{font-size:14px;color:var(--s600);line-height:1.75}

        .features-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
        .feat-card{background:var(--s50);border:1px solid var(--s100);border-radius:16px;padding:28px;transition:all .3s;cursor:default}
        .feat-card:hover{background:#fff;border-color:rgba(0,119,182,.45);box-shadow:0 8px 32px rgba(0,119,182,.1)}
        .feat-icon{width:48px;height:48px;border-radius:12px;background:var(--s800);display:flex;align-items:center;justify-content:center;font-size:20px;margin-bottom:18px}
        .feat-card h3{font-size:15px;font-weight:700;color:var(--s900);margin-bottom:8px}
        .feat-card p{font-size:13.5px;color:var(--s600);line-height:1.7}
        .feat-badge{display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:700;background:var(--yl);color:var(--yd);border:1px solid rgba(0,119,182,.3);border-radius:50px;padding:3px 10px;margin-bottom:10px}

        .showcase-bg{background:var(--s800);padding:96px 28px;position:relative;overflow:hidden}
        .showcase-bg::before{content:'';position:absolute;top:-200px;left:50%;transform:translateX(-50%);width:700px;height:700px;background:radial-gradient(circle,rgba(0,119,182,.05) 0%,transparent 60%);pointer-events:none}
        .showcase-header{text-align:center;margin-bottom:56px}
        .browser-frame{background:#0f172a;border:1px solid rgba(255,255,255,.07);border-radius:14px;overflow:hidden;max-width:880px;margin:0 auto;box-shadow:0 40px 100px rgba(0,0,0,.5)}
        .browser-bar{height:40px;background:rgba(255,255,255,.05);display:flex;align-items:center;gap:8px;padding:0 16px;border-bottom:1px solid rgba(255,255,255,.06)}
        .browser-dot{width:10px;height:10px;border-radius:50%}
        .browser-url{flex:1;background:rgba(255,255,255,.05);border-radius:5px;height:22px;margin:0 12px;display:flex;align-items:center;padding:0 10px}
        .browser-content{overflow-x:auto;-webkit-overflow-scrolling:touch}

        .steps-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:0;position:relative}
        .steps-grid::after{content:'';position:absolute;top:44px;left:calc(16.67% + 24px);right:calc(16.67% + 24px);height:2px;background:repeating-linear-gradient(90deg,var(--y) 0,var(--y) 8px,transparent 8px,transparent 18px)}
        .step{text-align:center;padding:0 24px}
        .step-num{width:88px;height:88px;border-radius:50%;border:2px solid var(--s200);background:#fff;display:flex;align-items:center;justify-content:center;margin:0 auto 24px;font-family:var(--font-d);font-size:32px;font-weight:800;color:var(--s800);position:relative;z-index:1;transition:all .3s}
        .step:hover .step-num{background:var(--s800);color:var(--y);border-color:var(--s800)}
        .step h3{font-weight:700;font-size:17px;color:var(--s900);margin-bottom:10px}
        .step p{font-size:14px;color:var(--s600);line-height:1.7}

        .pricing-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;max-width:1000px;margin:0 auto;align-items:start}
        .price-card{border-radius:20px;padding:36px 28px;display:flex;flex-direction:column;position:relative}
        .price-icon-row{display:flex;align-items:center;gap:14px;margin-bottom:20px}
        .price-icon-box{width:46px;height:46px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px}
        .price-name{font-family:var(--font-d);font-weight:800;font-size:20px}
        .price-period{font-size:13px;margin-top:2px}
        .price-amount{font-family:var(--font-d);font-weight:800;font-size:34px;margin-bottom:4px;line-height:1.1}
        .price-original{font-size:14px;text-decoration:line-through;margin-bottom:2px}
        .price-desc{font-size:13px;padding-bottom:16px;margin-bottom:16px}
        .price-features{list-style:none;margin-bottom:24px;flex:1}
        .price-features li{display:flex;align-items:flex-start;gap:10px;font-size:13.5px;margin-bottom:10px;line-height:1.45}
        .chk{width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;flex-shrink:0;margin-top:1px}
        .price-btn{display:flex;align-items:center;justify-content:center;padding:14px 20px;border-radius:10px;font-weight:700;font-size:15px;text-decoration:none;transition:all .2s;gap:6px;margin-top:auto}
        .price-btn:hover{opacity:.9;transform:translateY(-1px)}
        .pop-badge{position:absolute;top:-13px;left:50%;transform:translateX(-50%);font-size:12px;font-weight:700;padding:4px 16px;border-radius:50px;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,.1)}

        .faq-inner{max-width:720px;margin:0 auto}
        .faq-item{border-bottom:1px solid var(--s100)}
        .faq-btn{width:100%;display:flex;justify-content:space-between;align-items:center;padding:22px 0;background:none;border:none;cursor:pointer;text-align:left;gap:16px;font-family:var(--font-b)}
        .faq-q{font-size:16px;font-weight:600;color:var(--s900);transition:color .2s}
        .faq-btn.open .faq-q{color:var(--yd)}
        .faq-chev{width:22px;height:22px;border-radius:50%;background:var(--s100);display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .3s;color:var(--s600);font-size:11px}
        .faq-btn.open .faq-chev{background:var(--y);color:#fff;transform:rotate(180deg)}
        .faq-body{overflow:hidden;transition:max-height .4s ease}
        .faq-body p{padding-bottom:20px;font-size:15px;color:var(--s600);line-height:1.78}

        .final-cta{background:var(--s800);padding:100px 28px;text-align:center;position:relative;overflow:hidden}
        .final-cta::before{content:'';position:absolute;inset:0;background:repeating-linear-gradient(-45deg,rgba(0,119,182,.02) 0,rgba(0,119,182,.02) 1px,transparent 1px,transparent 8px);pointer-events:none}
        .final-cta-inner{max-width:680px;margin:0 auto;position:relative;z-index:1}
        .final-cta h2{font-family:var(--font-d);font-size:clamp(28px,4vw,46px);color:#fff;font-weight:800;line-height:1.2;margin-bottom:18px;letter-spacing:-.5px}
        .final-cta p{font-size:17px;color:rgba(255,255,255,.5);margin-bottom:38px;line-height:1.7}

        footer{background:#fff;border-top:1px solid var(--s100);padding:32px 28px 16px}
        .footer-grid{max-width:1100px;margin:0 auto 24px;display:grid;grid-template-columns:2fr 1fr 1fr;gap:48px}
        .footer-col h4{font-size:12px;font-weight:700;color:var(--s900);margin-bottom:16px;text-transform:uppercase;letter-spacing:.8px}
        .footer-col a{display:block;font-size:14px;color:var(--s600);text-decoration:none;margin-bottom:10px;transition:color .2s}
        .footer-col a:hover{color:var(--y)}
        .footer-bottom{max-width:1100px;margin:0 auto;border-top:1px solid var(--s100);padding-top:14px;display:flex;justify-content:space-between;align-items:center}
        .footer-bottom p{font-size:13px;color:var(--s400)}
        .social-row{display:flex;gap:10px}
        .social-btn{width:34px;height:34px;border-radius:8px;background:var(--s100);display:flex;align-items:center;justify-content:center;font-size:14px;cursor:pointer;transition:background .2s}
        .social-btn:hover{background:var(--s200)}

        @media(max-width:768px){
          .nav-links{display:none}
          .nav-inner{padding:0 16px;height:60px;gap:0;justify-content:flex-start}
          .nav-btns{display:flex;gap:6px;align-items:center;margin-left:auto;margin-right:8px}
          .btn-ghost{padding:5px 13px;font-size:12px;font-weight:600;border-radius:8px;white-space:nowrap;line-height:1.4}
          .btn-primary{padding:5px 13px;font-size:12px;font-weight:700;border-radius:8px;white-space:nowrap;line-height:1.4}
          .hamburger{display:flex}
          .hero{padding:100px 20px 60px;min-height:auto}
          .hero::before{display:none}
          .hero-grid{grid-template-columns:1fr;gap:32px;text-align:center;}
          .hero-right{order:-1}
          .hero-subtext{max-width:100%;font-size:15px;margin-bottom:28px}
          .hero-heading{font-size:clamp(28px,7vw,40px);margin-bottom:16px}
          .hero-cta-row{justify-content:center;gap:10px}
          .cta-big{padding:12px 22px;font-size:15px}
          .hero-proof{justify-content:center}
          .mockup-badge-top{display:none!important}
          .mockup-badge-bottom{display:none!important}
          .ticker-wrap{padding:10px 0}
          .ticker-item{font-size:12px;padding:0 16px}
          .stats-bar{padding:28px 20px}
          .stats-inner{grid-template-columns:repeat(2,1fr);gap:0;}
          .stat-item{padding:16px 8px;border-right:none;border-bottom:1px solid rgba(255,255,255,.06);}
          .stat-item:nth-child(odd){border-right:1px solid rgba(255,255,255,.06)}
          .stat-item:nth-child(3),.stat-item:nth-child(4){border-bottom:none}
          .stat-num{font-size:30px}
          .stat-label{font-size:12px}
          section{padding:56px 20px}
          .section-head{margin-bottom:36px}
          .section-title{font-size:clamp(22px,6vw,32px)}
          .section-sub{font-size:15px}
          .pain-grid{grid-template-columns:1fr;gap:16px}
          .pain-card{padding:24px 20px}
          .pain-card h3{font-size:15px}
          .showcase-bg{padding:56px 20px}
          .showcase-header{margin-bottom:32px}
          .browser-frame{border-radius:10px}
          .browser-content{overflow-x:auto;-webkit-overflow-scrolling:touch}
          .features-grid{grid-template-columns:1fr;gap:14px}
          .feat-card{padding:20px}
          .steps-grid{grid-template-columns:1fr;gap:0;}
          .steps-grid::after{display:none}
          .step{padding:0;display:grid;grid-template-columns:72px 1fr;gap:16px;text-align:left;align-items:start;padding:20px 0;border-bottom:1px solid var(--s100);}
          .step:last-child{border-bottom:none}
          .step-num{width:56px;height:56px;font-size:22px;margin:0;}
          .step-content{padding-top:4px}
          .step h3{font-size:15px;margin-bottom:6px}
          .step p{font-size:13px}
          .pricing-grid{grid-template-columns:1fr;gap:16px;padding:0 4px;}
          .price-card{margin:0!important;padding:28px 24px;}
          .pop-badge{top:-11px;font-size:11px;}
          .price-amount{font-size:28px}
          .faq-q{font-size:14px}
          .faq-btn{padding:18px 0}
          .final-cta{padding:64px 20px}
          .final-cta p{font-size:15px;margin-bottom:28px}
          .cta-big.cta-yellow{font-size:15px;padding:13px 24px}
          footer{padding:28px 20px 16px}
          .footer-grid{grid-template-columns:1fr;gap:28px;margin-bottom:20px;}
          .footer-bottom{flex-direction:column;gap:8px;text-align:center;}
          .footer-col h4{margin-bottom:10px}
          .footer-col a{margin-bottom:8px}
        }

        @media(min-width:769px) and (max-width:1024px){
          .hero-grid{grid-template-columns:1fr 1fr;gap:32px}
          .pain-grid{grid-template-columns:1fr 1fr;gap:16px}
          .features-grid{grid-template-columns:repeat(2,1fr)}
          .pricing-grid{grid-template-columns:1fr;max-width:480px}
          .stats-inner{grid-template-columns:repeat(2,1fr)}
          .footer-grid{grid-template-columns:1fr 1fr;gap:32px}
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav id="navbar">
        <div className="nav-inner">
          <a href="#" className="logo">
            <Image src="/images/logo-navbar.svg" width={95} height={95} style={{borderRadius:'9px'}} alt="Logo PintuASN" priority />
          </a>
          <ul className="nav-links">
            <li><a href="#fitur">Fitur</a></li>
            <li><a href="#cara-kerja">Cara Kerja</a></li>
            <li><a href="#paket">Paket</a></li>
            <li><a href="/blog">Blog</a></li>
            <li><a href="#faq">FAQ</a></li>
          </ul>
          <div className="nav-btns">
            <a href="/sign-in" className="btn-ghost">Masuk</a>
            <a href="/sign-up" className="btn-primary">Daftar Gratis</a>
          </div>
          <button
            className={`hamburger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span></span><span></span><span></span>
          </button>
        </div>
      </nav>

      <div className={`mobile-menu-overlay ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(false)} />

      {menuOpen && (
        <div className="mobile-menu open">
          <div className="mobile-menu-links">
            <a href="#fitur" onClick={() => setMenuOpen(false)}>Fitur</a>
            <a href="#cara-kerja" onClick={() => setMenuOpen(false)}>Cara Kerja</a>
            <a href="#paket" onClick={() => setMenuOpen(false)}>Paket</a>
            <a href="/blog" onClick={() => setMenuOpen(false)}>Blog</a>
            <a href="#faq" onClick={() => setMenuOpen(false)}>FAQ</a>
          </div>
          <div className="mobile-menu-btns">
            <a href="/sign-in" className="btn-ghost" onClick={() => setMenuOpen(false)}>Masuk</a>
            <a href="/sign-up" className="btn-primary" onClick={() => setMenuOpen(false)}>Daftar Gratis →</a>
          </div>
        </div>
      )}

      {/* ── HERO ── */}
      <section className="hero" id="hero">
        <div className="hero-grid">
          <div>
            <h1 className="hero-heading hero-title">
              Lulus SKD CPNS Bukan Soal <em>Keberuntungan</em>
            </h1>
            <p className="hero-subtext hero-sub">
              Rasakan pengalaman ujian sesungguhnya dengan simulasi CAT <strong>99% identik sistem BKN</strong>. Analitik mendalam, roadmap terstruktur, ranking nasional dalam satu platform.
            </p>
            <div className="hero-cta-row hero-cta">
              <a href="/sign-up" className="cta-big cta-yellow">Coba Gratis Sekarang</a>
              <a href="#fitur" className="cta-big cta-outline">Lihat Fitur</a>
            </div>
            <div className="hero-proof hero-proof">
              <div className="proof-avatars">
                <div className="proof-avatar" style={{background:'#7C5C3E'}}>BU</div>
                <div className="proof-avatar" style={{background:'#A0724A'}}>SW</div>
                <div className="proof-avatar" style={{background:'#5E4533'}}>AR</div>
                <div className="proof-avatar" style={{background:'#9B6B4A'}}>DN</div>
                <div className="proof-avatar" style={{background:'#6B4226'}}>FN</div>
              </div>
              <div>
                <div className="stars">★★★★★</div>
                <p className="proof-text"><strong>12.000+</strong> pejuang NIP bergabung</p>
              </div>
            </div>
          </div>
          <div className="hero-right hero-mockup">
            <div className="mockup-wrap">
              <div className="mockup-float" dangerouslySetInnerHTML={{__html: examSVG}} />
              <div className="mockup-badge-top mockup-float2" style={{position:'absolute',top:'-20px',right:'-18px',background:'#fff',border:'1px solid #e2e8f0',borderRadius:'12px',padding:'10px 14px',boxShadow:'0 8px 24px rgba(0,0,0,0.08)',display:'flex',alignItems:'center',gap:'10px',zIndex:2}}>
                <div style={{width:'36px',height:'36px',background:'#1e293b',borderRadius:'9px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px'}}>📊</div>
                <div>
                  <div style={{fontSize:'11px',fontWeight:700,color:'#1e293b'}}>Skor TWK</div>
                  <div style={{fontSize:'16px',fontWeight:800,color:'#16a34a'}}>85 <span style={{fontSize:'10px',color:'#94a3b8'}}>/ 150</span></div>
                </div>
              </div>
              <div className="mockup-badge-bottom mockup-float2" style={{position:'absolute',bottom:'-10px',left:'-18px',background:'#1e293b',borderRadius:'12px',padding:'10px 14px',boxShadow:'0 8px 24px rgba(0,0,0,0.18)',display:'flex',alignItems:'center',gap:'10px',zIndex:2,animationDelay:'1.2s'}}>
                <div style={{fontSize:'20px'}}>🏆</div>
                <div>
                  <div style={{fontSize:'10px',color:'rgba(255,255,255,0.45)',fontWeight:600}}>Peringkat Nasional</div>
                  <div style={{fontSize:'15px',fontWeight:800,color:'#0077B6'}}>#247 <span style={{fontSize:'10px',color:'rgba(255,255,255,0.35)'}}>dari 12.842</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TICKER ── */}
      <div className="ticker-wrap">
        <div className="ticker-track">
          {[
            ['✓','Simulasi 99% mirip BKN'],['⏱','Analisis waktu per soal'],
            ['📊','Analitik performa mendalam'],['🏆','Ranking nasional real-time'],
            ['🗺','Roadmap belajar bertahap'],['📖','Pembahasan detail setiap soal'],
            ['📈','Progress tracking visual'],['🔒','Pembayaran aman Midtrans'],
            ['✓','Simulasi 99% mirip BKN'],['⏱','Analisis waktu per soal'],
            ['📊','Analitik performa mendalam'],['🏆','Ranking nasional real-time'],
            ['🗺','Roadmap belajar bertahap'],['📖','Pembahasan detail setiap soal'],
            ['📈','Progress tracking visual'],['🔒','Pembayaran aman Midtrans'],
          ].map(([icon, text], i) => (
            <div key={i} className="ticker-item">
              <div className="ticker-dot">{icon}</div> {text}
            </div>
          ))}
        </div>
      </div>

      {/* ── STATS ── */}
      <div className="stats-bar">
        <div className="stats-inner">
          <div className="stat-item reveal"><span className="stat-num" data-target="12186">0</span><div className="stat-label">Pengguna aktif terdaftar</div></div>
          <div className="stat-item reveal" style={{transitionDelay:'.1s'}}><span className="stat-num" data-target="871">0</span><div className="stat-label">Bank soal terverifikasi</div></div>
          <div className="stat-item reveal" style={{transitionDelay:'.2s'}}><span className="stat-num" data-target="3204">0</span><div className="stat-label">Sesi tryout diselesaikan</div></div>
          <div className="stat-item reveal" style={{transitionDelay:'.3s'}}><span className="stat-num" data-target="4.9">0</span><div className="stat-label">Rating rata-rata pengguna</div></div>
        </div>
      </div>

      {/* ── PAIN POINTS ── */}
      <section style={{background:'var(--s50)'}}>
        <div className="section-inner">
          <div className="section-head reveal" style={{textAlign:'center'}}>
            <div className="section-tag" style={{justifyContent:'center'}}>Masalah Nyata</div>
            <h2 className="section-title">Mengapa Banyak yang Gagal di SKD?</h2>
            <p className="section-sub" style={{margin:'0 auto'}}>Bukan karena kurang pintar, tapi karena strategi dan persiapan yang salah sasaran.</p>
          </div>
          <div className="pain-grid">
            <div className="pain-card reveal">
              <div className="pain-icon-wrap">🤯</div>
              <h3>Buta Sistem CAT BKN</h3>
              <p>Panik melihat interface ujian asli. Banyak peserta gagal fokus karena kaget dengan sistem CAT dan manajemen waktu yang buruk saat hari H.</p>
            </div>
            <div className="pain-card reveal" style={{transitionDelay:'.12s'}}>
              <div className="pain-icon-wrap">📉</div>
              <h3>Belajar Tanpa Data</h3>
              <p>Mengerjakan ribuan soal secara acak tanpa tahu letak kelemahan sesungguhnya, apakah di TWK, penalaran TIU, atau karakteristik TKP.</p>
            </div>
            <div className="pain-card reveal" style={{transitionDelay:'.24s'}}>
              <div className="pain-icon-wrap">⏱️</div>
              <h3>Tidak Sadar Pemborosan Waktu</h3>
              <p>Tanpa analisis waktu per soal, kamu tidak tahu soal mana yang menyedot waktu terlalu banyak sehingga soal mudah pun tidak sempat dikerjakan.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── APP SHOWCASE ── */}
      <section className="showcase-bg">
        <div className="showcase-header reveal">
          <div className="section-tag" style={{justifyContent:'center',color:'rgba(0,119,182,.8)'}}>Dashboard Performa</div>
          <h2 className="section-title" style={{color:'#fff',textAlign:'center'}}>Lihat Progressmu dalam Satu Layar</h2>
          <p className="section-sub" style={{textAlign:'center',margin:'0 auto',color:'rgba(255,255,255,.5)'}}>Analitik mendalam yang mengubah data latihan menjadi keputusan belajar yang tepat.</p>
        </div>
        <div className="reveal" style={{transitionDelay:'.15s'}}>
          <div className="browser-frame mockup-float2">
            <div className="browser-bar">
              <div className="browser-dot" style={{background:'#ef4444'}}></div>
              <div className="browser-dot" style={{background:'#f59e0b'}}></div>
              <div className="browser-dot" style={{background:'#22c55e'}}></div>
              <div className="browser-url">
                <span style={{fontSize:'11px',color:'rgba(255,255,255,.3)',fontFamily:'monospace'}}>pintuasn.com/statistics</span>
              </div>
            </div>
            <div className="browser-content" dangerouslySetInnerHTML={{__html: dashboardSVG}} />
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{background:'#fff'}} id="fitur">
        <div className="section-inner">
          <div className="section-head reveal">
            <div className="section-tag">Fitur Unggulan</div>
            <h2 className="section-title">Senjata Rahasiamu<br />Menuju NIP 2026</h2>
            <p className="section-sub">Dirancang khusus untuk mereplikasi kondisi ujian asli dan menutup setiap celah kelemahanmu.</p>
          </div>
          <div className="features-grid">
            <div className="feat-card reveal"><div className="feat-icon">💻</div><h3>Simulasi 99% Mirip BKN</h3><p>UI/UX, sistem timer per subtes, dan mekanisme penilaian persis sistem CAT SSCASN BKN. Atasi grogi sebelum hari H.</p></div>
            <div className="feat-card reveal" style={{transitionDelay:'.08s'}}><div className="feat-icon">⏱️</div><div className="feat-badge">Eksklusif</div><h3>Analisis Waktu per Soal</h3><p>Ketahui berapa detik kamu habiskan tiap soal. Identifikasi soal "time waster" dan perbaiki strategi pengerjaan.</p></div>
            <div className="feat-card reveal" style={{transitionDelay:'.16s'}}><div className="feat-icon">📊</div><h3>Analitik Performa Mendalam</h3><p>Tren skor, gap passing grade, distribusi nasional, dan analisis kelemahan detail per subtes TWK, TIU, TKP berbasis data.</p></div>
            <div className="feat-card reveal" style={{transitionDelay:'.24s'}}><div className="feat-icon">🏆</div><h3>Peringkat Nasional</h3><p>Ukur kemampuan real-time. Ketahui posisimu vs ribuan peserta lain di seluruh Indonesia dengan leaderboard live.</p></div>
            <div className="feat-card reveal" style={{transitionDelay:'.32s'}}><div className="feat-icon">🗺️</div><h3>Roadmap Belajar Bertahap</h3><p>Fase belajar terstruktur: setiap step ada syarat, CTA, dan indikator selesai. Tidak lagi bingung mulai dari mana.</p></div>
            <div className="feat-card reveal" style={{transitionDelay:'.4s'}}><div className="feat-icon">📖</div><h3>Review Soal dan Pembahasan</h3><p>Bukan cuma kunci jawaban. Review detail tiap soal benar/salahmu dengan filter materi yang komprehensif dan terstruktur.</p></div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{background:'var(--s50)'}} id="cara-kerja">
        <div className="section-inner">
          <div className="section-head reveal" style={{textAlign:'center'}}>
            <div className="section-tag" style={{justifyContent:'center'}}>Cara Kerja</div>
            <h2 className="section-title">3 Langkah Mulai Persiapan</h2>
            <p className="section-sub" style={{margin:'0 auto'}}>Sistem kami dirancang agar kamu bisa langsung fokus belajar tanpa setup rumit.</p>
          </div>
          <div className="steps-grid">
            <div className="step reveal">
              <div className="step-num">1</div>
              <div className="step-content"><h3>Daftar Akun Gratis</h3><p>Buat akun dalam 30 detik. Langsung akses dashboard, roadmap, dan tryout pertamamu tanpa kartu kredit.</p></div>
            </div>
            <div className="step reveal" style={{transitionDelay:'.2s'}}>
              <div className="step-num">2</div>
              <div className="step-content"><h3>Kerjakan Tryout</h3><p>Rasakan sensasi ujian asli dengan timer dan antarmuka identik BKN. TWK, TIU, TKP dalam satu sesi penuh.</p></div>
            </div>
            <div className="step reveal" style={{transitionDelay:'.4s'}}>
              <div className="step-num">3</div>
              <div className="step-content"><h3>Analisis dan Tingkatkan</h3><p>Dapatkan skor, analitik mendalam, analisis waktu per soal, review pembahasan, dan posisi ranking nasional.</p></div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section style={{background:'#fff'}} id="paket">
        <div className="section-inner">
          <div className="section-head reveal" style={{textAlign:'center'}}>
            <div className="section-tag" style={{justifyContent:'center'}}>Paket Belajar</div>
            <h2 className="section-title">Pilih Paketmu</h2>
            <p className="section-sub" style={{margin:'0 auto'}}>Investasi terbaik untuk lolos SKD CPNS 2026. Akses penuh hingga hari ujian selesai.</p>
          </div>

          <div className="pricing-grid">

            {/* ── FREE ── */}
            <div className="price-card reveal" style={{background:'#fff',border:'1px solid #e2e8f0'}}>
              <div className="price-icon-row">
                <div className="price-icon-box" style={{background:'#f1f5f9'}}>🛡️</div>
                <div>
                  <div className="price-name" style={{color:'#0f172a'}}>Gratis</div>
                  <div className="price-period" style={{color:'#94a3b8'}}>Selamanya</div>
                </div>
              </div>
              <div className="price-amount" style={{color:'#0f172a'}}>Gratis</div>
              <div className="price-desc" style={{color:'#94a3b8',borderBottom:'1px solid #f1f5f9'}}>
                Cocok untuk mencoba fitur dasar simulasi SKD
              </div>
              <ul className="price-features">
                <li><span className="chk" style={{background:'#dcfce7',color:'#16a34a'}}>✓</span><span style={{color:'#334155'}}>Tryout paket gratis</span></li>
                <li><span className="chk" style={{background:'#dcfce7',color:'#16a34a'}}>✓</span><span style={{color:'#334155'}}>Akses Roadmap pembelajaran</span></li>
                <li><span className="chk" style={{background:'#dcfce7',color:'#16a34a'}}>✓</span><span style={{color:'#334155'}}>Akses materi dasar</span></li>
                <li><span className="chk" style={{background:'#f1f5f9',color:'#94a3b8'}}>✗</span><span style={{color:'#94a3b8',textDecoration:'line-through'}}>Tryout paket premium</span></li>
                <li><span className="chk" style={{background:'#f1f5f9',color:'#94a3b8'}}>✗</span><span style={{color:'#94a3b8',textDecoration:'line-through'}}>Latihan Soal SKD / Mini Try Out</span></li>
                <li><span className="chk" style={{background:'#f1f5f9',color:'#94a3b8'}}>✗</span><span style={{color:'#94a3b8',textDecoration:'line-through'}}>Review soal + pembahasan lengkap</span></li>
                <li><span className="chk" style={{background:'#f1f5f9',color:'#94a3b8'}}>✗</span><span style={{color:'#94a3b8',textDecoration:'line-through'}}>Statistik & analisis performa</span></li>
                <li><span className="chk" style={{background:'#f1f5f9',color:'#94a3b8'}}>✗</span><span style={{color:'#94a3b8',textDecoration:'line-through'}}>Peringkat nasional</span></li>
              </ul>
              <a href="/sign-up" className="price-btn" style={{border:'1.5px solid #cbd5e1',color:'#475569'}}>
                Pakai Gratis
              </a>
            </div>

            {/* ── PREMIUM ── */}
            <div className="price-card reveal" style={{background:'#1d4ed8',boxShadow:'0 24px 64px rgba(29,78,216,.35)',transitionDelay:'.1s'}}>
              <div className="pop-badge" style={{background:'#fff',color:'#1d4ed8'}}>⚡ Populer</div>
              <div className="price-icon-row">
                <div className="price-icon-box" style={{background:'rgba(255,255,255,0.15)'}}>⚡</div>
                <div>
                  <div className="price-name" style={{color:'#fff'}}>Premium</div>
                  <div className="price-period" style={{color:'rgba(255,255,255,.55)'}}>Hingga November 2026</div>
                </div>
              </div>
              <div className="price-original" style={{color:'rgba(255,255,255,.4)'}}>Rp 200.000</div>
              <div className="price-amount" style={{color:'#fff'}}>Rp 99.000</div>
              <div className="price-desc" style={{color:'rgba(255,255,255,.55)',borderBottom:'1px solid rgba(255,255,255,.12)'}}>
                Akses penuh untuk persiapan SKD CPNS 2026
              </div>
              <ul className="price-features">
                <li><span className="chk" style={{background:'rgba(255,255,255,.2)',color:'#fff'}}>✓</span><span style={{color:'rgba(255,255,255,.9)'}}>Tryout paket gratis & premium</span></li>
                <li><span className="chk" style={{background:'rgba(255,255,255,.2)',color:'#fff'}}>✓</span><span style={{color:'rgba(255,255,255,.9)'}}>Latihan Soal SKD / Mini Try Out (TWK, TIU, TKP)</span></li>
                <li><span className="chk" style={{background:'rgba(255,255,255,.2)',color:'#fff'}}>✓</span><span style={{color:'rgba(255,255,255,.9)'}}>Review soal + pembahasan lengkap</span></li>
                <li><span className="chk" style={{background:'rgba(255,255,255,.2)',color:'#fff'}}>✓</span><span style={{color:'rgba(255,255,255,.9)'}}>Materi SKD lengkap (TWK, TIU, TKP)</span></li>
                <li><span className="chk" style={{background:'rgba(255,255,255,.2)',color:'#fff'}}>✓</span><span style={{color:'rgba(255,255,255,.9)'}}>Akses Riwayat (3 terbaru)</span></li>
                <li><span className="chk" style={{background:'rgba(255,255,255,.2)',color:'#fff'}}>✓</span><span style={{color:'rgba(255,255,255,.9)'}}>Statistik & analisis performa</span></li>
                <li><span className="chk" style={{background:'rgba(255,255,255,.2)',color:'#fff'}}>✓</span><span style={{color:'rgba(255,255,255,.9)'}}>Peringkat nasional</span></li>
                <li><span className="chk" style={{background:'rgba(255,255,255,.2)',color:'#fff'}}>✓</span><span style={{color:'rgba(255,255,255,.9)'}}>Leaderboard paket</span></li>
              </ul>
              <a href="/sign-up?plan=premium" className="price-btn" style={{background:'#fff',color:'#1d4ed8'}}>
                Mulai Premium →
              </a>
            </div>

            {/* ── PLATINUM ── */}
            <div className="price-card reveal" style={{background:'#0f172a',boxShadow:'0 24px 64px rgba(15,23,42,.25)',transitionDelay:'.2s'}}>
              <div className="pop-badge" style={{background:'#7c3aed',color:'#fff'}}>👑 Terlengkap</div>
              <div className="price-icon-row">
                <div className="price-icon-box" style={{background:'rgba(124,58,237,0.25)'}}>👑</div>
                <div>
                  <div className="price-name" style={{color:'#fff'}}>Platinum</div>
                  <div className="price-period" style={{color:'rgba(255,255,255,.45)'}}>Masa aktif 1 tahun</div>
                </div>
              </div>
              <div className="price-original" style={{color:'rgba(255,255,255,.35)'}}>Rp 349.000</div>
              <div className="price-amount" style={{color:'#fff'}}>Rp 119.000</div>
              <div className="price-desc" style={{color:'rgba(255,255,255,.45)',borderBottom:'1px solid rgba(255,255,255,.08)'}}>
                Paket lengkap dengan fitur eksklusif dan prioritas
              </div>
              <ul className="price-features">
                <li><span className="chk" style={{background:'rgba(124,58,237,0.4)',color:'#c4b5fd'}}>✓</span><span style={{color:'rgba(255,255,255,.85)'}}>Semua fitur Premium</span></li>
                <li><span className="chk" style={{background:'rgba(124,58,237,0.4)',color:'#c4b5fd'}}>✓</span><span style={{color:'rgba(255,255,255,.85)'}}>Akses Riwayat tidak terbatas</span></li>
                <li><span className="chk" style={{background:'rgba(124,58,237,0.4)',color:'#c4b5fd'}}>✓</span><span style={{color:'rgba(255,255,255,.85)'}}>Tryout paket platinum eksklusif</span></li>
                <li><span className="chk" style={{background:'rgba(124,58,237,0.4)',color:'#c4b5fd'}}>✓</span><span style={{color:'rgba(255,255,255,.85)'}}>Materi platinum + video series SKD</span></li>
                <li><span className="chk" style={{background:'rgba(124,58,237,0.4)',color:'#c4b5fd'}}>✓</span><span style={{color:'rgba(255,255,255,.85)'}}>Analisis soal dengan waktu terlama</span></li>
                <li><span className="chk" style={{background:'rgba(124,58,237,0.4)',color:'#c4b5fd'}}>✓</span><span style={{color:'rgba(255,255,255,.85)'}}>Laporan perkembangan belajar</span></li>
                <li><span className="chk" style={{background:'rgba(124,58,237,0.4)',color:'#c4b5fd'}}>✓</span><span style={{color:'rgba(255,255,255,.85)'}}>Masa aktif 1 tahun</span></li>
              </ul>
              <a href="/sign-up?plan=platinum" className="price-btn" style={{background:'#7c3aed',color:'#fff'}}>
                Mulai Platinum →
              </a>
            </div>

          </div>

          <div className="reveal" style={{textAlign:'center',marginTop:'32px',fontSize:'13px',color:'#94a3b8',transitionDelay:'.3s'}}>
            🔒 Pembayaran aman via Midtrans · QRIS · GoPay · Transfer Bank · Alfamart/Indomaret
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{background:'var(--s50)'}} id="faq">
        <div className="section-inner">
          <div className="section-head reveal" style={{textAlign:'center'}}>
            <div className="section-tag" style={{justifyContent:'center'}}>FAQ</div>
            <h2 className="section-title">Pertanyaan yang Sering Diajukan</h2>
          </div>
          <div className="faq-inner">
            {[
              { q: 'Apakah simulasi benar-benar mirip sistem BKN?', a: 'Ya! Kami merancang UI/UX, peletakan tombol, ukuran font, hingga sistem timer persis seperti aplikasi CAT BKN. Saat ujian asli, kamu sudah tidak canggung dan bisa fokus penuh pada soal.' },
              { q: 'Apa itu fitur Analisis Waktu per Soal?', a: 'Fitur eksklusif PintuASN yang merekam berapa detik kamu habiskan untuk tiap soal. Dari data ini, kamu bisa tahu soal mana yang menjadi "pemborosan waktu" dan memperbaiki strategi pengerjaan di sesi berikutnya.' },
              { q: 'Apakah soal-soalnya update sesuai kisi-kisi terbaru?', a: 'Tentu. Tim akademik kami terus memperbarui bank soal setiap bulan mengikuti Peraturan Menteri PANRB terbaru dan tren soal CPNS tahun-tahun sebelumnya, termasuk soal berstandar HOTS.' },
              { q: 'Bagaimana cara pembayaran paket Premium/Platinum?', a: 'Kami menerima QRIS, GoPay, OVO, ShopeePay, Transfer Bank (VA BCA, BNI, Mandiri, BRI), hingga Alfamart/Indomaret. Semua diproses melalui Midtrans yang aman dan terenkripsi.' },
              { q: 'Saya daftar gratis, apakah wajib upgrade?', a: 'Tidak wajib sama sekali. Paket Gratis agar kamu bisa mencoba sistem dan kualitas soal tanpa komitmen apapun. Upgrade bisa kapan saja ketika kamu merasa siap dan membutuhkan fitur lebih lengkap.' },
            ].map((item, i) => (
              <div key={i} className="faq-item reveal" style={{transitionDelay:`${i * 0.05}s`}}>
                <button className="faq-btn" onClick={(e) => toggleFaq(e.currentTarget)}>
                  <span className="faq-q">{item.q}</span>
                  <span className="faq-chev">▼</span>
                </button>
                <div className="faq-body" style={{maxHeight:'0'}}>
                  <p>{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="final-cta">
        <div className="final-cta-inner reveal">
          <div style={{display:'inline-flex',alignItems:'center',gap:'8px',background:'rgba(0,119,182,.12)',border:'1px solid rgba(0,119,182,.25)',borderRadius:'50px',padding:'6px 16px',fontSize:'13px',fontWeight:600,color:'var(--y)',marginBottom:'24px'}}>
            ⏰ Pendaftaran CPNS 2026 semakin dekat
          </div>
          <h2>Pesaingmu Sudah Mulai.<br />Kamu Kapan?</h2>
          <p>Jangan biarkan kursi ASN impianmu diambil orang lain hanya karena kurang persiapan.</p>
          <a href="/sign-up" className="cta-big cta-yellow" style={{fontSize:'17px',padding:'16px 38px',display:'inline-flex'}}>
            Mulai Perjalanan ASN-mu Sekarang
          </a>
          <p style={{marginTop:'20px',fontSize:'13px',color:'rgba(255,255,255,.3)'}}>Gratis selamanya · Tanpa kartu kredit</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer>
        <div className="footer-grid">
          <div>
            <a href="#" className="logo" style={{textDecoration:'none'}}>
              <div className="logo-badge">🎓</div>
              PintuASN
            </a>
            <p style={{fontSize:'14px',color:'#64748b',lineHeight:'1.6',marginTop:'8px',maxWidth:'280px'}}>Platform simulasi CAT SKD CPNS paling akurat di Indonesia. Partner terpercaya menuju NIP impianmu 2026.</p>
            <div className="social-row" style={{marginTop:'10px'}}>
              <div className="social-btn">📸</div>
              <div className="social-btn">🎵</div>
              <div className="social-btn">▶️</div>
            </div>
          </div>
          <div className="footer-col">
            <h4>Platform</h4>
            <a href="#">Fitur Unggulan</a>
            <a href="#">Harga dan Paket</a>
            <a href="#">Simulasi Gratis</a>
            <a href="/blog">Blog</a>
            <a href="#">FAQ</a>
          </div>
          <div className="footer-col">
            <h4>Bantuan</h4>
            <a href="#">Cara Pembayaran</a>
            <a href="#">Syarat dan Ketentuan</a>
            <a href="#">Kebijakan Privasi</a>
            <a href="#">Hubungi Admin (WA)</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 PintuASN. All rights reserved.</p>
          <p>support@pintuasn.com</p>
        </div>
      </footer>
    </>
  );
}