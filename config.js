// ============================================
// API Configuration
// ============================================

// IMPORTANT: Production me apna backend URL yahan dalo!
const API_CONFIG = {
    // Development (Local testing)
    BASE_URL: 'http://localhost:5001/api',
    
    // Production (Render backend URL yahan dalo)
    // BASE_URL: 'https://your-backend-app.onrender.com/api',
    
    // API Endpoints
    ENDPOINTS: {
        HEALTH: '/health',
        SIGNUP: '/signup',
        LOGIN: '/login',
        LOGOUT: '/logout',
        ADD_EXPENSE: '/add_expense',
        GET_EXPENSES: '/expenses',
        UPDATE_EXPENSE: '/update_expense',
        DELETE_EXPENSE: '/delete_expense',
        ANALYSIS: '/analysis'
    }
};

// ============================================
// API Helper Function
// ============================================

async function apiCall(endpoint, method = 'GET', data = null) {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include' // Cookies ke liye
    };
    
    if (data && method !== 'GET') {
        options.body = JSON.stringify(data);
    }
    
    try {
        console.log(`API Call: ${method} ${url}`);
        const response = await fetch(url, options);
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || 'API Error');
        }
        
        console.log('API Response:', result);
        return result;
    } catch (error) {
        console.error('API Call Error:', error);
        throw error;
    }
}

// ============================================
// Export for use in other files
// ============================================
window.API_CONFIG = API_CONFIG;
window.apiCall = apiCall;

console.log('✅ API Config loaded:', API_CONFIG.BASE_URL);
