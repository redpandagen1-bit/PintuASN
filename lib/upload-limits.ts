// Batas ukuran upload gambar soal — SATU sumber kebenaran.
// Nilai ini WAJIB sama dengan `file_size_limit` bucket Supabase Storage
// `question-images` (lihat supabase/migrations/20260608_question_images_size_limit.sql).
// Jika diubah, perbarui juga migration bucket-nya agar tidak ada mismatch
// (gambar lolos validasi app tapi ditolak Storage dengan error tidak jelas).
export const MAX_IMAGE_UPLOAD_BYTES = 2 * 1024 * 1024; // 2 MB
export const MAX_IMAGE_UPLOAD_LABEL = '2MB';
