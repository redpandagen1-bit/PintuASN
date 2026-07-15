import type { NextConfig } from 'next'

const securityHeaders = [
  { key: 'X-Content-Type-Options',    value: 'nosniff' },
  { key: 'X-Frame-Options',           value: 'DENY' },
  { key: 'X-XSS-Protection',          value: '1; mode=block' },
  { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy',        value: 'camera=(), microphone=(), geolocation=()' },
];

const nextConfig: NextConfig = {
  eslint: {
    // Lint diaktifkan di build: 0 error (rule stylistic/React-Compiler
    // diturunkan ke "warn" di eslint.config.mjs). Build gagal hanya jika ada
    // error lint baru — mis. rules-of-hooks / exhaustive-deps yang menandai bug.
    ignoreDuringBuilds: false,
  },
  typescript: {
    // TS diaktifkan kembali di build: seluruh kode app sudah bersih dari error
    // (supabase/functions Deno di-exclude di tsconfig). Build kini menangkap
    // regresi tipe secara otomatis alih-alih menyembunyikannya.
    ignoreBuildErrors: false,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'kvnlpksrimhrckzqiufu.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
}

export default nextConfig