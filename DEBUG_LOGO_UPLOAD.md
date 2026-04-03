# 🔧 Debugging Guide - Logo Upload Issue

Aku sudah prepare improved script dengan detailed logging. Ikuti langkah ini untuk identify dan fix masalahnya.

---

## 📋 **Step 1: Replace Google Apps Script**

1. Buka [Google Apps Script Editor](https://script.google.com)
2. Cari project untuk MLBB Cup 2026
3. **Hapus semua code lama** di file utama
4. **Copy-paste semua code dari file:**
   - `IMPROVED_APPS_SCRIPT.gs` yang sudah dibuat

5. **Simpan** (Ctrl+S)

---

## 🧪 **Step 2: Test Folder Access**

1. Di Apps Script Editor, buka **Executions** tab (ikon ⏱️)
2. Clear history dulu (optional)
3. Di code editor, pilih function dropdown → pilih `testFolderAccess`
4. Klik **Run** ▶️
5. Tunggu selesai dan lihat hasilnya

**Expected result:**
```
✅ Folder ditemukan: Upload Logo MLBB
```

**Jika error:**
```
❌ Folder tidak ditemukan: File not found
```

### 🔴 Jika error, action:
- **Cek DRIVE_FOLDER_ID** - Pastikan ID benar
- **Share folder** - Klik folder di Google Drive → Share → Masukkan email akun Google Apps Script
- **Retry test**

---

## 🧪 **Step 3: Test Save Data (tanpa logo)**

1. Pilih function dropdown → pilih `testSaveData`
2. Klik **Run** ▶️
3. Lihat **Executions** tab → klik execution terbaru untuk lihat logs
4. Cek Google Sheets - apakah ada baris baru?

---

## 🧪 **Step 4: Test Full dengan Logo**

Kali ini gunakan form website untuk test dengan logo:

1. **Buka Browser Console** - Press `F12` → Console tab
2. Buka halaman pendaftaran: `pendaftaran.html`
3. **Isi form lengkap** (termasuk upload logo)
4. **Klik submit**
5. **Lihat Console** - akan keluar detailed logs:

```
📝 Form submitted, validating...
✅ Form validation passed
📦 Collecting form data...
✅ Form data collected: ['timestamp', 'teamName', ...]
🖼️ Logo file detected: logo.png
🖼️ Converting file to base64: logo.png (15000 bytes, image/png)
✅ Base64 conversion done: ~11 KB
📤 Submitting to Google Sheets...
📤 Mengirim data ke Google Apps Script...
✅ Request terkirim ke Google Apps Script
```

---

## 📊 **Step 5: Check Google Apps Script Logs**

1. Di Apps Script Editor, buka **Executions** tab
2. Klik execution terbaru (waktu paling muda)
3. Lihat **Logs** section - harus ada detail seperti:

```
[3/3/2026, 2:30:45 PM] === REQUEST DITERIMA ===
[3/3/2026, 2:30:45 PM] Team: Evos Legends
[3/3/2026, 2:30:45 PM] Logo Ada: YA
[3/3/2026, 2:30:45 PM] 🖼️ Mulai upload logo...
[3/3/2026, 2:30:46 PM] 📁 DRIVE_FOLDER_ID: 1Kh4K3YbXbbLEKX_x-AkNgQRWX9t5t_wy
[3/3/2026, 2:30:46 PM] ✅ Folder ditemukan: Upload Logo MLBB
[3/3/2026, 2:30:46 PM] 📊 Base64 size: 15000 characters (~11 KB)
[3/3/2026, 2:30:46 PM] 📄 File name: Evos_Legends_logo_1704110445000.png
[3/3/2026, 2:30:46 PM] 🔄 Decoding base64...
[3/3/2026, 2:30:46 PM] ✅ Base64 decoded: 10500 bytes
[3/3/2026, 2:30:46 PM] 🔄 Creating blob...
[3/3/2026, 2:30:46 PM] ✅ Blob created: 10500 bytes
[3/3/2026, 2:30:46 PM] 🔄 Uploading to Drive...
[3/3/2026, 2:30:47 PM] ✅ File uploaded: 1abcdef123456
[3/3/2026, 2:30:47 PM] 🔄 Setting share permission...
[3/3/2026, 2:30:47 PM] ✅ Share permission set
[3/3/2026, 2:30:47 PM] ✅ Direct link: https://drive.google.com/uc?id=1abcdef123456
[3/3/2026, 2:30:47 PM] ✅ Logo berhasil diupload: https://drive.google.com/uc?id=1abcdef123456
[3/3/2026, 2:30:47 PM] ✅ URL logo disimpan di Sheets
[3/3/2026, 2:30:47 PM] === REQUEST SELESAI ===
```

---

## 🚨 **Troubleshooting: Common Errors**

### ❌ Error: "Folder tidak ditemukan: File not found"
**Penyebab:** DRIVE_FOLDER_ID tidak valid atau sudah dihapus

**Fix:**
1. Buka Google Drive
2. Buat folder baru: "Upload Logo MLBB" (atau nama lain)
3. Klik kanan → Get link → copy URL:
   ```
   https://drive.google.com/drive/folders/[FOLDER_ID]?usp=sharing
   ```
4. Ambil **FOLDER_ID** (bagian setelah `/folders/`)
5. Update di script:
   ```javascript
   const DRIVE_FOLDER_ID = 'PASTE_FOLDER_ID_BARU_DISINI';
   ```
6. Save dan Deploy (lihat step di bawah)

---

### ❌ Error: "You do not have permission"
**Penyebab:** Folder ada tapi Apps Script tidak punya akses

**Fix:**
1. Buka folder di Google Drive
2. Klik **Share** (tombol biru di atas)
3. Tambahkan email Anda (yang digunakan untuk Google Apps Script):
   - Email biasanya: `yourname@gmail.com`
   - Set permission: **Editor**
4. Share
5. Retry test

---

### ❌ Error: "Base64 decode error"
**Penyebab:** Data from form corrupted oder incomplete

**Action:**
1. Cek di browser console - berapa size base64?
   - Jika > 25 MB → terlalu besar
   - Upload file lebih kecil (<2 MB)
2. Cek file format - harus JPG atau PNG
3. Retry

---

### ❌ Data masuk Sheet tapi tidak ada URL logo
**Penyebab:** Logo gagal upload (silent fail) atau permission issue

**Fix:**
1. Lihat error di Execution logs
2. Jika ada error → fix sesuai troubleshooting di atas
3. Retry form submission

---

## 🚀 **Step 6: Deploy (jika ada changes)**

Jika Anda modifikasi script:

1. Klik **Deploy** (ikon 🔗 di atas)
2. Klik **New deployment** (jika belum ada Web App deployment)
3. Type: **Web app**
4. Configuration:
   - Execute as: **Me** (email akun Anda)
   - Who has access: **Anyone**
5. **Deploy**
6. Copy URL yang muncul (format: `https://script.google.com/macros/s/AKfycby3.../exec`)
7. **Jangan ganti** - URL di `registration.js` sudah benar

---

## 📝 **Checklist Final**

- [ ] Script baru sudah di-copy ke Apps Script
- [ ] Test folder access OK (✅ Folder ditemukan)
- [ ] Test save data OK (data ada di Sheet)
- [ ] Test full dengan logo OK
- [ ] Google Apps Script logs tidak ada error
- [ ] URL logo tersimpan di Sheet column R (Logo URL)
- [ ] Link ke Google Drive bisa di-klik dari Sheet

---

## 📞 **Jika masih error?**

1. **Screenshot error log** dari browser console
2. **Screenshot dari Apps Script Executions** logs
3. **Cek:**
   - SPREADSHEET_ID benar?
   - DRIVE_FOLDER_ID benar?
   - Folder sudah di-share ke akun Apps Script?
   - Web App URL masih sama?

---

Semoga solve! Let me know kalo masih ada issue. 🎯
