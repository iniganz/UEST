// ==================== KONFIGURASI ====================
// Ganti dengan ID kamu!
const SPREADSHEET_ID = '1GhhfMbQWYpcnaUTxPIQR4092DKnjJKyae22oBmlr-qg';
const SHEET_NAME = 'Sheet1';
const DRIVE_FOLDER_ID = '1Kh4K3YbXbbLEKX_x-AkNgQRWX9t5t_wy';
// =====================================================

/**
 * Log message dengan timestamp
 */
function log(message) {
  const timestamp = new Date().toLocaleString('id-ID');
  Logger.log(`[${timestamp}] ${message}`);
  console.log(`[${timestamp}] ${message}`);
}

/**
 * Handle POST request dari form website
 */
function doPost(e) {
  log('=== REQUEST DITERIMA ===');
  
  try {
    if (!e || !e.postData || !e.postData.contents) {
      log('⚠️ Request tanpa postData. doPost harus dipanggil lewat Web App (HTTP POST), bukan Run langsung.');
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          error: 'Invalid request: postData tidak ditemukan.',
          hint: 'Gunakan URL Web App dengan metode POST, atau jalankan testDoPostManual() untuk simulasi.'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const data = JSON.parse(e.postData.contents);
    log(`Team: ${data.teamName}`);
    log(`Logo Ada: ${data.logoBase64 ? 'YA' : 'TIDAK'}`);
    
    // Simpan ke Spreadsheet
    const rowNumber = saveToSheet(data);
    log(`✅ Data tersimpan di baris: ${rowNumber}`);
    
    // Upload logo jika ada
    let logoUrl = '';
    if (data.logoBase64) {
      log('🖼️ Mulai upload logo...');
      logoUrl = uploadLogo(data);
      
      if (logoUrl.startsWith('https://')) {
        log(`✅ Logo berhasil diupload: ${logoUrl}`);
        updateLogoUrl(rowNumber, logoUrl);
        log(`✅ URL logo disimpan di Sheets`);
      } else {
        log(`❌ Error upload: ${logoUrl}`);
      }
    }
    
    log('=== REQUEST SELESAI ===\n');
    
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: true, 
        message: 'Pendaftaran berhasil!',
        logoUrl: logoUrl 
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    log(`❌ ERROR: ${error.message}`);
    log(`Stack: ${error.stack}`);
    
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: false, 
        error: error.message,
        stack: error.stack 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle GET request (untuk testing)
 */
function doGet(e) {
  const status = `✅ UEST MLBB CUP 4# Registration API is running!\n\nFolder Access: ${checkFolderAccess()}\n\nLogs: Lihat Executions tab di Google Apps Script editor`;
  return ContentService
    .createTextOutput(status)
    .setMimeType(ContentService.MimeType.TEXT);
}

/**
 * Verifikasi akses ke folder Google Drive
 */
function checkFolderAccess() {
  try {
    const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    log(`✅ Folder ditemukan: ${folder.getName()}`);
    return `✅ OK (${folder.getName()})`;
  } catch (error) {
    log(`❌ Folder tidak accessible: ${error.message}`);
    return `❌ ERROR: ${error.message}`;
  }
}

/**
 * Simpan data ke spreadsheet
 */
function saveToSheet(data) {
  try {
    const payload = data || {};
    const requiredFields = [
      'teamName',
      'category',
      'captainName',
      'captainPhone',
      'captainMLBB',
      'player2Name',
      'player2MLBB',
      'player3Name',
      'player3MLBB',
      'player4Name',
      'player4MLBB',
      'player5Name',
      'player5MLBB'
    ];
    const missingFields = requiredFields.filter((field) => !payload[field]);

    if (missingFields.length > 0) {
      throw new Error(`Data pendaftaran tidak lengkap. Field wajib kosong: ${missingFields.join(', ')}`);
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    
    const row = [
      payload.timestamp || new Date().toLocaleString('id-ID'),
      payload.teamName,
      payload.category,
      payload.school || '-',
      payload.captainName,
      payload.captainNickname || '-',
      payload.captainPhone,
      payload.captainMLBB,
      payload.player2Name,
      payload.player2Nickname || '-',
      payload.player2MLBB,
      payload.player3Name,
      payload.player3Nickname || '-',
      payload.player3MLBB,
      payload.player4Name,
      payload.player4Nickname || '-',
      payload.player4MLBB,
      payload.player5Name,
      payload.player5Nickname || '-',
      payload.player5MLBB,
      payload.subName || '-',
      payload.subNickname || '-',
      payload.subMLBB || '-',
      '' // Logo URL (akan diupdate nanti)
    ];
    
    sheet.appendRow(row);
    
    // Return nomor baris yang baru ditambahkan
    const lastRow = sheet.getLastRow();
    log(`📊 Row appended: ${lastRow}`);
    return lastRow;
    
  } catch (error) {
    log(`❌ Save to sheet error: ${error.message}`);
    throw error;
  }
}

/**
 * Upload logo ke Google Drive
 */
function uploadLogo(data) {
  try {
    log(`📁 DRIVE_FOLDER_ID: ${DRIVE_FOLDER_ID}`);
    
    // Cek folder
    let folder;
    try {
      folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
      log(`✅ Folder ditemukan: ${folder.getName()}`);
    } catch (folderError) {
      log(`❌ Folder tidak ditemukan: ${folderError.message}`);
      return `Folder Error: ${folderError.message}`;
    }
    
    // Validasi data
    if (!data.logoBase64) {
      log(`❌ logoBase64 kosong`);
      return 'logoBase64 tidak ada';
    }
    
    // Cek ukuran base64
    const base64Size = data.logoBase64.length;
    log(`📊 Base64 size: ${base64Size} characters (~${Math.round(base64Size * 0.75 / 1024)} KB)`);
    
    // Buat nama file yang aman
    const safeName = data.teamName.replace(/[^a-zA-Z0-9]/g, '_');
    const extension = data.logoFileName ? data.logoFileName.split('.').pop() : 'png';
    const fileName = `${safeName}_logo_${Date.now()}.${extension}`;
    log(`📄 File name: ${fileName}`);
    
    // Decode base64 dan buat blob
    log(`🔄 Decoding base64...`);
    let decodedData;
    try {
      decodedData = Utilities.base64Decode(data.logoBase64);
      log(`✅ Base64 decoded: ${decodedData.length} bytes`);
    } catch (decodeError) {
      log(`❌ Base64 decode error: ${decodeError.message}`);
      return `Decode Error: ${decodeError.message}`;
    }
    
    // Buat blob
    log(`🔄 Creating blob...`);
    const blob = Utilities.newBlob(
      decodedData,
      data.logoMimeType || 'image/png',
      fileName
    );
    log(`✅ Blob created: ${blob.getBytes().length} bytes`);
    
    // Upload file ke Drive
    log(`🔄 Uploading to Drive...`);
    const file = folder.createFile(blob);
    const fileId = file.getId();
    log(`✅ File uploaded: ${fileId}`);
    
    // Set akses publik
    log(`🔄 Setting share permission...`);
    try {
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      log(`✅ Share permission set`);
    } catch (shareError) {
      log(`⚠️ Share permission error: ${shareError.message}`);
    }
    
    // Return direct link untuk view
    const directLink = `https://drive.google.com/uc?id=${fileId}`;
    log(`✅ Direct link: ${directLink}`);
    return directLink;
    
  } catch (error) {
    log(`❌ Upload error: ${error.message}`);
    log(`Stack: ${error.stack}`);
    return `Upload Error: ${error.message}`;
  }
}

/**
 * Update logo URL di spreadsheet
 */
function updateLogoUrl(rowNumber, logoUrl) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    
    // Column X (24) = Logo URL
    log(`🔄 Updating row ${rowNumber}, column 24 (X) with logo URL...`);
    sheet.getRange(rowNumber, 24).setValue(logoUrl);
    log(`✅ Logo URL updated`);
    
  } catch (error) {
    log(`❌ Update logo URL error: ${error.message}`);
    throw error;
  }
}

/**
 * Test function - jalankan manual untuk test
 */
function testSaveData() {
  log('=== TEST DATA STARTED ===');
  
  const testData = {
    timestamp: new Date().toLocaleString('id-ID'),
    teamName: 'Test Team',
    category: 'SMA/SMK',
    school: 'SMK Test',
    captainName: 'John Doe',
    captainNickname: 'CaptainNick',
    captainPhone: '628123456789',
    captainMLBB: '123456789',
    player2Name: 'Player 2',
    player2Nickname: 'P2Nick',
    player2MLBB: '111111111',
    player3Name: 'Player 3',
    player3Nickname: 'P3Nick',
    player3MLBB: '222222222',
    player4Name: 'Player 4',
    player4Nickname: 'P4Nick',
    player4MLBB: '333333333',
    player5Name: 'Player 5',
    player5Nickname: 'P5Nick',
    player5MLBB: '444444444',
    subName: 'Cadangan',
    subNickname: 'SubNick',
    subMLBB: '555555555'
  };
  
  saveToSheet(testData);
  log('✅ Test data berhasil disimpan!');
  log('=== TEST DATA SELESAI ===\n');
}

/**
 * Test folder access
 */
function testFolderAccess() {
  log('=== TEST FOLDER ACCESS ===');
  const result = checkFolderAccess();
  log(`Result: ${result}`);
  log('=== TEST SELESAI ===\n');
}

/**
 * Simulasi doPost untuk test langsung dari Apps Script editor.
 */
function testDoPostManual() {
  log('=== TEST doPost MANUAL ===');

  const payload = {
    timestamp: new Date().toLocaleString('id-ID'),
    teamName: 'Test Manual Team',
    category: 'SMA/SMK',
    school: 'SMK Test',
    captainName: 'Captain Test',
    captainNickname: 'CaptainNick',
    captainPhone: '628123456789',
    captainMLBB: '123456789',
    player2Name: 'Player 2',
    player2Nickname: 'P2Nick',
    player2MLBB: '111111111',
    player3Name: 'Player 3',
    player3Nickname: 'P3Nick',
    player3MLBB: '222222222',
    player4Name: 'Player 4',
    player4Nickname: 'P4Nick',
    player4MLBB: '333333333',
    player5Name: 'Player 5',
    player5Nickname: 'P5Nick',
    player5MLBB: '444444444',
    subName: 'Cadangan',
    subNickname: 'SubNick',
    subMLBB: '555555555'
  };

  const fakeEvent = {
    postData: {
      contents: JSON.stringify(payload)
    }
  };

  const result = doPost(fakeEvent);
  log(`Result: ${result.getContent()}`);
  log('=== TEST doPost MANUAL SELESAI ===\n');
}
