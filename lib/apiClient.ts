import { API_BASE_URL } from "@/constants";
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { getCookie } from "@/utils/cookies";
import { AUTH_TOKEN_KEY } from "@/types";

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (error?: any) => void;
}> = [];

const baseURL = API_BASE_URL;

const apiClient = axios.create({
    baseURL,
    timeout: 30000, // 30 seconds timeout
    headers: {
        "Content-Type": "application/json",
    },
});

export const client = axios.create({
    baseURL,
    timeout: 30000, // 30 seconds timeout
    headers: {
        "Content-Type": "application/json",
    },
});

apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Try to get token from cookie first, then localStorage
        let token = getCookie(AUTH_TOKEN_KEY);
        
        if (!token && typeof window !== "undefined") {
            token = localStorage.getItem("auth_token");
        }
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Log request in development
        if (process.env.NODE_ENV === "development") {
            // eslint-disable-next-line no-console
            console.log(`[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
        }
        
        return config;
    },
    (error: AxiosError) => Promise.reject(error)
);

// Add request interceptor to client as well
client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Try to get token from cookie first, then localStorage
        let token = getCookie(AUTH_TOKEN_KEY);
        
        if (!token && typeof window !== "undefined") {
            token = localStorage.getItem("auth_token");
        }
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
    },
    (error: AxiosError) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        // Log error in development
        if (process.env.NODE_ENV === "development") {
            // eslint-disable-next-line no-console
            console.error("[API Error]", {
                status: error.response?.status,
                statusText: error.response?.statusText,
                url: error.config?.url ?? "unknown",
                baseURL: error.config?.baseURL ?? "unknown",
                message: error.message,
                code: error.code,
            });
        }

        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401) {
            // Don't redirect if we're already on the signin page (prevents redirect loop)
            const currentPath = window.location.pathname;
            if (currentPath === "/signin" || currentPath.startsWith("/signin")) {
                // Already on signin page, don't redirect - let the login form handle the error
                return Promise.reject(error);
            }
            
            // Don't redirect for login/signup/refresh endpoints - let them handle their own errors
            const requestUrl = originalRequest?.url || "";
            if (
                requestUrl.includes("/auth/login") || 
                requestUrl.includes("/auth/signup") || 
                requestUrl.includes("/auth/google") ||
                requestUrl.includes("/auth/refresh-token")
            ) {
                // Let the auth functions handle the error
                return Promise.reject(error);
            }

            // If this is a retry after refresh, or refresh is in progress, handle accordingly
            if (originalRequest?._retry) {
                // Already retried, refresh token must be invalid - logout
                const { logout } = await import('@/utils');
                await logout();
                const callbackUrl = currentPath || "/";
                window.location.href = `/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`;
                return Promise.reject(error);
            }

            // Try to refresh token
            if (isRefreshing) {
                // If refresh is already in progress, queue this request
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        if (originalRequest) {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                            return apiClient(originalRequest);
                        }
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            // Get refresh token from localStorage
            const refreshTokenValue = typeof window !== "undefined" 
                ? localStorage.getItem("refresh_token") 
                : null;

            if (!refreshTokenValue) {
                // No refresh token available, logout
                const { logout } = await import('@/utils');
                await logout();
                const callbackUrl = currentPath || "/";
                window.location.href = `/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`;
                return Promise.reject(error);
            }

            // Start refresh process
            isRefreshing = true;

            try {
                const { refreshToken: refreshTokenFn } = await import('@/services/auth');
                const { token: newToken } = await refreshTokenFn({ refreshToken: refreshTokenValue });

                // Process queued requests
                failedQueue.forEach(({ resolve }) => {
                    resolve(newToken);
                });
                failedQueue = [];

                // Retry original request with new token
                if (originalRequest) {
                    originalRequest._retry = true;
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return apiClient(originalRequest);
                }

                return Promise.reject(error);
            } catch (refreshError) {
                // Refresh failed, clear auth and logout
                failedQueue.forEach(({ reject }) => {
                    reject(refreshError);
                });
                failedQueue = [];

                const { logout } = await import('@/utils');
                await logout();
                const callbackUrl = currentPath || "/";
                window.location.href = `/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`;
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        // Handle 503 Service Unavailable
        if (error.response?.status === 503) {
            const customError = new Error(
                "Service temporarily unavailable. The server is currently down or overloaded. Please try again in a few moments."
            ) as any;
            customError.is503 = true;
            customError.originalError = error;
            return Promise.reject(customError);
        }

        // Handle timeout errors
        if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
            const customError = new Error(
                "Request timeout. The server is taking too long to respond. Please check your connection and try again."
            ) as any;
            customError.isTimeout = true;
            customError.originalError = error;
            return Promise.reject(customError);
        }

        return Promise.reject(error);
    }
);

export default apiClient;
