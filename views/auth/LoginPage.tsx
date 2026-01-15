"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button, Input, PasswordInput } from "@/components/ui";
import { EnvelopeIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { login, googleLogin } from "@/services/auth";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/contexts/AuthContext";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";
import { NAV_CONSTANT } from "@/constants";

export const LoginPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showSuccess, showError } = useToast();
  const { setUser, setToken } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const safeCallbackUrl = callbackUrl === "/signin" ? "/dashboard" : callbackUrl;

  useEffect(() => {
    // Pre-fill email if provided in URL
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setFormData((prev) => ({ ...prev, email: emailParam }));
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      const response = await login(formData.email, formData.password);

      // Update auth context with user data and token
      let token: string | null = null;
      let user: any = null;
      let refreshToken: string | null = null;

      if (response?.data) {
        // Standard response structure: { status: 200, data: { token, refreshToken, user } }
        token = response.data.token || response.data.data?.token;
        user = response.data.user || response.data.data?.user;
        refreshToken = response.data.refreshToken || response.data.data?.refreshToken;
      } else if (response?.token) {
        // Fallback structure: { token, refreshToken, user }
        token = response.token;
        user = response.user;
        refreshToken = response.refreshToken;
      }

      // Store tokens and user data in AuthContext
      if (token) {
        setToken(token);
        if (refreshToken && typeof window !== "undefined") {
          localStorage.setItem("refresh_token", refreshToken);
        }
      }
      if (user) {
        setUser(user);
      }

      showSuccess("Login successful");

      // Redirect to callback URL or dashboard
      router.push(safeCallbackUrl);
    } catch (error: any) {
      console.error("Login error:", error);

      // Handle field-specific errors
      if (error.message && error.message.includes("fields")) {
        try {
          const errorData = JSON.parse(error.message);
          if (errorData.fields) {
            setErrors(errorData.fields);
          }
        } catch (e) {
          showError(error.message || "Login failed. Please try again.");
        }
      } else {
        showError(error.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      console.log("[Google Login] Starting Google authentication flow...");

      // Step 1: Authenticate with Firebase Google
      const provider = new GoogleAuthProvider();

      let result;
      let firebaseUser;

      try {
        console.log("[Google Login] Opening Firebase popup...");
        // Try popup first (better UX)
        result = await signInWithPopup(auth, provider);
        firebaseUser = result.user;
        console.log("[Google Login] Firebase authentication successful:", {
          email: firebaseUser.email,
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName
        });
      } catch (popupError: any) {
        console.error("[Google Login] Firebase popup error:", popupError);
        // If popup is blocked, fall back to redirect
        if (popupError.code === 'auth/popup-blocked' || popupError.code === 'auth/popup-closed-by-user') {
          showError("Popup was blocked. Please allow popups for this site and try again, or use email/password login.");
          setGoogleLoading(false);
          return;
        }
        // Re-throw other errors
        throw popupError;
      }

      // Step 2: Get ID token from Firebase
      console.log("[Google Login] Getting ID token from Firebase...");
      const idToken = await firebaseUser.getIdToken();
      console.log("[Google Login] ID token obtained:", {
        tokenLength: idToken.length,
        tokenPreview: idToken.substring(0, 20) + "..."
      });

      // Step 3: Send ID token to backend API for authentication
      console.log("[Google Login] Calling backend API...");
      const response = await googleLogin({
        idToken,
      });

      console.log("[Google Login] Backend response received");

      // Step 4: Update auth context with user data and token
      // Handle different response structures
      let token: string | null = null;
      let user: any = null;
      let refreshToken: string | null = null;

      if (response?.data) {
        // Standard response structure: { status: 200, data: { token, refreshToken, user } }
        token = response.data.token || response.data.data?.token;
        user = response.data.user || response.data.data?.user;
        refreshToken = response.data.refreshToken || response.data.data?.refreshToken;
      } else if (response?.token) {
        // Fallback structure: { token, refreshToken, user }
        token = response.token;
        user = response.user;
        refreshToken = response.refreshToken;
      }

      console.log("[Google Login] Extracted data:", {
        hasToken: !!token,
        hasUser: !!user,
        hasRefreshToken: !!refreshToken,
        userEmail: user?.email
      });

      // Store tokens and user data in AuthContext
      if (token) {
        setToken(token);
        if (refreshToken && typeof window !== "undefined") {
          localStorage.setItem("refresh_token", refreshToken);
        }
      }
      if (user) {
        setUser(user);
      }

      showSuccess("Google login successful");
      console.log("[Google Login] Authentication complete, redirecting to:", safeCallbackUrl);

      // Redirect to callback URL or dashboard
      router.push(safeCallbackUrl);
    } catch (error: any) {
      console.error("[Google Login] Error in handleGoogleLogin:", error);

      // Handle specific Firebase errors
      if (error.code === 'auth/popup-blocked') {
        showError("Popup was blocked by your browser. Please allow popups for this site and try again.");
      } else if (error.code === 'auth/popup-closed-by-user') {
        showError("Login was cancelled. Please try again.");
      } else if (error.code === 'auth/network-request-failed') {
        showError("Network error. Please check your connection and try again.");
      } else {
        showError(error.message || "Google login failed. Please try again.");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <Image
              src={NAV_CONSTANT.LOGOS.dark}
              width={140}
              height={140}
              className="h-12 w-auto mx-auto"
              alt="Storefront Logo"
            />
          </Link>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Welcome Back
          </h1>
          <p className="text-neutral-600">
            Sign in to your account to continue
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-neutral-200 p-8">
          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-neutral-400" />
                </div>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  error={errors.email}
                  className={`pl-10 ${errors.email ? "border-error" : ""}`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-error">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <LockClosedIcon className="h-5 w-5 text-neutral-400" />
                </div>
                <PasswordInput
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  error={errors.password}
                  className={`pl-10 ${errors.password ? "border-error" : ""}`}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-error">{errors.password}</p>
              )}
            </div>

            {/* Forgot Password */}
            <div className="flex items-center justify-between">
              <div></div>
              <Link
                href="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              loading={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              Sign In
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-neutral-500">Or continue with</span>
            </div>
          </div>

          {/* Google Login Button */}
          <Button
            type="button"
            onPress={handleGoogleLogin}
            loading={googleLoading}
            variant="bordered"
            className="w-full py-3 border-2 border-neutral-300 hover:border-blue-400 text-neutral-700 hover:text-blue-600 font-semibold rounded-lg flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign in with Google
          </Button>
        </div>

        {/* Sign Up Link */}
        <div className="mt-6 text-center">
          <p className="text-neutral-600">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="text-primary-600 hover:text-primary-700 font-semibold"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
