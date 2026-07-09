import express from 'express';
import { callGeminiForSymptoms, buildSafeResult } from '../services/geminiClient.js';
import { fetchNearbyClinics, geocodeCity } from '../services/overpassClient.js';
import {
  saveSymptomLog,
  listSymptomLogs,
  deleteSymptomLog,
  clearSymptomLogs,
} from '../services/symptomLogStore.js';
import { requireSupabaseAuth } from '../middleware/requireSupabaseAuth.js';

const router = express.Router();
const MAX_SYMPTOM_LENGTH = 2000;
const MAX_OPTIONAL_LENGTH = 120;

function normalizeTextField(value, maxLength = MAX_OPTIONAL_LENGTH) {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed.slice(0, maxLength) : undefined;
}

function normalizeChronicConditions(value) {
  if (Array.isArray(value)) {
    return value
      .filter((item) => typeof item === 'string')
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 10);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 10);
  }

  return [];
}

function parseCoordinates(body) {
  if (body?.lat == null || body?.lng == null) {
    return null;
  }

  const lat = Number(body.lat);
  const lng = Number(body.lng);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return null;
  }

  return { lat, lng };
}

function validateSymptomPayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    errors.push('Request body must be a JSON object.');
    return { errors };
  }

  const text = normalizeTextField(body.text, MAX_SYMPTOM_LENGTH);
  if (!text || text.length < 3) {
    errors.push('Please describe your symptoms (at least 3 characters).');
  }

  const ageRange = normalizeTextField(body.ageRange);
  const gender = normalizeTextField(body.gender);
  const city = normalizeTextField(body.city);
  const chronicConditions = normalizeChronicConditions(body.chronicConditions);

  return {
    errors,
    payload: {
      text,
      ageRange,
      gender,
      city,
      chronicConditions,
    },
  };
}

router.post('/analyze', requireSupabaseAuth, async (req, res) => {
  try {
    const { errors, payload } = validateSymptomPayload(req.body);

    if (errors.length > 0) {
      return res.status(400).json({ error: errors[0], details: errors });
    }

    // Call Gemini
    const geminiResult = await callGeminiForSymptoms(
      payload.text,
      payload.ageRange,
      payload.gender,
      payload.chronicConditions,
      payload.city,
    );

    // Build safe result with defaults
    const safeResult = buildSafeResult(geminiResult);

    const coordinates = parseCoordinates(req.body);

    // If browser geolocation was denied, try to geocode the user's city input
    let searchCoordinates = coordinates;
    if (!searchCoordinates && payload.city) {
      searchCoordinates = await geocodeCity(payload.city);
    }

    const nearbyClinics = searchCoordinates
      ? await fetchNearbyClinics(
          searchCoordinates.lat,
          searchCoordinates.lng,
          safeResult.recommended_specialist,
        )
      : [];

    const responsePayload = { result: safeResult, nearby_clinics: nearbyClinics };

    res.json(responsePayload);

    saveSymptomLog({
      userId: req.supabaseUser.id,
      symptomText: payload.text,
      ageRange: payload.ageRange,
      gender: payload.gender,
      city: payload.city,
      chronicConditions: payload.chronicConditions,
      severityLevel: safeResult.severity_level,
      careSetting: safeResult.recommended_care_setting,
      urgencyAdvice: safeResult.urgency_advice,
      recommendedSpecialties: safeResult.recommended_specialties,
      nearbyClinics,
      result: safeResult,
    }).catch((error) => {
      console.error('Background symptom log failed:', error);
    });
  } catch (error) {
    console.error('Error analyzing symptoms:', error.message);
    console.error('Error details:', error.response?.data || error);
    res.status(500).json({ error: 'Failed to analyze symptoms. Please try again.' });
  }
});

router.get('/previous', requireSupabaseAuth, async (req, res) => {
  try {
    const checks = await listSymptomLogs({ userId: req.supabaseUser.id });
    return res.json({ checks });
  } catch (error) {
    console.error('Error loading symptom history:', error);
    return res.status(500).json({ error: 'Failed to load history.', checks: [] });
  }
});

router.delete('/previous/:id', requireSupabaseAuth, async (req, res) => {
  try {
    const deleted = await deleteSymptomLog(req.params.id, { userId: req.supabaseUser.id });
    return res.json({ deleted });
  } catch (error) {
    console.error('Error deleting symptom history entry:', error);
    return res.status(500).json({ error: 'Failed to delete history entry.' });
  }
});

router.delete('/previous', requireSupabaseAuth, async (req, res) => {
  try {
    await clearSymptomLogs({ userId: req.supabaseUser.id });
    return res.json({ deleted: true });
  } catch (error) {
    console.error('Error clearing symptom history:', error);
    return res.status(500).json({ error: 'Failed to clear history.' });
  }
});

export default router;
