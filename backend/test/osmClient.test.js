import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseOverpassHospitals, haversineKm } from '../src/services/osmClient.js';

test('haversine distance is ~0 for identical points and symmetric', () => {
  assert.ok(haversineKm(19.076, 72.8777, 19.076, 72.8777) < 0.001);
  const d1 = haversineKm(19.076, 72.8777, 18.5204, 73.8567); // Mumbai -> Pune
  const d2 = haversineKm(18.5204, 73.8567, 19.076, 72.8777);
  assert.ok(Math.abs(d1 - d2) < 0.001);
  assert.ok(d1 > 100 && d1 < 160, `Mumbai-Pune should be ~120km, got ${d1}`);
});

const origin = { lat: 19.076, lon: 72.8777 };

test('parses a node element with tags into the hospital shape', () => {
  const elements = [
    {
      type: 'node',
      id: 123,
      lat: 19.08,
      lon: 72.88,
      tags: {
        name: 'Test Hospital',
        phone: '+91-2212345678',
        'addr:street': 'MG Road',
        'addr:city': 'Mumbai',
        'healthcare:speciality': 'cardiology;neurology',
        emergency: 'yes',
      },
    },
  ];
  const [h] = parseOverpassHospitals(elements, origin.lat, origin.lon);
  assert.equal(h.id, 'osm-node-123');
  assert.equal(h.name, 'Test Hospital');
  assert.equal(h.phone, '+91-2212345678');
  assert.deepEqual(h.specialities, ['cardiology', 'neurology']);
  assert.equal(h.emergency, true);
  assert.ok(h.address.includes('MG Road'));
  assert.ok(h.mapsUrl.startsWith('https://www.google.com/maps/dir/?api=1&destination='));
  assert.equal(typeof h.distanceKm, 'number');
});

test('uses center coordinates for way/relation elements', () => {
  const elements = [
    { type: 'way', id: 9, center: { lat: 19.1, lon: 72.9 }, tags: { name: 'Way Hospital' } },
  ];
  const [h] = parseOverpassHospitals(elements, origin.lat, origin.lon);
  assert.equal(h.id, 'osm-way-9');
  assert.ok(h.mapsUrl.includes('19.1,72.9'));
});

test('skips unnamed or unlocatable elements', () => {
  const elements = [
    { type: 'node', id: 1, lat: 19.1, lon: 72.9, tags: {} }, // no name
    { type: 'node', id: 2, tags: { name: 'No Coords Hospital' } }, // no coords
    { type: 'node', id: 3, lat: 19.1, lon: 72.9, tags: { name: 'Valid Hospital' } },
  ];
  const result = parseOverpassHospitals(elements, origin.lat, origin.lon);
  assert.equal(result.length, 1);
  assert.equal(result[0].name, 'Valid Hospital');
});

test('sorts results by distance ascending', () => {
  const elements = [
    { type: 'node', id: 1, lat: 19.2, lon: 73.0, tags: { name: 'Far Hospital' } },
    { type: 'node', id: 2, lat: 19.08, lon: 72.88, tags: { name: 'Near Hospital' } },
  ];
  const result = parseOverpassHospitals(elements, origin.lat, origin.lon);
  assert.equal(result[0].name, 'Near Hospital');
  assert.ok(result[0].distanceKm <= result[1].distanceKm);
});

test('falls back to contact:phone and handles missing phone as null', () => {
  const elements = [
    { type: 'node', id: 1, lat: 19.1, lon: 72.9, tags: { name: 'A', 'contact:phone': '+91-11-1234' } },
    { type: 'node', id: 2, lat: 19.1, lon: 72.9, tags: { name: 'B' } },
  ];
  const result = parseOverpassHospitals(elements, origin.lat, origin.lon);
  assert.equal(result.find((h) => h.name === 'A').phone, '+91-11-1234');
  assert.equal(result.find((h) => h.name === 'B').phone, null);
});

test('handles empty or missing element list', () => {
  assert.deepEqual(parseOverpassHospitals([], 19, 72), []);
  assert.deepEqual(parseOverpassHospitals(undefined, 19, 72), []);
});
