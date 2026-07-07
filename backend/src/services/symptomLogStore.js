import { supabaseAdmin } from './supabaseClient.js';

function normalizeUserId(userId) {
  if (typeof userId !== 'string') {
    return null;
  }

  const trimmed = userId.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function buildResultFallback(row) {
  return {
    severity_level: row.severity_level,
    recommended_care_setting: row.care_setting,
    urgency_advice: row.urgency_advice,
    recommended_specialties: ensureArray(row.recommended_specialties),
  };
}

function mapSymptomLogRow(row) {
  const chronicConditions = ensureArray(row.chronic_conditions);
  const recommendedSpecialties = ensureArray(row.recommended_specialties);
  const nearbyClinics = ensureArray(row.nearby_clinics);

  return {
    id: row.id,
    userId: row.user_id,
    symptomText: row.symptom_text,
    ageRange: row.age_range,
    gender: row.gender,
    city: row.city,
    chronicConditions,
    severityLevel: row.severity_level,
    careSetting: row.care_setting,
    urgencyAdvice: row.urgency_advice,
    recommendedSpecialties,
    nearbyClinics,
    nearby_clinics: nearbyClinics,
    timestamp: row.created_at,
    result: row.result_json || buildResultFallback(row),
    symptoms: row.symptom_text,
    formData: {
      ageRange: row.age_range,
      gender: row.gender,
      chronicConditions,
    },
  };
}

export async function saveSymptomLog({
  userId,
  symptomText,
  ageRange,
  gender,
  city,
  chronicConditions,
  severityLevel,
  careSetting,
  urgencyAdvice,
  recommendedSpecialties,
  nearbyClinics,
  result,
}) {
  if (!supabaseAdmin) {
    console.warn('Supabase not configured, skipping symptom log persistence.');
    return null;
  }

  const normalizedUserId = normalizeUserId(userId);
  
  if (normalizedUserId === 'guest_user') {
    // Return early to prevent saving guest data to the production Supabase database
    return mapSymptomLogRow({
      id: Date.now(),
      user_id: normalizedUserId,
      symptom_text: symptomText,
      age_range: ageRange || null,
      gender: gender || null,
      city: city || null,
      chronic_conditions: ensureArray(chronicConditions),
      severity_level: severityLevel || result?.severity_level || 'medium',
      care_setting: careSetting || result?.recommended_care_setting || null,
      urgency_advice: urgencyAdvice || result?.urgency_advice || null,
      recommended_specialties: ensureArray(recommendedSpecialties),
      nearby_clinics: ensureArray(nearbyClinics),
      result_json: result || {},
      created_at: new Date().toISOString()
    });
  }
  const insertPayload = {
    user_id: normalizedUserId,
    symptom_text: symptomText,
    age_range: ageRange || null,
    gender: gender || null,
    city: city || null,
    chronic_conditions: ensureArray(chronicConditions),
    severity_level: severityLevel || result?.severity_level || 'medium',
    care_setting: careSetting || result?.recommended_care_setting || null,
    urgency_advice: urgencyAdvice || result?.urgency_advice || null,
    recommended_specialties: ensureArray(recommendedSpecialties),
    nearby_clinics: ensureArray(nearbyClinics),
    result_json: result || {},
  };

  const { data, error } = await supabaseAdmin
    .from('symptom_logs')
    .insert(insertPayload)
    .select(
      `
        id,
        user_id,
        symptom_text,
        age_range,
        gender,
        city,
        chronic_conditions,
        severity_level,
        care_setting,
        urgency_advice,
        recommended_specialties,
        nearby_clinics,
        result_json,
        created_at
      `,
    )
    .single();

  if (error) {
    console.error('Supabase insert error:', error);
    throw error;
  }

  return mapSymptomLogRow(data);
}

export async function listSymptomLogs({ userId } = {}) {
  if (!supabaseAdmin) {
    console.warn('Supabase not configured, returning empty symptom log history.');
    return [];
  }

  const normalizedUserId = normalizeUserId(userId);

  if (normalizedUserId === 'guest_user') {
    return [];
  }

  let query = supabaseAdmin
    .from('symptom_logs')
    .select(
      `
        id,
        user_id,
        symptom_text,
        age_range,
        gender,
        city,
        chronic_conditions,
        severity_level,
        care_setting,
        urgency_advice,
        recommended_specialties,
        nearby_clinics,
        result_json,
        created_at
      `,
    );

  if (normalizedUserId) {
    query = query.eq('user_id', normalizedUserId);
  }

  const { data, error } = await query.order('created_at', { ascending: false }).limit(50);

  if (error) {
    console.error('Supabase history fetch error:', error);
    throw error;
  }

  return ensureArray(data).map(mapSymptomLogRow);
}

export async function deleteSymptomLog(id, { userId } = {}) {
  if (!id || !supabaseAdmin) {
    return false;
  }

  const normalizedUserId = normalizeUserId(userId);
  let query = supabaseAdmin.from('symptom_logs').delete({ count: 'exact' }).eq('id', id);

  if (normalizedUserId) {
    query = query.eq('user_id', normalizedUserId);
  }

  const { count, error } = await query;

  if (error) {
    console.error('Supabase delete error:', error);
    throw error;
  }

  return (count || 0) > 0;
}

export async function clearSymptomLogs({ userId } = {}) {
  if (!supabaseAdmin) {
    return;
  }

  const normalizedUserId = normalizeUserId(userId);
  if (!normalizedUserId) {
    console.warn('Skipping symptom history clear without a user id.');
    return;
  }

  const { error } = await supabaseAdmin
    .from('symptom_logs')
    .delete()
    .eq('user_id', normalizedUserId);

  if (error) {
    console.error('Supabase clear history error:', error);
    throw error;
  }
}
