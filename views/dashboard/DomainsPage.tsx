"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { loadGeneratedSiteFromFirebase, saveGeneratedSiteToFirebase, GeneratedSite } from "@/services/firebase";
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
    SparklesIcon
} from "@heroicons/react/24/outline";
import Link from "next/link";
import Image from "next/image";
import { NAV_CONSTANT } from "@/constants";
import { UserProfileDropdown } from "@/components/nav/UserProfileDropdown";
import { addCustomDomainToVercel, verifyCustomDomainStatus, removeCustomDomainFromVercel } from "@/services/vercel";

export const DomainsPage = () => {
    const router = useRouter();
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const { showSuccess, showError } = useToast();

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
            const site = await loadGeneratedSiteFromFirebase(user);

            if (site) {
                setSiteData(site);
                if (site.customDomain) {
                    setDomainInput(site.customDomain);
                    // Auto-check status if domain exists
                    checkStatus(site.customDomain);
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

    useEffect(() => {
        loadSite();
    }, [user, isAuthenticated]);

    const checkStatus = async (domain: string) => {
        try {
            setVerifying(true);
            const status = await verifyCustomDomainStatus(domain);
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

            // 1. Add to Vercel
            await addCustomDomainToVercel(domainInput);

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
            await removeCustomDomainFromVercel(siteData.customDomain);

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

    return (
        <div className="py-4 max-w-4xl mx-auto space-y-8">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/dashboard" className="text-neutral-400 hover:text-neutral-900 transition-colors">
                    <ArrowLeftIcon className="w-6 h-6" />
                </Link>
                <div>
                    <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Custom Domain</h1>
                    <p className="text-sm text-neutral-400 font-medium">Connect your own domain to build your brand.</p>
                </div>
            </div>

            {/* Main Content Card */}
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

                        {/* DNS Instructions */}
                        {!isVerified && (
                            <div className="p-8 md:p-10 space-y-6">
                                <div className="flex items-start gap-4 p-5 bg-blue-50 rounded-2xl border border-blue-100">
                                    <InformationCircleIcon className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-blue-900">Configuration Required</h3>
                                        <p className="text-sm text-blue-700 leading-relaxed">
                                            To connect your domain, sign in to your domain provider (like GoDaddy or Namecheap) and add the following records to your DNS settings.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <h4 className="text-xs font-black text-neutral-400 uppercase tracking-widest">A Record (Root Domain)</h4>
                                        <div className="p-4 bg-neutral-900 rounded-2xl text-white font-mono text-sm flex items-center justify-between group cursor-pointer" onClick={() => navigator.clipboard.writeText("76.76.21.21")}>
                                            <span>76.76.21.21</span>
                                            <span className="text-neutral-500 text-xs group-hover:text-white transition-colors">Copy</span>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <h4 className="text-xs font-black text-neutral-400 uppercase tracking-widest">CNAME Record (www)</h4>
                                        <div className="p-4 bg-neutral-900 rounded-2xl text-white font-mono text-sm flex items-center justify-between group cursor-pointer" onClick={() => navigator.clipboard.writeText("cname.vercel-dns.com")}>
                                            <span>cname.vercel-dns.com</span>
                                            <span className="text-neutral-500 text-xs group-hover:text-white transition-colors">Copy</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

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
        </div>
    );
};
