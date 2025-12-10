# SUMO - Symptom Urgency & Medical Outreach

A full-stack web application that provides non-diagnostic healthcare guidance and hospital recommendations using AI (Google Gemini).

**SUMO** stands for **Symptom Urgency & Medical Outreach**.

## Features

- 🏥 Symptom analysis with AI-powered guidance
- 🎨 Dark/Light mode toggle
- 📋 Chat history with previous results
- 🏥 Hospital recommendations by city and specialty
- ⚠️ Safety-first: No diagnoses, no medication prescriptions

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

## Setup Instructions

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
# Copy the example below and create a .env file in the backend directory
```

Create a `.env` file in the `backend` directory with:

```
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent
```

**Important:** Replace `your_gemini_api_key_here` with your actual Gemini API key.

### 2. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install
```

### 3. Update Frontend API URL (for local development)

If you want to use the local backend instead of the production one, update `frontend/src/api/client.js`:

```javascript
// Change this line:
const API_BASE = 'https://mediforcast-app.onrender.com/api';

// To this for local development:
const API_BASE = 'http://localhost:5000/api';
```

## Running the Application

### Option 1: Run Both Servers Separately (Recommended for Development)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend will run on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend will run on `http://localhost:5173` (or the port Vite assigns)

### Option 2: Production Build

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## Usage

1. Open your browser and navigate to `http://localhost:5173`
2. Enter your symptoms in the text area
3. Optionally fill in age range, gender, city, and chronic conditions
4. Click "Get Guidance"
5. View your results, including:
   - Severity level
   - Recommended care setting
   - Suggested specialties
   - Hospital recommendations
   - Self-care tips
6. Access your history by clicking "History" in the header
7. Toggle dark/light mode using the sun/moon icon in the header

## Project Structure

```
mediforcast/
├── backend/
│   ├── config/
│   │   └── server.js          # Express server setup
│   ├── src/
│   │   ├── routes/           # API routes
│   │   ├── services/         # Gemini API client
│   │   └── data/             # Hospital data
│   ├── index.js              # Entry point
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/       # React components
    │   ├── pages/            # Page components
    │   ├── contexts/         # React contexts (Theme)
    │   ├── api/              # API client
    │   └── main.jsx          # Entry point
    └── package.json
```

## API Endpoints

- `POST /api/symptoms/analyze` - Analyze symptoms
- `GET /api/hospitals?city=&department=` - Get hospitals
- `GET /api/health` - Health check

## Troubleshooting

### Backend won't start
- Check if port 5000 is already in use
- Verify your `.env` file exists and has the correct API key
- Make sure all dependencies are installed (`npm install`)

### Frontend can't connect to backend
- Ensure backend is running on port 5000
- Check if `API_BASE` in `frontend/src/api/client.js` points to the correct URL
- Check browser console for CORS errors

### Gemini API errors
- Verify your API key is correct
- Check if you have API quota/credits available
- Ensure the API URL is correct in `.env`

## Important Notes

⚠️ **This application does NOT provide medical diagnoses or prescriptions.**
- It only provides general guidance
- Always consult a qualified healthcare professional
- In emergencies, call emergency services immediately

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, React Router
- **Backend:** Node.js, Express
- **AI:** Google Gemini API
- **Storage:** localStorage (client-side only)

