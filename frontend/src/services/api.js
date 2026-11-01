import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001'
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || localStorage.getItem('mihwar_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const savedUser = localStorage.getItem('mihwar_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      if (parsed?.id) config.headers['user-id'] = parsed.id;
    }
  } catch {
    // تجاهل JSON التالف في localStorage
  }

  return config;
});

export default API;
