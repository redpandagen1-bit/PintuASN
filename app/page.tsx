"use client";

import { useEffect, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface FeatureCardProps {
  icon: string;
  title: string;
  desc: string;
  delay?: number;
}

interface PainCardProps {
  emoji: string;
  title: string;
  desc: string;
  delay?: number;
}

interface FaqItem {
  q: string;
  a: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const FEATURES: FeatureCardProps[] = [
  {
    icon: "💻",
    title: "Simulasi 99% Mirip BKN",
    desc: "Interface UI/UX, sistem timer per subtes, dan mekanisme penilaian persis dengan sistem resmi SSCASN BKN. Atasi grogi, kenali medan.",
  },
  {
    icon: "📊",
    title: "Analitik Performa Mendalam",
    desc: "Ketahui tren skormu, gap passing grade, dan analisis kelemahan detail per subtes TWK, TIU, dan TKP berdasarkan data.",
    delay: 100,
  },
  {
    icon: "🏆",
    title: "Peringkat Nasional (Ranking)",
    desc: "Ukur kemampuanmu secara real-time. Ketahui posisimu bersaing dengan peserta simulasi PintuASN lainnya di seluruh Indonesia.",
    delay: 200,
  },
  {
    icon: "📖",
    title: "Pembahasan Soal Detail",
    desc: "Bukan cuma kunci jawaban. Review jawaban benar/salahmu dengan pembahasan terstruktur dan filter materi yang komprehensif.",
    delay: 300,
  },
  {
    icon: "🗺️",
    title: "Roadmap Belajar Terstruktur",
    desc: "Bingung mulai dari mana? Ikuti panduan belajar step-by-step harian untuk memastikan materi tuntas sebelum hari H.",
    delay: 400,
  },
  {
    icon: "📚",
    title: "Materi TWK, TIU, TKP Lengkap",
    desc: "All-in-one platform. Rangkuman materi terupdate sesuai kisi-kisi KemenpanRB terbaru, siap dibaca kapan saja.",
    delay: 500,
  },
];

const PAIN_POINTS: PainCardProps[] = [
  {
    emoji: "🤯",
    title: "Buta Format CAT BKN",
    desc: "Panik melihat interface ujian asli? Banyak peserta gagal fokus karena kaget dengan sistem CAT BKN dan manajemen waktu yang buruk.",
  },
  {
    emoji: "📉",
    title: "Belajar Tanpa Arah",
    desc: "Mengerjakan ribuan soal secara acak tanpa tahu sebenarnya kelemahan terbesarmu ada di TWK, penalaran TIU, atau karakteristik TKP.",
    delay: 150,
  },
  {
    emoji: "🥶",
    title: "Mental Breakdown",
    desc: "Grogi, panik, dan nge-blank saat hari H karena tidak pernah melatih mental mengerjakan soal di bawah tekanan timer berjalan.",
    delay: 300,
  },
];

const FAQ_ITEMS: FaqItem[] = [
  {
    q: "Apakah sistem simulasi benar-benar mirip BKN?",
    a: "Ya! Kami merancang UI/UX, peletakan tombol, ukuran font, hingga sistem timer persis seperti aplikasi CAT milik Badan Kepegawaian Negara (BKN). Tujuannya agar saat ujian asli, kamu sudah tidak canggung dan bisa fokus pada soal, bukan sistem.",
  },
  {
    q: "Apakah soal-soalnya update sesuai kisi-kisi terbaru?",
    a: "Tentu. Tim akademik kami terus memperbarui bank soal setiap bulan mengikuti Peraturan Menteri PANRB terbaru dan tren soal CPNS tahun-tahun sebelumnya, termasuk soal berstandar HOTS.",
  },
  {
    q: "Bagaimana cara pembayaran untuk paket Premium?",
    a: "Kami menerima berbagai metode pembayaran otomatis: QRIS, GoPay, OVO, ShopeePay, Transfer Bank (VA BCA, BNI, Mandiri, BRI), hingga Alfamart/Indomaret. Semua diproses melalui Midtrans yang aman dan terenkripsi.",
  },
  {
    q: "Apakah bisa diakses melalui HP (Smartphone)?",
    a: "Sangat bisa! Website PintuASN 100% responsif di Smartphone, Tablet, maupun Laptop. Namun untuk pengalaman simulasi CAT paling ideal, kami menyarankan menggunakan Laptop/PC.",
  },
  {
    q: "Saya mendaftar gratis, apa saya wajib upgrade?",
    a: "Tidak wajib sama sekali. Paket Gratis disediakan agar kamu bisa mencoba sistem dan kualitas soal kami tanpa komitmen apa pun. Jika merasa platform ini membantu, kamu bisa upgrade kapan saja.",
  },
];

// ─── Hooks ────────────────────────────────────────────────────────────────────
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -50px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.75s cubic-bezier(0.4,0,0.2,1) ${delay}ms, transform 0.75s cubic-bezier(0.4,0,0.2,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

function FeatureCard({ icon, title, desc, delay = 0 }: FeatureCardProps) {
  return (
    <Reveal delay={delay}>
      <div
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 16,
          padding: "32px",
          transition: "background 0.3s, border-color 0.3s",
          cursor: "default",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.background =
            "rgba(255,255,255,0.06)";
          (e.currentTarget as HTMLDivElement).style.borderColor =
            "rgba(245,197,24,0.35)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.background =
            "rgba(255,255,255,0.03)";
          (e.currentTarget as HTMLDivElement).style.borderColor =
            "rgba(255,255,255,0.06)";
        }}
      >
        <div style={{ fontSize: 32, marginBottom: 16 }}>{icon}</div>
        <h3
          style={{
            fontFamily: "var(--font-heading)",
            color: "#fff",
            fontSize: 17,
            marginBottom: 10,
          }}
        >
          {title}
        </h3>
        <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7 }}>
          {desc}
        </p>
      </div>
    </Reveal>
  );
}

function PainCard({ emoji, title, desc, delay = 0 }: PainCardProps) {
  return (
    <Reveal delay={delay}>
      <div
        style={{
          background: "#fff",
          border: "1px solid #f1f5f9",
          borderRadius: 16,
          padding: "36px 28px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.04)",
          transition: "transform 0.3s",
        }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLDivElement).style.transform =
            "translateY(-5px)")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLDivElement).style.transform = "translateY(0)")
        }
      >
        <div
          style={{
            width: 60,
            height: 60,
            background: "rgba(239,68,68,0.08)",
            borderRadius: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 26,
            marginBottom: 20,
          }}
        >
          {emoji}
        </div>
        <h3
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: 18,
            marginBottom: 10,
            color: "#0f172a",
          }}
        >
          {title}
        </h3>
        <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.75 }}>{desc}</p>
      </div>
    </Reveal>
  );
}

function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div style={{ maxWidth: 780, margin: "0 auto" }}>
      {items.map((item, i) => (
        <div
          key={i}
          style={{ borderBottom: "1px solid #f1f5f9" }}
        >
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "22px 0",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: "var(--font-heading)",
              fontSize: 17,
              color: openIndex === i ? "#f5c518" : "#0f172a",
              textAlign: "left",
              gap: 16,
              transition: "color 0.3s",
            }}
          >
            <span>{item.q}</span>
            <span
              style={{
                display: "inline-block",
                transition: "transform 0.3s",
                transform: openIndex === i ? "rotate(180deg)" : "rotate(0deg)",
                color: openIndex === i ? "#f5c518" : "#64748b",
                flexShrink: 0,
                fontSize: 14,
              }}
            >
              ▼
            </span>
          </button>
          <div
            style={{
              maxHeight: openIndex === i ? 300 : 0,
              overflow: "hidden",
              transition: "max-height 0.4s ease",
            }}
          >
            <p
              style={{
                paddingBottom: 22,
                color: "#64748b",
                fontSize: 15,
                lineHeight: 1.75,
              }}
            >
              {item.a}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* ── Google Fonts ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Instrument+Serif:ital@0;1&display=swap');

        :root {
          --font-heading: 'Plus Jakarta Sans', sans-serif;
          --font-body: 'Plus Jakarta Sans', sans-serif;
          --navy: #0f172a;
          --navy-2: #1e293b;
          --gold: #f5c518;
          --gold-dark: #d4a810;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
          font-family: var(--font-body);
          background: #fff;
          color: #334155;
          overflow-x: hidden;
        }

        html { scroll-behavior: smooth; }

        .pricing-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
          max-width: 1040px;
          margin: 0 auto;
        }

        @media (min-width: 900px) {
          .pricing-grid {
            grid-template-columns: repeat(3, 1fr);
            align-items: start;
          }
        }

        .features-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }

        @media (min-width: 640px) {
          .features-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (min-width: 1024px) {
          .features-grid { grid-template-columns: repeat(3, 1fr); }
        }

        .pain-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }

        @media (min-width: 768px) {
          .pain-grid { grid-template-columns: repeat(3, 1fr); }
        }

        .steps-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 40px;
        }

        @media (min-width: 768px) {
          .steps-grid { grid-template-columns: repeat(3, 1fr); }
        }

        .nav-links-desktop { display: none; }
        @media (min-width: 768px) {
          .nav-links-desktop { display: flex; gap: 28px; }
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          zIndex: 100,
          background: "rgba(15,23,42,0.96)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          boxShadow: scrolled ? "0 4px 24px rgba(0,0,0,0.2)" : "none",
          transition: "box-shadow 0.3s",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 24px",
            height: 68,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Logo */}
          <a
            href="#"
            style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 800,
              fontSize: 22,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              gap: 8,
              textDecoration: "none",
            }}
          >
            <span
              style={{
                background: "var(--gold)",
                color: "var(--navy)",
                width: 32,
                height: 32,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
              }}
            >
              🎓
            </span>
            PintuASN
          </a>

          {/* Nav Links */}
          <nav className="nav-links-desktop">
            {["Fitur", "Cara Kerja", "Paket Belajar", "FAQ"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(" ", "-")}`}
                style={{
                  color: "rgba(255,255,255,0.75)",
                  fontSize: 14,
                  fontWeight: 500,
                  textDecoration: "none",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) =>
                  ((e.target as HTMLAnchorElement).style.color = "#f5c518")
                }
                onMouseLeave={(e) =>
                  ((e.target as HTMLAnchorElement).style.color =
                    "rgba(255,255,255,0.75)")
                }
              >
                {item}
              </a>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <a
              href="/sign-in"
              style={{
                padding: "8px 18px",
                fontSize: 14,
                fontWeight: 600,
                color: "rgba(255,255,255,0.85)",
                border: "1px solid rgba(255,255,255,0.18)",
                borderRadius: 8,
                textDecoration: "none",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background =
                  "rgba(255,255,255,0.07)";
                (e.currentTarget as HTMLAnchorElement).style.borderColor =
                  "rgba(255,255,255,0.4)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background =
                  "transparent";
                (e.currentTarget as HTMLAnchorElement).style.borderColor =
                  "rgba(255,255,255,0.18)";
              }}
            >
              Sign In
            </a>
            <a
              href="/sign-up"
              style={{
                padding: "8px 18px",
                fontSize: 14,
                fontWeight: 700,
                color: "var(--navy)",
                background: "var(--gold)",
                border: "none",
                borderRadius: 8,
                textDecoration: "none",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background =
                  "var(--gold-dark)";
                (e.currentTarget as HTMLAnchorElement).style.transform =
                  "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background =
                  "var(--gold)";
                (e.currentTarget as HTMLAnchorElement).style.transform =
                  "translateY(0)";
              }}
            >
              Sign Up
            </a>
          </div>
        </div>
      </header>

      <main>
        {/* ── HERO ── */}
        <section
          style={{
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)",
            padding: "160px 24px 100px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative glow */}
          <div
            style={{
              position: "absolute",
              top: "10%",
              right: "5%",
              width: 600,
              height: 600,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(245,197,24,0.06) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "0%",
              left: "-5%",
              width: 400,
              height: 400,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              maxWidth: 800,
              margin: "0 auto",
              textAlign: "center",
              position: "relative",
              zIndex: 1,
            }}
          >
            <Reveal>
              <h1
                style={{
                  fontFamily: "var(--font-heading)",
                  fontWeight: 800,
                  fontSize: "clamp(32px, 5vw, 54px)",
                  color: "#fff",
                  lineHeight: 1.18,
                  marginBottom: 24,
                  letterSpacing: "-0.5px",
                }}
              >
                Lulus CPNS 2026 Bukan Sekadar Keberuntungan.{" "}
                <span style={{ color: "var(--gold)" }}>
                  Persiapkan Dirimu dengan Data.
                </span>
              </h1>
              <p
                style={{
                  color: "rgba(255,255,255,0.65)",
                  fontSize: "clamp(16px, 2vw, 19px)",
                  lineHeight: 1.75,
                  marginBottom: 44,
                  maxWidth: 620,
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              >
                Berhenti belajar buta arah. Rasakan pengalaman ujian
                sesungguhnya dengan PintuASN simulasi CAT{" "}
                <strong style={{ color: "#fff" }}>99% mirip sistem BKN</strong>{" "}
                dengan analitik performa mendalam.
              </p>

              <div
                style={{
                  display: "flex",
                  gap: 14,
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <a
                  href="#paket-belajar"
                  style={{
                    padding: "15px 34px",
                    background: "var(--gold)",
                    color: "var(--navy)",
                    fontWeight: 700,
                    fontSize: 16,
                    borderRadius: 10,
                    textDecoration: "none",
                    boxShadow: "0 6px 24px rgba(245,197,24,0.3)",
                    transition: "all 0.2s",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.transform =
                      "translateY(-2px)";
                    (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                      "0 10px 32px rgba(245,197,24,0.4)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.transform =
                      "translateY(0)";
                    (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                      "0 6px 24px rgba(245,197,24,0.3)";
                  }}
                >
                  🚀 Coba Gratis Sekarang
                </a>
                <a
                  href="#fitur"
                  style={{
                    padding: "15px 34px",
                    background: "transparent",
                    color: "rgba(255,255,255,0.85)",
                    fontWeight: 600,
                    fontSize: 16,
                    borderRadius: 10,
                    border: "1.5px solid rgba(255,255,255,0.2)",
                    textDecoration: "none",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.borderColor =
                      "rgba(255,255,255,0.5)";
                    (e.currentTarget as HTMLAnchorElement).style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.borderColor =
                      "rgba(255,255,255,0.2)";
                    (e.currentTarget as HTMLAnchorElement).style.color =
                      "rgba(255,255,255,0.85)";
                  }}
                >
                  Lihat Fitur Lengkap
                </a>
              </div>

              {/* Social proof */}
              <div
                style={{
                  marginTop: 44,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <div style={{ color: "var(--gold)", letterSpacing: 3, fontSize: 13 }}>
                  ★★★★★
                </div>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>
                  Bergabung bersama ribuan pejuang NIP tahun ini.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── PAIN POINTS ── */}
        <section style={{ background: "#f8fafc", padding: "96px 24px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <Reveal>
              <div style={{ textAlign: "center", marginBottom: 60 }}>
                <h2
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "clamp(26px, 4vw, 38px)",
                    fontWeight: 800,
                    color: "#0f172a",
                    marginBottom: 14,
                  }}
                >
                  Mengapa Banyak yang Gagal di SKD CPNS?
                </h2>
                <p style={{ color: "#64748b", fontSize: 17, maxWidth: 560, margin: "0 auto" }}>
                  Bukan karena kurang pintar, tapi karena strategi persiapan
                  yang salah sasaran.
                </p>
              </div>
            </Reveal>

            <div className="pain-grid">
              {PAIN_POINTS.map((p) => (
                <PainCard key={p.title} {...p} />
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section
          id="fitur"
          style={{ background: "var(--navy)", padding: "96px 24px" }}
        >
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <Reveal>
              <div style={{ textAlign: "center", marginBottom: 60 }}>
                <h2
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "clamp(26px, 4vw, 38px)",
                    fontWeight: 800,
                    color: "var(--gold)",
                    marginBottom: 14,
                  }}
                >
                  Senjata Rahasiamu Menuju NIP 2026
                </h2>
                <p
                  style={{
                    color: "rgba(255,255,255,0.55)",
                    fontSize: 17,
                    maxWidth: 560,
                    margin: "0 auto",
                  }}
                >
                  Sistem kami dirancang khusus untuk mereplikasi ujian BKN dan
                  menutup celah kelemahanmu.
                </p>
              </div>
            </Reveal>

            <div className="features-grid">
              {FEATURES.map((f) => (
                <FeatureCard key={f.title} {...f} />
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section
          id="cara-kerja"
          style={{ background: "#fff", padding: "96px 24px" }}
        >
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <Reveal>
              <div style={{ textAlign: "center", marginBottom: 64 }}>
                <h2
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "clamp(26px, 4vw, 38px)",
                    fontWeight: 800,
                    color: "#0f172a",
                    marginBottom: 14,
                  }}
                >
                  3 Langkah Mudah Memulai Persiapan
                </h2>
                <p style={{ color: "#64748b", fontSize: 17 }}>
                  Tidak perlu ribet, sistem kami didesain agar kamu bisa
                  langsung fokus belajar.
                </p>
              </div>
            </Reveal>

            <div className="steps-grid">
              {[
                {
                  n: "1",
                  title: "Daftar Akun Gratis",
                  desc: "Buat akun dalam 30 detik tanpa kartu kredit. Langsung akses dashboard.",
                },
                {
                  n: "2",
                  title: "Pilih & Kerjakan Tryout",
                  desc: "Rasakan ketegangan ujian dengan timer berjalan dan soal setara HOTS BKN.",
                  delay: 200,
                },
                {
                  n: "3",
                  title: "Analisis Hasilmu",
                  desc: "Dapatkan skor TWK, TIU, TKP, status passing grade, dan review mendalam.",
                  delay: 400,
                },
              ].map((step) => (
                <Reveal key={step.n} delay={step.delay ?? 0}>
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: "50%",
                        border: "3px solid #f1f5f9",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 24px",
                        fontFamily: "var(--font-heading)",
                        fontWeight: 800,
                        fontSize: 30,
                        color: "var(--gold)",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
                      }}
                    >
                      {step.n}
                    </div>
                    <h3
                      style={{
                        fontFamily: "var(--font-heading)",
                        fontSize: 19,
                        fontWeight: 700,
                        color: "#0f172a",
                        marginBottom: 10,
                      }}
                    >
                      {step.title}
                    </h3>
                    <p style={{ color: "#64748b", fontSize: 15, lineHeight: 1.7 }}>
                      {step.desc}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRICING ── */}
        <section
          id="paket-belajar"
          style={{ background: "#f8fafc", padding: "96px 24px" }}
        >
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <Reveal>
              <div style={{ textAlign: "center", marginBottom: 60 }}>
                <h2
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "clamp(26px, 4vw, 38px)",
                    fontWeight: 800,
                    color: "#0f172a",
                    marginBottom: 14,
                  }}
                >
                  Pilih Paket Belajar Kamu
                </h2>
                <p style={{ color: "#64748b", fontSize: 17 }}>
                  Investasi terbaik untuk lolos SKD CPNS 2026. Akses penuh
                  hingga ujian selesai.
                </p>
              </div>
            </Reveal>

            <div className="pricing-grid">
              {/* ── GRATIS ── */}
              <Reveal>
                <div
                  style={{
                    background: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: 20,
                    padding: "36px 28px",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}
                  >
                    <div
                      style={{
                        width: 46,
                        height: 46,
                        background: "#f1f5f9",
                        borderRadius: 12,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 22,
                      }}
                    >
                      🛡️
                    </div>
                    <div>
                      <h3
                        style={{
                          fontFamily: "var(--font-heading)",
                          fontWeight: 800,
                          fontSize: 20,
                          color: "#0f172a",
                        }}
                      >
                        Gratis
                      </h3>
                      <div style={{ fontSize: 13, color: "#94a3b8" }}>Selamanya</div>
                    </div>
                  </div>

                  <div
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontWeight: 800,
                      fontSize: 38,
                      color: "#0f172a",
                      marginBottom: 6,
                    }}
                  >
                    Gratis
                  </div>
                  <p
                    style={{
                      fontSize: 14,
                      color: "#94a3b8",
                      marginBottom: 24,
                      paddingBottom: 24,
                      borderBottom: "1px solid #f1f5f9",
                    }}
                  >
                    Cocok untuk mencoba fitur dasar simulasi SKD
                  </p>

                  <ul style={{ listStyle: "none", marginBottom: 28, flex: 1 }}>
                    {[
                      { text: "10 soal latihan per hari", active: true },
                      { text: "Akses materi dasar", active: true },
                      { text: "Statistik terbatas", active: false },
                      { text: "Simulasi ujian penuh", active: false },
                      { text: "Pembahasan lengkap", active: false },
                    ].map((item) => (
                      <li
                        key={item.text}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          marginBottom: 12,
                          fontSize: 14,
                          color: item.active ? "#334155" : "#94a3b8",
                          textDecoration: item.active ? "none" : "line-through",
                        }}
                      >
                        <span
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                            background: item.active ? "#dcfce7" : "#f1f5f9",
                            color: item.active ? "#16a34a" : "#94a3b8",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 11,
                            flexShrink: 0,
                          }}
                        >
                          {item.active ? "✓" : "✗"}
                        </span>
                        {item.text}
                      </li>
                    ))}
                  </ul>

                  <a
                    href="/register"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      padding: "13px 20px",
                      border: "1.5px solid #cbd5e1",
                      borderRadius: 10,
                      color: "#475569",
                      fontWeight: 600,
                      fontSize: 15,
                      textDecoration: "none",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.borderColor = "#334155";
                      (e.currentTarget as HTMLAnchorElement).style.background = "#f8fafc";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.borderColor = "#cbd5e1";
                      (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                    }}
                  >
                    Pakai Gratis →
                  </a>
                </div>
              </Reveal>

              {/* ── PREMIUM ── */}
              <Reveal delay={100}>
                <div
                  style={{
                    background: "#1d4ed8",
                    borderRadius: 20,
                    padding: "36px 28px",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: "0 24px 64px rgba(29,78,216,0.35)",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: -13,
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "#fff",
                      color: "#1d4ed8",
                      padding: "4px 16px",
                      borderRadius: 50,
                      fontSize: 12,
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                  >
                    ⚡ Populer
                  </div>

                  <div
                    style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}
                  >
                    <div
                      style={{
                        width: 46,
                        height: 46,
                        background: "rgba(255,255,255,0.15)",
                        borderRadius: 12,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 22,
                      }}
                    >
                      ⚡
                    </div>
                    <div>
                      <h3
                        style={{
                          fontFamily: "var(--font-heading)",
                          fontWeight: 800,
                          fontSize: 20,
                          color: "#fff",
                        }}
                      >
                        Premium
                      </h3>
                      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
                        Hingga November 2026
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontWeight: 800,
                      fontSize: 38,
                      color: "#fff",
                      marginBottom: 6,
                    }}
                  >
                    Rp 149.000
                  </div>
                  <p
                    style={{
                      fontSize: 13,
                      color: "rgba(255,255,255,0.6)",
                      marginBottom: 24,
                      paddingBottom: 24,
                      borderBottom: "1px solid rgba(255,255,255,0.12)",
                    }}
                  >
                    Akses penuh untuk persiapan SKD CPNS 2026
                  </p>

                  <ul style={{ listStyle: "none", marginBottom: 28, flex: 1 }}>
                    {[
                      "Soal latihan tidak terbatas",
                      "Akses semua materi lengkap",
                      "Statistik & analisis performa",
                      "Simulasi ujian penuh SKD",
                      "Pembahasan setiap soal",
                      "Leaderboard & ranking",
                    ].map((item) => (
                      <li
                        key={item}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          marginBottom: 12,
                          fontSize: 14,
                          color: "rgba(255,255,255,0.9)",
                        }}
                      >
                        <span
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                            background: "rgba(255,255,255,0.2)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 11,
                            flexShrink: 0,
                          }}
                        >
                          ✓
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>

                  <a
                    href="/register?plan=premium"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      padding: "13px 20px",
                      background: "#fff",
                      color: "#1d4ed8",
                      borderRadius: 10,
                      fontWeight: 700,
                      fontSize: 15,
                      textDecoration: "none",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.background =
                        "rgba(255,255,255,0.9)";
                      (e.currentTarget as HTMLAnchorElement).style.transform =
                        "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.background = "#fff";
                      (e.currentTarget as HTMLAnchorElement).style.transform =
                        "translateY(0)";
                    }}
                  >
                    Mulai Premium →
                  </a>
                </div>
              </Reveal>

              {/* ── PLATINUM ── */}
              <Reveal delay={200}>
                <div
                  style={{
                    background: "#0f172a",
                    borderRadius: 20,
                    padding: "36px 28px",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: "0 24px 64px rgba(15,23,42,0.25)",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: -13,
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "var(--gold)",
                      color: "#0f172a",
                      padding: "4px 16px",
                      borderRadius: 50,
                      fontSize: 12,
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                    }}
                  >
                    👑 Terlengkap
                  </div>

                  <div
                    style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}
                  >
                    <div
                      style={{
                        width: 46,
                        height: 46,
                        background: "var(--gold)",
                        borderRadius: 12,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 22,
                      }}
                    >
                      👑
                    </div>
                    <div>
                      <h3
                        style={{
                          fontFamily: "var(--font-heading)",
                          fontWeight: 800,
                          fontSize: 20,
                          color: "#fff",
                        }}
                      >
                        Platinum
                      </h3>
                      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
                        Hingga November 2026
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontWeight: 800,
                      fontSize: 38,
                      color: "#fff",
                      marginBottom: 6,
                    }}
                  >
                    Rp 249.000
                  </div>
                  <p
                    style={{
                      fontSize: 13,
                      color: "rgba(255,255,255,0.5)",
                      marginBottom: 24,
                      paddingBottom: 24,
                      borderBottom: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    Paket lengkap dengan fitur eksklusif &amp; prioritas
                  </p>

                  <ul style={{ listStyle: "none", marginBottom: 28, flex: 1 }}>
                    {[
                      "Semua fitur Premium",
                      "Live class & webinar eksklusif",
                      "Konsultasi dengan mentor",
                      "Grup belajar khusus Platinum",
                      "Roadmap belajar personal",
                      "Garansi uang kembali 7 hari",
                    ].map((item) => (
                      <li
                        key={item}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          marginBottom: 12,
                          fontSize: 14,
                          color: "rgba(255,255,255,0.85)",
                        }}
                      >
                        <span
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                            background: "var(--gold)",
                            color: "#0f172a",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 11,
                            flexShrink: 0,
                            fontWeight: 700,
                          }}
                        >
                          ✓
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>

                  <a
                    href="/register?plan=platinum"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      padding: "13px 20px",
                      background: "var(--gold)",
                      color: "#0f172a",
                      borderRadius: 10,
                      fontWeight: 700,
                      fontSize: 15,
                      textDecoration: "none",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.background =
                        "var(--gold-dark)";
                      (e.currentTarget as HTMLAnchorElement).style.transform =
                        "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.background =
                        "var(--gold)";
                      (e.currentTarget as HTMLAnchorElement).style.transform =
                        "translateY(0)";
                    }}
                  >
                    Mulai Platinum →
                  </a>
                </div>
              </Reveal>
            </div>

            <Reveal>
              <p
                style={{
                  textAlign: "center",
                  marginTop: 32,
                  color: "#94a3b8",
                  fontSize: 13,
                }}
              >
                🔒 Pembayaran aman &amp; terenkripsi. Didukung oleh Midtrans.
                Butuh bantuan?{" "}
                <strong style={{ color: "#475569" }}>support@pintuasn.com</strong>
              </p>
            </Reveal>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" style={{ background: "#fff", padding: "96px 24px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <Reveal>
              <div style={{ textAlign: "center", marginBottom: 60 }}>
                <h2
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "clamp(26px, 4vw, 38px)",
                    fontWeight: 800,
                    color: "#0f172a",
                    marginBottom: 14,
                  }}
                >
                  Pertanyaan yang Sering Diajukan
                </h2>
                <p style={{ color: "#64748b", fontSize: 17 }}>
                  Jawaban untuk keraguanmu tentang persiapan CPNS 2026 bersama
                  PintuASN.
                </p>
              </div>
            </Reveal>

            <Reveal delay={100}>
              <FaqAccordion items={FAQ_ITEMS} />
            </Reveal>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section
          style={{
            background: "var(--navy)",
            padding: "100px 24px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: "100%",
              height: 4,
              background: "var(--gold)",
            }}
          />
          <div style={{ maxWidth: 700, margin: "0 auto", position: "relative", zIndex: 1 }}>
            <Reveal>
              <h2
                style={{
                  fontFamily: "var(--font-heading)",
                  fontWeight: 800,
                  fontSize: "clamp(28px, 4vw, 44px)",
                  color: "#fff",
                  marginBottom: 20,
                  lineHeight: 1.25,
                }}
              >
                Waktu Terus Berjalan, Pesaingmu Sudah Mulai Belajar.
              </h2>
              <p
                style={{
                  color: "rgba(255,255,255,0.6)",
                  fontSize: 17,
                  marginBottom: 40,
                  lineHeight: 1.75,
                }}
              >
                Jangan biarkan kuota formasi impianmu diambil orang lain karena
                kurang persiapan.
              </p>
              <a
                href="/register"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "18px 44px",
                  background: "var(--gold)",
                  color: "var(--navy)",
                  fontWeight: 800,
                  fontSize: 17,
                  borderRadius: 12,
                  textDecoration: "none",
                  boxShadow: "0 8px 32px rgba(245,197,24,0.35)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.transform =
                    "translateY(-2px)";
                  (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                    "0 14px 40px rgba(245,197,24,0.45)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.transform =
                    "translateY(0)";
                  (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                    "0 8px 32px rgba(245,197,24,0.35)";
                }}
              >
                🎯 Mulai Perjalanan ASN-mu Sekarang!
              </a>
            </Reveal>
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer
        style={{
          background: "#fff",
          borderTop: "1px solid #f1f5f9",
          padding: "60px 24px 28px",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 40,
            marginBottom: 48,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 800,
                fontSize: 20,
                color: "#0f172a",
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 14,
              }}
            >
              <span
                style={{
                  background: "var(--gold)",
                  color: "var(--navy)",
                  width: 28,
                  height: 28,
                  borderRadius: 7,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                }}
              >
                🎓
              </span>
              PintuASN
            </div>
            <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.75, maxWidth: 280 }}>
              Platform simulasi CAT SKD CPNS paling akurat di Indonesia. Partner
              terpercaya menuju NIP impianmu.
            </p>
            <div style={{ marginTop: 18, display: "flex", gap: 14, fontSize: 18, color: "#94a3b8" }}>
              <span style={{ cursor: "pointer" }}>📸</span>
              <span style={{ cursor: "pointer" }}>🎵</span>
              <span style={{ cursor: "pointer" }}>▶️</span>
            </div>
          </div>

          <div>
            <h4
              style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 700,
                fontSize: 15,
                color: "#0f172a",
                marginBottom: 16,
              }}
            >
              Platform
            </h4>
            {["Fitur Unggulan", "Harga & Paket", "FAQ", "Simulasi Gratis"].map(
              (item) => (
                <a
                  key={item}
                  href="#"
                  style={{
                    display: "block",
                    color: "#64748b",
                    fontSize: 14,
                    marginBottom: 10,
                    textDecoration: "none",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    ((e.target as HTMLAnchorElement).style.color = "var(--gold)")
                  }
                  onMouseLeave={(e) =>
                    ((e.target as HTMLAnchorElement).style.color = "#64748b")
                  }
                >
                  {item}
                </a>
              )
            )}
          </div>

          <div>
            <h4
              style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 700,
                fontSize: 15,
                color: "#0f172a",
                marginBottom: 16,
              }}
            >
              Bantuan
            </h4>
            {[
              "Cara Pembayaran",
              "Syarat & Ketentuan",
              "Kebijakan Privasi",
              "Hubungi Admin (WA)",
            ].map((item) => (
              <a
                key={item}
                href="#"
                style={{
                  display: "block",
                  color: "#64748b",
                  fontSize: 14,
                  marginBottom: 10,
                  textDecoration: "none",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) =>
                  ((e.target as HTMLAnchorElement).style.color = "var(--gold)")
                }
                onMouseLeave={(e) =>
                  ((e.target as HTMLAnchorElement).style.color = "#64748b")
                }
              >
                {item}
              </a>
            ))}
          </div>
        </div>

        <div
          style={{
            borderTop: "1px solid #f1f5f9",
            paddingTop: 24,
            textAlign: "center",
            color: "#94a3b8",
            fontSize: 13,
          }}
        >
          © 2026 PintuASN. All rights reserved.
        </div>
      </footer>
    </>
  );
}