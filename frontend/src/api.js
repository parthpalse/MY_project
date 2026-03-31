// Base URL: use env var in production, proxy in dev
const BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';

function getToken() {
  return localStorage.getItem('de_token');
}

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    ...(getToken() ? { 'Authorization': `Bearer ${getToken()}` } : {})
  };
}

async function handle(res) {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// ── Auth ─────────────────────────────────────────────────────
export const register = (name, email, password) =>
  fetch(`${BASE}/auth/register`, { method: 'POST', headers: authHeaders(), body: JSON.stringify({ name, email, password }) }).then(handle);

export const login = (email, password) =>
  fetch(`${BASE}/auth/login`, { method: 'POST', headers: authHeaders(), body: JSON.stringify({ email, password }) }).then(handle);

export const getMe = () =>
  fetch(`${BASE}/auth/me`, { headers: authHeaders() }).then(handle);

// ── Entries ───────────────────────────────────────────────────
export const getTodayEntry = () =>
  fetch(`${BASE}/entries/today`, { headers: authHeaders() }).then(handle);

export const updateTodayEntry = ({ tasks, notes, busyDay }) =>
  fetch(`${BASE}/entries/today`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ tasks, notes, busyDay }) }).then(handle);

export const endDay = () =>
  fetch(`${BASE}/entries/end-day`, { method: 'POST', headers: authHeaders() }).then(handle);

export const getHistory = () =>
  fetch(`${BASE}/entries/history`, { headers: authHeaders() }).then(handle);

export const getStats = () =>
  fetch(`${BASE}/entries/stats`, { headers: authHeaders() }).then(handle);
