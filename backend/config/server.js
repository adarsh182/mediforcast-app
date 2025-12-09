import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import symptomsRouter from '../src/routes/symptoms.js';
import hospitalsRouter from '../src/routes/hospitals.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/symptoms', symptomsRouter);
app.use('/api/hospitals', hospitalsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
