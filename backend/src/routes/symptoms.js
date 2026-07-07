import express from 'express';
import { callGeminiForSymptoms, buildSafeResult } from '../services/geminiClient.js';

const router = express.Router();

router.post('/analyze', async (req, res) => {
  try {
    const { text, ageRange, gender, chronicConditions } = req.body;

    // Validate input
    if (!text || text.trim().length < 3) {
      return res.status(400).json({ error: 'Please describe your symptoms (at least 3 characters).' });
    }

    // Call Gemini
    const geminiResult = await callGeminiForSymptoms(text, ageRange, gender, chronicConditions);

    // Build safe result with defaults
    const safeResult = buildSafeResult(geminiResult);

    res.json({ result: safeResult });
  } catch (error) {
    console.error('Error analyzing symptoms:', error.message);
    console.error('Error details:', error.response?.data || error);
    res.status(500).json({ error: 'Failed to analyze symptoms. Please try again.' });
  }
});

export default router;
