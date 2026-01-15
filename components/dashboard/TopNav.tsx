import React, { useState, useEffect } from "react";
import { UserProfileDropdown } from "@/components/nav/UserProfileDropdown";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ecommerceApi } from "@/services/ecommerceApi";
import { SignalIcon, SignalSlashIcon } from "@heroicons/react/24/outline";

export const TopNav = () => {
    const { user } = useAuth();
    const pathname = usePathname();
    const [isOnline, setIsOnline] = useState<boolean | null>(null);

    useEffect(() => {
        const checkStatus = async () => {
            const status = await ecommerceApi.checkConnectivity();
            setIsOnline(status);
        };
        checkStatus();
        const interval = setInterval(checkStatus, 30000); // Check every 30s
        return () => clearInterval(interval);
    }, []);

    // Map pathname to breadcrumb/title
    const getPageTitle = () => {
        const parts = pathname.split("/").filter(Boolean);
        if (parts.length <= 1) return "Dashboard Overview";

        const lastPart = parts[parts.length - 1];
        return lastPart.charAt(0).toUpperCase() + lastPart.slice(1).replace(/-/g, " ");
    };

    return (
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-neutral-200">
            <div className="px-8 flex items-center justify-between h-20">
                <div>
                    <h1 className="text-xl font-black text-neutral-900 tracking-tighter">
                        {getPageTitle()}
                    </h1>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-50 rounded-xl border border-neutral-100">
                        {isOnline === null ? (
                            <div className="h-2 w-2 bg-neutral-300 rounded-full animate-pulse"></div>
                        ) : isOnline ? (
                            <div className="h-2 w-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                        ) : (
                            <div className="h-2 w-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                        )}
                        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                            {isOnline === null ? "Checking..." : isOnline ? "API Online" : "API Offline"}
                        </span>
                    </div>

                    <Link href="/">
                        <Button variant="light" size="sm" className="text-neutral-500 hover:text-blue-600 font-bold">
                            View Live Store
                        </Button>
                    </Link>

                    <div className="h-8 w-px bg-neutral-200"></div>

                    {user && (
                        <UserProfileDropdown
                            user={{
                                firstname: user.firstname || "",
                                lastname: user.lastname || "",
                                email: user.email || "",
                            }}
                        />
                    )}
                </div>
            </div>
        </header>
    );
};
