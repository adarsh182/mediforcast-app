import axios from 'axios';

// For local development
const LOCAL_API = 'http://localhost:5000/api';

// For production - set this to your Render backend URL
// Example: https://mediforcast-backend.onrender.com/api
const PRODUCTION_API = process.env.REACT_APP_API_URL || LOCAL_API;

const API_BASE = process.env.NODE_ENV === 'production' ? PRODUCTION_API : LOCAL_API;

const client = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

export const analyzeSymptoms = (data) => {
  return client.post('/symptoms/analyze', data);
};

export const getHospitals = (city, department) => {
  const params = {};
  if (city) params.city = city;
  if (department) params.department = department;
  return client.get('/hospitals', { params });
};

export const getPreviousChecks = () => {
  return client.get('/symptoms/previous');
};

export default client;
