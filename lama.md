// ==================== KONFIGURASI ====================
// Ganti dengan ID kamu!
const SPREADSHEET_ID = '1GhhfMbQWYpcnaUTxPIQR4092DKnjJKyae22oBmlr-qg';
const SHEET_NAME = 'Sheet1';
const DRIVE_FOLDER_ID = '1Kh4K3YbXbbLEKX_x-AkNgQRWX9t5t_wy';
// =====================================================

/**
 * Handle POST request dari form website
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // Simpan ke Spreadsheet
    const rowNumber = saveToSheet(data);
    
    // Upload logo jika ada
    if (data.logoBase64) {
      const logoUrl = uploadLogo(data);
      updateLogoUrl(rowNumber, logoUrl);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: 'Pendaftaran berhasil!' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error:', error);
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
    .createTextOutput('✅ UEST MLBB CUP 4# Registration API is running!')
    .setMimeType(ContentService.MimeType.TEXT);
}

/**
 * Simpan data ke spreadsheet
 */
function saveToSheet(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME);
  
  const row = [
    data.timestamp || new Date().toLocaleString('id-ID'),
    data.teamName,
    data.category,
    data.school || '-',
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
    data.subName || '-',
    data.subMLBB || '-',
    '' // Logo URL (akan diupdate nanti)
  ];
  
  sheet.appendRow(row);
  
  // Return nomor baris yang baru ditambahkan
  return sheet.getLastRow();
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
    
    // Buat nama file yang aman
    const safeName = data.teamName.replace(/[^a-zA-Z0-9]/g, '_');
    const extension = data.logoFileName ? data.logoFileName.split('.').pop() : 'png';
    const fileName = `${safeName}_logo_${Date.now()}.${extension}`;
    
    // Decode base64 dan buat blob
    const blob = Utilities.newBlob(
      Utilities.base64Decode(data.logoBase64),
      data.logoMimeType || 'image/png',
      fileName
    );
    
    // Upload file ke Drive
    const file = folder.createFile(blob);
    
    // Set akses publik
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    // Return direct link untuk view
    return `https://drive.google.com/uc?id=${file.getId()}`;
    
  } catch (error) {
    console.error('Upload error:', error);
    return 'Upload gagal: ' + error.message;
  }
}

/**
 * Update logo URL di spreadsheet
 */
function updateLogoUrl(rowNumber, logoUrl) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME);
  
  // Column R (18) = Logo URL
  sheet.getRange(rowNumber, 18).setValue(logoUrl);
}

/**
 * Test function - jalankan manual untuk test
 */
function testSaveData() {
  const testData = {
    timestamp: new Date().toLocaleString('id-ID'),
    teamName: 'Test Team',
    category: 'SMA/SMK',
    school: 'SMK Test',
    captainName: 'John Doe',
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
    subName: 'Cadangan',
    subMLBB: '555555555'
  };
  
  saveToSheet(testData);
  console.log('✅ Test data berhasil disimpan!');
}