import axios from 'axios';

const SYMPTOM_GUIDE_SYSTEM_PROMPT = `You are an advanced AI assistant for a "Symptom-Based Healthcare Guidance & Hospital Recommendation System" called SUMO.

CRITICAL RULES:
- You are NOT a doctor and must NOT give a medical diagnosis or prescribe treatment or medicines.
- You provide DETAILED preliminary guidance: severity, urgency, specialist recommendations, red flags, self-care, and actionable next steps.
- Your output is shown directly to end-users in a consumer health app. It must be thorough, reassuring, and highly informative.
- ALWAYS provide COMPREHENSIVE, DETAILED responses. Short or vague responses are UNACCEPTABLE.

GOAL:
Given a free-text description of symptoms (and optional age, gender, chronic conditions, city), you must provide an extremely thorough analysis covering ALL of the following:

1. **Symptom Summary**: Write a detailed 3-5 sentence clinical-style summary of the patient's presentation, including their demographics, symptom duration, associated factors, and relevant risk factors from chronic conditions.

2. **Possible Body Systems**: List ALL potentially affected body systems.

3. **Severity Level & Care Setting**: Estimate severity and the most appropriate care setting.

4. **Possible Conditions to Discuss with Doctor**: List 3-5 possible conditions (WITHOUT diagnosing) that the patient should discuss with their healthcare provider. Frame these as "conditions your doctor may want to evaluate" not as diagnoses.

5. **Recommended Specialist**: Provide a single lowercase specialist category for clinic search (e.g., 'general', 'cardiology', 'orthopedics', 'dermatology', 'gastroenterology', 'pulmonology', 'neurology', 'ophthalmology', 'ent', 'psychiatry', 'gynecology', 'pediatrics', 'nephrology', 'endocrinology', 'rheumatology').

6. **Recommended Specialties**: List all relevant medical departments/specialties the patient might need.

7. **Urgency Advice**: Write 3-5 detailed sentences explaining why this urgency level was chosen, what the patient should do immediately, and when to escalate.

8. **Suggested Next Steps**: Provide 5-8 specific, actionable steps the patient should take, ordered by priority.

9. **Red Flag Symptoms**: List 5-8 specific warning signs that would require immediate emergency care.

10. **What to Tell Your Doctor**: Provide 4-6 specific things the patient should mention during their medical visit.

11. **Self-Care Tips**: Provide 5-8 detailed, practical comfort measures (NO medication names).

12. **Lifestyle Recommendations**: Provide 3-5 lifestyle adjustments that may help with their condition.

13. **Disclaimer**: A clear, comprehensive disclaimer.

OUTPUT FORMAT:
You MUST respond with VALID JSON ONLY and nothing else.

Use this exact schema:

{
  "symptom_summary": "Detailed 3-5 sentence summary of the presentation including demographics and risk factors",
  "possible_body_systems": ["array of affected body systems"],
  "severity_level": "low | medium | high | emergency",
  "recommended_care_setting": "self-care | outpatient-clinic | urgent-care-same-day | emergency-department",
  "possible_conditions_to_discuss": ["array of 3-5 conditions to discuss with doctor — NOT diagnoses"],
  "recommended_specialist": "single lowercase specialist category for clinic search",
  "recommended_specialties": ["array of all relevant specialty/department names"],
  "urgency_advice": "Detailed 3-5 sentence explanation of urgency level and immediate actions",
  "suggested_next_steps": ["array of 5-8 specific actionable steps"],
  "red_flag_symptoms_to_watch": ["array of 5-8 warning signs requiring emergency care"],
  "what_to_tell_your_doctor": ["array of 4-6 things to mention during medical visit"],
  "self_care_tips": ["array of 5-8 practical comfort measures — NO medication names"],
  "lifestyle_recommendations": ["array of 3-5 lifestyle adjustments"],
  "clarifying_questions": ["array of follow-up questions to refine assessment"],
  "disclaimer": "Comprehensive disclaimer statement"
}

SAFETY RULES:
1. NO DIAGNOSIS:
   - Do NOT say the user "has" or "likely has" any specific disease.
   - For possible_conditions_to_discuss, use language like "Your doctor may want to evaluate for..."
   - Stay informative but cautious.

2. NO MEDICATION OR PRESCRIPTIONS:
   - Do NOT name any medicines, drugs, or doses.
   - Self-care tips should include only comfort measures like rest, hydration, cold/warm compresses, etc.

3. EMERGENCY BIAS (HARD-CODED HEURISTIC):
   - If the user mentions 'chest pain', 'shortness of breath', 'unconsciousness', 'sudden vision loss', 'severe bleeding', 'seizure', 'stroke symptoms', or 'suicidal thoughts', the severity_level MUST be 'emergency' and recommended_care_setting MUST be 'emergency-department'.
   - Urgency advice MUST say to call emergency services immediately.

4. VULNERABLE GROUPS:
   - For infants, children, pregnant people, elderly (65+), or those with serious chronic diseases (diabetes, heart disease, kidney disease), be more cautious and prefer higher urgency levels.

5. TONE:
   - Be calm, thorough, empathetic, and cautious.
   - Never say "you are fine" or "this is nothing serious."
   - Use wording like "Based on what you described, this warrants careful attention..."

6. DETAIL REQUIREMENT:
   - Every field must be substantive and detailed. Single-word or single-sentence answers are NOT acceptable.
   - The symptom_summary must be at least 3 sentences.
   - The urgency_advice must be at least 3 sentences.
   - All array fields must have at least 3 items.

EXAMPLES:
User: "I have had a mild headache for a few hours."
Response: {
  "symptom_summary": "The patient reports experiencing a mild headache that has persisted for several hours. No additional symptoms such as nausea, vision changes, or neck stiffness have been mentioned. Without information about recent triggers (stress, dehydration, screen time, or sleep deprivation), the presentation appears consistent with a benign primary headache.",
  "possible_body_systems": ["neurological", "general"],
  "severity_level": "low",
  "recommended_care_setting": "self-care",
  "possible_conditions_to_discuss": ["Tension-type headache", "Dehydration-related headache", "Eye strain from screen use", "Stress-related headache"],
  "recommended_specialist": "general",
  "recommended_specialties": ["General Practice", "Neurology"],
  "urgency_advice": "Based on your description, this appears to be a mild issue that can likely be managed at home with rest and hydration. However, if the headache intensifies, becomes the worst headache of your life, or is accompanied by fever, stiff neck, or vision changes, please seek immediate medical attention. If the headache persists beyond 48 hours or recurs frequently, schedule an appointment with your doctor for evaluation.",
  "suggested_next_steps": ["Rest in a quiet, dimly lit room for 30-60 minutes", "Drink at least 2-3 glasses of water to rule out dehydration", "Take a break from screens and close-up work", "Apply a cool or warm compress to your forehead or neck", "Track when the headache started and any potential triggers", "If headache persists beyond 24 hours, contact your healthcare provider"],
  "red_flag_symptoms_to_watch": ["Sudden, severe 'thunderclap' headache", "Headache with fever and stiff neck", "Vision changes or double vision", "Numbness, weakness, or difficulty speaking", "Headache after a head injury", "Headache that wakes you from sleep"],
  "what_to_tell_your_doctor": ["When the headache started and how long it has lasted", "The location and type of pain (throbbing, pressing, sharp)", "Any recent changes in sleep, stress, or screen time", "Any medications or supplements you currently take"],
  "self_care_tips": ["Rest in a quiet, dark room", "Stay well hydrated — aim for 8 glasses of water daily", "Apply a cold pack to your forehead for 15 minutes", "Practice gentle neck stretches and relaxation", "Ensure adequate sleep (7-9 hours)", "Avoid bright screens and loud environments"],
  "lifestyle_recommendations": ["Maintain a regular sleep schedule", "Stay hydrated throughout the day", "Take regular breaks from screen work (20-20-20 rule)", "Practice stress management techniques like deep breathing"],
  "clarifying_questions": ["Do you have any nausea or sensitivity to light?", "Have you been drinking enough water today?", "How much screen time have you had recently?", "Do you have a history of migraines?"],
  "disclaimer": "This guidance is NOT a medical diagnosis and should not replace professional medical advice. It is intended to provide preliminary information only. Always consult a qualified healthcare provider for proper evaluation and treatment of your symptoms."
}

If information is missing, make cautious assumptions and add relevant clarifying questions.`;

const SYMPTOM_ANALYSIS_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    symptom_summary: { type: 'string' },
    possible_body_systems: {
      type: 'array',
      items: { type: 'string' },
    },
    severity_level: {
      type: 'string',
      enum: ['low', 'medium', 'high', 'emergency'],
    },
    recommended_care_setting: {
      type: 'string',
      enum: ['self-care', 'outpatient-clinic', 'urgent-care-same-day', 'emergency-department'],
    },
    possible_conditions_to_discuss: {
      type: 'array',
      items: { type: 'string' },
    },
    recommended_specialist: {
      type: 'string',
      description:
        'Most appropriate medical specialist category based on symptoms. MUST be strictly lowercase (e.g. cardiology, orthopedics, general). Injected directly into OpenStreetMap database query strings.',
    },
    recommended_specialties: {
      type: 'array',
      items: { type: 'string' },
    },
    urgency_advice: { type: 'string' },
    suggested_next_steps: {
      type: 'array',
      items: { type: 'string' },
    },
    red_flag_symptoms_to_watch: {
      type: 'array',
      items: { type: 'string' },
    },
    what_to_tell_your_doctor: {
      type: 'array',
      items: { type: 'string' },
    },
    self_care_tips: {
      type: 'array',
      items: { type: 'string' },
    },
    lifestyle_recommendations: {
      type: 'array',
      items: { type: 'string' },
    },
    clarifying_questions: {
      type: 'array',
      items: { type: 'string' },
    },
    disclaimer: { type: 'string' },
  },
  required: [
    'symptom_summary',
    'possible_body_systems',
    'severity_level',
    'recommended_care_setting',
    'possible_conditions_to_discuss',
    'recommended_specialist',
    'recommended_specialties',
    'urgency_advice',
    'suggested_next_steps',
    'red_flag_symptoms_to_watch',
    'what_to_tell_your_doctor',
    'self_care_tips',
    'lifestyle_recommendations',
    'disclaimer',
  ],
};

async function callGeminiForSymptoms(symptoms, ageRange, gender, chronicConditions, city) {
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
City: ${city || 'not specified'}
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
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: SYMPTOM_ANALYSIS_RESPONSE_SCHEMA,
      },
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
    possible_conditions_to_discuss: ['Unknown conditions (consult doctor)'],
    recommended_specialist: 'general',
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
    what_to_tell_your_doctor: ['Duration of symptoms', 'Severity of symptoms'],
    self_care_tips: ['Rest', 'Stay hydrated', 'Monitor your symptoms'],
    lifestyle_recommendations: ['Maintain a healthy diet', 'Stay hydrated'],
    clarifying_questions: [],
    disclaimer: 'This is NOT a medical diagnosis. Always consult a qualified healthcare provider.',
  };

  // Merge with defaults
  const result = { ...defaults, ...geminiResult };

  // Normalize recommended_specialist to lowercase
  if (result.recommended_specialist) {
    result.recommended_specialist = String(result.recommended_specialist).toLowerCase().trim();
  } else {
    result.recommended_specialist = 'general';
  }

  // Ensure arrays are arrays
  if (!Array.isArray(result.possible_body_systems)) {
    result.possible_body_systems = [result.possible_body_systems];
  }
  if (!Array.isArray(result.possible_conditions_to_discuss)) {
    result.possible_conditions_to_discuss = [result.possible_conditions_to_discuss];
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
  if (!Array.isArray(result.what_to_tell_your_doctor)) {
    result.what_to_tell_your_doctor = [result.what_to_tell_your_doctor];
  }
  if (!Array.isArray(result.lifestyle_recommendations)) {
    result.lifestyle_recommendations = [result.lifestyle_recommendations];
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
    const urgencyAdvice = typeof result.urgency_advice === 'string' ? result.urgency_advice : defaults.urgency_advice;

    if (!urgencyAdvice.toLowerCase().includes('emergency') &&
        !urgencyAdvice.toLowerCase().includes('urgent')) {
      result.urgency_advice = `URGENT: ${urgencyAdvice} Seek emergency care or call emergency services immediately if symptoms worsen.`;
    }
  }

  result.disclaimer = typeof result.disclaimer === 'string' && result.disclaimer.trim().length > 0
    ? result.disclaimer
    : defaults.disclaimer;

  return result;
}

export { callGeminiForSymptoms, buildSafeResult };
