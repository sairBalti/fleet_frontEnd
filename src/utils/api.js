import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5002/api",
});

API.interceptors.request.use((config) => {

  const token = localStorage.getItem("jwtToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Response interceptor for handling session expiration
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Trigger session expiration
      const event = new CustomEvent('sessionExpired');
      window.dispatchEvent(event);
    }
    return Promise.reject(error);
  }
);

export default API;