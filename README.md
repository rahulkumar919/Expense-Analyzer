# ExpenseAnalyzer Pro - Frontend

## 🚀 Quick Start

### Local Development

1. Open `index.html` in browser
2. Or use Live Server in VS Code

### Configuration

**IMPORTANT:** Backend URL set karo!

Edit `config.js`:
```javascript
const API_CONFIG = {
    BASE_URL: 'https://your-backend-app.onrender.com/api'
};
```

## 📦 Deployment (Vercel)

### Method 1: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Production
vercel --prod
```

### Method 2: GitHub + Vercel Dashboard

1. Push code to GitHub
2. Go to Vercel.com
3. Import Project
4. Deploy!

## 🎨 Features

- Modern pink & white design
- Responsive layout
- Smooth animations
- Chart.js visualizations
- AI-powered insights

## 📁 Structure

```
FRONTEND/
├── index.html          # Main dashboard
├── login.html          # Login/Signup page
├── config.js           # API configuration
├── vercel.json         # Vercel config
├── static/
│   ├── css/
│   │   └── style.css   # All styles
│   ├── js/
│   │   └── script.js   # Main logic
│   └── images/
│       └── logo.svg    # Logo
└── README.md
```

## 🔧 Tech Stack

- HTML5
- CSS3 (Custom + Animations)
- Vanilla JavaScript
- Chart.js
- Font Awesome Icons
