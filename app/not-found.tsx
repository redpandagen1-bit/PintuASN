import Link from 'next/link';

// Halaman 404 — server component, animasi CSS murni (tanpa JS), ringan.
// Tema PintuASN: navy #1B2B5E + emas #F5A623, font Plus Jakarta Sans.
// Konsep: angka 0 di tengah "404" jadi lubang kunci (pintu), dengan kunci melayang.

const css = `
@keyframes pa-float   { 0%,100% { transform: translateY(0); }      50% { transform: translateY(-14px); } }
@keyframes pa-glow    { 0%,100% { opacity: .35; transform: scale(1); } 50% { opacity: .65; transform: scale(1.1); } }
@keyframes pa-drift1  { 0%,100% { transform: translate(0,0); }     50% { transform: translate(24px,-20px); } }
@keyframes pa-drift2  { 0%,100% { transform: translate(0,0); }     50% { transform: translate(-20px,18px); } }
@keyframes pa-swing   { 0%,100% { transform: rotate(-10deg); }     50% { transform: rotate(10deg); } }
@keyframes pa-fadeup  { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
@keyframes pa-spin    { to { transform: rotate(360deg); } }

.pa-float  { animation: pa-float 3.4s ease-in-out infinite; }
.pa-glow   { animation: pa-glow 2.8s ease-in-out infinite; }
.pa-drift1 { animation: pa-drift1 9s ease-in-out infinite; }
.pa-drift2 { animation: pa-drift2 11s ease-in-out infinite; }
.pa-swing  { animation: pa-swing 2.6s ease-in-out infinite; transform-origin: 50% 14%; }
.pa-spin   { animation: pa-spin 22s linear infinite; transform-origin: center; }
.pa-fadeup   { opacity: 0; animation: pa-fadeup .6s ease-out forwards; }
.pa-delay-1  { animation-delay: .12s; }
.pa-delay-2  { animation-delay: .24s; }
.pa-delay-3  { animation-delay: .36s; }

@media (prefers-reduced-motion: reduce) {
  .pa-float,.pa-glow,.pa-drift1,.pa-drift2,.pa-swing,.pa-spin,.pa-fadeup {
    animation: none !important; opacity: 1 !important; transform: none !important;
  }
}
`;

export default function NotFound() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-slate-50 to-white flex flex-col items-center justify-center px-6 py-16">
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {/* ── Blob dekoratif ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="pa-drift1 absolute -top-16 -left-10 w-72 h-72 rounded-full bg-[#1B2B5E]/10 blur-3xl" />
        <div className="pa-drift2 absolute top-1/3 -right-12 w-80 h-80 rounded-full bg-[#F5A623]/15 blur-3xl" />
        <div className="pa-drift1 absolute -bottom-20 left-1/4 w-72 h-72 rounded-full bg-[#1B2B5E]/[0.07] blur-3xl" />
        {/* grid halus */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(#1B2B5E 1px, transparent 1px), linear-gradient(90deg, #1B2B5E 1px, transparent 1px)',
            backgroundSize: '44px 44px',
          }}
        />
      </div>

      {/* ── 404 dengan lubang kunci ── */}
      <div className="relative z-10 pa-float">
        <div className="flex items-center justify-center gap-1 sm:gap-3" style={{ fontFamily: 'var(--font-jakarta)' }}>
          <span className="text-[100px] sm:text-[150px] font-extrabold leading-none text-[#1B2B5E] select-none">4</span>

          {/* Angka 0 = lubang kunci / pintu */}
          <span className="relative inline-flex items-center justify-center mx-1">
            {/* glow di belakang */}
            <span className="pa-glow absolute inset-0 m-auto w-[88px] h-[88px] sm:w-[130px] sm:h-[130px] rounded-full bg-[#F5A623]/40 blur-2xl" />
            <svg
              viewBox="0 0 120 160"
              className="relative w-[78px] h-[104px] sm:w-[116px] sm:h-[155px]"
              role="img"
              aria-label="lubang kunci"
            >
              {/* cincin luar berputar pelan */}
              <circle cx="60" cy="72" r="54" fill="none" stroke="#F5A623" strokeWidth="3" strokeDasharray="6 10" className="pa-spin" />
              {/* badan disk navy */}
              <circle cx="60" cy="72" r="46" fill="#1B2B5E" />
              <circle cx="60" cy="72" r="46" fill="none" stroke="#F5A623" strokeWidth="4" />
              {/* lubang kunci emas */}
              <circle cx="60" cy="60" r="13" fill="#F5A623" />
              <path d="M60 60 L51 96 H69 Z" fill="#F5A623" />
            </svg>

            {/* kunci melayang */}
            <svg
              viewBox="0 0 60 60"
              className="pa-swing absolute -top-3 -right-4 sm:-top-4 sm:-right-6 w-9 h-9 sm:w-12 sm:h-12 drop-shadow"
              aria-hidden="true"
            >
              <circle cx="20" cy="20" r="12" fill="none" stroke="#1B2B5E" strokeWidth="5" />
              <circle cx="20" cy="20" r="3.5" fill="#F5A623" />
              <line x1="28" y1="28" x2="50" y2="50" stroke="#1B2B5E" strokeWidth="5" strokeLinecap="round" />
              <line x1="44" y1="44" x2="52" y2="36" stroke="#1B2B5E" strokeWidth="5" strokeLinecap="round" />
              <line x1="38" y1="38" x2="45" y2="31" stroke="#1B2B5E" strokeWidth="5" strokeLinecap="round" />
            </svg>
          </span>

          <span className="text-[100px] sm:text-[150px] font-extrabold leading-none text-[#1B2B5E] select-none">4</span>
        </div>
      </div>

      {/* ── Teks ── */}
      <div className="relative z-10 text-center mt-4 max-w-md">
        <h1
          className="pa-fadeup pa-delay-1 text-2xl sm:text-3xl font-extrabold mb-2"
          style={{ fontFamily: 'var(--font-jakarta)' }}
        >
          <span className="text-[#1B2B5E]">Sepertinya kamu membuka </span>
          <span className="text-[#F5A623]">pintu yang salah</span>
        </h1>
        <p className="pa-fadeup pa-delay-2 text-sm text-slate-500 leading-relaxed">
          Halaman yang kamu cari tidak ditemukan. Mungkin sudah pindah, terhapus,
          atau tautannya keliru. Yuk kembali ke jalur yang benar.
        </p>

        {/* ── Tombol ── */}
        <div className="pa-fadeup pa-delay-3 mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#1B2B5E] text-white text-sm font-bold shadow-sm hover:bg-[#1B2B5E]/90 transition-all active:scale-[0.98]"
          >
            Ke Dashboard
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-bold hover:border-slate-300 hover:bg-slate-50 transition-all active:scale-[0.98]"
          >
            Halaman Utama
          </Link>
        </div>
      </div>

      {/* ── Brand footer ── */}
      <p className="relative z-10 mt-12 text-xs font-bold tracking-wide select-none">
        <span className="text-[#1B2B5E]">Pintu</span><span className="text-[#F5A623]">ASN</span>
      </p>
    </main>
  );
}
