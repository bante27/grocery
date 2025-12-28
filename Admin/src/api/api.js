import axios from "axios";

const api = axios.create({
  baseURL: "https://grocery-admin-server.onrender.com/api",
  headers: { Accept: "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("userToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
