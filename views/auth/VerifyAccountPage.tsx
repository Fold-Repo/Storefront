"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input, Button } from "@/components/ui";
import { EnvelopeIcon, CheckCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { verifyAccount, resendOtp } from "@/services/auth";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

const WIZARD_STORAGE_KEY = "storefront_wizard_data";
const WIZARD_STEP_KEY = "storefront_wizard_step";

export const VerifyAccountPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showSuccess, showError } = useToast();
  const { setUser, setToken } = useAuth();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Get email from URL params or localStorage
    const emailParam = searchParams.get("email");
    const storedEmail = typeof window !== "undefined" ? localStorage.getItem("signup_email") : null;
    
    const userEmail = emailParam || storedEmail || "";
    setEmail(userEmail);

    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [searchParams]);

  const handleOtpChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only take last character
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split("");
      const newOtp = [...otp];
      digits.forEach((digit, index) => {
        if (index < 6) {
          newOtp[index] = digit;
        }
      });
      setOtp(newOtp);
      
      // Focus last input
      if (inputRefs.current[5]) {
        inputRefs.current[5].focus();
      }
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join("");
    
    if (otpString.length !== 6) {
      showError("Please enter the complete 6-digit code");
      return;
    }

    if (!email) {
      showError("Email address is required");
      return;
    }

    setLoading(true);
    try {
      const response = await verifyAccount({
        email,
        token: otpString,
      });

      // Update auth context with user data and token
      if (response?.data) {
        const { token, user } = response.data;
        if (token) {
          setToken(token);
        }
        if (user) {
          setUser(user);
        }
      }

      showSuccess("Account verified successfully!");
      
      // Clear signup email from localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("signup_email");
      }

      // Check if user has wizard progress
      const hasWizardProgress = typeof window !== "undefined" && 
        (localStorage.getItem(WIZARD_STORAGE_KEY) || localStorage.getItem(WIZARD_STEP_KEY));

      if (hasWizardProgress) {
        // Redirect to homepage where wizard can be continued
        router.push("/?continueWizard=true");
      } else {
        // Redirect to dashboard after verification
        router.push("/dashboard");
      }
    } catch (error: any) {
      console.error("Verification error:", error);
      showError(error.message || "Verification failed. Please check your code and try again.");
      
      // Clear OTP on error
      setOtp(["", "", "", "", "", ""]);
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      showError("Email address is required to resend code");
      return;
    }

    setResending(true);
    try {
      await resendOtp({
        email,
        type: "verify_account",
      });
      showSuccess("Verification code resent! Please check your email.");
    } catch (error: any) {
      showError(error.message || "Failed to resend code. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-neutral-200">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <EnvelopeIcon className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
              Verify Your Email
            </h1>
            <p className="text-neutral-600">
              We've sent a 6-digit verification code to
            </p>
            <p className="text-blue-600 font-semibold mt-1">{email || "your email"}</p>
          </div>

          {/* OTP Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-neutral-700 mb-3">
              Enter Verification Code
            </label>
            <div className="flex gap-3 justify-center" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  name={`otp-${index}`}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 text-center text-2xl font-bold border-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  aria-label={`Digit ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Verify Button */}
          <Button
            onPress={handleVerify}
            isLoading={loading}
            color="primary"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg mb-4 shadow-md hover:shadow-lg transition-all"
          >
            Verify Account
          </Button>

          {/* Resend Code */}
          <div className="text-center">
            <p className="text-sm text-neutral-600 mb-2">
              Didn't receive the code?
            </p>
            <button
              onClick={handleResendCode}
              disabled={resending}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm disabled:opacity-50"
            >
              {resending ? "Resending..." : "Resend Code"}
            </button>
          </div>

          {/* Back to Signup */}
          <div className="mt-6 pt-6 border-t border-neutral-200 text-center">
            <Link
              href="/signup"
              className="text-sm text-neutral-600 hover:text-blue-600"
            >
              ← Back to Sign Up
            </Link>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-neutral-500">
            Check your spam folder if you don't see the email
          </p>
        </div>
      </div>
    </div>
  );
};
