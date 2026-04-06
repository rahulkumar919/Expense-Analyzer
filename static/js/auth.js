/**
 * Authentication Service
 */

// Dynamic API URL based on environment
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5001/api'
    : 'https://expenseanalyzerbackend-q50r.onrender.com/api'; // Update with your backend URL

class AuthService {
    constructor() {
        this.token = localStorage.getItem('token');
        this.user = JSON.parse(localStorage.getItem('user') || 'null');
    }

    isAuthenticated() {
        return !!this.token;
    }

    getToken() {
        return this.token;
    }

    getUser() {
        return this.user;
    }

    async verifyToken() {
        if (!this.token) return false;

        try {
            const response = await fetch(`${API_URL}/auth/verify-token`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                return true;
            } else {
                this.logout();
                return false;
            }
        } catch (error) {
            console.error('Token verification failed:', error);
            return false;
        }
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.token = null;
        this.user = null;
        window.location.href = 'login-modal.html';
    }

    async makeAuthenticatedRequest(url, options = {}) {
        if (!this.token) {
            throw new Error('Not authenticated');
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`,
            ...options.headers
        };

        const response = await fetch(url, {
            ...options,
            headers
        });

        if (response.status === 401) {
            this.logout();
            throw new Error('Session expired');
        }

        return response;
    }
}

// Initialize auth service
const authService = new AuthService();

// Check authentication on page load
document.addEventListener('DOMContentLoaded', async () => {
    // Skip auth check on login page
    if (window.location.pathname.includes('login-modal.html')) {
        return;
    }

    if (!authService.isAuthenticated()) {
        window.location.href = 'login-modal.html';
        return;
    }

    // Verify token
    const isValid = await authService.verifyToken();
    if (!isValid) {
        window.location.href = 'login-modal.html';
    } else {
        // Display user info
        const user = authService.getUser();
        if (user) {
            const userDisplay = document.getElementById('user-display');
            if (userDisplay) {
                userDisplay.textContent = user.username;
            }
        }
    }
});

// Logout handler
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        authService.logout();
    }
}
