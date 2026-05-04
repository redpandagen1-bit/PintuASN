'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

const categories = [
  {
    label: 'Umum',
    items: [
      {
        q: 'Apa itu PintuASN?',
        a: 'PintuASN adalah platform simulasi SKD CPNS online yang dirancang untuk membantu calon ASN berlatih sebelum ujian resmi. Soal-soal kami mencakup tiga subtes SKD: TWK (Tes Wawasan Kebangsaan), TIU (Tes Intelegensi Umum), dan TKP (Tes Karakteristik Pribadi).',
      },
      {
        q: 'Apakah tampilan simulasi mirip dengan sistem CAT BKN yang asli?',
        a: 'Ya. PintuASN dirancang mengikuti antarmuka CAT BKN, mulai dari tata letak soal, sistem navigasi nomor soal, timer, hingga cara input jawaban. Tujuannya agar Anda sudah terbiasa secara visual saat menghadapi ujian sesungguhnya.',
      },
      {
        q: 'Apakah soal-soalnya update sesuai kisi-kisi terbaru?',
        a: 'Tim akademik kami memperbarui bank soal secara berkala mengikuti Peraturan Menteri PANRB terbaru dan tren soal CPNS dari tahun-tahun sebelumnya, termasuk soal berstandar HOTS.',
      },
      {
        q: 'Apakah PintuASN bisa diakses dari HP?',
        a: 'Ya, PintuASN dapat diakses dari browser di HP, tablet, maupun laptop/PC. Tampilan responsif dan dioptimalkan untuk semua ukuran layar.',
      },
    ],
  },
  {
    label: 'Akun',
    items: [
      {
        q: 'Bagaimana cara mendaftar?',
        a: 'Klik tombol "Daftar Gratis" di halaman utama, masukkan email dan buat kata sandi, atau daftar menggunakan akun Google. Setelah verifikasi email, akun Anda langsung aktif.',
      },
      {
        q: 'Apakah satu akun boleh digunakan bersama-sama?',
        a: 'Tidak. Setiap akun hanya boleh digunakan oleh satu individu. Berbagi akun melanggar Syarat dan Ketentuan dan dapat mengakibatkan penonaktifan akun tanpa pengembalian dana.',
      },
      {
        q: 'Bagaimana cara mengganti kata sandi?',
        a: 'Di halaman login, klik "Lupa Kata Sandi", masukkan email terdaftar, dan ikuti instruksi yang dikirim ke email Anda.',
      },
      {
        q: 'Bagaimana cara menghapus akun saya?',
        a: 'Buka halaman Profil, klik tombol "Hapus Akun", dan ikuti konfirmasi. Permintaan penghapusan akan diproses dalam 30 hari kerja. Anda bisa membatalkan permintaan sebelum proses selesai.',
      },
    ],
  },
  {
    label: 'Paket dan Fitur',
    items: [
      {
        q: 'Apa saja perbedaan paket Gratis, Premium, dan Platinum?',
        a: 'Paket Gratis memberikan akses ke soal dan tryout dasar untuk mencoba sistem. Paket Premium membuka akses ke lebih banyak paket soal dan fitur analisis. Paket Platinum memberikan akses penuh ke semua konten, termasuk fitur eksklusif seperti analisis waktu per soal dan simulasi ujian tanpa batas.',
      },
      {
        q: 'Apakah saya wajib upgrade ke paket berbayar?',
        a: 'Tidak wajib. Paket Gratis tersedia selamanya agar Anda bisa mencoba kualitas soal dan sistem tanpa komitmen. Upgrade bisa dilakukan kapan saja sesuai kebutuhan.',
      },
      {
        q: 'Apa itu fitur Analisis Waktu per Soal?',
        a: 'Fitur eksklusif PintuASN yang merekam berapa detik Anda habiskan untuk setiap soal. Dari data ini, Anda bisa mengidentifikasi soal mana yang menjadi pemborosan waktu dan memperbaiki strategi pengerjaan.',
      },
      {
        q: 'Berapa lama masa aktif paket Premium/Platinum?',
        a: 'Masa aktif tercantum di halaman harga untuk setiap paket. Akses dihitung sejak pembayaran dikonfirmasi dan berakhir sesuai tanggal yang tertera. Langganan tidak diperpanjang otomatis.',
      },
      {
        q: 'Apakah ada jaminan lulus jika menggunakan PintuASN?',
        a: 'Tidak ada. PintuASN adalah platform latihan untuk membantu persiapan Anda, namun hasil ujian resmi sepenuhnya ditentukan oleh BKN dan instansi terkait. Kami tidak memberikan jaminan kelulusan dalam bentuk apapun.',
      },
    ],
  },
  {
    label: 'Pembayaran',
    items: [
      {
        q: 'Metode pembayaran apa saja yang tersedia?',
        a: 'Kami menerima QRIS, transfer bank melalui Virtual Account (BCA, BNI, Mandiri, BRI), dompet digital (GoPay, OVO, ShopeePay, Dana), serta pembayaran tunai di Alfamart dan Indomaret. Semua diproses melalui Midtrans.',
      },
      {
        q: 'Berapa lama akses aktif setelah pembayaran?',
        a: 'Aktivasi bersifat otomatis dan biasanya instan setelah sistem menerima konfirmasi pembayaran. Tidak perlu kirim bukti transfer atau konfirmasi manual.',
      },
      {
        q: 'Sudah bayar tapi akses belum aktif, apa yang harus dilakukan?',
        a: 'Tunggu 5-15 menit, karena konfirmasi dari bank kadang sedikit tertunda. Jika setelah 15 menit akses masih belum aktif, hubungi kami di support@pintuasn.com dengan menyertakan bukti pembayaran.',
      },
      {
        q: 'Apakah ada refund jika saya tidak puas?',
        a: 'Semua pembayaran yang berhasil bersifat final dan tidak dapat dikembalikan (non-refundable). Pengecualian hanya berlaku jika terdapat kesalahan teknis dari pihak PintuASN, dengan mengajukan klaim maksimal 7 hari sejak tanggal pembelian.',
      },
      {
        q: 'Apakah ada diskon atau kode promo?',
        a: 'Ya, kami kadang memberikan kode referral/diskon melalui program tertentu. Kode bisa dimasukkan saat checkout. Satu kode hanya dapat digunakan satu kali per transaksi.',
      },
    ],
  },
  {
    label: 'Teknis',
    items: [
      {
        q: 'Browser apa yang direkomendasikan?',
        a: 'PintuASN bekerja optimal di Google Chrome, Mozilla Firefox, dan Safari versi terbaru. Pastikan JavaScript aktif di browser Anda.',
      },
      {
        q: 'Apakah ujian bisa dilanjutkan jika koneksi internet terputus?',
        a: 'Sistem kami menyimpan jawaban secara berkala selama ujian berlangsung. Namun, koneksi internet yang stabil sangat disarankan untuk pengalaman terbaik. Jika koneksi terputus, segera sambungkan kembali dan lanjutkan dari halaman yang sama.',
      },
      {
        q: 'Data saya aman di PintuASN?',
        a: 'Ya. Seluruh data dienkripsi menggunakan TLS saat pengiriman dan saat penyimpanan. Kami tidak menjual data Anda kepada pihak manapun. Detail lengkap dapat dibaca di Kebijakan Privasi kami.',
      },
    ],
  },
];

export default function FaqPage() {
  const [openIdx, setOpenIdx] = useState<string | null>(null);

  const toggle = (key: string) => setOpenIdx(prev => prev === key ? null : key);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-5 flex items-center justify-between">
          <Link href="/" className="text-[#0ea5e9] font-bold text-lg" style={{ fontFamily: 'var(--font-jakarta)' }}>
            ← PintuASN
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10 pb-20">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-jakarta)' }}>
          Pertanyaan yang Sering Diajukan
        </h1>
        <p className="text-gray-500 text-sm mb-10">
          Tidak menemukan jawaban yang dicari? Hubungi kami di{' '}
          <a href="mailto:support@pintuasn.com" className="text-[#0ea5e9] underline">support@pintuasn.com</a>
        </p>

        <div className="space-y-8">
          {categories.map((cat) => (
            <section key={cat.label}>
              <h2 className="text-lg font-bold text-gray-800 mb-3 border-l-4 border-[#0ea5e9] pl-3">
                {cat.label}
              </h2>
              <div className="space-y-2">
                {cat.items.map((item, i) => {
                  const key = `${cat.label}-${i}`;
                  const isOpen = openIdx === key;
                  return (
                    <div key={key} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                      <button
                        onClick={() => toggle(key)}
                        className="w-full flex items-center justify-between px-5 py-4 text-left gap-4"
                      >
                        <span className="text-[15px] font-semibold text-gray-800 leading-snug">{item.q}</span>
                        <ChevronDown
                          size={18}
                          className={`text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-slate-100 pt-3">
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 bg-[#0f172a] rounded-2xl p-6 text-center">
          <p className="text-white font-bold text-lg mb-1">Masih Ada Pertanyaan Lain?</p>
          <p className="text-slate-400 text-sm mb-4">Tim kami siap membantu Anda.</p>
          <a
            href="mailto:support@pintuasn.com"
            className="inline-block bg-[#0ea5e9] text-white font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-sky-500 transition-colors"
          >
            Kirim Email ke Kami
          </a>
        </div>

        {/* Footer links */}
        <div className="mt-12 pt-8 border-t border-gray-200 flex flex-wrap gap-4 text-sm text-gray-500">
          <Link href="/cara-pembayaran" className="text-[#0ea5e9] hover:underline">Cara Pembayaran</Link>
          <span>·</span>
          <Link href="/kebijakan-privasi" className="hover:underline">Kebijakan Privasi</Link>
          <span>·</span>
          <Link href="/syarat-ketentuan" className="hover:underline">Syarat &amp; Ketentuan</Link>
          <span>·</span>
          <Link href="/" className="hover:underline">Kembali ke Beranda</Link>
        </div>
      </div>
    </div>
  );
}
