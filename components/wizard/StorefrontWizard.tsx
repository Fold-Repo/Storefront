"use client";

import React, { useState, useEffect } from "react";
import { PopupModal } from "@/components/ui";
import { Input, TextArea, Select } from "@/components/ui/form";
import { Button, ColorPicker } from "@/components/ui";
import { XMarkIcon, SparklesIcon, ArrowRightIcon, ArrowLeftIcon, CheckCircleIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";
import { useRouter } from "next/navigation";
import {
  saveWizardToFirebase,
  loadWizardFromFirebase,
  saveWizardLocally,
  loadWizardLocally,
  clearWizardLocally,
  hasLocalWizardData,
  WizardData
} from "@/services/firebase";
import { useToast } from "@/hooks/useToast";

interface StorefrontWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (data: StorefrontData) => void;
}

export interface ThemeSettings {
  primaryColor: string;
  fontFamily: string;
  designFeel: string;
  aiDescription?: string;
}

export interface StorefrontData {
  ideaScope: string;
  companyName: string;
  description: string;
  subdomain: string;
  logo: File | null;
  logoPreview: string | null;
  theme?: ThemeSettings;
}

const STEPS = [
  { id: 1, title: "Idea Scope", description: "What type of storefront do you want to create?" },
  { id: 2, title: "Company Details", description: "Tell us about your company" },
  { id: 3, title: "Description", description: "Describe your business" },
  { id: 4, title: "Subdomain", description: "Choose your storefront URL" },
  { id: 5, title: "Logo", description: "Upload your company logo" },
  { id: 6, title: "Theming", description: "Customize your storefront appearance" },
  { id: 7, title: "AI Design", description: "Generate design recommendations" },
];

const IDEA_SCOPES = [
  { value: "fashion", label: "Fashion & Apparel" },
  { value: "electronics", label: "Electronics" },
  { value: "food", label: "Food & Beverages" },
  { value: "home", label: "Home & Living" },
  { value: "beauty", label: "Beauty & Cosmetics" },
  { value: "sports", label: "Sports & Outdoors" },
  { value: "books", label: "Books & Media" },
  { value: "toys", label: "Toys & Games" },
  { value: "other", label: "Other" },
];

const STORAGE_KEY = "storefront_wizard_data";

const StorefrontWizard: React.FC<StorefrontWizardProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  const { showSuccess, showError } = useToast();
  const [aiGenerating, setAiGenerating] = useState(false);
  const [showLocalDataPrompt, setShowLocalDataPrompt] = useState(false);

  // Interactive AI Description Generator State
  const [showAIDescriptionModal, setShowAIDescriptionModal] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [currentAnswer, setCurrentAnswer] = useState<string>("");
  const [questionAnswers, setQuestionAnswers] = useState<Record<string, string>>({});
  const [questionNumber, setQuestionNumber] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [generatingQuestion, setGeneratingQuestion] = useState(false);
  const [generatingDescription, setGeneratingDescription] = useState(false);
  const [inputType, setInputType] = useState<"text" | "textarea">("text");
  const [hint, setHint] = useState<string>("");

  // Load saved form data from localStorage or Firebase
  const loadSavedData = async (): Promise<StorefrontData> => {
    if (typeof window === "undefined") {
      return getDefaultData();
    }

    // First check if user is authenticated and load from Firebase
    if (user) {
      try {
        const firebaseData = await loadWizardFromFirebase(user);
        if (firebaseData) {
          return {
            ideaScope: firebaseData.ideaScope || "",
            companyName: firebaseData.companyName || "",
            description: firebaseData.description || "",
            subdomain: firebaseData.subdomain || "",
            logo: null,
            logoPreview: firebaseData.logoPreview || null,
            theme: firebaseData.theme || getDefaultTheme(),
          };
        }
      } catch (error) {
        console.error("Error loading from Firebase:", error);
      }
    }

    // Check for local data
    if (hasLocalWizardData()) {
      const localData = loadWizardLocally();
      if (localData) {
        // Show prompt to user
        setShowLocalDataPrompt(true);
        return {
          ideaScope: localData.ideaScope || "",
          companyName: localData.companyName || "",
          description: localData.description || "",
          subdomain: localData.subdomain || "",
          logo: null,
          logoPreview: localData.logoPreview || null,
          theme: localData.theme || getDefaultTheme(),
        };
      }
    }

    // Try localStorage as fallback
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          logo: null,
          logoPreview: parsed.logoPreview || null,
          theme: parsed.theme || getDefaultTheme(),
        };
      }
    } catch (error) {
      console.error("Error loading saved form data:", error);
    }

    return getDefaultData();
  };

  const getDefaultData = (): StorefrontData => ({
    ideaScope: "",
    companyName: "",
    description: "",
    subdomain: "",
    logo: null,
    logoPreview: null,
    theme: getDefaultTheme(),
  });

  const getDefaultTheme = (): ThemeSettings => ({
    primaryColor: "#3B82F6",
    fontFamily: "Inter",
    designFeel: "modern",
  });

  const [formData, setFormData] = useState<StorefrontData>(getDefaultData());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Load data on mount and when user changes
  useEffect(() => {
    const loadData = async () => {
      if (isOpen && !dataLoaded) {
        const data = await loadSavedData();
        setFormData(data);
        setDataLoaded(true);
      }
    };
    loadData();
  }, [isOpen, user, dataLoaded]);

  // Check authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setAuthChecked(true);
      // If user just logged in, try to load their data
      if (user && isOpen) {
        try {
          const firebaseData = await loadWizardFromFirebase(user);
          if (firebaseData) {
            setFormData({
              ideaScope: firebaseData.ideaScope || "",
              companyName: firebaseData.companyName || "",
              description: firebaseData.description || "",
              subdomain: firebaseData.subdomain || "",
              logo: null,
              logoPreview: firebaseData.logoPreview || null,
              theme: firebaseData.theme || getDefaultTheme(),
            });
            showSuccess("Your saved progress has been loaded!");
          }
        } catch (error) {
          console.error("Error loading Firebase data:", error);
        }
      }
      // If user just logged in and we're on the last step, they can proceed
      // (No modal to close anymore)
    });

    return () => unsubscribe();
  }, [currentStep, isOpen]);

  // Save form data to Firebase or localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined" && isOpen && dataLoaded) {
      const saveData = async () => {
        const dataToSave: WizardData = {
          ideaScope: formData.ideaScope,
          companyName: formData.companyName,
          description: formData.description,
          subdomain: formData.subdomain,
          logo: null, // Can't serialize File objects
          logoPreview: formData.logoPreview,
          theme: formData.theme || getDefaultTheme(),
        };

        try {
          if (user) {
            // Save to Firebase
            await saveWizardToFirebase(dataToSave, user);
          } else {
            // Save locally
            saveWizardLocally(dataToSave);
          }
          // Also save to localStorage as backup
          localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
        } catch (error) {
          console.error("Error saving data:", error);
          // Fallback to localStorage
          localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
        }
      };
      saveData();
    }
  }, [formData, isOpen, user, dataLoaded]);

  // Load saved step from localStorage
  useEffect(() => {
    if (isOpen && typeof window !== "undefined") {
      const savedStep = localStorage.getItem(`${STORAGE_KEY}_step`);
      if (savedStep) {
        const step = parseInt(savedStep, 10);
        if (step >= 1 && step <= STEPS.length) {
          setCurrentStep(step);
        }
      }
    }
  }, [isOpen]);

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
        logo: null,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, logo: "File size must be less than 5MB" }));
        return;
      }
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({ ...prev, logo: "File must be an image" }));
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const newData = {
          ...formData,
          logo: file,
          logoPreview: reader.result as string,
        };
        setFormData(newData);
        // Save to localStorage (logo file can't be saved, but preview can)
        if (typeof window !== "undefined") {
          const dataToSave = {
            ...newData,
            logo: null,
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
        }
      };
      reader.readAsDataURL(file);
      if (errors.logo) {
        setErrors((prev) => ({ ...prev, logo: "" }));
      }
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.ideaScope) {
          newErrors.ideaScope = "Please select an idea scope";
        }
        break;
      case 2:
        if (!formData.companyName) {
          newErrors.companyName = "Company name is required";
        }
        break;
      case 3:
        if (!formData.description) {
          newErrors.description = "Description is required";
        } else if (formData.description.length < 50) {
          newErrors.description = "Description must be at least 50 characters";
        }
        break;
      case 4:
        if (!formData.subdomain) {
          newErrors.subdomain = "Subdomain is required";
        } else if (!/^[a-z0-9-]+$/.test(formData.subdomain)) {
          newErrors.subdomain = "Subdomain can only contain lowercase letters, numbers, and hyphens";
        } else if (formData.subdomain.length < 3) {
          newErrors.subdomain = "Subdomain must be at least 3 characters";
        }
        break;
      case 5:
        // Logo is optional, no validation needed
        break;
      case 6:
        if (!formData.theme?.primaryColor) {
          newErrors.primaryColor = "Primary color is required";
        }
        if (!formData.theme?.fontFamily) {
          newErrors.fontFamily = "Font family is required";
        }
        if (!formData.theme?.designFeel) {
          newErrors.designFeel = "Design feel is required";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateAIDescription = async () => {
    if (!formData.companyName || !formData.description || !formData.ideaScope) {
      showError("Please complete the previous steps before generating AI recommendations");
      return;
    }

    setAiGenerating(true);
    try {
      // Simulate AI generation - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      const aiDescription = `Based on your ${formData.ideaScope} storefront for ${formData.companyName}, we recommend a ${formData.theme?.designFeel || 'modern'} design approach. The storefront should feature a clean, professional layout with ${formData.theme?.primaryColor || 'blue'} as the primary accent color. Use ${formData.theme?.fontFamily || 'Inter'} font family for a contemporary feel. Focus on showcasing your products with high-quality imagery and clear call-to-action buttons. The design should emphasize ${formData.description.substring(0, 50)}...`;

      setFormData(prev => ({
        ...prev,
        theme: {
          ...prev.theme!,
          aiDescription,
        }
      }));

      showSuccess("AI design recommendations generated!");
    } catch (error) {
      showError("Failed to generate AI recommendations. Please try again.");
    } finally {
      setAiGenerating(false);
    }
  };

  // Generate next question from AI
  const generateNextQuestion = async () => {
    if (!formData.companyName || !formData.ideaScope) {
      showError("Company name and niche are required");
      return;
    }

    setGeneratingQuestion(true);
    try {
      const response = await fetch('/api/ai/generate-description/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyName: formData.companyName,
          niche: formData.ideaScope,
          existingAnswers: questionAnswers,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate question');
      }

      const data = await response.json();

      if (data.type === 'generate_description') {
        // All questions answered, generate description
        await generateFinalDescription();
      } else {
        // Show next question
        setCurrentQuestion(data.question);
        setInputType(data.inputType || 'text');
        setHint(data.hint || '');
        setQuestionNumber(data.questionNumber || 0);
        setTotalQuestions(data.totalQuestions || 5);
        setCurrentAnswer('');
      }
    } catch (error: any) {
      showError(error.message || 'Failed to generate question');
    } finally {
      setGeneratingQuestion(false);
    }
  };

  // Handle answer submission
  const handleAnswerSubmit = async () => {
    if (!currentAnswer.trim()) {
      showError("Please provide an answer");
      return;
    }

    // Save answer
    const newAnswers = {
      ...questionAnswers,
      [currentQuestion]: currentAnswer,
    };
    setQuestionAnswers(newAnswers);

    // Clear current answer
    setCurrentAnswer('');

    // Generate next question or final description
    await generateNextQuestion();
  };

  // Generate final description from all answers
  const generateFinalDescription = async () => {
    if (Object.keys(questionAnswers).length === 0) {
      showError("No answers provided");
      return;
    }

    setGeneratingDescription(true);
    try {
      const response = await fetch('/api/ai/generate-description', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyName: formData.companyName,
          niche: formData.ideaScope,
          answers: questionAnswers,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate description');
      }

      const data = await response.json();

      // Update form data with generated description
      setFormData(prev => ({
        ...prev,
        description: data.description,
      }));

      showSuccess("Business description generated successfully!");
      setShowAIDescriptionModal(false);
      setQuestionAnswers({});
      setCurrentQuestion('');
      setCurrentAnswer('');
    } catch (error: any) {
      showError(error.message || 'Failed to generate description');
    } finally {
      setGeneratingDescription(false);
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < STEPS.length) {
        const nextStep = currentStep + 1;
        setCurrentStep(nextStep);
        // Save current step
        if (typeof window !== "undefined") {
          localStorage.setItem(`${STORAGE_KEY}_step`, nextStep.toString());
        }
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    // Check if user is authenticated
    if (!user) {
      // Redirect to signin page with callback URL
      const currentPath = window.location.pathname;
      router.push(`/signin?callbackUrl=${encodeURIComponent(currentPath)}`);
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      onComplete?.(formData);
      onClose();
      // Clear saved data
      if (typeof window !== "undefined") {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(`${STORAGE_KEY}_step`);
      }
      // Reset form
      setCurrentStep(1);
      setFormData(getDefaultData());
    }, 1500);
  };


  const handleClose = () => {
    // Don't clear data on close, keep it for when user returns
    onClose();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <SparklesIcon className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-neutral-800 mb-2">
                What type of storefront do you want to create?
              </h3>
              <p className="text-sm text-neutral-600">
                Select the category that best describes your business
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {IDEA_SCOPES.map((scope) => (
                <button
                  key={scope.value}
                  type="button"
                  onClick={() => {
                    const newData = { ...formData, ideaScope: scope.value };
                    setFormData(newData);
                    if (errors.ideaScope) {
                      setErrors((prev) => ({ ...prev, ideaScope: "" }));
                    }
                    // Save to localStorage
                    if (typeof window !== "undefined") {
                      const dataToSave = {
                        ...newData,
                        logo: null,
                      };
                      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
                    }
                  }}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${formData.ideaScope === scope.value
                    ? "border-blue-600 bg-blue-50"
                    : "border-neutral-200 hover:border-blue-300"
                    }`}
                >
                  <span className="text-sm font-medium text-neutral-800">
                    {scope.label}
                  </span>
                </button>
              ))}
            </div>
            {errors.ideaScope && (
              <p className="text-sm text-error mt-2">{errors.ideaScope}</p>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-neutral-800 mb-2">
                Company Information
              </h3>
              <p className="text-sm text-neutral-600">
                Tell us about your company
              </p>
            </div>
            <Input
              label="Dfold Lab"
              name="companyName"
              type="text"
              value={formData.companyName}
              onChange={handleChange}
              error={errors.companyName}
              placeholder="Enter your company name"
              className="w-full"
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-neutral-800 mb-2">
                Business Description
              </h3>
              <p className="text-sm text-neutral-600">
                Describe what your business does (minimum 50 characters)
              </p>
            </div>
            <div className="relative">
              <TextArea
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                error={errors.description}
                placeholder="Tell us about your business, products, and what makes you unique..."
                className="w-full min-h-[150px] pr-12"
              />
              {formData.companyName && formData.ideaScope && (
                <button
                  type="button"
                  onClick={() => {
                    if (!formData.companyName || !formData.ideaScope) {
                      showError("Please complete company name and niche selection first");
                      return;
                    }
                    setShowAIDescriptionModal(true);
                    setQuestionAnswers({});
                    setQuestionNumber(0);
                    generateNextQuestion();
                  }}
                  className="absolute right-3 top-9 p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
                  title="Generate description with AI"
                >
                  <SparklesIcon className="w-5 h-5" />
                </button>
              )}
            </div>
            <p className="text-xs text-neutral-500">
              {formData.description.length} / 50 characters minimum
            </p>
            {formData.companyName && formData.ideaScope && (
              <p className="text-xs text-blue-600 flex items-center gap-1">
                <SparklesIcon className="w-3 h-3" />
                Click the sparkles icon to generate a description with AI
              </p>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-neutral-800 mb-2">
                Choose Your Subdomain
              </h3>
              <p className="text-sm text-neutral-600">
                This will be your storefront URL
              </p>
            </div>
            <div className="relative">
              <Input
                label="Subdomain"
                name="subdomain"
                type="text"
                value={formData.subdomain}
                onChange={handleChange}
                error={errors.subdomain}
                placeholder="your-store"
                className="w-full pr-24"
              />
              <div className="absolute right-3 top-9 text-neutral-500 text-sm">
                .storefront.com
              </div>
            </div>
            <div className="bg-neutral-50 p-4 rounded-lg">
              <p className="text-sm text-neutral-600">
                Your storefront will be available at:
              </p>
              <p className="text-sm font-semibold text-primary-600 mt-1">
                {formData.subdomain || "your-store"}.storefront.com
              </p>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-neutral-800 mb-2">
                Upload Your Logo
              </h3>
              <p className="text-sm text-neutral-600">
                Add your company logo (PNG, JPG, max 5MB)
              </p>
            </div>
            <div className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors">
              {formData.logoPreview ? (
                <div className="space-y-4">
                  <div className="relative w-32 h-32 mx-auto">
                    <Image
                      src={formData.logoPreview}
                      alt="Logo preview"
                      fill
                      className="object-contain rounded-lg"
                    />
                  </div>
                  <p className="text-sm text-neutral-600">{formData.logo?.name}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        logo: null,
                        logoPreview: null,
                      }));
                    }}
                    className="text-sm text-error hover:text-error/80"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="space-y-2">
                    <div className="w-12 h-12 mx-auto bg-neutral-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-neutral-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-neutral-700">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-neutral-500">
                      PNG, JPG up to 5MB
                    </p>
                  </div>
                </label>
              )}
            </div>
            {errors.logo && (
              <p className="text-sm text-error mt-2">{errors.logo}</p>
            )}
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-neutral-800 mb-2">
                Customize Your Storefront Appearance
              </h3>
              <p className="text-sm text-neutral-600">
                Choose colors, fonts, and design style for your storefront
              </p>
            </div>

            {/* Primary Color */}
            <ColorPicker
              value={formData.theme?.primaryColor || "#3B82F6"}
              onChange={(color) => {
                setFormData(prev => ({
                  ...prev,
                  theme: {
                    ...prev.theme!,
                    primaryColor: color,
                  }
                }));
                if (errors.primaryColor) {
                  setErrors(prev => ({ ...prev, primaryColor: "" }));
                }
              }}
              label="Primary Color"
            />
            {errors.primaryColor && (
              <p className="text-sm text-error mt-1">{errors.primaryColor}</p>
            )}

            {/* Font Family */}
            <div>
              <Select
                label="Font Family"
                name="fontFamily"
                value={formData.theme?.fontFamily || "Inter"}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    theme: {
                      ...prev.theme!,
                      fontFamily: e.target.value,
                    }
                  }));
                  if (errors.fontFamily) {
                    setErrors(prev => ({ ...prev, fontFamily: "" }));
                  }
                }}
                error={errors.fontFamily}
                className="w-full"
              >
                <option value="Inter">Inter (Modern)</option>
                <option value="Roboto">Roboto (Clean)</option>
                <option value="Poppins">Poppins (Bold)</option>
                <option value="Open Sans">Open Sans (Friendly)</option>
                <option value="Montserrat">Montserrat (Elegant)</option>
                <option value="Lato">Lato (Professional)</option>
              </Select>
            </div>

            {/* Design Feel */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Design Feel
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "modern", label: "Modern", desc: "Clean and minimalist" },
                  { value: "classic", label: "Classic", desc: "Traditional and elegant" },
                  { value: "bold", label: "Bold", desc: "Vibrant and energetic" },
                  { value: "minimal", label: "Minimal", desc: "Simple and focused" },
                ].map((feel) => (
                  <button
                    key={feel.value}
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        theme: {
                          ...prev.theme!,
                          designFeel: feel.value,
                        }
                      }));
                      if (errors.designFeel) {
                        setErrors(prev => ({ ...prev, designFeel: "" }));
                      }
                    }}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${formData.theme?.designFeel === feel.value
                      ? "border-blue-600 bg-blue-50"
                      : "border-neutral-200 hover:border-blue-300"
                      }`}
                  >
                    <div className="font-semibold text-neutral-800">{feel.label}</div>
                    <div className="text-xs text-neutral-600 mt-1">{feel.desc}</div>
                  </button>
                ))}
              </div>
              {errors.designFeel && (
                <p className="text-sm text-error mt-2">{errors.designFeel}</p>
              )}
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <SparklesIcon className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-neutral-800 mb-2">
                AI Design Recommendations
              </h3>
              <p className="text-sm text-neutral-600">
                Generate personalized design recommendations based on your storefront details
              </p>
            </div>

            {formData.theme?.aiDescription ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <SparklesIcon className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-neutral-800 mb-2">AI Design Analysis</h4>
                    <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap">
                      {formData.theme.aiDescription}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="light"
                  onClick={generateAIDescription}
                  isLoading={aiGenerating}
                  className="mt-4"
                >
                  Regenerate
                </Button>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-neutral-600 mb-6">
                  Click the button below to generate AI-powered design recommendations for your storefront
                </p>
                <Button
                  type="button"
                  onPress={generateAIDescription}
                  loading={aiGenerating}
                  color="primary"
                  className="text-white"
                  startContent={<SparklesIcon className="w-5 h-5" />}
                >
                  {aiGenerating ? "Generating..." : "Generate Design Recommendations"}
                </Button>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <PopupModal
        isOpen={isOpen}
        onClose={handleClose}
        size="2xl"
        placement="center"
        showCloseButton={false}
        className="max-w-3xl"
      >
        <div className="p-6 relative">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-neutral-800">
                Create Your Storefront
              </h2>
              <p className="text-sm text-neutral-600 mt-1">
                Step {currentStep} of {STEPS.length}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-neutral-600" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-start justify-between mb-2 w-full">
              {STEPS.map((step, index) => (
                <div key={step.id} className="flex items-start flex-1 relative">
                  <div className="flex flex-col items-center flex-1 z-10">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors shrink-0 ${currentStep >= step.id
                        ? "bg-blue-600 border-blue-600 text-white"
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
                      className={`text-xs mt-2 text-center max-w-[100px] ${currentStep >= step.id
                        ? "text-neutral-800 font-medium"
                        : "text-neutral-400"
                        }`}
                    >
                      {step.title}
                    </p>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`absolute top-5 left-[calc(50%+20px)] right-0 h-0.5 transition-colors ${currentStep > step.id ? "bg-blue-600" : "bg-neutral-200"
                        }`}
                      style={{ width: 'calc(100% - 40px)' }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="min-h-[400px] mb-6 relative">{renderStepContent()}</div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-6 border-t border-neutral-200">
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
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md hover:shadow-lg transition-all"
                  endContent={<ArrowRightIcon className="w-4 h-4" />}
                >
                  Next
                </Button>
              ) : (
                <>
                  {!user && (
                    <div className="flex items-center gap-2 text-sm text-neutral-600 mb-2">
                      <LockClosedIcon className="w-4 h-4" />
                      <span>Sign in required to create storefront</span>
                    </div>
                  )}
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    loading={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md hover:shadow-lg transition-all"
                    endContent={<CheckCircleIcon className="w-4 h-4" />}
                  >
                    Create Storefront
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Local Data Prompt Modal */}
        <PopupModal
          isOpen={showLocalDataPrompt}
          onClose={() => setShowLocalDataPrompt(false)}
          title="Found Saved Progress"
          size="md"
        >
          <div className="space-y-4">
            <p className="text-neutral-600">
              We found saved progress from a previous session. Would you like to continue from where you left off?
            </p>
            <div className="flex gap-3">
              <Button
                onPress={() => {
                  setShowLocalDataPrompt(false);
                  showSuccess("Continuing with saved progress");
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Continue
              </Button>
              <Button
                onPress={() => {
                  clearWizardLocally();
                  setFormData(getDefaultData());
                  setShowLocalDataPrompt(false);
                  showSuccess("Starting fresh");
                }}
                variant="bordered"
                className="flex-1"
              >
                Start Fresh
              </Button>
            </div>
          </div>
        </PopupModal>


        {/* Authentication Prompt Overlay */}
        {!authChecked ? (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-neutral-600">Checking authentication...</p>
            </div>
          </div>
        ) : !user && currentStep === STEPS.length ? (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
            <div className="text-center p-6 max-w-md">
              <LockClosedIcon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-neutral-800 mb-2">
                Sign In Required
              </h3>
              <p className="text-sm text-neutral-600 mb-6">
                Please sign in or create an account to create your storefront. Your progress has been saved and will be restored when you return.
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={() => {
                    onClose();
                    router.push("/signup");
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Sign Up
                </Button>
                <Button
                  onClick={() => {
                    const currentPath = window.location.pathname;
                    router.push(`/signin?callbackUrl=${encodeURIComponent(currentPath)}`);
                  }}
                  variant="bordered"
                  className="border-neutral-300"
                >
                  Sign In
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </PopupModal>

      {/* AI Description Generator Modal */}
      <PopupModal
        isOpen={showAIDescriptionModal}
        onClose={() => {
          setShowAIDescriptionModal(false);
          setQuestionAnswers({});
          setCurrentQuestion('');
          setCurrentAnswer('');
          setQuestionNumber(0);
        }}
        title="AI Description Generator"
        size="md"
      >
        <div className="space-y-6">
          {generatingDescription ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-neutral-600">Generating your business description...</p>
            </div>
          ) : generatingQuestion ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-neutral-600">Generating question...</p>
            </div>
          ) : currentQuestion ? (
            <>
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-blue-600">
                    Question {questionNumber} of {totalQuestions}
                  </span>
                  <span className="text-xs text-blue-500">
                    {Math.round((questionNumber / totalQuestions) * 100)}% complete
                  </span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  {currentQuestion}
                </label>
                {hint && (
                  <p className="text-xs text-neutral-500 mb-2">{hint}</p>
                )}
                {inputType === 'textarea' ? (
                  <TextArea
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    className="w-full min-h-[120px]"
                    name="aiAnswer"
                  />
                ) : (
                  <Input
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    className="w-full"
                    name="aiAnswer"
                    type="text"
                  />
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleAnswerSubmit}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  isDisabled={!currentAnswer.trim()}
                >
                  {questionNumber < totalQuestions ? 'Next Question' : 'Generate Description'}
                </Button>
                <Button
                  onClick={() => {
                    setShowAIDescriptionModal(false);
                    setQuestionAnswers({});
                    setCurrentQuestion('');
                    setCurrentAnswer('');
                  }}
                  variant="light"
                  className="px-4"
                >
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <SparklesIcon className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-neutral-800 mb-2">
                Let AI Help Create Your Description
              </h3>
              <p className="text-sm text-neutral-600 mb-6">
                We'll ask you a few questions about your business to generate a compelling description.
              </p>
              <Button
                onClick={generateNextQuestion}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                isDisabled={generatingQuestion}
              >
                {generatingQuestion ? 'Starting...' : 'Start'}
              </Button>
            </div>
          )}
        </div>
      </PopupModal>
    </>
  );
};

export default StorefrontWizard;
