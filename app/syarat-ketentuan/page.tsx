import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Syarat & Ketentuan – PintuASN',
  description: 'Syarat dan Ketentuan penggunaan layanan PintuASN, platform simulasi SKD CPNS online.',
};

const EFFECTIVE_DATE = '1 Juni 2026';
const CONTACT_EMAIL  = 'support@pintuasn.com';
const APP_URL        = 'https://pintuasn.com';

export default function SyaratKetentuanPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-5 flex items-center justify-between">
          <Link href="/" className="text-[#0ea5e9] font-bold text-lg" style={{ fontFamily: 'var(--font-jakarta)' }}>
            ← PintuASN
          </Link>
          <span className="text-xs text-gray-400">Berlaku mulai {EFFECTIVE_DATE}</span>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-10 pb-20">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-jakarta)' }}>
          Syarat &amp; Ketentuan
        </h1>
        <p className="text-sm text-gray-500 mb-8">Terakhir diperbarui: {EFFECTIVE_DATE}</p>

        {/* TOC */}
        <nav className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-10">
          <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-3">Daftar Isi</p>
          <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700">
            {[
              ['#penerimaan',    'Penerimaan Syarat'],
              ['#definisi',      'Definisi'],
              ['#akun',          'Pendaftaran & Akun'],
              ['#layanan',       'Layanan yang Tersedia'],
              ['#pembayaran',    'Berlangganan & Pembayaran'],
              ['#kewajiban',     'Kewajiban & Larangan Pengguna'],
              ['#hki',           'Kekayaan Intelektual'],
              ['#disclaimer',    'Disclaimer & Batasan Tanggung Jawab'],
              ['#penghentian',   'Penghentian Layanan'],
              ['#hukum',         'Hukum yang Berlaku'],
              ['#perubahan',     'Perubahan Syarat'],
              ['#kontak',        'Kontak Kami'],
            ].map(([href, label]) => (
              <li key={href}>
                <a href={href} className="hover:underline">{label}</a>
              </li>
            ))}
          </ol>
        </nav>

        {/* Section helper */}
        {(() => {
          const Section = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => (
            <section id={id} className="mb-10 scroll-mt-6">
              <h2 className="text-xl font-bold text-gray-800 mb-3 border-l-4 border-[#0ea5e9] pl-3">
                {title}
              </h2>
              <div className="text-gray-700 leading-relaxed space-y-3 text-[15px]">
                {children}
              </div>
            </section>
          );

          return (
            <>
              {/* 1. Penerimaan */}
              <Section id="penerimaan" title="1. Penerimaan Syarat">
                <p>
                  Dengan mengakses atau menggunakan layanan PintuASN melalui{' '}
                  <a href={APP_URL} className="text-[#0ea5e9] underline">{APP_URL}</a>,
                  Anda menyatakan telah membaca, memahami, dan menyetujui Syarat & Ketentuan ini
                  serta <Link href="/kebijakan-privasi" className="text-[#0ea5e9] underline">Kebijakan Privasi</Link> kami.
                </p>
                <p>
                  Jika Anda tidak menyetujui salah satu ketentuan di bawah ini, harap hentikan
                  penggunaan layanan segera.
                </p>
              </Section>

              {/* 2. Definisi */}
              <Section id="definisi" title="2. Definisi">
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>"PintuASN":</strong> platform simulasi SKD CPNS online yang dapat diakses melalui {APP_URL}.</li>
                  <li><strong>"Layanan":</strong> seluruh fitur yang tersedia di PintuASN, termasuk paket soal, simulasi ujian, dan dashboard hasil.</li>
                  <li><strong>"Pengguna":</strong> setiap orang yang mendaftar dan/atau menggunakan Layanan.</li>
                  <li><strong>"Konten":</strong> semua materi yang tersedia di platform, termasuk soal, kunci jawaban, pembahasan, dan teks lainnya.</li>
                  <li><strong>"Berlangganan":</strong> akses berbayar ke paket Layanan tertentu dalam jangka waktu yang ditentukan.</li>
                </ul>
              </Section>

              {/* 3. Akun */}
              <Section id="akun" title="3. Pendaftaran & Akun">
                <p>
                  Untuk menggunakan fitur penuh PintuASN, Anda perlu membuat akun dengan informasi
                  yang benar, lengkap, dan terkini. Akun Anda bersifat pribadi dan tidak dapat
                  dipindahtangankan.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="font-semibold text-yellow-800 mb-1">Satu Akun, Satu Orang</p>
                  <p className="text-yellow-700 text-sm">
                    Setiap akun hanya boleh digunakan oleh satu individu. Berbagi akun, termasuk
                    login bersama, penggunaan akun secara bergantian, atau pemberian akses kepada
                    pihak lain, merupakan pelanggaran dan dapat mengakibatkan penonaktifan akun
                    tanpa pengembalian dana.
                  </p>
                </div>
                <p>
                  Anda bertanggung jawab menjaga kerahasiaan kata sandi dan seluruh aktivitas yang
                  dilakukan melalui akun Anda. Segera hubungi kami di{' '}
                  <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#0ea5e9] underline">{CONTACT_EMAIL}</a>{' '}
                  jika Anda mencurigai penggunaan akun tanpa izin.
                </p>
                <p>
                  Kami berhak menolak pendaftaran atau menangguhkan akun yang melanggar ketentuan ini,
                  tanpa pemberitahuan sebelumnya dan tanpa kewajiban pengembalian dana.
                </p>
              </Section>

              {/* 4. Layanan */}
              <Section id="layanan" title="4. Layanan yang Tersedia">
                <p>PintuASN menyediakan:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Simulasi SKD CPNS berbasis Computer Assisted Test (CAT) yang mencakup TWK, TIU, dan TKP.</li>
                  <li>Paket soal latihan dengan berbagai tingkat kesulitan.</li>
                  <li>Pembahasan soal dan analisis hasil ujian.</li>
                  <li>Dashboard riwayat latihan dan statistik perkembangan belajar.</li>
                </ul>
                <p>
                  Layanan tersedia dalam berbagai tier berlangganan (Gratis, Premium, Platinum).
                  Fitur yang dapat diakses bergantung pada tier langganan aktif Anda.
                </p>
                <p>
                  Kami berhak mengubah, menambah, atau menghapus fitur layanan kapan saja, termasuk
                  menghentikan layanan sementara untuk pemeliharaan, tanpa pemberitahuan terlebih
                  dahulu. Perubahan signifikan akan diinformasikan melalui email atau pengumuman di
                  platform.
                </p>
              </Section>

              {/* 5. Pembayaran */}
              <Section id="pembayaran" title="5. Berlangganan & Pembayaran">
                <p>
                  Beberapa paket Layanan memerlukan pembayaran. Dengan melakukan pembayaran, Anda
                  menyetujui harga dan ketentuan yang berlaku pada saat transaksi.
                </p>
                <div className="space-y-3">
                  <div>
                    <p className="font-semibold text-gray-800">Pembayaran</p>
                    <p>
                      Transaksi diproses melalui Midtrans, penyedia layanan pembayaran berlisensi Bank
                      Indonesia. Kami menerima transfer bank, QRIS, kartu kredit/debit, dan dompet
                      digital sesuai ketersediaan metode di Midtrans.
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Masa Aktif</p>
                    <p>
                      Berlangganan berlaku sejak pembayaran dikonfirmasi hingga tanggal berakhir yang
                      tertera. Langganan tidak diperpanjang otomatis.
                    </p>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="font-semibold text-red-800 mb-1">Kebijakan Tidak Ada Pengembalian Dana (No Refund)</p>
                    <p className="text-red-700 text-sm">
                      Semua pembayaran yang telah berhasil dikonfirmasi bersifat final dan tidak dapat
                      dikembalikan. Kami tidak menyediakan refund untuk alasan apapun, termasuk
                      ketidakgunaan layanan, ketidakpuasan, atau perubahan kebutuhan pengguna.
                      Harap pertimbangkan dengan matang sebelum melakukan pembelian.
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Kegagalan Pembayaran</p>
                    <p>
                      Jika pembayaran gagal atau kadaluarsa sebelum dikonfirmasi, akses premium tidak
                      akan diberikan. Anda dapat mencoba kembali dengan membuat pesanan baru.
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Kode Referral & Diskon</p>
                    <p>
                      Kode referral/diskon hanya dapat digunakan sekali per transaksi, tidak dapat
                      digabungkan dengan promo lain, dan tunduk pada masa berlaku yang ditentukan.
                      Penyalahgunaan kode diskon dapat mengakibatkan pembatalan transaksi.
                    </p>
                  </div>
                </div>
              </Section>

              {/* 6. Kewajiban */}
              <Section id="kewajiban" title="6. Kewajiban & Larangan Pengguna">
                <p>Sebagai pengguna, Anda <strong>wajib</strong>:</p>
                <ul className="list-disc pl-5 space-y-1 mb-3">
                  <li>Menggunakan Layanan hanya untuk keperluan pribadi dan non-komersial.</li>
                  <li>Memberikan informasi akun yang akurat dan menjaga kerahasiaannya.</li>
                  <li>Mematuhi seluruh peraturan perundang-undangan yang berlaku di Indonesia.</li>
                </ul>
                <p>Anda <strong>dilarang</strong> melakukan hal berikut:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Menyalin, mendistribusikan, menjual, atau mempublikasikan Konten dari platform tanpa izin tertulis.</li>
                  <li>Melakukan rekayasa balik (reverse engineering) atau memodifikasi sistem platform.</li>
                  <li>Menggunakan bot, scraper, atau alat otomatis untuk mengakses atau mengumpulkan data dari platform.</li>
                  <li>Membagikan akun atau kredensial login kepada pihak lain.</li>
                  <li>Melakukan tindakan yang mengganggu ketersediaan atau kinerja platform (termasuk serangan DDoS).</li>
                  <li>Menggunakan layanan untuk tujuan yang melanggar hukum atau merugikan pihak lain.</li>
                  <li>Membuat akun palsu atau memberikan informasi yang menyesatkan.</li>
                </ul>
                <p>
                  Pelanggaran terhadap larangan di atas dapat mengakibatkan penonaktifan akun secara
                  permanen tanpa pengembalian dana, serta tindakan hukum jika diperlukan.
                </p>
              </Section>

              {/* 7. HKI */}
              <Section id="hki" title="7. Kekayaan Intelektual">
                <p>
                  Seluruh Konten yang tersedia di PintuASN, termasuk namun tidak terbatas pada soal
                  ujian, pembahasan, ilustrasi, desain antarmuka, dan teks, merupakan hak kekayaan
                  intelektual milik PintuASN atau pembuat kontennya, dan dilindungi oleh Undang-Undang
                  No. 28 Tahun 2014 tentang Hak Cipta.
                </p>
                <p>
                  Anda diberikan lisensi terbatas, non-eksklusif, dan tidak dapat dipindahtangankan
                  untuk mengakses dan menggunakan Konten semata-mata untuk keperluan belajar pribadi
                  selama masa berlangganan aktif Anda.
                </p>
                <p>
                  Tidak ada bagian dari Konten yang boleh direproduksi, didistribusikan, diunggah ke
                  media sosial, dijual, atau digunakan untuk keperluan komersial tanpa izin tertulis
                  dari PintuASN.
                </p>
              </Section>

              {/* 8. Disclaimer */}
              <Section id="disclaimer" title="8. Disclaimer & Batasan Tanggung Jawab">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                  <div>
                    <p className="font-semibold text-gray-800">Tidak Ada Jaminan Kelulusan</p>
                    <p className="text-sm text-gray-600">
                      PintuASN adalah platform latihan simulasi. Kami tidak memberikan jaminan,
                      ekspres maupun tersirat, bahwa penggunaan layanan ini akan menghasilkan
                      kelulusan ujian SKD CPNS. Hasil ujian resmi sepenuhnya ditentukan oleh BKN
                      dan instansi terkait.
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Akurasi Konten</p>
                    <p className="text-sm text-gray-600">
                      Meskipun kami berupaya menjaga akurasi soal dan pembahasan, kami tidak menjamin
                      bahwa seluruh Konten bebas dari kesalahan. Pengguna disarankan untuk selalu
                      merujuk pada sumber resmi BKN untuk informasi yang bersifat definitif.
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Ketersediaan Layanan</p>
                    <p className="text-sm text-gray-600">
                      Kami tidak menjamin bahwa Layanan akan selalu tersedia tanpa gangguan. Kami
                      tidak bertanggung jawab atas kerugian yang timbul akibat gangguan layanan,
                      pemeliharaan, atau keadaan di luar kendali kami (force majeure).
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Batasan Tanggung Jawab</p>
                    <p className="text-sm text-gray-600">
                      Sejauh diizinkan oleh hukum yang berlaku, PintuASN tidak bertanggung jawab atas
                      kerugian tidak langsung, insidental, atau konsekuensial yang timbul dari
                      penggunaan atau ketidakmampuan menggunakan Layanan.
                    </p>
                  </div>
                </div>
              </Section>

              {/* 9. Penghentian */}
              <Section id="penghentian" title="9. Penghentian Layanan">
                <p>
                  Anda dapat menghentikan penggunaan layanan kapan saja dengan tidak mengakses platform.
                  Untuk menghapus akun, gunakan fitur Hapus Akun di halaman profil atau hubungi kami
                  di <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#0ea5e9] underline">{CONTACT_EMAIL}</a>.
                </p>
                <p>
                  Kami berhak menangguhkan atau menghentikan akun Anda jika terdapat pelanggaran
                  terhadap Syarat & Ketentuan ini, tanpa pemberitahuan sebelumnya dan tanpa
                  kewajiban pengembalian dana atas sisa masa berlangganan.
                </p>
                <p>
                  Penghentian akun tidak menghapus kewajiban Anda atas tindakan yang telah dilakukan
                  sebelum penghentian tersebut.
                </p>
              </Section>

              {/* 10. Hukum */}
              <Section id="hukum" title="10. Hukum yang Berlaku">
                <p>
                  Syarat & Ketentuan ini diatur oleh dan ditafsirkan sesuai dengan hukum Republik
                  Indonesia. Setiap sengketa yang timbul sehubungan dengan Syarat & Ketentuan ini
                  akan diselesaikan melalui musyawarah untuk mufakat. Apabila tidak tercapai
                  kesepakatan, sengketa akan diselesaikan melalui pengadilan yang berwenang di
                  Indonesia.
                </p>
              </Section>

              {/* 11. Perubahan */}
              <Section id="perubahan" title="11. Perubahan Syarat">
                <p>
                  Kami dapat memperbarui Syarat & Ketentuan ini dari waktu ke waktu. Perubahan akan
                  diberitahukan melalui email yang terdaftar atau melalui pengumuman di platform
                  minimal 7 (tujuh) hari sebelum berlaku efektif, kecuali untuk perubahan yang
                  diperlukan segera karena alasan hukum atau keamanan.
                </p>
                <p>
                  Dengan melanjutkan penggunaan Layanan setelah perubahan berlaku, Anda dianggap
                  telah menyetujui Syarat & Ketentuan yang diperbarui.
                </p>
              </Section>

              {/* 12. Kontak */}
              <Section id="kontak" title="12. Kontak Kami">
                <p>
                  Untuk pertanyaan, keberatan, atau laporan terkait Syarat & Ketentuan ini, silakan
                  hubungi kami:
                </p>
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 space-y-1 text-sm">
                  <p><strong>PintuASN</strong></p>
                  <p>
                    Email:{' '}
                    <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#0ea5e9] underline">
                      {CONTACT_EMAIL}
                    </a>
                  </p>
                  <p>
                    Website:{' '}
                    <a href={APP_URL} className="text-[#0ea5e9] underline">{APP_URL}</a>
                  </p>
                </div>
              </Section>
            </>
          );
        })()}

        {/* Footer links */}
        <div className="mt-12 pt-8 border-t border-gray-200 flex flex-wrap gap-4 text-sm text-gray-500">
          <Link href="/kebijakan-privasi" className="text-[#0ea5e9] hover:underline">
            Kebijakan Privasi
          </Link>
          <span>·</span>
          <Link href="/" className="hover:underline">Kembali ke Beranda</Link>
        </div>
      </div>
    </div>
  );
}
