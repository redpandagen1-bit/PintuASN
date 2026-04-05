'use client';

import { useEffect, useRef } from 'react';
import { SignIn } from '@clerk/nextjs';

const ERROR_MAP: [RegExp, string][] = [
  [
    /external account was not found|account was not found|the.*account.*not found/i,
    'Akun Google ini belum terdaftar. Silakan daftar terlebih dahulu.',
  ],
  [
    /couldn'?t find your account|could not locate|no account.*found/i,
    'Akun tidak ditemukan. Periksa kembali email Anda.',
  ],
  [
    /isn'?t registered|not registered|no account.*email|email.*not.*registered/i,
    'Email ini belum terdaftar. Silakan daftar terlebih dahulu.',
  ],
];

function replaceErrorTexts(root: HTMLElement) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node: Text | null;
  while ((node = walker.nextNode() as Text | null)) {
    const text = node.nodeValue;
    if (!text) continue;
    for (const [pattern, replacement] of ERROR_MAP) {
      if (pattern.test(text)) {
        node.nodeValue = replacement;
        break;
      }
    }
  }
}

export default function SignInPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    // Run once on mount in case error is already present
    replaceErrorTexts(root);

    const observer = new MutationObserver(() => replaceErrorTexts(root));
    observer.observe(root, { childList: true, subtree: true, characterData: true });

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Selamat Datang Kembali
        </h2>
        <p className="text-sm text-slate-600">
          Masukan kredensial Anda untuk mengakses dashboard
        </p>
      </div>
      
      <SignIn
        routing="hash"
        signUpUrl="/sign-up"
        transferable={false}
        appearance={{
          elements: {
            rootBox: 'w-full',
            card: 'shadow-xl border-slate-200',
            formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-sm',
            footerActionLink: 'text-blue-600 hover:text-blue-500',
            // Remove Clerk branding
            footer: 'hidden',
            footerAction: 'hidden',
            // Customize header
            headerTitle: 'text-xl font-bold',
            headerSubtitle: 'text-sm text-slate-600',
          },
          layout: {
            socialButtonsPlacement: 'top',
            logoPlacement: 'none', // Remove Clerk logo
          },
        }}
        localization={{
          formFieldLabel__emailAddress: 'Alamat Email',
          formFieldLabel__password: 'Kata Sandi',
          formButtonPrimary: 'Masuk',
          footerActionLink__signUp: 'Daftar',
          socialButtonsBlockButton__google: 'Lanjutkan dengan Google',
          socialButtonsBlockButton__github: 'Lanjutkan dengan GitHub',
        }}
      />

      <p className="text-center text-sm text-slate-500">
        Belum punya akun?{' '}
        <a href="/sign-up" className="text-blue-600 hover:text-blue-500 font-medium">
          Daftar sekarang
        </a>
      </p>
    </div>
  );
}
