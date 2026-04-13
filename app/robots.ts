// app/robots.ts
// HAPUS public/robots.txt terlebih dahulu sebelum menggunakan file ini

import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/blog',
          '/blog/',
          '/beli-paket',
          '/sign-in',
          '/sign-up',
        ],
        disallow: [
          '/dashboard',
          '/admin',
          '/api/',
          '/pembayaran',
          '/exam',
          '/profile',
          '/onboarding',
          '/statistics',
          '/materi',
          '/daftar-tryout',
          '/history',
          '/roadmap',
          '/events-promo',
        ],
      },
    ],
    sitemap: 'https://pintuasn.com/sitemap.xml',
  };
}