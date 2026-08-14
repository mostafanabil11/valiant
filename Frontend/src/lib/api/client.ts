import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

function isAuthEndpoint(url?: string) {
  return !!url && /\/auth\/(login|register|refresh)$/.test(url);
}

// Access/refresh tokens live in httpOnly cookies the browser sends automatically
// (withCredentials above); this interceptor never touches the token values
// themselves. On a 401 it asks the backend to rotate the cookies via
// /auth/refresh, then replays the original request once.
let refreshPromise: Promise<void> | null = null;

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableConfig | undefined;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isAuthEndpoint(originalRequest.url)
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    // Concurrent 401s (e.g. several queries firing on page load) share one
    // refresh call instead of each racing to rotate the cookies themselves.
    if (!refreshPromise) {
      refreshPromise = apiClient
        .post("/auth/refresh")
        .then(() => undefined)
        .finally(() => {
          refreshPromise = null;
        });
    }

    try {
      await refreshPromise;
      return apiClient(originalRequest);
    } catch {
      return Promise.reject(error);
    }
  },
);
