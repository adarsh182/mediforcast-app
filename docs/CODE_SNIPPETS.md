# 🔧 Code Snippets & Examples

Quick reference for common tasks and code patterns used in MediForecast.

---

## Backend Examples

### Adding a New Hospital

**File**: `backend/src/data/hospitals.js`

```javascript
// Add this to the array:
{
  id: 10,
  name: "New Hospital Name",
  city: "Mumbai",
  departments: ["General Physician", "Cardiology", "Neurology"],
  address: "123 Main Street, City, State",
  phone: "+91-1234567890",
  mapsUrl: "https://maps.google.com/?q=New+Hospital+Name"
}
```

**Then restart backend:**
```powershell
npm run dev
```

---

### Modifying the System Prompt

**File**: `backend/src/services/geminiClient.js`

Change only the middle section of `SYMPTOM_GUIDE_SYSTEM_PROMPT`:

```javascript
const SYMPTOM_GUIDE_SYSTEM_PROMPT = `
  You are an AI assistant for a symptom guidance system.

  CRITICAL:
  - You are NOT a doctor.
  - Do NOT diagnose or prescribe.
  - Only provide preliminary guidance.

  [YOUR CUSTOM RULES HERE]

  OUTPUT FORMAT:
  You MUST respond with VALID JSON ONLY...
`
```

**Key rule**: Keep the JSON schema the same (output format).

---

### Changing Gemini Model

**File**: `backend/.env`

Change this line:
```
GEMINI_API_URL=https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent
```

To this (for other models):
```
// Fast & Efficient (Gemini 2.5 Flash):
GEMINI_API_URL=https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent

// Most Capable (Gemini 2.5 Pro):
GEMINI_API_URL=https://generativelanguage.googleapis.com/v1/models/gemini-3.0-pro:generateContent
```

Then restart backend.

---

### Adding Emergency Detection

**File**: `backend/src/services/geminiClient.js`

In `buildSafeResult()`, find this section:

```javascript
// Safety check: if severity is high or emergency
if (result.severity_level === 'high' || result.severity_level === 'emergency' ||
    result.recommended_care_setting === 'emergency-department') {
  if (!result.urgency_advice.toLowerCase().includes('emergency') &&
      !result.urgency_advice.toLowerCase().includes('urgent')) {
    result.urgency_advice = `URGENT: ${result.urgency_advice} Seek emergency care...`;
  }
}
```

To add more keywords:

```javascript
const isEmergency = 
  result.severity_level === 'emergency' ||
  result.recommended_care_setting === 'emergency-department' ||
  result.symptom_summary.toLowerCase().includes('unresponsive') ||
  result.symptom_summary.toLowerCase().includes('severe bleeding');

if (isEmergency) {
  // Force emergency language...
}
```

---

## Frontend Examples

### Adding a Form Field

**File**: `frontend/src/components/SymptomForm.jsx`

1. Add to state:
```javascript
const [formData, setFormData] = useState({
  text: '',
  ageRange: '',
  city: 'Mumbai',
  duration: '',  // NEW FIELD
  chronicConditions: [],
});
```

2. Add input in JSX:
```jsx
<div>
  <label className="block text-sm font-semibold mb-2 text-gray-300">Duration</label>
  <input
    type="text"
    name="duration"
    value={formData.duration}
    onChange={handleSelectChange}
    placeholder="e.g., 3 days"
    className="w-full p-2 bg-gray-800 border border-gray-600 rounded-lg..."
  />
</div>
```

3. Send to backend:
```javascript
const response = await analyzeSymptoms({
  text: formData.text,
  duration: formData.duration,  // NEW
  ageRange: formData.ageRange,
  // ... rest
});
```

---

### Styling a Component with Tailwind

**File**: Any `.jsx` file

Color scheme:
```jsx
{/* Success: green */}
<div className="bg-green-600 text-white">Success</div>

{/* Warning: yellow/orange */}
<div className="bg-yellow-600 text-white">Warning</div>

{/* Error: red */}
<div className="bg-red-600 text-white">Error</div>

{/* Info: blue */}
<div className="bg-blue-600 text-white">Info</div>

{/* Dark theme */}
<div className="bg-gray-800 border border-gray-700 text-gray-300">Dark Card</div>
```

---

### Adding a Loading State

**File**: `frontend/src/pages/Result.jsx`

```jsx
import LoadingSpinner from '../components/LoadingSpinner';

export default function Result() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getHospitals(city, specialty)
      .then(res => setHospitals(res.data.hospitals))
      .finally(() => setLoading(false));
  }, [city, specialty]);

  return (
    <div>
      {loading && <LoadingSpinner />}
      {!loading && <HospitalList hospitals={hospitals} />}
    </div>
  );
}
```

---

### Creating a New Page

**File**: `frontend/src/pages/NewPage.jsx`

```jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function NewPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">New Page</h1>
      
      <button onClick={() => navigate('/')}>
        Back to Home
      </button>
    </div>
  );
}
```

Then add route in `App.jsx`:

```jsx
<Route path="/new-page" element={<NewPage />} />
```

---

### Making an API Call

**File**: `frontend/src/api/client.js`

```javascript
// Add a new function:
export const getSymptomHistory = () => {
  return client.get('/symptoms/previous');
};
```

Then use in component:

```jsx
import { getSymptomHistory } from '../api/client';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    getSymptomHistory()
      .then(res => setHistory(res.data.checks))
      .catch(err => console.error('Error:', err));
  }, []);

  return (
    <div>
      {history.map(item => (
        <div key={item.id}>{item.symptoms}</div>
      ))}
    </div>
  );
}
```

---

## Common Patterns

### Error Handling Pattern

```javascript
try {
  const response = await analyzeSymptoms(data);
  // Success
  navigate('/result', { state: response.data });
} catch (error) {
  // Handle error
  const message = error.response?.data?.error || 
                  'Something went wrong. Please try again.';
  setError(message);
  console.error('Full error:', error);
} finally {
  // Cleanup
  setLoading(false);
}
```

### Conditional Rendering Pattern

```jsx
{/* Show if condition true */}
{isEmergency && <div className="bg-red-900">EMERGENCY</div>}

{/* Show one of two options */}
{severity === 'emergency' ? (
  <button className="bg-red-600">Call Emergency</button>
) : (
  <button className="bg-green-600">Schedule Visit</button>
)}

{/* Show array items */}
{hospitals.map(h => (
  <div key={h.id}>{h.name}</div>
))}

{/* Show if array not empty */}
{hospitals.length > 0 && (
  <div>Found {hospitals.length} hospitals</div>
)}
```

### State Update Pattern

```jsx
// Simple update
setName('John');

// Update based on previous state
setCount(count + 1);

// Update object
setFormData({ ...formData, name: 'John' });

// Update array
setHospitals([...hospitals, newHospital]);

// Remove from array
setHospitals(hospitals.filter(h => h.id !== idToRemove));
```

---

## Debugging Tips

### Debug API Calls

**Frontend:**
```javascript
// Add before API call:
console.log('Sending to API:', data);

// Add after response:
console.log('API Response:', response.data);

// Check network in browser DevTools (F12 → Network tab)
```

**Backend:**
```javascript
// In routes/symptoms.js:
console.log('Received symptoms:', text);
console.log('Gemini response:', geminiResult);
console.log('Safe result:', safeResult);
```

### Debug React Rendering

```javascript
// Add to component:
console.log('Component mounted', { city, result });

// Track state changes:
useEffect(() => {
  console.log('City changed:', city);
}, [city]);
```

### Debug Tailwind CSS

```jsx
// Check class is applied:
<div className="bg-red-600" style={{ color: 'white' }}>
  Check if red background shows
</div>

// Check Tailwind config:
// In tailwind.config.cjs, verify content includes:
content: ['./src/**/*.{js,jsx}']
```

---

## Testing Code Snippets

### Test Normal Symptom

```powershell
# Using PowerShell to test API
$body = @{
    text = "I have a cough for 3 days"
    ageRange = "18-40"
    city = "Mumbai"
} | ConvertTo-Json

Invoke-WebRequest -Uri 'http://localhost:5000/api/symptoms/analyze' `
    -Method POST `
    -ContentType 'application/json' `
    -Body $body
```

### Test Emergency Symptom

```powershell
$body = @{
    text = "Severe chest pain and difficulty breathing"
    ageRange = "40-60"
    city = "Mumbai"
} | ConvertTo-Json

Invoke-WebRequest -Uri 'http://localhost:5000/api/symptoms/analyze' `
    -Method POST `
    -ContentType 'application/json' `
    -Body $body
```

### Test Hospital API

```powershell
# Get hospitals in Mumbai
Invoke-WebRequest -Uri 'http://localhost:5000/api/hospitals?city=Mumbai' `
    -Method GET

# Get hospitals with specific department
Invoke-WebRequest -Uri 'http://localhost:5000/api/hospitals?city=Mumbai&department=Cardiology' `
    -Method GET
```

---

## Environment Variable Patterns

### Adding New Variable

**File**: `backend/.env`
```
PORT=5000
GEMINI_API_KEY=your_key
GEMINI_API_URL=https://...
NEW_VAR=some_value
```

**File**: `backend/server.js`
```javascript
const newVar = process.env.NEW_VAR;
```

**File**: `backend/.env.example` (for others)
```
NEW_VAR=your_value_here
```

---

## Database Migration (When Needed)

### Replace Hospital Data with Database

**Before:**
```javascript
// backend/src/data/hospitals.js
const hospitals = [{ ... }];
export default hospitals;
```

**After:**
```javascript
// backend/src/db/hospitals.js (with PostgreSQL)
export async function getHospitals(city, department) {
  const query = `
    SELECT * FROM hospitals 
    WHERE city = $1 AND departments LIKE $2
  `;
  return db.query(query, [city, `%${department}%`]);
}
```

**Update route:**
```javascript
// backend/src/routes/hospitals.js
router.get('/', async (req, res) => {
  const { city, department } = req.query;
  const hospitals = await getHospitals(city, department);
  res.json({ hospitals });
});
```

---

## Performance Optimization Examples

### Cache Hospital Data

```javascript
// backend/src/routes/hospitals.js
let cachedHospitals = null;
let cacheTime = 0;
const CACHE_DURATION = 3600000; // 1 hour

router.get('/', (req, res) => {
  const now = Date.now();
  
  if (!cachedHospitals || now - cacheTime > CACHE_DURATION) {
    cachedHospitals = filterHospitals(req.query);
    cacheTime = now;
  }
  
  res.json({ hospitals: cachedHospitals });
});
```

### Lazy Load Components

```jsx
// frontend/src/App.jsx
import React, { lazy, Suspense } from 'react';

const Home = lazy(() => import('./pages/Home'));
const Result = lazy(() => import('./pages/Result'));

export default function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/result" element={<Result />} />
      </Routes>
    </Suspense>
  );
}
```

---

## Useful npm Commands

```powershell
# Install dependencies
npm install

# Install specific package
npm install express

# Install dev dependency
npm install --save-dev nodemon

# Update all packages
npm update

# Check outdated packages
npm outdated

# Clean install (delete node_modules and reinstall)
rm -r node_modules
npm install

# Run script
npm run dev
npm run build
```

---

## File Size Optimization

### Check Build Size

```powershell
cd frontend
npm run build

# Check dist folder size
Get-ChildItem -Path dist -Recurse | Measure-Object -Property Length -Sum
```

**Expected sizes:**
- JS bundles: ~50-100 KB (after gzip)
- CSS: ~10-20 KB (after gzip)
- Total: ~70-130 KB (after gzip)

---

## Security Checklist

### Before Deploying

- [ ] Change all default passwords/keys
- [ ] Enable HTTPS only
- [ ] Remove console.log statements
- [ ] Remove test data (if confidential)
- [ ] Enable CORS whitelist (not `*`)
- [ ] Add rate limiting
- [ ] Validate all inputs
- [ ] Add authentication for sensitive endpoints
- [ ] Review error messages (don't expose internals)
- [ ] Enable security headers (CSP, X-Frame-Options, etc.)

---

## Quick Copy-Paste Templates

### New API Endpoint

```javascript
// backend/src/routes/newfeature.js
import express from 'express';

const router = express.Router();

router.post('/action', (req, res) => {
  try {
    const { data } = req.body;
    
    // Your logic here
    
    res.json({ success: true, result: null });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to process request.' });
  }
});

export default router;
```

### New Component

```jsx
// frontend/src/components/NewComponent.jsx
import React, { useState } from 'react';

export default function NewComponent({ title, onAction }) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      // Your logic here
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h2 className="text-xl font-bold text-white">{title}</h2>
      <button
        onClick={handleClick}
        disabled={loading}
        className="mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded"
      >
        {loading ? 'Loading...' : 'Action'}
      </button>
    </div>
  );
}
```

---

These are the most common patterns and tasks you'll need when modifying MediForecast. Copy-paste and adapt as needed! 🚀
