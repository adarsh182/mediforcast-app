# Quick Start Guide

## 🚀 Get Running in 5 Minutes

### 1. Terminal 1: Backend Setup & Run
```powershell
cd backend
npm install
```

**Create `.env` file in backend folder:**
```
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_API_URL=https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent
```

**Start backend:**
```powershell
npm run dev
```

Expected output:
```
Server running on http://localhost:5000
```

✅ **Keep this terminal open**

---

### 2. Terminal 2: Frontend Setup & Run
```powershell
cd frontend
npm install
npm run dev
```

Expected output:
```
  VITE v5.0.0  ready in XXX ms
  ➜  Local:   http://localhost:5173/
```

✅ **Backend and frontend now running**

---

### 3. Open Browser
Go to: **http://localhost:5173/**

---

## 🧪 Test It

**Try this symptom:**
```
I have a persistent cough, mild fever, and sore throat for 3 days
```

Expected result:
- Severity: Low-Medium
- Recommended doctor: General Physician
- Care: Clinic visit
- Hospitals nearby: List from selected city

---

## ⚠️ Before First Run

### Get Gemini API Key (1 minute)
1. Go to https://ai.google.dev/
2. Click "Get API Key"
3. Create new project (if needed)
4. Copy your API key
5. Paste into `backend/.env`

### That's it! 🎉

---

## 📁 Project Structure

```
mediforcast/
├── backend/               # Node.js + Express API
│   ├── package.json
│   ├── server.js          # Main entry point
│   ├── .env               # ⚠️ Create this with your API key
│   ├── .env.example       # Template
│   └── src/
│       ├── routes/        # API endpoints
│       ├── services/      # Gemini integration
│       └── data/          # Hospital data
│
├── frontend/              # React + Vite UI
│   ├── package.json
│   ├── index.html
│   ├── vite.config.js
│   └── src/
│       ├── pages/         # Home.jsx, Result.jsx
│       ├── components/    # Reusable UI components
│       └── api/           # API client
│
└── SETUP_INSTRUCTIONS.md  # Detailed guide
└── CODE_REFERENCE.md      # Code walkthrough
```

---

## 📝 Scripts Reference

**Backend:**
```powershell
cd backend
npm run dev    # Development (with auto-reload)
npm start      # Production
```

**Frontend:**
```powershell
cd frontend
npm run dev    # Development
npm run build  # Build for production
npm run preview # Preview production build
```

---

## 🔧 Troubleshooting

### "Cannot connect to localhost:5000"
- Make sure backend is running: `cd backend && npm run dev`
- Check it says "Server running on http://localhost:5000"
- Check no other app is using port 5000

### "API key not working"
- Verify you copied it correctly from https://ai.google.dev/
- Make sure your `.env` file has: `GEMINI_API_KEY=AIzaSy...`
- Make sure it's in the `backend/` folder (not `frontend/`)

### "npm: command not found"
- Install Node.js from https://nodejs.org/ (v14+)
- Restart PowerShell after installing

### "Port 5173 is already in use"
- Another app is using it
- Kill the process or change port in `frontend/vite.config.js`

### "Module not found errors"
- Run `npm install` in the folder (backend or frontend)
- Make sure you're in the right directory

---

## 🎯 What Happens When You Use the App

1. **Home Page** (/)
   - User describes symptoms in text box
   - Selects age, gender, city, chronic conditions (optional)
   - Clicks "Get Guidance"

2. **Backend Processing**
   - Backend receives symptoms
   - Calls Google Gemini API
   - Gemini analyzes with safety guardrails
   - Backend validates response
   - Returns JSON with guidance

3. **Results Page** (/result)
   - Shows severity level (with color badge)
   - Shows care recommendation & urgency
   - Shows recommended doctors/departments
   - Shows self-care tips (no drugs)
   - Shows red-flag symptoms
   - Shows nearby hospitals
   - Shows multiple disclaimers

4. **Hospital Section**
   - Filters hospitals by user's city
   - Shows hospitals with matching departments
   - "Call" button (tel: link)
   - "Get Directions" button (Google Maps)

---

## 🛡️ Safety Features

✅ **No Diagnosis**: AI only summarizes & suggests specialties
✅ **No Medications**: No drug names or doses (enforced by system prompt)
✅ **Emergency Detection**: High/emergency cases flagged clearly
✅ **Multi-Layer Disclaimers**: On every page
✅ **Input Validation**: Both frontend & backend
✅ **Safe Defaults**: If AI fails, returns moderate severity (not low)

---

## 📚 Documentation Files

1. **SETUP_INSTRUCTIONS.md** - Detailed setup & troubleshooting
2. **CODE_REFERENCE.md** - Deep dive into every file
3. **QUICK_START.md** (this file) - Get running fast

---

## 🚀 You're Ready!

```powershell
# Terminal 1
cd backend && npm install && npm run dev

# Terminal 2  
cd frontend && npm install && npm run dev

# Browser
http://localhost:5173/
```

---

## 💡 Tips for Your Colleagues

**"Why no database?"**
- Requirements were to keep it simple
- Hospitals data is hardcoded (only 9 hospitals)
- Easy to explain and understand
- Can add database later if needed

**"How is it safe?"**
- AI system prompt forbids diagnosis & drugs (first thing)
- Backend catches any dangerous responses
- Disclaimers on every page
- Red warnings for emergencies

**"Why no TypeScript?"**
- Easier to teach & explain
- No compilation step
- Direct JavaScript feedback
- Less boilerplate

**"Can we use this in production?"**
- No (add authentication, real database, HIPAA compliance)
- Yes as a foundation (build from here)
- Better: use as educational demo/prototype

---

## 📞 Quick Support

| Issue | Solution |
|-------|----------|
| Backend won't start | Check `.env` has GEMINI_API_KEY |
| Frontend can't reach backend | Ensure backend is running on :5000 |
| Gemini API error | Verify API key is correct |
| "Module not found" | Run `npm install` in that folder |
| Port already in use | Change port in config file |

---

**Good luck!** 🎉 Questions? Check CODE_REFERENCE.md or SETUP_INSTRUCTIONS.md
