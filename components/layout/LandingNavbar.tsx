'use client';

import { useEffect, useRef, useState } from 'react';

const NAV_CSS = `
.lp-nav{position:fixed;top:0;left:0;right:0;z-index:60;display:flex;align-items:center;justify-content:space-between;
  padding:16px 28px;transition:.3s;background:rgba(255,255,255,0);font-family:var(--font-jakarta),'Plus Jakarta Sans',sans-serif}
.lp-nav.scrolled{background:rgba(255,255,255,.85);backdrop-filter:blur(12px);box-shadow:0 4px 24px rgba(30,41,59,.07);padding:11px 28px}
.lp-logo{display:flex;align-items:center;gap:9px;text-decoration:none}
.lp-logo-img{height:30px;width:auto;display:block}
.lp-links{display:flex;align-items:center;gap:30px;list-style:none;margin:0;padding:0}
.lp-links a{color:#475569;text-decoration:none;font-size:14px;font-weight:700;position:relative;transition:.2s}
.lp-links a::after{content:'';position:absolute;left:0;bottom:-5px;width:0;height:2px;background:#0ea5e9;transition:width .25s}
.lp-links a:hover{color:#1e293b}
.lp-links a:hover::after{width:100%}
.lp-nav-cta{display:flex;align-items:center;gap:12px}
.lp-nav .btn-ghost{color:#1e293b;font-weight:700;font-size:14px;text-decoration:none;padding:9px 14px;border-radius:10px;transition:.2s}
.lp-nav .btn-ghost:hover{background:#f1f5f9}
.btn-gold{background:#0ea5e9;color:#fff;font-weight:800;font-size:14px;text-decoration:none;padding:10px 20px;border-radius:11px;
  box-shadow:0 8px 22px rgba(14,165,233,.32);transition:.25s}
.btn-gold:hover{transform:translateY(-2px);box-shadow:0 12px 28px rgba(14,165,233,.45)}
.lp-mobile-dl{display:none}
.lp-burger{display:none;background:none;border:none;cursor:pointer;flex-direction:column;gap:5px;padding:6px}
.lp-burger span{width:24px;height:2.5px;background:#1e293b;border-radius:2px;transition:.3s}
.lp-mobile{display:none}
@keyframes lp-slidedown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
@media(max-width:880px){
  .lp-links,.lp-nav-cta{display:none}
  .lp-mobile-dl{display:inline-flex;align-items:center;gap:6px;margin-left:26px;margin-right:auto;margin-top:-11px;
    background:#1e293b;color:#facc15;font-weight:800;font-size:12.5px;padding:8px 13px;border-radius:10px;
    text-decoration:none;white-space:nowrap;box-shadow:0 6px 16px rgba(30,41,59,.22)}
  .lp-mobile-dl:active{transform:scale(.97)}
  .lp-burger{display:flex}
  .lp-mobile{display:block;position:fixed;top:60px;left:0;right:0;z-index:55;background:#fff;border-bottom:1px solid #e2e8f0;
    padding:16px 24px;box-shadow:0 12px 30px rgba(30,41,59,.1);animation:lp-slidedown .25s ease}
  .lp-mobile a{display:block;padding:12px 0;color:#334155;font-weight:700;text-decoration:none;border-bottom:1px solid #f1f5f9}
  .lp-mobile .btn-gold{display:block;text-align:center;margin-top:14px;border-bottom:none}
}
@media(max-width:560px){
  .lp-mobile-dl{font-size:11.5px;padding:7px 10px;margin-left:20px;gap:5px}
}
`;

export function LandingNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => navRef.current?.classList.toggle('scrolled', window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: NAV_CSS }} />
      <nav className="lp-nav" ref={navRef}>
        <a href="/" className="lp-logo" aria-label="PintuASN">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo-navbar-sky.svg" alt="PintuASN" className="lp-logo-img" />
        </a>
        <a href="/install" className="lp-mobile-dl" aria-label="Download Aplikasi">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" />
          </svg>
          Download Aplikasi
        </a>
        <ul className="lp-links">
          <li><a href="/#fitur">Fitur</a></li>
          <li><a href="/#paket">Paket</a></li>
          <li><a href="/#faq">FAQ</a></li>
          <li><a href="/install">Download Aplikasi</a></li>
          <li><a href="/blog">Blog</a></li>
        </ul>
        <div className="lp-nav-cta">
          <a href="/sign-in" className="btn-ghost">Masuk</a>
          <a href="/sign-up" className="btn-gold">Daftar Gratis</a>
        </div>
        <button className="lp-burger" aria-label="Menu" onClick={() => setMenuOpen((v) => !v)}>
          <span /><span /><span />
        </button>
      </nav>
      {menuOpen && (
        <div className="lp-mobile">
          <a href="/#fitur" onClick={() => setMenuOpen(false)}>Fitur</a>
          <a href="/#paket" onClick={() => setMenuOpen(false)}>Paket</a>
          <a href="/#faq" onClick={() => setMenuOpen(false)}>FAQ</a>
          <a href="/install" onClick={() => setMenuOpen(false)}>Download Aplikasi</a>
          <a href="/blog" onClick={() => setMenuOpen(false)}>Blog</a>
          <a href="/sign-in" onClick={() => setMenuOpen(false)}>Masuk</a>
          <a href="/sign-up" className="btn-gold" onClick={() => setMenuOpen(false)}>Daftar Gratis</a>
        </div>
      )}
    </>
  );
}
