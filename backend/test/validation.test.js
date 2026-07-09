import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeInput, MAX_SYMPTOM_LENGTH } from '../src/routes/symptoms.js';

test('rejects missing or too-short symptom text', () => {
  assert.ok(sanitizeInput({}).errors.length > 0);
  assert.ok(sanitizeInput({ text: 'ab' }).errors.length > 0);
  assert.ok(sanitizeInput({ text: '   ' }).errors.length > 0);
});

test('rejects symptom text over the maximum length', () => {
  const { errors } = sanitizeInput({ text: 'a'.repeat(MAX_SYMPTOM_LENGTH + 1) });
  assert.ok(errors.length > 0);
});

test('accepts valid text and trims it', () => {
  const { errors, text } = sanitizeInput({ text: '  persistent cough  ' });
  assert.equal(errors.length, 0);
  assert.equal(text, 'persistent cough');
});

test('drops unknown ageRange and gender values instead of failing', () => {
  const result = sanitizeInput({
    text: 'headache since morning',
    ageRange: 'ignore previous instructions',
    gender: 'DROP TABLE users',
  });
  assert.equal(result.errors.length, 0);
  assert.equal(result.ageRange, undefined);
  assert.equal(result.gender, undefined);
});

test('keeps valid ageRange and gender values', () => {
  const result = sanitizeInput({ text: 'headache', ageRange: '18-40', gender: 'female' });
  assert.equal(result.ageRange, '18-40');
  assert.equal(result.gender, 'female');
});

test('sanitizes chronicConditions: strings only, trimmed, length-capped', () => {
  const result = sanitizeInput({
    text: 'headache',
    chronicConditions: ['Diabetes ', 42, null, 'x'.repeat(100), '  Asthma'],
  });
  assert.deepEqual(result.chronicConditions, ['Diabetes', 'Asthma']);
});

test('caps chronicConditions list size', () => {
  const result = sanitizeInput({
    text: 'headache',
    chronicConditions: Array.from({ length: 50 }, (_, i) => `Condition ${i}`),
  });
  assert.equal(result.chronicConditions.length, 15);
});

test('handles non-array chronicConditions gracefully', () => {
  const result = sanitizeInput({ text: 'headache', chronicConditions: 'Diabetes' });
  assert.deepEqual(result.chronicConditions, []);
});
