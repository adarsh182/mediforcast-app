# MediForecast - Setup & Run Instructions

## Project Overview

A complete, runnable web app that provides **symptom-based healthcare guidance** and **hospital recommendations** using:
- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **AI**: Google Gemini API
- **No TypeScript, no database required** ✅

---

## Project Structure

```
mediforcast/
├── backend/
│   ├── package.json
│   ├── server.js
│   ├── .env.example
│   └── src/
│       ├── routes/
│       │   ├── symptoms.js
│       │   └── hospitals.js
│       ├── services/
│       │   └── geminiClient.js
│       └── data/
│           └── hospitals.js
│
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.cjs
│   ├── postcss.config.cjs
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── api/
│       │   └── client.js
│       ├── pages/
│       │   ├── Home.jsx
│       │   └── Result.jsx
│       └── components/
│           ├── Layout.jsx
│           ├── SymptomForm.jsx
│           ├── SeverityBadge.jsx
│           ├── AdviceSection.jsx
│           ├── HospitalList.jsx
│           ├── DisclaimerBanner.jsx
│           └── LoadingSpinner.jsx
│
└── .gitignore
```

---

## Prerequisites

- **Node.js 14+** and **npm** installed
- **Gemini API Key** (get from https://ai.google.dev/)
- **PowerShell 5.1** (already available on Windows)

---

## Step 1: Get Gemini API Key

1. Go to [Google AI Studio](https://ai.google.dev/)
2. Click "Get API Key"
3. Create a new project or use existing
4. Copy your API key
5. Save it safely (you'll need it in Step 3)

---

## Step 2: Setup Backend

### 2.1 Navigate to backend folder
```powershell
cd backend
```

### 2.2 Create `.env` file
Copy the `.env.example` and create `.env`:
```powershell
copy .env.example .env
```

### 2.3 Edit `.env` with your API key
Open `backend/.env` and replace:
```
GEMINI_API_KEY=your_api_key_here
```
with your actual Gemini API key.

Example:
```
PORT=5000
GEMINI_API_KEY=AIzaSyD_1234567890abcdefgh
GEMINI_API_URL=https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent
```

### 2.4 Install dependencies
```powershell
npm install
```

### 2.5 Start backend server
```powershell
npm run dev
```

Expected output:
```
Server running on http://localhost:5000
```

**Keep this terminal open.** Open a new terminal for the frontend.

---

## Step 3: Setup Frontend

### 3.1 Open new terminal and navigate to frontend
```powershell
cd frontend
```

### 3.2 Install dependencies
```powershell
npm install
```

### 3.3 Start frontend dev server
```powershell
npm run dev
```

Expected output:
```
  VITE v5.0.0  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

---

## Step 4: Use the App

1. Open your browser to **http://localhost:5173/**
2. Describe your symptoms in natural language
3. Select age range, gender (optional), city, and any chronic conditions
4. Click "Get Guidance"
5. View results with:
   - Severity level
   - Recommended care setting & urgency
   - Recommended hospital departments
   - Self-care tips
   - Red flag symptoms to watch
   - Nearby hospital recommendations
6. Click "Start Over" to check again

---

## Scripts Reference

### Backend
```powershell
cd backend
npm run dev      # Development mode with auto-reload
npm start        # Production mode
```

### Frontend
```powershell
cd frontend
npm run dev      # Development mode
npm run build    # Build for production
npm run preview  # Preview production build
```

---

## Safety Features Implemented ✅

### 1. **No Diagnosis**
- System prompt explicitly forbids diagnosing diseases
- AI only summarizes symptoms and suggests specialties

### 2. **No Medication Prescriptions**
- Blocked at system prompt level
- Self-care tips are non-medication only

### 3. **Emergency Safety**
- Backend auto-detects high/emergency severity
- Forces emergency advice if needed
- Clear disclaimers on all pages

### 4. **Multi-Layer Disclaimers**
- Home page disclaimer banner
- Result page disclaimer banner
- LLM-generated disclaimer
- Footer disclaimer text

### 5. **Input Validation**
- Frontend: validates symptom text (min 3 chars)
- Backend: validates JSON, adds safe defaults
- Handles Gemini API failures gracefully

---

## Troubleshooting

### "Cannot find module 'express'"
```powershell
cd backend
npm install
```

### Port 5000 already in use?
Edit `backend/.env`:
```
PORT=5001
```
Then restart backend and update frontend's `vite.config.js`:
```javascript
target: 'http://localhost:5001'
```

### Frontend can't connect to backend
1. Ensure backend is running on http://localhost:5000
2. Check that CORS is enabled in `backend/server.js` ✅ (already done)
3. Check browser console for errors

### Gemini API returns error
1. Verify API key is correct in `.env`
2. Check you have internet connection
3. Check Gemini API quota in Google AI Studio

### "localhost:5173 refused to connect"
Ensure frontend dev server is running:
```powershell
cd frontend
npm run dev
```

---

## Hospital Data

Currently includes sample hospitals in:
- **Mumbai** (3 hospitals)
- **Pune** (3 hospitals)
- **Delhi** (3 hospitals)

To add more hospitals, edit `backend/src/data/hospitals.js`.

---

## Production Deployment (Optional)

### Build Frontend
```powershell
cd frontend
npm run build
```
Creates optimized build in `frontend/dist/`

### Deploy Backend
```powershell
cd backend
npm start
```
(Set `NODE_ENV=production`)

---

## Code Walkthrough for Your Colleagues

### Key Files Explained:

**`backend/server.js`**: Express server setup, CORS enabled, routes mounted
**`backend/src/services/geminiClient.js`**: Core AI logic, system prompt, safety checks
**`backend/src/routes/symptoms.js`**: API endpoint `/api/symptoms/analyze`
**`backend/src/routes/hospitals.js`**: API endpoint `/api/hospitals`

**`frontend/src/App.jsx`**: React Router setup
**`frontend/src/pages/Home.jsx`**: Input form & home page
**`frontend/src/pages/Result.jsx`**: Results display page
**`frontend/src/components/SymptomForm.jsx`**: Reusable form component

### Data Flow:
1. User enters symptoms on Home page
2. Frontend calls `POST /api/symptoms/analyze`
3. Backend calls Gemini API with strict system prompt
4. Gemini returns JSON analysis
5. Backend validates & adds safety defaults
6. Frontend displays on Result page
7. Frontend fetches hospitals via `GET /api/hospitals?city=X&department=Y`

---

## Testing

### Test Case 1: Normal Symptom
Input: "I have a cough and sore throat for 2 days"
Expected: Low-to-moderate severity, suggest clinic visit

### Test Case 2: Emergency Symptom
Input: "I'm having chest pain and difficulty breathing"
Expected: Emergency severity, urgent advice, red flags

### Test Case 3: Edge Case
Input: "abc"
Expected: Frontend error: "Please describe your symptoms (at least 3 characters)"

---

## API Endpoints

### POST /api/symptoms/analyze
Analyzes symptoms and returns guidance.

**Request:**
```json
{
  "text": "string",
  "ageRange": "string (optional)",
  "gender": "string (optional)",
  "city": "string (optional)",
  "chronicConditions": ["string"] (optional)
}
```

**Response:**
```json
{
  "result": {
    "symptom_summary": "string",
    "possible_body_systems": ["string"],
    "severity_level": "low | medium | high | emergency",
    "recommended_care_setting": "self-care | outpatient-clinic | urgent-care-same-day | emergency-department",
    "recommended_specialties": ["string"],
    "urgency_advice": "string",
    "suggested_next_steps": ["string"],
    "red_flag_symptoms_to_watch": ["string"],
    "clarifying_questions": ["string"],
    "self_care_tips": ["string"],
    "disclaimer": "string"
  }
}
```

### GET /api/hospitals
Filters hospitals by city and department.

**Query Parameters:**
- `city`: "Mumbai" | "Pune" | "Delhi" (optional)
- `department`: Hospital department name (optional)

**Response:**
```json
{
  "hospitals": [
    {
      "id": 1,
      "name": "string",
      "city": "string",
      "departments": ["string"],
      "address": "string",
      "phone": "string",
      "mapsUrl": "string"
    }
  ]
}
```

---

## Environment Variables

### Backend `.env`
```
PORT=5000
GEMINI_API_KEY=your_api_key
- GEMINI_API_URL=https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent
```

Frontend uses `vite.config.js` proxy for API calls.

---

## Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| AI | Google Gemini API |
| Database | None (in-memory) |
| Language | JavaScript (ES6+, no TypeScript) |

---

## Notes

- ✅ No database needed (hospitals are in-code)
- ✅ No login/auth system (localhost only)
- ✅ No TypeScript (pure JavaScript)
- ✅ Minimal config (Tailwind, Vite, Express only)
- ✅ Healthcare-safe (multi-layer safety checks)
- ✅ Explainable code (good for team discussions)

---

## Support & Questions

If you encounter any issues:

1. Check the **Troubleshooting** section above
2. Verify both backend & frontend servers are running
3. Check browser console for errors (F12)
4. Check backend server terminal for error messages
5. Ensure `.env` has correct Gemini API key

---

Good luck! 🚀
