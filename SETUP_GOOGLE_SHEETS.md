# 📊 Setup Google Sheets Integration

Panduan lengkap untuk menghubungkan form pendaftaran ke Google Sheets.

## 🎯 Alur Kerja

```
Form Website → Google Apps Script → Google Sheets
                                 → Google Drive (logo)
```

## 📝 Langkah-langkah Setup

### 1. Buat Google Spreadsheet

1. Buka [Google Sheets](https://sheets.google.com)
2. Buat spreadsheet baru
3. Beri nama: "MLBB Cup 2026 - Pendaftaran"
4. Buat header di baris pertama (A1 sampai seterusnya):

```
Timestamp | Nama Tim | Kategori | Sekolah | Nama Kapten | WA Kapten | ID MLBB Kapten | Player 2 | ID Player 2 | Player 3 | ID Player 3 | Player 4 | ID Player 4 | Player 5 | ID Player 5 | Cadangan | ID Cadangan | Logo URL
```

5. Catat **Spreadsheet ID** dari URL:
   ```
   https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
   ```

### 2. Buat Google Apps Script

1. Buka [Google Apps Script](https://script.google.com)
2. Klik "New Project"
3. Hapus kode default dan paste kode berikut:

```javascript
// Konfigurasi
const SPREADSHEET_ID = 'GANTI_DENGAN_SPREADSHEET_ID_KAMU';
const SHEET_NAME = 'Sheet1'; // Nama sheet
const DRIVE_FOLDER_ID = 'GANTI_DENGAN_FOLDER_ID_GOOGLE_DRIVE'; // Optional: untuk upload logo

/**
 * Handle POST request dari form
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // Simpan ke Spreadsheet
    saveToSheet(data);
    
    // Upload logo jika ada
    if (data.logoBase64) {
      const logoUrl = uploadLogo(data);
      // Update URL logo di spreadsheet
      updateLogoUrl(data.teamName, logoUrl);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle GET request (untuk testing)
 */
function doGet(e) {
  return ContentService
    .createTextOutput('MLBB Cup Registration API is running!')
    .setMimeType(ContentService.MimeType.TEXT);
}

/**
 * Simpan data ke spreadsheet
 */
function saveToSheet(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME);
  
  const row = [
    data.timestamp,
    data.teamName,
    data.category,
    data.school,
    data.captainName,
    data.captainPhone,
    data.captainMLBB,
    data.player2Name,
    data.player2MLBB,
    data.player3Name,
    data.player3MLBB,
    data.player4Name,
    data.player4MLBB,
    data.player5Name,
    data.player5MLBB,
    data.subName,
    data.subMLBB,
    '' // Logo URL (akan diupdate nanti)
  ];
  
  sheet.appendRow(row);
}

/**
 * Upload logo ke Google Drive
 */
function uploadLogo(data) {
  if (!data.logoBase64 || !DRIVE_FOLDER_ID) {
    return '';
  }
  
  try {
    const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    
    // Decode base64
    const blob = Utilities.newBlob(
      Utilities.base64Decode(data.logoBase64),
      data.logoMimeType,
      `${data.teamName}_logo_${Date.now()}.${data.logoFileName.split('.').pop()}`
    );
    
    // Upload file
    const file = folder.createFile(blob);
    
    // Set public access
    file.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.VIEW);
    
    // Return direct link
    return `https://drive.google.com/uc?id=${file.getId()}`;
    
  } catch (error) {
    console.error('Upload error:', error);
    return '';
  }
}

/**
 * Update logo URL di spreadsheet
 */
function updateLogoUrl(teamName, logoUrl) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME);
  
  const data = sheet.getDataRange().getValues();
  
  for (let i = data.length - 1; i >= 0; i--) {
    if (data[i][1] === teamName) { // Column B = Nama Tim
      sheet.getRange(i + 1, 18).setValue(logoUrl); // Column R = Logo URL
      break;
    }
  }
}

/**
 * Test function
 */
function testPost() {
  const testData = {
    timestamp: new Date().toLocaleString('id-ID'),
    teamName: 'Test Team',
    category: 'SMA/SMK',
    school: 'Test School',
    captainName: 'Test Captain',
    captainPhone: '628123456789',
    captainMLBB: '123456789',
    player2Name: 'Player 2',
    player2MLBB: '111111111',
    player3Name: 'Player 3',
    player3MLBB: '222222222',
    player4Name: 'Player 4',
    player4MLBB: '333333333',
    player5Name: 'Player 5',
    player5MLBB: '444444444',
    subName: 'Sub',
    subMLBB: '555555555'
  };
  
  saveToSheet(testData);
  console.log('Test data saved!');
}
```

4. Ganti `SPREADSHEET_ID` dengan ID spreadsheet kamu
5. (Optional) Untuk upload logo, buat folder di Google Drive dan ganti `DRIVE_FOLDER_ID`

### 3. Deploy sebagai Web App

1. Klik **Deploy** → **New deployment**
2. Pilih type: **Web app**
3. Konfigurasi:
   - Description: "MLBB Cup Registration"
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Klik **Deploy**
5. Copy **Web app URL** yang muncul

### 4. Update Website

1. Buka file `js/registration.js`
2. Cari baris:
   ```javascript
   const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL';
   ```
3. Ganti dengan URL Web App kamu:
   ```javascript
   const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/xxxxx/exec';
   ```

### 5. Testing

1. Buka halaman pendaftaran di browser
2. Isi form dan submit
3. Cek Google Sheets, data harus masuk!

## 🔧 Troubleshooting

### Data tidak masuk ke Sheets
- Pastikan Spreadsheet ID benar
- Pastikan Web App sudah di-deploy dengan akses "Anyone"
- Cek Console browser untuk error

### Logo tidak terupload
- Pastikan Folder ID Google Drive benar
- Pastikan folder sudah di-share dengan akses yang tepat

### CORS Error
- Google Apps Script dengan mode `no-cors` memang tidak bisa membaca response
- Data tetap terkirim meskipun tidak ada konfirmasi

## 📱 Notifikasi WhatsApp (Bonus)

Kamu bisa tambahkan notifikasi WhatsApp ke panitia ketika ada pendaftaran baru:

```javascript
// Tambahkan di function doPost setelah saveToSheet
function sendWhatsAppNotification(data) {
  // Gunakan API seperti Fonnte, Wablas, dll
  const FONNTE_TOKEN = 'TOKEN_KAMU';
  const ADMIN_PHONE = '628xxxxxxxxxx';
  
  const message = `🎮 *Pendaftaran Baru!*
  
Tim: ${data.teamName}
Kategori: ${data.category}
Kapten: ${data.captainName}
WA: ${data.captainPhone}

Cek spreadsheet untuk detail lengkap.`;

  UrlFetchApp.fetch('https://api.fonnte.com/send', {
    method: 'POST',
    headers: {
      'Authorization': FONNTE_TOKEN
    },
    payload: {
      target: ADMIN_PHONE,
      message: message
    }
  });
}
```

---

Selamat! Form pendaftaran sekarang terhubung dengan Google Sheets! 🎉
