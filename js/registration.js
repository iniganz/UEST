/**
 * MLBB Tournament - Registration Form Handler
 * Handles form submission to Google Sheets via Google Apps Script
 */

// ===================================
// CONFIGURATION
// ===================================

// PENTING: Ganti URL ini dengan URL Web App Google Apps Script kamu
// Lihat panduan di file SETUP_GOOGLE_SHEETS.md
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzpRGohB6NurjSN8dum7dMbzEeMFtKGod3EKbEwLwNJKjLq7QbaSWhW994jU6h7kHo/exec';

// ===================================
// FILE UPLOAD PREVIEW
// ===================================

document.addEventListener('DOMContentLoaded', function() {
    const logoInput = document.getElementById('logoInput');
    const logoFileName = document.getElementById('logoFileName');
    const logoUpload = document.getElementById('logoUpload');
    const logoPreview = document.getElementById('logoPreview');
    const logoPreviewImg = document.getElementById('logoPreviewImg');
    const removeLogoBtn = document.getElementById('removeLogoBtn');

    if (logoInput) {
        // Helper to show preview
        const showPreview = (file) => {
            if (!file) return;
            const url = URL.createObjectURL(file);
            logoPreviewImg.src = url;
            logoPreview.style.display = 'block';
            logoFileName.textContent = file.name;
            logoUpload.style.borderColor = 'var(--primary-gold)';
        };

        // Clear preview
        const clearPreview = () => {
            logoInput.value = '';
            logoFileName.textContent = '';
            if (logoPreviewImg) {
                logoPreviewImg.src = '';
            }
            if (logoPreview) {
                logoPreview.style.display = 'none';
            }
        };

        logoInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                // Validate file size (max 2MB)
                if (file.size > 2 * 1024 * 1024) {
                    showAlert('Ukuran file terlalu besar! Maksimal 2MB', 'error');
                    clearPreview();
                    return;
                }

                // Validate file type
                if (!file.type.startsWith('image/')) {
                    showAlert('File harus berupa gambar (JPG, PNG)', 'error');
                    clearPreview();
                    return;
                }

                showPreview(file);
            } else {
                clearPreview();
            }
        });

        // Drag and drop styling & handling
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
            e.preventDefault();
            this.style.borderColor = 'var(--dark-border)';
            this.style.background = 'var(--dark-bg)';

            const files = e.dataTransfer.files;
            if (files && files.length) {
                const file = files[0];
                // Create a DataTransfer to assign to input.files (if supported)
                try {
                    const dt = new DataTransfer();
                    dt.items.add(file);
                    logoInput.files = dt.files;
                } catch (err) {
                    // Fallback: cannot set files programmatically in some browsers
                    // We'll still process the file directly
                }

                // Trigger same validation and preview
                if (file.size > 2 * 1024 * 1024) {
                    showAlert('Ukuran file terlalu besar! Maksimal 2MB', 'error');
                    clearPreview();
                    return;
                }
                if (!file.type.startsWith('image/')) {
                    showAlert('File harus berupa gambar (JPG, PNG)', 'error');
                    clearPreview();
                    return;
                }
                showPreview(file);
            }
        });

        // Remove button
        if (removeLogoBtn) {
            removeLogoBtn.addEventListener('click', function() {
                if (confirm('Hapus logo yang dipilih?')) {
                    if (logoPreviewImg && logoPreviewImg.src) {
                        URL.revokeObjectURL(logoPreviewImg.src);
                    }
                    clearPreview();
                }
            });
        }
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
            
            console.log('📝 Form submitted, validating...');
            
            // Validate form
            if (!validateForm()) {
                console.log('❌ Form validation failed');
                return;
            }
            
            console.log('✅ Form validation passed');
            
            // Show loading
            showLoading(true);
            
            try {
                // Collect form data
                console.log('📦 Collecting form data...');
                const formData = collectFormData();
                console.log('✅ Form data collected:', Object.keys(formData));
                
                // Handle logo upload if exists
                const logoFile = document.getElementById('logoInput').files[0];
                if (logoFile) {
                    console.log(`🖼️ Logo file detected: ${logoFile.name}`);
                    // Convert to base64 for sending
                    formData.logoBase64 = await fileToBase64(logoFile);
                    formData.logoFileName = logoFile.name;
                    formData.logoMimeType = logoFile.type;
                    console.log(`✅ Logo converted to base64`);
                } else {
                    console.log('ℹ️ No logo file selected');
                }
                
                // Send to Google Sheets
                console.log('📤 Submitting to Google Sheets...');
                await submitToGoogleSheets(formData);
                console.log('✅ Submission complete');
                
                // Success
                showLoading(false);
                
                // Show payment modal with team name
                if (typeof showPaymentModal === 'function') {
                    console.log('💳 Showing payment modal');
                    showPaymentModal(formData.teamName);
                } else {
                    showAlert('🎉 Pendaftaran berhasil! Tim kamu telah terdaftar. Panitia akan menghubungi via WhatsApp.', 'success');
                }
                
                // Reset form and clear preview
                form.reset();
                document.getElementById('logoFileName').textContent = '';
                const logoPreviewImg = document.getElementById('logoPreviewImg');
                const logoPreview = document.getElementById('logoPreview');
                if (logoPreviewImg && logoPreviewImg.src) {
                    try { URL.revokeObjectURL(logoPreviewImg.src); } catch(e) {}
                    logoPreviewImg.src = '';
                }
                if (logoPreview) logoPreview.style.display = 'none';
                
                // Scroll to top
                window.scrollTo({ top: 0, behavior: 'smooth' });
                
            } catch (error) {
                showLoading(false);
                console.error('❌ Submission error:', error);
                console.error('Error message:', error.message);
                console.error('Error stack:', error.stack);
                showAlert('Gagal mengirim pendaftaran. Silakan coba lagi atau hubungi panitia. (Check browser console untuk detail)', 'error');
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
        captainNickname: formData.get('captainNickname'),
        captainPhone: formatPhoneNumber(formData.get('captainPhone')),
        captainMLBB: formData.get('captainMLBB'),
        
        // Players
        player2Name: formData.get('player2Name'),
        player2Nickname: formData.get('player2Nickname'),
        player2MLBB: formData.get('player2MLBB'),
        player3Name: formData.get('player3Name'),
        player3Nickname: formData.get('player3Nickname'),
        player3MLBB: formData.get('player3MLBB'),
        player4Name: formData.get('player4Name'),
        player4Nickname: formData.get('player4Nickname'),
        player4MLBB: formData.get('player4MLBB'),
        player5Name: formData.get('player5Name'),
        player5Nickname: formData.get('player5Nickname'),
        player5MLBB: formData.get('player5MLBB'),
        
        // Substitute
        subName: formData.get('subName') || '-',
        subNickname: formData.get('subNickname') || '-',
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
        try {
            console.log(`🖼️ Converting file to base64: ${file.name} (${file.size} bytes, ${file.type})`);
            
            const reader = new FileReader();
            reader.readAsDataURL(file);
            
            reader.onload = () => {
                const base64String = reader.result.split(',')[1];
                const sizeKB = Math.round(base64String.length * 0.75 / 1024);
                console.log(`✅ Base64 conversion done: ~${sizeKB} KB`);
                resolve(base64String);
            };
            
            reader.onerror = error => {
                console.error('❌ FileReader error:', error);
                reject(error);
            };
            
        } catch (error) {
            console.error('❌ File conversion error:', error);
            reject(error);
        }
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
    
    try {
        // Log data being sent
        console.log('📤 Mengirim data ke Google Apps Script...');
        console.log('URL:', GOOGLE_SCRIPT_URL);
        console.log('Data keys:', Object.keys(data));
        if (data.logoBase64) {
            console.log('Logo size:', `${Math.round(data.logoBase64.length * 0.75 / 1024)} KB`);
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
        
        console.log('✅ Request terkirim ke Google Apps Script');
        console.log('Response status:', response.status);
        
        // Note: With no-cors mode, we can't read the response
        // The request will be sent but we won't know if it succeeded
        // Google Apps Script should handle the data saving
        
        return true;
        
    } catch (error) {
        console.error('❌ Fetch error:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        throw error;
    }
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
