// Konstanta dan tipe untuk halaman pembayaran

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'va' | 'qris' | 'ewallet' | 'cstore';
  bank?: string;
  adminFee: number;
  group: string;
}

export interface OrderData {
  orderId: string;
  packageName: string;
  basePrice: number;
  adminFee: number;
  discountAmount: number;
  referralCode: string | null;
  total: number;
  finalPrice: number;
  expiredAt: string;
  status: string;
  paymentMethod?: string;
  vaNumber?: string;
  qrisUrl?: string;
  ewalletUrl?: string;
  paymentCode?: string;
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'bri_va',     name: 'BRI',       type: 'va',      bank: 'bri',     adminFee: 4000, group: 'Bank Transfer' },
  { id: 'bca_va',     name: 'BCA',       type: 'va',      bank: 'bca',     adminFee: 4000, group: 'Bank Transfer' },
  { id: 'mandiri_va', name: 'Mandiri',   type: 'va',      bank: 'mandiri', adminFee: 4000, group: 'Bank Transfer' },
  { id: 'bni_va',     name: 'BNI',       type: 'va',      bank: 'bni',     adminFee: 4000, group: 'Bank Transfer' },
  { id: 'qris',       name: 'QRIS',      type: 'qris',                     adminFee: 0,    group: 'QRIS' },
  { id: 'gopay',      name: 'GoPay',     type: 'ewallet',                  adminFee: 0,    group: 'E-Wallet' },
  { id: 'shopeepay',  name: 'ShopeePay', type: 'ewallet',                  adminFee: 0,    group: 'E-Wallet' },
  { id: 'dana',       name: 'DANA',      type: 'ewallet',                  adminFee: 0,    group: 'E-Wallet' },
  { id: 'alfamart',   name: 'Alfamart',  type: 'cstore',                   adminFee: 2500, group: 'Convenience Store' },
  { id: 'indomaret',  name: 'Indomaret', type: 'cstore',                   adminFee: 2500, group: 'Convenience Store' },
];

export const METHOD_GROUPS = ['QRIS', 'Bank Transfer', 'E-Wallet', 'Convenience Store'] as const;

export const METHOD_LOGOS: Record<string, string> = {
  bri_va:     'https://upload.wikimedia.org/wikipedia/commons/6/68/BANK_BRI_logo.svg',
  bca_va:     'https://upload.wikimedia.org/wikipedia/commons/5/5c/Bank_Central_Asia.svg',
  mandiri_va: 'https://upload.wikimedia.org/wikipedia/commons/a/ad/Bank_Mandiri_logo_2016.svg',
  bni_va:     'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/BNI_logo.svg/320px-BNI_logo.svg.png',
  qris:       'https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo_QRIS.svg',
  gopay:      'https://upload.wikimedia.org/wikipedia/commons/8/86/Gopay_logo.svg',
  shopeepay:  'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Logo_ShopeePay.png/320px-Logo_ShopeePay.png',
  dana:       'https://upload.wikimedia.org/wikipedia/commons/7/72/Logo_dana_blue.svg',
  alfamart:   'https://upload.wikimedia.org/wikipedia/commons/d/d6/Alfamart_logo.svg',
  indomaret:  'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Indomaret_logo2022.svg/320px-Indomaret_logo2022.svg.png',
};

export const VA_INSTRUCTIONS: Record<string, { title: string; steps: string[] }[]> = {
  bri: [
    { title: 'ATM BRI', steps: ['Pilih menu utama → Transaksi Lain', 'Pilih Pembayaran → Lainnya → BRIVA', 'Masukkan nomor BRIVA dan pilih Benar', 'Konfirmasi jumlah dan merchant, pilih Ya', 'Pembayaran selesai, simpan bukti.'] },
    { title: 'BRImo (Mobile Banking)', steps: ['Login BRImo → Pembayaran → BRIVA', 'Masukkan nomor BRIVA', 'Konfirmasi detail, masukkan PIN', 'Pembayaran berhasil.'] },
  ],
  bca: [
    { title: 'ATM BCA', steps: ['Pilih Transaksi Lainnya → Transfer → ke Rek BCA Virtual Account', 'Masukkan nomor VA BCA', 'Konfirmasi detail transaksi, pilih Ya', 'Pembayaran selesai.'] },
    { title: 'myBCA / BCA Mobile', steps: ['Login myBCA → Transfer Dana → BCA Virtual Account', 'Masukkan nomor VA', 'Konfirmasi dan masukkan PIN', 'Selesai.'] },
  ],
  mandiri: [
    { title: 'Livin by Mandiri', steps: ['Login Livin → Bayar → Multipayment', 'Cari "Midtrans" sebagai penyedia', 'Masukkan kode pembayaran (VA number)', 'Konfirmasi dan masukkan PIN', 'Pembayaran selesai.'] },
    { title: 'ATM Mandiri', steps: ['Pilih Bayar/Beli → Lainnya → Lainnya → Multipayment', 'Masukkan kode perusahaan: 88608, lanjut masukkan VA number', 'Konfirmasi dan selesai.'] },
  ],
  bni: [
    { title: 'BNI Mobile Banking', steps: ['Login BNI Mobile → Transfer → Virtual Account Billing', 'Masukkan nomor Virtual Account', 'Konfirmasi dan masukkan PIN', 'Pembayaran berhasil.'] },
    { title: 'ATM BNI', steps: ['Pilih Menu Lain → Transfer → Rekening Tabungan', 'Masukkan nomor Virtual Account', 'Konfirmasi jumlah dan proses.'] },
  ],
};

export const CSTORE_INSTRUCTIONS: Record<string, { title: string; steps: string[] }[]> = {
  alfamart: [
    { title: 'Alfamart', steps: ['Kunjungi gerai Alfamart terdekat', 'Tunjukkan kode pembayaran ke kasir', 'Kasir akan proses pembayaran', 'Simpan struk sebagai bukti pembayaran.'] },
  ],
  indomaret: [
    { title: 'Indomaret', steps: ['Kunjungi gerai Indomaret terdekat', 'Informasikan kode pembayaran ke kasir', 'Kasir akan memproses transaksi', 'Simpan struk sebagai bukti.'] },
  ],
};

export function formatRupiah(n: number) {
  return 'Rp ' + n.toLocaleString('id-ID');
}
