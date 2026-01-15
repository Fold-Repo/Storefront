"use client";

import React, { useState } from "react";
import { PopupModal } from "@/components/ui";
import { Input, PasswordInput } from "@/components/ui/form";
import { Button } from "@/components/ui";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";
import { useToast } from "@/hooks/useToast";
import { login, googleLogin } from "@/services/auth";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignup: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSwitchToSignup,
}) => {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const { setUser, setToken } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

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

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      // Step 1: Authenticate with Firebase Google
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      
      // Step 2: Get ID token from Firebase
      const idToken = await firebaseUser.getIdToken();
      
      // Step 3: Send ID token to backend API for authentication
      // Only send idToken, no email or provider
      const response = await googleLogin({
        idToken,
      });
      
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
      onClose();
      router.push("/");
    } catch (error: any) {
      console.error("Google login error:", error);
      showError(error.message || "Google login failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await login(formData.email, formData.password);
      
      // Update auth context with user data and token
      // Handle different response structures
      let token: string | null = null;
      let user: any = null;
      let refreshToken: string | null = null;
      
      if (response?.data) {
        // Standard response structure
        token = response.data.token || response.data.data?.token;
        user = response.data.user || response.data.data?.user;
        refreshToken = response.data.refreshToken || response.data.data?.refreshToken;
      } else if (response?.token) {
        // Fallback structure
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
      onClose();
      router.push("/");
    } catch (error: any) {
      showError(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PopupModal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      placement="center"
      showCloseButton={false}
      className="max-w-md"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-neutral-800">Welcome Back</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-neutral-600" />
          </button>
        </div>

        <p className="text-sm text-neutral-600 mb-6">
          Sign in to your account to continue
        </p>

        <div className="space-y-4">
          <Button
            type="button"
            onClick={handleGoogleLogin}
            loading={googleLoading}
            className="w-full bg-white border-2 border-neutral-300 hover:border-primary-400 text-neutral-700 hover:text-primary-600 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
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

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-neutral-500">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="Enter your email"
            className="w-full"
          />

          <PasswordInput
            label="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            placeholder="Enter your password"
            className="w-full"
          />

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="mr-2 w-4 h-4 text-primary-500 rounded border-neutral-300 focus:ring-primary-500"
              />
              <span className="text-neutral-600">Remember me</span>
            </label>
            <button
              type="button"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Forgot password?
            </button>
          </div>

          <Button
            type="submit"
            className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-lg font-medium transition-colors"
            loading={loading}
          >
            Sign In
          </Button>
        </form>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-neutral-600">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={onSwitchToSignup}
              className="text-primary-600 hover:text-primary-700 font-semibold"
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </PopupModal>
  );
};

export default LoginModal;
