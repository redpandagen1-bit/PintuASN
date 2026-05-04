import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Cara Pembayaran – PintuASN',
  description: 'Panduan lengkap cara pembayaran paket berlangganan PintuASN. Tersedia QRIS, transfer bank, e-wallet, dan minimarket.',
};

const CONTACT_EMAIL = 'support@pintuasn.com';

const methods = [
  {
    icon: '📱',
    title: 'QRIS',
    desc: 'Scan QR Code dengan aplikasi dompet digital atau mobile banking apapun.',
    tags: ['GoPay', 'OVO', 'ShopeePay', 'Dana', 'LinkAja', 'Mobile Banking'],
  },
  {
    icon: '💳',
    title: 'Transfer Bank (Virtual Account)',
    desc: 'Transfer ke nomor Virtual Account yang dihasilkan otomatis saat checkout.',
    tags: ['BCA', 'BNI', 'Mandiri', 'BRI', 'CIMB Niaga', 'Permata'],
  },
  {
    icon: '🏪',
    title: 'Minimarket',
    desc: 'Bayar tunai di kasir minimarket terdekat menggunakan kode pembayaran.',
    tags: ['Alfamart', 'Indomaret'],
  },
  {
    icon: '📲',
    title: 'Dompet Digital',
    desc: 'Bayar langsung dari aplikasi dompet digital yang sudah terhubung.',
    tags: ['GoPay', 'OVO', 'ShopeePay', 'Dana'],
  },
];

const steps = [
  { num: '1', title: 'Pilih Paket', desc: 'Buka halaman Harga, pilih paket Premium atau Platinum, lalu klik tombol "Beli Sekarang".' },
  { num: '2', title: 'Pilih Metode Pembayaran', desc: 'Pilih metode pembayaran yang tersedia: QRIS, Virtual Account, dompet digital, atau minimarket.' },
  { num: '3', title: 'Selesaikan Pembayaran', desc: 'Ikuti instruksi sesuai metode yang dipilih. Batas waktu pembayaran adalah 1 jam setelah pesanan dibuat.' },
  { num: '4', title: 'Akses Aktif Otomatis', desc: 'Setelah pembayaran dikonfirmasi sistem (biasanya instan), akses langganan Anda langsung aktif tanpa perlu konfirmasi manual.' },
];

export default function CaraPembayaranPage() {
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
          Cara Pembayaran
        </h1>
        <p className="text-gray-500 text-sm mb-10">
          Semua transaksi diproses aman melalui <strong>Midtrans</strong>, penyedia payment gateway berlisensi Bank Indonesia.
        </p>

        {/* Langkah */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-gray-800 mb-5 border-l-4 border-[#0ea5e9] pl-3">
            Langkah-Langkah Pembayaran
          </h2>
          <div className="space-y-4">
            {steps.map((step) => (
              <div key={step.num} className="flex gap-4 bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                <div className="w-9 h-9 rounded-full bg-[#0ea5e9] text-white font-black text-sm flex items-center justify-center shrink-0">
                  {step.num}
                </div>
                <div>
                  <p className="font-bold text-gray-800 mb-1">{step.title}</p>
                  <p className="text-gray-600 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Metode */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-gray-800 mb-5 border-l-4 border-[#0ea5e9] pl-3">
            Metode Pembayaran Tersedia
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {methods.map((m) => (
              <div key={m.title} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{m.icon}</span>
                  <p className="font-bold text-gray-800">{m.title}</p>
                </div>
                <p className="text-gray-500 text-sm mb-3 leading-relaxed">{m.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {m.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Catatan Penting */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-gray-800 mb-5 border-l-4 border-[#0ea5e9] pl-3">
            Catatan Penting
          </h2>
          <div className="space-y-3">
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
              <strong>Batas waktu pembayaran:</strong> Setiap pesanan memiliki batas waktu 1 jam. Jika belum dibayar, pesanan otomatis kadaluarsa dan Anda perlu membuat pesanan baru.
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
              <strong>Konfirmasi otomatis:</strong> Aktivasi akses bersifat otomatis setelah pembayaran dikonfirmasi sistem. Tidak perlu kirim bukti transfer.
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800">
              <strong>Kebijakan refund:</strong> Pembayaran yang telah berhasil bersifat final dan tidak dapat dikembalikan, kecuali terdapat kesalahan teknis dari pihak PintuASN. Lihat detail di{' '}
              <Link href="/kebijakan-privasi#refund" className="underline font-semibold">Kebijakan Privasi</Link>.
            </div>
          </div>
        </section>

        {/* Kendala Pembayaran */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-gray-800 mb-5 border-l-4 border-[#0ea5e9] pl-3">
            Kendala Pembayaran?
          </h2>
          <div className="space-y-4 text-sm text-gray-700">
            <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
              <p className="font-semibold text-gray-800 mb-1">Sudah bayar tapi akses belum aktif</p>
              <p className="text-gray-600">Tunggu 5-10 menit, karena konfirmasi dari bank/dompet digital kadang membutuhkan sedikit waktu. Jika lebih dari 15 menit belum aktif, hubungi kami dengan menyertakan bukti pembayaran.</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
              <p className="font-semibold text-gray-800 mb-1">Pesanan kadaluarsa sebelum sempat bayar</p>
              <p className="text-gray-600">Buat pesanan baru dari halaman Harga. Harga yang berlaku adalah harga saat pesanan baru dibuat.</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
              <p className="font-semibold text-gray-800 mb-1">Kesalahan saat proses pembayaran</p>
              <p className="text-gray-600">Coba ganti metode pembayaran atau gunakan jaringan internet yang berbeda. Jika masalah berlanjut, hubungi kami.</p>
            </div>
          </div>
        </section>

        {/* Kontak */}
        <section>
          <div className="bg-[#0f172a] rounded-2xl p-6 text-center">
            <p className="text-white font-bold text-lg mb-1">Masih Ada Pertanyaan?</p>
            <p className="text-slate-400 text-sm mb-4">Tim support kami siap membantu.</p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-block bg-[#0ea5e9] text-white font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-sky-500 transition-colors"
            >
              Hubungi {CONTACT_EMAIL}
            </a>
          </div>
        </section>

        {/* Footer links */}
        <div className="mt-12 pt-8 border-t border-gray-200 flex flex-wrap gap-4 text-sm text-gray-500">
          <Link href="/faq" className="text-[#0ea5e9] hover:underline">FAQ</Link>
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
