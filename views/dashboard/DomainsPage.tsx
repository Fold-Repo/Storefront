"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { loadGeneratedSiteFromFirebase, saveGeneratedSiteToFirebase, GeneratedSite, loadAllUserSites } from "@/services/firebase";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui/form";
import {
    GlobeAltIcon,
    CheckCircleIcon,
    XCircleIcon,
    ArrowPathIcon,
    ShieldCheckIcon,
    InformationCircleIcon,
    ArrowLeftIcon,
    SparklesIcon,
    PencilIcon,
    DocumentTextIcon,
    ArrowRightIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import Image from "next/image";
import { NAV_CONSTANT } from "@/constants";
import { UserProfileDropdown } from "@/components/nav/UserProfileDropdown";
import { addCustomDomainToNetlify, verifyNetlifyDomainStatus, removeCustomDomainFromNetlify } from "@/services/netlify";
import { getSubdomainWithDomain, getSubdomainUrl, getMainDomain } from "@/utils/domain";
import { SiteSwitcher } from "@/components/dashboard/SiteSwitcher";

export const DomainsPage = () => {
    const router = useRouter();
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const { showSuccess, showError } = useToast();

    const [allSites, setAllSites] = useState<GeneratedSite[]>([]);
    const [activeSite, setActiveSite] = useState<GeneratedSite | null>(null);
    const [siteData, setSiteData] = useState<GeneratedSite | null>(null);
    const [loading, setLoading] = useState(true);
    const [domainInput, setDomainInput] = useState("");
    const [saving, setSaving] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [verificationData, setVerificationData] = useState<any>(null);

    // Load site data
    const loadSite = async () => {
        if (!user || !isAuthenticated) return;

        try {
            setLoading(true);
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
                if (active.customDomain) {
                    setDomainInput(active.customDomain);
                    // Auto-check status if domain exists
                    checkStatus(active.customDomain);
                }
            } else {
                showError("Please create a storefront first.");
                router.push("/dashboard");
            }
        } catch (error) {
            console.error("Error loading site:", error);
            showError("Failed to load website data");
        } finally {
            setLoading(false);
        }
    };

    // Handle site selection
    const handleSiteSelect = (site: GeneratedSite) => {
        setActiveSite(site);
        setSiteData(site);
        if (site.customDomain) {
            setDomainInput(site.customDomain);
            checkStatus(site.customDomain);
        } else {
            setDomainInput("");
            setVerificationData(null);
        }
        localStorage.setItem('active_storefront', site.subdomain);
    };

    useEffect(() => {
        loadSite();
    }, [user, isAuthenticated]);

    const checkStatus = async (domain: string) => {
        try {
            setVerifying(true);
            const status = await verifyNetlifyDomainStatus(domain);
            setVerificationData(status);

            // Update Firebase if verified status changed
            if (siteData && status.verified && siteData.domainVerification?.status !== 'verified') {
                const updatedSite = {
                    ...siteData,
                    domainVerification: {
                        status: 'verified' as const,
                        lastChecked: new Date(),
                    }
                };
                await saveGeneratedSiteToFirebase(updatedSite, user);
                setSiteData(updatedSite);
            }
        } catch (error) {
            console.error("Error verifying domain:", error);
        } finally {
            setVerifying(false);
        }
    };

    const handleAddDomain = async () => {
        if (!siteData || !user || !domainInput) return;

        // Basic validation
        const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;
        if (!domainRegex.test(domainInput)) {
            showError("Please enter a valid domain name (e.g., example.com)");
            return;
        }

        try {
            setSaving(true);

            // 1. Add to Netlify
            await addCustomDomainToNetlify(domainInput);

            // 2. Save to Firebase
            const updatedSite: GeneratedSite = {
                ...siteData,
                customDomain: domainInput,
                domainVerification: {
                    status: 'pending',
                    lastChecked: new Date(),
                }
            };

            await saveGeneratedSiteToFirebase(updatedSite, user);
            setSiteData(updatedSite);

            showSuccess("Domain added successfully! Now configure your DNS.");
            checkStatus(domainInput);
        } catch (error: any) {
            console.error("Error adding domain:", error);
            showError(error.message || "Failed to add domain");
        } finally {
            setSaving(false);
        }
    };


    // ... (previous state loading logic remains same, just replacing the render part)

    const handleRemoveDomain = async () => {
        if (!siteData?.customDomain) return;

        try {
            setSaving(true);
            await removeCustomDomainFromNetlify(siteData.customDomain);

            const updatedSite = {
                ...siteData,
                customDomain: undefined,
                domainVerification: undefined
            };

            await saveGeneratedSiteToFirebase(updatedSite, user);
            setSiteData(updatedSite as GeneratedSite);
            setDomainInput("");
            setVerificationData(null);
            showSuccess("Domain removed successfully");
        } catch (error: any) {
            console.error("Error removing domain:", error);
            showError("Failed to remove domain");
        } finally {
            setSaving(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    const isVerified = verificationData?.verified || siteData?.domainVerification?.status === 'verified';
    const hasDomain = !!siteData?.customDomain;

    const pages = siteData ? Object.keys(siteData.pages || {}) : [];

    return (
        <div className="py-4 max-w-7xl mx-auto space-y-8">
            {/* Header with Site Switcher */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="text-neutral-400 hover:text-neutral-900 transition-colors">
                        <ArrowLeftIcon className="w-6 h-6" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Domain Management</h1>
                        <p className="text-sm text-neutral-400 font-medium">Manage domains, editor, and pages for your storefronts.</p>
                    </div>
                </div>
                {allSites.length > 0 && (
                    <div className="w-full lg:w-80">
                        <SiteSwitcher
                            sites={allSites}
                            activeSite={activeSite}
                            onSelect={handleSiteSelect}
                            onCreateNew={() => router.push("/dashboard")}
                            canCreate={true}
                            maxSites={10}
                            onUpgrade={() => router.push('/dashboard/settings?tab=billing')}
                        />
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content - Domain & Editor */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Website Editor Card */}
                    {siteData && (
                        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
                            <div className="p-6 border-b border-neutral-50 flex items-center gap-4">
                                <div className="bg-blue-50 rounded-xl p-2.5">
                                    <PencilIcon className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-neutral-900 tracking-tighter">Website Editor</h2>
                                    <p className="text-sm text-neutral-500 font-medium">Visual drag-and-drop editor</p>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="bg-neutral-50 rounded-2xl border border-neutral-100 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                                    <div>
                                        <h3 className="text-lg font-black text-neutral-900 tracking-tight">{siteData.companyName}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                            <p className="text-sm text-neutral-500 font-mono font-medium">{getSubdomainWithDomain(siteData.subdomain)}</p>
                                        </div>
                                    </div>
                                    <Link href={`/editor?subdomain=${siteData.subdomain}`} className="w-full sm:w-auto">
                                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 font-black uppercase tracking-widest text-xs py-5 px-6 shadow-lg shadow-blue-100">
                                            <PencilIcon className="w-4 h-4" />
                                            Edit Site
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Pages Management Card */}
                    {siteData && (
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
                                {pages.length > 0 ? (
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
                                        <p className="text-neutral-400 font-medium italic">No pages available.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Custom Domain Card */}
                    <div className="bg-white rounded-[32px] border border-neutral-100 shadow-xl shadow-neutral-100/50 overflow-hidden">
                {!hasDomain ? (
                    // Empty State - Add Domain Form
                    <div className="p-10 text-center space-y-8">
                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
                            <GlobeAltIcon className="w-10 h-10 text-blue-600" />
                        </div>
                        <div className="space-y-2 max-w-md mx-auto">
                            <h2 className="text-2xl font-black text-neutral-900">Add your custom domain</h2>
                            <p className="text-neutral-500 font-medium text-sm">
                                Enter your domain name below (e.g. mystore.com) to start the connection process.
                            </p>
                        </div>

                        <div className="max-w-md mx-auto space-y-4">
                            <div className="relative">
                                <GlobeAltIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                                <Input
                                    name="domain"
                                    placeholder="yourdomain.com"
                                    value={domainInput}
                                    onChange={(e) => setDomainInput(e.target.value.toLowerCase())}
                                    className="pl-12 h-14 rounded-2xl border-neutral-200 text-lg font-bold"
                                />
                            </div>
                            <Button
                                onPress={handleAddDomain}
                                loading={saving}
                                className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-200"
                            >
                                Connect Domain
                            </Button>
                        </div>

                        <div className="pt-8 border-t border-neutral-100">
                            <p className="text-xs text-neutral-400 font-medium flex items-center justify-center gap-2">
                                <ShieldCheckIcon className="w-4 h-4" />
                                SSL Certificate included automatically
                            </p>
                        </div>
                    </div>
                ) : (
                    // Connected State
                    <div className="divide-y divide-neutral-100">
                        {/* Status Header */}
                        <div className="p-8 md:p-10 bg-neutral-50/50">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-black text-neutral-900">{siteData.customDomain}</h2>
                                    <div className="flex items-center gap-2">
                                        {isVerified ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-black uppercase tracking-widest border border-green-200">
                                                <CheckCircleIcon className="w-4 h-4" /> Verified
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-black uppercase tracking-widest border border-amber-200">
                                                <InformationCircleIcon className="w-4 h-4" /> Pending Configuration
                                            </span>
                                        )}
                                        <span className="text-xs text-neutral-400 font-mono">
                                            Last checked: {siteData.domainVerification?.lastChecked ? new Date(siteData.domainVerification.lastChecked as any).toLocaleTimeString() : 'Never'}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Button
                                        variant="light"
                                        onPress={() => checkStatus(siteData.customDomain!)}
                                        loading={verifying}
                                        className="h-10 px-4 bg-white border border-neutral-200 text-neutral-600 font-bold rounded-xl"
                                    >
                                        <ArrowPathIcon className="w-4 h-4 mr-2" />
                                        Refresh Status
                                    </Button>
                                    <Button
                                        variant="light"
                                        onPress={handleRemoveDomain}
                                        className="h-10 px-4 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100"
                                    >
                                        Remove
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Persistent DNS Configuration Card */}
                        <div className="p-8 md:p-10 border-b border-neutral-100 bg-white">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                                    <GlobeAltIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-neutral-900 text-lg">DNS Configuration</h3>
                                    <p className="text-sm text-neutral-500 max-w-lg">
                                        Use these settings to point the domain to your store. These records are required for the connection to work.
                                    </p>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <h4 className="text-xs font-black text-neutral-400 uppercase tracking-widest">CNAME Record (Root/@)</h4>
                                    <div className="p-4 bg-neutral-900 rounded-2xl text-white font-mono text-sm flex items-center justify-between group cursor-pointer" onClick={() => navigator.clipboard.writeText("storefronte.netlify.app")}>
                                        <span>storefronte.netlify.app</span>
                                        <span className="text-neutral-500 text-xs group-hover:text-white transition-colors">Copy</span>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <h4 className="text-xs font-black text-neutral-400 uppercase tracking-widest">CNAME Record (www)</h4>
                                    <div className="p-4 bg-neutral-900 rounded-2xl text-white font-mono text-sm flex items-center justify-between group cursor-pointer" onClick={() => navigator.clipboard.writeText("storefronte.netlify.app")}>
                                        <span>storefronte.netlify.app</span>
                                        <span className="text-neutral-500 text-xs group-hover:text-white transition-colors">Copy</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* DNS Instructions (Legacy block removed as it is replaced by persistent block above) */}

                        {/* Verified Success State */}
                        {isVerified && (
                            <div className="p-8 md:p-10 flex flex-col items-center justify-center text-center space-y-4">
                                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
                                    <SparklesIcon className="w-8 h-8 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-neutral-900">You're all set!</h3>
                                    <p className="text-neutral-500 font-medium max-w-md mx-auto mt-2">
                                        Your domain is active and serving traffic securely via HTTPS.
                                    </p>
                                </div>
                                <a
                                    href={`https://${siteData.customDomain}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 text-blue-600 font-bold hover:underline mt-4"
                                >
                                    Visit Website
                                    <ArrowLeftIcon className="w-4 h-4 rotate-180" />
                                </a>
                            </div>
                        )}
                    </div>
                )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Live Status Card */}
                        {siteData && (
                            <div className="bg-neutral-900 rounded-3xl shadow-2xl p-6 text-white overflow-hidden relative border border-white/5">
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="bg-white/10 rounded-xl p-2">
                                            <GlobeAltIcon className="w-5 h-5 text-blue-400" />
                                        </div>
                                        <h2 className="text-lg font-black tracking-tighter uppercase text-blue-400 tracking-widest text-xs">Live Status</h2>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-1">
                                            <p className="text-[10px] uppercase font-black text-white/40 tracking-widest">Public Address</p>
                                            <p className="text-sm font-bold text-white font-mono truncate bg-white/5 p-2 rounded-lg">
                                                {siteData.subdomain}.{getMainDomain()}
                                            </p>
                                        </div>

                                        <a
                                            href={getSubdomainUrl(siteData.subdomain)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-3 w-full py-4 px-6 bg-blue-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/40"
                                        >
                                            Visit My Store
                                            <ArrowRightIcon className="w-4 h-4" />
                                        </a>
                                    </div>
                                </div>
                                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-600/20 blur-3xl rounded-full"></div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
