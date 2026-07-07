import express from 'express';
import { callGeminiForSymptoms, buildSafeResult } from '../services/geminiClient.js';

const router = express.Router();

export const MAX_SYMPTOM_LENGTH = 2000;
const VALID_AGE_RANGES = ['<12', '12-18', '18-40', '40-60', '>60'];
const VALID_GENDERS = ['male', 'female', 'other'];
const MAX_CONDITIONS = 15;
const MAX_CONDITION_LENGTH = 50;

// Validates and sanitizes user input before it reaches the AI prompt.
// Unknown ageRange/gender values are dropped (not rejected) so the check still runs;
// free-text fields are length-capped to prevent prompt abuse and token-cost abuse.
export function sanitizeInput(body) {
  const { text, ageRange, gender, chronicConditions } = body || {};
  const errors = [];

  const safeText = typeof text === 'string' ? text.trim() : '';
  if (safeText.length < 3) {
    errors.push('Please describe your symptoms (at least 3 characters).');
  } else if (safeText.length > MAX_SYMPTOM_LENGTH) {
    errors.push(`Symptom description is too long (maximum ${MAX_SYMPTOM_LENGTH} characters).`);
  }

  const safeAgeRange = VALID_AGE_RANGES.includes(ageRange) ? ageRange : undefined;
  const safeGender = VALID_GENDERS.includes(gender) ? gender : undefined;

  let safeConditions = [];
  if (Array.isArray(chronicConditions)) {
    safeConditions = chronicConditions
      .filter(
        (c) =>
          typeof c === 'string' &&
          c.trim().length > 0 &&
          c.trim().length <= MAX_CONDITION_LENGTH
      )
      .slice(0, MAX_CONDITIONS)
      .map((c) => c.trim());
  }

  return {
    errors,
    text: safeText,
    ageRange: safeAgeRange,
    gender: safeGender,
    chronicConditions: safeConditions,
  };
}

router.post('/analyze', async (req, res) => {
  try {
    const { errors, text, ageRange, gender, chronicConditions } = sanitizeInput(req.body);

    if (errors.length > 0) {
      return res.status(400).json({ error: errors[0] });
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
