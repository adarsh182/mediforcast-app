import express from 'express';
import hospitalsData from '../data/hospitals.js';
import { getCache, setCache } from '../services/hospitalCache.js';

const router = express.Router();
const MAX_QUERY_LENGTH = 120;

// Helper function to normalize department names for matching
const normalizeDepartment = (dept) => {
  return dept.toLowerCase().trim();
};

const normalizeQueryValue = (value) => {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().slice(0, MAX_QUERY_LENGTH);
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

router.get('/', async (req, res) => {
  try {
    const city = normalizeQueryValue(req.query.city);
    const department = normalizeQueryValue(req.query.department);
    const cacheKey = { city, department };

    const cachedHospitals = await getCache('hospitals', cacheKey);
    if (cachedHospitals) {
      return res.json({
        hospitals: cachedHospitals,
        filters: { city, department },
        count: cachedHospitals.length,
        cached: true,
      });
    }

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

    await setCache('hospitals', cacheKey, filtered, 300);
    return res.json({ 
      hospitals: filtered,
      filters: { city, department },
      count: filtered.length,
      cached: false
    });
  } catch (error) {
    console.error('Error fetching hospitals:', error);
    res.status(500).json({ 
      error: 'Failed to fetch hospitals',
      hospitals: []
    });
  }
});

export default router;
