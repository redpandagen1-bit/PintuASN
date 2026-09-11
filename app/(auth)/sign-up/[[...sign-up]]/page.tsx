// app/(auth)/sign-up/[[...sign-up]]/page.tsx
// Sign up sudah digabung ke halaman Sign In (Google-only — satu tombol
// menangani login maupun pembuatan akun baru). Route ini dipertahankan
// sebagai redirect saja supaya link lama (marketing, bookmark, dsb.) yang
// masih mengarah ke /sign-up tidak 404. Parameter `plan` diteruskan supaya
// konteks paket yang dipilih dari halaman harga tidak hilang.

import { redirect } from 'next/navigation';

export default async function SignUpRedirect({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const { plan } = await searchParams;
  redirect(plan ? `/sign-in?plan=${plan}` : '/sign-in');
}
