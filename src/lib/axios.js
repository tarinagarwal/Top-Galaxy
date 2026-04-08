import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: {
    // Bypass ngrok's free-tier browser warning page so API calls return JSON
    // instead of HTML. Harmless when not behind ngrok.
    'ngrok-skip-browser-warning': 'true',
  },
});

// Request: attach JWT from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tg-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response: handle 401 (expired JWT)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth state
      localStorage.removeItem('tg-token');
      localStorage.removeItem('tg-auth');
      // Reload to reset Zustand persisted state
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
