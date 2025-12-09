import axios from 'axios';

// API base URL - uses Render backend in production
const API_BASE = 'https://mediforcast-app.onrender.com/api';

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
