'use client';

// app/(auth)/layout.tsx — Auth Layout v4
// Satu kolom, terang, tenang. Semua ornamen berat (panel gelap, blob animasi,
// kartu statistik, carousel testimoni) sengaja dihapus: halaman masuk cuma
// punya satu tugas, dan tipografi yang mengerjakannya.

const AUTH_CSS = `
.auth-shell{min-height:100dvh;display:flex;flex-direction:column;align-items:center;
  background:#f8fafc;font-family:var(--font-jakarta),'Plus Jakarta Sans',sans-serif;
  position:relative;overflow-x:hidden}
.auth-shell::before{content:'';position:absolute;inset:0;pointer-events:none;
  background:radial-gradient(ellipse at 50% -10%,rgba(14,165,233,.13),transparent 55%),
             radial-gradient(ellipse at 10% 100%,rgba(16,185,129,.08),transparent 50%)}
.auth-top{position:absolute;top:0;left:0;right:0;height:2px;
  background:linear-gradient(90deg,transparent,#0ea5e9 35%,#10b981 70%,transparent)}
.auth-main{position:relative;z-index:1;width:100%;max-width:400px;flex:1;
  display:flex;flex-direction:column;justify-content:center;padding:56px 24px 32px}
.auth-foot{position:relative;z-index:1;padding:0 24px 28px;text-align:center}
.auth-foot a{color:#64748b;font-size:12.5px;font-weight:600;text-decoration:none;transition:color .2s}
.auth-foot a:hover{color:#0ea5e9}
@keyframes authIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
.auth-in{animation:authIn .45s ease both}
@media(max-width:420px){.auth-main{padding:40px 20px 24px}}
`;

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: AUTH_CSS }} />
      <div className="auth-shell">
        <div className="auth-top" />

        <main className="auth-main auth-in">
          {children}
        </main>

        <footer className="auth-foot">
          <a href="/">Kembali ke beranda</a>
        </footer>
      </div>
    </>
  );
}
