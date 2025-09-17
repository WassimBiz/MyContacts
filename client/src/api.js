// client/src/api.js
const fromEnv = import.meta.env.VITE_API_BASE_URL;
// fallback en local : http://localhost:4000/api
export const API_BASE = (fromEnv ? fromEnv : 'http://localhost:4000/api').replace(/\/$/, '');

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const url = `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
  return fetch(url, { ...options, headers });
}
