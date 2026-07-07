import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import symptomsRouter from '../src/routes/symptoms.js';
import hospitalsRouter from '../src/routes/hospitals.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const isProduction = process.env.NODE_ENV === 'production';

// Trust the first proxy in front of Express (crucial for cloud deployment rate limiting)
app.set('trust proxy', 1);

const defaultOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5175',
  'http://localhost:4173',
];

const allowedOrigins = (process.env.CORS_ORIGINS || process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

if (isProduction && allowedOrigins.length === 0) {
  throw new Error('CORS_ORIGINS must be set in production.');
}

const corsOrigins = allowedOrigins.length > 0 ? allowedOrigins : defaultOrigins;

// Rate limiting configurations with JSON error messages compatible with frontend handlers
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
});

const symptomLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Rate limit exceeded. You can only request symptom assessments 20 times every 15 minutes.' },
});

// General Security Headers
app.disable('x-powered-by');
app.use(helmet({
  contentSecurityPolicy: false,
}));

// Route for monitoring/health checks (declared before CORS to allow external status checks)
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Strict CORS lockdown configuration
app.use(cors({
  origin(origin, callback) {
    // In local development, allow requests with no origin (e.g. from curl or Postman)
    if (!origin) {
      if (isProduction) {
        return callback(new Error('CORS Policy: Request origin is missing and unauthorized in production'));
      }
      return callback(null, true);
    }

    if (corsOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS Policy: Request origin ${origin} is not allowed`));
  },
  credentials: true,
  optionsSuccessStatus: 200,
}));

app.use(express.json({ limit: '64kb' }));

// Apply Rate Limiters and Routers
app.use('/api', apiLimiter);
app.use('/api/symptoms', symptomLimiter, symptomsRouter);
app.use('/api/hospitals', hospitalsRouter);

// Fallback health-safe error handler for malformed JSON or CORS errors
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }

  if (error.message && error.message.startsWith('CORS Policy')) {
    return res.status(403).json({ error: error.message });
  }

  return next(error);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
