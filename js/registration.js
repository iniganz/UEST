/**
 * MLBB Tournament - Registration Form Handler
 * Handles form submission to Google Sheets via Google Apps Script
 */

// ===================================
// CONFIGURATION
// ===================================

// PENTING: Ganti URL ini dengan URL Web App Google Apps Script kamu
// Lihat panduan di file SETUP_GOOGLE_SHEETS.md
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby3JMFtr2hZpAngDUgjA7EsSSsKwlBPlP0Yx0xgaqcq8aQwcODDkKai6mCZscMWddvFtw/exec';

// ===================================
// FILE UPLOAD PREVIEW
// ===================================

document.addEventListener('DOMContentLoaded', function() {
    const logoInput = document.getElementById('logoInput');
    const logoFileName = document.getElementById('logoFileName');
    const logoUpload = document.getElementById('logoUpload');
    
    if (logoInput) {
        logoInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                // Validate file size (max 2MB)
                if (file.size > 2 * 1024 * 1024) {
                    showAlert('Ukuran file terlalu besar! Maksimal 2MB', 'error');
                    logoInput.value = '';
                    logoFileName.textContent = '';
                    return;
                }
                
                // Validate file type
                if (!file.type.startsWith('image/')) {
                    showAlert('File harus berupa gambar (JPG, PNG)', 'error');
                    logoInput.value = '';
                    logoFileName.textContent = '';
                    return;
                }
                
                logoFileName.textContent = file.name;
                logoUpload.style.borderColor = 'var(--primary-gold)';
            }
        });
        
        // Drag and drop styling
        logoUpload.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.style.borderColor = 'var(--primary-gold)';
            this.style.background = 'rgba(245, 166, 35, 0.05)';
        });
        
        logoUpload.addEventListener('dragleave', function(e) {
            e.preventDefault();
            this.style.borderColor = 'var(--dark-border)';
            this.style.background = 'var(--dark-bg)';
        });
        
        logoUpload.addEventListener('drop', function(e) {
            this.style.borderColor = 'var(--dark-border)';
            this.style.background = 'var(--dark-bg)';
        });
    }
});

// ===================================
// FORM SUBMISSION
// ===================================

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registrationForm');
    
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Validate form
            if (!validateForm()) {
                return;
            }
            
            // Show loading
            showLoading(true);
            
            try {
                // Collect form data
                const formData = collectFormData();
                
                // Handle logo upload if exists
                const logoFile = document.getElementById('logoInput').files[0];
                if (logoFile) {
                    // Convert to base64 for sending
                    formData.logoBase64 = await fileToBase64(logoFile);
                    formData.logoFileName = logoFile.name;
                    formData.logoMimeType = logoFile.type;
                }
                
                // Send to Google Sheets
                await submitToGoogleSheets(formData);
                
                // Success
                showLoading(false);
                
                // Show payment modal with team name
                if (typeof showPaymentModal === 'function') {
                    showPaymentModal(formData.teamName);
                } else {
                    showAlert('🎉 Pendaftaran berhasil! Tim kamu telah terdaftar. Panitia akan menghubungi via WhatsApp.', 'success');
                }
                
                // Reset form
                form.reset();
                document.getElementById('logoFileName').textContent = '';
                
                // Scroll to top
                window.scrollTo({ top: 0, behavior: 'smooth' });
                
            } catch (error) {
                showLoading(false);
                console.error('Submission error:', error);
                showAlert('Gagal mengirim pendaftaran. Silakan coba lagi atau hubungi panitia.', 'error');
            }
        });
    }
});

/**
 * Validate form before submission
 * @returns {boolean} Whether form is valid
 */
function validateForm() {
    const form = document.getElementById('registrationForm');
    
    // Check required fields
    const requiredFields = form.querySelectorAll('[required]');
    for (let field of requiredFields) {
        if (!field.value.trim()) {
            showAlert(`Mohon lengkapi field: ${field.previousElementSibling?.textContent || 'yang wajib diisi'}`, 'error');
            field.focus();
            return false;
        }
    }
    
    // Validate phone number
    const phoneField = form.querySelector('[name="captainPhone"]');
    if (phoneField) {
        const phone = phoneField.value.replace(/\D/g, '');
        if (phone.length < 10 || phone.length > 15) {
            showAlert('Nomor WhatsApp tidak valid', 'error');
            phoneField.focus();
            return false;
        }
    }
    
    // Check agreement checkbox
    const agreement = form.querySelector('[name="agreement"]');
    if (agreement && !agreement.checked) {
        showAlert('Kamu harus menyetujui peraturan tournament', 'error');
        return false;
    }
    
    return true;
}

/**
 * Collect all form data
 * @returns {Object} Form data object
 */
function collectFormData() {
    const form = document.getElementById('registrationForm');
    const formData = new FormData(form);
    
    const data = {
        timestamp: new Date().toLocaleString('id-ID'),
        teamName: formData.get('teamName'),
        category: formData.get('category'),
        school: formData.get('school') || '-',
        
        // Captain
        captainName: formData.get('captainName'),
        captainPhone: formatPhoneNumber(formData.get('captainPhone')),
        captainMLBB: formData.get('captainMLBB'),
        
        // Players
        player2Name: formData.get('player2Name'),
        player2MLBB: formData.get('player2MLBB'),
        player3Name: formData.get('player3Name'),
        player3MLBB: formData.get('player3MLBB'),
        player4Name: formData.get('player4Name'),
        player4MLBB: formData.get('player4MLBB'),
        player5Name: formData.get('player5Name'),
        player5MLBB: formData.get('player5MLBB'),
        
        // Substitute
        subName: formData.get('subName') || '-',
        subMLBB: formData.get('subMLBB') || '-'
    };
    
    return data;
}

/**
 * Convert file to base64
 * @param {File} file - File to convert
 * @returns {Promise<string>} Base64 string
 */
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = error => reject(error);
    });
}

/**
 * Submit data to Google Sheets via Apps Script
 * @param {Object} data - Form data
 */
async function submitToGoogleSheets(data) {
    // Check if URL is configured
    if (GOOGLE_SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL') {
        // For demo/testing - just simulate success
        console.log('Demo mode - Data yang akan dikirim:', data);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Save locally for demo
        const registrations = loadFromStorage('mlbb_registrations', []);
        registrations.push({
            ...data,
            id: generateId(),
            registeredAt: new Date().toISOString()
        });
        saveToStorage('mlbb_registrations', registrations);
        
        console.log('Data tersimpan di localStorage (demo mode)');
        return;
    }
    
    // Real submission to Google Apps Script
    const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', // Required for Google Apps Script
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });
    
    // Note: With no-cors mode, we can't read the response
    // The request will be sent but we won't know if it succeeded
    // Google Apps Script should handle the data saving
    
    return true;
}

// ===================================
// HELPER - Format Phone (from main.js)
// ===================================

function formatPhoneNumber(phone) {
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
        cleaned = '62' + cleaned.substring(1);
    }
    if (!cleaned.startsWith('62')) {
        cleaned = '62' + cleaned;
    }
    return cleaned;
}
