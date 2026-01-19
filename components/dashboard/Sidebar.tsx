"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    HomeIcon,
    ShoppingCartIcon,
    CubeIcon,
    GlobeAltIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    TagIcon,
    ViewColumnsIcon,
    QueueListIcon,
    ScaleIcon,
    QrCodeIcon,
    CloudArrowUpIcon,
    BellIcon,
    ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui";
import { NAV_CONSTANT } from "@/constants";

interface NavItemProps {
    href: string;
    icon: any;
    label: string;
    active?: boolean;
    hasSubmenu?: boolean;
    isOpen?: boolean;
    onClick?: () => void;
}

const NavItem = ({ href, icon: Icon, label, active, hasSubmenu, isOpen, onClick }: NavItemProps) => {
    const Component = hasSubmenu ? "button" : Link;
    const body = (
        <>
            <div className={`p-2 rounded-xl transition-colors ${active ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "bg-neutral-50 text-neutral-400 group-hover:text-blue-600 group-hover:bg-blue-50"}`}>
                <Icon className="w-5 h-5" />
            </div>
            <span className={`font-bold text-sm tracking-tight ${active ? "text-neutral-900" : "text-neutral-600 group-hover:text-blue-600"}`}>
                {label}
            </span>
            {hasSubmenu && (
                <div className="ml-auto">
                    {isOpen ? <ChevronUpIcon className="w-4 h-4 text-neutral-400" /> : <ChevronDownIcon className="w-4 h-4 text-neutral-400" />}
                </div>
            )}
        </>
    );

    const commonClass = `flex items-center gap-3 w-full px-4 py-3 rounded-2xl transition-all group ${active && !hasSubmenu ? "bg-blue-50/50" : "hover:bg-neutral-50"}`;

    if (hasSubmenu) {
        return (
            <button onClick={onClick} className={commonClass}>
                {body}
            </button>
        );
    }

    return (
        <Link href={href} className={commonClass}>
            {body}
        </Link>
    );
};

export const Sidebar = () => {
    const pathname = usePathname();
    const [productsOpen, setProductsOpen] = useState(pathname.startsWith("/dashboard/products"));

    const navItems = [
        { href: "/dashboard", icon: HomeIcon, label: "Dashboard" },
        { href: "/dashboard/sales", icon: ShoppingCartIcon, label: "Sales Orders" },
    ];

    const productSubmenu = [
        { href: "/dashboard/products", icon: QueueListIcon, label: "All Products" },
        { href: "/dashboard/products/categories", icon: TagIcon, label: "Categories" },
        { href: "/dashboard/products/variations", icon: ViewColumnsIcon, label: "Variations" },
        { href: "/dashboard/products/brands", icon: GlobeAltIcon, label: "Brands" },
        { href: "/dashboard/products/units", icon: ScaleIcon, label: "Units" },
        { href: "/dashboard/products/import", icon: CloudArrowUpIcon, label: "Bulk Import" },
    ];

    return (
        <aside className="hidden lg:flex w-72 bg-white border-r border-neutral-200 h-screen sticky top-0 flex-col p-6 overflow-y-auto no-scrollbar">
            <div className="mb-10 px-2">
                <Link href="/dashboard">
                    <img src={NAV_CONSTANT.LOGOS.dark} alt="Logo" className="h-10 w-auto" />
                </Link>
            </div>

            <nav className="flex-1 space-y-2">
                <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-4 mb-2">Main Menu</div>
                {navItems.map((item) => (
                    <NavItem
                        key={item.href}
                        href={item.href}
                        icon={item.icon}
                        label={item.label}
                        active={pathname === item.href}
                    />
                ))}

                <div className="pt-4">
                    <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-4 mb-2">Inventory</div>
                    <NavItem
                        href="/dashboard/products"
                        icon={CubeIcon}
                        label="Products"
                        active={pathname.startsWith("/dashboard/products")}
                        hasSubmenu
                        isOpen={productsOpen}
                        onClick={() => setProductsOpen(!productsOpen)}
                    />

                    {productsOpen && (
                        <div className="mt-2 ml-4 pl-4 border-l-2 border-neutral-100 space-y-1">
                            {productSubmenu.map((sub) => (
                                <Link
                                    key={sub.href}
                                    href={sub.href}
                                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all group ${pathname === sub.href ? "bg-blue-50 text-blue-600" : "hover:bg-neutral-50 text-neutral-500 hover:text-blue-600"}`}
                                >
                                    <sub.icon className="w-4 h-4" />
                                    <span className="font-bold text-xs">{sub.label}</span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                <div className="pt-4">
                    <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-4 mb-2">Marketing</div>
                    <NavItem
                        href="/dashboard/whatsapp"
                        icon={ChatBubbleLeftRightIcon}
                        label="WhatsApp"
                        active={pathname.startsWith("/dashboard/whatsapp")}
                    />
                </div>

                <div className="pt-4">
                    <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-4 mb-2">Settings</div>
                    <NavItem
                        href="/dashboard/domains"
                        icon={GlobeAltIcon}
                        label="Domains"
                        active={pathname === "/dashboard/domains"}
                    />
                    <NavItem
                        href="/dashboard/settings/notifications"
                        icon={BellIcon}
                        label="Notifications"
                        active={pathname === "/dashboard/settings/notifications"}
                    />
                </div>
            </nav>

            <div className="mt-auto pt-10">
                <div className="bg-neutral-900 rounded-3xl p-5 text-white relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Upgrade Plan</p>
                        <p className="text-xs font-bold mb-4 text-white/80">Get unlimited products & sales.</p>
                        <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-[10px] py-4 rounded-xl shadow-xl shadow-blue-900/20 transition-transform active:scale-95">
                            Learn More
                        </Button>
                    </div>
                    <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-blue-600/20 blur-2xl rounded-full transition-all group-hover:scale-150"></div>
                </div>
            </div>
        </aside>
    );
};
