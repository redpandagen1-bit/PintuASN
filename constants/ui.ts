// HANYA UI labels dan messages - JANGAN TAMBAH YANG LAIN

export const BUTTON_LABELS = {
  START_EXAM: 'Mulai Tryout',
  RESUME_EXAM: 'Lanjutkan Tryout',
  SUBMIT: 'Submit Ujian',
  PREVIOUS: 'Sebelumnya',
  NEXT: 'Selanjutnya',
  FINISH: 'Selesai',
  REVIEW: 'Lihat Pembahasan',
  BACK_TO_DASHBOARD: 'Kembali ke Dashboard',
  SAVE: 'Simpan Jawaban',
  FLAG: 'Tandai Soal',
  UNFLAG: 'Hapus Tanda',
} as const;

export const CATEGORY_LABELS = {
  TWK: 'Tes Wawasan Kebangsaan',
  TIU: 'Tes Intelegensi Umum',
  TKP: 'Tes Karakteristik Pribadi',
} as const;

export const STATUS_LABELS = {
  UNANSWERED: 'Belum Dijawab',
  ANSWERED: 'Sudah Dijawab',
  FLAGGED: 'Ditandai',
  CURRENT: 'Soal Ini',
} as const;

export const TOAST_MESSAGES = {
  SAVE_SUCCESS: 'Jawaban berhasil disimpan',
  SAVE_ERROR: 'Gagal menyimpan jawaban',
  SUBMIT_SUCCESS: 'Ujian berhasil disubmit',
  SUBMIT_ERROR: 'Gagal submit ujian',
  TIME_WARNING: 'Waktu tersisa 5 menit!',
  TIME_UP: 'Waktu habis! Ujian otomatis disubmit.',
} as const;

export const DIALOG_MESSAGES = {
  CONFIRM_SUBMIT: 'Apakah Anda yakin ingin submit ujian? Pastikan semua jawaban sudah benar.',
  CONFIRM_EXIT: 'Keluar dari ujian? Progress Anda akan disimpan.',
  TIME_WARNING: 'Waktu Anda tinggal 5 menit!',
} as const;
