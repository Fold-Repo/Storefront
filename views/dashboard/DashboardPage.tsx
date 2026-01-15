"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { loadGeneratedSiteFromFirebase, saveGeneratedSiteToFirebase, GeneratedSite } from "@/services/firebase";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui/form";
import { StorefrontWizard, StorefrontData } from "@/components/wizard";
import { generateCompleteSite } from "@/services/ai";
import { canCreateStorefront, incrementStorefrontCount, incrementPageCount } from "@/services/planLimits";
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
} from "@heroicons/react/24/outline";
import Link from "next/link";
import Image from "next/image";
import { NAV_CONSTANT } from "@/constants";
import { getMainDomain, getSubdomainUrl, getSubdomainWithDomain } from "@/utils/domain";
import { UserProfileDropdown } from "@/components/nav/UserProfileDropdown";

export const DashboardPage = () => {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { showSuccess, showError } = useToast();

  const [siteData, setSiteData] = useState<GeneratedSite | null>(null);
  const [loading, setLoading] = useState(true);
  const [subdomain, setSubdomain] = useState("");
  const [customDomain, setCustomDomain] = useState("");
  const [savingDomain, setSavingDomain] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);

  // Stats (placeholder - will come from API)
  const [stats] = useState({
    totalVisits: 0,
    totalViews: 0,
    totalProducts: 0,
    totalOrders: 0,
  });

  // Check authentication
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/signin?callbackUrl=/dashboard");
    }
  }, [isAuthenticated, authLoading, router]);

  // Load site data
  useEffect(() => {
    const loadSite = async () => {
      if (!user || !isAuthenticated) return;

      try {
        setLoading(true);
        const site = await loadGeneratedSiteFromFirebase(user);

        if (site) {
          setSiteData(site);
          setSubdomain(site.subdomain || "");
        }
      } catch (error) {
        console.error("Error loading site:", error);
        showError("Failed to load website data");
      } finally {
        setLoading(false);
      }
    };

    loadSite();
  }, [user, isAuthenticated, showError]);

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
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const pages = siteData ? Object.keys(siteData.pages || {}) : [];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-neutral-900 mb-2 tracking-tighter">
          Welcome back, {user?.firstname || "User"}!
        </h1>
        <p className="text-neutral-500 font-medium">
          Manage your storefront, view analytics, and customize your pages.
        </p>
      </div>

      {/* No Storefront - Call to Action */}
      {!siteData && !loading && (
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
          {/* Website Editor Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
            <div className="p-6 border-b border-neutral-50 flex items-center gap-4">
              <div className="bg-blue-50 rounded-xl p-2.5">
                <GlobeAltIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-black text-neutral-900 tracking-tighter">Website Editor</h2>
                <p className="text-sm text-neutral-500 font-medium">Visual drag-and-drop editor</p>
              </div>
            </div>

            <div className="p-6">
              {siteData ? (
                <div className="bg-neutral-50 rounded-2xl border border-neutral-100 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-lg font-black text-neutral-900 tracking-tight">{siteData.companyName}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                      <p className="text-sm text-neutral-500 font-mono font-medium">{getSubdomainWithDomain(siteData.subdomain)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Link href="/dashboard/domains" className="flex-1 sm:flex-none">
                      <Button variant="bordered" className="w-full flex items-center justify-center gap-2 border-neutral-200 hover:border-blue-500 hover:bg-blue-50 transition-all font-bold">
                        <GlobeAltIcon className="w-4 h-4" />
                        Domains
                      </Button>
                    </Link>
                    <Link href={`/editor?subdomain=${siteData.subdomain}`} className="flex-1 sm:flex-none">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 font-black uppercase tracking-widest text-xs py-5 px-6 shadow-lg shadow-blue-100">
                        <PencilIcon className="w-4 h-4" />
                        Edit Site
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 border-2 border-dashed border-neutral-100 rounded-3xl">
                  <p className="text-neutral-400 font-medium mb-6">No storefront found. Let's build one!</p>
                  <Button
                    onPress={() => setWizardOpen(true)}
                    className="bg-blue-600 text-white font-black uppercase tracking-widest text-xs px-8 shadow-xl shadow-blue-100"
                  >
                    Launch Wizard
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Pages Management Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
            <div className="p-6 border-b border-neutral-50 flex items-center gap-4">
              <div className="bg-purple-50 rounded-xl p-2.5">
                <DocumentTextIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-black text-neutral-900 tracking-tighter">Site Pages</h2>
                <p className="text-sm text-neutral-500 font-medium">Quickly jump to any page</p>
              </div>
            </div>

            <div className="p-6">
              {siteData && pages.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {pages.map((pageName) => (
                    <Link
                      key={pageName}
                      href={`/editor?subdomain=${siteData.subdomain}&page=${pageName}`}
                      className="flex items-center justify-between p-4 border border-neutral-100 rounded-xl hover:border-purple-200 hover:bg-purple-50/30 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-neutral-50 group-hover:bg-white p-2 rounded-lg transition-colors">
                          <DocumentTextIcon className="w-5 h-5 text-neutral-400 group-hover:text-purple-500" />
                        </div>
                        <span className="font-bold text-neutral-700 capitalize text-sm tracking-tight">
                          {pageName.replace(/-/g, " ")}
                        </span>
                      </div>
                      <ArrowRightIcon className="w-4 h-4 text-neutral-300 group-hover:text-purple-400 translate-x-0 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-neutral-400 font-medium italic">Create a site to manage pages.</p>
                </div>
              )}
            </div>
          </div>
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

          {/* Custom Domain Card */}
          <div className="bg-white rounded-3xl shadow-sm border-2 border-dashed border-blue-100 p-6 bg-blue-50/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-100 rounded-xl p-2">
                <GlobeAltIcon className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-black text-neutral-900 tracking-tighter underline decoration-blue-200 underline-offset-4">Custom Domain</h2>
            </div>

            <div className="space-y-5">
              <p className="text-sm text-neutral-600 font-medium leading-relaxed">
                Connect your own domain (e.g. <b>myshop.com</b>) to build a professional brand.
              </p>

              <Link href="/dashboard/domains" className="block">
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 shadow-xl shadow-blue-100 uppercase tracking-widest text-[10px] rounded-2xl"
                >
                  Set Up Domain
                </Button>
              </Link>

              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-400 bg-white/50 p-2 rounded-lg border border-white">
                <ShieldCheckIcon className="w-4 h-4 text-green-500" />
                Free SSL Security
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
            <h2 className="text-sm font-black text-neutral-300 uppercase tracking-widest mb-4">Deep Links</h2>
            <div className="grid grid-cols-1 gap-2">
              <Link href={siteData ? `/editor?subdomain=${siteData.subdomain}&page=homepage` : "/editor?page=homepage"}>
                <Button variant="bordered" className="w-full justify-start border-neutral-100 hover:border-neutral-200 gap-3 text-neutral-600 hover:text-blue-600 py-6 transition-all">
                  <PencilIcon className="w-4 h-4" />
                  Site Designer
                </Button>
              </Link>
              <Link href="/editor">
                <Button variant="bordered" className="w-full justify-start border-neutral-100 hover:border-neutral-200 gap-3 text-neutral-600 hover:text-blue-600 py-6 transition-all">
                  <SparklesIcon className="w-4 h-4" />
                  Create New
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
            showError("Please log in to create a storefront");
            return;
          }

          try {
            setLoading(true);
            setWizardOpen(false);

            // Check storefront limit before creating
            const userId = String(user.user_id || (user as any).uid || (user as any).id);
            const limitCheck = await canCreateStorefront(userId);

            if (!limitCheck.allowed) {
              showError(
                limitCheck.message ||
                `You have reached your plan limit of ${limitCheck.max} storefront${limitCheck.max > 1 ? 's' : ''}. Please upgrade your plan to create more storefronts.`
              );
              setLoading(false);
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
                theme: data.theme || {
                  primaryColor: "#3B82F6",
                  fontFamily: "Inter",
                  designFeel: "modern",
                },
              },
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
              pages: generatedPages,
              status: "completed",
              generatedAt: new Date(),
              updatedAt: new Date(),
            };

            // Save to Firebase
            await saveGeneratedSiteToFirebase(site, user);

            // Increment storefront count
            await incrementStorefrontCount(userId);

            // Count pages and increment page count
            const pageCount = Object.keys(generatedPages).length;
            for (let i = 0; i < pageCount; i++) {
              await incrementPageCount(userId, data.subdomain);
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
            const errorMessage = error.message || "Failed to create storefront. Please try again.";
            showError(errorMessage);
          } finally {
            setLoading(false);
          }
        }}
      />
    </div>
  );
};
