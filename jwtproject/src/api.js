import axios from "axios";

// Use Vite's import.meta.env
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // <-- use VITE_ prefix
});

// Attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
