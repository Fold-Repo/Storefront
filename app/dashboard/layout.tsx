"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { MobileSidebar } from "@/components/dashboard/MobileSidebar";
import { TopNav } from "@/components/dashboard/TopNav";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="flex h-screen bg-neutral-50 overflow-hidden font-inter">
            {/* Desktop Sidebar - Hidden on mobile */}
            <Sidebar />
            
            {/* Mobile Sidebar - Only visible on mobile when open */}
            <MobileSidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
            
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden w-full lg:w-auto">
                <TopNav onMenuClick={() => setMobileMenuOpen(true)} />
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 no-scrollbar">
                    <div className="max-w-7xl mx-auto w-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
