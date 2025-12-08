// src/utils/api.js
import axios from "axios";

const BASE = typeof import.meta !== "undefined" ? import.meta.env.VITE_API_URL : undefined;
const baseURL = BASE ? BASE.replace(/\/+$/, "") : "";

const api = axios.create({ baseURL });

export function setAuthToken(token) {
  if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  else delete api.defaults.headers.common["Authorization"];
}

export default api;
