import { useAuthStore } from "@/zustand-stores/auth.store";
import axios from "axios";
import { resolveError } from "./api.utils";

export const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true, // include cookies in cross-origin requests
});

api.interceptors.request.use((config) => {
  const { isAuthenticated, loginData } = useAuthStore.getState();
  const token = loginData?.token;
  if (isAuthenticated && token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.data instanceof FormData) {
    config.headers["Content-Type"] = "multipart/form-data";
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    if (import.meta.env.MODE === "development") {
      console.log(
        " api response ",
        ` ${response.config.method} : ${response.config.url}`,
        response
      );
    }
    return response;
  },
  (error) => {
    const { logout } = useAuthStore.getState();
    if (error.response.status === 401) {
      logout();
    }
    if (import.meta.env.MODE === "development") {
      console.log("error api", error);
    }
    const handledError = resolveError(error);
    if (import.meta.env.MODE === "development") {
      console.log("handledError", handledError);
    }
    return Promise.reject(new Error(handledError));
  }
);
