import axios from 'axios';

const OVERPASS_API_URL = 'https://overpass.kumi.systems/api/interpreter';
const NOMINATIM_API_URL = 'https://nominatim.openstreetmap.org/search';
const MAX_CLINICS = 10;
const SEARCH_RADIUS_METERS = 2000;

function clinicMatchesSpecialist(clinic, specialist) {
  if (!specialist) {
    return false;
  }

  const needle = specialist.toLowerCase();
  const haystack = [
    clinic.specialty,
    clinic.name,
    clinic.type,
  ].join(' ').toLowerCase();

  return haystack.includes(needle);
}

function mapOsmElement(element) {
  const tags = element.tags || {};
  const lat = element.lat ?? element.center?.lat;
  const lng = element.lon ?? element.center?.lon;

  if (lat == null || lng == null) {
    return null;
  }

  return {
    name: tags.name || 'Unnamed Clinic/Hospital',
    lat,
    lng,
    specialty: tags['healthcare:speciality'] || tags.healthcare || '',
    type: tags.amenity || '',
    phone: tags.phone || tags['contact:phone'] || '',
    address: tags['addr:full'] || [tags['addr:street'], tags['addr:city']].filter(Boolean).join(', ') || '',
  };
}

function buildOverpassQuery(lat, lng) {
  return `[out:json][timeout:25];
(
  node["amenity"="hospital"](around:${SEARCH_RADIUS_METERS},${lat},${lng});
  way["amenity"="hospital"](around:${SEARCH_RADIUS_METERS},${lat},${lng});
  node["amenity"="clinic"](around:${SEARCH_RADIUS_METERS},${lat},${lng});
  way["amenity"="clinic"](around:${SEARCH_RADIUS_METERS},${lat},${lng});
  node["amenity"="doctors"](around:${SEARCH_RADIUS_METERS},${lat},${lng});
  way["amenity"="doctors"](around:${SEARCH_RADIUS_METERS},${lat},${lng});
  node["healthcare"="clinic"](around:${SEARCH_RADIUS_METERS},${lat},${lng});
  way["healthcare"="clinic"](around:${SEARCH_RADIUS_METERS},${lat},${lng});
  node["healthcare"="hospital"](around:${SEARCH_RADIUS_METERS},${lat},${lng});
  way["healthcare"="hospital"](around:${SEARCH_RADIUS_METERS},${lat},${lng});
  node["healthcare"="doctor"](around:${SEARCH_RADIUS_METERS},${lat},${lng});
  way["healthcare"="doctor"](around:${SEARCH_RADIUS_METERS},${lat},${lng});
  node["healthcare"="centre"](around:${SEARCH_RADIUS_METERS},${lat},${lng});
  way["healthcare"="centre"](around:${SEARCH_RADIUS_METERS},${lat},${lng});
);
out center;`;
}

/**
 * Geocode a city name to coordinates using Nominatim.
 */
export async function geocodeCity(cityName) {
  if (!cityName || typeof cityName !== 'string') {
    return null;
  }

  try {
    const response = await axios.get(NOMINATIM_API_URL, {
      params: {
        q: cityName,
        format: 'json',
        limit: 1,
      },
      headers: {
        'User-Agent': 'SUMO-HealthApp/1.0',
      },
      timeout: 10000,
    });

    const result = response.data?.[0];
    if (result?.lat && result?.lon) {
      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
      };
    }

    return null;
  } catch (error) {
    console.error('Nominatim geocoding error:', error.message);
    return null;
  }
}

export async function fetchNearbyClinics(lat, lng, recommendedSpecialist) {
  // Try Nominatim API instead of Overpass for much better stability
  // Create a viewbox of roughly 5km radius (1 degree lat/lng is approx 111km)
  const radiusDegrees = 0.05;
  const viewbox = `${lng - radiusDegrees},${lat + radiusDegrees},${lng + radiusDegrees},${lat - radiusDegrees}`;
  
  const baseParams = {
    format: 'json',
    limit: MAX_CLINICS,
    viewbox: viewbox,
    bounded: 1,
    addressdetails: 1
  };

  const headers = {
    'User-Agent': 'SUMO-HealthApp/1.0',
    'Accept': 'application/json'
  };

  try {
    // 1. First try to find specialized clinics/hospitals
    let results = [];
    if (recommendedSpecialist && recommendedSpecialist !== 'general') {
      const qSpecialized = `${recommendedSpecialist} hospital`;
      const res = await axios.get(NOMINATIM_API_URL, {
        params: { ...baseParams, q: qSpecialized },
        headers,
        timeout: 10000
      });
      results = res.data || [];
    }

    // 2. If no specialized results, fall back to general hospitals/clinics
    if (results.length === 0) {
      const res = await axios.get(NOMINATIM_API_URL, {
        params: { ...baseParams, q: 'hospital' },
        headers,
        timeout: 10000
      });
      results = res.data || [];
    }
    
    // 3. Map Nominatim results to our expected format
    return results.map(item => {
      const addressParts = [];
      if (item.address) {
        if (item.address.road) addressParts.push(item.address.road);
        if (item.address.suburb) addressParts.push(item.address.suburb);
        if (item.address.city || item.address.town || item.address.village) 
          addressParts.push(item.address.city || item.address.town || item.address.village);
      }
      
      return {
        name: item.name || item.display_name.split(',')[0] || 'Medical Facility',
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        specialty: recommendedSpecialist || 'general',
        type: item.type || 'hospital',
        phone: '', // Nominatim usually doesn't provide phone in the basic search
        address: addressParts.join(', ') || item.display_name
      };
    });
  } catch (error) {
    console.error('Nominatim search error:', error.message);
    return [];
  }
}
