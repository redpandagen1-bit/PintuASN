-- Samakan batas bucket 'question-images' dengan validasi aplikasi.
-- Sebelumnya bucket = 307200 (300 KB) sementara app memvalidasi 5 MB, sehingga
-- gambar 300 KB–5 MB lolos validasi app tapi ditolak Storage dengan error tidak jelas.
-- Sumber kebenaran ukuran di app: lib/upload-limits.ts (MAX_IMAGE_UPLOAD_BYTES).
--
-- allowed_mime_types diset agar sama persis dengan ALLOWED_TYPES di
-- app/api/admin/upload/image/route.ts (PNG, JPEG/JPG, WebP, SVG). Ini hanya
-- dicek saat upload — tidak ada dampak ke performa serving/render saat ujian.
-- Validasi keamanan SVG (tolak <script> dll.) tetap di app, tidak bisa di Storage.

UPDATE storage.buckets
SET
  file_size_limit = 2097152, -- 2 MB
  allowed_mime_types = ARRAY[
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    'image/svg+xml'
  ]
WHERE id = 'question-images';
