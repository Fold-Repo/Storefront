"use client";

import { Navbar } from "@/components/nav";
import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Footer } from "@/components/footer";
import { StorefrontWizard, StorefrontData } from "@/components/wizard";
import { Button } from "@/components/ui";
import { SparklesIcon, ArrowRightIcon, CheckCircleIcon, RocketLaunchIcon, PaintBrushIcon, GlobeAltIcon, ShoppingCartIcon, ChartBarIcon, DevicePhoneMobileIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import { SubscriptionPlans } from "./sections/SubscriptionPlans";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/contexts/AuthContext";
import { generateCompleteSite } from "@/services/ai";
import { saveGeneratedSiteToFirebase, clearWizardLocally, GeneratedSite } from "@/services/firebase";
import { canCreateStorefront, incrementStorefrontCount, incrementPageCount } from "@/services/planLimits";
import { createDefaultPageSettings } from "@/services/pageSettings";
import { CaptivatingLoader } from "@/components/ui";

const HomePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showSuccess, showError } = useToast();
  const { user } = useAuth();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    // Check if user should continue wizard after verification
    const continueWizard = searchParams.get("continueWizard");
    if (continueWizard === "true") {
      setWizardOpen(true);
      showSuccess("Email verified! Continue creating your storefront.");
      // Clean up URL
      if (typeof window !== "undefined") {
        window.history.replaceState({}, "", "/");
      }
    }

    // Handle scroll to sections if URL has hash
    if (typeof window !== "undefined" && window.location.hash) {
      setTimeout(() => {
        const sectionId = window.location.hash.substring(1);
        const section = document.getElementById(sectionId);
        if (section) {
          section.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  }, [searchParams, showSuccess]);

  const handleWizardComplete = async (data: StorefrontData) => {
    if (!user) {
      showError("Please log in to create a storefront");
      router.push("/signin?callbackUrl=/");
      return;
    }

    try {
      setGenerating(true);

      // Check storefront limit before creating
      const userId = String(user.user_id);
      const limitCheck = await canCreateStorefront(userId);

      if (!limitCheck.allowed) {
        showError(
          limitCheck.message ||
          `You have reached your plan limit of ${limitCheck.max} storefront${limitCheck.max > 1 ? 's' : ''}. Please upgrade your plan to create more storefronts.`
        );
        setGenerating(false);
        return;
      }

      showSuccess("Generating your storefront pages... This may take a few minutes.");
      console.log('🚀 Starting storefront generation for:', data.companyName);

      // Generate pages using AI service
      const generatedPages = await generateCompleteSite({
        wizardData: {
          ideaScope: data.ideaScope,
          companyName: data.companyName,
          description: data.description,
          subdomain: data.subdomain,
          logoPreview: data.logoPreview,
          layout: (data.layout || 'multi-page') as 'single-page' | 'multi-page',
          theme: data.theme || {
            primaryColor: "#3B82F6",
            secondaryColor: "#64748B",
            accentColor: "#8B5CF6",
            fontFamily: "Inter",
            designFeel: "modern",
            primaryCtaText: "Shop Now",
            secondaryCtaText: "Learn More",
          },
        },
        userId: userId,
      });

      console.log('✅ Storefront generation completed. Pages generated:', Object.keys(generatedPages).length);

      // Create GeneratedSite object
      const site: GeneratedSite = {
        userId: userId,
        userEmail: user.email,
        subdomain: data.subdomain,
        companyName: data.companyName,
        businessNiche: data.ideaScope,
        layout: data.layout || 'multi-page',
        theme: data.theme || {
          primaryColor: "#3B82F6",
          fontFamily: "Inter",
          designFeel: "modern",
        },
        pages: generatedPages,
        status: "completed",
        generatedAt: new Date(),
        updatedAt: new Date(),
      };

      // Save to Firebase
      await saveGeneratedSiteToFirebase(site, user);

      // Initialize default page settings (about, contact, etc.)
      await createDefaultPageSettings(data.subdomain, userId);

      // Increment storefront count
      await incrementStorefrontCount(userId);

      // Count pages and increment page count (only if subdomain is valid)
      if (data.subdomain && data.subdomain.length > 0) {
        const pageCount = Object.keys(generatedPages).length;
        for (let i = 0; i < pageCount; i++) {
          await incrementPageCount(userId, data.subdomain);
        }
      } else {
        console.warn("Subdomain is empty, skipping page count increment");
      }

      // Clear wizard progress from browser and Firebase so it doesn't load again
      clearWizardLocally();
      if (user) {
        try {
          const { clearWizardFromFirebase } = await import("@/services/firebase");
          await clearWizardFromFirebase(user);
        } catch (error) {
          console.error("Error clearing Firebase wizard:", error);
        }
      }

      showSuccess("Storefront created successfully! Redirecting to dashboard...");

      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (error: any) {
      console.error("Error creating storefront:", error);
      const errorMessage = error.message || "Failed to create storefront. Please try again.";
      showError(errorMessage);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
      {/* Full-screen Loading Animation */}
      {generating && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/90 backdrop-blur-sm">
          <div className="max-w-md w-full">
            <CaptivatingLoader
              loadingTexts={[
                "Sparking your business idea...",
                "Designing a unique brand identity...",
                "Coding your digital storefront...",
                "Optimizing for lightning speed...",
                "Launching your dream store..."
              ]}
              subText="Our AI is building your storefront. This might take a minute."
            />
          </div>
        </div>
      )}

      <Navbar />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full mb-6">
            <SparklesIcon className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">
              AI-Powered Storefront Builder
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 mb-6 leading-tight">
            Create Your E-commerce Storefront
            <br />
            <span className="text-blue-600">In Minutes, Not Months</span>
          </h1>

          <p className="text-lg md:text-xl text-neutral-600 mb-8 max-w-2xl mx-auto">
            Build a beautiful, fully-functional online store with our AI-powered wizard.
            No coding required. Just answer a few questions and watch your storefront come to life.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              onPress={() => setWizardOpen(true)}
              color="primary"
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-base shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            >
              Create Your Storefront
              <RocketLaunchIcon className="w-5 h-5" />
            </Button>
            <Button
              variant="bordered"
              className="px-8 py-4 border-2 border-blue-300 hover:border-blue-400 text-blue-600 hover:text-blue-700 bg-transparent rounded-lg font-semibold text-base"
            >
              Watch Demo
            </Button>
          </div>

        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-extrabold text-neutral-900 mb-4">
                Powerful Features for Your Storefront
              </h2>
              <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
                Everything you need to build, manage, and grow your online store
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1: AI-Powered Setup */}
              <div className="p-8 bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-sm border border-blue-100 hover:shadow-lg hover:border-blue-200 transition-all duration-300">
                <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
                  <SparklesIcon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-3">
                  AI-Powered Setup
                </h3>
                <p className="text-base text-neutral-600 leading-relaxed">
                  Our intelligent wizard guides you through every step of creating your storefront with personalized recommendations
                </p>
              </div>

              {/* Feature 2: Custom Subdomain */}
              <div className="p-8 bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-sm border border-blue-100 hover:shadow-lg hover:border-blue-200 transition-all duration-300">
                <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
                  <GlobeAltIcon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-3">
                  Custom Subdomain
                </h3>
                <p className="text-base text-neutral-600 leading-relaxed">
                  Get your own branded subdomain instantly. Your store, your identity. Connect custom domains anytime
                </p>
              </div>

              {/* Feature 3: Drag & Drop Editor */}
              <div className="p-8 bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-sm border border-blue-100 hover:shadow-lg hover:border-blue-200 transition-all duration-300">
                <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
                  <PaintBrushIcon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-3">
                  Drag & Drop Editor
                </h3>
                <p className="text-base text-neutral-600 leading-relaxed">
                  Customize every page with our intuitive visual editor. No coding required, just drag, drop, and design
                </p>
              </div>

              {/* Feature 4: E-commerce Ready */}
              <div className="p-8 bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-sm border border-blue-100 hover:shadow-lg hover:border-blue-200 transition-all duration-300">
                <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
                  <ShoppingCartIcon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-3">
                  E-commerce Ready
                </h3>
                <p className="text-base text-neutral-600 leading-relaxed">
                  Built-in shopping cart, checkout, and payment processing. Start selling products immediately
                </p>
              </div>

              {/* Feature 5: Analytics Dashboard */}
              <div className="p-8 bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-sm border border-blue-100 hover:shadow-lg hover:border-blue-200 transition-all duration-300">
                <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
                  <ChartBarIcon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-3">
                  Analytics Dashboard
                </h3>
                <p className="text-base text-neutral-600 leading-relaxed">
                  Track your store's performance with detailed analytics. Monitor sales, traffic, and customer behavior
                </p>
              </div>

              {/* Feature 6: Mobile Responsive */}
              <div className="p-8 bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-sm border border-blue-100 hover:shadow-lg hover:border-blue-200 transition-all duration-300">
                <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
                  <DevicePhoneMobileIcon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-3">
                  Mobile Responsive
                </h3>
                <p className="text-base text-neutral-600 leading-relaxed">
                  Your storefront looks perfect on all devices. Automatically optimized for mobile, tablet, and desktop
                </p>
              </div>

              {/* Feature 7: Secure & Fast */}
              <div className="p-8 bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-sm border border-blue-100 hover:shadow-lg hover:border-blue-200 transition-all duration-300">
                <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
                  <ShieldCheckIcon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-3">
                  Secure & Fast
                </h3>
                <p className="text-base text-neutral-600 leading-relaxed">
                  Enterprise-grade security with SSL encryption. Lightning-fast loading times for better user experience
                </p>
              </div>

              {/* Feature 8: Launch in Minutes */}
              <div className="p-8 bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-sm border border-blue-100 hover:shadow-lg hover:border-blue-200 transition-all duration-300">
                <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
                  <RocketLaunchIcon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-3">
                  Launch in Minutes
                </h3>
                <p className="text-base text-neutral-600 leading-relaxed">
                  From idea to live storefront in minutes. No technical knowledge needed, just follow the wizard
                </p>
              </div>

              {/* Feature 9: 24/7 Support */}
              <div className="p-8 bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-sm border border-blue-100 hover:shadow-lg hover:border-blue-200 transition-all duration-300">
                <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
                  <CheckCircleIcon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-3">
                  24/7 Support
                </h3>
                <p className="text-base text-neutral-600 leading-relaxed">
                  Get help whenever you need it. Our support team is always ready to assist you on your journey
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-gradient-to-b from-white to-neutral-50 py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-extrabold text-neutral-900 mb-4">
                How It Works
              </h2>
              <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
                Creating your storefront is as easy as 1-2-3
              </p>
            </div>

            <div className="relative">
              {/* Connection Line (hidden on mobile) */}
              <div className="hidden md:block absolute left-12 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-300 via-blue-400 to-blue-300"></div>

              <div className="space-y-12 relative">
                {/* Step 1 */}
                <div className="relative flex flex-col md:flex-row gap-8 items-start">
                  <div className="flex-shrink-0 relative z-10">
                    <div className="w-24 h-24 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-bold text-3xl shadow-lg hover:scale-110 transition-transform duration-300">
                      1
                    </div>
                  </div>
                  <div className="flex-1 bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-neutral-100">
                    <h3 className="text-2xl font-bold text-neutral-900 mb-4">
                      Answer Simple Questions
                    </h3>
                    <p className="text-lg text-neutral-600 leading-relaxed">
                      Tell us about your business idea, company name, and what you want to sell.
                      Our AI wizard makes it easy.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="relative flex flex-col md:flex-row gap-8 items-start">
                  <div className="flex-shrink-0 relative z-10">
                    <div className="w-24 h-24 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-bold text-3xl shadow-lg hover:scale-110 transition-transform duration-300">
                      2
                    </div>
                  </div>
                  <div className="flex-1 bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-neutral-100">
                    <h3 className="text-2xl font-bold text-neutral-900 mb-4">
                      Customize Your Store
                    </h3>
                    <p className="text-lg text-neutral-600 leading-relaxed">
                      Choose your subdomain, upload your logo, and add a description.
                      Make it uniquely yours.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="relative flex flex-col md:flex-row gap-8 items-start">
                  <div className="flex-shrink-0 relative z-10">
                    <div className="w-24 h-24 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-bold text-3xl shadow-lg hover:scale-110 transition-transform duration-300">
                      3
                    </div>
                  </div>
                  <div className="flex-1 bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-neutral-100">
                    <h3 className="text-2xl font-bold text-neutral-900 mb-4">
                      Launch & Start Selling
                    </h3>
                    <p className="text-lg text-neutral-600 leading-relaxed">
                      Your storefront goes live instantly. Start adding products and
                      accepting orders right away.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subscription Plans Section */}
      <SubscriptionPlans />

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 py-16 lg:py-20 shadow-2xl">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4 drop-shadow-lg">
            Ready to Build Your Storefront?
          </h2>
          <p className="text-lg md:text-xl text-white/95 mb-8 max-w-2xl mx-auto font-medium">
            Join thousands of entrepreneurs who've launched their online stores with us.
            Get started in minutes, not months.
          </p>
          <div className="flex justify-center">
            <Button
              onPress={() => setWizardOpen(true)}
              className="px-10 py-5 bg-white text-blue-600 hover:bg-blue-50 rounded-lg font-bold text-lg shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all flex items-center gap-2"
            >
              Create Your Storefront Now
              <ArrowRightIcon className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </section>

      <Footer />

      {/* Storefront Wizard Modal */}
      <StorefrontWizard
        isOpen={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onComplete={handleWizardComplete}
      />
    </div>
  );
};

export default HomePage;
