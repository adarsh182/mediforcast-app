# 🏥 MediForecast - Complete Symptom Guidance System

> A production-ready, explainable, healthcare-safe web application for symptom-based guidance and hospital recommendations.

## ✨ Features

✅ **AI-Powered Symptom Analysis**
- Users describe symptoms in natural language
- Google Gemini API analyzes with healthcare safety guardrails
- Returns severity level, recommended specialists, and next steps

✅ **Hospital Recommendations**
- Filters hospitals by user-selected city & recommended department
- Shows addresses, phone numbers, and Google Maps directions
- Pre-loaded with hospitals in Mumbai, Pune, Delhi

✅ **Multi-Layer Safety**
- Strict system prompt forbids diagnosis and medication prescriptions
- Backend validation adds safety defaults if AI fails
- Prominent disclaimers on every page
- Emergency detection with clear instructions to call services

✅ **Simple Tech Stack** (Easy to explain to colleagues)
- Frontend: React + Vite + Tailwind CSS (no TypeScript)
- Backend: Node.js + Express (plain JavaScript)
- AI: Google Gemini API
- No database (hospitals data in code)
- No authentication required (localhost demo)

✅ **Fully Explainable Code**
- Clear folder structure
- Named functions & components
- Comments where needed
- No complex abstractions
- Perfect for team discussions

---

## 📋 Quick Links

- **[QUICK_START.md](./QUICK_START.md)** - Get running in 5 minutes
- **[SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md)** - Detailed setup guide
- **[CODE_REFERENCE.md](./CODE_REFERENCE.md)** - Deep dive into every file

---

## 🚀 Get Started (TL;DR)

### Prerequisites
- Node.js 14+ with npm
- Google Gemini API Key (free from https://ai.google.dev/)

### 3 Steps to Run

**Step 1: Backend Setup**
```powershell
cd backend
npm install
# Create .env file with:
# PORT=5000
# GEMINI_API_KEY=your_api_key_here
# GEMINI_API_URL=https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent
npm run dev
```

**Step 2: Frontend Setup (new terminal)**
```powershell
cd frontend
npm install
npm run dev
```

**Step 3: Open Browser**
```
http://localhost:5173/
```

✅ **Done!** App is running.

---

## 📁 Project Structure

```
mediforcast/
├── backend/                          # Node.js + Express API (port 5000)
│   ├── package.json                  # Dependencies
│   ├── server.js                     # Express app entry point
│   ├── .env                          # API keys (create this!)
│   ├── .env.example                  # Template
│   └── src/
│       ├── routes/
│       │   ├── symptoms.js           # POST /api/symptoms/analyze
│       │   └── hospitals.js          # GET /api/hospitals
│       ├── services/
│       │   └── geminiClient.js       # Gemini API integration & safety logic
│       └── data/
│           └── hospitals.js          # Hospital dataset (9 sample hospitals)
│
├── frontend/                         # React + Vite UI (port 5173)
│   ├── package.json                  # Dependencies
│   ├── index.html                    # HTML entry point
│   ├── vite.config.js                # Vite config + API proxy
│   ├── tailwind.config.cjs           # Tailwind CSS config
│   ├── postcss.config.cjs            # PostCSS config
│   └── src/
│       ├── main.jsx                  # React app bootstrap
│       ├── App.jsx                   # React Router setup
│       ├── index.css                 # Tailwind CSS import
│       ├── api/
│       │   └── client.js             # Axios API client
│       ├── pages/
│       │   ├── Home.jsx              # "/" - Input form page
│       │   └── Result.jsx            # "/result" - Results display page
│       └── components/
│           ├── Layout.jsx            # Wrapper with header/footer
│           ├── SymptomForm.jsx       # Main form component
│           ├── SeverityBadge.jsx     # Color-coded severity display
│           ├── AdviceSection.jsx     # Reusable advice list component
│           ├── HospitalList.jsx      # Hospital cards with call/directions buttons
│           ├── DisclaimerBanner.jsx  # Safety disclaimer (reusable)
│           └── LoadingSpinner.jsx    # Loading indicator
│
├── .gitignore                        # Git ignore rules
├── QUICK_START.md                    # 5-minute setup guide
├── SETUP_INSTRUCTIONS.md             # Detailed setup + troubleshooting
├── CODE_REFERENCE.md                 # Code walkthrough for colleagues
└── README.md                         # This file
```

---

## 🔒 Healthcare Safety

### System Prompt Enforcement
```
✅ Can: Summarize symptoms, estimate severity, suggest departments
❌ Cannot: Diagnose diseases, prescribe medications, give treatment plans
```

### Multi-Layer Defense
1. **LLM Layer**: Strict system prompt in `geminiClient.js`
2. **Backend Layer**: `buildSafeResult()` adds safety defaults
3. **Emergency Layer**: Auto-detects high/emergency cases, forces emergency language
4. **UI Layer**: Prominent disclaimers, red warnings, clear emergency instructions

### Safety Checks Implemented
```javascript
// Emergency Detection
if (severity_level === 'emergency' || recommended_care_setting === 'emergency-department') {
  force urgency_advice to mention "Call emergency services"
}

// Medication Prevention
// System prompt forbids drug names
// Self-care tips are generic only (rest, hydrate, monitor)

// Diagnosis Prevention
// AI only returns severity estimates, not disease names
```

---

## 🛠️ Technology Stack

| Layer | Technology | Why This? |
|-------|-----------|----------|
| Frontend UI | React 18 | Industry standard, component-based |
| Build Tool | Vite | Fast, modern, great DX |
| Styling | Tailwind CSS | Utility-first, clean dark theme |
| Routing | React Router v6 | Standard React routing |
| HTTP Client | Axios | Clean API, error handling |
| Backend | Express.js | Lightweight, perfect for API |
| Language | JavaScript (ES6+) | No TypeScript = easier to teach |
| AI | Google Gemini API | Free tier available, powerful models |
| Database | None | In-memory hospitals.js (simplicity first) |

---

## 📱 User Flow

```
1. User opens Home page (/)
   ↓
2. User describes symptoms + selects metadata
   ↓
3. Frontend validates & calls POST /api/symptoms/analyze
   ↓
4. Backend calls Gemini API with strict system prompt
   ↓
5. Gemini returns JSON analysis (with safety guardrails)
   ↓
6. Backend validates response, adds safety defaults
   ↓
7. Frontend navigates to Result page (/result)
   ↓
8. Result page displays guidance (severity, care setting, specialists)
   ↓
9. Frontend calls GET /api/hospitals?city=X&department=Y
   ↓
10. Backend returns filtered hospitals
   ↓
11. Frontend displays hospitals with call/directions buttons
   ↓
12. User can click "Start Over" to go back to Home
```

---

## 🧪 Testing

### Test Case 1: Normal Symptom
```
Input: "I have a cough for 2 days"
Expected: Low-medium severity, clinic visit, General Physician
```

### Test Case 2: Emergency Symptom
```
Input: "Severe chest pain and difficulty breathing"
Expected: EMERGENCY badge, "Call emergency services NOW", red flags list
```

### Test Case 3: Invalid Input
```
Input: "" or "ab"
Expected: Frontend error "Please describe your symptoms"
```

### Test Case 4: API Failure
```
Scenario: Backend offline
Expected: LoadingSpinner → Timeout → Error message
```

---

## 📝 API Endpoints

### POST /api/symptoms/analyze
Analyzes symptoms and returns AI guidance.

**Request Body:**
```json
{
  "text": "I have a cough for 3 days",
  "ageRange": "18-40",
  "gender": "male",
  "city": "Mumbai",
  "chronicConditions": ["Diabetes", "Asthma"]
}
```

**Response:**
```json
{
  "result": {
    "symptom_summary": "User describes a persistent cough for 3 days...",
    "possible_body_systems": ["respiratory"],
    "severity_level": "low",
    "recommended_care_setting": "outpatient-clinic",
    "recommended_specialties": ["General Physician", "Pulmonology"],
    "urgency_advice": "See a doctor within the week if symptoms persist...",
    "suggested_next_steps": ["Schedule appointment", "Monitor", "Avoid triggers"],
    "red_flag_symptoms_to_watch": ["High fever", "Difficulty breathing", "Chest pain"],
    "clarifying_questions": ["Is there phlegm?", "Any chest pain?"],
    "self_care_tips": ["Rest", "Stay hydrated", "Use humidifier"],
    "disclaimer": "This is NOT a medical diagnosis..."
  }
}
```

### GET /api/hospitals
Filters hospitals by city and department.

**Query Parameters:**
- `city` (optional): "Mumbai", "Pune", or "Delhi"
- `department` (optional): Any department name

**Response:**
```json
{
  "hospitals": [
    {
      "id": 1,
      "name": "City Care Hospital",
      "city": "Mumbai",
      "departments": ["General Physician", "Cardiology", "Emergency Medicine"],
      "address": "123 MG Road, Ghatkopar, Mumbai",
      "phone": "+91-9876543210",
      "mapsUrl": "https://maps.google.com/?q=City+Care+Hospital+Mumbai"
    }
  ]
}
```

---

## 🔑 Environment Variables

### Backend (.env)
```
PORT=5000
# GEMINI_API_KEY=AIzaSyD_xxxxxxxxxxxxx
# GEMINI_API_URL=https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent
```

### Frontend
No `.env` needed. API endpoint is proxied through Vite.

---

## 🚨 Emergency Handling

The system detects emergency symptoms and enforces urgent action:

```javascript
// Automatic detection
if (severity_level === "high" || severity_level === "emergency" ||
    recommended_care_setting === "emergency-department") {
  
  // Force emergency language
  urgency_advice = "URGENT: " + urgency_advice + 
                   " Seek emergency care or call emergency services immediately."
}
```

**Emergency Keywords Detected by Gemini:**
- Chest pain
- Difficulty breathing
- Stroke symptoms
- Severe bleeding
- Severe head injury
- Suicidal thoughts
- Loss of consciousness

---

## 📚 Documentation

1. **QUICK_START.md** (5 minutes)
   - Fastest way to get running
   - Basic troubleshooting
   - Test case

2. **SETUP_INSTRUCTIONS.md** (detailed)
   - Step-by-step setup
   - Comprehensive troubleshooting
   - API endpoint examples
   - Deployment notes

3. **CODE_REFERENCE.md** (deep dive)
   - Every file explained
   - Data flow diagrams
   - Safety implementation details
   - Future enhancement ideas
   - Debugging tips

4. **README.md** (this file)
   - Overview
   - Quick links
   - Feature summary

---

## 🎯 Design Philosophy

### "Simple Over Complex"
- No TypeScript (easier to explain)
- No decorators or advanced patterns
- Clear function and variable names
- Comments where needed

### "Safety First"
- Multiple layers of safety checks
- Fail-safe defaults (medium severity, clinic visit)
- Prominent disclaimers on every page
- Emergency detection is aggressive (false positives better than false negatives)

### "Educational"
- Clear folder structure
- Explainable code
- Perfect for teaching/learning
- Good documentation

### "Maintainable"
- Single responsibility principle
- Separated concerns (routes, services, data)
- Reusable components
- Easy to extend

---

## 🔄 Common Workflows

### For Team Walkthrough
1. Open `CODE_REFERENCE.md`
2. Walk through `backend/src/services/geminiClient.js` (the core safety logic)
3. Explain `backend/src/routes/symptoms.js` (how it's called)
4. Show `frontend/src/pages/Home.jsx` (user input)
5. Show `frontend/src/pages/Result.jsx` (results display)
6. Emphasize: disclaimers, safety checks, no diagnosis

### For Code Review
1. System prompt safety rules
2. Backend emergency detection logic
3. Frontend disclaimer placement
4. Input validation (frontend & backend)
5. Error handling

### For Adding Features
1. Edit `backend/src/data/hospitals.js` for new hospitals
2. Edit Tailwind config for styling
3. Create new components in `frontend/src/components/`
4. Add routes to `backend/src/routes/`
5. Update `frontend/src/pages/` as needed

---

## ❓ FAQ

### Q: Why no database?
A: Requirements said keep it simple. Hospitals data is just 9 entries. Easy to replace with DB later if needed.

### Q: Why no TypeScript?
A: Easier to explain to colleagues. Direct feedback from runtime. Less boilerplate.

### Q: Is this HIPAA compliant?
A: No. This is an educational demo. For production:
   - Add authentication
   - Encrypt data
   - Add audit logs
   - Meet HIPAA compliance
   - Use real hospital data
   - Add proper error handling

### Q: Can users save their history?
A: Yes, on frontend via localStorage (browser storage). No server persistence.

### Q: How do I update hospital data?
A: Edit `backend/src/data/hospitals.js` and redeploy backend. Easy to replace with API call later.

### Q: What if Gemini API fails?
A: Backend returns safe defaults (medium severity, clinic visit, GP recommendation).

### Q: Can this diagnose diseases?
A: No. System prompt explicitly forbids it. Only estimates severity & suggests specialists.

### Q: What if user gets emergency symptom?
A: Backend auto-detects & forces emergency language. Clear "Call emergency services" instruction.

---

## 🚀 Deployment

### Frontend (Vercel, Netlify, GitHub Pages)
```powershell
cd frontend
npm run build
# Deploy 'dist' folder
```

### Backend (Heroku, Railway, AWS)
```powershell
cd backend
npm start
# Set environment variables in hosting platform
```

**Important:** Update frontend's API endpoint in `frontend/src/api/client.js` to point to deployed backend.

---

## 📞 Support

| Issue | Solution |
|-------|----------|
| Backend won't start | Check `.env` has GEMINI_API_KEY |
| Frontend can't reach API | Ensure backend is running on :5000 |
| Gemini error | Verify API key is correct |
| Module errors | Run `npm install` in that folder |
| Port conflicts | Change port in `.env` or `vite.config.js` |

See **SETUP_INSTRUCTIONS.md** for detailed troubleshooting.

---

## 📄 License & Safety Note

⚠️ **Important**: This is a demonstration/educational tool. It is NOT suitable for:
- Actual medical diagnosis
- Treatment planning
- Professional medical advice
- HIPAA-regulated environments

For real healthcare applications:
- Add proper authentication & authorization
- Implement data encryption
- Add audit logging
- Meet regulatory compliance (HIPAA, GDPR, etc.)
- Use qualified medical review boards
- Add professional medical oversight

---

## 🎉 You're Ready!

```powershell
# Terminal 1: Backend
cd backend && npm install && npm run dev

# Terminal 2: Frontend  
cd frontend && npm install && npm run dev

# Browser
http://localhost:5173/
```

**Next Steps:**
1. Read [QUICK_START.md](./QUICK_START.md) for first run
2. Check [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md) for detailed setup
3. Review [CODE_REFERENCE.md](./CODE_REFERENCE.md) to understand code
4. Test with sample symptoms
5. Walk through with colleagues

---

**Built with ❤️ for educational and demonstration purposes**
