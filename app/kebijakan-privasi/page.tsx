import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Kebijakan Privasi – PintuASN',
  description: 'Kebijakan Privasi PintuASN menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi data pribadi pengguna sesuai UU No. 27 Tahun 2022 tentang Perlindungan Data Pribadi.',
};

const EFFECTIVE_DATE = '4 Mei 2026';
const CONTACT_EMAIL  = 'support@pintuasn.com';
const APP_URL        = 'https://pintuasn.com';

export default function KebijakanPrivasiPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-5 flex items-center justify-between">
          <Link href="/" className="text-[#0ea5e9] font-bold text-lg" style={{ fontFamily: 'var(--font-jakarta)' }}>
            ← PintuASN
          </Link>
          <span className="text-xs text-gray-400">Terakhir diperbarui: {EFFECTIVE_DATE}</span>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-10 pb-20">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-jakarta)' }}>
          Kebijakan Privasi
        </h1>
        <p className="text-sm text-gray-500 mb-2">PintuASN | pintuasn.com</p>
        <p className="text-sm text-gray-500 mb-8">Terakhir diperbarui: {EFFECTIVE_DATE}</p>

        {/* TOC */}
        <nav className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-10">
          <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-3">Daftar Isi</p>
          <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700">
            {[
              ['#pendahuluan',   '1. Pendahuluan'],
              ['#data',          '2. Data Pribadi yang Kami Kumpulkan'],
              ['#tujuan',        '3. Tujuan Penggunaan Data'],
              ['#dasar-hukum',   '4. Dasar Hukum Pemrosesan Data'],
              ['#retensi',       '5. Penyimpanan dan Retensi Data'],
              ['#pihak-ketiga',  '6. Pembagian Data kepada Pihak Ketiga'],
              ['#transfer',      '7. Transfer Data Lintas Negara'],
              ['#keamanan',      '8. Keamanan Data'],
              ['#hak',           '9. Hak-Hak Anda sebagai Pengguna'],
              ['#hapus-akun',    '10. Penghapusan Akun'],
              ['#refund',        '11. Kebijakan Pengembalian Dana'],
              ['#cookie',        '12. Cookie'],
              ['#perubahan',     '13. Perubahan Kebijakan Privasi'],
              ['#kontak',        '14. Hubungi Kami'],
            ].map(([href, label]) => (
              <li key={href}>
                <a href={href} className="hover:underline">{label}</a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="space-y-10 text-[15px] text-gray-700 leading-relaxed">

          {/* 1 */}
          <section id="pendahuluan" className="scroll-mt-6">
            <h2 className="text-xl font-bold text-gray-800 mb-3 border-l-4 border-[#0ea5e9] pl-3">1. Pendahuluan</h2>
            <p>
              PintuASN ("<a href={APP_URL} className="text-[#0ea5e9] underline">{APP_URL}</a>", selanjutnya disebut "Kami" atau "Platform")
              berkomitmen untuk melindungi privasi dan keamanan data pribadi setiap pengguna. Kebijakan Privasi ini disusun sesuai
              dengan ketentuan Undang-Undang No. 27 Tahun 2022 tentang Perlindungan Data Pribadi (UU PDP) dan peraturan
              perundang-undangan Indonesia yang berlaku.
            </p>
            <p className="mt-3">
              Dengan mendaftar dan menggunakan layanan PintuASN, Anda menyatakan telah membaca, memahami, dan menyetujui
              Kebijakan Privasi ini. Jika Anda tidak menyetujuinya, harap hentikan penggunaan layanan.
            </p>
          </section>

          {/* 2 */}
          <section id="data" className="scroll-mt-6">
            <h2 className="text-xl font-bold text-gray-800 mb-3 border-l-4 border-[#0ea5e9] pl-3">2. Data Pribadi yang Kami Kumpulkan</h2>
            <p className="mb-3">Kami mengumpulkan data pribadi berikut:</p>

            <div className="space-y-5">
              <div>
                <p className="font-semibold text-gray-800 mb-2">a. Data yang Anda Berikan Langsung</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Nama lengkap</li>
                  <li>Alamat email</li>
                  <li>Nomor telepon (opsional)</li>
                  <li>Jenis kelamin dan tanggal lahir</li>
                  <li>Alamat, provinsi, kota/kabupaten (opsional)</li>
                  <li>Instansi/lembaga pemerintah yang dituju</li>
                  <li>Sumber referral (dari mana Anda mengetahui PintuASN)</li>
                </ul>
              </div>

              <div>
                <p className="font-semibold text-gray-800 mb-2">b. Data Penggunaan Layanan</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Hasil tryout dan skor per kategori (TWK, TIU, TKP)</li>
                  <li>Jawaban soal dan riwayat percobaan ujian</li>
                  <li>Materi yang telah diakses</li>
                  <li>Preferensi pengingat belajar</li>
                  <li>Tier langganan (Gratis, Premium, Platinum)</li>
                </ul>
              </div>

              <div>
                <p className="font-semibold text-gray-800 mb-2">c. Data Transaksi</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Nomor order dan status pembayaran</li>
                  <li>Metode dan nilai transaksi</li>
                  <li>Kode referral yang digunakan</li>
                </ul>
                <p className="mt-2 text-sm bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <strong>Catatan:</strong> Data kartu kredit atau rekening bank Anda tidak disimpan oleh PintuASN.
                  Seluruh proses pembayaran ditangani oleh Midtrans, penyedia layanan pembayaran berlisensi Bank Indonesia.
                </p>
              </div>

              <div>
                <p className="font-semibold text-gray-800 mb-2">d. Data Teknis</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Identifikasi pengguna dari sistem autentikasi</li>
                  <li>Data analitik penggunaan aplikasi (secara anonim)</li>
                  <li>Cookie sesi untuk menjaga status login</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 3 */}
          <section id="tujuan" className="scroll-mt-6">
            <h2 className="text-xl font-bold text-gray-800 mb-3 border-l-4 border-[#0ea5e9] pl-3">3. Tujuan Penggunaan Data</h2>
            <p className="mb-3">Data pribadi Anda kami gunakan untuk:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Menyediakan dan mengelola akses ke layanan tryout dan materi belajar</li>
              <li>Memproses pembayaran langganan melalui penyedia payment gateway berlisensi</li>
              <li>Menampilkan hasil ujian, statistik, dan peringkat nasional</li>
              <li>Mengirimkan notifikasi transaksional (konfirmasi pembayaran, aktivasi akses)</li>
              <li>Meningkatkan kualitas layanan melalui analisis data penggunaan secara anonim</li>
              <li>Memenuhi kewajiban hukum yang berlaku</li>
            </ul>
            <p className="mt-3 font-medium">
              Kami tidak menggunakan data pribadi Anda untuk keperluan iklan pihak ketiga, dan tidak menjual data Anda kepada siapapun.
            </p>
          </section>

          {/* 4 */}
          <section id="dasar-hukum" className="scroll-mt-6">
            <h2 className="text-xl font-bold text-gray-800 mb-3 border-l-4 border-[#0ea5e9] pl-3">4. Dasar Hukum Pemrosesan Data</h2>
            <p className="mb-3">Berdasarkan UU PDP Pasal 20, pemrosesan data pribadi kami lakukan atas dasar:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Persetujuan (consent):</strong> Anda memberikan persetujuan saat mendaftar</li>
              <li><strong>Pelaksanaan perjanjian:</strong> untuk memenuhi layanan yang Anda gunakan</li>
              <li><strong>Kewajiban hukum:</strong> untuk memenuhi ketentuan perpajakan dan regulasi yang berlaku</li>
              <li><strong>Kepentingan yang sah (legitimate interest):</strong> untuk keamanan sistem dan pencegahan penipuan</li>
            </ul>
          </section>

          {/* 5 */}
          <section id="retensi" className="scroll-mt-6">
            <h2 className="text-xl font-bold text-gray-800 mb-3 border-l-4 border-[#0ea5e9] pl-3">5. Penyimpanan dan Retensi Data</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Data profil dan akun disimpan selama akun aktif</li>
              <li>Hasil dan riwayat tryout disimpan selama akun aktif</li>
              <li>Data transaksi pembayaran disimpan selama 5 tahun sesuai kewajiban perpajakan Indonesia</li>
              <li>Permintaan penghapusan akun diproses dalam 30 hari kerja</li>
            </ul>
          </section>

          {/* 6 */}
          <section id="pihak-ketiga" className="scroll-mt-6">
            <h2 className="text-xl font-bold text-gray-800 mb-3 border-l-4 border-[#0ea5e9] pl-3">6. Pembagian Data kepada Pihak Ketiga</h2>
            <p className="mb-3">Kami dapat membagikan data pribadi Anda kepada pihak ketiga hanya dalam kondisi berikut:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Penyedia layanan pembayaran (Midtrans):</strong> untuk memproses transaksi</li>
              <li><strong>Penyedia layanan hosting dan infrastruktur:</strong> untuk operasional platform</li>
              <li><strong>Otoritas berwenang:</strong> apabila diwajibkan oleh hukum atau perintah pengadilan</li>
            </ul>
            <p className="mt-3 font-medium">
              Kami tidak membagikan data Anda kepada pihak lain di luar keperluan di atas, dan tidak menjual data Anda kepada pihak manapun.
            </p>
          </section>

          {/* 7 */}
          <section id="transfer" className="scroll-mt-6">
            <h2 className="text-xl font-bold text-gray-800 mb-3 border-l-4 border-[#0ea5e9] pl-3">7. Transfer Data Lintas Negara</h2>
            <p>
              Data pribadi Anda disimpan pada infrastruktur penyedia layanan cloud yang berlokasi di luar Indonesia, dengan jaminan
              perlindungan yang memadai termasuk enkripsi data saat pengiriman (TLS) dan saat penyimpanan. Dengan menggunakan
              layanan PintuASN, Anda menyetujui penyimpanan dan pemrosesan data tersebut sebagaimana diperlukan untuk
              penyediaan layanan.
            </p>
          </section>

          {/* 8 */}
          <section id="keamanan" className="scroll-mt-6">
            <h2 className="text-xl font-bold text-gray-800 mb-3 border-l-4 border-[#0ea5e9] pl-3">8. Keamanan Data</h2>
            <p className="mb-3">Kami menerapkan langkah-langkah keamanan untuk melindungi data pribadi Anda, antara lain:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Enkripsi data saat pengiriman (TLS) dan saat penyimpanan</li>
              <li>Pembatasan akses: setiap pengguna hanya dapat mengakses datanya sendiri</li>
              <li>Akses admin dibatasi dengan verifikasi berlapis</li>
              <li>Pemantauan sistem secara berkala</li>
            </ul>
            <p className="mt-3">
              Apabila terjadi insiden keamanan yang berdampak pada data Anda, kami akan memberitahu Anda dan otoritas yang
              berwenang sesuai ketentuan UU PDP.
            </p>
          </section>

          {/* 9 */}
          <section id="hak" className="scroll-mt-6">
            <h2 className="text-xl font-bold text-gray-800 mb-3 border-l-4 border-[#0ea5e9] pl-3">9. Hak-Hak Anda sebagai Pengguna</h2>
            <p className="mb-3">Sesuai UU PDP, Anda berhak untuk:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Mengakses data pribadi Anda yang kami simpan</li>
              <li>Memperbaiki atau memperbarui data yang tidak akurat melalui halaman Profil</li>
              <li>Mengajukan permintaan penghapusan akun dan data pribadi Anda</li>
              <li>Membatasi pemrosesan data dalam kondisi tertentu</li>
              <li>Menarik persetujuan kapan saja (namun dapat memengaruhi akses ke layanan)</li>
            </ul>
            <p className="mt-3">
              Untuk mengajukan permintaan terkait hak-hak di atas, hubungi kami di{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#0ea5e9] underline">{CONTACT_EMAIL}</a>.
              Kami akan merespons dalam 3×24 jam.
            </p>
          </section>

          {/* 10 */}
          <section id="hapus-akun" className="scroll-mt-6">
            <h2 className="text-xl font-bold text-gray-800 mb-3 border-l-4 border-[#0ea5e9] pl-3">10. Penghapusan Akun</h2>
            <p>
              Anda dapat mengajukan permintaan penghapusan akun melalui halaman Profil atau dengan mengirim email ke{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#0ea5e9] underline">{CONTACT_EMAIL}</a>.
              Setelah permintaan diterima, proses penghapusan akan diselesaikan dalam 30 hari kerja.
            </p>
            <p className="mt-3">
              Data transaksi pembayaran akan tetap disimpan selama 5 tahun sebagaimana diwajibkan oleh peraturan perpajakan
              Indonesia, dalam kondisi terpisah dari identitas Anda.
            </p>
          </section>

          {/* 11 */}
          <section id="refund" className="scroll-mt-6">
            <h2 className="text-xl font-bold text-gray-800 mb-3 border-l-4 border-[#0ea5e9] pl-3">11. Kebijakan Pengembalian Dana (Refund)</h2>
            <p>
              Paket yang telah dibeli tidak dapat dikembalikan (non-refundable), kecuali terdapat kesalahan teknis yang
              disebabkan oleh pihak PintuASN. Apabila kondisi tersebut terpenuhi, Pengguna dapat menghubungi kami melalui{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#0ea5e9] underline">{CONTACT_EMAIL}</a>{' '}
              dengan menyertakan bukti transaksi, maksimal 7 hari sejak tanggal pembelian.
            </p>
          </section>

          {/* 12 */}
          <section id="cookie" className="scroll-mt-6">
            <h2 className="text-xl font-bold text-gray-800 mb-3 border-l-4 border-[#0ea5e9] pl-3">12. Cookie</h2>
            <p>
              PintuASN menggunakan cookie sesi yang diperlukan untuk menjaga status login Anda. Cookie ini bersifat teknis
              dan dihapus saat Anda keluar dari akun. Kami juga menggunakan layanan analitik pihak ketiga untuk menganalisis
              penggunaan platform secara anonim. Data analitik ini tidak mengidentifikasi Anda secara personal.
            </p>
          </section>

          {/* 13 */}
          <section id="perubahan" className="scroll-mt-6">
            <h2 className="text-xl font-bold text-gray-800 mb-3 border-l-4 border-[#0ea5e9] pl-3">13. Perubahan Kebijakan Privasi</h2>
            <p>
              Kami dapat memperbarui Kebijakan Privasi ini sewaktu-waktu. Perubahan yang bersifat material akan diberitahukan
              melalui notifikasi di aplikasi atau email setidaknya 14 hari sebelum berlaku. Penggunaan layanan setelah tanggal
              perubahan berlaku dianggap sebagai persetujuan atas perubahan tersebut.
            </p>
          </section>

          {/* 14 */}
          <section id="kontak" className="scroll-mt-6">
            <h2 className="text-xl font-bold text-gray-800 mb-3 border-l-4 border-[#0ea5e9] pl-3">14. Hubungi Kami</h2>
            <p className="mb-3">Untuk pertanyaan, keluhan, atau pengajuan hak sesuai UU PDP, silakan hubungi:</p>
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 space-y-1 text-sm">
              <p><strong>PintuASN | Tim Privasi &amp; Kepatuhan</strong></p>
              <p>
                Email:{' '}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#0ea5e9] underline">{CONTACT_EMAIL}</a>
              </p>
              <p>
                Website:{' '}
                <a href={APP_URL} className="text-[#0ea5e9] underline">{APP_URL}</a>
              </p>
              <p className="text-gray-500">Respons dalam 3×24 jam</p>
            </div>
          </section>

        </div>

        {/* Footer links */}
        <div className="mt-12 pt-8 border-t border-gray-200 flex flex-wrap gap-4 text-sm text-gray-500">
          <Link href="/syarat-ketentuan" className="text-[#0ea5e9] hover:underline">
            Syarat &amp; Ketentuan
          </Link>
          <span>·</span>
          <Link href="/" className="hover:underline">Kembali ke Beranda</Link>
        </div>
      </div>
    </div>
  );
}
