// client/src/api/api.js
import axios from "axios";
import { auth } from "../firebase/firebase";

const api = axios.create({
  baseURL: "http://localhost:1200/api",
});

api.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
