'use client';

import { useEffect, useState, type CSSProperties } from 'react';

// ── Data konten (dipertahankan dari versi lama) ───────────────
const TICKER = [
  ['✓', 'Simulasi 99% mirip BKN'], ['⏱', 'Analisis waktu per soal'],
  ['📊', 'Analitik performa mendalam'], ['🏆', 'Ranking nasional real-time'],
  ['🗺', 'Roadmap belajar bertahap'], ['📖', 'Pembahasan detail setiap soal'],
  ['📈', 'Progress tracking visual'], ['🔒', 'Pembayaran aman Midtrans'],
];

const STATS = [
  { target: '12186', label: 'Pengguna aktif terdaftar' },
  { target: '871',   label: 'Bank soal terverifikasi' },
  { target: '3204',  label: 'Sesi tryout diselesaikan' },
  { target: '4.9',   label: 'Rating rata-rata pengguna' },
];

const PAINS = [
  { icon: '🤯', title: 'Buta Sistem CAT BKN', desc: 'Panik melihat interface ujian asli. Banyak peserta gagal fokus karena kaget dengan sistem CAT dan manajemen waktu yang buruk saat hari H.' },
  { icon: '📉', title: 'Belajar Tanpa Data', desc: 'Mengerjakan ribuan soal secara acak tanpa tahu letak kelemahan sesungguhnya, apakah di TWK, penalaran TIU, atau karakteristik TKP.' },
  { icon: '⏱️', title: 'Tidak Sadar Pemborosan Waktu', desc: 'Tanpa analisis waktu per soal, kamu tidak tahu soal mana yang menyedot waktu terlalu banyak sehingga soal mudah pun tidak sempat dikerjakan.' },
];

const FEATURES = [
  { icon: '💻', title: 'Simulasi 99% Mirip BKN', desc: 'Rasakan ujian asli sebelum hari H. UI/UX, timer per subtes, dan mekanisme penilaian dibuat persis sistem CAT SSCASN BKN.',
    bullets: ['Antarmuka & timer identik CAT BKN', 'Penilaian TWK, TIU, TKP otomatis', 'Latihan anti-grogi sebelum ujian'] },
  { icon: '⏱️', title: 'Analisis Waktu per Soal', badge: 'Eksklusif', desc: 'Tahu persis ke mana waktumu habis. Fitur eksklusif yang merekam durasi pengerjaan tiap soal untuk strategi yang lebih tajam.',
    bullets: ['Rekam detik pengerjaan tiap soal', 'Deteksi soal "pemborosan waktu"', 'Rekomendasi strategi pengerjaan'] },
  { icon: '📊', title: 'Analitik Performa Mendalam', desc: 'Ubah data latihan jadi keputusan belajar. Lihat tren skor dan titik lemahmu dengan dashboard analitik yang detail.',
    bullets: ['Tren skor & gap passing grade', 'Analisis kelemahan per subtes', 'Distribusi skor nasional'] },
  { icon: '🏆', title: 'Peringkat Nasional', desc: 'Ukur kemampuanmu secara nyata. Ketahui posisimu di antara ribuan peserta se-Indonesia lewat leaderboard real-time.',
    bullets: ['Posisimu vs ribuan peserta', 'Leaderboard live & per paket', 'Update otomatis tiap tryout'] },
  { icon: '🗺️', title: 'Roadmap Belajar Bertahap', desc: 'Tidak lagi bingung mulai dari mana. Jalur belajar terstruktur dengan target jelas di setiap tahap menuju kelulusan.',
    bullets: ['9 fase belajar terstruktur', 'Syarat & indikator selesai tiap step', 'Rekomendasi langkah berikutnya'] },
  { icon: '📖', title: 'Review Soal dan Pembahasan', desc: 'Bukan sekadar kunci jawaban. Pahami konsep di balik tiap soal dengan pembahasan lengkap dan filter materi.',
    bullets: ['Pembahasan detail tiap soal', 'Filter benar/salah & per materi', 'Pahami konsep, bukan hafal kunci'] },
];

const STEPS = [
  { n: '01', title: 'Daftar Akun Gratis', desc: 'Buat akun dalam 30 detik. Langsung akses dashboard, roadmap, dan tryout pertamamu tanpa kartu kredit.' },
  { n: '02', title: 'Kerjakan Tryout', desc: 'Rasakan sensasi ujian asli dengan timer dan antarmuka identik BKN. TWK, TIU, TKP dalam satu sesi penuh.' },
  { n: '03', title: 'Analisis dan Tingkatkan', desc: 'Dapatkan skor, analitik mendalam, analisis waktu per soal, review pembahasan, dan posisi ranking nasional.' },
];

const FAQS = [
  { q: 'Apakah simulasi benar-benar mirip sistem BKN?', a: 'Ya! Kami merancang UI/UX, peletakan tombol, ukuran font, hingga sistem timer persis seperti aplikasi CAT BKN. Saat ujian asli, kamu sudah tidak canggung dan bisa fokus penuh pada soal.' },
  { q: 'Apa itu fitur Analisis Waktu per Soal?', a: 'Fitur eksklusif PintuASN yang merekam berapa detik kamu habiskan untuk tiap soal. Dari data ini, kamu bisa tahu soal mana yang menjadi "pemborosan waktu" dan memperbaiki strategi pengerjaan di sesi berikutnya.' },
  { q: 'Apakah soal-soalnya update sesuai kisi-kisi terbaru?', a: 'Tentu. Tim akademik kami terus memperbarui bank soal setiap bulan mengikuti Peraturan Menteri PANRB terbaru dan tren soal CPNS tahun-tahun sebelumnya, termasuk soal berstandar HOTS.' },
  { q: 'Bagaimana cara pembayaran paket Premium/Platinum?', a: 'Kami menerima QRIS, GoPay, OVO, ShopeePay, Transfer Bank (VA BCA, BNI, Mandiri, BRI), hingga Alfamart/Indomaret. Semua diproses melalui Midtrans yang aman dan terenkripsi.' },
  { q: 'Saya daftar gratis, apakah wajib upgrade?', a: 'Tidak wajib sama sekali. Paket Gratis agar kamu bisa mencoba sistem dan kualitas soal tanpa komitmen apapun. Upgrade bisa kapan saja ketika kamu merasa siap dan membutuhkan fitur lebih lengkap.' },
];

const CSS = `
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --white:#fff; --s50:#f8fafc; --s100:#f1f5f9; --s200:#e2e8f0; --s300:#cbd5e1;
  --s400:#94a3b8; --s500:#64748b; --s600:#475569; --s700:#334155; --s800:#1e293b; --s900:#0f172a;
  --navy:#1e293b; --navy-d:#0f172a; --navy-l:#334155;
  --gold:#0ea5e9; --gold-d:#0284c7; --gold-l:#e0f2fe; --sky-l:#38bdf8;
  --yellow:#f5b700; --yellow-d:var(--yellow-d);
  --font:'Plus Jakarta Sans',var(--font-jakarta),sans-serif;
}
html{scroll-behavior:smooth}
.lp{font-family:var(--font);background:#fff;color:var(--s800);overflow-x:clip}
.lp section{position:relative}

/* ── keyframes ── */
@keyframes lp-floatA{0%,100%{transform:translateY(0) rotate(-1.5deg)}50%{transform:translateY(-16px) rotate(-1.5deg)}}
@keyframes lp-floatB{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
@keyframes lp-fadeup{from{opacity:0;transform:translateY(34px)}to{opacity:1;transform:translateY(0)}}
@keyframes lp-fadein{from{opacity:0}to{opacity:1}}
@keyframes lp-pulse{0%,100%{opacity:1}50%{opacity:.4}}
@keyframes lp-ticker{from{transform:translateX(0)}to{transform:translateX(-50%)}}
@keyframes lp-drift1{0%,100%{transform:translate(0,0)}50%{transform:translate(40px,-30px)}}
@keyframes lp-drift2{0%,100%{transform:translate(0,0)}50%{transform:translate(-34px,28px)}}
@keyframes lp-glow{0%,100%{opacity:.4;transform:scale(1)}50%{opacity:.7;transform:scale(1.12)}}
@keyframes lp-spin{to{transform:rotate(360deg)}}
@keyframes lp-shimmer{to{background-position:200% center}}
@keyframes lp-grow{from{height:8%}to{height:var(--h)}}
@keyframes lp-draw{to{stroke-dashoffset:0}}
@keyframes lp-bar{from{width:0}}
@keyframes lp-slidedown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}

/* ── reveal on scroll ── */
.reveal{opacity:0;transform:translateY(32px);transition:opacity .7s ease,transform .7s cubic-bezier(.2,.7,.2,1)}
.reveal.visible{opacity:1;transform:none}

/* ── navbar ── */
.lp-nav{position:fixed;top:0;left:0;right:0;z-index:60;display:flex;align-items:center;justify-content:space-between;
  padding:16px 28px;transition:.3s;background:rgba(255,255,255,0);}
.lp-nav.scrolled{background:rgba(255,255,255,.85);backdrop-filter:blur(12px);box-shadow:0 4px 24px rgba(30,41,59,.07);padding:11px 28px}
.lp-logo{display:flex;align-items:center;gap:9px;font-weight:800;font-size:19px;color:var(--navy);text-decoration:none;letter-spacing:-.3px}
.lp-logo .badge{width:34px;height:34px;border-radius:10px;background:var(--navy);color:var(--gold);display:flex;align-items:center;justify-content:center;font-size:17px;box-shadow:0 6px 16px rgba(30,41,59,.25)}
.lp-logo .gold{color:var(--gold)}
.lp-logo-img{height:30px;width:auto;display:block}
.lp-links{display:flex;align-items:center;gap:30px;list-style:none}
.lp-links a{color:var(--s600);text-decoration:none;font-size:14px;font-weight:600;position:relative;transition:.2s}
.lp-links a::after{content:'';position:absolute;left:0;bottom:-5px;width:0;height:2px;background:var(--gold);transition:width .25s}
.lp-links a:hover{color:var(--navy)}
.lp-links a:hover::after{width:100%}
.lp-nav-cta{display:flex;align-items:center;gap:12px}
.btn-ghost{color:var(--navy);font-weight:700;font-size:14px;text-decoration:none;padding:9px 14px;border-radius:10px;transition:.2s}
.btn-ghost:hover{background:var(--s100)}
.btn-gold{background:var(--gold);color:#fff;font-weight:800;font-size:14px;text-decoration:none;padding:10px 20px;border-radius:11px;
  box-shadow:0 8px 22px rgba(14,165,233,.32);transition:.25s}
.btn-gold:hover{transform:translateY(-2px);box-shadow:0 12px 28px rgba(14,165,233,.45)}
.lp-burger{display:none;background:none;border:none;cursor:pointer;flex-direction:column;gap:5px;padding:6px}
.lp-burger span{width:24px;height:2.5px;background:var(--navy);border-radius:2px;transition:.3s}
.lp-mobile{display:none}

/* ── hero ── */
.hero{min-height:100svh;display:grid;place-items:center;padding:104px 28px 72px;background:linear-gradient(180deg,#fff 0%,var(--s50) 100%);overflow:hidden}
.hero::before{content:'';position:absolute;width:480px;height:480px;border-radius:50%;
  background:radial-gradient(circle,rgba(30,41,59,.16),transparent 65%);
  left:var(--mx,70%);top:var(--my,30%);transform:translate(-50%,-50%);pointer-events:none;transition:left .25s,top .25s;z-index:0}
.hero-blob{position:absolute;border-radius:50%;filter:blur(60px);pointer-events:none;z-index:0}
.hero-grid{position:relative;z-index:2;width:100%;max-width:1180px;margin:0 auto;display:grid;grid-template-columns:1.05fr .95fr;gap:54px;align-items:center}
.hero h1{font-size:clamp(34px,5vw,56px);font-weight:800;line-height:1.08;letter-spacing:-1.2px;color:var(--navy)}
.hero h1 em{font-style:normal;background:linear-gradient(100deg,var(--gold),var(--yellow),var(--gold));background-size:200% auto;
  -webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;animation:lp-shimmer 4s linear infinite}
.hero-sub{font-size:clamp(15px,1.6vw,18px);color:var(--s500);line-height:1.65;margin:22px 0 30px;max-width:540px}
.hero-sub strong{color:var(--navy);font-weight:700}
.cta-row{display:flex;gap:14px;flex-wrap:wrap}
.cta-big{padding:15px 30px;border-radius:13px;font-weight:800;font-size:15px;text-decoration:none;transition:.25s;display:inline-flex;align-items:center;gap:8px}
.cta-y{background:var(--gold);color:#fff;box-shadow:0 12px 30px rgba(14,165,233,.36)}
.cta-y:hover{transform:translateY(-3px) scale(1.02);box-shadow:0 18px 40px rgba(14,165,233,.48)}
.cta-o{background:#fff;color:var(--navy);border:1.5px solid var(--s200)}
.cta-o:hover{border-color:var(--navy);transform:translateY(-3px)}
.proof{display:flex;align-items:center;gap:14px;margin-top:34px}
.avatars{display:flex}
.avatars .av{position:relative;width:40px;height:40px;border-radius:50%;border:2.5px solid #fff;margin-left:-11px;
  box-shadow:0 2px 8px rgba(0,0,0,.14);overflow:hidden;background:var(--navy);transition:transform .2s}
.avatars .av:first-child{margin-left:0}
.avatars .av:hover{transform:translateY(-3px) scale(1.06);z-index:2}
.avatars .av img{width:100%;height:100%;object-fit:cover;display:block}
.avatars .av .ini{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:#fff}
.stars{color:var(--yellow);font-size:14px;letter-spacing:2px}
.proof p{font-size:13px;color:var(--s500);margin-top:2px}
.proof p strong{color:var(--navy)}

/* ── hero mock ── */
.mock{position:relative;animation:lp-fadein .9s .3s ease both}
.mock-card{background:#fff;border:1px solid var(--s200);border-radius:18px;box-shadow:0 30px 70px rgba(30,41,59,.18);overflow:hidden;animation:lp-floatA 6s ease-in-out infinite}
.mock-bar{background:var(--navy);padding:10px 14px;display:flex;align-items:center;gap:7px}
.mock-bar i{width:9px;height:9px;border-radius:50%;display:block}
.mock-url{flex:1;text-align:center;font-size:9px;color:rgba(255,255,255,.4);font-family:monospace}
/* exam header (mirip exam page asli) */
.exam-top{background:var(--navy);padding:9px 14px 11px;display:flex;align-items:center;gap:9px;border-top:1px solid rgba(255,255,255,.06)}
.exam-cat{font-size:9px;font-weight:800;color:var(--sky-l);border:1px solid rgba(14,165,233,.55);border-radius:50px;padding:2px 9px;flex-shrink:0}
.exam-title{flex:1;font-size:11px;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.exam-timer{display:flex;align-items:center;gap:4px;font-size:11px;font-weight:800;color:var(--yellow);background:rgba(245,183,0,.18);padding:3px 9px;border-radius:7px;flex-shrink:0;animation:lp-pulse 2s infinite}
.exam-sub{padding:11px 14px 0}
.exam-subrow{display:flex;justify-content:space-between;font-size:9.5px;color:var(--s400);margin-bottom:6px}
.mock-prog{height:6px;background:var(--s100);border-radius:4px;overflow:hidden}
.mock-prog i{display:block;height:100%;width:50%;background:linear-gradient(90deg,var(--gold),var(--yellow));border-radius:4px;animation:lp-bar 1.4s ease both}
.mock-body{padding:14px}
.mock-q{background:var(--s50);border:1px solid var(--s100);border-radius:10px;padding:11px 12px;margin-bottom:12px}
.mock-q b{font-size:9px;color:var(--gold-d);font-weight:800;letter-spacing:.3px}
.mock-q p{font-size:11px;color:var(--s700);margin-top:4px;line-height:1.45}
.mock-opt{display:flex;align-items:center;gap:10px;border:1.5px solid var(--s200);border-radius:11px;padding:9px 11px;margin-bottom:8px;font-size:10.5px;color:var(--s600);transition:.2s}
.mock-opt .lt{flex-shrink:0;width:22px;height:22px;border-radius:50%;border:2px solid var(--s300);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;color:var(--s500)}
.mock-opt .tx{flex:1}
.mock-opt .ck{color:var(--gold);font-weight:800;font-size:12px}
.mock-opt.on{border-color:var(--gold);background:rgba(14,165,233,.07);color:#075985;font-weight:600}
.mock-opt.on .lt{background:var(--gold);border-color:var(--gold);color:#fff}
.exam-nav{display:flex;justify-content:space-between;gap:8px;margin-top:13px}
.exam-nav button{flex:1;font-size:10px;font-weight:800;padding:9px;border-radius:9px;border:1px solid var(--s200);background:#fff;color:var(--s500);cursor:default}
.exam-nav .next{background:var(--gold);border-color:var(--gold);color:#fff}
.float-badge{position:absolute;background:#fff;border:1px solid var(--s200);border-radius:14px;padding:10px 14px;
  box-shadow:0 14px 34px rgba(30,41,59,.16);display:flex;align-items:center;gap:10px;z-index:3;animation:lp-floatB 5s ease-in-out infinite}
.float-badge.b1{top:-22px;right:-16px}
.float-badge.b2{bottom:-18px;left:-18px;background:var(--navy);animation-delay:1s}
.float-badge .ico{width:34px;height:34px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:16px}

/* ── ticker ── */
.ticker{background:var(--navy);overflow:hidden;padding:15px 0;white-space:nowrap;position:relative}
.ticker-track{display:inline-flex;gap:42px;animation:lp-ticker 28s linear infinite}
.ticker-item{display:inline-flex;align-items:center;gap:9px;color:rgba(255,255,255,.85);font-size:14px;font-weight:600}
.ticker-dot{width:6px;height:6px;border-radius:50%;background:var(--sky-l);display:block;flex-shrink:0}

/* ── stats ── */
.stats{background:linear-gradient(135deg,var(--navy),var(--navy-d));padding:54px 28px}
.stats-inner{max-width:1080px;margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr);gap:24px;text-align:center}
.stat-num{font-size:clamp(30px,4vw,46px);font-weight:800;color:var(--sky-l);line-height:1;letter-spacing:-1px;display:block}
.stat-label{font-size:12.5px;color:rgba(255,255,255,.6);margin-top:8px;font-weight:500}

/* ── generic section ── */
.sec{padding:84px 28px}
.sec-in{max-width:1140px;margin:0 auto}
.sec-head{text-align:center;max-width:640px;margin:0 auto 50px}
.tag{display:inline-flex;align-items:center;gap:7px;background:var(--gold-l);color:var(--gold-d);font-size:12px;font-weight:800;
  padding:6px 14px;border-radius:50px;text-transform:uppercase;letter-spacing:.6px;margin-bottom:16px}
.sec-title{font-size:clamp(26px,3.4vw,38px);font-weight:800;color:var(--navy);line-height:1.15;letter-spacing:-.8px}
.sec-sub{font-size:15.5px;color:var(--s500);line-height:1.6;margin-top:14px}

/* ── pain cards ── */
.pain-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
.pain-card{background:#fff;border:1px solid var(--s200);border-radius:18px;padding:30px 26px;transition:.3s;will-change:transform}
.pain-card:hover{transform:translateY(-6px);box-shadow:0 22px 50px rgba(30,41,59,.1);border-color:var(--gold)}
.pain-ico{width:56px;height:56px;border-radius:15px;background:var(--gold-l);display:flex;align-items:center;justify-content:center;font-size:27px;margin-bottom:18px}
.pain-no{display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:11px;background:var(--gold-l);color:var(--gold-d);font-size:14px;font-weight:800;margin-bottom:16px}
.pain-card h3{font-size:18px;font-weight:800;color:var(--navy);margin-bottom:9px}
.pain-card p{font-size:14px;color:var(--s500);line-height:1.6}

/* ── showcase ── */
.showcase{background:linear-gradient(160deg,var(--navy),var(--navy-d));padding:84px 28px}
.showcase .tag{background:rgba(14,165,233,.16);color:var(--sky-l)}
.showcase .sec-title{color:#fff}
.showcase .sec-sub{color:rgba(255,255,255,.55)}
.browser{max-width:920px;margin:0 auto;background:#0f172a;border:1px solid rgba(255,255,255,.1);border-radius:16px;overflow:hidden;
  box-shadow:0 40px 90px rgba(0,0,0,.4);animation:lp-floatB 6s ease-in-out infinite}
.browser-bar{background:rgba(255,255,255,.04);padding:11px 14px;display:flex;align-items:center;gap:7px;border-bottom:1px solid rgba(255,255,255,.06)}
.dash{padding:22px;display:grid;grid-template-columns:1.4fr 1fr;gap:16px;background:#0f172a}
.dash-card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:13px;padding:16px}
.dash-card h5{font-size:11px;color:rgba(255,255,255,.55);font-weight:700;margin-bottom:3px}
.dash-card .big{font-size:22px;font-weight:800;color:#fff}
.dash-card .big span{font-size:11px;color:var(--sky-l)}
.bars{display:flex;align-items:flex-end;gap:10px;height:96px;margin-top:14px}
.bars i{flex:1;border-radius:6px 6px 0 0;background:linear-gradient(180deg,#0ea5e9,#0284c7);animation:lp-grow 1.1s ease both}
.bars i:nth-child(odd){background:linear-gradient(180deg,#64748b,#475569)}
.tiles{display:grid;grid-template-rows:repeat(3,1fr);gap:12px}
.tile{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:12px 14px;display:flex;justify-content:space-between;align-items:center}
.tile .l{font-size:11px;color:rgba(255,255,255,.6)}
.tile .v{font-size:15px;font-weight:800;color:var(--sky-l)}

/* ── showcase: 2 layar (statistik + hasil) ── */
.showcase-stack{max-width:1000px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:24px;align-items:start}
.screen{background:#0f172a;border:1px solid rgba(255,255,255,.1);border-radius:16px;overflow:hidden;box-shadow:0 36px 80px rgba(0,0,0,.45);animation:lp-floatB 6s ease-in-out infinite}
.screen.s2{animation-delay:1.3s}
.scr-cap{text-align:center;font-size:11px;font-weight:700;color:rgba(255,255,255,.45);margin-top:12px}
.scr-body{padding:18px}
.scr-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}
.scr-title{font-size:13px;font-weight:800;color:#fff}
.scr-tag{font-size:9px;font-weight:800;color:var(--sky-l);background:rgba(14,165,233,.16);padding:3px 10px;border-radius:50px}
.scr-tag.pass{color:#34d399;background:rgba(52,211,153,.16)}
/* trend chart */
.trend-wrap{height:118px;margin-bottom:16px}
.trend-svg{width:100%;height:100%;overflow:visible}
.trend-line{fill:none;stroke:var(--sky-l);stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:600;stroke-dashoffset:600;animation:lp-draw 1.9s ease forwards .2s}
.trend-dot{fill:#fff;stroke:var(--sky-l);stroke-width:2;opacity:0;animation:lp-fadein .4s ease forwards}
/* category bars */
.catbar{margin-bottom:11px}
.catbar-top{display:flex;justify-content:space-between;font-size:10.5px;color:rgba(255,255,255,.6);margin-bottom:5px}
.catbar-top b{color:#fff;font-weight:700}
.catbar-track{height:8px;background:rgba(255,255,255,.08);border-radius:5px;overflow:hidden}
.catbar-fill{height:100%;border-radius:5px;width:0;animation:lp-bar 1.4s cubic-bezier(.2,.7,.2,1) forwards .3s}
/* donut */
.donut-row{display:flex;align-items:center;gap:18px;margin-bottom:16px}
.donut{position:relative;width:118px;height:118px;flex-shrink:0}
.donut svg{width:100%;height:100%}
.donut circle{fill:none;stroke-width:15;transform-origin:center;stroke-dasharray:0 264;animation:lp-arc 1.1s ease forwards}
@keyframes lp-arc{to{stroke-dasharray:var(--seg) var(--gap)}}
.donut-center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}
.donut-center b{font-size:26px;font-weight:800;color:#fff;line-height:1}
.donut-center span{font-size:9px;color:rgba(255,255,255,.5);margin-top:3px;text-transform:uppercase;letter-spacing:.5px}
.donut-legend{flex:1;display:flex;flex-direction:column;gap:9px}
.lg{display:flex;align-items:center;gap:8px;font-size:11px;color:rgba(255,255,255,.65)}
.lg i{width:10px;height:10px;border-radius:3px;display:block;flex-shrink:0}
.lg b{margin-left:auto;color:#fff;font-weight:800}
.pace-title{font-size:9.5px;color:rgba(255,255,255,.5);font-weight:800;margin-bottom:9px;text-transform:uppercase;letter-spacing:.5px}

/* ── features ── */
.feat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
.feat-card{position:relative;background:#fff;border:1px solid var(--s200);border-radius:18px;padding:28px 24px;transition:transform .15s ease,box-shadow .3s,border-color .3s;will-change:transform;transform-style:preserve-3d}
.feat-card:hover{box-shadow:0 26px 56px rgba(30,41,59,.13);border-color:var(--gold)}
.feat-ico{width:54px;height:54px;border-radius:15px;background:linear-gradient(135deg,var(--navy),var(--navy-l));color:#fff;
  display:flex;align-items:center;justify-content:center;font-size:25px;margin-bottom:17px;box-shadow:0 10px 24px rgba(30,41,59,.2)}
.feat-card h3{font-size:17px;font-weight:800;color:var(--navy);margin-bottom:8px}
.feat-card p{font-size:13.5px;color:var(--s500);line-height:1.6}
.feat-badge{position:absolute;top:18px;right:18px;background:var(--gold);color:#fff;font-size:10px;font-weight:800;padding:3px 9px;border-radius:50px;text-transform:uppercase;letter-spacing:.4px}

/* ── feature stacking cards (scroll-driven, ala AYOCPNS) ── */
.feat-stack{max-width:980px;margin:0 auto}
.feat-panel{position:sticky;margin-bottom:30px}
.feat-card2{position:relative;background:#fff;border:1px solid var(--s200);border-radius:26px;box-shadow:0 30px 70px rgba(30,41,59,.16);display:grid;grid-template-columns:1.05fr 1fr;gap:42px;padding:44px;align-items:center;overflow:hidden;min-height:440px}
.fc-num{position:absolute;top:26px;right:38px;font-size:78px;font-weight:800;color:var(--s100);line-height:1;letter-spacing:-3px;z-index:0}
.fc-text{position:relative;z-index:1}
.fc-icon{width:58px;height:58px;border-radius:17px;background:linear-gradient(135deg,var(--navy),var(--navy-l));color:var(--sky-l);display:flex;align-items:center;justify-content:center;font-size:27px;margin-bottom:18px;box-shadow:0 10px 24px rgba(30,41,59,.2)}
.fc-badge{display:inline-block;background:var(--yellow);color:#1e293b;font-size:11px;font-weight:800;padding:4px 12px;border-radius:50px;text-transform:uppercase;letter-spacing:.4px;margin-bottom:12px}
.fc-text h3{font-size:26px;font-weight:800;color:var(--navy);margin-bottom:12px;letter-spacing:-.5px;line-height:1.15}
.fc-text p{font-size:15px;color:var(--s500);line-height:1.65}
.fc-bullets{list-style:none;margin-top:20px;display:flex;flex-direction:column;gap:11px}
.fc-bullets li{display:flex;align-items:flex-start;gap:11px;font-size:14px;color:var(--s700);font-weight:600;line-height:1.4}
.fc-bullets .ck{flex-shrink:0;width:21px;height:21px;border-radius:50%;background:rgba(14,165,233,.14);color:var(--gold);font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center;margin-top:1px}
.fc-demo{position:relative;background:var(--s50);border:1px solid var(--s100);border-radius:20px;height:330px;overflow:hidden;display:flex;align-items:center;justify-content:center;padding:24px}
/* demo 0 — simulasi exam */
.d-exam{width:100%;max-width:260px;background:#fff;border:1px solid var(--s200);border-radius:13px;overflow:hidden;box-shadow:0 10px 26px rgba(30,41,59,.1)}
.d-exam .eh{background:var(--navy);padding:9px 12px;display:flex;justify-content:space-between;align-items:center}
.d-exam .cat{font-size:9px;font-weight:800;color:var(--sky-l);border:1px solid rgba(14,165,233,.5);padding:2px 8px;border-radius:50px}
.d-exam .tm{font-size:10px;font-weight:800;color:var(--yellow);background:rgba(245,183,0,.16);padding:2px 8px;border-radius:6px}
.d-exam .opt{display:flex;align-items:center;gap:9px;margin:8px 10px;padding:8px 10px;border:1.5px solid var(--s200);border-radius:9px;font-size:10px;color:var(--s600)}
.d-exam .opt .lt{width:18px;height:18px;border-radius:50%;border:2px solid var(--s300);display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:800;color:var(--s400);flex-shrink:0}
.feat-card2.active .d-exam .opt.sel{border-color:var(--gold);background:rgba(14,165,233,.07);color:#075985;transition:.45s .55s}
.feat-card2.active .d-exam .opt.sel .lt{background:var(--gold);border-color:var(--gold);color:#fff;transition:.45s .55s}
/* demo 1 — bars waktu */
.d-bars{display:flex;align-items:flex-end;gap:11px;height:160px}
.d-bars .bar{position:relative;width:24px;border-radius:7px 7px 0 0;background:var(--sky-l);height:8%;transition:height 1s cubic-bezier(.2,.7,.2,1)}
.d-bars .bar.warn{background:var(--yellow)}
.d-bars .bar .wlbl{position:absolute;top:-19px;left:50%;transform:translateX(-50%);font-size:9px;font-weight:800;color:var(--yellow-d);white-space:nowrap}
.feat-card2.active .d-bars .bar{height:var(--h)}
/* demo 2 — analitik chart */
.d-chart{width:100%;height:150px;position:relative}
.d-chart svg{width:100%;height:100%;overflow:visible}
.d-chart .ln{fill:none;stroke:var(--sky-l);stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:420;stroke-dashoffset:420}
.d-chart .area{opacity:0}
.feat-card2.active .d-chart .ln{animation:lp-draw 1.6s ease forwards .3s}
.feat-card2.active .d-chart .area{opacity:1;transition:opacity .8s ease .9s}
.d-chart .up{position:absolute;top:4px;right:6px;font-size:11px;font-weight:800;color:var(--yellow-d);background:rgba(245,183,0,.16);padding:3px 9px;border-radius:50px}
/* demo 3 — peringkat */
.d-rank{width:100%;max-width:240px}
.d-rank .row{display:flex;align-items:center;gap:10px;background:#fff;border:1px solid var(--s200);border-radius:10px;padding:9px 12px;margin-bottom:8px;opacity:0;transform:translateY(12px)}
.feat-card2.active .d-rank .row{opacity:1;transform:none;transition:.5s ease}
.d-rank .row.you{border-color:var(--gold);background:rgba(14,165,233,.07)}
.d-rank .rk{font-size:12px;font-weight:800;color:var(--s400);width:26px}
.d-rank .row.you .rk{color:var(--gold)}
.d-rank .nm{flex:1;font-size:11px;font-weight:700;color:var(--s700)}
.d-rank .row.you .nm{color:var(--navy)}
.d-rank .sc{font-size:11px;font-weight:800;color:var(--navy)}
/* demo 4 — roadmap */
.d-road{position:relative;display:flex;align-items:center;justify-content:space-between;width:100%;max-width:280px;padding:0 4px}
.d-road .line{position:absolute;left:18px;right:18px;top:50%;height:3px;background:var(--s200);transform:translateY(-50%)}
.d-road .prog{position:absolute;left:18px;top:50%;height:3px;background:var(--sky-l);width:0;transform:translateY(-50%);border-radius:3px}
.feat-card2.active .d-road .prog{width:58%;transition:width 1.3s ease .3s}
.d-road .node{position:relative;z-index:1;width:36px;height:36px;border-radius:50%;background:#fff;border:2px solid var(--s200);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;color:var(--s400)}
.feat-card2.active .d-road .node.done{background:var(--sky-l);border-color:var(--sky-l);color:#fff;transition:.4s}
.d-road .node.cur{border-color:var(--yellow);color:var(--yellow-d)}
.feat-card2.active .d-road .node.cur{box-shadow:0 0 0 5px rgba(245,183,0,.22);transition:.4s .8s}
/* demo 5 — review */
.d-rev{width:100%;max-width:260px}
.d-rev .ro{display:flex;justify-content:space-between;align-items:center;background:#fff;border:1.5px solid var(--s200);border-radius:10px;padding:9px 12px;margin-bottom:8px;font-size:10.5px;color:var(--s600)}
.d-rev .ro.ok{border-color:#10b981;background:#ecfdf5;color:#065f46}
.d-rev .ro.no{border-color:#fb7185;background:#fff1f2;color:#9f1239}
.d-rev .pemb{background:var(--navy);color:rgba(255,255,255,.85);border-radius:11px;padding:11px 13px;font-size:10.5px;line-height:1.5;opacity:0;transform:translateY(12px)}
.feat-card2.active .d-rev .pemb{opacity:1;transform:none;transition:.55s ease .6s}
.d-rev .pemb b{color:var(--sky-l)}

/* ── steps ── */
.steps{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;position:relative}
.step{background:#fff;border:1px solid var(--s200);border-radius:18px;padding:30px 26px;transition:.3s}
.step:hover{transform:translateY(-6px);box-shadow:0 22px 50px rgba(30,41,59,.1)}
.step-n{font-size:42px;font-weight:800;color:var(--gold-l);line-height:1;letter-spacing:-2px;-webkit-text-stroke:1.5px var(--gold);margin-bottom:14px}
.step h3{font-size:18px;font-weight:800;color:var(--navy);margin-bottom:9px}
.step p{font-size:14px;color:var(--s500);line-height:1.6}

/* ── pricing ── */
.price-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px;align-items:stretch}
.pcard{position:relative;border-radius:20px;padding:30px 26px;display:flex;flex-direction:column;transition:.3s}
.pcard:hover{transform:translateY(-8px)}
.pcard.free{background:#fff;border:1px solid var(--s200)}
.pcard.prem{background:linear-gradient(160deg,var(--navy),var(--navy-d));box-shadow:0 28px 64px rgba(30,41,59,.4);transform:scale(1.03)}
.pcard.prem:hover{transform:scale(1.03) translateY(-8px)}
.pcard.plat{background:linear-gradient(160deg,#3b0764,#1a0533);box-shadow:0 28px 64px rgba(59,7,100,.5);border:1px solid rgba(167,139,250,.3)}
.pop{position:absolute;top:-13px;left:50%;transform:translateX(-50%);font-size:11px;font-weight:800;padding:5px 15px;border-radius:50px;white-space:nowrap}
.pop.g{background:var(--gold);color:#fff}
.pop.n{background:#fff;color:var(--navy)}
.p-iconrow{display:flex;align-items:center;gap:12px;margin-bottom:18px}
.p-iconbox{width:46px;height:46px;border-radius:13px;display:flex;align-items:center;justify-content:center;font-size:22px}
.p-name{font-size:19px;font-weight:800}
.p-period{font-size:12px}
.p-orig{font-size:14px;text-decoration:line-through;margin-bottom:2px}
.p-amount{font-size:32px;font-weight:800;letter-spacing:-1px}
.p-desc{font-size:13px;line-height:1.5;padding-bottom:18px;margin-bottom:18px}
.p-feats{list-style:none;display:flex;flex-direction:column;gap:11px;flex:1;margin-bottom:22px}
.p-feats li{display:flex;align-items:flex-start;gap:10px;font-size:13px;line-height:1.4}
.chk{flex-shrink:0;width:19px;height:19px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;margin-top:1px}
.p-btn{text-align:center;padding:13px;border-radius:12px;font-weight:800;font-size:14px;text-decoration:none;transition:.25s}
.p-btn:hover{transform:translateY(-2px)}
.pay-note{text-align:center;margin-top:34px;font-size:13px;color:var(--s400)}

/* ── faq ── */
.faq-in{max-width:760px;margin:0 auto;display:flex;flex-direction:column;gap:12px}
.faq-item{background:#fff;border:1px solid var(--s200);border-radius:14px;overflow:hidden;transition:.25s}
.faq-item:hover{border-color:var(--gold)}
.faq-btn{width:100%;display:flex;justify-content:space-between;align-items:center;gap:16px;padding:18px 22px;background:none;border:none;cursor:pointer;text-align:left}
.faq-q{font-size:15px;font-weight:700;color:var(--navy)}
.faq-chev{color:var(--gold);font-size:12px;transition:transform .3s;flex-shrink:0}
.faq-btn.open .faq-chev{transform:rotate(180deg)}
.faq-body{max-height:0;overflow:hidden;transition:max-height .35s ease}
.faq-body p{padding:0 22px 20px;font-size:14px;color:var(--s500);line-height:1.65}

/* ── final cta ── */
.final{background:linear-gradient(135deg,var(--navy),var(--navy-d));padding:90px 28px;text-align:center;overflow:hidden}
.final-in{position:relative;z-index:2;max-width:680px;margin:0 auto}
.final-pill{display:inline-flex;align-items:center;gap:8px;background:rgba(14,165,233,.15);border:1px solid rgba(14,165,233,.4);
  border-radius:50px;padding:7px 17px;font-size:13px;font-weight:700;color:var(--sky-l);margin-bottom:24px}
.final .cta-y{background:#fff;color:#1e293b;box-shadow:0 12px 30px rgba(0,0,0,.25)}
.final .cta-y:hover{box-shadow:0 18px 40px rgba(0,0,0,.35)}
.final h2{font-size:clamp(28px,4vw,44px);font-weight:800;color:#fff;line-height:1.15;letter-spacing:-1px;margin-bottom:16px}
.final p{font-size:16px;color:rgba(255,255,255,.6);margin-bottom:30px}
.final .sub{margin-top:18px;font-size:13px;color:rgba(255,255,255,.35)}

/* ── footer ── */
.lp-footer{background:#fff;border-top:1px solid var(--s100);padding:48px 28px 22px}
.foot-grid{max-width:1100px;margin:0 auto 28px;display:grid;grid-template-columns:2fr 1fr 1fr;gap:48px}
.foot-col h4{font-size:12px;font-weight:800;color:var(--navy);margin-bottom:16px;text-transform:uppercase;letter-spacing:.8px}
.foot-col a{display:block;font-size:14px;color:var(--s500);text-decoration:none;margin-bottom:10px;transition:.2s}
.foot-col a:hover{color:var(--gold-d)}
.foot-bottom{max-width:1100px;margin:0 auto;border-top:1px solid var(--s100);padding-top:16px;display:flex;justify-content:space-between;align-items:center}
.foot-bottom p{font-size:13px;color:var(--s400)}
.social{display:flex;gap:8px;margin-top:14px}
.social div{width:34px;height:34px;border-radius:9px;background:var(--s100);display:flex;align-items:center;justify-content:center;font-size:14px;cursor:pointer;transition:.2s}
.social div:hover{background:var(--gold-l);transform:translateY(-2px)}

/* ── responsive ── */
@media(max-width:880px){
  .hero-grid,.dash,.showcase-stack{grid-template-columns:1fr}
  .pain-grid,.feat-grid,.steps,.price-grid{grid-template-columns:1fr}
  .feat-card2{grid-template-columns:1fr;padding:24px;gap:20px}
  .fc-num{display:none}
  .fc-demo{height:200px}
  .stats-inner{grid-template-columns:repeat(2,1fr);gap:30px}
  .foot-grid{grid-template-columns:1fr 1fr;gap:30px}
  .pcard.prem{transform:none}.pcard.prem:hover{transform:translateY(-8px)}
  .hero-right{display:flex;justify-content:center;margin-top:20px}
  .lp-links,.lp-nav-cta{display:none}
  .lp-burger{display:flex}
  .lp-mobile{display:block;position:fixed;top:60px;left:0;right:0;z-index:55;background:#fff;border-bottom:1px solid var(--s200);
    padding:16px 24px;box-shadow:0 12px 30px rgba(30,41,59,.1);animation:lp-slidedown .25s ease}
  .lp-mobile a{display:block;padding:12px 0;color:var(--s700);font-weight:700;text-decoration:none;border-bottom:1px solid var(--s100)}
  .lp-mobile .btn-gold{display:block;text-align:center;margin-top:14px;border-bottom:none}
}
@media(max-width:560px){
  .foot-grid{grid-template-columns:1fr}.foot-bottom{flex-direction:column;gap:8px;text-align:center}
  .sec{padding:60px 20px}.hero{padding:120px 20px 56px}
}
@media (prefers-reduced-motion: reduce){
  *{animation:none !important}
  .reveal{opacity:1 !important;transform:none !important}
  .hero::before{display:none}
}
`;

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const nav = document.getElementById('lp-nav');
    const onScroll = () => nav?.classList.toggle('scrolled', window.scrollY > 40);
    window.addEventListener('scroll', onScroll);

    const onResize = () => { if (window.innerWidth > 880) setMenuOpen(false); };
    window.addEventListener('resize', onResize);

    // reveal
    const io = new IntersectionObserver((es) => {
      es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));

    // counter
    const count = (el: HTMLElement) => {
      const t = parseFloat(el.dataset.target || '0');
      const dec = String(el.dataset.target).includes('.');
      const start = performance.now();
      const run = (now: number) => {
        const p = Math.min((now - start) / 1800, 1);
        const e = 1 - Math.pow(1 - p, 3);
        el.textContent = dec ? (t * e).toFixed(1) : Math.floor(t * e).toLocaleString('id-ID');
        if (p < 1) requestAnimationFrame(run);
        else el.textContent = dec ? t.toFixed(1) : t.toLocaleString('id-ID');
      };
      requestAnimationFrame(run);
    };
    const statIo = new IntersectionObserver((es) => {
      es.forEach(e => { if (e.isIntersecting) { e.target.querySelectorAll<HTMLElement>('[data-target]').forEach(count); statIo.unobserve(e.target); } });
    }, { threshold: 0.3 });
    const sb = document.querySelector('.stats-inner');
    if (sb) statIo.observe(sb);

    // hero cursor glow
    const hero = document.getElementById('hero');
    const onHeroMove = (ev: MouseEvent) => {
      const r = hero!.getBoundingClientRect();
      hero!.style.setProperty('--mx', `${ev.clientX - r.left}px`);
      hero!.style.setProperty('--my', `${ev.clientY - r.top}px`);
    };
    hero?.addEventListener('mousemove', onHeroMove);

    // tilt 3D on feature cards
    const tilts = Array.from(document.querySelectorAll<HTMLElement>('.tilt'));
    const handlers: { el: HTMLElement; move: (e: MouseEvent) => void; leave: () => void }[] = [];
    tilts.forEach(el => {
      const move = (ev: MouseEvent) => {
        const r = el.getBoundingClientRect();
        const x = (ev.clientX - r.left) / r.width - 0.5;
        const y = (ev.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(800px) rotateY(${x * 7}deg) rotateX(${-y * 7}deg) translateY(-6px)`;
      };
      const leave = () => { el.style.transform = ''; };
      el.addEventListener('mousemove', move);
      el.addEventListener('mouseleave', leave);
      handlers.push({ el, move, leave });
    });

    // trigger animasi internal kartu fitur saat masuk viewport
    const featIo = new IntersectionObserver((es) => {
      es.forEach(e => { if (e.isIntersecting) e.target.classList.add('active'); });
    }, { threshold: 0.45 });
    document.querySelectorAll('.feat-card2').forEach(el => featIo.observe(el));

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      io.disconnect(); statIo.disconnect(); featIo.disconnect();
      hero?.removeEventListener('mousemove', onHeroMove);
      handlers.forEach(h => { h.el.removeEventListener('mousemove', h.move); h.el.removeEventListener('mouseleave', h.leave); });
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const toggleFaq = (btn: HTMLElement) => {
    const body = btn.nextElementSibling as HTMLElement;
    const isOpen = btn.classList.contains('open');
    document.querySelectorAll('.faq-btn.open').forEach(b => {
      b.classList.remove('open');
      (b.nextElementSibling as HTMLElement).style.maxHeight = '0';
    });
    if (!isOpen) { btn.classList.add('open'); body.style.maxHeight = `${body.scrollHeight}px`; }
  };

  // Animasi demo di dalam tiap kartu fitur (slate + sky + sedikit kuning)
  const renderDemo = (i: number) => {
    switch (i) {
      case 0: return (
        <div className="d-exam">
          <div className="eh"><span className="cat">TWK</span><span className="tm">⏱ 12:47</span></div>
          <div className="opt"><span className="lt">A</span>Mengutamakan kepentingan pribadi</div>
          <div className="opt sel"><span className="lt">B</span>Menjaga persatuan bangsa</div>
          <div className="opt"><span className="lt">C</span>Musyawarah untuk golongan</div>
        </div>
      );
      case 1: return (
        <div className="d-bars">
          {[[42, false], [60, false], [48, false], [95, true], [55, false], [70, false]].map(([h, w], k) => (
            <div key={k} className={`bar${w ? ' warn' : ''}`} style={{ ['--h' as string]: `${h}%`, transitionDelay: `${0.3 + k * 0.08}s` } as CSSProperties}>
              {w ? <span className="wlbl">⚠ 92 dtk</span> : null}
            </div>
          ))}
        </div>
      );
      case 2: return (
        <div className="d-chart">
          <span className="up">▲ +18%</span>
          <svg viewBox="0 0 240 120" preserveAspectRatio="none">
            <defs><linearGradient id="dcg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#38bdf8" stopOpacity="0.3" /><stop offset="1" stopColor="#38bdf8" stopOpacity="0" /></linearGradient></defs>
            <path className="area" d="M8,96 L50,74 L92,82 L134,50 L176,58 L232,22 L232,120 L8,120 Z" fill="url(#dcg)" />
            <path className="ln" d="M8,96 L50,74 L92,82 L134,50 L176,58 L232,22" />
          </svg>
        </div>
      );
      case 3: return (
        <div className="d-rank">
          {[['#4', 'Andi P.', '548'], ['#5', 'Sari W.', '546'], ['#6', 'Kamu', '545'], ['#7', 'Budi R.', '542']].map(([rk, nm, sc], k) => (
            <div key={k} className={`row${nm === 'Kamu' ? ' you' : ''}`} style={{ transitionDelay: `${0.2 + k * 0.12}s` }}>
              <span className="rk">{rk}</span><span className="nm">{nm}</span><span className="sc">{sc}</span>
            </div>
          ))}
        </div>
      );
      case 4: return (
        <div className="d-road">
          <span className="line" /><span className="prog" />
          {['✓', '✓', '✓', '4', '5'].map((t, k) => (
            <div key={k} className={`node ${k < 3 ? 'done' : k === 3 ? 'cur' : ''}`} style={{ transitionDelay: `${0.3 + k * 0.18}s` }}>{t}</div>
          ))}
        </div>
      );
      case 5: return (
        <div className="d-rev">
          <div className="ro no"><span>A. Mengutamakan diri sendiri</span><span>✗</span></div>
          <div className="ro ok"><span>B. Menjaga persatuan bangsa</span><span>✓</span></div>
          <div className="pemb"><b>Pembahasan:</b> Sila ke-3 menekankan persatuan & kesatuan, sehingga jawaban B paling tepat.</div>
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className="lp">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org', '@type': 'Organization', name: 'PintuASN',
          url: 'https://pintuasn.com', logo: 'https://pintuasn.com/images/Logo.svg',
          description: 'Platform simulasi CAT SKD CPNS terpercaya di Indonesia',
          aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', reviewCount: '12186' },
        }) }}
      />
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* ── NAVBAR ── */}
      <nav className="lp-nav" id="lp-nav">
        <a href="#hero" className="lp-logo" aria-label="PintuASN">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo-navbar-sky.svg" alt="PintuASN" className="lp-logo-img" />
        </a>
        <ul className="lp-links">
          <li><a href="#fitur">Fitur</a></li>
          <li><a href="#paket">Paket</a></li>
          <li><a href="#faq">FAQ</a></li>
          <li><a href="/blog">Blog</a></li>
        </ul>
        <div className="lp-nav-cta">
          <a href="/sign-in" className="btn-ghost">Masuk</a>
          <a href="/sign-up" className="btn-gold">Daftar Gratis</a>
        </div>
        <button className="lp-burger" aria-label="Menu" onClick={() => setMenuOpen(v => !v)}>
          <span /><span /><span />
        </button>
      </nav>
      {menuOpen && (
        <div className="lp-mobile">
          <a href="#fitur" onClick={() => setMenuOpen(false)}>Fitur</a>
          <a href="#paket" onClick={() => setMenuOpen(false)}>Paket</a>
          <a href="#faq" onClick={() => setMenuOpen(false)}>FAQ</a>
          <a href="/blog" onClick={() => setMenuOpen(false)}>Blog</a>
          <a href="/sign-in" onClick={() => setMenuOpen(false)}>Masuk</a>
          <a href="/sign-up" className="btn-gold" onClick={() => setMenuOpen(false)}>Daftar Gratis</a>
        </div>
      )}

      {/* ── HERO ── */}
      <section className="hero" id="hero">
        <div className="hero-blob lp-drift1" style={{ width: 320, height: 320, background: 'rgba(30,41,59,.12)', top: -60, left: -40 }} />
        <div className="hero-blob lp-drift2" style={{ width: 360, height: 360, background: 'rgba(245,183,0,.16)', bottom: -80, right: -50 }} />
        <div className="hero-grid">
          <div>
            <h1 className="reveal">Lulus SKD <span style={{ color: 'var(--gold)' }}>CPNS</span> Bukan Soal <em>Keberuntungan</em></h1>
            <p className="hero-sub reveal" style={{ transitionDelay: '.1s' }}>
              Tempa dirimu dengan simulasi CAT yang <strong>99% identik sistem BKN</strong>, dan biarkan analitik mendalam, roadmap terstruktur, dan ranking nasional menuntun setiap langkahmu menuju NIP impian.
            </p>
            <div className="cta-row reveal" style={{ transitionDelay: '.2s' }}>
              <a href="/sign-up" className="cta-big cta-y">Coba Gratis Sekarang</a>
              <a href="#fitur" className="cta-big cta-o">Lihat Fitur</a>
            </div>
            <div className="proof reveal" style={{ transitionDelay: '.3s' }}>
              <div className="avatars">
                {[['BU', '#7C5C3E', 'u1'], ['SW', '#A0724A', 'u2'], ['AR', '#5E4533', 'u3'], ['DN', '#9B6B4A', 'u4'], ['FN', '#6B4226', 'u5']].map(([t, c, file]) => (
                  <div key={t} className="av" style={{ background: c }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/images/avatars/${file}.jpg`} alt={`Pengguna ${t}`} loading="lazy" />
                  </div>
                ))}
              </div>
              <div>
                <div className="stars">★★★★★</div>
                <p><strong>12.000+</strong> pejuang NIP bergabung</p>
              </div>
            </div>
          </div>

          {/* hero mock */}
          <div className="hero-right">
            <div className="mock">
              <div className="mock-card">
                <div className="mock-bar">
                  <i style={{ background: '#ef4444' }} /><i style={{ background: '#f59e0b' }} /><i style={{ background: '#22c55e' }} />
                  <span className="mock-url">pintuasn.com/exam/sesi-1</span>
                </div>
                <div className="exam-top">
                  <span className="exam-cat">TWK</span>
                  <span className="exam-title">Wawasan Kebangsaan</span>
                  <span className="exam-timer">⏱ 12:47</span>
                </div>
                <div className="exam-sub">
                  <div className="exam-subrow"><span>Soal 15 dari 30</span><span>50%</span></div>
                  <div className="mock-prog"><i /></div>
                </div>
                <div className="mock-body">
                  <div className="mock-q">
                    <b>SOAL NO. 15</b>
                    <p>Contoh penerapan nilai Pancasila sila ke-3 dalam kehidupan berbangsa adalah...</p>
                  </div>
                  <div className="mock-opt on"><span className="lt">A</span><span className="tx">Menjaga persatuan dan kesatuan bangsa</span><span className="ck">✓</span></div>
                  <div className="mock-opt"><span className="lt">B</span><span className="tx">Mengutamakan kepentingan pribadi</span></div>
                  <div className="mock-opt"><span className="lt">C</span><span className="tx">Bermusyawarah untuk golongan sendiri</span></div>
                  <div className="mock-opt"><span className="lt">D</span><span className="tx">Mendahulukan hak daripada kewajiban</span></div>
                  <div className="mock-opt"><span className="lt">E</span><span className="tx">Menonjolkan kepentingan kelompok</span></div>
                  <div className="exam-nav">
                    <button>← Sebelumnya</button>
                    <button className="next">Selanjutnya →</button>
                  </div>
                </div>
              </div>
              <div className="float-badge b1">
                <div className="ico" style={{ background: 'var(--navy)', color: '#fff' }}>📊</div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--navy)' }}>Skor TWK</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#16a34a' }}>85 <span style={{ fontSize: 10, color: 'var(--s400)' }}>/ 150</span></div>
                </div>
              </div>
              <div className="float-badge b2">
                <div style={{ fontSize: 20 }}>🏆</div>
                <div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,.5)', fontWeight: 600 }}>Peringkat Nasional</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--sky-l)' }}>#247 <span style={{ fontSize: 10, color: 'rgba(255,255,255,.4)' }}>dari 12.842</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TICKER ── */}
      <div className="ticker">
        <div className="ticker-track">
          {[...TICKER, ...TICKER].map(([, tx], i) => (
            <div key={i} className="ticker-item"><span className="ticker-dot" />{tx}</div>
          ))}
        </div>
      </div>

      {/* ── STATS ── */}
      <div className="stats">
        <div className="stats-inner">
          {STATS.map((s, i) => (
            <div key={s.label} className="reveal" style={{ transitionDelay: `${i * 0.08}s` }}>
              <span className="stat-num" data-target={s.target}>0</span>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── PAIN ── */}
      <section className="sec" style={{ background: 'var(--s50)' }}>
        <div className="sec-in">
          <div className="sec-head reveal">
            <div className="tag">Masalah Nyata</div>
            <h2 className="sec-title">Mengapa Banyak yang Gagal di SKD?</h2>
            <p className="sec-sub">Bukan karena kurang pintar, tapi karena strategi dan persiapan yang salah sasaran.</p>
          </div>
          <div className="pain-grid">
            {PAINS.map((p, i) => (
              <div key={p.title} className="pain-card reveal" style={{ transitionDelay: `${i * 0.12}s` }}>
                <span className="pain-no">{String(i + 1).padStart(2, '0')}</span>
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SHOWCASE ── */}
      <section className="showcase">
        <div className="sec-head reveal">
          <div className="tag">Dashboard Performa</div>
          <h2 className="sec-title">Lihat Progressmu dalam Satu Layar</h2>
          <p className="sec-sub" style={{ margin: '14px auto 0' }}>Analitik mendalam yang mengubah data latihan menjadi keputusan belajar yang tepat.</p>
        </div>
        <div className="showcase-stack reveal" style={{ transitionDelay: '.15s' }}>

          {/* ── Layar 1: Statistik ── */}
          <div>
            <div className="screen">
              <div className="browser-bar">
                <i style={{ width: 9, height: 9, borderRadius: '50%', background: '#ef4444', display: 'block' }} />
                <i style={{ width: 9, height: 9, borderRadius: '50%', background: '#f59e0b', display: 'block' }} />
                <i style={{ width: 9, height: 9, borderRadius: '50%', background: '#22c55e', display: 'block' }} />
                <span className="mock-url" style={{ marginLeft: 8 }}>pintuasn.com/statistics</span>
              </div>
              <div className="scr-body">
                <div className="scr-head"><span className="scr-title">📊 Tren Performa Skor</span><span className="scr-tag">Rata-rata 438</span></div>
                <div className="trend-wrap">
                  <svg className="trend-svg" viewBox="0 0 280 110" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {[28, 55, 82].map((y) => <line key={y} x1="0" y1={y} x2="280" y2={y} stroke="rgba(255,255,255,.06)" strokeWidth="1" />)}
                    <path d="M10,86 L55,70 L100,76 L145,50 L190,58 L235,32 L272,18 L272,110 L10,110 Z" fill="url(#trendGrad)" opacity="0" style={{ animation: 'lp-fadein 1s ease forwards .8s' }} />
                    <path className="trend-line" d="M10,86 L55,70 L100,76 L145,50 L190,58 L235,32 L272,18" />
                    {[[10, 86], [55, 70], [100, 76], [145, 50], [190, 58], [235, 32], [272, 18]].map(([x, y], i) => (
                      <circle key={i} className="trend-dot" cx={x} cy={y} r="3.5" style={{ animationDelay: `${0.4 + i * 0.18}s` }} />
                    ))}
                  </svg>
                </div>
                {[
                  ['TWK', '128 / 150', 85, '#38bdf8'],
                  ['TIU', '152 / 175', 88, '#34d399'],
                  ['TKP', '198 / 225', 74, '#fbbf24'],
                ].map(([k, v, w, c]) => (
                  <div className="catbar" key={k as string}>
                    <div className="catbar-top"><span>{k}</span><b>{v}</b></div>
                    <div className="catbar-track"><div className="catbar-fill" style={{ ['--w' as string]: `${w}%`, width: `${w}%`, background: c as string } as CSSProperties} /></div>
                  </div>
                ))}
              </div>
            </div>
            <p className="scr-cap">Halaman Statistik</p>
          </div>

          {/* ── Layar 2: Hasil Simulasi ── */}
          <div>
            <div className="screen s2">
              <div className="browser-bar">
                <i style={{ width: 9, height: 9, borderRadius: '50%', background: '#ef4444', display: 'block' }} />
                <i style={{ width: 9, height: 9, borderRadius: '50%', background: '#f59e0b', display: 'block' }} />
                <i style={{ width: 9, height: 9, borderRadius: '50%', background: '#22c55e', display: 'block' }} />
                <span className="mock-url" style={{ marginLeft: 8 }}>pintuasn.com/exam/hasil</span>
              </div>
              <div className="scr-body">
                <div className="scr-head"><span className="scr-title">🎯 Ringkasan Jawaban Kamu</span><span className="scr-tag pass">LULUS</span></div>
                <div className="donut-row">
                  <div className="donut">
                    <svg viewBox="0 0 120 120">
                      {[
                        { seg: 206, gap: 58, rot: -90, color: '#34d399', d: '.15s' },
                        { seg: 42, gap: 222, rot: 190.8, color: '#fb7185', d: '.55s' },
                        { seg: 16, gap: 248, rot: 248.4, color: '#64748b', d: '.85s' },
                      ].map((s, i) => (
                        <circle key={i} cx="60" cy="60" r="42"
                          style={{ stroke: s.color, transform: `rotate(${s.rot}deg)`, animationDelay: s.d, ['--seg' as string]: `${s.seg}`, ['--gap' as string]: `${s.gap}` } as CSSProperties} />
                      ))}
                    </svg>
                    <div className="donut-center"><b>78%</b><span>Akurasi</span></div>
                  </div>
                  <div className="donut-legend">
                    <div className="lg"><i style={{ background: '#34d399' }} />Benar <b>86</b></div>
                    <div className="lg"><i style={{ background: '#fb7185' }} />Salah <b>18</b></div>
                    <div className="lg"><i style={{ background: '#64748b' }} />Kosong <b>6</b></div>
                  </div>
                </div>
                <div className="pace-title">⏱ Kecepatan Mengerjakan (detik/soal)</div>
                {[
                  ['TWK', '42 dtk', 64, '#38bdf8'],
                  ['TIU', '55 dtk', 84, '#34d399'],
                  ['TKP', '38 dtk', 58, '#fbbf24'],
                ].map(([k, v, w, c]) => (
                  <div className="catbar" key={k as string}>
                    <div className="catbar-top"><span>{k}</span><b>{v}</b></div>
                    <div className="catbar-track"><div className="catbar-fill" style={{ ['--w' as string]: `${w}%`, width: `${w}%`, background: c as string } as CSSProperties} /></div>
                  </div>
                ))}
              </div>
            </div>
            <p className="scr-cap">Halaman Hasil Simulasi</p>
          </div>

        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="sec" id="fitur" style={{ background: 'var(--s50)' }}>
        <div className="sec-in">
          <div className="sec-head reveal">
            <div className="tag">Fitur Unggulan</div>
            <h2 className="sec-title">Senjata Rahasiamu Menuju NIP 2026</h2>
            <p className="sec-sub">Setiap fitur dirancang dengan presisi untuk memangkas waktu belajarmu dan memaksimalkan peluang lolos SKD CPNS 2026.</p>
          </div>
          <div className="feat-stack">
            {FEATURES.map((f, i) => (
              <div key={f.title} className="feat-panel" style={{ top: `${88 + i * 14}px`, zIndex: i + 1 }}>
                <div className="feat-card2">
                  <span className="fc-num">{String(i + 1).padStart(2, '0')}</span>
                  <div className="fc-text">
                    {f.badge && <span className="fc-badge">{f.badge}</span>}
                    <h3>{f.title}</h3>
                    <p>{f.desc}</p>
                    <ul className="fc-bullets">
                      {f.bullets.map((b) => (
                        <li key={b}><span className="ck">✓</span>{b}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="fc-demo">{renderDemo(i)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="sec" id="cara-kerja" style={{ background: 'var(--s50)' }}>
        <div className="sec-in">
          <div className="sec-head reveal">
            <div className="tag">Cara Kerja</div>
            <h2 className="sec-title">3 Langkah Mulai Persiapan</h2>
          </div>
          <div className="steps">
            {STEPS.map((s, i) => (
              <div key={s.n} className="step reveal" style={{ transitionDelay: `${i * 0.12}s` }}>
                <div className="step-n">{s.n}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="sec" id="paket" style={{ background: '#fff' }}>
        <div className="sec-in">
          <div className="sec-head reveal">
            <div className="tag">Paket Belajar</div>
            <h2 className="sec-title">Pilih Paketmu</h2>
            <p className="sec-sub">Investasi terbaik untuk lolos SKD CPNS 2026. Akses penuh hingga hari ujian selesai.</p>
          </div>
          <div className="price-grid">

            {/* FREE */}
            <div className="pcard free reveal">
              <div className="p-iconrow">
                <div className="p-iconbox" style={{ background: 'var(--s100)' }}>🛡️</div>
                <div><div className="p-name" style={{ color: 'var(--navy)' }}>Gratis</div><div className="p-period" style={{ color: 'var(--s400)' }}>Selamanya</div></div>
              </div>
              <div className="p-amount" style={{ color: 'var(--navy)' }}>Gratis</div>
              <div className="p-desc" style={{ color: 'var(--s400)', borderBottom: '1px solid var(--s100)' }}>Cocok untuk mencoba fitur dasar simulasi SKD</div>
              <ul className="p-feats">
                {[['Tryout paket gratis', 1], ['Akses Roadmap pembelajaran', 1], ['Akses materi dasar', 1],
                  ['Tryout paket premium', 0], ['Latihan Soal SKD / Mini Try Out', 0], ['Review soal + pembahasan lengkap', 0],
                  ['Statistik & analisis performa', 0], ['Peringkat nasional', 0]].map(([t, ok]) => (
                  <li key={t as string}>
                    <span className="chk" style={ok ? { background: '#dcfce7', color: '#16a34a' } : { background: 'var(--s100)', color: 'var(--s400)' }}>{ok ? '✓' : '✗'}</span>
                    <span style={ok ? { color: 'var(--s700)' } : { color: 'var(--s400)', textDecoration: 'line-through' }}>{t}</span>
                  </li>
                ))}
              </ul>
              <a href="/sign-up" className="p-btn" style={{ border: '1.5px solid var(--s300)', color: 'var(--s600)' }}>Pakai Gratis</a>
            </div>

            {/* PREMIUM */}
            <div className="pcard prem reveal" style={{ transitionDelay: '.1s' }}>
              <div className="pop g">⚡ Populer</div>
              <div className="p-iconrow">
                <div className="p-iconbox" style={{ background: 'rgba(14,165,233,.18)' }}>⚡</div>
                <div><div className="p-name" style={{ color: '#fff' }}>Premium</div><div className="p-period" style={{ color: 'rgba(255,255,255,.55)' }}>Hingga November 2026</div></div>
              </div>
              <div className="p-orig" style={{ color: 'rgba(255,255,255,.4)' }}>Rp 200.000</div>
              <div className="p-amount" style={{ color: 'var(--sky-l)' }}>Rp 99.000</div>
              <div className="p-desc" style={{ color: 'rgba(255,255,255,.55)', borderBottom: '1px solid rgba(255,255,255,.12)' }}>Akses penuh untuk persiapan SKD CPNS 2026</div>
              <ul className="p-feats">
                {['Tryout paket gratis & premium', 'Latihan Soal SKD / Mini Try Out (TWK, TIU, TKP)', 'Review soal + pembahasan lengkap',
                  'Materi SKD lengkap (TWK, TIU, TKP)', 'Akses Riwayat (3 terbaru)', 'Statistik & analisis performa',
                  'Peringkat nasional', 'Leaderboard paket'].map(t => (
                  <li key={t}><span className="chk" style={{ background: 'rgba(14,165,233,.25)', color: '#fff' }}>✓</span><span style={{ color: 'rgba(255,255,255,.9)' }}>{t}</span></li>
                ))}
              </ul>
              <a href="/sign-up?plan=premium" className="p-btn" style={{ background: 'var(--gold)', color: '#fff' }}>Mulai Premium →</a>
            </div>

            {/* PLATINUM */}
            <div className="pcard plat reveal" style={{ transitionDelay: '.2s' }}>
              <div className="pop n">👑 Terlengkap</div>
              <div className="p-iconrow">
                <div className="p-iconbox" style={{ background: 'rgba(167,139,250,.2)' }}>👑</div>
                <div><div className="p-name" style={{ color: '#fff' }}>Platinum</div><div className="p-period" style={{ color: 'rgba(255,255,255,.45)' }}>Masa aktif 1 tahun</div></div>
              </div>
              <div className="p-orig" style={{ color: 'rgba(255,255,255,.35)' }}>Rp 349.000</div>
              <div className="p-amount" style={{ color: '#c4b5fd' }}>Rp 119.000</div>
              <div className="p-desc" style={{ color: 'rgba(255,255,255,.45)', borderBottom: '1px solid rgba(255,255,255,.08)' }}>Paket lengkap dengan fitur eksklusif dan prioritas</div>
              <ul className="p-feats">
                {['Semua fitur Premium', 'Akses Riwayat tidak terbatas', 'Tryout paket platinum eksklusif',
                  'Materi platinum + video series SKD', 'Analisis soal dengan waktu terlama', 'Laporan perkembangan belajar',
                  'Masa aktif 1 tahun'].map(t => (
                  <li key={t}><span className="chk" style={{ background: 'rgba(167,139,250,.28)', color: '#fff' }}>✓</span><span style={{ color: 'rgba(255,255,255,.85)' }}>{t}</span></li>
                ))}
              </ul>
              <a href="/sign-up?plan=platinum" className="p-btn" style={{ background: '#7c3aed', color: '#fff', border: '1px solid #7c3aed' }}>Mulai Platinum →</a>
            </div>

          </div>
          <div className="pay-note reveal" style={{ transitionDelay: '.3s' }}>🔒 Pembayaran aman via Midtrans · QRIS · GoPay · Transfer Bank · Alfamart/Indomaret</div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="sec" id="faq" style={{ background: 'var(--s50)' }}>
        <div className="sec-in">
          <div className="sec-head reveal">
            <div className="tag">FAQ</div>
            <h2 className="sec-title">Pertanyaan yang Sering Diajukan</h2>
          </div>
          <div className="faq-in">
            {FAQS.map((item, i) => (
              <div key={i} className="faq-item reveal" style={{ transitionDelay: `${i * 0.05}s` }}>
                <button className="faq-btn" onClick={(e) => toggleFaq(e.currentTarget)}>
                  <span className="faq-q">{item.q}</span>
                  <span className="faq-chev">▼</span>
                </button>
                <div className="faq-body" style={{ maxHeight: 0 }}><p>{item.a}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="final">
        <div className="hero-blob lp-drift1" style={{ width: 300, height: 300, background: 'rgba(255,255,255,.08)', top: -50, left: '20%' }} />
        <div className="final-in reveal">
          <div className="final-pill">⏰ Pendaftaran CPNS 2026 semakin dekat</div>
          <h2>Pesaingmu Sudah Mulai.<br />Kamu Kapan?</h2>
          <p>Jangan biarkan kursi ASN impianmu diambil orang lain hanya karena kurang persiapan.</p>
          <a href="/sign-up" className="cta-big cta-y" style={{ fontSize: 17, padding: '16px 38px' }}>Mulai Perjalanan ASN-mu Sekarang</a>
          <p className="sub">Gratis selamanya · Tanpa kartu kredit</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="lp-footer">
        <div className="foot-grid">
          <div>
            <a href="#hero" className="lp-logo" aria-label="PintuASN">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/logo-navbar-sky.svg" alt="PintuASN" className="lp-logo-img" />
            </a>
            <p style={{ fontSize: 14, color: 'var(--s500)', lineHeight: 1.6, marginTop: 10, maxWidth: 280 }}>Platform simulasi CAT SKD CPNS paling akurat di Indonesia. Partner terpercaya menuju NIP impianmu 2026.</p>
            <div className="social"><div>📸</div><div>🎵</div><div>▶️</div></div>
          </div>
          <div className="foot-col">
            <h4>Platform</h4>
            <a href="/#fitur">Fitur Unggulan</a>
            <a href="/#paket">Harga dan Paket</a>
            <a href="/sign-up">Simulasi Gratis</a>
            <a href="/blog">Blog</a>
            <a href="/faq">FAQ</a>
          </div>
          <div className="foot-col">
            <h4>Bantuan</h4>
            <a href="/cara-pembayaran">Cara Pembayaran</a>
            <a href="/syarat-ketentuan">Syarat dan Ketentuan</a>
            <a href="/kebijakan-privasi">Kebijakan Privasi</a>
            <a href="mailto:support@pintuasn.com">Hubungi Admin</a>
          </div>
        </div>
        <div className="foot-bottom">
          <p>© 2026 PintuASN. All rights reserved.</p>
          <p>support@pintuasn.com</p>
        </div>
      </footer>
    </div>
  );
}
