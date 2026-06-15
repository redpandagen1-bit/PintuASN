-- Penanda slot kisi-kisi yang isinya belum di-upload (tampil "Segera hadir"
-- di halaman materi, dan diisi otomatis saat admin meng-upload materi via JSON).
ALTER TABLE material_modules ADD COLUMN IF NOT EXISTS is_placeholder boolean NOT NULL DEFAULT false;
