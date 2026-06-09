# Prompt: Generate Soal TIU Figural (JSON + SVG inline)

Pakai prompt ini di Claude untuk menghasilkan **banyak soal sekaligus** dalam **1 file JSON**.
Hasilnya tinggal di-upload di **Admin → Paket → Upload Soal CSV → tombol "Soal Figural (SVG)"**.

> Ganti bagian `{{...}}` sesuai kebutuhan, lalu kirim ke Claude.

---

## PROMPT (copy mulai dari sini)

Kamu adalah generator soal TIU figural untuk SKD CPNS. Buat **{{JUMLAH}} soal** figural
bertipe **{{TIPE: deret gambar / analogi gambar / rotasi / pencerminan / penambahan unsur}}**
dengan tingkat kesulitan **{{easy|medium|hard}}**, untuk posisi **{{POSISI: mis. 31–{{31+JUMLAH-1}}}}**
(TIU = posisi 31–65).

ATURAN OUTPUT — WAJIB DIPATUHI:
1. Keluarkan **HANYA satu array JSON**. Tanpa teks pembuka, tanpa penjelasan, tanpa ```code fence```.
2. Setiap elemen array = 1 soal, dengan struktur PERSIS:
   ```
   {
     "position": <angka 31–65, unik per soal>,
     "content": "<kalimat perintah singkat, mis. 'Pilih gambar yang melanjutkan pola.'>",
     "question_svg": "<svg ...>...</svg>",
     "correct_answer": "<A|B|C|D|E>",
     "difficulty": "{{easy|medium|hard}}",
     "explanation": "<penjelasan singkat alasan jawaban benar>",
     "explanation_svg": "<svg ...>...</svg>   // OPSIONAL, boleh dihapus jika tak perlu",
     "choices": [
       { "label": "A", "svg": "<svg ...>...</svg>" },
       { "label": "B", "svg": "<svg ...>...</svg>" },
       { "label": "C", "svg": "<svg ...>...</svg>" },
       { "label": "D", "svg": "<svg ...>...</svg>" },
       { "label": "E", "svg": "<svg ...>...</svg>" }
     ]
   }
   ```
3. ATURAN SVG (KRITIS agar JSON tetap valid & aman):
   - Gunakan **tanda kutip tunggal** untuk semua atribut SVG, contoh: `<rect x='10' y='10' width='30' height='30' fill='#1B2B5E'/>`. JANGAN gunakan tanda kutip ganda di dalam SVG.
   - Selalu sertakan `viewBox='0 0 100 100'` dan jangan set width/height absolut (biar responsif).
   - Hanya gunakan elemen menggambar: `path, rect, circle, ellipse, line, polygon, polyline, g, text`. 
   - DILARANG: `<script>`, atribut event (`onclick`, `onload`, dll), `<foreignObject>`, `<!ENTITY`, `<image href=...>` ke URL eksternal, dan `javascript:`.
   - Buat gambar **self-contained, sederhana, monokrom atau ≤3 warna**, jelas terbaca di kotak kecil (~80–96px).
   - Ukuran tiap SVG ringkas (hindari path super-panjang yang tidak perlu).
4. Pastikan **jawaban benar konsisten** dengan pola pada `question_svg` dan ke-5 pilihan.
   Hanya **satu** pilihan yang benar; 4 lainnya pengecoh yang masuk akal.
5. `position` tiap soal harus **unik** dan berurutan sesuai rentang yang diminta.
6. Pastikan keseluruhan output **JSON yang valid** (uji secara mental: bisa di-`JSON.parse`).

CONTOH SATU ELEMEN (ikuti gaya ini, kutip tunggal di SVG):
```
{
  "position": 31,
  "content": "Pilih gambar yang melanjutkan pola.",
  "question_svg": "<svg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'><rect x='20' y='20' width='60' height='60' fill='none' stroke='#1B2B5E' stroke-width='4'/><line x1='20' y1='20' x2='80' y2='80' stroke='#1B2B5E' stroke-width='4'/></svg>",
  "correct_answer": "B",
  "difficulty": "medium",
  "explanation": "Garis diagonal berputar 45 derajat searah jarum jam tiap langkah.",
  "choices": [
    { "label": "A", "svg": "<svg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'><rect x='20' y='20' width='60' height='60' fill='none' stroke='#1B2B5E' stroke-width='4'/><line x1='50' y1='20' x2='50' y2='80' stroke='#1B2B5E' stroke-width='4'/></svg>" },
    { "label": "B", "svg": "<svg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'><rect x='20' y='20' width='60' height='60' fill='none' stroke='#1B2B5E' stroke-width='4'/><line x1='80' y1='20' x2='20' y2='80' stroke='#1B2B5E' stroke-width='4'/></svg>" },
    { "label": "C", "svg": "<svg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'><rect x='20' y='20' width='60' height='60' fill='none' stroke='#1B2B5E' stroke-width='4'/><line x1='20' y1='50' x2='80' y2='50' stroke='#1B2B5E' stroke-width='4'/></svg>" },
    { "label": "D", "svg": "<svg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'><circle cx='50' cy='50' r='30' fill='none' stroke='#1B2B5E' stroke-width='4'/></svg>" },
    { "label": "E", "svg": "<svg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'><rect x='20' y='20' width='60' height='60' fill='none' stroke='#1B2B5E' stroke-width='4'/></svg>" }
  ]
}
```

Sekarang hasilkan array JSON untuk {{JUMLAH}} soal sesuai aturan di atas.

---

## Cara pakai hasilnya
1. Simpan output Claude sebagai file `.json` (mis. `soal-figural-batch1.json`).
2. Buka **Admin → Paket → (pilih paket) → Upload Soal CSV → tombol "Soal Figural (SVG)"**.
3. Pilih file `.json` → cek **preview** (soal, A–E, jawaban benar ✓, pembahasan).
4. Klik **Simpan** → soal masuk ke posisi yang diminta. Posisi yang sudah terisi otomatis dilewati.

## Catatan
- Penyimpanan bersifat **all-or-nothing**: jika ada 1 soal bermasalah, perbaiki dulu (tidak ada yang tersimpan sampai semua valid).
- Bisa dicicil per batch (mis. 5–10 soal sekali generate) untuk menjaga kualitas gambar.
- `content` (teks perintah) boleh dikosongkan kalau soal murni gambar.
