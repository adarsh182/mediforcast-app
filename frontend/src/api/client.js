import axios from 'axios';

// API base URL - change to localhost for local development
const API_BASE = import.meta.env.DEV 
  ? 'http://localhost:5000/api' 
  : 'https://mediforcast-app.onrender.com/api';

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
