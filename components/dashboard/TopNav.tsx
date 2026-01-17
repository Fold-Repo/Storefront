import React, { useState, useEffect } from "react";
import { UserProfileDropdown } from "@/components/nav/UserProfileDropdown";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignalIcon, SignalSlashIcon } from "@heroicons/react/24/outline";

export const TopNav = () => {
    const { user } = useAuth();
    const pathname = usePathname();

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
