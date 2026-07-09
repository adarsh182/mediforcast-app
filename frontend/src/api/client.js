import axios from 'axios';
import { supabase } from '../lib/supabaseClient';

// API base URL - change to localhost for local development
const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? 'http://localhost:5001/api' : 'https://mediforcast-app.onrender.com/api');

const client = axios.create({
  baseURL: API_BASE,
  timeout: 45000,
});

client.interceptors.request.use(async (config) => {
  let accessToken = null;
  if (sessionStorage.getItem('guest_login') === 'true') {
    accessToken = 'mock-guest-token';
  } else if (supabase) {
    const { data } = await supabase.auth.getSession();
    accessToken = data.session?.access_token;
  }

  if (accessToken) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
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

export const getPreviousChecks = () => client.get('/symptoms/previous');

export const deleteHistoryItem = (id) => client.delete(`/symptoms/previous/${id}`);

export const clearHistory = () => client.delete('/symptoms/previous');

export const getNearbyHospitals = ({ lat, lon, pincode }) => {
  const params = {};
  if (lat != null && lon != null) {
    params.lat = lat;
    params.lon = lon;
  } else if (pincode) {
    params.pincode = pincode;
  }
  return client.get('/hospitals/nearby', { params });
};

export default client;
