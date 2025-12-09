# Mediforcast - Project Structure

## Overview
Professional healthcare symptom guidance application with AI-powered analysis using Google Gemini API.

## Directory Structure

```
mediforcast/
├── docs/                          # Documentation & guides
│   ├── README.md                 # Main project overview
│   ├── QUICK_START.md            # Quick setup guide
│   ├── ARCHITECTURE.md           # System architecture
│   ├── RENDER_NETLIFY_DEPLOYMENT.md  # Deployment guide
│   └── ...                       # Other documentation
│
├── backend/                       # Express.js API server
│   ├── index.js                  # Entry point
│   ├── package.json              # Dependencies & scripts
│   ├── config/
│   │   └── server.js             # Express app configuration
│   ├── src/
│   │   ├── routes/               # API endpoints
│   │   │   ├── symptoms.js       # POST /api/symptoms/analyze
│   │   │   └── hospitals.js      # GET /api/hospitals
│   │   ├── services/             # Business logic
│   │   │   └── geminiClient.js   # Gemini API integration
│   │   └── data/
│   │       └── hospitals.js      # Hospital database
│   ├── constants/                # App constants (empty)
│   ├── middleware/               # Custom middleware (empty)
│   └── utils/                    # Utility functions (empty)
│
├── frontend/                      # React + Vite SPA
│   ├── package.json              # Dependencies & scripts
│   ├── vite.config.js            # Vite configuration
│   ├── tailwind.config.cjs       # Tailwind CSS config
│   ├── netlify.toml              # Netlify deployment config
│   ├── index.html                # HTML entry point
│   └── src/
│       ├── main.jsx              # React entry point
│       ├── App.jsx               # Root component
│       ├── index.css             # Global styles
│       ├── api/
│       │   └── client.js         # Axios HTTP client
│       ├── pages/                # Page components
│       │   ├── Home.jsx          # Symptom input page
│       │   └── Result.jsx        # Results display page
│       └── components/           # Reusable components
│           ├── Layout.jsx        # Page wrapper
│           ├── SymptomForm.jsx   # Input form
│           ├── HospitalList.jsx  # Hospital display
│           ├── SeverityBadge.jsx # Severity indicator
│           ├── DisclaimerBanner.jsx  # Safety disclaimer
│           ├── AdviceSection.jsx # Tips/advice display
│           └── LoadingSpinner.jsx    # Loading indicator
│
├── .gitignore                     # Git ignore rules
└── PROJECT_STRUCTURE.md           # This file
```

## Key Files by Responsibility

### Backend Architecture
- **index.js** → Entry point that imports server
- **config/server.js** → Express app setup, routes, middleware
- **src/routes/symptoms.js** → Symptom analysis endpoint with validation
- **src/routes/hospitals.js** → Hospital search endpoint
- **src/services/geminiClient.js** → **CRITICAL SAFETY FILE** with 4-layer validation
- **src/data/hospitals.js** → Hardcoded hospital database

### Frontend Architecture
- **index.html** → HTML template
- **src/main.jsx** → React app initialization
- **src/App.jsx** → Router setup
- **src/api/client.js** → Axios instance pointing to Render backend
- **src/pages/\*.jsx** → Page-level components
- **src/components/\*.jsx** → Reusable UI components

## Technology Stack

**Backend:**
- Node.js with Express.js
- Google Gemini 2.5-flash API
- dotenv for environment variables
- CORS enabled for cross-origin requests

**Frontend:**
- React 18
- Vite (build tool)
- React Router v6 (navigation)
- Tailwind CSS (styling)
- Axios (HTTP client)

**Deployment:**
- Backend: Render.com (free tier)
- Frontend: Netlify (free tier)
- Repository: GitHub (https://github.com/adarsh182/mediforcast-app)

## Environment Variables

### Backend (.env - NOT in git)
```
PORT=5000
GEMINI_API_KEY=your_key_here
GEMINI_API_URL=https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent
```

### Frontend (netlify.toml - in git)
```
REACT_APP_API_URL=https://mediforcast-app.onrender.com/api
NODE_VERSION=20
```

## Running Locally

**Backend:**
```bash
cd backend
npm install
npm run dev  # or: npm start
# Server runs on http://localhost:5000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# App runs on http://localhost:5173
```

## Production URLs
- **Frontend:** https://mediforcast-app.netlify.app
- **Backend API:** https://mediforcast-app.onrender.com/api
- **Repository:** https://github.com/adarsh182/mediforcast-app

## Security Features
1. **System Prompt Validation** - Gemini constraints to never diagnose
2. **Backend Validation** - Minimum symptom text validation
3. **Emergency Detection** - Flags high/emergency severity responses
4. **UI Disclaimers** - Multiple safety notices throughout app

## Maintenance Notes
- Update hospital data in `backend/src/data/hospitals.js`
- Regenerate Gemini API keys in Render environment variables
- Monitor Render & Netlify build logs for deployment issues
- All secrets in `backend/.env` - NEVER commit
