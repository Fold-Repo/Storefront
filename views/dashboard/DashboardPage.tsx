"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { loadGeneratedSiteFromFirebase, saveGeneratedSiteToFirebase, GeneratedSite, loadAllUserSites } from "@/services/firebase";
import { useToast } from "@/hooks/useToast";
import { Button, CaptivatingLoader } from "@/components/ui";
import { Input } from "@/components/ui/form";
import { StorefrontWizard, StorefrontData } from "@/components/wizard";
import { generateCompleteSite } from "@/services/ai";
import { canCreateStorefront, incrementStorefrontCount, incrementPageCount, getUserPlan } from "@/services/planLimits";
import { SiteSwitcher } from "@/components/dashboard/SiteSwitcher";
import {
  ChartBarIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  ArrowRightIcon,
  EyeIcon,
  ShoppingCartIcon,
  CubeIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  LinkIcon,
  SparklesIcon,
  ShieldCheckIcon,
  PlusIcon,
  ArrowUpIcon,
  ChatBubbleLeftRightIcon,
  MegaphoneIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import Image from "next/image";
import { NAV_CONSTANT } from "@/constants";
import { getMainDomain, getSubdomainUrl, getSubdomainWithDomain } from "@/utils/domain";
import { UserProfileDropdown } from "@/components/nav/UserProfileDropdown";
import { TrendsChart } from "@/components/dashboard/TrendsChart";
import { getAnalytics } from "@/services/analytics";

export const DashboardPage = () => {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { showSuccess, showError } = useToast();

  // Multi-site state
  const [allSites, setAllSites] = useState<GeneratedSite[]>([]);
  const [activeSite, setActiveSite] = useState<GeneratedSite | null>(null);
  const [siteData, setSiteData] = useState<GeneratedSite | null>(null);
  const [loading, setLoading] = useState(true);
  const [subdomain, setSubdomain] = useState("");
  const [customDomain, setCustomDomain] = useState("");
  const [savingDomain, setSavingDomain] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);

  // Plan limits state
  const [canCreate, setCanCreate] = useState(true);
  const [maxStorefronts, setMaxStorefronts] = useState(1);

  // Generation state
  const [generating, setGenerating] = useState(false);

  // Stats (placeholder - will come from API)
  const [stats, setStats] = useState({
    totalVisits: 0,
    totalViews: 0,
    totalProducts: 0,
    totalOrders: 0,
  });

  // Analytics data
  const [salesData, setSalesData] = useState<any[]>([]);
  const [marketingData, setMarketingData] = useState<any[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [timePeriod, setTimePeriod] = useState<"daily" | "weekly" | "monthly">("daily");

  // Check authentication
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/signin?callbackUrl=/dashboard");
    }
  }, [isAuthenticated, authLoading, router]);

  // Load ALL user sites and plan limits
  useEffect(() => {
    const loadSitesAndPlan = async () => {
      if (!user || !isAuthenticated) return;

      try {
        setLoading(true);
        const userId = String(user.user_id || (user as any).uid || (user as any).id);

        // Load all sites for the user
        const sites = await loadAllUserSites(user);
        setAllSites(sites);

        // Set the first site as active (or previously selected one)
        if (sites.length > 0) {
          const savedActiveSubdomain = localStorage.getItem('active_storefront');
          const savedSite = savedActiveSubdomain
            ? sites.find(s => s.subdomain === savedActiveSubdomain)
            : null;
          const active = savedSite || sites[0];
          setActiveSite(active);
          setSiteData(active);
          setSubdomain(active.subdomain || "");
        }

        // Check plan limits
        try {
          const plan = await getUserPlan(userId);
          if (plan) {
            setMaxStorefronts(plan.limits?.maxStorefronts || 1);
            const currentCount = sites.length;
            setCanCreate(currentCount < (plan.limits?.maxStorefronts || 1));
          }
        } catch (planError) {
          console.warn("Could not load plan limits:", planError);
          // Default to allowing creation if plan check fails
          setCanCreate(sites.length < 1);
          setMaxStorefronts(1);
        }

      } catch (error) {
        console.error("Error loading sites:", error);
        showError("Failed to load website data");
      } finally {
        setLoading(false);
      }
    };

    loadSitesAndPlan();
  }, [user, isAuthenticated, showError]);

  // Load analytics data
  const loadAnalytics = async (period: "daily" | "weekly" | "monthly" = timePeriod) => {
    if (!user?.business_id) return;

    try {
      setAnalyticsLoading(true);
      const analytics = await getAnalytics(user.business_id, period);
      setSalesData(analytics.sales);
      setMarketingData(analytics.marketing);
      setStats({
        totalVisits: analytics.summary.totalVisits,
        totalViews: analytics.summary.totalPageViews,
        totalProducts: 0, // This would come from products API
        totalOrders: analytics.summary.totalOrders,
      });
    } catch (error) {
      console.error("Error loading analytics:", error);
      // Don't show error to user, just use empty data
      setSalesData([]);
      setMarketingData([]);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.business_id) {
      loadAnalytics();
    }
  }, [user?.business_id]);

  const handlePeriodChange = (period: "daily" | "weekly" | "monthly") => {
    setTimePeriod(period);
    loadAnalytics(period);
  };

  // Handle custom domain save
  const handleSaveDomain = async () => {
    if (!siteData || !user) return;

    try {
      setSavingDomain(true);

      // TODO: Call API to save custom domain
      // await saveCustomDomain(user, customDomain);

      showSuccess("Custom domain saved successfully!");

      // Update site data
      setSiteData({
        ...siteData,
        // Add customDomain field when API is ready
      });
    } catch (error) {
      console.error("Error saving domain:", error);
      showError("Failed to save custom domain");
    } finally {
      setSavingDomain(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50/30">
        <CaptivatingLoader
          loadingTexts={["Accessing your dashboard...", "Loading your storefronts...", "Preparing analytics..."]}
          subText="Just a moment while we get things ready"
        />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const pages = siteData ? Object.keys(siteData.pages || {}) : [];

  // Handle site selection
  const handleSiteSelect = (site: GeneratedSite) => {
    setActiveSite(site);
    setSiteData(site);
    setSubdomain(site.subdomain || "");
    localStorage.setItem('active_storefront', site.subdomain);
  };

  return (
    <>
      {/* Full-screen Loading Animation */}
      {generating && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/95 backdrop-blur-sm">
          <div className="max-w-md w-full p-8">
            <CaptivatingLoader
              loadingTexts={[
                "Sparking your business idea...",
                "Designing a unique brand identity...",
                "Building your digital storefront...",
                "Crafting stunning page layouts...",
                "Optimizing for lightning speed...",
                "Launching your dream store..."
              ]}
              subText="Our AI is building your storefront. This might take a minute."
            />
          </div>
        </div>
      )}

      <div className="space-y-8">
        {/* Welcome Section with Site Switcher */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-black text-neutral-900 mb-2 tracking-tighter">
                Welcome back, {user?.firstname || "User"}!
              </h1>
              <p className="text-neutral-500 font-medium">
                Manage your storefronts, view analytics, and customize your pages.
              </p>
            </div>

            {/* Site Switcher or Create Button */}
            <div className="w-full lg:w-80">
              {allSites.length > 0 ? (
                <SiteSwitcher
                  sites={allSites}
                  activeSite={activeSite}
                  onSelect={handleSiteSelect}
                  onCreateNew={() => setWizardOpen(true)}
                  canCreate={canCreate}
                  maxSites={maxStorefronts}
                  onUpgrade={() => router.push('/dashboard/settings?tab=billing')}
                />
              ) : (
                <div className="flex gap-3">
                  {canCreate ? (
                    <Button
                      onPress={() => setWizardOpen(true)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 font-black uppercase tracking-widest text-xs py-5 shadow-lg"
                    >
                      <PlusIcon className="w-5 h-5" />
                      Create Storefront
                    </Button>
                  ) : (
                    <Button
                      onPress={() => router.push('/dashboard/settings?tab=billing')}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white flex items-center justify-center gap-2 font-semibold py-5"
                    >
                      <ArrowUpIcon className="w-5 h-5" />
                      Upgrade Plan
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* No Storefront - Call to Action */}
        {allSites.length === 0 && !loading && (
          <div className="mb-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl shadow-xl p-8 text-center border border-white/10">
            <div className="max-w-2xl mx-auto">
              <div className="bg-white/10 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md">
                <SparklesIcon className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl font-black text-white mb-4 tracking-tighter">
                Create Your First Storefront
              </h2>
              <p className="text-white/80 mb-8 text-lg font-medium leading-relaxed">
                Get started by creating your e-commerce storefront. Our AI-powered wizard will guide you through the process in minutes.
              </p>
              <Button
                onPress={() => setWizardOpen(true)}
                className="bg-white text-blue-600 hover:bg-neutral-100 px-10 py-7 text-lg font-black uppercase tracking-widest shadow-2xl flex items-center gap-3 mx-auto transition-transform hover:scale-105 active:scale-95"
                size="lg"
              >
                <SparklesIcon className="w-6 h-6" />
                Create Storefront Now
              </Button>
            </div>
          </div>
        )}

        {/* Trends Chart */}
        {user?.business_id && (
          <div className="mb-8">
            <TrendsChart
              salesData={salesData}
              marketingData={marketingData}
              loading={analyticsLoading}
              onPeriodChange={handlePeriodChange}
            />
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: "Total Visits", value: stats.totalVisits, icon: EyeIcon },
            { label: "Page Views", value: stats.totalViews, icon: ChartBarIcon },
            { label: "Products", value: stats.totalProducts, icon: CubeIcon },
            { label: "Orders", value: stats.totalOrders, icon: ShoppingCartIcon },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black text-neutral-400 uppercase tracking-widest leading-none mb-2">{stat.label}</p>
                  <p className="text-2xl font-black text-neutral-900 tracking-tighter">{stat.value}</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-3">
                  <stat.icon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Marketing Strategy Card */}
            <div className="relative bg-gradient-to-br from-blue-900 via-blue-700 to-blue-400 rounded-2xl shadow-xl border border-white/10 overflow-hidden text-white">
              {/* Ripple Effects */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-300/30 rounded-full blur-3xl animate-ripple"></div>
              <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-blue-500/40 rounded-full blur-2xl animate-ripple-delay-1"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl animate-ripple-delay-2"></div>
              <div className="absolute top-0 right-1/4 w-24 h-24 bg-blue-400/25 rounded-full blur-2xl animate-ripple"></div>
              <div className="absolute bottom-0 left-1/3 w-36 h-36 bg-blue-500/30 rounded-full blur-3xl animate-ripple-delay-1"></div>
              
              {/* Deep Blue Depth at Bottom Right */}
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-950/60 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-blue-900/70 rounded-full blur-2xl"></div>
              <div className="absolute bottom-4 right-4 w-32 h-32 bg-blue-800/50 rounded-full blur-xl"></div>
              
              <div className="relative z-10">
                <div className="p-6 border-b border-white/10 flex items-center gap-4">
                  <div className="bg-white/20 rounded-xl p-2.5 backdrop-blur-sm">
                    <SparklesIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white tracking-tighter">Marketing Strategy</h2>
                    <p className="text-sm text-white/80 font-medium">Grow your business with smart marketing</p>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link href="/dashboard/whatsapp" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all border border-white/10">
                      <div className="flex items-center gap-3 mb-2">
                        <ChatBubbleLeftRightIcon className="w-5 h-5 text-white" />
                        <h3 className="font-bold text-white text-sm">WhatsApp Commerce</h3>
                      </div>
                      <p className="text-white/70 text-xs">Connect with customers via WhatsApp</p>
                    </Link>
                    
                    <Link href="/dashboard/whatsapp/marketing" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all border border-white/10">
                      <div className="flex items-center gap-3 mb-2">
                        <MegaphoneIcon className="w-5 h-5 text-white" />
                        <h3 className="font-bold text-white text-sm">Marketing Campaigns</h3>
                      </div>
                      <p className="text-white/70 text-xs">Create and manage campaigns</p>
                    </Link>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <p className="text-xs text-white/60 mb-3">Quick Tips:</p>
                    <ul className="space-y-2 text-xs text-white/80">
                      <li className="flex items-start gap-2">
                        <span className="text-white/40 mt-0.5">•</span>
                        <span>Use WhatsApp to engage customers directly and increase conversions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-white/40 mt-0.5">•</span>
                        <span>Build your subscriber list to send targeted marketing messages</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-white/40 mt-0.5">•</span>
                        <span>Track campaign performance and optimize your marketing strategy</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Website Overview Card */}
            {siteData && (
              <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
                <div className="p-6 border-b border-neutral-50 flex items-center gap-4">
                  <div className="bg-blue-50 rounded-xl p-2.5">
                    <GlobeAltIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-neutral-900 tracking-tighter">Website Overview</h2>
                    <p className="text-sm text-neutral-500 font-medium">Your storefront information</p>
                  </div>
                </div>

                <div className="p-6">
                  <div className="bg-neutral-50 rounded-2xl border border-neutral-100 p-5 space-y-4">
                    <div>
                      <h3 className="text-lg font-black text-neutral-900 tracking-tight">{siteData.companyName}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        <p className="text-sm text-neutral-500 font-mono font-medium">{getSubdomainWithDomain(siteData.subdomain)}</p>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-neutral-200">
                      <Link href="/dashboard/domains">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 font-black uppercase tracking-widest text-xs py-5 px-6 shadow-lg shadow-blue-100">
                          <GlobeAltIcon className="w-4 h-4" />
                          Manage Domains & Editor
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Live Status Card */}
            <div className="bg-neutral-900 rounded-3xl shadow-2xl p-6 text-white overflow-hidden relative border border-white/5">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-white/10 rounded-xl p-2">
                    <LinkIcon className="w-5 h-5 text-blue-400" />
                  </div>
                  <h2 className="text-lg font-black tracking-tighter uppercase text-blue-400 tracking-widest text-xs">Live Status</h2>
                </div>

                {siteData ? (
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-black text-white/40 tracking-widest">Public Address</p>
                      <p className="text-sm font-bold text-white font-mono truncate bg-white/5 p-2 rounded-lg">
                        {subdomain}.{getMainDomain()}
                      </p>
                    </div>

                    <a
                      href={getSubdomainUrl(subdomain)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-3 w-full py-4 px-6 bg-blue-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/40"
                    >
                      Visit My Store
                      <ArrowRightIcon className="w-4 h-4" />
                    </a>
                  </div>
                ) : (
                  <p className="text-sm text-white/40 font-medium italic">Not launched yet.</p>
                )}
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-600/20 blur-3xl rounded-full"></div>
            </div>

            {/* Quick Links Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
              <h2 className="text-sm font-black text-neutral-300 uppercase tracking-widest mb-4">Quick Links</h2>
              <div className="grid grid-cols-1 gap-2">
                <Link href="/dashboard/domains">
                  <Button variant="bordered" className="w-full justify-start border-neutral-100 hover:border-neutral-200 gap-3 text-neutral-600 hover:text-blue-600 py-6 transition-all">
                    <GlobeAltIcon className="w-4 h-4" />
                    Domains & Editor
                  </Button>
                </Link>
                <Link href="/dashboard/whatsapp">
                  <Button variant="bordered" className="w-full justify-start border-neutral-100 hover:border-neutral-200 gap-3 text-neutral-600 hover:text-blue-600 py-6 transition-all">
                    <ChatBubbleLeftRightIcon className="w-4 h-4" />
                    WhatsApp Commerce
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <StorefrontWizard
          isOpen={wizardOpen}
          onClose={() => setWizardOpen(false)}
          onComplete={async (data: StorefrontData) => {
            if (!user) {
              console.error("Dashboard: No user found during wizard completion");
              showError("Please log in to create a storefront");
              return;
            }

            console.log("Dashboard: Wizard completed, starting site generation for user:", user);

            try {
              setGenerating(true);
              setWizardOpen(false);

              // Check storefront limit before creating
              const userId = String(user.user_id || (user as any).uid || (user as any).id);
              console.log("Dashboard: Check permissions for userId:", userId);
              const limitCheck = await canCreateStorefront(userId);

              if (!limitCheck.allowed) {
                showError(
                  limitCheck.message ||
                  `You have reached your plan limit of ${limitCheck.max} storefront${limitCheck.max > 1 ? 's' : ''}. Please upgrade your plan to create more storefronts.`
                );
                setGenerating(false);
                return;
              }

              showSuccess("Generating your storefront pages...");

              // Generate pages using AI service
              const generatedPages = await generateCompleteSite({
                wizardData: {
                  ideaScope: data.ideaScope,
                  companyName: data.companyName,
                  description: data.description,
                  subdomain: data.subdomain,
                  logoPreview: data.logoPreview,
                  layout: data.layout,
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

              // Create GeneratedSite object
              const site: GeneratedSite = {
                userId: userId,
                userEmail: user.email,
                subdomain: data.subdomain,
                companyName: data.companyName,
                businessNiche: data.ideaScope,
                theme: data.theme || {
                  primaryColor: "#3B82F6",
                  fontFamily: "Inter",
                  designFeel: "modern",
                },
                layout: data.layout,
                pages: generatedPages,
                status: "completed",
                generatedAt: new Date(),
                updatedAt: new Date(),
              };

              // Save to Firebase
              console.log("Dashboard: Saving generated site to Firebase...", site);
              await saveGeneratedSiteToFirebase(site, user);
              console.log("Dashboard: Site saved successfully to Firebase");

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

              // Clear wizard progress from browser and Firebase
              const { clearWizardLocally, clearWizardFromFirebase } = await import("@/services/firebase");
              clearWizardLocally();
              try {
                await clearWizardFromFirebase(user);
              } catch (error) {
                console.error("Error clearing Firebase wizard:", error);
              }

              // Reload site data to update the dashboard
              const updatedSite = await loadGeneratedSiteFromFirebase(user);
              if (updatedSite) {
                setSiteData(updatedSite);
                setSubdomain(updatedSite.subdomain || "");
              }

              showSuccess("Storefront created successfully!");
            } catch (error: any) {
              console.error("Error creating storefront:", error);
              console.error("Dashboard: Full error detail:", JSON.stringify(error, null, 2));
              const errorMessage = error.message || "Failed to create storefront. Please try again.";
              showError(errorMessage);
            } finally {
              setGenerating(false);
            }
          }}
        />
      </div>
    </>
  );
};

export default DashboardPage;
