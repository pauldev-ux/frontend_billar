// src/api/api.js
import axios from "axios";

const api = axios.create({

  //baseURL: 'https://billarbackendfastapi-production.up.railway.app',
  baseURL: import.meta.env.VITE_API

});

// interceptor para enviar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
