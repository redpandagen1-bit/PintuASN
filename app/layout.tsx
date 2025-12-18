import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SKD CPNS Tryout Platform',
  description: 'Platform latihan SKD CPNS online terpercaya',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="id">
        <body className={inter.className}>{children}</body>
      </html>
    </ClerkProvider>
  );
}