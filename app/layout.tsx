import type { Metadata, Viewport } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { idID } from '@clerk/localizations';
import { Toaster } from 'sonner';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});
const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#091426',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'PintuASN – Simulasi CAT SKD CPNS Terpercaya 2026',
  description: 'Platform tryout SKD CPNS online 99% mirip sistem BKN. Analitik mendalam, ranking nasional, roadmap belajar terstruktur. Daftar gratis sekarang!',
  verification: {
    google: 'ZhzlrinPB9UdAt8_s6QlU19A8GcbDNcToDC6eBLramI',
  },
  keywords: 'tryout CPNS, simulasi CAT BKN, SKD CPNS 2026, latihan soal CPNS, TWK TIU TKP, pintuasn',
  metadataBase: new URL('https://pintuasn.com'),
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'PintuASN',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: 'PintuASN – Simulasi CAT SKD CPNS Terpercaya 2026',
    description: 'Tryout SKD CPNS online 99% mirip BKN. Ranking nasional, analitik mendalam.',
    url: 'https://pintuasn.com',
    siteName: 'PintuASN',
    locale: 'id_ID',
    type: 'website',
    images: [{ url: '/images/og-image.jpg', width: 1200, height: 630 }],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <ClerkProvider localization={{
      ...idID,
      formFieldInputPlaceholder__emailAddress: 'nama@email.com',
      formFieldInputPlaceholder__password:     'Masukkan kata sandi',
      formFieldInputPlaceholder__firstName:    'Nama depan',
      formFieldInputPlaceholder__lastName:     'Nama belakang',
    } as any}>
      <html lang="id" className={`${inter.variable} ${jakarta.variable}`}>
        <body className={`${inter.className} tap-none overscroll-none`}>
          {children}
          <Toaster position="top-right" richColors />
        </body>
      </html>
    </ClerkProvider>
  );
}

