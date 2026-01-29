import axios from 'axios';

// Use VITE_BASE_URL when provided, otherwise fall back to relative `/api`
// In development the Vite dev server can proxy `/api` to your backend.
const baseURL = import.meta.env.VITE_BASE_URL || '/api'

const api = axios.create({
    baseURL,
});

export default api;