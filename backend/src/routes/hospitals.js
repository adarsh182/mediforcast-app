import express from 'express';
import hospitalsData from '../data/hospitals.js';
import { geocodePincode, fetchNearbyHospitals } from '../services/osmClient.js';

const router = express.Router();

// GET /api/hospitals/nearby?lat=..&lon=..  OR  ?pincode=400001
// Live hospital data from OpenStreetMap around the user's location.
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lon, pincode } = req.query;
    let coords = null;

    if (lat != null && lon != null) {
      const parsedLat = parseFloat(lat);
      const parsedLon = parseFloat(lon);
      if (
        Number.isFinite(parsedLat) &&
        Number.isFinite(parsedLon) &&
        Math.abs(parsedLat) <= 90 &&
        Math.abs(parsedLon) <= 180
      ) {
        coords = { lat: parsedLat, lon: parsedLon };
      }
    } else if (pincode) {
      const trimmed = String(pincode).trim();
      if (!/^\d{6}$/.test(trimmed)) {
        return res.status(400).json({ error: 'Please enter a valid 6-digit pincode.', hospitals: [] });
      }
      coords = await geocodePincode(trimmed);
      if (!coords) {
        return res.status(404).json({ error: 'Could not find that pincode. Please check it and try again.', hospitals: [] });
      }
    }

    if (!coords) {
      return res.status(400).json({ error: 'Provide either lat & lon coordinates or a valid 6-digit pincode.', hospitals: [] });
    }

    const hospitals = await fetchNearbyHospitals(coords.lat, coords.lon);
    res.json({ hospitals, count: hospitals.length, origin: coords, source: 'openstreetmap' });
  } catch (error) {
    console.error('Error fetching nearby hospitals:', error.message);
    res.status(502).json({
      error: 'Could not reach the hospital data service. Please try again.',
      hospitals: [],
    });
  }
});

// Helper function to normalize department names for matching
const normalizeDepartment = (dept) => {
  return dept.toLowerCase().trim();
};

// Helper function to check if a hospital department matches the requested department
const departmentMatches = (hospitalDept, requestedDept) => {
  const normalizedHospital = normalizeDepartment(hospitalDept);
  const normalizedRequested = normalizeDepartment(requestedDept);
  
  // Exact match
  if (normalizedHospital === normalizedRequested) return true;
  
  // Partial match (e.g., "General Physician" matches "General Physician" or "Physician")
  if (normalizedHospital.includes(normalizedRequested) || 
      normalizedRequested.includes(normalizedHospital)) return true;
  
  // Common aliases
  const aliases = {
    'general physician': ['general practice', 'family medicine', 'primary care'],
    'cardiology': ['cardiac', 'heart'],
    'dermatology': ['skin', 'dermatologist'],
    'orthopedics': ['orthopedic', 'bone', 'joint'],
    'neurology': ['neurological', 'brain', 'nervous system'],
    'psychiatry': ['mental health', 'psychiatric', 'psychology'],
    'gynecology': ['gyn', 'women health', 'obstetrics'],
    'pediatrics': ['pediatric', 'children', 'child'],
    'ent': ['ear nose throat', 'otolaryngology'],
    'emergency medicine': ['emergency', 'er', 'accident'],
  };
  
  // Check aliases
  for (const [key, values] of Object.entries(aliases)) {
    if (normalizedHospital === key && values.some(v => normalizedRequested.includes(v))) return true;
    if (normalizedRequested === key && values.some(v => normalizedHospital.includes(v))) return true;
  }
  
  return false;
};

router.get('/', (req, res) => {
  try {
    const { city, department } = req.query;

    let filtered = [...hospitalsData];

    // Filter by city (case-insensitive)
    if (city) {
      filtered = filtered.filter((h) => 
        normalizeDepartment(h.city) === normalizeDepartment(city)
      );
    }

    // Filter by department with flexible matching
    if (department) {
      filtered = filtered.filter((h) =>
        h.departments.some((d) => departmentMatches(d, department))
      );
      
      // If no matches found with department filter, show all hospitals in the city
      // (fallback to city-only results)
      if (filtered.length === 0 && city) {
        filtered = hospitalsData.filter((h) => 
          normalizeDepartment(h.city) === normalizeDepartment(city)
        );
      }
    }

    // If still no results and we have a city, return all hospitals in that city
    // regardless of department
    if (filtered.length === 0 && city && !department) {
      filtered = hospitalsData.filter((h) => 
        normalizeDepartment(h.city) === normalizeDepartment(city)
      );
    }

    res.json({ 
      hospitals: filtered,
      filters: { city, department },
      count: filtered.length
    });
  } catch (error) {
    console.error('Error fetching hospitals:', error);
    res.status(500).json({ 
      error: 'Failed to fetch hospitals',
      hospitals: []
    });
  }
});

export { normalizeDepartment, departmentMatches };
export default router;
