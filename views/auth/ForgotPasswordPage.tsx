"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button, Input, PasswordInput } from "@/components/ui";
import { EnvelopeIcon, KeyIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { forgotPassword, resetPassword } from "@/services/auth";
import { useToast } from "@/hooks/useToast";
import { NAV_CONSTANT } from "@/constants";

export const ForgotPasswordPage = () => {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "email") {
      setEmail(value);
      if (errors.email) {
        setErrors((prev) => ({ ...prev, email: "" }));
      }
    } else if (name === "token") {
      setToken(value);
      if (errors.token) {
        setErrors((prev) => ({ ...prev, token: "" }));
      }
    } else if (name === "password") {
      setPassword(value);
      if (errors.password) {
        setErrors((prev) => ({ ...prev, password: "" }));
      }
    } else if (name === "confirmPassword") {
      setConfirmPassword(value);
      if (errors.confirmPassword) {
        setErrors((prev) => ({ ...prev, confirmPassword: "" }));
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    // Allow paste on all fields
    e.stopPropagation();
  };

  const validateResetForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!token.trim()) {
      newErrors.token = "Token is required";
    } else if (token.length !== 6) {
      newErrors.token = "Token must be 6 digits";
    }
    
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateResetForm()) {
      return;
    }

    setLoading(true);
    try {
      await resetPassword({
        email: email,
        password: password,
        token: token,
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

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
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
      await forgotPassword({ email });
      showSuccess("Password reset email sent! Please check your inbox.");
      setEmailSent(true);
    } catch (error: any) {
      console.error("Forgot password error:", error);
      showError(error.message || "Failed to send password reset email. Please try again.");
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
            Forgot Password?
          </h1>
          <p className="text-neutral-600">
            {emailSent 
              ? "We've sent you a password reset token. Please check your email."
              : "Enter your email address and we'll send you a token to reset your password."
            }
          </p>
        </div>

        {/* Forgot Password Card */}
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
          ) : emailSent ? (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <EnvelopeIcon className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-neutral-900 mb-2">
                  Reset Your Password
                </h2>
                <p className="text-sm text-neutral-600">
                  We've sent a password reset token to <strong>{email}</strong>. 
                  Enter the token and your new password below.
                </p>
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
                    value={token}
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
                    onClick={async () => {
                      setResending(true);
                      try {
                        await forgotPassword({ email });
                        showSuccess("Reset token sent again! Please check your email.");
                        setToken(""); // Clear token field
                      } catch (error: any) {
                        showError(error.message || "Failed to resend token. Please try again.");
                      } finally {
                        setResending(false);
                      }
                    }}
                    disabled={resending}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium disabled:text-neutral-400 disabled:cursor-not-allowed"
                  >
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
                    value={password}
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
                    value={confirmPassword}
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

              {/* Back to Sign In Link */}
              <div className="text-center">
                <Link
                  href="/signin"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  ← Back to Sign In
                </Link>
              </div>
            </form>
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
                    value={email}
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

              {/* Submit Button */}
              <Button
                type="submit"
                loading={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                Send Reset Token
              </Button>
            </form>
          )}

          {/* Back to Sign In Link */}
          {!emailSent && (
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
