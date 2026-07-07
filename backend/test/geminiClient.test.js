import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildSafeResult } from '../src/services/geminiClient.js';

test('returns conservative defaults for an empty result', () => {
  const result = buildSafeResult({});
  assert.equal(result.severity_level, 'medium');
  assert.equal(result.recommended_care_setting, 'outpatient-clinic');
  assert.deepEqual(result.recommended_specialties, ['General Physician']);
  assert.ok(result.disclaimer.length > 0);
});

test('returns conservative defaults when result is null or not an object', () => {
  assert.equal(buildSafeResult(null).severity_level, 'medium');
  assert.equal(buildSafeResult('garbage').severity_level, 'medium');
  assert.equal(buildSafeResult(42).severity_level, 'medium');
});

test('keeps valid values untouched (content is never truncated)', () => {
  const input = {
    symptom_summary: 'Persistent cough for three days with mild fever.',
    severity_level: 'low',
    recommended_care_setting: 'self-care',
    recommended_specialties: ['General Physician', 'ENT'],
    urgency_advice: 'Monitor symptoms and consult a doctor if they persist.',
    self_care_tips: ['Rest', 'Stay hydrated'],
  };
  const result = buildSafeResult(input);
  assert.equal(result.symptom_summary, input.symptom_summary);
  assert.equal(result.severity_level, 'low');
  assert.equal(result.recommended_care_setting, 'self-care');
  assert.deepEqual(result.recommended_specialties, ['General Physician', 'ENT']);
  assert.equal(result.urgency_advice, input.urgency_advice);
});

test('falls back to medium for unknown severity values', () => {
  const result = buildSafeResult({ severity_level: 'critical' });
  assert.equal(result.severity_level, 'medium');
});

test('falls back for unknown care setting values', () => {
  const result = buildSafeResult({ recommended_care_setting: 'hospital' });
  assert.equal(result.recommended_care_setting, 'outpatient-clinic');
});

test('does not crash when urgency_advice is not a string (regression)', () => {
  const result = buildSafeResult({
    severity_level: 'emergency',
    urgency_advice: { text: 'unexpected object' },
  });
  assert.equal(typeof result.urgency_advice, 'string');
  assert.ok(result.urgency_advice.toLowerCase().includes('urgent'));
});

test('wraps a scalar string into an array for array fields', () => {
  const result = buildSafeResult({ recommended_specialties: 'Cardiology' });
  assert.deepEqual(result.recommended_specialties, ['Cardiology']);
});

test('filters non-string entries out of array fields', () => {
  const result = buildSafeResult({ self_care_tips: ['Rest', 42, null, 'Hydrate'] });
  assert.deepEqual(result.self_care_tips, ['Rest', 'Hydrate']);
});

test('adds URGENT prefix for emergency severity when advice lacks urgent wording', () => {
  const result = buildSafeResult({
    severity_level: 'emergency',
    urgency_advice: 'See a doctor soon.',
  });
  assert.ok(result.urgency_advice.startsWith('URGENT:'));
});

test('does not double-prefix when advice already mentions emergency', () => {
  const advice = 'Go to the emergency department immediately.';
  const result = buildSafeResult({ severity_level: 'emergency', urgency_advice: advice });
  assert.equal(result.urgency_advice, advice);
});

test('adds URGENT prefix when care setting is emergency-department even at low severity', () => {
  const result = buildSafeResult({
    severity_level: 'low',
    recommended_care_setting: 'emergency-department',
    urgency_advice: 'Please get checked.',
  });
  assert.ok(result.urgency_advice.startsWith('URGENT:'));
});
