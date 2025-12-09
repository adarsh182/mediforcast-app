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

async function callGeminiForSymptoms(symptoms, ageRange, gender, chronicConditions) {
  try {
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

    const response = await axios.post(apiUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
      params: {
        key: apiKey,
      },
      timeout: 15000,
    });

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

    const parsedResult = JSON.parse(jsonMatch[0]);
    return parsedResult;
  } catch (error) {
    console.error('Gemini API error:', error.message);
    if (error.response?.data) {
      console.error('API error details:', error.response.data);
    }
    throw error;
  }
}

function buildSafeResult(geminiResult) {
  const defaults = {
    symptom_summary: 'Unable to process symptoms at this time.',
    possible_body_systems: ['general'],
    severity_level: 'medium',
    recommended_care_setting: 'outpatient-clinic',
    recommended_specialties: ['General Physician'],
    urgency_advice: 'Please consult a qualified healthcare provider for proper evaluation.',
    suggested_next_steps: [
      'Schedule an appointment with a healthcare provider',
      'Keep track of symptom changes',
      'Avoid self-medication',
    ],
    red_flag_symptoms_to_watch: [
      'Severe pain',
      'Difficulty breathing',
      'Loss of consciousness',
    ],
    clarifying_questions: [],
    self_care_tips: ['Rest', 'Stay hydrated', 'Monitor your symptoms'],
    disclaimer: 'This is NOT a medical diagnosis. Always consult a qualified healthcare provider.',
  };

  // Merge with defaults
  const result = { ...defaults, ...geminiResult };

  // Ensure arrays are arrays
  if (!Array.isArray(result.possible_body_systems)) {
    result.possible_body_systems = [result.possible_body_systems];
  }
  if (!Array.isArray(result.recommended_specialties)) {
    result.recommended_specialties = [result.recommended_specialties];
  }
  if (!Array.isArray(result.suggested_next_steps)) {
    result.suggested_next_steps = [result.suggested_next_steps];
  }
  if (!Array.isArray(result.red_flag_symptoms_to_watch)) {
    result.red_flag_symptoms_to_watch = [result.red_flag_symptoms_to_watch];
  }
  if (!Array.isArray(result.clarifying_questions)) {
    result.clarifying_questions = [];
  }
  if (!Array.isArray(result.self_care_tips)) {
    result.self_care_tips = [result.self_care_tips];
  }

  // Safety check: if severity is high or emergency, ensure urgency_advice mentions emergency
  if (result.severity_level === 'high' || result.severity_level === 'emergency' ||
      result.recommended_care_setting === 'emergency-department') {
    if (!result.urgency_advice.toLowerCase().includes('emergency') &&
        !result.urgency_advice.toLowerCase().includes('urgent')) {
      result.urgency_advice = `URGENT: ${result.urgency_advice} Seek emergency care or call emergency services immediately if symptoms worsen.`;
    }
  }

  return result;
}

export { callGeminiForSymptoms, buildSafeResult };
