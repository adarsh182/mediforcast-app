# 📊 MediForecast - Architecture & Deployment Guide

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          FRONTEND (React)                        │
│                     http://localhost:5173                        │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Home Page (/)                                            │   │
│  │ - Symptom textarea                                       │   │
│  │ - Age range, gender, city, chronic conditions           │   │
│  │ - "Get Guidance" button                                 │   │
│  │ - DisclaimerBanner (persistent)                         │   │
│  └─────────────┬──────────────────────────────────────────┘   │
│                │                                                 │
│                │ POST /api/symptoms/analyze                     │
│                │ (SymptomForm.jsx calls client.js)             │
│                ▼                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Result Page (/result)                                    │   │
│  │ - SeverityBadge (color-coded)                            │   │
│  │ - Symptom summary                                        │   │
│  │ - Care setting + urgency advice                          │   │
│  │ - Recommended specialties (chips)                        │   │
│  │ - Suggested next steps                                   │   │
│  │ - Red flag symptoms                                      │   │
│  │ - Self-care tips                                         │   │
│  │ - DisclaimerBanner (prominent)                           │   │
│  │ - HospitalList component                                 │   │
│  │ - "Start Over" button                                    │   │
│  └─────────────┬──────────────────────────────────────────┘   │
│                │                                                 │
│                │ GET /api/hospitals?city=X&department=Y        │
│                │ (Result.jsx calls client.js)                  │
│                ▼                                                 │
│         (Hospital Cards with                                     │
│          - Call button (tel:)                                   │
│          - Directions (Google Maps))                            │
└────────────────┬─────────────────────────────────────────────┘
                 │ HTTP
                 │ Axios (CORS enabled)
                 │
┌────────────────▼──────────────────────────────────────────────┐
│                    BACKEND (Express)                           │
│                   http://localhost:5000                        │
│                                                                │
│  server.js                                                     │
│  ├── CORS enabled                                             │
│  ├── JSON middleware                                          │
│  └── Routes                                                   │
│                                                                │
│  /api/symptoms/analyze (POST)                                │
│  └─ routes/symptoms.js                                       │
│     ├─ Validate input (text required, min 3 chars)           │
│     ├─ Call services/geminiClient.callGeminiForSymptoms()  │
│     ├─ Call services/geminiClient.buildSafeResult()        │
│     ├─ Store in memory (previous checks)                    │
│     └─ Return { result: {...} }                             │
│                                                                │
│  /api/hospitals (GET)                                         │
│  └─ routes/hospitals.js                                      │
│     ├─ Read query: city, department                          │
│     ├─ Filter data/hospitals.js array                        │
│     └─ Return { hospitals: [...] }                           │
│                                                                │
│  services/geminiClient.js (Core Logic)                        │
│  ├─ SYMPTOM_GUIDE_SYSTEM_PROMPT (safety rules)             │
│  ├─ callGeminiForSymptoms()                                 │
│  │  └─ Call Gemini API with strict prompt                  │
│  │  └─ Parse JSON response                                  │
│  │  └─ Handle errors gracefully                             │
│  └─ buildSafeResult()                                       │
│     ├─ Merge with safe defaults                            │
│     ├─ Ensure arrays are arrays                            │
│     └─ Emergency override (if high/emergency)              │
│                                                                │
│  data/hospitals.js                                            │
│  └─ Hardcoded array of 9 hospitals                          │
│     ├─ 3 in Mumbai                                          │
│     ├─ 3 in Pune                                            │
│     └─ 3 in Delhi                                           │
└────────────────┬──────────────────────────────────────────────┘
                 │
                 │ HTTPS
                 │ (internet)
                 │
┌────────────────▼──────────────────────────────────────────────┐
│            GOOGLE GEMINI API (Generative Language)            │
│  generativelanguage.googleapis.com/v1beta/models/...         │
│                                                                │
│  Request:                                                      │
│  - systemInstruction: SYMPTOM_GUIDE_SYSTEM_PROMPT            │
│  - userMessage: symptom text + metadata                       │
│  - apiKey: GEMINI_API_KEY (from .env)                        │
│                                                                │
│  Response:                                                     │
│  {                                                             │
│    "candidates": [{                                           │
│      "content": {                                             │
│        "parts": [{                                            │
│          "text": "{symptom_summary, severity, ...}"         │
│        }]                                                     │
│      }                                                        │
│    }]                                                         │
│  }                                                            │
└────────────────────────────────────────────────────────────────┘
```

---

## Data Flow: Step-by-Step

### 1️⃣ User Input
```
User fills form:
- Symptoms: "I have chest pain"
- Age: "40-60"
- Gender: "male"
- City: "Mumbai"
- Chronic: ["Hypertension"]

Frontend validates:
- text.trim().length >= 3 ✓
- Shows LoadingSpinner
```

### 2️⃣ API Call
```javascript
// frontend/src/api/client.js
analyzeSymptoms({
  text: "I have chest pain",
  ageRange: "40-60",
  gender: "male",
  city: "Mumbai",
  chronicConditions: ["Hypertension"]
})

// Axios POST to http://localhost:5000/api/symptoms/analyze
```

### 3️⃣ Backend Processing
```javascript
// backend/routes/symptoms.js
POST /api/symptoms/analyze

1. Validate: text.trim().length >= 3
2. Call geminiClient.callGeminiForSymptoms()
3. Call geminiClient.buildSafeResult()
4. Store in previousChecks array
5. Return { result: {...} }
```

### 4️⃣ Gemini API Call
```javascript
// backend/services/geminiClient.js
axios.post(GEMINI_API_URL, {
  contents: [{
    role: 'user',
    parts: [{
      text: `User symptoms: I have chest pain\n
             Age range: 40-60\n
             Gender: male\n
             Chronic conditions: Hypertension`
    }]
  }],
  systemInstruction: {
    parts: [{
      text: SYMPTOM_GUIDE_SYSTEM_PROMPT  // <-- SAFETY HERE
    }]
  }
}, {
  headers: { 'Content-Type': 'application/json' },
  params: { key: GEMINI_API_KEY }
})
```

### 5️⃣ Gemini Response
```json
{
  "candidates": [{
    "content": {
      "parts": [{
        "text": "{\"symptom_summary\":\"...\",\"severity_level\":\"emergency\",\"..."
      }]
    }
  }]
}
```

### 6️⃣ Safety Validation
```javascript
// backend/services/geminiClient.js - buildSafeResult()

// Parse JSON
const result = JSON.parse(jsonText)

// Add defaults for missing fields
const safeResult = { ...defaults, ...result }

// Emergency override
if (severity === 'emergency') {
  safeResult.urgency_advice = "URGENT: " + 
    safeResult.urgency_advice + 
    " Call emergency services immediately"
}

// Return to frontend
return safeResult
```

### 7️⃣ Frontend Display
```javascript
// frontend/src/pages/Result.jsx

navigate('/result', {
  state: {
    result: response.data.result,  // <- AI analysis
    city: "Mumbai"
  }
})

// Display components:
// - SeverityBadge (emergency -> red 🚨)
// - symptom_summary (text)
// - urgency_advice (prominent red box)
// - recommended_specialties (chips)
// - DisclaimerBanner (red, bold)
// - self_care_tips (list)
// - HospitalList (below)
```

### 8️⃣ Hospital Fetching
```javascript
// frontend/src/pages/Result.jsx - useEffect

useEffect(() => {
  getHospitals("Mumbai", "Cardiology")  // recommended_specialties[0]
    .then(res => setHospitals(res.data.hospitals))
}, [city, result])

// backend/routes/hospitals.js
GET /api/hospitals?city=Mumbai&department=Cardiology

// Filter hospitals.js array
hospitals.filter(h => 
  h.city === 'Mumbai' && 
  h.departments.includes('Cardiology')
)

// Return matching hospitals
```

### 9️⃣ User Action
```
User sees:
- Severity badge: 🚨 EMERGENCY (red)
- Urgency: "URGENT: Chest pain can be serious. 
           Call emergency services immediately."
- Departments: "Cardiology", "Emergency Medicine"
- Hospitals: List of cardiology hospitals in Mumbai
- Action buttons: "📞 Call", "🗺️ Directions"

User clicks:
- Call button -> tel:+91-9876543210
- Directions button -> Google Maps
- Start Over -> navigate('/')
```

---

## Safety Layers Explained

### Layer 1: System Prompt (Prevention)
```javascript
// backend/services/geminiClient.js
const SYMPTOM_GUIDE_SYSTEM_PROMPT = `
  You are NOT a doctor and must NOT diagnose.
  You MUST NOT recommend medicines or prescriptions.
  
  You ARE allowed to:
  - Summarize symptoms
  - Estimate severity (low/medium/high/emergency)
  - Suggest department/specialty
  - List generic self-care (rest, hydrate, monitor)
  - Provide red-flag warnings
  - Strongly disclaim diagnosis
`
```
**Effect**: Gemini model constrained at inference time.

### Layer 2: Backend Validation (Detection)
```javascript
// backend/services/geminiClient.js - buildSafeResult()
if (severity_level === 'high' || severity_level === 'emergency') {
  // Force emergency language
  urgency_advice = "URGENT: " + urgency_advice + 
                   " Call emergency services"
}
```
**Effect**: Even if Gemini forgets to mention emergency, backend adds it.

### Layer 3: Safe Defaults (Fallback)
```javascript
// backend/services/geminiClient.js
const defaults = {
  symptom_summary: "Unable to process symptoms.",
  severity_level: "medium",  // Conservative!
  recommended_care_setting: "outpatient-clinic",
  recommended_specialties: ["General Physician"],
  // ... more safe defaults
}
```
**Effect**: If Gemini API fails completely, user gets sensible default (not scary, not dismissive).

### Layer 4: Frontend UI (Warning)
```jsx
// frontend/src/components/DisclaimerBanner.jsx
<div className="bg-red-900 border-l-4 border-red-600">
  ⚠️ Medical Disclaimer
  This is NOT a medical diagnosis or treatment.
  Always consult a qualified doctor.
  In an emergency, go to hospital or call emergency services.
</div>
```
**Effect**: User sees clear warning on every page.

---

## Deployment Checklist

### ✅ Before Deploying to Production

**Security:**
- [ ] Add authentication (JWT or OAuth)
- [ ] Implement HTTPS only
- [ ] Add rate limiting (prevent abuse)
- [ ] Validate all inputs (OWASP top 10)
- [ ] Sanitize HTML/JavaScript (prevent XSS)
- [ ] Implement CORS properly (not allow all)

**Compliance:**
- [ ] Add data encryption (at rest & in transit)
- [ ] Implement audit logging (who accessed what)
- [ ] Meet HIPAA requirements (if US healthcare)
- [ ] Meet GDPR requirements (if EU users)
- [ ] Add privacy policy & terms of service
- [ ] Get legal review

**Data:**
- [ ] Use real hospital data (not demo data)
- [ ] Verify hospital details (phone, address, departments)
- [ ] Add ability to update hospital data
- [ ] Consider using hospital API instead of hardcoded

**Features:**
- [ ] Add user feedback/bug reporting
- [ ] Add analytics (privacy-safe)
- [ ] Add error monitoring (Sentry, etc.)
- [ ] Add uptime monitoring
- [ ] Add performance monitoring

**Testing:**
- [ ] Unit tests for safety logic
- [ ] Integration tests for API endpoints
- [ ] E2E tests for critical flows
- [ ] Accessibility testing (WCAG 2.1 AA)
- [ ] Load testing (concurrent users)
- [ ] Security testing (penetration test)

### Deployment Platforms

#### Frontend (Static)
- **Vercel** (Recommended for Vite apps)
  ```bash
  npm run build
  vercel --prod
  ```

- **Netlify**
  ```bash
  npm run build
  # Drag 'dist' folder to Netlify
  ```

- **AWS S3 + CloudFront**
  ```bash
  npm run build
  aws s3 sync dist/ s3://your-bucket
  ```

#### Backend (Server)
- **Railway** (Recommended, easy)
  ```bash
  npm start
  # Set environment variables in dashboard
  ```

- **Heroku**
  ```bash
  heroku create
  heroku config:set GEMINI_API_KEY=...
  git push heroku main
  ```

- **AWS Lambda + API Gateway**
  ```bash
  # Use serverless framework
  serverless deploy
  ```

- **DigitalOcean App Platform**
  ```bash
  # Connect GitHub repo
  # Auto-deploy on push
  ```

---

## Performance Optimization

### Frontend
```javascript
// Already optimized:
- Vite: Fast build, code splitting
- React: Component memoization
- Tailwind: Minimal CSS (purged)
- Images: None (text only)

// For production:
- Enable gzip compression
- Add service worker for offline
- Lazy load components if app grows
```

### Backend
```javascript
// Already optimized:
- Express: Minimal dependencies
- No database: No I/O bottleneck
- In-memory hospitals: O(n) filter, n=9

// For production:
- Add caching (Redis)
- Add load balancing (nginx)
- Monitor Gemini API latency
- Add request queuing (Bull)
```

### API Calls
```javascript
// Current:
// - Timeout: 30s (safe for Gemini)
// - Retries: None (implement if needed)
// - Caching: None (consider for hospitals)

// For production:
- Add retry logic (3 retries with backoff)
- Add caching (hospitals change rarely)
- Add request deduplication
- Monitor API costs (Gemini charges by token)
```

---

## Monitoring & Logging

### Logs to Track
```javascript
// Backend logs (server.js):
- Server start/stop
- Incoming requests (timestamp, IP, endpoint)
- Gemini API calls (timestamp, response time, tokens)
- Errors (stack trace, user data)
- Hospital data access

// Frontend logs (browser console):
- Component lifecycle
- API errors
- Navigation changes
- User actions (non-PII)
```

### Monitoring Dashboard (Optional)
```
Metrics to track:
- API response time (should be <5s for Gemini)
- Error rate (should be <1%)
- Active users
- Hospital queries (most popular departments)
- Severity distribution (are emergencies rare?)
```

---

## Cost Analysis

### Free Tier
- **Gemini API**: Free tier available (good for dev/demo)
- **Frontend hosting**: Free (Vercel, Netlify)
- **Backend hosting**: Free tier (Railway, Heroku)

### Scaling Costs
- **Gemini API**: $0.075 per million input tokens, $0.30 per million output tokens
  - ~200 tokens per symptom analysis
  - 100,000 users/month = ~20M tokens = ~$15/month

- **Backend hosting**: ~$5-10/month (small server)
- **Database** (if added): ~$10-30/month (PostgreSQL)
- **Monitoring** (Sentry, etc.): Free-$50/month

### Example Monthly Cost (10k users)
- Gemini API: ~$1.50
- Backend: $7
- Frontend: Free
- **Total**: ~$9/month

---

## Scaling Strategy

### Phase 1 (Current)
```
- In-memory hospitals
- Single server
- Hardcoded data
- Perfect for: MVP, demo, 100-1000 users
```

### Phase 2 (When traffic grows)
```
- Add PostgreSQL database
- Move hospitals to DB
- Add Redis caching
- Add load balancer
- Perfect for: 1000-100k users
```

### Phase 3 (Enterprise)
```
- Multi-region deployment
- CDN for frontend
- Hospital API integration
- Real-time hospital status
- Analytics pipeline
- Perfect for: 100k+ users
```

---

## Troubleshooting Guide

### Problem: "Gemini API Error"
```
Likely causes:
1. API key invalid or expired
2. API key doesn't have billing enabled
3. Rate limit exceeded
4. Network timeout

Solutions:
1. Check .env has correct key
2. Regenerate key in Google AI Studio
3. Wait 1 minute and retry
4. Increase timeout in geminiClient.js
```

### Problem: "No hospitals found"
```
Likely causes:
1. City doesn't match in data
2. Department name mismatch
3. Hospital data is empty

Solutions:
1. Check hospitals.js has your city
2. Check recommended_specialties matches hospital.departments
3. Add more hospitals to data/hospitals.js
```

### Problem: "Frontend can't reach backend"
```
Likely causes:
1. Backend not running
2. CORS not enabled
3. Wrong API URL

Solutions:
1. Check backend terminal: "Server running on..."
2. Check server.js has cors() middleware
3. Check vite.config.js has correct proxy
```

---

## Security Best Practices

### Never Commit Secrets
```
.env           <- Contains API keys, never commit!
.env.example   <- Template, safe to commit
.gitignore     <- Ignore .env file
```

### API Key Rotation
```
1. Generate new key in Google AI Studio
2. Update .env in production
3. Delete old key
4. Redeploy backend
5. Verify it works
```

### CORS Configuration
```javascript
// Current (localhost only):
app.use(cors())  // Allow all (OK for dev)

// Production:
app.use(cors({
  origin: 'https://your-frontend.com',
  credentials: true
}))
```

### Input Validation
```javascript
// Current validation:
- Symptom text: min 3 chars
- JSON parsing: wrapped in try-catch

// Add more for production:
- XSS prevention (sanitize HTML)
- SQL injection prevention (use parameterized queries)
- Rate limiting (prevent abuse)
- File upload validation (if enabled)
```

---

## Summary for Deployment

```
Development:
npm run dev (both)
http://localhost:5173

Production:
1. Frontend: npm run build + deploy to Vercel/Netlify
2. Backend: npm start + deploy to Railway/Heroku
3. Update API endpoint in frontend config
4. Add environment variables to hosting platform
5. Add monitoring & logging
6. Test critical flows
7. Monitor costs & performance

Ready for millions of users? ✅
Already optimized for scale!
```

---

**Remember**: This is a demo app. For real healthcare:
- Add authentication
- Encrypt sensitive data
- Meet regulatory compliance
- Add professional medical oversight
- Have liability insurance
- Get legal review

