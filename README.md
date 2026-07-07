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
PORT=5001
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
SUPABASE_JWT_SECRET=replace_with_your_supabase_jwt_secret
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

If you want to use the local backend instead of the production one, set `VITE_API_BASE_URL` in `frontend/.env`:

```
VITE_API_BASE_URL=http://localhost:5001/api
```

If you are using Supabase Google OAuth, add these values to `frontend/.env`:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key_here
```

In the Supabase dashboard, enable Google as an OAuth provider and add your local redirect URL, usually `http://localhost:5173/login`, to the allowed redirect list.

### Vite-Compatible Supabase Setup

The SUMO frontend is a Vite SPA, so the Supabase translation is browser-only:

- Use `import.meta.env.VITE_SUPABASE_URL` and `import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY`
- Create the browser client in `frontend/src/lib/supabaseClient.js`
- Keep auth state in the React provider with `supabase.auth.getSession()` and `supabase.auth.onAuthStateChange()`
- Use Google OAuth through `supabase.auth.signInWithOAuth({ provider: 'google' })`
- Do not add Next.js files like `page.tsx`, `utils/supabase/server.ts`, or `middleware.ts`; they are not part of this Vite app

## Running the Application

### Option 1: Run Both Servers Separately (Recommended for Development)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend will run on `http://localhost:5001`

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
- `GET /api/symptoms/previous?userId=` - Fetch stored history for a user
- `DELETE /api/symptoms/previous/:id` - Delete one history entry
- `DELETE /api/symptoms/previous?userId=` - Clear a user's history
- `GET /api/hospitals?city=&department=` - Get hospitals
- `GET /api/health` - Health check, returns `{ status: "healthy", timestamp }`

## Phase 1 Database Scaffold

The repository now includes the production schema blueprint and a seed bridge for the current in-memory hospital data:

- [backend/db/schema.sql](backend/db/schema.sql) defines the PostgreSQL tables from the production spec.
- [backend/db/seeds/hospitals.seed.js](backend/db/seeds/hospitals.seed.js) adapts the existing hospital list into seedable relational rows.

These files are the starting point for the database evolution path described in the docs. Symptom logs now persist through the backend store layer, and the hospital route includes cache support with an in-memory fallback when Redis is not configured.

## Phase 2 Auth Verification

The frontend owns Google OAuth through Supabase, and the backend now verifies Supabase access tokens on protected routes.

- Protected symptom routes require `Authorization: Bearer <Supabase access token>`
- The backend extracts the authenticated Supabase `user_id` from the verified JWT
- Old custom signup/login backend routes have been removed

## Phase 3 Persistence Layer

- Symptom analysis results are now written through the backend store layer instead of browser localStorage.
- History reads, deletes, and clears now go through `/api/symptoms/previous`.
- Hospital lookups are cached server-side with Redis when available, with a safe in-memory fallback for local development.

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

Auth is now handled through Supabase Google OAuth instead of the previous custom email/password flow.

Protected backend routes now trust Supabase JWTs rather than client-supplied user IDs.

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, React Router
- **Backend:** Node.js, Express
- **AI:** Google Gemini API
- **Storage:** Supabase auth session on the frontend, backend symptom log persistence with PostgreSQL-ready storage, and cached hospital queries

