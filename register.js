// Register Page Script
let clickCount = 0;
let tabs = [];
let registeredUsername = '';
let encryptedKeyFile = '';

const ENCRYPTION_KEY = 'unique_login_key_2025';

function xorEncrypt(text, key) {
    let result = '';
    for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return btoa(result);
}

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

document.getElementById('registerForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    
    // Validate inputs
    if (!username) {
        alert('Please enter a username');
        return;
    }
    
    if (!email) {
        alert('Please enter an email');
        return;
    }
    
    if (tabs.length === 0) {
        alert('Please click the button to create a password');
        return;
    }
    
    // Convert tabs to password
    const password = convertTabsToPassword();
    
    // Encrypt username for key file
    encryptedKeyFile = xorEncrypt(username, ENCRYPTION_KEY);
    registeredUsername = username;
    
    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    formData.append('password', password);
    
    fetch('register_process.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('downloadModal').style.display = 'flex';
        } else {
            alert('Registration failed: ' + data.message);
        }
    })
    .catch(error => {
        alert('An error occurred');
    });
});

function downloadKeyFile() {
    const blob = new Blob([encryptedKeyFile], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${registeredUsername}_key.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

function completeRegistration() {
    window.location.href = 'index.html';
}
