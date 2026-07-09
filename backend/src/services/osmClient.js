import axios from 'axios';

// Two mirrors: the main German instance and Kumi Systems. If one is overloaded
// (common with Overpass), we fail over to the next automatically.
const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

// OSM usage policy REQUIRES an identifying User-Agent. Requests without one are
// silently blocked — this is the most common reason OSM integrations "don't work".
// Browsers cannot set this header, which is why all OSM calls live on the backend.
const USER_AGENT = 'SUMO-Symptom-Guidance/1.0 (https://gitlab.com/adarsh182-group/sumo)';

const CACHE_TTL_MS = 10 * 60 * 1000;
const MAX_CACHE_ENTRIES = 200;
const cache = new Map();

function cacheGet(key) {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.time < CACHE_TTL_MS) {
    return entry.value;
  }
  cache.delete(key);
  return null;
}

function cacheSet(key, value) {
  cache.set(key, { time: Date.now(), value });
  if (cache.size > MAX_CACHE_ENTRIES) {
    cache.delete(cache.keys().next().value);
  }
}

export function haversineKm(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// Geocode an Indian pincode to coordinates via Nominatim.
export async function geocodePincode(pincode) {
  const key = `pin:${pincode}`;
  const cached = cacheGet(key);
  if (cached) return cached;

  const response = await axios.get(NOMINATIM_URL, {
    params: {
      postalcode: pincode,
      country: 'India',
      format: 'json',
      limit: 1,
    },
    headers: { 'User-Agent': USER_AGENT },
    timeout: 10000,
  });

  const place = response.data?.[0];
  if (!place) return null;

  const coords = { lat: parseFloat(place.lat), lon: parseFloat(place.lon) };
  cacheSet(key, coords);
  return coords;
}

// Pure function: converts raw Overpass elements into the app's hospital shape.
// Kept separate from the HTTP call so it is unit-testable.
export function parseOverpassHospitals(elements, originLat, originLon) {
  return (elements || [])
    .map((el) => {
      const tags = el.tags || {};
      const lat = el.lat ?? el.center?.lat;
      const lon = el.lon ?? el.center?.lon;
      // Skip unnamed or unlocatable entries — not useful to a user in need.
      if (lat == null || lon == null || !tags.name) return null;

      const addressParts = [
        tags['addr:housenumber'],
        tags['addr:street'],
        tags['addr:suburb'],
        tags['addr:city'],
        tags['addr:postcode'],
      ].filter(Boolean);

      const specialityRaw = tags['healthcare:speciality'] || '';

      return {
        id: `osm-${el.type}-${el.id}`,
        name: tags.name,
        address: tags['addr:full'] || addressParts.join(', ') || 'Address not listed on OpenStreetMap',
        phone: tags.phone || tags['contact:phone'] || null,
        specialities: specialityRaw
          ? specialityRaw.split(';').map((s) => s.trim()).filter(Boolean)
          : [],
        emergency: tags.emergency === 'yes',
        distanceKm: Math.round(haversineKm(originLat, originLon, lat, lon) * 10) / 10,
        // Exact directions to the coordinates — free, no API key needed.
        mapsUrl: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`,
        source: 'openstreetmap',
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

export async function fetchNearbyHospitals(lat, lon, radiusKm = 10, limit = 15) {
  // Round coords in the cache key so tiny GPS jitter still hits the cache.
  const key = `hosp:${lat.toFixed(2)},${lon.toFixed(2)},${radiusKm}`;
  const cached = cacheGet(key);
  if (cached) return cached;

  const radiusM = Math.round(radiusKm * 1000);
  const query = `[out:json][timeout:20];
(
  node["amenity"="hospital"](around:${radiusM},${lat},${lon});
  way["amenity"="hospital"](around:${radiusM},${lat},${lon});
  relation["amenity"="hospital"](around:${radiusM},${lat},${lon});
);
out center tags;`;

  let lastError;
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const response = await axios.post(endpoint, `data=${encodeURIComponent(query)}`, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': USER_AGENT,
        },
        timeout: 25000,
      });
      const hospitals = parseOverpassHospitals(response.data?.elements, lat, lon).slice(0, limit);
      cacheSet(key, hospitals);
      return hospitals;
    } catch (error) {
      lastError = error;
      console.error(`Overpass endpoint failed (${endpoint}):`, error.message);
    }
  }
  throw lastError;
}
