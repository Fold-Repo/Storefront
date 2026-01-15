"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input, TextArea, PhoneInput, Select } from "@/components/ui/form";
import { Button } from "@/components/ui";
import { 
  ArrowRightIcon, 
  ArrowLeftIcon, 
  CheckCircleIcon,
  XMarkIcon,
  EnvelopeIcon
} from "@heroicons/react/24/outline";
import { signup, SignupPayload, uploadFile, generateSecurePassword, googleSignup } from "@/services/auth";
import { searchAddressByPostcode, AddressSuggestion } from "@/services/address";
import { useToast } from "@/hooks/useToast";
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";
import Link from "next/link";
import Image from "next/image";
import { NAV_CONSTANT } from "@/constants";
import { useAuth } from "@/contexts/AuthContext";

const STEPS = [
  { id: 1, title: "Account Type", description: "Choose how you want to sign up" },
  { id: 2, title: "Personal Info", description: "Tell us about yourself" },
  { id: 3, title: "Business Info", description: "Business details" },
  { id: 4, title: "Products", description: "What you sell" },
  { id: 5, title: "Address", description: "Business location" },
  { id: 6, title: "Review", description: "Review and submit" },
];

const BUSINESS_TYPES = [
  "Retail",
  "Wholesale",
  "Manufacturing",
  "Service",
  "E-commerce",
  "Other",
];

const SIGNUP_STORAGE_KEY = "signup_form_data";

export const SignupPage = () => {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const { setUser, setToken } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [postcodeSearching, setPostcodeSearching] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [signupMethod, setSignupMethod] = useState<"email" | "google" | null>(null);
  const [hasIncompleteSignup, setHasIncompleteSignup] = useState(false);
  const [googleIdToken, setGoogleIdToken] = useState<string | null>(null); // Store Firebase ID token for Google signup

  // Load saved form data from localStorage
  const loadSavedData = (): Partial<SignupPayload> => {
    if (typeof window === "undefined") {
      return {
        businessname: "",
        businesstype: "",
        tin: "",
        website: "",
        business_registration_number: "",
        firstname: "",
        lastname: "",
        email: "",
        password: "",
        phone: "",
        altphone: "",
        product_service: "",
        product_description: "",
        product_brochure: null,
        terms_condition: "no",
        certify_correct_data: "no",
        role: "business",
        position: "",
        addressline1: "",
        addressline2: "",
        addressline3: null,
        city: "",
        postcode: "",
      };
    }
    
    try {
      const saved = localStorage.getItem(SIGNUP_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Note: File objects can't be serialized, so product_brochure will be null
        return {
          ...parsed,
          product_brochure: null,
        };
      }
    } catch (error) {
      console.error("Error loading saved signup data:", error);
    }
    
    return {
      businessname: "",
      businesstype: "",
      tin: "",
      website: "",
      business_registration_number: "",
      firstname: "",
      lastname: "",
      email: "",
      password: "",
      phone: "",
      altphone: "",
      product_service: "",
      product_description: "",
      product_brochure: null,
      terms_condition: "no",
      certify_correct_data: "no",
      role: "business",
      position: "",
      addressline1: "",
      addressline2: "",
      addressline3: null,
      city: "",
      postcode: "",
    };
  };

  // Initialize form data with saved data or defaults
  // Extend SignupPayload to allow File for product_brochure during form filling
  const [formData, setFormData] = useState<Partial<SignupPayload & { product_brochure: File | string | null }>>(() => {
    const saved = loadSavedData();
    return {
      businessname: "",
      businesstype: "",
      tin: "",
      website: "",
      business_registration_number: "",
      firstname: "",
      lastname: "",
      email: "",
      password: "",
      phone: "",
      altphone: "",
      product_service: "",
      product_description: "",
      product_brochure: null,
      terms_condition: "no",
      certify_correct_data: "no",
      role: "business",
      position: "",
      addressline1: "",
      addressline2: "",
      addressline3: null,
      city: "",
      postcode: "",
      ...saved, // Override with saved data if it exists
    };
  });

  useEffect(() => {
    // Check authentication state and populate form if user is authenticated
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is authenticated (likely from Google signup)
        const savedData = loadSavedData();
        const hasSavedData = savedData.email || savedData.firstname || savedData.businessname;
        
        setFormData((prev) => {
          const updated = {
            ...prev,
            email: user.email || prev.email || savedData.email || "",
            firstname: user.displayName?.split(" ")[0] || prev.firstname || savedData.firstname || "",
            lastname: user.displayName?.split(" ").slice(1).join(" ") || prev.lastname || savedData.lastname || "",
            // Merge with saved data if it exists
            ...(hasSavedData ? savedData : {}),
          };
          return updated;
        });
        
        setSignupMethod("google");
        
        // Check if there's incomplete signup data
        if (hasSavedData) {
          setHasIncompleteSignup(true);
          // Restore saved step
          const savedStep = localStorage.getItem(`${SIGNUP_STORAGE_KEY}_step`);
          if (savedStep) {
            const step = parseInt(savedStep, 10);
            if (step >= 1 && step <= STEPS.length) {
              setCurrentStep(step);
            }
          }
        } else {
          // User is authenticated but has no saved data - they might have just signed up with Google
          // Check if they have any form data filled (from Google)
          if (user.email || user.displayName) {
            // They're authenticated but haven't started the form yet
            setCurrentStep(2); // Skip account type selection
          }
        }
        
        // Check if user came from Google signup URL
        if (typeof window !== "undefined") {
          const urlParams = new URLSearchParams(window.location.search);
          const method = urlParams.get("method");
          if (method === "google") {
            if (!hasSavedData) {
              setCurrentStep(2);
            }
            // Clean up URL
            window.history.replaceState({}, "", "/signup");
          }
        }
      } else {
        // User is not authenticated, but check if there's saved data
        const savedData = loadSavedData();
        if (savedData.email || savedData.firstname) {
          setFormData(savedData);
          const savedStep = localStorage.getItem(`${SIGNUP_STORAGE_KEY}_step`);
          if (savedStep) {
            const step = parseInt(savedStep, 10);
            if (step >= 1 && step <= STEPS.length) {
              setCurrentStep(step);
            }
          }
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      const dataToSave = {
        ...formData,
        product_brochure: null, // Can't serialize File objects
      };
      localStorage.setItem(SIGNUP_STORAGE_KEY, JSON.stringify(dataToSave));
      localStorage.setItem(`${SIGNUP_STORAGE_KEY}_step`, currentStep.toString());
    }
  }, [formData, currentStep]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const newData = { ...formData, [name]: value };
    setFormData(newData);
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    // Save to localStorage
    if (typeof window !== "undefined") {
      const dataToSave = {
        ...newData,
        product_brochure: null,
      };
      localStorage.setItem(SIGNUP_STORAGE_KEY, JSON.stringify(dataToSave));
    }
  };

  const handlePhoneChange = (name: string) => (value: string) => {
    const newData = { ...formData, [name]: value };
    setFormData(newData);
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    // Save to localStorage
    if (typeof window !== "undefined") {
      const dataToSave = {
        ...newData,
        product_brochure: null,
      };
      localStorage.setItem(SIGNUP_STORAGE_KEY, JSON.stringify(dataToSave));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, product_brochure: file as any }));
    }
  };

  const handlePostcodeSearch = async (postcode: string) => {
    if (!postcode || postcode.length < 5) {
      setAddressSuggestions([]);
      return;
    }

    setPostcodeSearching(true);
    try {
      const result = await searchAddressByPostcode(postcode);
      setAddressSuggestions(result.addresses || []);
      setShowAddressDropdown(true);
    } catch (error: any) {
      showError(error.message || "Failed to search address");
      setAddressSuggestions([]);
    } finally {
      setPostcodeSearching(false);
    }
  };

  const handleSelectAddress = (address: AddressSuggestion) => {
    setFormData((prev) => ({
      ...prev,
      addressline1: address.line_1,
      addressline2: address.line_2 || "",
      addressline3: address.line_3 || null,
      city: address.town_or_city || address.locality || "",
      postcode: address.postcode,
    }));
    setShowAddressDropdown(false);
    setAddressSuggestions([]);
  };

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      // Get Firebase ID token for Google signup
      const idToken = await firebaseUser.getIdToken();

      // Store the ID token for later use in signup
      setGoogleIdToken(idToken);

      // Pre-fill form data with Google user info
      setFormData((prev) => ({
        ...prev,
        email: firebaseUser.email || "",
        firstname: firebaseUser.displayName?.split(" ")[0] || "",
        lastname: firebaseUser.displayName?.split(" ").slice(1).join(" ") || "",
      }));

      setSignupMethod("google");
      setCurrentStep(2);
      showSuccess("Google authentication successful");
    } catch (error: any) {
      showError(error.message || "Google signup failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        // No validation needed for account type selection
        break;
      case 2:
        if (!formData.firstname) newErrors.firstname = "First name is required";
        if (!formData.lastname) newErrors.lastname = "Last name is required";
        if (!formData.email) {
          newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = "Email is invalid";
        }
        if (signupMethod === "email" && !formData.password) {
          newErrors.password = "Password is required";
        } else if (signupMethod === "email" && formData.password && formData.password.length < 8) {
          newErrors.password = "Password must be at least 8 characters";
        }
        if (!formData.phone) newErrors.phone = "Phone is required";
        if (!formData.position) newErrors.position = "Position is required";
        break;
      case 3:
        if (!formData.businessname) newErrors.businessname = "Business name is required";
        if (!formData.businesstype) newErrors.businesstype = "Business type is required";
        if (!formData.tin) newErrors.tin = "TIN is required";
        if (!formData.website) {
          newErrors.website = "Website is required";
        } else if (!/^https?:\/\/.+/.test(formData.website)) {
          newErrors.website = "Website must start with http:// or https://";
        }
        if (!formData.business_registration_number) {
          newErrors.business_registration_number = "Business registration number is required";
        }
        break;
      case 4:
        if (!formData.product_service) newErrors.product_service = "Product/service is required";
        if (!formData.product_description) {
          newErrors.product_description = "Product description is required";
        } else if (formData.product_description.length < 50) {
          newErrors.product_description = "Description must be at least 50 characters";
        }
        break;
      case 5:
        if (!formData.addressline1) newErrors.addressline1 = "Address line 1 is required";
        if (!formData.city) newErrors.city = "City is required";
        if (!formData.postcode) {
          newErrors.postcode = "Postcode is required";
        } else if (!/^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i.test(formData.postcode)) {
          newErrors.postcode = "Invalid UK postcode format";
        }
        break;
      case 6:
        if (formData.terms_condition !== "yes") {
          newErrors.terms_condition = "You must accept the terms and conditions";
        }
        if (formData.certify_correct_data !== "yes") {
          newErrors.certify_correct_data = "You must certify the data is correct";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < STEPS.length) {
        const nextStep = currentStep + 1;
        setCurrentStep(nextStep);
        // Save current step
        if (typeof window !== "undefined") {
          localStorage.setItem(`${SIGNUP_STORAGE_KEY}_step`, nextStep.toString());
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const validateAllFields = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate all required fields from all steps
    if (!formData.firstname) newErrors.firstname = "First name is required";
    if (!formData.lastname) newErrors.lastname = "Last name is required";
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    // Password validation - required for email signups, auto-generated for Google
    if (signupMethod === "email") {
      if (!formData.password) {
        newErrors.password = "Password is required";
      } else if (formData.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters";
      }
    }
    // For Google signups, password will be auto-generated in handleSubmit
    if (!formData.phone) newErrors.phone = "Phone is required";
    if (!formData.position) newErrors.position = "Position is required";
    
    if (!formData.businessname) newErrors.businessname = "Business name is required";
    if (!formData.businesstype) newErrors.businesstype = "Business type is required";
    if (!formData.tin) newErrors.tin = "TIN is required";
    if (!formData.website) {
      newErrors.website = "Website is required";
    } else if (!/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = "Website must start with http:// or https://";
    }
    if (!formData.business_registration_number) {
      newErrors.business_registration_number = "Business registration number is required";
    }
    
    if (!formData.product_service) newErrors.product_service = "Product/service is required";
    if (!formData.product_description) {
      newErrors.product_description = "Product description is required";
    } else if (formData.product_description.length < 50) {
      newErrors.product_description = "Description must be at least 50 characters";
    }
    
    if (!formData.addressline1) newErrors.addressline1 = "Address line 1 is required";
    if (!formData.city) newErrors.city = "City is required";
    if (!formData.postcode) {
      newErrors.postcode = "Postcode is required";
    } else if (!/^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i.test(formData.postcode)) {
      newErrors.postcode = "Invalid UK postcode format";
    }
    
    if (formData.terms_condition !== "yes") {
      newErrors.terms_condition = "You must accept the terms and conditions";
    }
    if (formData.certify_correct_data !== "yes") {
      newErrors.certify_correct_data = "You must certify the data is correct";
    }

    setErrors(newErrors);
    
    // If there are errors, scroll to the first error field
    if (Object.keys(newErrors).length > 0) {
      const firstErrorField = Object.keys(newErrors)[0];
      const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      // Navigate to the step that contains the first error
      if (firstErrorField === "firstname" || firstErrorField === "lastname" || firstErrorField === "email" || firstErrorField === "phone" || firstErrorField === "position" || firstErrorField === "password") {
        setCurrentStep(2);
      } else if (firstErrorField === "businessname" || firstErrorField === "businesstype" || firstErrorField === "tin" || firstErrorField === "website" || firstErrorField === "business_registration_number") {
        setCurrentStep(3);
      } else if (firstErrorField === "product_service" || firstErrorField === "product_description") {
        setCurrentStep(4);
      } else if (firstErrorField === "addressline1" || firstErrorField === "city" || firstErrorField === "postcode") {
        setCurrentStep(5);
      } else {
        setCurrentStep(6);
      }
    }
    
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    // Validate all fields, not just current step
    if (!validateAllFields()) {
      showError("Please complete all required fields before submitting.");
      return;
    }

    setLoading(true);
    try {
      // Handle Google signup differently
      if (signupMethod === "google") {
        // Check if we have the Firebase ID token
        if (!googleIdToken) {
          showError("Google authentication token is missing. Please sign in with Google again.");
          setLoading(false);
          return;
        }

        // Get fresh token if available (tokens expire after 1 hour)
        let idToken = googleIdToken;
        try {
          const currentUser = auth.currentUser;
          if (currentUser) {
            idToken = await currentUser.getIdToken(true); // Force refresh
          }
        } catch (error) {
          console.warn("Could not refresh token, using stored token");
        }

        // Call Google signup endpoint with collected data
        const googleSignupPayload = {
          idToken: idToken,
          role: formData.role || "business",
          phone: formData.phone || undefined,
          altphone: formData.altphone || undefined,
          position: formData.position || undefined,
        };

        const signupResponse = await googleSignup(googleSignupPayload);
        
        showSuccess("Account created successfully! Redirecting to dashboard...");
        
        // Store auth token and user data
        if (typeof window !== "undefined") {
          // Store auth token if provided
          if (signupResponse?.token || signupResponse?.data?.token) {
            const token = signupResponse?.token || signupResponse?.data?.token;
            // Update AuthContext
            setToken(token);
            localStorage.setItem("auth_token", token);
            // Also set as cookie for axios interceptor
            const { setCookie } = await import("@/utils/cookies");
            const { AUTH_TOKEN_KEY } = await import("@/types");
            setCookie(AUTH_TOKEN_KEY, token, 7);
          }
          
          // Store user data if provided
          if (signupResponse?.user || signupResponse?.data?.user) {
            const userData = signupResponse?.user || signupResponse?.data?.user;
            // Update AuthContext
            setUser(userData);
            localStorage.setItem("user_data", JSON.stringify(userData));
          }
        }
        
        // Clear saved signup data after successful submission
        if (typeof window !== "undefined") {
          localStorage.removeItem(SIGNUP_STORAGE_KEY);
          localStorage.removeItem(`${SIGNUP_STORAGE_KEY}_step`);
          setGoogleIdToken(null); // Clear stored token
        }
        
        // Google signup redirects directly to dashboard (no email verification needed)
        router.push("/dashboard");
        return;
      }

      // Regular email/password signup flow
      // Upload file first if it exists
      let brochureUrl: string | null = null;
      if (formData.product_brochure && formData.product_brochure instanceof File) {
        try {
          brochureUrl = await uploadFile(formData.product_brochure);
          showSuccess("File uploaded successfully");
        } catch (error: any) {
          showError(error.message || "Failed to upload file");
          setLoading(false);
          return;
        }
      }

      // Generate password for email signups
      const password = formData.password || "";

      const payload: SignupPayload = {
        businessname: formData.businessname!,
        businesstype: formData.businesstype!,
        tin: formData.tin!,
        website: formData.website!,
        business_registration_number: formData.business_registration_number!,
        firstname: formData.firstname!,
        lastname: formData.lastname!,
        email: formData.email!,
        password: password,
        phone: formData.phone!,
        altphone: formData.altphone || undefined,
        product_service: formData.product_service!,
        product_description: formData.product_description!,
        product_brochure: brochureUrl,
        terms_condition: formData.terms_condition as "yes" | "no",
        certify_correct_data: formData.certify_correct_data as "yes" | "no",
        role: "business",
        position: formData.position!,
        addressline1: formData.addressline1!,
        addressline2: formData.addressline2,
        addressline3: formData.addressline3,
        city: formData.city!,
        postcode: formData.postcode!,
      };

      const signupResponse = await signup(payload);
      showSuccess("Account created successfully! Please verify your email.");
      
      // Store email for verification page
      if (typeof window !== "undefined") {
        localStorage.setItem("signup_email", formData.email!);
        
        // Store auth token if provided
        if (signupResponse?.token || signupResponse?.data?.token) {
          const token = signupResponse?.token || signupResponse?.data?.token;
          localStorage.setItem("auth_token", token);
          // Also set as cookie for axios interceptor
          const { setCookie } = await import("@/utils/cookies");
          const { AUTH_TOKEN_KEY } = await import("@/types");
          setCookie(AUTH_TOKEN_KEY, token, 7);
        }
        
        // Don't clear signup data yet - keep it until verification is complete
        // This allows user to continue wizard after verification
      }
      
      // Clear saved signup data after successful submission
      if (typeof window !== "undefined") {
        localStorage.removeItem(SIGNUP_STORAGE_KEY);
        localStorage.removeItem(`${SIGNUP_STORAGE_KEY}_step`);
      }
      
      // Redirect to verification page
      router.push(`/verify?email=${encodeURIComponent(formData.email!)}`);
    } catch (error: any) {
      console.error("Signup error:", error);
      
      // If error contains field-specific errors, show them
      if (error.message) {
        try {
          const errorData = JSON.parse(error.message);
          if (errorData.fields) {
            // Convert API field names to form field names (camelCase)
            const fieldMapping: Record<string, string> = {
              businessname: "businessname",
              businesstype: "businesstype",
              tin: "tin",
              business_registration_number: "business_registration_number",
              firstname: "firstname",
              lastname: "lastname",
              email: "email",
              password: "password",
              phone: "phone",
              product_service: "product_service",
              product_description: "product_description",
              terms_condition: "terms_condition",
              certify_correct_data: "certify_correct_data",
              role: "role",
              addressline1: "addressline1",
              city: "city",
              postcode: "postcode",
            };
            
            const mappedErrors: Record<string, string> = {};
            Object.keys(errorData.fields).forEach((key) => {
              const formField = fieldMapping[key] || key;
              mappedErrors[formField] = errorData.fields[key];
            });
            
            setErrors(mappedErrors);
            showError("Please fix the validation errors below.");
            
            // Navigate to the step with the first error
            const firstErrorField = Object.keys(mappedErrors)[0];
            if (firstErrorField === "firstname" || firstErrorField === "lastname" || firstErrorField === "email" || firstErrorField === "phone" || firstErrorField === "position" || firstErrorField === "password") {
              setCurrentStep(2);
            } else if (firstErrorField === "businessname" || firstErrorField === "businesstype" || firstErrorField === "tin" || firstErrorField === "website" || firstErrorField === "business_registration_number") {
              setCurrentStep(3);
            } else if (firstErrorField === "product_service" || firstErrorField === "product_description") {
              setCurrentStep(4);
            } else if (firstErrorField === "addressline1" || firstErrorField === "city" || firstErrorField === "postcode") {
              setCurrentStep(5);
            } else {
              setCurrentStep(6);
            }
            return;
          }
        } catch (e) {
          // If parsing fails, show generic error
        }
      }
      showError(error.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-semibold text-neutral-800 mb-2">
                Choose Your Sign Up Method
              </h3>
              <p className="text-sm text-neutral-600">
                Select how you want to create your account
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <button
                type="button"
                onClick={() => {
                  setSignupMethod("email");
                  setCurrentStep(2);
                }}
                className="p-6 rounded-lg border-2 border-neutral-200 bg-white hover:border-blue-600 hover:shadow-lg transition-all text-left group cursor-pointer"
              >
                <div className="w-12 h-12 mb-3 flex items-center justify-center">
                  <EnvelopeIcon className="w-8 h-8 text-neutral-600 group-hover:text-primary-600 transition-colors" />
                </div>
                <h4 className="font-semibold text-neutral-800 mb-1">Email Sign Up</h4>
                <p className="text-sm text-neutral-600">
                  Create account with email and password
                </p>
              </button>
              <button
                type="button"
                onClick={handleGoogleSignup}
                disabled={googleLoading}
                className="p-6 rounded-lg border-2 border-neutral-200 bg-white hover:border-blue-600 hover:shadow-lg transition-all text-left disabled:opacity-50 group cursor-pointer"
              >
                <div className="w-12 h-12 mb-3 flex items-center justify-center">
                  {googleLoading ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                  ) : (
                    <svg className="w-8 h-8" viewBox="0 0 24 24">
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
                  )}
                </div>
                <h4 className="font-semibold text-neutral-800 mb-1">Google Sign Up</h4>
                <p className="text-sm text-neutral-600">
                  Quick sign up with your Google account
                </p>
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4 max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-semibold text-neutral-800 mb-2">
                Personal Information
              </h3>
              <p className="text-sm text-neutral-600">
                Tell us about yourself
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="First Name"
                name="firstname"
                type="text"
                value={formData.firstname}
                onChange={handleChange}
                error={errors.firstname}
                placeholder="Enter your first name"
                className="w-full"
              />
              <Input
                label="Last Name"
                name="lastname"
                type="text"
                value={formData.lastname}
                onChange={handleChange}
                error={errors.lastname}
                placeholder="Enter your last name"
                className="w-full"
              />
            </div>
            <Input
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="Enter your email"
              className="w-full"
              disabled={signupMethod === "google"}
            />
            <Input
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              placeholder={signupMethod === "google" ? "Password will be auto-generated" : "Create a password (min 8 characters)"}
              className="w-full"
              disabled={signupMethod === "google"}
            />
            {signupMethod === "google" && (
              <p className="text-xs text-neutral-500 -mt-2">
                A secure password will be automatically generated for your account
              </p>
            )}
            <PhoneInput
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handlePhoneChange("phone")}
              error={errors.phone}
              placeholder="Enter your phone number"
              country="GB"
            />
            <PhoneInput
              label="Alternate Phone (Optional)"
              name="altphone"
              value={formData.altphone}
              onChange={handlePhoneChange("altphone")}
              error={errors.altphone}
              placeholder="Enter alternate phone number"
              country="GB"
            />
            <Input
              label="Position"
              name="position"
              type="text"
              value={formData.position}
              onChange={handleChange}
              error={errors.position}
              placeholder="e.g., Owner, Manager, Director"
              className="w-full"
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-4 max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-semibold text-neutral-800 mb-2">
                Business Information
              </h3>
              <p className="text-sm text-neutral-600">
                Details about your business
              </p>
            </div>
            <Input
              label="Business Name"
              name="businessname"
              type="text"
              value={formData.businessname}
              onChange={handleChange}
              error={errors.businessname}
              placeholder="Enter your business name"
              className="w-full"
            />
            <Select
              label="Business Type"
              name="businesstype"
              value={formData.businesstype}
              onChange={handleChange}
              error={errors.businesstype}
              className="w-full"
            >
              <option value="">Select business type</option>
              {BUSINESS_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
            <Input
              label="TIN (Tax Identification Number)"
              name="tin"
              type="text"
              value={formData.tin}
              onChange={handleChange}
              error={errors.tin}
              placeholder="Enter TIN"
              className="w-full"
            />
            <Input
              label="Website"
              name="website"
              type="url"
              value={formData.website}
              onChange={handleChange}
              error={errors.website}
              placeholder="https://yourwebsite.com"
              className="w-full"
            />
            <Input
              label="Business Registration Number"
              name="business_registration_number"
              type="text"
              value={formData.business_registration_number}
              onChange={handleChange}
              error={errors.business_registration_number}
              placeholder="Enter business registration number"
              className="w-full"
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-4 max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-semibold text-neutral-800 mb-2">
                Products & Services
              </h3>
              <p className="text-sm text-neutral-600">
                Tell us what you sell or offer
              </p>
            </div>
            <Input
              label="Product/Service"
              name="product_service"
              type="text"
              value={formData.product_service}
              onChange={handleChange}
              error={errors.product_service}
              placeholder="e.g., African Food Retail, Electronics, Clothing"
              className="w-full"
            />
            <TextArea
              label="Product Description"
              name="product_description"
              value={formData.product_description}
              onChange={handleChange}
              error={errors.product_description}
              placeholder="Describe your products or services in detail (minimum 50 characters)..."
              className="w-full min-h-[150px]"
            />
            <p className="text-xs text-neutral-500">
              {formData.product_description?.length || 0} / 50 characters minimum
            </p>
            <div>
              <label className="block mb-1 text-sm text-neutral-400">
                Product Brochure (Optional)
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="form-control"
              />
              {formData.product_brochure && formData.product_brochure instanceof File && (
                <p className="text-sm text-neutral-600 mt-2">
                  Selected: {formData.product_brochure.name}
                </p>
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4 max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-semibold text-neutral-800 mb-2">
                Business Address
              </h3>
              <p className="text-sm text-neutral-600">
                Enter your business location (UK addresses only)
              </p>
            </div>
            <div className="relative">
              <Input
                label="Postcode"
                name="postcode"
                type="text"
                value={formData.postcode}
                onChange={(e) => {
                  handleChange(e);
                  if (e.target.value.length >= 5) {
                    handlePostcodeSearch(e.target.value);
                  }
                }}
                error={errors.postcode}
                placeholder="Enter UK postcode"
                className="w-full"
              />
              {postcodeSearching && (
                <p className="text-sm text-neutral-500 mt-1">Searching addresses...</p>
              )}
              {showAddressDropdown && addressSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {addressSuggestions.map((address, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSelectAddress(address)}
                      className="w-full text-left px-4 py-2 hover:bg-neutral-50 border-b border-neutral-100 last:border-b-0"
                    >
                      <p className="text-sm font-medium text-neutral-800">
                        {address.formatted_address.join(", ")}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Input
              label="Address Line 1"
              name="addressline1"
              type="text"
              value={formData.addressline1}
              onChange={handleChange}
              error={errors.addressline1}
              placeholder="Street address"
              className="w-full"
            />
            <Input
              label="Address Line 2 (Optional)"
              name="addressline2"
              type="text"
              value={formData.addressline2}
              onChange={handleChange}
              error={errors.addressline2}
              placeholder="Apartment, suite, etc."
              className="w-full"
            />
            <Input
              label="Address Line 3 (Optional)"
              name="addressline3"
              type="text"
              value={formData.addressline3 || ""}
              onChange={handleChange}
              error={errors.addressline3}
              placeholder="Additional address info"
              className="w-full"
            />
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="City"
                name="city"
                type="text"
                value={formData.city}
                onChange={handleChange}
                error={errors.city}
                placeholder="City"
                className="w-full"
              />
              <Input
                label="Postcode"
                name="postcode"
                type="text"
                value={formData.postcode}
                onChange={handleChange}
                error={errors.postcode}
                placeholder="Postcode"
                className="w-full"
                disabled
              />
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4 max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-semibold text-neutral-800 mb-2">
                Review & Confirm
              </h3>
              <p className="text-sm text-neutral-600">
                Please review your information and confirm
              </p>
            </div>
            <div className="bg-neutral-50 rounded-lg p-6 space-y-4">
              <div>
                <h4 className="font-semibold text-neutral-800 mb-2">Personal Information</h4>
                <p className="text-sm text-neutral-600">
                  {formData.firstname} {formData.lastname}
                </p>
                <p className="text-sm text-neutral-600">{formData.email}</p>
                <p className="text-sm text-neutral-600">{formData.phone}</p>
                <p className="text-sm text-neutral-600">Position: {formData.position}</p>
              </div>
              <div>
                <h4 className="font-semibold text-neutral-800 mb-2">Business Information</h4>
                <p className="text-sm text-neutral-600">{formData.businessname}</p>
                <p className="text-sm text-neutral-600">Type: {formData.businesstype}</p>
                <p className="text-sm text-neutral-600">TIN: {formData.tin}</p>
                <p className="text-sm text-neutral-600">Website: {formData.website}</p>
              </div>
              <div>
                <h4 className="font-semibold text-neutral-800 mb-2">Address</h4>
                <p className="text-sm text-neutral-600">{formData.addressline1}</p>
                {formData.addressline2 && (
                  <p className="text-sm text-neutral-600">{formData.addressline2}</p>
                )}
                <p className="text-sm text-neutral-600">
                  {formData.city}, {formData.postcode}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={formData.terms_condition === "yes"}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      terms_condition: e.target.checked ? "yes" : "no",
                    }))
                  }
                  className="mt-1 mr-3 w-4 h-4 text-primary-500 rounded border-neutral-300 focus:ring-primary-500"
                />
                <span className="text-sm text-neutral-600">
                  I agree to the{" "}
                  <a href="#" className="text-primary-600 hover:text-primary-700">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-primary-600 hover:text-primary-700">
                    Privacy Policy
                  </a>
                </span>
              </label>
              {errors.terms_condition && (
                <p className="text-sm text-error">{errors.terms_condition}</p>
              )}
              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={formData.certify_correct_data === "yes"}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      certify_correct_data: e.target.checked ? "yes" : "no",
                    }))
                  }
                  className="mt-1 mr-3 w-4 h-4 text-primary-500 rounded border-neutral-300 focus:ring-primary-500"
                />
                <span className="text-sm text-neutral-600">
                  I certify that all the information provided is correct
                </span>
              </label>
              {errors.certify_correct_data && (
                <p className="text-sm text-error">{errors.certify_correct_data}</p>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="container mx-auto px-4 py-4">
          <Link href="/">
            <Image
              src={NAV_CONSTANT.LOGOS.dark}
              className="w-24"
              width={119}
              height={52}
              alt="Logo"
            />
          </Link>
        </div>
      </header>

      {/* Incomplete Signup Notification */}
      {hasIncompleteSignup && (
        <div className="bg-primary-50 border-b border-primary-200">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between max-w-4xl mx-auto">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                  <CheckCircleIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-primary-900">
                    Welcome back! We saved your progress.
                  </p>
                  <p className="text-xs text-primary-700 mt-0.5">
                    Continue where you left off to complete your signup.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setHasIncompleteSignup(false)}
                className="text-primary-600 hover:text-primary-700"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8 max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                      currentStep > step.id
                        ? "bg-primary-500 border-primary-500 text-white"
                        : currentStep === step.id
                        ? "border-primary-500 bg-white text-primary-500"
                        : "border-neutral-300 bg-white text-neutral-400"
                    }`}
                  >
                    {currentStep > step.id ? (
                      <CheckCircleIcon className="w-6 h-6" />
                    ) : (
                      <span className="text-sm font-semibold">{step.id}</span>
                    )}
                  </div>
                  <p
                    className={`text-xs mt-2 text-center max-w-[80px] ${
                      currentStep >= step.id
                        ? "text-neutral-800 font-medium"
                        : "text-neutral-400"
                    }`}
                  >
                    {step.title}
                  </p>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-2 transition-colors ${
                      currentStep > step.id ? "bg-primary-500" : "bg-neutral-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-neutral-200 p-8 mb-8">
          <div className="min-h-[400px]">{renderStepContent()}</div>
        </div>

        {/* Navigation */}
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button
            type="button"
            variant="light"
            onClick={handlePrevious}
            isDisabled={currentStep === 1}
            startContent={<ArrowLeftIcon className="w-4 h-4" />}
            className="disabled:opacity-50"
          >
            Previous
          </Button>
          <div className="flex gap-2">
            {currentStep < STEPS.length ? (
              <Button
                type="button"
                onClick={handleNext}
                color="primary"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md hover:shadow-lg transition-all"
                endContent={<ArrowRightIcon className="w-4 h-4" />}
              >
                Next
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                loading={loading}
                color="primary"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md hover:shadow-lg transition-all"
                endContent={<CheckCircleIcon className="w-4 h-4" />}
              >
                Create Account
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
