# MediForecast - Code Reference Guide

## Backend Architecture

### 1. Entry Point: `backend/server.js`

```javascript
- Imports: express, cors, dotenv
- Creates Express app on PORT (default 5000)
- Enables CORS for frontend communication
- Mounts routes:
  - /api/symptoms → symptomsRouter
  - /api/hospitals → hospitalsRouter
- GET /api/health → status check endpoint
```

**Why this structure?**
- CORS enabled so frontend at `localhost:5173` can call backend at `localhost:5000`
- Modular route structure = easy to understand
- Health check endpoint for debugging

---

### 2. Core Service: `backend/src/services/geminiClient.js`

**Key Functions:**

#### `SYMPTOM_GUIDE_SYSTEM_PROMPT` (String Constant)
- Defines the AI's behavior
- Enforces safety rules:
  - ❌ NO diagnosis
  - ❌ NO medication/drugs
  - ✅ YES to severity estimates
  - ✅ YES to specialty suggestions
- Forces JSON output format
- Emergency bias: detects high-risk symptoms

**Why strict system prompt?**
- Healthcare tool = safety critical
- Prevents model from "making up" medical advice
- Ensures consistent JSON structure
- Clear liability protection

#### `callGeminiForSymptoms(symptoms, ageRange, gender, chronicConditions)`
- **Input**: user's symptom description + metadata
- **Process**:
  1. Validates API key & URL from environment
  2. Builds user prompt with symptom details
  3. Sends POST to Gemini API with system prompt
  4. Gets back JSON text
  5. Cleans JSON (removes markdown code blocks)
  6. Parses JSON object
- **Output**: JavaScript object with AI's analysis
- **Error handling**: Logs errors, throws for caller to handle

**Why separate from route?**
- Reusable service (could add caching later)
- Easier to test
- Clear separation of concerns

#### `buildSafeResult(geminiResult)`
- **Input**: Raw JSON from Gemini
- **Process**:
  1. Merges with safe defaults (in case Gemini forgets fields)
  2. Ensures all arrays are actually arrays (not strings)
  3. **CRITICAL**: If severity is "high" or "emergency", forces emergency language in `urgency_advice`
  4. Returns validated result object
- **Output**: Safe, complete result guaranteed to have all fields
- **Why this?**: Defense-in-depth. Even if AI forgets emergency handling, backend catches it.

**Default Fallback Values:**
```javascript
{
  symptom_summary: "Unable to process symptoms at this time.",
  possible_body_systems: ["general"],
  severity_level: "medium",
  recommended_care_setting: "outpatient-clinic",
  recommended_specialties: ["General Physician"],
  urgency_advice: "Please consult a qualified healthcare provider...",
  // ... more defaults
}
```

---

### 3. Symptom Analysis Route: `backend/src/routes/symptoms.js`

#### `POST /api/symptoms/analyze`

**Input Validation:**
```javascript
if (!text || text.trim().length < 3) {
  return 400 error
}
```
- Ensures user actually described something
- Prevents abuse (empty requests)

**Processing Steps:**
1. Call `callGeminiForSymptoms(text, age, gender, conditions)`
2. Wrap result with `buildSafeResult()`
3. Store in memory array (for "previous checks" feature)
4. Return `{ result: safeResult }`

**Error Handling:**
- Gemini API fails? → 500 error with friendly message
- Invalid JSON? → caught by buildSafeResult's merge logic
- Network error? → axios throws, caught by try-catch

**In-Memory Storage:**
```javascript
previousChecks = [] // Stores last 10 checks
// Each check: { id, timestamp, symptoms, result }
// Useful for demo; replace with DB for production
```

#### `GET /api/symptoms/previous`
- Returns in-memory history (for "see past results" feature)
- Frontend uses localStorage; backend is just for demo

---

### 4. Hospital Matching: `backend/src/routes/hospitals.js`

#### `GET /api/hospitals`

**Query Parameters:**
- `?city=Mumbai` → filter by city
- `?department=Cardiology` → filter by department
- Both optional

**Filtering Logic:**
```javascript
if (city) filter where hospital.city === city (case-insensitive)
if (department) filter where hospital.departments includes department
```

**Returns:**
```json
{
  "hospitals": [
    {
      "id": 1,
      "name": "City Care Hospital",
      "city": "Mumbai",
      "departments": ["General Physician", "Cardiology"],
      "address": "123 MG Road, Mumbai",
      "phone": "+91-1234567890",
      "mapsUrl": "https://maps.google.com/?q=..."
    }
  ]
}
```

**Why this design?**
- No database needed (data in `hospitals.js`)
- Case-insensitive matching (user typos don't break it)
- Easy to extend with real hospital data
- Multiple departments per hospital (realistic)

---

### 5. Hospital Data: `backend/src/data/hospitals.js`

**Data Structure:**
```javascript
[
  {
    id: 1,
    name: "City Care Hospital",
    city: "Mumbai",           // Must match city dropdown options
    departments: [            // Array of available specialties
      "General Physician",
      "Cardiology",
      "Emergency Medicine"
    ],
    address: "123 MG Road, Ghatkopar, Mumbai",
    phone: "+91-9876543210",
    mapsUrl: "https://maps.google.com/?q=City+Care+Hospital+Mumbai"
  }
]
```

**Sample Data Included:**
- 3 hospitals in Mumbai
- 3 hospitals in Pune
- 3 hospitals in Delhi

**To add real data:**
1. Replace hardcoded array with actual hospitals
2. Keep structure identical
3. Ensure `city` matches frontend city dropdown
4. Get accurate phone & maps URLs

---

## Frontend Architecture

### 1. Entry Point: `frontend/src/main.jsx`

```javascript
- Renders React app into #root div (in index.html)
- Imports App component
- Sets up Tailwind CSS (via index.css)
```

**Why React Router?**
- Single-page app = no page reloads
- State persists across navigation
- Smooth user experience

---

### 2. App Router: `frontend/src/App.jsx`

```javascript
<BrowserRouter>
  <Layout>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/result" element={<Result />} />
    </Routes>
  </Layout>
</BrowserRouter>
```

**Why this structure?**
- `Layout` wraps both pages (header/footer always visible)
- Two routes: Home (input) and Result (output)
- Clean navigation via React Router

---

### 3. Shared Layout: `frontend/src/components/Layout.jsx`

**Features:**
- Header with logo & nav (sticky)
- Main content area (flex-1 = takes remaining space)
- Footer with disclaimer
- Dark theme gradient background

**Responsive Design:**
```css
- Mobile: full width
- Desktop: max-w-4xl (1024px max)
- Dark background: linear-gradient(135deg, #1a1a2e, #16213e)
```

---

### 4. API Client: `frontend/src/api/client.js`

```javascript
const client = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 30000
})

export const analyzeSymptoms = (data) → POST /api/symptoms/analyze
export const getHospitals = (city, department) → GET /api/hospitals?city=X&department=Y
export const getPreviousChecks = () → GET /api/symptoms/previous
```

**Why Axios?**
- Cleaner than fetch API
- Built-in JSON serialization
- Error handling
- Timeout protection (30s)

**Error Format:**
```javascript
try {
  response.data.result // Success
} catch (err) {
  err.response?.data?.error // Error message from backend
  err.message // Network error
}
```

---

### 5. Home Page: `frontend/src/pages/Home.jsx`

**UI Sections:**
1. Hero (title + description)
2. How-it-works cards (3 steps)
3. Disclaimer banner
4. SymptomForm component
5. FAQ / Important info

**Key Feature: LocalStorage**
```javascript
// Save to browser storage
const checks = JSON.parse(localStorage.getItem('symptom_checks') || '[]')
checks.unshift({ id, timestamp, symptoms })
localStorage.setItem('symptom_checks', JSON.stringify(checks.slice(0, 10)))
```
- User can see their "Previous checks" without login
- Max 10 saved locally
- No server involved

---

### 6. Symptom Form: `frontend/src/components/SymptomForm.jsx`

**Form Fields:**
1. **Symptoms textarea** (required)
2. **Age range dropdown** (optional)
3. **Gender dropdown** (optional)
4. **City dropdown** (required: Mumbai/Pune/Delhi)
5. **Chronic conditions chips** (multi-select)

**Form State:**
```javascript
{
  text: string,
  ageRange: string,
  gender: string,
  city: string,
  chronicConditions: [string]
}
```

**Validation:**
- Frontend: text.trim().length check
- Backend: duplicate validation + Gemini error handling

**On Submit:**
1. Validate input
2. Show LoadingSpinner
3. Call `analyzeSymptoms(data)`
4. Save to localStorage
5. Navigate to `/result` with state:
   ```javascript
   navigate('/result', {
     state: { result: response.data.result, city }
   })
   ```

**Why pass city to Result?**
- Result page needs it to fetch hospitals
- State = no extra API call needed

---

### 7. Result Page: `frontend/src/pages/Result.jsx`

**Data Source:**
```javascript
const { result, city } = useLocation().state
// result = AI analysis from backend
// city = user's selected city
```

**Displayed Sections:**
1. Severity badge (color-coded)
2. Symptom summary (AI text)
3. Care setting + urgency advice (critical for safety)
4. Recommended departments (chips)
5. **Disclaimer banner** (prominent)
6. Suggested next steps
7. Red flag symptoms
8. Self-care tips
9. Questions for doctor
10. Hospitals list
11. Full disclaimer + legal text

**Hospitals Fetching:**
```javascript
useEffect(() => {
  getHospitals(city, result.recommended_specialties[0])
  // Fetch on mount with city & first specialty
}, [city, result])
```

**Why useEffect?**
- Runs after component mounts
- Fetches hospitals based on city & specialty
- Shows LoadingSpinner while fetching
- Updates hospital list when data arrives

---

### 8. Component Library

#### `DisclaimerBanner.jsx`
```jsx
<div className="bg-red-900 border-l-4 border-red-600">
  ⚠️ Medical Disclaimer
  This is NOT a medical diagnosis...
</div>
```
- Reusable component
- Shows on Home & Result
- Red background = attention-grabbing
- Small, prominent text

#### `SeverityBadge.jsx`
```jsx
// Maps severity level to color
low → green
medium → yellow
high → orange
emergency → red (with 🚨 emoji)
```
- Visual representation of risk level
- Used at top of Result page
- Easy to spot at a glance

#### `SymptomForm.jsx`
- Large reusable form component
- Handles all input & validation
- Manages form state locally
- Submits to backend

#### `HospitalList.jsx`
- Renders list of hospitals
- Each card has:
  - Name + address
  - Departments (highlights recommended)
  - Call button (tel: link)
  - Get Directions (Google Maps link)
- Loading state
- No hospitals found state

#### `AdviceSection.jsx`
```jsx
<AdviceSection
  title="Self-Care Tips"
  content={["Rest", "Hydrate", "Monitor"]}
  icon="💡"
/>
```
- Reusable section for lists
- Handles arrays of advice
- Pretty formatting
- Empty state handling

#### `LoadingSpinner.jsx`
```jsx
<div className="animate-spin rounded-full h-12 w-12"></div>
```
- Tailwind animation
- Shows during API calls
- Feedback to user

---

## Data Flow Diagram

```
┌─────────────┐
│  User Types │
│  Symptoms   │
└──────┬──────┘
       │
       ▼
┌──────────────────────┐
│  SymptomForm.jsx     │
│  (validate, store)   │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  POST /api/symptoms/analyze          │
│  (axios call from client.js)         │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  backend/routes/symptoms.js          │
│  (validate, call Gemini)             │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  backend/services/geminiClient.js    │
│  (call Gemini API, parse JSON,       │
│   add safety defaults)               │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  GEMINI API (Google's Server)        │
│  (returns JSON analysis)             │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  Response with result JSON           │
│  { symptom_summary, severity, ...}  │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  Result.jsx (navigate with state)    │
│  (displays all advice)               │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  GET /api/hospitals?city=X&dept=Y   │
│  (fetch nearby hospitals)            │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  backend/routes/hospitals.js         │
│  (filter hospitals.js data)          │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  HospitalList.jsx (render list)      │
│  - Call button (tel: link)           │
│  - Directions (Google Maps)          │
└──────────────────────────────────────┘
```

---

## Safety Implementation

### Layer 1: System Prompt (Backend)
```
❌ "Do NOT diagnose diseases"
❌ "Do NOT prescribe medications"
✅ "DO estimate severity (low/medium/high/emergency)"
✅ "DO suggest departments"
✅ "DO provide generic self-care tips"
```

### Layer 2: Backend Validation
```javascript
// If severity is high/emergency, force emergency language
if (severity_level === 'high' || severity_level === 'emergency') {
  ensure urgency_advice mentions emergency services
}
```

### Layer 3: Frontend UI
```
- DisclaimerBanner at top of Home & Result
- Red styling on danger zones
- Explicit "EMERGENCY" badge for high severity
- Clear "Call emergency services" instructions
```

### Layer 4: Content Security
```
- Self-care tips: NO drug names/doses
- Suggested next steps: NO prescriptions
- Red flags: CLEAR emergency criteria
- Disclaimer: Repeated multiple times
```

---

## Environment Setup

### Backend `.env`
```
PORT=5000
GEMINI_API_KEY=AIzaSy...
GEMINI_API_URL=https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent
```

### Frontend (no .env needed)
- API endpoint: hardcoded in `src/api/client.js`
- Proxy in `vite.config.js` (localhost:5000)

---

## Explainability for Colleagues

### "How does it avoid diagnosing?"
The system prompt explicitly says "You are NOT a doctor... do NOT diagnose." 
We reinforce this by:
1. Only asking for severity (not disease name)
2. Suggesting specialists (not diagnoses)
3. Backend overriding any dangerous advice

### "How do we know Gemini won't prescribe drugs?"
1. System prompt forbids it (first thing in prompt)
2. We only ask for self-care tips (no medicine prompt)
3. Backend filters responses for drug names (TODO if paranoid)

### "What if Gemini fails?"
Backend has fallback defaults:
```javascript
const defaults = {
  symptom_summary: "Unable to process...",
  severity_level: "medium", // Safe default (not "low")
  recommended_care_setting: "outpatient-clinic",
  // ... more safe defaults
}
```

### "How is hospital data stored?"
In-memory array in `backend/src/data/hospitals.js`
No database needed. Easy to understand. Easy to replace with real data later.

### "Why no database?"
Requirements said keep it simple. A hardcoded array is:
- Zero setup time
- Easy to explain
- Sufficient for demo/MVP
- Easy to replace with DB later

---

## Testing Scenarios

### Test 1: Normal Cough
**Input**: "I've had a cough for 3 days"
**Expected**:
- Severity: low-medium
- Care: outpatient-clinic
- Specialty: General Physician
- Advice: See doctor if persists > 1 week

### Test 2: Chest Pain (Emergency)
**Input**: "Severe chest pain and shortness of breath"
**Expected**:
- Severity: EMERGENCY 🚨
- Care: emergency-department
- Advice: "Call emergency services IMMEDIATELY"
- Red flags: "Stop reading, go to hospital NOW"

### Test 3: Empty Input
**Input**: "" or "ab"
**Expected**:
- Frontend error: "Please describe your symptoms"
- Form cleared, focused on textarea

### Test 4: API Timeout
**Input**: Normal symptoms but backend offline
**Expected**:
- LoadingSpinner shows for 30s (axios timeout)
- Then error message: "Failed to analyze..."
- User can retry

---

## Performance Considerations

### Frontend
- Vite dev mode: ~200-300ms build time
- React re-renders only changed components
- Tailwind: utility-first (small CSS)
- No images/videos (text only)

### Backend
- Express middleware: minimal overhead
- Gemini API call: 2-5s average latency
- Hospital filtering: O(n) but n=9 hospitals
- In-memory storage: no disk I/O

### Network
- Frontend-to-backend: same machine (~1ms)
- Backend-to-Gemini: over internet (~2-5s)
- No WebSocket/polling (simple request-response)

---

## Future Enhancements

1. **Database**: Replace hospitals.js with PostgreSQL
2. **Authentication**: Add user accounts & history
3. **PDF Reports**: Generate downloadable results
4. **Multi-language**: Translate symptoms & advice
5. **Offline Mode**: Cache recent results
6. **Analytics**: Track symptom patterns (privacy-safe)
7. **Real Hospital Data**: Integrate with hospital APIs
8. **Insurance**: Add insurance provider filtering
9. **Medication Checker**: Safe drug interaction warnings (read-only)
10. **Doctor Booking**: Integrate with doctor appointment platforms

---

## Code Quality Notes

### No TypeScript (by design)
- Easier to explain to team
- Fewer abstractions
- Direct feedback from runtime

### No Decorators/Advanced Patterns
- Simple functions and classes
- Easy to follow code flow
- Good for teaching/learning

### Comments Where Needed
- System prompt has detailed comments
- Edge cases explained in code
- Error handling explicit

### Naming Conventions
- Clear function names: `callGeminiForSymptoms`
- Clear component names: `SymptomForm`, `SeverityBadge`
- Clear state names: `symptom_summary`, `severity_level`

---

## Debugging Tips

### Frontend Issues
1. Open browser DevTools (F12)
2. Check Network tab for API calls
3. Check Console tab for JavaScript errors
4. Check React DevTools (browser extension)

### Backend Issues
1. Check terminal where `npm run dev` is running
2. Look for error stack traces
3. Add console.logs before/after Gemini calls
4. Test API with curl/Postman:
   ```powershell
   Invoke-WebRequest -Uri http://localhost:5000/api/health -Method GET
   ```

### Gemini API Issues
1. Check .env has correct API key
2. Verify API key has Generative Language API enabled
3. Check quota in Google AI Studio
4. Try simpler prompt first (not medical)

---

This should be comprehensive enough to explain to your colleagues! 🎉
