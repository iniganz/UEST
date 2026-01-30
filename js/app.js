/**
 * UEST MLBB CUP 4# - Anti Inspect & DevTools Protection
 * Mencegah user membuka Developer Tools dan Inspect Element
 */

(function() {
    'use strict';

    // ===================================
    // CONFIGURATION
    // ===================================
    const CONFIG = {
        enableProtection: true,
        warningMessage: '⚠️ PERINGATAN!\n\nAnda tidak diizinkan untuk melakukan inspect element atau membuka Developer Tools pada website ini.\n\nTindakan ini tercatat oleh sistem.',
        redirectOnDetect: false, // Set true jika mau redirect
        redirectUrl: 'https://google.com'
    };

    if (!CONFIG.enableProtection) return;

    // ===================================
    // 1. DISABLE RIGHT CLICK
    // ===================================
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        showWarning('Klik kanan dinonaktifkan!');
        return false;
    });

    // ===================================
    // 2. DISABLE KEYBOARD SHORTCUTS
    // ===================================
    document.addEventListener('keydown', function(e) {
        // F12
        if (e.key === 'F12' || e.keyCode === 123) {
            e.preventDefault();
            showWarning('F12 dinonaktifkan!');
            return false;
        }

        // Ctrl+Shift+I (Inspect)
        if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.keyCode === 73)) {
            e.preventDefault();
            showWarning('Inspect Element dinonaktifkan!');
            return false;
        }

        // Ctrl+Shift+J (Console)
        if (e.ctrlKey && e.shiftKey && (e.key === 'J' || e.key === 'j' || e.keyCode === 74)) {
            e.preventDefault();
            showWarning('Console dinonaktifkan!');
            return false;
        }

        // Ctrl+Shift+C (Inspect Element)
        if (e.ctrlKey && e.shiftKey && (e.key === 'C' || e.key === 'c' || e.keyCode === 67)) {
            e.preventDefault();
            showWarning('Inspect Element dinonaktifkan!');
            return false;
        }

        // Ctrl+U (View Source)
        if (e.ctrlKey && (e.key === 'U' || e.key === 'u' || e.keyCode === 85)) {
            e.preventDefault();
            showWarning('View Source dinonaktifkan!');
            return false;
        }

        // Ctrl+S (Save Page)
        if (e.ctrlKey && (e.key === 'S' || e.key === 's' || e.keyCode === 83)) {
            e.preventDefault();
            showWarning('Save Page dinonaktifkan!');
            return false;
        }

        // Ctrl+Shift+K (Firefox Console)
        if (e.ctrlKey && e.shiftKey && (e.key === 'K' || e.key === 'k' || e.keyCode === 75)) {
            e.preventDefault();
            showWarning('Console dinonaktifkan!');
            return false;
        }

        // Ctrl+Shift+E (Network Tab Firefox)
        if (e.ctrlKey && e.shiftKey && (e.key === 'E' || e.key === 'e' || e.keyCode === 69)) {
            e.preventDefault();
            return false;
        }
    });

    // ===================================
    // 3. DETECT DEVTOOLS OPEN
    // ===================================
    let devtoolsOpen = false;

    // Method 1: Check window size difference
    const checkDevTools = function() {
        const widthThreshold = window.outerWidth - window.innerWidth > 160;
        const heightThreshold = window.outerHeight - window.innerHeight > 160;
        
        if (widthThreshold || heightThreshold) {
            if (!devtoolsOpen) {
                devtoolsOpen = true;
                onDevToolsOpen();
            }
        } else {
            devtoolsOpen = false;
        }
    };

    // Method 2: Debugger detection
    const detectDebugger = function() {
        const start = performance.now();
        debugger;
        const end = performance.now();
        
        if (end - start > 100) {
            onDevToolsOpen();
        }
    };

    // Method 3: Console.log detection
    const element = new Image();
    Object.defineProperty(element, 'id', {
        get: function() {
            onDevToolsOpen();
        }
    });

    // Check periodically
    setInterval(checkDevTools, 1000);

    // ===================================
    // 4. ON DEVTOOLS DETECTED
    // ===================================
    function onDevToolsOpen() {
        // Show warning modal
        showWarningModal();
        
        // Optional: Clear console
        console.clear();
        
        // Console warning
        console.log('%c⛔ STOP!', 'color: red; font-size: 50px; font-weight: bold;');
        console.log('%cIni adalah fitur browser yang ditujukan untuk developer.', 'font-size: 16px;');
        console.log('%cJika seseorang menyuruh Anda menyalin-tempel sesuatu di sini, itu adalah penipuan.', 'font-size: 16px; color: red;');
        
        // Optional: Redirect
        if (CONFIG.redirectOnDetect) {
            window.location.href = CONFIG.redirectUrl;
        }
    }

    // ===================================
    // 5. WARNING TOAST
    // ===================================
    function showWarning(message) {
        // Remove existing toast
        const existingToast = document.getElementById('antiInspectToast');
        if (existingToast) existingToast.remove();

        // Create toast
        const toast = document.createElement('div');
        toast.id = 'antiInspectToast';
        toast.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #ff4757, #ff6b7a);
                color: white;
                padding: 15px 25px;
                border-radius: 10px;
                box-shadow: 0 10px 30px rgba(255, 71, 87, 0.4);
                z-index: 99999;
                font-family: 'Poppins', sans-serif;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 10px;
                animation: slideIn 0.3s ease;
            ">
                <span style="font-size: 1.5rem;">⚠️</span>
                <span>${message}</span>
            </div>
        `;

        // Add animation style
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(toast);

        // Remove after 3 seconds
        setTimeout(() => {
            toast.querySelector('div').style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // ===================================
    // 6. WARNING MODAL (For DevTools Detection)
    // ===================================
    function showWarningModal() {
        // Check if modal already exists
        if (document.getElementById('devtoolsWarningModal')) return;

        const modal = document.createElement('div');
        modal.id = 'devtoolsWarningModal';
        modal.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.95);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 999999;
                font-family: 'Poppins', sans-serif;
            ">
                <div style="
                    background: linear-gradient(145deg, #1a1a2e, #16213e);
                    border: 2px solid #ff4757;
                    border-radius: 20px;
                    padding: 40px;
                    max-width: 450px;
                    text-align: center;
                    animation: modalPop 0.3s ease;
                ">
                    <div style="font-size: 4rem; margin-bottom: 20px;">🚫</div>
                    <h2 style="
                        color: #ff4757;
                        font-size: 1.8rem;
                        margin-bottom: 15px;
                        font-weight: 700;
                    ">AKSES DITOLAK!</h2>
                    <p style="
                        color: #a0a0a0;
                        line-height: 1.8;
                        margin-bottom: 25px;
                    ">
                        Developer Tools terdeteksi terbuka.<br>
                        <strong style="color: #ff4757;">Tindakan ini tidak diizinkan!</strong><br><br>
                        Silakan tutup Developer Tools untuk melanjutkan.
                    </p>
                    <button onclick="this.closest('#devtoolsWarningModal').remove()" style="
                        background: linear-gradient(135deg, #f5a623, #f7c56e);
                        color: #0a0a0f;
                        border: none;
                        padding: 12px 40px;
                        border-radius: 50px;
                        font-weight: 700;
                        font-size: 1rem;
                        cursor: pointer;
                        transition: transform 0.3s ease;
                    " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                        MENGERTI
                    </button>
                </div>
            </div>
        `;

        // Add modal animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes modalPop {
                from { transform: scale(0.8); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(modal);
    }

    // ===================================
    // 7. DISABLE TEXT SELECTION (Optional)
    // ===================================
    document.addEventListener('selectstart', function(e) {
        // Allow selection on input and textarea
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return true;
        }
        // Uncomment line below to disable text selection
        // e.preventDefault();
    });

    // ===================================
    // 8. DISABLE DRAG
    // ===================================
    document.addEventListener('dragstart', function(e) {
        if (e.target.tagName === 'IMG') {
            e.preventDefault();
            return false;
        }
    });

    // ===================================
    // 9. CONSOLE WARNING MESSAGE
    // ===================================
    console.clear();
    console.log('%c⚠️ PERINGATAN!', 'color: #ff4757; font-size: 40px; font-weight: bold; text-shadow: 2px 2px 0 #000;');
    console.log('%cHentikan!', 'color: #f5a623; font-size: 24px; font-weight: bold;');
    console.log('%cIni adalah fitur browser yang ditujukan untuk developer. Jika seseorang menyuruh Anda menyalin-tempel sesuatu di sini untuk mengaktifkan fitur atau "meretas" akun seseorang, itu adalah penipuan dan akan memberi mereka akses ke akun Anda.', 'font-size: 14px; color: #fff;');
    console.log('%c© UEST MLBB CUP 4# - BEM FTIS UNHI', 'color: #00d4ff; font-size: 12px;');

})();
