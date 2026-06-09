# Prompt Soal TIU Figural → 1 File JSON

Pakai prompt ini di Claude untuk membuat **beberapa soal figural sekaligus** dalam **1 file JSON**.
Hasilnya tinggal di-upload di **Admin → Paket → Upload Soal CSV → tombol "Soal Figural (SVG)"**.

> Atur dulu 3 field di bagian **YANG BISA KAMU EDIT**, lalu copy seluruh blok PROMPT ke Claude.
>
> Contoh kasus: Paket Tryout 48 kurang 5 soal TIU di nomor **61–65**. Set `JUMLAH_SOAL = 5`
> dan `NOMOR_SOAL = 61-65`. Saat di-upload, soal otomatis masuk ke posisi 61–65 yang kosong.

---

## PROMPT (copy mulai dari sini)

Buat soal figural CPNS (TIU) lengkap dengan jawaban dan pembahasan, lalu keluarkan **semuanya sebagai SATU file JSON**.

### YANG BISA KAMU EDIT (atur sebelum mengerjakan)
- `JUMLAH_SOAL = 5`
- `NOMOR_SOAL = 61-65`   ← rentang (mis. `61-65`) atau daftar (mis. `61,62,63,64,65`). Jumlah angkanya **harus sama** dengan `JUMLAH_SOAL`.
- `TINGKAT = sedang`     ← `mudah` | `sedang` | `sulit`

### LARANGAN KERAS (penting — jangan dilanggar)
- JANGAN membuat aplikasi, React, HTML, JavaScript, kuis interaktif, tombol, atau apa pun yang dijawab di dalam Claude.
- JANGAN membuat artifact interaktif. Semua gambar HANYA berupa SVG statis yang **ditempel INLINE di dalam JSON** (bukan file SVG terpisah).
- JANGAN bertanya balik atau minta konfirmasi. Langsung kerjakan sekarang.
- Output **HANYA satu dokumen JSON** (boleh sebagai artifact tipe `application/json`). Tidak ada teks lain di luar JSON, tanpa ```code fence```.

### FORMAT OUTPUT (wajib persis)
Satu **array JSON**. Tiap elemen = 1 soal, dengan struktur PERSIS:
```
{
  "position": <ambil dari NOMOR_SOAL, satu nomor per soal, berurutan & unik>,
  "content": "<kalimat perintah singkat, mis. 'Pilih gambar yang melanjutkan pola.'>",
  "question_svg": "<svg ...>...</svg>",
  "correct_answer": "<A|B|C|D|E>",
  "difficulty": "<easy|medium|hard sesuai TINGKAT: mudah=easy, sedang=medium, sulit=hard>",
  "explanation": "<pembahasan langkah-demi-langkah + alasan tiap pengecoh salah + sebutkan Topik. Bahasa Indonesia.>",
  "explanation_svg": "<svg ...>...</svg>",   // OPSIONAL — hapus field ini jika tidak membantu
  "choices": [
    { "label": "A", "svg": "<svg ...>...</svg>" },
    { "label": "B", "svg": "<svg ...>...</svg>" },
    { "label": "C", "svg": "<svg ...>...</svg>" },
    { "label": "D", "svg": "<svg ...>...</svg>" },
    { "label": "E", "svg": "<svg ...>...</svg>" }
  ]
}
```
- Buat **tepat `JUMLAH_SOAL`** elemen. Petakan `position` ke `NOMOR_SOAL` (soal ke-1 → nomor pertama, dst).
- Tepat **satu** `correct_answer` per soal; 5 pilihan A–E.

### STANDAR TEKNIS SVG (patuhi persis)
- **Gunakan tanda kutip tunggal** untuk SEMUA atribut SVG (mis. `stroke='#111111'`), JANGAN kutip ganda — supaya JSON tetap valid tanpa escaping.
- Plain SVG statis. DILARANG: `<script>`, atribut event (`onload` dll), `<animate>`, `<foreignObject>`, `<image>` raster, href/font/CSS eksternal, `<!ENTITY>`, `javascript:`.
- **Warna tunggal hitam `#111111`** untuk semua garis & isi. **Background transparan** (tidak ada rect latar berwarna).
- Garis: `stroke='#111111' stroke-width='4' stroke-linecap='round' stroke-linejoin='round' fill='none'`.
- Bentuk solid (titik/bidang penuh): `fill='#111111'`.
- Border kotak/sel: `<rect ... stroke='#111111' stroke-width='3' fill='none'/>`.
- Basis 1 sel = **120×120 unit**, padding dalam 16 unit (area gambar ±88×88 di tengah).
- Tanda tanya: `<text x='60' y='78' font-family='sans-serif' font-weight='700' font-size='56' fill='#111111' text-anchor='middle'>?</text>` (sesuaikan posisi ke tengah selnya).
- **JANGAN tulis huruf A–E di dalam SVG pilihan** (label dipasang oleh aplikasi).
- Set `viewBox` sesuai bentuk (tidak perlu set `width`/`height`):
  - Deret 1×3 → `viewBox='0 0 360 120'` · 1×4 → `0 0 480 120` · 1×5 → `0 0 600 120`
  - Matriks 2×2 → `0 0 240 240` · 2×3 → `0 0 360 240` · 3×3 → `0 0 360 360`
  - Analogi (bentuk1 → bentuk2 ⟹ bentuk3 → ?) → `0 0 560 120`
  - Pencerminan (bentuk + garis cermin putus-putus) → `0 0 280 120`
  - Lipatan kertas (3–4 tahap) → `0 0 600 160`
  - Jaring-jaring kubus (stimulus) → `0 0 360 300`
  - **Tiap pilihan A–E → `0 0 120 120`** (default 1 sel). Untuk tipe kompleks (kubus isometrik / gambar tersembunyi) boleh `0 0 140 140`, asalkan **seragam** untuk kelima pilihan.
  - `explanation_svg` (opsional) → `0 0 480 240`

### TIPE SOAL FIGURAL (pilih & variasikan antar soal)
Untuk tiap soal, pilih SATU tipe di bawah. **Jangan** memakai tipe yang sama dua kali berturut-turut; kalau `JUMLAH_SOAL ≥ 5`, usahakan mencakup beragam tipe. Tiap tipe menjelaskan cara menyusun `question_svg`, `content`, dan `choices`:

1. **Serial / Deret** — `question_svg`: 3–5 sel berderet, sel terakhir berisi `?`. `content`: "Pilih gambar yang melanjutkan pola." `choices`: kandidat sel berikutnya.
2. **Analogi** — `question_svg`: `bentuk1 → bentuk2  ⟹  bentuk3 → ?` (pakai panah `→` dari path, pemisah `⟹`/dua titik di tengah). `content`: "Gambar 1 berhubungan dengan gambar 2 seperti gambar 3 dengan …". `choices`: hasil analogi pada bentuk3.
3. **Ketidaksamaan (yang berbeda)** — fokus pada KELIMA pilihan; empat mengikuti satu aturan, satu melanggar. `question_svg`: header netral sederhana (mis. tiga titik kecil `• • •`). `content`: "Pilih gambar yang TIDAK termasuk kelompok (berbeda pola)." `correct_answer`: gambar yang menyimpang.
4. **Matriks 3×3** — `question_svg`: grid 3×3, satu sel (umumnya kanan-bawah) berisi `?`. `content`: "Lengkapi sel kosong pada matriks." `choices`: isi sel yang hilang.
5. **Pencerminan** — `question_svg`: bentuk + **garis cermin putus-putus** (vertikal/horizontal/diagonal). `content`: "Pilih bayangan cermin dari gambar terhadap garis." `choices`: kandidat bayangan.
6. **Rotasi** — `question_svg`: bentuk + indikator arah (panah lengkung). `content`: "Pilih hasil rotasi 90°/180° searah jarum jam." `choices`: bentuk dengan orientasi berbeda.
7. **Lipatan & lubang kertas** — `question_svg`: urutan lipatan kertas lalu titik lubang (lingkaran kecil terisi). `content`: "Jika kertas dilipat lalu dilubangi seperti gambar, pola lubang saat dibuka adalah …". `choices`: pola lubang pada kertas terbuka (grid titik). *(sulit)*
8. **Jaring-jaring kubus** — `question_svg`: jaring 2D dengan motif berbeda tiap sisi. `content`: "Kubus yang dapat dibentuk dari jaring berikut adalah …". `choices`: kubus isometrik (3 sisi tampak, pakai polygon). *(sulit)*
9. **Penyusunan potongan** — `question_svg`: beberapa potongan terpisah. `content`: "Bangun yang tersusun dari semua potongan adalah …". `choices`: bangun gabungan.
10. **Penyelesaian / simetri** — `question_svg`: bentuk separuh atau pola tak lengkap dengan `?`. `content`: "Lengkapi gambar agar simetris / sesuai pola." `choices`: bagian pelengkap.
11. **Gambar tersembunyi** — `question_svg`: satu bentuk target kecil di kotak atas. `content`: "Pada gambar manakah bentuk di atas tersembunyi seutuhnya?" `choices`: 5 gambar kompleks; jawaban = yang memuat target utuh.

> Hindari tipe "hitung jumlah bentuk" (jawabannya angka, lebih cocok soal teks/CSV — bukan figural gambar).

### ATURAN TRANSFORMASI (campur 1–3 sesuai kesulitan)
rotasi (45°/90°/135°/180°) · pencerminan (horizontal/vertikal/diagonal) · translasi/pergeseran · penambahan atau pengurangan elemen · perubahan ukuran (membesar/mengecil bertahap) · perubahan jumlah elemen (deret aritmetik/Fibonacci) · perubahan isian (kosong → terisi → bersilang) · perubahan arsiran/tekstur · perputaran melingkar elemen di dalam bentuk · perpindahan posisi titik/penanda · overlay/gabungan dua bentuk · substitusi bentuk mengikuti pola · perubahan orientasi panah · perubahan jumlah sisi poligon · simetri putar.
- Mudah = 1 aturan · Sedang = 1–2 aturan · Sulit = 2–3 aturan, dengan minimal satu twist tak terduga.

### KOSAKATA BENTUK (variasikan antar soal)
garis lurus & diagonal · panah · segitiga · persegi · persegi panjang · jajar genjang · trapesium · belah ketupat · segi lima/enam · lingkaran · setengah lingkaran · busur · elips · bintang (4/5/6 sudut) · titik/bulatan terisi · grid titik & pola dadu · arsiran garis · spiral · bentuk "L"/"T"/"Z" · tanda plus/silang · gabungan/overlay bentuk · bentuk organik bebas.

### VARIASI ANTAR-SOAL DALAM SATU FILE
- Jika `JUMLAH_SOAL > 1`: setiap nomor memakai **tipe, aturan transformasi, dan kosakata bentuk yang berbeda** — jangan monoton.
- Hindari pola paling klise; selalu sisipkan minimal satu twist agar kreatif.
- Sebar tingkat kesulitan transformasi sesuai `TINGKAT`, dan jaga agar tetap logis & berjawaban tunggal.

### SYARAT KUALITAS
- Logika konsisten & terbukti; tepat satu jawaban benar.
- 4 pengecoh masuk akal (mewakili kesalahan berpikir umum), bukan asal beda.
- Semua pilihan seragam gaya & ukuran (1 sel 120×120), terbaca jelas walau ditampilkan kecil (~110px).
- Keseluruhan output adalah **JSON valid** (bisa di-`JSON.parse`).

### CONTOH SATU ELEMEN (ikuti gaya ini — kutip tunggal di SVG)
```
{
  "position": 61,
  "content": "Pilih gambar yang melanjutkan pola.",
  "question_svg": "<svg viewBox='0 0 360 120' xmlns='http://www.w3.org/2000/svg'><line x1='20' y1='100' x2='100' y2='20' stroke='#111111' stroke-width='4' stroke-linecap='round'/><line x1='140' y1='20' x2='220' y2='100' stroke='#111111' stroke-width='4' stroke-linecap='round'/><text x='300' y='78' font-family='sans-serif' font-weight='700' font-size='56' fill='#111111' text-anchor='middle'>?</text></svg>",
  "correct_answer": "B",
  "difficulty": "medium",
  "explanation": "Garis berputar 90 derajat searah jarum jam tiap langkah, jadi sel ketiga adalah garis vertikal. Topik: deret gambar (rotasi). Pengecoh A (diagonal) dan C (horizontal) salah arah, D & E bukan garis tunggal.",
  "choices": [
    { "label": "A", "svg": "<svg viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'><line x1='20' y1='100' x2='100' y2='20' stroke='#111111' stroke-width='4' stroke-linecap='round'/></svg>" },
    { "label": "B", "svg": "<svg viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'><line x1='60' y1='20' x2='60' y2='100' stroke='#111111' stroke-width='4' stroke-linecap='round'/></svg>" },
    { "label": "C", "svg": "<svg viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'><line x1='20' y1='60' x2='100' y2='60' stroke='#111111' stroke-width='4' stroke-linecap='round'/></svg>" },
    { "label": "D", "svg": "<svg viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'><circle cx='60' cy='60' r='34' fill='none' stroke='#111111' stroke-width='4'/></svg>" },
    { "label": "E", "svg": "<svg viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'><rect x='30' y='30' width='60' height='60' fill='none' stroke='#111111' stroke-width='3'/></svg>" }
  ]
}
```

Sekarang langsung hasilkan **array JSON** berisi `JUMLAH_SOAL` soal dengan `position` sesuai `NOMOR_SOAL` di atas.

---

## Cara pakai hasilnya
1. Simpan output Claude sebagai file `.json` (mis. `tiu-61-65.json`).
2. Buka **Admin → Paket → (pilih paket) → Upload Soal CSV → tombol "Soal Figural (SVG)"**.
3. Pilih file `.json` → cek **preview** (soal, A–E, jawaban benar ✓, pembahasan).
4. Klik **Simpan** → soal masuk ke nomor yang kamu set. Nomor yang sudah terisi otomatis dilewati.

## Catatan
- Penyimpanan **all-or-nothing**: jika ada 1 soal bermasalah, perbaiki dulu (tidak ada yang tersimpan sampai semua valid).
- `NOMOR_SOAL` untuk TIU figural ada di rentang **31–65**. Pastikan jumlah nomor = `JUMLAH_SOAL`.
- Bisa dicicil per batch untuk menjaga kualitas gambar.
