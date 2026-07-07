import axios from 'axios';

const SYMPTOM_GUIDE_SYSTEM_PROMPT = `You are an AI assistant for a "Symptom-Based Healthcare Guidance & Hospital Recommendation System."

CRITICAL:
- You are NOT a doctor and must NOT give a medical diagnosis or prescribe treatment or medicines.
- You only provide preliminary guidance: severity level, urgency, type of specialist/department, red flags, and general next steps.
- Your output will be shown directly to end-users inside a consumer app.

GOAL:
Given a free-text description of symptoms (and optional age, gender, chronic conditions), you must:
1. Summarize the main symptoms and relevant risk factors.
2. Estimate a rough severity level and urgency (very approximate).
3. Suggest the most appropriate care setting.
4. Suggest relevant hospital departments/specialist types.
5. Provide red-flag signs to watch for.
6. Provide safe, generic self-care tips (no drugs).
7. Provide a strong disclaimer that this is not a diagnosis or treatment.

OUTPUT FORMAT:
You MUST respond with VALID JSON ONLY and nothing else.

Use this exact schema:

{
  "symptom_summary": "string",
  "possible_body_systems": ["respiratory", "cardiovascular", "digestive", "musculoskeletal", "skin", "neurological", "general", "mental_health", "urinary", "reproductive"],
  "severity_level": "low | medium | high | emergency",
  "recommended_care_setting": "self-care | outpatient-clinic | urgent-care-same-day | emergency-department",
  "recommended_specialties": ["array of specialty names"],
  "urgency_advice": "string, 1–3 sentences",
  "suggested_next_steps": ["array of short actionable strings"],
  "red_flag_symptoms_to_watch": ["array of warning signs"],
  "clarifying_questions": ["optional follow-up questions"],
  "self_care_tips": ["ONLY mild, generic comfort measures without naming medicines"],
  "disclaimer": "clear statement that this is not a diagnosis or substitute for a doctor"
}

SAFETY RULES:
1. NO DIAGNOSIS:
   - Do NOT say the user "has" or "likely has" any specific disease.
   - You may say things like "could be related to an infection, allergy, or other causes" but stay vague.

2. NO MEDICATION OR PRESCRIPTIONS:
   - Do NOT name any medicines, drugs, or doses.
   - Do NOT suggest antibiotics, painkillers, etc.

3. EMERGENCY BIAS:
   - If there are serious signs (chest pain, difficulty breathing, stroke-like symptoms, heavy bleeding, severe head injury, suicidal thoughts), set:
     - "severity_level": "emergency"
     - "recommended_care_setting": "emergency-department"
   - Clearly mention to call emergency services or go to nearest emergency department.

4. VULNERABLE GROUPS:
   - For infants, children, pregnant people, elderly, or those with serious chronic diseases, be more cautious and prefer higher urgency.

5. TONE:
   - Be calm and cautious.
   - Never say "you are fine" or "this is nothing serious."
   - Use wording like "Based on what you described, this might be mild/moderate, but it is important to monitor symptoms and consult a doctor."

If information is missing, make cautious assumptions and add relevant clarifying questions.`;

// 30s timeout so long, detailed Gemini responses are never cut off mid-generation.
const GEMINI_TIMEOUT_MS = 30000;
const MAX_RETRIES = 1;
const RETRY_DELAY_MS = 1000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function isRetryableError(error) {
  // Timeouts and network resets
  if (error.code === 'ECONNABORTED' || error.code === 'ECONNRESET') return true;
  // Rate limits and transient server errors from the Gemini API
  const status = error.response?.status;
  return status === 429 || (status >= 500 && status < 600);
}

function parseGeminiResponse(response) {
  const textContent = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textContent) {
    console.error('Gemini response structure:', JSON.stringify(response.data, null, 2));
    throw new Error('No response text from Gemini');
  }

  // Parse JSON from response
  let jsonStr = textContent.trim();

  // Remove markdown code blocks if present
  if (jsonStr.startsWith('```json')) {
    jsonStr = jsonStr.slice(7);
  }
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.slice(3);
  }
  if (jsonStr.endsWith('```')) {
    jsonStr = jsonStr.slice(0, -3);
  }

  // Try to extract JSON object
  const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error('Could not find JSON in response:', jsonStr);
    throw new Error('Could not find JSON in response');
  }

  return JSON.parse(jsonMatch[0]);
}

async function callGeminiForSymptoms(symptoms, ageRange, gender, chronicConditions) {
  const apiKey = process.env.GEMINI_API_KEY;
  const apiUrl = process.env.GEMINI_API_URL;

  if (!apiKey || !apiUrl) {
    throw new Error('Gemini API configuration is missing');
  }

  const userPrompt = `
User symptoms: ${symptoms}
Age range: ${ageRange || 'not specified'}
Gender: ${gender || 'not specified'}
Chronic conditions: ${chronicConditions && chronicConditions.length > 0 ? chronicConditions.join(', ') : 'none'}

Please analyze these symptoms and provide guidance in the exact JSON format specified.`;

  const payload = {
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: SYMPTOM_GUIDE_SYSTEM_PROMPT + '\n\n' + userPrompt,
          },
        ],
      },
    ],
  };

  let lastError;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await axios.post(apiUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        params: {
          key: apiKey,
        },
        timeout: GEMINI_TIMEOUT_MS,
      });
      return parseGeminiResponse(response);
    } catch (error) {
      lastError = error;
      console.error(`Gemini API error (attempt ${attempt + 1}):`, error.message);
      if (error.response?.data) {
        console.error('API error details:', error.response.data);
      }
      if (attempt < MAX_RETRIES && isRetryableError(error)) {
        await sleep(RETRY_DELAY_MS * (attempt + 1));
        continue;
      }
      throw lastError;
    }
  }
  throw lastError;
}

const VALID_SEVERITY_LEVELS = ['low', 'medium', 'high', 'emergency'];
const VALID_CARE_SETTINGS = [
  'self-care',
  'outpatient-clinic',
  'urgent-care-same-day',
  'emergency-department',
];

// Returns value if it is a non-empty string, otherwise the fallback.
function asString(value, fallback) {
  return typeof value === 'string' && value.trim().length > 0 ? value : fallback;
}

// Returns a non-empty array of non-empty strings, otherwise the fallback.
// A single string is wrapped into an array (Gemini sometimes returns scalars).
function asStringArray(value, fallback) {
  if (Array.isArray(value)) {
    const items = value.filter((v) => typeof v === 'string' && v.trim().length > 0);
    return items.length > 0 ? items : fallback;
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    return [value];
  }
  return fallback;
}

// Validates and normalizes the Gemini result. Every field is type-checked and
// enum fields are validated against their allowed values, falling back to
// conservative defaults. Content is never truncated — only invalid/malformed
// fields are replaced.
function buildSafeResult(geminiResult) {
  const raw = geminiResult && typeof geminiResult === 'object' ? geminiResult : {};

  const result = {
    symptom_summary: asString(raw.symptom_summary, 'Unable to process symptoms at this time.'),
    possible_body_systems: asStringArray(raw.possible_body_systems, ['general']),
    severity_level: VALID_SEVERITY_LEVELS.includes(raw.severity_level)
      ? raw.severity_level
      : 'medium',
    recommended_care_setting: VALID_CARE_SETTINGS.includes(raw.recommended_care_setting)
      ? raw.recommended_care_setting
      : 'outpatient-clinic',
    recommended_specialties: asStringArray(raw.recommended_specialties, ['General Physician']),
    urgency_advice: asString(
      raw.urgency_advice,
      'Please consult a qualified healthcare provider for proper evaluation.'
    ),
    suggested_next_steps: asStringArray(raw.suggested_next_steps, [
      'Schedule an appointment with a healthcare provider',
      'Keep track of symptom changes',
      'Avoid self-medication',
    ]),
    red_flag_symptoms_to_watch: asStringArray(raw.red_flag_symptoms_to_watch, [
      'Severe pain',
      'Difficulty breathing',
      'Loss of consciousness',
    ]),
    clarifying_questions: asStringArray(raw.clarifying_questions, []),
    self_care_tips: asStringArray(raw.self_care_tips, [
      'Rest',
      'Stay hydrated',
      'Monitor your symptoms',
    ]),
    disclaimer: asString(
      raw.disclaimer,
      'This is NOT a medical diagnosis. Always consult a qualified healthcare provider.'
    ),
  };

  // Safety check: if severity is high or emergency, ensure urgency_advice mentions emergency
  if (
    result.severity_level === 'high' ||
    result.severity_level === 'emergency' ||
    result.recommended_care_setting === 'emergency-department'
  ) {
    const advice = result.urgency_advice.toLowerCase();
    if (!advice.includes('emergency') && !advice.includes('urgent')) {
      result.urgency_advice = `URGENT: ${result.urgency_advice} Seek emergency care or call emergency services immediately if symptoms worsen.`;
    }
  }

  return result;
}

export { callGeminiForSymptoms, buildSafeResult };
