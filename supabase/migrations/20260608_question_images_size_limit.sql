-- Samakan batas ukuran bucket 'question-images' dengan validasi aplikasi (2 MB).
-- Sebelumnya bucket = 307200 (300 KB) sementara app memvalidasi 5 MB, sehingga
-- gambar 300 KB–5 MB lolos validasi app tapi ditolak Storage dengan error tidak jelas.
-- Sumber kebenaran ukuran di app: lib/upload-limits.ts (MAX_IMAGE_UPLOAD_BYTES).

UPDATE storage.buckets
SET file_size_limit = 2097152 -- 2 MB
WHERE id = 'question-images';
