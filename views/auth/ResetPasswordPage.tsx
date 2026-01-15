"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button, Input, PasswordInput } from "@/components/ui";
import { EnvelopeIcon, LockClosedIcon, KeyIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { resetPassword, forgotPassword } from "@/services/auth";
import { useToast } from "@/hooks/useToast";
import { NAV_CONSTANT } from "@/constants";

export const ResetPasswordPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showSuccess, showError } = useToast();
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    token: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Get email and token from URL params if available
    const emailParam = searchParams.get("email");
    const tokenParam = searchParams.get("token");
    
    if (emailParam) {
      setFormData((prev) => ({ ...prev, email: emailParam }));
    }
    if (tokenParam) {
      setFormData((prev) => ({ ...prev, token: tokenParam }));
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    // Allow paste on all fields - default browser behavior will handle it
    // This handler is here to ensure paste events are not blocked
    e.stopPropagation();
  };

  const handleResendToken = async () => {
    if (!formData.email) {
      showError("Please enter your email address first");
      return;
    }

    setResending(true);
    try {
      await forgotPassword({ email: formData.email });
      showSuccess("Reset token sent! Please check your email.");
    } catch (error: any) {
      console.error("Resend token error:", error);
      showError(error.message || "Failed to resend token. Please try again.");
    } finally {
      setResending(false);
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
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    if (!formData.token) {
      newErrors.token = "Reset token is required";
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
      await resetPassword({
        email: formData.email,
        password: formData.password,
        token: formData.token,
      });
      
      showSuccess("Password reset successful! Redirecting to sign in...");
      setSuccess(true);
      
      // Redirect to sign in after 2 seconds
      setTimeout(() => {
        router.push("/signin");
      }, 2000);
    } catch (error: any) {
      console.error("Reset password error:", error);
      showError(error.message || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
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
            Reset Password
          </h1>
          <p className="text-neutral-600">
            {success 
              ? "Your password has been reset successfully!"
              : "Enter the token from your email and your new password below"
            }
          </p>
        </div>

        {/* Reset Password Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-neutral-200 p-8">
          {success ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <LockClosedIcon className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-neutral-900 mb-2">
                Password Reset Successful!
              </h2>
              <p className="text-neutral-600 mb-6">
                You can now sign in with your new password.
              </p>
              <Link href="/signin">
                <Button
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  Go to Sign In
                </Button>
              </Link>
            </div>
          ) : (
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
                    onPaste={handlePaste}
                    placeholder="you@example.com"
                    error={errors.email}
                    className={`pl-10 ${errors.email ? "border-error" : ""}`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-error">{errors.email}</p>
                )}
              </div>

              {/* Token Field */}
              <div>
                <label htmlFor="token" className="block text-sm font-medium text-neutral-700 mb-2">
                  Reset Token
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyIcon className="h-5 w-5 text-neutral-400" />
                  </div>
                  <Input
                    id="token"
                    name="token"
                    type="text"
                    value={formData.token}
                    onChange={handleChange}
                    onPaste={handlePaste}
                    placeholder="Enter 6-digit token from email"
                    error={errors.token}
                    className={`pl-10 ${errors.token ? "border-error" : ""}`}
                    maxLength={6}
                  />
                </div>
                {errors.token && (
                  <p className="mt-1 text-sm text-error">{errors.token}</p>
                )}
                <div className="mt-1 flex items-center justify-between">
                  <p className="text-xs text-neutral-500">
                    Check your email for the reset token
                  </p>
                  <button
                    type="button"
                    onClick={handleResendToken}
                    disabled={resending || !formData.email}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium disabled:text-neutral-400 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <ArrowPathIcon className={`w-3 h-3 ${resending ? "animate-spin" : ""}`} />
                    {resending ? "Sending..." : "Resend Token"}
                  </button>
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                  New Password
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
                    onPaste={handlePaste}
                    placeholder="Enter your new password"
                    error={errors.password}
                    className={`pl-10 ${errors.password ? "border-error" : ""}`}
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-error">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                    <LockClosedIcon className="h-5 w-5 text-neutral-400" />
                  </div>
                  <PasswordInput
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onPaste={handlePaste}
                    placeholder="Confirm your new password"
                    error={errors.confirmPassword}
                    className={`pl-10 ${errors.confirmPassword ? "border-error" : ""}`}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-error">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                loading={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                Reset Password
              </Button>
            </form>
          )}

          {/* Back to Sign In Link */}
          {!success && (
            <div className="mt-6 text-center">
              <Link
                href="/signin"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Back to Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
