# 🎮 MLBB CUP 2026 - Tournament Website

Website tournament Mobile Legends: Bang Bang untuk acara BEM. Dibuat dengan HTML, CSS, dan JavaScript murni.

## 📁 Struktur Project

```
UEST/
├── index.html          # Halaman utama (Home)
├── acara.html          # Halaman info acara & rules
├── pendaftaran.html    # Halaman form pendaftaran
├── bracket.html        # Halaman bracket tournament
├── css/
│   ├── style.css       # CSS utama
│   └── bracket.css     # CSS khusus bracket
├── js/
│   ├── main.js         # JavaScript utama
│   ├── registration.js # Handler form pendaftaran
│   └── bracket.js      # Sistem bracket tournament
└── images/             # Folder untuk gambar (logo, hero bg, dll)
```

## 🚀 Cara Menjalankan

### Opsi 1: Buka Langsung
Cukup double-click file `index.html` untuk membuka di browser.

### Opsi 2: Dengan Live Server (Recommended)
1. Install extension "Live Server" di VS Code
2. Klik kanan pada `index.html`
3. Pilih "Open with Live Server"

### Opsi 3: Dengan Python
```bash
# Python 3
python -m http.server 8000

# Lalu buka http://localhost:8000
```

## 🔧 Konfigurasi

### Setup Google Sheets Integration

Untuk menghubungkan form pendaftaran ke Google Sheets, ikuti langkah di file `SETUP_GOOGLE_SHEETS.md`.

### Kustomisasi

1. **Nama Tournament**: Edit di setiap file HTML
2. **Tanggal & Jadwal**: Edit di `index.html` dan `acara.html`
3. **Hadiah**: Edit di section prize di `index.html`
4. **Kontak**: Edit di footer semua halaman
5. **Warna**: Edit CSS variables di `css/style.css`

## 🌐 Deploy ke Vercel (Gratis)

1. Buat akun di [vercel.com](https://vercel.com)
2. Install Vercel CLI: `npm i -g vercel`
3. Jalankan di folder project: `vercel`
4. Ikuti instruksi di terminal
5. Website kamu akan online!

Atau lebih mudah:
1. Push project ke GitHub
2. Login ke Vercel dengan GitHub
3. Import repository
4. Done! 🎉

## 📝 Fitur

- ✅ Responsive design (mobile-friendly)
- ✅ Dark theme dengan aksen gold (MLBB style)
- ✅ Form pendaftaran dengan validasi
- ✅ Integrasi Google Sheets
- ✅ Sistem bracket tournament interaktif
- ✅ Tambah/hapus tim
- ✅ Acak posisi bracket
- ✅ Update skor pertandingan
- ✅ Export/import data bracket
- ✅ Data tersimpan di localStorage

## 📞 Kontak

Dibuat untuk acara BEM Tournament.

---

Made with ❤️ for MLBB Community
# UEST
