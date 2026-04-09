import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from 'sonner';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PintuASN – Simulasi CAT SKD CPNS Terpercaya 2026',
  description: 'Platform tryout SKD CPNS online 99% mirip sistem BKN. Analitik mendalam, ranking nasional, roadmap belajar terstruktur. Daftar gratis sekarang!',
  verification: {
    google: 'ZhzlrinPB9UdAt8_s6QlU19A8GcbDNcToDC6eBLramI',
  },
  keywords: 'tryout CPNS, simulasi CAT BKN, SKD CPNS 2026, latihan soal CPNS, TWK TIU TKP, pintuasn',
  metadataBase: new URL('https://pintuasn.com'),
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
    <ClerkProvider>
      <html lang="id">
        <body className={inter.className}>
          {children}
          <Toaster position="top-right" richColors />
        </body>
      </html>
    </ClerkProvider>
  );
}

