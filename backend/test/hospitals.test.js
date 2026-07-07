import { test } from 'node:test';
import assert from 'node:assert/strict';
import { departmentMatches } from '../src/routes/hospitals.js';
import hospitals from '../src/data/hospitals.js';

// --- departmentMatches ---

test('matches exact department names case-insensitively', () => {
  assert.ok(departmentMatches('Cardiology', 'cardiology'));
  assert.ok(departmentMatches('ENT', 'ent'));
});

test('matches partial department names', () => {
  assert.ok(departmentMatches('General Physician', 'Physician'));
});

test('matches known aliases', () => {
  assert.ok(departmentMatches('Cardiology', 'heart'));
  assert.ok(departmentMatches('Psychiatry', 'mental health'));
});

test('does not match unrelated departments', () => {
  assert.ok(!departmentMatches('Dermatology', 'Cardiology'));
});

// --- hospital data integrity ---
// These guard against the class of bug where an entry ships with
// copy-pasted or malformed contact data (previously hospital id 16).

const KNOWN_CITIES = ['Mumbai', 'Pune', 'Delhi'];

test('all hospital ids are unique', () => {
  const ids = hospitals.map((h) => h.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('every hospital has a known, exact-match city', () => {
  for (const h of hospitals) {
    assert.ok(KNOWN_CITIES.includes(h.city), `Hospital ${h.id} (${h.name}) has unknown city: ${h.city}`);
  }
});

test('every phone number is dialable (+91 format, no stray whitespace)', () => {
  for (const h of hospitals) {
    assert.match(h.phone, /^\+91-[\d-]+$/, `Hospital ${h.id} (${h.name}) has malformed phone: "${h.phone}"`);
  }
});

test('names, addresses and departments have no stray whitespace', () => {
  for (const h of hospitals) {
    assert.equal(h.name, h.name.trim(), `Hospital ${h.id} name has stray whitespace`);
    assert.equal(h.address, h.address.trim(), `Hospital ${h.id} address has stray whitespace`);
    for (const dept of h.departments) {
      assert.equal(dept, dept.trim(), `Hospital ${h.id} department "${dept}" has stray whitespace`);
      assert.ok(dept.length > 0, `Hospital ${h.id} has an empty department`);
    }
  }
});

test('every hospital has a secure maps URL and at least one department', () => {
  for (const h of hospitals) {
    assert.ok(h.mapsUrl.startsWith('https://'), `Hospital ${h.id} mapsUrl is not https`);
    assert.ok(h.departments.length > 0, `Hospital ${h.id} has no departments`);
  }
});

test('no two hospitals share the same phone or address (copy-paste guard)', () => {
  const phones = hospitals.map((h) => h.phone);
  const addresses = hospitals.map((h) => h.address);
  assert.equal(new Set(phones).size, phones.length, 'Duplicate phone numbers found');
  assert.equal(new Set(addresses).size, addresses.length, 'Duplicate addresses found');
});
