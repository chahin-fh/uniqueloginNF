// Login Page Script
let clickCount = 0;
let tabs = [];
let extractedUsername = '';

const ENCRYPTION_KEY = 'unique_login_key_2025';

function xorDecrypt(encrypted, key) {
    try {
        const decoded = atob(encrypted);
        let result = '';
        for (let i = 0; i < decoded.length; i++) {
            result += String.fromCharCode(decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length));
        }
        return result;
    } catch (e) {
        return null;
    }
}

document.getElementById('keyFile').addEventListener('change', function(event) {
    const file = event.target.files[0];
    const fileInfo = document.getElementById('fileInfo');
    
    if (!file) {
        fileInfo.textContent = '';
        extractedUsername = '';
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const fileContent = e.target.result.trim();
        const decrypted = xorDecrypt(fileContent, ENCRYPTION_KEY);
        
        if (decrypted && decrypted.length > 0) {
            extractedUsername = decrypted;
            fileInfo.innerHTML = `✓ ${file.name}<br><small>Username: <strong>${extractedUsername}</strong></small>`;
            fileInfo.classList.add('success');
        } else {
            fileInfo.textContent = '✗ Invalid key file';
            fileInfo.classList.remove('success');
            extractedUsername = '';
        }
    };
    reader.readAsText(file);
});

const clickButton = document.getElementById('clickButton');
const counterInfo = document.getElementById('counterInfo');
const tabsDisplay = document.getElementById('tabsDisplay');

let pressTimer = null;
const LONG_PRESS_DURATION = 500;

clickButton.addEventListener('mousedown', function() {
    pressTimer = setTimeout(function() {
        tabs.push('long');
        clickCount++;
        updateDisplay();
        pressTimer = null;
    }, LONG_PRESS_DURATION);
});

clickButton.addEventListener('mouseup', function() {
    if (pressTimer !== null) {
        clearTimeout(pressTimer);
        tabs.push('short');
        clickCount++;
        updateDisplay();
        pressTimer = null;
    }
});

clickButton.addEventListener('mouseleave', function() {
    if (pressTimer !== null) {
        clearTimeout(pressTimer);
        pressTimer = null;
    }
});

function updateDisplay() {
    counterInfo.textContent = `Clicks: ${clickCount}`;
    
    tabsDisplay.innerHTML = '';
    tabs.forEach(tab => {
        const tabDiv = document.createElement('div');
        tabDiv.className = 'tab ' + tab;
        tabsDisplay.appendChild(tabDiv);
    });
    tabsDisplay.classList.add('active');
}

// ============================================
// CONVERT TABS TO PASSWORD
// ============================================

function convertTabsToPassword() {
    let password = '';
    for (let i = 0; i < tabs.length; i++) {
        password += tabs[i] === 'long' ? 'l' : 's';
    }
    return password;
}

document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    if (!extractedUsername) {
        alert('Please upload a valid key file');
        return;
    }
    
    if (tabs.length === 0) {
        alert('Please click the button to create a password');
        return;
    }
    
    const password = convertTabsToPassword();
    
    // Send to backend
    const formData = new FormData();
    formData.append('username', extractedUsername);
    formData.append('password', password);
    
    fetch('login_process.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Login successful!');
            window.location.href = 'dashboard.html';
        } else {
            alert('Login failed: ' + data.message);
        }
    })
    .catch(error => {
        alert('An error occurred');
    });
});

function resetForm() {
    document.getElementById('loginForm').reset();
    clickCount = 0;
    tabs = [];
    updateDisplay();
}
