import apiClient from "@/lib/apiClient";
import axios, { AxiosError } from "axios";
import { ENDPOINT, API_BASE_URL } from "@/constants";

export interface SignupPayload {
  businessname: string;
  businesstype: string;
  tin: string;
  website: string;
  business_registration_number: string;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  phone: string;
  altphone?: string;
  product_service: string;
  product_description: string;
  product_brochure: string | null;
  terms_condition: "yes" | "no";
  certify_correct_data: "yes" | "no";
  role: "business";
  position: string;
  addressline1: string;
  addressline2?: string;
  addressline3?: string | null;
  city: string;
  postcode: string;
}

// Generate a secure random password for Google signups
// This password is not used for login - Google authentication is used instead
// It's only required to satisfy the API validation
export const generateSecurePassword = (): string => {
  // Generate a secure random password that won't be used for authentication
  // Format: GOOGLE_AUTH_ + random secure string
  const randomPart = crypto.getRandomValues(new Uint8Array(32));
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const randomString = Array.from(randomPart, (x) => charset[x % charset.length]).join("");
  return `GOOGLE_AUTH_${randomString}`;
};

export interface FileUploadResponse {
  status: number;
  data: {
    image_id: number;
    user_id: number;
    public_id: string;
    url: string;
    folder: string;
    created_at: string;
  };
}

export const uploadFile = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await apiClient.post<FileUploadResponse>(ENDPOINT.UPLOADS.MULTIPLE, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data.data.url;
  } catch (error: any) {
    // Handle 503 Service Unavailable
    if (error.is503 || error.response?.status === 503) {
      throw new Error("Service temporarily unavailable. The server is currently down or overloaded. Please try again in a few moments.");
    }

    // Handle timeout errors
    if (error.isTimeout || error.code === 'ECONNABORTED') {
      throw new Error("Request timeout. The server is taking too long to respond. Please check your connection and try again.");
    }

    if (error instanceof AxiosError) {
      // Handle 503 from response
      if (error.response?.status === 503) {
        throw new Error("Service temporarily unavailable. The server is currently down or overloaded. Please try again in a few moments.");
      }

      const errorMessage = error.response?.data?.message || error.message || "File upload failed";
      throw new Error(errorMessage);
    }
    throw error;
  }
};

// Clean payload - remove undefined values and convert null to appropriate values
const cleanPayload = (payload: SignupPayload): any => {
  const cleaned: any = {};
  Object.entries(payload).forEach(([key, value]) => {
    // Skip undefined values
    if (value !== undefined) {
      // Convert null to null (keep it for fields that accept null)
      if (value === null) {
        cleaned[key] = null;
      } else {
        cleaned[key] = value;
      }
    }
  });
  return cleaned;
};

export const signup = async (payload: SignupPayload): Promise<any> => {
  try {
    // Clean the payload before sending
    const cleanedPayload = cleanPayload(payload);

    // Log request for debugging (remove in production)
    if (process.env.NODE_ENV === "development") {
      console.log("Signup payload:", JSON.stringify(cleanedPayload, null, 2));
    }

    const response = await apiClient.post(ENDPOINT.AUTH.SIGNUP, cleanedPayload);

    // Store auth token if provided (some APIs return token immediately)
    if (response.data?.token || response.data?.data?.token) {
      const token = response.data?.token || response.data?.data?.token;
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_token", token);
        // Also set as cookie for axios interceptor
        const { setCookie } = await import("@/utils/cookies");
        const { AUTH_TOKEN_KEY } = await import("@/types");
        setCookie(AUTH_TOKEN_KEY, token, 7);
      }
    }

    return response.data;
  } catch (error: any) {
    // Handle 503 Service Unavailable
    if (error.is503 || error.response?.status === 503) {
      throw new Error("Service temporarily unavailable. The server is currently down or overloaded. Please try again in a few moments.");
    }

    // Handle timeout errors
    if (error.isTimeout || error.code === 'ECONNABORTED') {
      throw new Error("Request timeout. The server is taking too long to respond. Please check your connection and try again.");
    }

    if (error instanceof AxiosError) {
      // Handle field-specific validation errors
      if (error.response?.data?.fields) {
        const errorMessage = JSON.stringify({
          message: error.response.data.error || error.response.data.message || "Validation errors",
          fields: error.response.data.fields
        });
        throw new Error(errorMessage);
      }

      // Handle 503 from response
      if (error.response?.status === 503) {
        throw new Error("Service temporarily unavailable. The server is currently down or overloaded. Please try again in a few moments.");
      }

      // Handle other API errors
      const errorMessage = error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Signup failed";
      throw new Error(errorMessage);
    }

    // Handle network errors
    if (error.message?.includes("Network Error") || error.code === "ERR_NETWORK") {
      throw new Error("Network error: Unable to reach the server. Please check your internet connection and API URL configuration.");
    }

    throw error;
  }
};

export interface GoogleSignupPayload {
  idToken: string;
  role?: string; // optional, default: 'business'
  phone?: string; // optional
  altphone?: string; // optional
  position?: string; // optional
}

export interface GoogleLoginPayload {
  idToken: string;
}

export const googleSignup = async (payload: GoogleSignupPayload): Promise<any> => {
  try {
    const response = await apiClient.post(ENDPOINT.AUTH.GOOGLE_SIGNUP, {
      idToken: payload.idToken,
      role: payload.role || 'business',
      phone: payload.phone || undefined,
      altphone: payload.altphone || undefined,
      position: payload.position || undefined,
    });

    // Return response data
    return response.data;
  } catch (error: any) {
    // Handle 503 Service Unavailable
    if (error.is503 || error.response?.status === 503) {
      throw new Error("Service temporarily unavailable. The server is currently down or overloaded. Please try again in a few moments.");
    }

    // Handle timeout errors
    if (error.isTimeout || error.code === 'ECONNABORTED') {
      throw new Error("Request timeout. The server is taking too long to respond. Please check your connection and try again.");
    }

    if (error instanceof AxiosError) {
      // Handle field-specific validation errors
      if (error.response?.data?.fields) {
        const errorMessage = JSON.stringify({
          message: error.response.data.error || error.response.data.message || "Validation errors",
          fields: error.response.data.fields
        });
        throw new Error(errorMessage);
      }

      // Handle 503 from response
      if (error.response?.status === 503) {
        throw new Error("Service temporarily unavailable. The server is currently down or overloaded. Please try again in a few moments.");
      }

      const errorMessage = error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Google signup failed";
      throw new Error(errorMessage);
    }

    // Handle network errors
    if (error.message?.includes("Network Error") || error.code === "ERR_NETWORK") {
      throw new Error("Network error: Unable to reach the server. Please check your internet connection and API URL configuration.");
    }

    throw error;
  }
};

export const googleLogin = async (payload: GoogleLoginPayload): Promise<any> => {
  try {
    // Log the request URL in development
    if (process.env.NODE_ENV === "development") {
      console.log("[Google Login] Calling endpoint:", `${API_BASE_URL}${ENDPOINT.AUTH.GOOGLE_SIGNIN}`);
      console.log("[Google Login] Payload:", {
        idToken: payload.idToken.substring(0, 20) + "..." // Show first 20 chars only for security
      });
    }

    const response = await apiClient.post(ENDPOINT.AUTH.GOOGLE_SIGNIN, {
      idToken: payload.idToken,
    });

    // Log successful response in development
    if (process.env.NODE_ENV === "development") {
      console.log("[Google Login] Response status:", response.status);
      console.log("[Google Login] Response data structure:", {
        hasData: !!response.data,
        hasToken: !!(response.data?.token || response.data?.data?.token),
        hasUser: !!(response.data?.user || response.data?.data?.user),
        hasRefreshToken: !!(response.data?.refreshToken || response.data?.data?.refreshToken)
      });
    }

    // Return response data - storage will be handled by AuthContext via LoginModal
    return response.data;
  } catch (error: any) {
    // Log error details in development
    if (process.env.NODE_ENV === "development") {
      console.error("[Google Login] Error occurred:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        code: error.code
      });
    }

    // Handle 503 Service Unavailable
    if (error.is503 || error.response?.status === 503) {
      throw new Error("Service temporarily unavailable. The server is currently down or overloaded. Please try again in a few moments.");
    }

    // Handle timeout errors
    if (error.isTimeout || error.code === 'ECONNABORTED') {
      throw new Error("Request timeout. The server is taking too long to respond. Please check your connection and try again.");
    }

    if (error instanceof AxiosError) {
      // Handle 503 from response
      if (error.response?.status === 503) {
        throw new Error("Service temporarily unavailable. The server is currently down or overloaded. Please try again in a few moments.");
      }

      const errorMessage = error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Google login failed";
      throw new Error(errorMessage);
    }

    // Handle network errors
    if (error.message?.includes("Network Error") || error.code === "ERR_NETWORK") {
      throw new Error("Network error: Unable to reach the server. Please check your internet connection.");
    }

    throw error;
  }
};

export const login = async (email: string, password: string): Promise<any> => {
  try {
    // Log the request URL in development
    if (process.env.NODE_ENV === "development") {
      console.log("[Login] Calling endpoint:", `${API_BASE_URL}${ENDPOINT.AUTH.LOGIN}`);
      console.log("[Login] Payload:", { email, password: "***" });
    }

    const response = await apiClient.post(ENDPOINT.AUTH.LOGIN, { email, password });

    // Return response data - storage will be handled by AuthContext via LoginModal
    return response.data;
  } catch (error: any) {
    // Handle 503 Service Unavailable
    if (error.is503 || error.response?.status === 503) {
      throw new Error("Service temporarily unavailable. The server is currently down or overloaded. Please try again in a few moments.");
    }

    // Handle timeout errors
    if (error.isTimeout || error.code === 'ECONNABORTED') {
      throw new Error("Request timeout. The server is taking too long to respond. Please check your connection and try again.");
    }

    if (error instanceof AxiosError) {
      // Handle 503 from response
      if (error.response?.status === 503) {
        throw new Error("Service temporarily unavailable. The server is currently down or overloaded. Please try again in a few moments.");
      }

      const errorMessage = error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Login failed";
      throw new Error(errorMessage);
    }

    // Handle network errors
    if (error.message?.includes("Network Error") || error.code === "ERR_NETWORK") {
      throw new Error("Network error: Unable to reach the server. Please check your internet connection.");
    }

    throw error;
  }
};

export interface VerifyAccountPayload {
  email: string;
  token: string;
}

export interface ResendOtpPayload {
  email: string;
  type: "verify_account";
}

export const resendOtp = async (payload: ResendOtpPayload): Promise<any> => {
  try {
    const response = await apiClient.post(ENDPOINT.AUTH.REQUEST_OTP, payload);
    return response.data;
  } catch (error: any) {
    // Handle 503 Service Unavailable
    if (error.is503 || error.response?.status === 503) {
      throw new Error("Service temporarily unavailable. The server is currently down or overloaded. Please try again in a few moments.");
    }

    // Handle timeout errors
    if (error.isTimeout || error.code === 'ECONNABORTED') {
      throw new Error("Request timeout. The server is taking too long to respond. Please check your connection and try again.");
    }

    if (error instanceof AxiosError) {
      // Handle 503 from response
      if (error.response?.status === 503) {
        throw new Error("Service temporarily unavailable. The server is currently down or overloaded. Please try again in a few moments.");
      }

      const errorMessage = error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to resend verification code";
      throw new Error(errorMessage);
    }

    // Handle network errors
    if (error.message?.includes("Network Error") || error.code === "ERR_NETWORK") {
      throw new Error("Network error: Unable to reach the server. Please check your internet connection.");
    }

    throw error;
  }
};

export const verifyAccount = async (payload: VerifyAccountPayload): Promise<any> => {
  try {
    const response = await apiClient.post(ENDPOINT.AUTH.VERIFY_ACCOUNT, payload);

    // Store auth token and user data if provided after verification
    if (response.data?.data) {
      const { token, refreshToken, user } = response.data.data;

      if (token && typeof window !== "undefined") {
        // Store token
        localStorage.setItem("auth_token", token);
        if (refreshToken) {
          localStorage.setItem("refresh_token", refreshToken);
        }

        // Also set as cookie for axios interceptor
        const { setCookie } = await import("@/utils/cookies");
        const { AUTH_TOKEN_KEY } = await import("@/types");
        setCookie(AUTH_TOKEN_KEY, token, 7);

        // Store user data
        if (user) {
          localStorage.setItem("user_data", JSON.stringify(user));
        }
      }
    } else if (response.data?.token) {
      // Fallback for different response structure
      const token = response.data.token;
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_token", token);
        const { setCookie } = await import("@/utils/cookies");
        const { AUTH_TOKEN_KEY } = await import("@/types");
        setCookie(AUTH_TOKEN_KEY, token, 7);
      }
    }

    return response.data;
  } catch (error: any) {
    // Handle 503 Service Unavailable
    if (error.is503 || error.response?.status === 503) {
      throw new Error("Service temporarily unavailable. The server is currently down or overloaded. Please try again in a few moments.");
    }

    // Handle timeout errors
    if (error.isTimeout || error.code === 'ECONNABORTED') {
      throw new Error("Request timeout. The server is taking too long to respond. Please check your connection and try again.");
    }

    if (error instanceof AxiosError) {
      // Handle field-specific validation errors
      if (error.response?.data?.fields) {
        const errorMessage = JSON.stringify({
          message: error.response.data.error || error.response.data.message || "Validation errors",
          fields: error.response.data.fields
        });
        throw new Error(errorMessage);
      }

      // Handle 503 from response
      if (error.response?.status === 503) {
        throw new Error("Service temporarily unavailable. The server is currently down or overloaded. Please try again in a few moments.");
      }

      const errorMessage = error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Account verification failed";
      throw new Error(errorMessage);
    }

    // Handle network errors
    if (error.message?.includes("Network Error") || error.code === "ERR_NETWORK") {
      throw new Error("Network error: Unable to reach the server. Please check your internet connection.");
    }

    throw error;
  }
};

export interface ForgotPasswordPayload {
  email: string;
}

export const forgotPassword = async (payload: ForgotPasswordPayload): Promise<any> => {
  try {
    const response = await apiClient.post(ENDPOINT.AUTH.RESET_PASSWORD, payload);
    return response.data;
  } catch (error: any) {
    // Handle 503 Service Unavailable
    if (error.is503 || error.response?.status === 503) {
      throw new Error("Service temporarily unavailable. The server is currently down or overloaded. Please try again in a few moments.");
    }

    // Handle timeout errors
    if (error.isTimeout || error.code === 'ECONNABORTED') {
      throw new Error("Request timeout. The server is taking too long to respond. Please check your connection and try again.");
    }

    if (error instanceof AxiosError) {
      // Handle 503 from response
      if (error.response?.status === 503) {
        throw new Error("Service temporarily unavailable. The server is currently down or overloaded. Please try again in a few moments.");
      }

      const errorMessage = error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to send password reset email";
      throw new Error(errorMessage);
    }

    // Handle network errors
    if (error.message?.includes("Network Error") || error.code === "ERR_NETWORK") {
      throw new Error("Network error: Unable to reach the server. Please check your internet connection.");
    }

    throw error;
  }
};

export interface ResetPasswordPayload {
  email: string;
  password: string;
  token: string;
}

export const resetPassword = async (payload: ResetPasswordPayload): Promise<any> => {
  try {
    const response = await apiClient.patch(ENDPOINT.AUTH.RESET_PASSWORD, payload);
    return response.data;
  } catch (error: any) {
    // Handle 503 Service Unavailable
    if (error.is503 || error.response?.status === 503) {
      throw new Error("Service temporarily unavailable. The server is currently down or overloaded. Please try again in a few moments.");
    }

    // Handle timeout errors
    if (error.isTimeout || error.code === 'ECONNABORTED') {
      throw new Error("Request timeout. The server is taking too long to respond. Please check your connection and try again.");
    }

    if (error instanceof AxiosError) {
      // Handle field-specific validation errors
      if (error.response?.data?.fields) {
        const errorMessage = JSON.stringify({
          message: error.response.data.error || error.response.data.message || "Validation errors",
          fields: error.response.data.fields
        });
        throw new Error(errorMessage);
      }

      // Handle 503 from response
      if (error.response?.status === 503) {
        throw new Error("Service temporarily unavailable. The server is currently down or overloaded. Please try again in a few moments.");
      }

      const errorMessage = error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to reset password";
      throw new Error(errorMessage);
    }

    // Handle network errors
    if (error.message?.includes("Network Error") || error.code === "ERR_NETWORK") {
      throw new Error("Network error: Unable to reach the server. Please check your internet connection.");
    }

    throw error;
  }
};

export interface RefreshTokenPayload {
  refreshToken: string;
}

export const refreshToken = async (payload: RefreshTokenPayload): Promise<any> => {
  try {
    // Use a separate axios instance without interceptors to avoid infinite loops
    // API_BASE_URL defaults to 'https://shorp-epos-backend.onrender.com/api/v1' or from NEXT_PUBLIC_API_URL env var
    const response = await axios.post(`${API_BASE_URL}${ENDPOINT.AUTH.REFRESH_TOKEN}`, payload);

    // Store new tokens
    let token: string | null = null;
    let newRefreshToken: string | null = null;

    if (response.data?.data) {
      token = response.data.data.token;
      newRefreshToken = response.data.data.refreshToken;
    } else if (response.data?.token) {
      token = response.data.token;
      newRefreshToken = response.data.refreshToken;
    }

    if (token && typeof window !== "undefined") {
      localStorage.setItem("auth_token", token);
      const { setCookie } = await import("@/utils/cookies");
      const { AUTH_TOKEN_KEY } = await import("@/types");
      setCookie(AUTH_TOKEN_KEY, token, 7);

      if (newRefreshToken) {
        localStorage.setItem("refresh_token", newRefreshToken);
      }
    }

    return { token, refreshToken: newRefreshToken, data: response.data };
  } catch (error: any) {
    // If refresh token fails, clear all auth and throw error
    if (typeof window !== "undefined") {
      const { logout } = await import("@/utils");
      await logout();
    }

    if (error instanceof AxiosError) {
      const errorMessage = error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Token refresh failed";
      throw new Error(errorMessage);
    }

    throw error;
  }
};
