/**
 * Authentication Modal Script
 */

// Dynamic API URL based on environment
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5001/api'
    : 'https://expenseanalyzerbackend-q50r.onrender.com/api';

let currentEmail = '';
let currentUsername = '';

// Modal Controls
function openLoginModal() {
    const overlay = document.getElementById('login-modal-overlay');
    if (overlay) {
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeLoginModal() {
    const overlay = document.getElementById('login-modal-overlay');
    if (overlay) {
        overlay.classList.remove('active');
        document.body.style.overflow = 'auto';
        clearMessages();
        resetForms();
    }
}

function resetForms() {
    const loginSection = document.getElementById('login-form-section');
    const otpSection = document.getElementById('otp-section');
    
    if (loginSection) loginSection.style.display = 'block';
    if (otpSection) otpSection.classList.remove('active');
    
    // Clear all inputs
    const username = document.getElementById('login-username');
    const email = document.getElementById('login-email');
    const password = document.getElementById('login-password');
    
    if (username) username.value = '';
    if (email) email.value = '';
    if (password) password.value = '';
    
    document.querySelectorAll('.otp-input').forEach(input => input.value = '');
}

// Message Display
function showError(message) {
    const container = document.getElementById('error-container');
    container.innerHTML = `
        <div class="error-message">
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
        </div>
    `;
    setTimeout(() => container.innerHTML = '', 5000);
}

function showSuccess(message) {
    const container = document.getElementById('success-container');
    container.innerHTML = `
        <div class="success-message">
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        </div>
    `;
    setTimeout(() => container.innerHTML = '', 5000);
}

function clearMessages() {
    document.getElementById('error-container').innerHTML = '';
    document.getElementById('success-container').innerHTML = '';
}

// Combined Login/Register Handler
async function handleLoginOrRegister() {
    clearMessages();
    const username = document.getElementById('login-username').value.trim();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    if (!username || !email || !password) {
        showError('Please fill in all fields');
        return;
    }

    if (password.length < 6) {
        showError('Password must be at least 6 characters');
        return;
    }

    const btn = document.getElementById('login-btn-text');
    const originalText = btn.textContent;
    btn.innerHTML = '<span class="loading-spinner"></span> Processing...';

    try {
        // Try to login first
        let response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier: email, password })
        });

        let data = await response.json();

        // If user doesn't exist, register them
        if (response.status === 401 || data.error === 'Invalid credentials') {
            response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });
            data = await response.json();
        }

        if (response.ok) {
            currentEmail = email;
            currentUsername = username;
            document.getElementById('otp-email').textContent = email;
            document.getElementById('login-form-section').style.display = 'none';
            document.getElementById('otp-section').classList.add('active');
            showSuccess(data.message || 'OTP sent to your email');
            document.querySelector('.otp-input').focus();
        } else {
            showError(data.error || 'Authentication failed');
        }
    } catch (error) {
        showError('Network error. Please check your connection.');
        console.error('Auth error:', error);
    } finally {
        btn.textContent = originalText;
    }
}

// OTP Verification
async function handleOTPVerification() {
    clearMessages();
    const otpInputs = document.querySelectorAll('.otp-input');
    const otp = Array.from(otpInputs).map(input => input.value).join('');

    if (otp.length !== 6) {
        showError('Please enter complete 6-digit OTP');
        return;
    }

    const btn = document.getElementById('otp-btn-text');
    const originalText = btn.textContent;
    btn.innerHTML = '<span class="loading-spinner"></span> Verifying...';

    try {
        const response = await fetch(`${API_URL}/auth/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: currentEmail, otp })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            showSuccess('Login successful! Welcome back!');
            
            setTimeout(() => {
                closeLoginModal();
                updateUserDisplay(data.user);
                location.reload(); // Refresh to load user data
            }, 1500);
        } else {
            showError(data.error || 'Invalid OTP');
            otpInputs.forEach(input => input.value = '');
            otpInputs[0].focus();
        }
    } catch (error) {
        showError('Network error. Please try again.');
        console.error('OTP verification error:', error);
    } finally {
        btn.textContent = originalText;
    }
}

// Resend OTP
async function handleResendOTP() {
    clearMessages();
    try {
        const response = await fetch(`${API_URL}/auth/resend-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: currentEmail })
        });

        const data = await response.json();
        if (response.ok) {
            showSuccess('OTP resent successfully! Check your email.');
        } else {
            showError(data.error || 'Failed to resend OTP');
        }
    } catch (error) {
        showError('Network error. Please try again.');
    }
}

// Google OAuth
function handleGoogleLogin() {
    clearMessages();
    
    // Check if Google library is loaded
    if (typeof google === 'undefined' || !google.accounts) {
        showError('Google Sign-In is still loading. Please wait a moment and try again.');
        return;
    }
    
    try {
        // Initialize Google Sign-In
        google.accounts.id.initialize({
            client_id: '928805232883-red1udn5fb1qaubie4ub81gjsq2lueem.apps.googleusercontent.com',
            callback: handleGoogleCallback,
            auto_select: false,
            cancel_on_tap_outside: true
        });
        
        // Show the One Tap dialog
        google.accounts.id.prompt((notification) => {
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                // Fallback: show button-based sign-in
                console.log('One Tap not displayed, reason:', notification.getNotDisplayedReason());
                showError('Please configure Google OAuth authorized URIs in Google Cloud Console.');
            }
        });
    } catch (error) {
        console.error('Google Sign-In error:', error);
        showError('Failed to initialize Google Sign-In. Please try email login.');
    }
}

async function handleGoogleCallback(response) {
    clearMessages();
    
    try {
        const res = await fetch(`${API_URL}/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: response.credential })
        });

        const data = await res.json();

        if (res.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            showSuccess('Login successful! Welcome!');
            
            setTimeout(() => {
                closeLoginModal();
                updateUserDisplay(data.user);
                location.reload();
            }, 1500);
        } else {
            showError(data.error || 'Google login failed');
        }
    } catch (error) {
        showError('Network error. Please try again.');
        console.error('Google login error:', error);
    }
}

// OTP Input Navigation
function moveToNext(current, index) {
    if (current.value.length === 1) {
        const inputs = document.querySelectorAll('.otp-input');
        if (index < 5) {
            inputs[index + 1].focus();
        }
    }
}

function moveToPrev(current, index) {
    if (current.value.length === 0 && index > 0) {
        const inputs = document.querySelectorAll('.otp-input');
        inputs[index - 1].focus();
    }
}

// Update User Display
function updateUserDisplay(user) {
    // Update username display
    const userDisplay = document.getElementById('user-display');
    if (userDisplay) {
        userDisplay.textContent = user.username;
    }
    
    // Update login icon to show username
    const loginBtn = document.getElementById('login-icon-btn');
    if (loginBtn) {
        loginBtn.innerHTML = `<span style="font-size: 0.85rem; font-weight: 600;">${user.username.substring(0, 2).toUpperCase()}</span>`;
        loginBtn.title = `Logged in as ${user.username}`;
        loginBtn.onclick = null; // Remove click handler
        loginBtn.style.cursor = 'default';
    }
    
    // Show logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.style.display = 'flex';
    }
}

// Check Authentication on Load
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    
    if (token && user) {
        updateUserDisplay(user);
    }
    
    // Initialize Google Sign-In
    if (typeof google !== 'undefined') {
        google.accounts.id.initialize({
            client_id: '928805232883-red1udn5fb1qaubie4ub81gjsq2lueem.apps.googleusercontent.com',
            callback: handleGoogleCallback,
            auto_select: false,
            cancel_on_tap_outside: true
        });
    }
    
    // Close modal on overlay click
    const overlay = document.getElementById('login-modal-overlay');
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target.id === 'login-modal-overlay') {
                closeLoginModal();
            }
        });
    }
    
    // Enter key handlers
    const loginPassword = document.getElementById('login-password');
    if (loginPassword) {
        loginPassword.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleLoginOrRegister();
        });
    }
    
    // Escape key to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeLoginModal();
        }
    });
});

// Logout Handler
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        location.reload();
    }
}
