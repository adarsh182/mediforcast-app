import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import symptomsRouter from '../src/routes/symptoms.js';
import hospitalsRouter from '../src/routes/hospitals.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS: restrict to known frontend origins.
// Override with a comma-separated ALLOWED_ORIGINS env variable in production.
const allowedOrigins = (
  process.env.ALLOWED_ORIGINS ||
  'http://localhost:5173,https://mediforcast-app.netlify.app'
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests with no Origin header (curl, health checks, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
  })
);

app.use(express.json({ limit: '10kb' }));

// Rate limiting protects the Gemini quota from abuse.
// It limits request COUNT per IP only — it never truncates or alters response content.
const analyzeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many symptom checks from this device. Please try again in a few minutes.' },
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again shortly.' },
});

// Routes
app.use('/api/symptoms', analyzeLimiter, symptomsRouter);
app.use('/api/hospitals', generalLimiter, hospitalsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
