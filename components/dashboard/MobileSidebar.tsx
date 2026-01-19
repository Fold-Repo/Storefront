"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { XMarkIcon } from "@heroicons/react/24/outline";
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
    CloudArrowUpIcon,
    BellIcon,
    ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import { NAV_CONSTANT } from "@/constants";

interface MobileSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

interface NavItemProps {
    href: string;
    icon: any;
    label: string;
    active?: boolean;
    onClick?: () => void;
}

const NavItem = ({ href, icon: Icon, label, active, onClick }: NavItemProps) => {
    return (
        <Link
            href={href}
            onClick={onClick}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-2xl transition-all ${
                active ? "bg-blue-50 text-blue-600" : "text-neutral-600 hover:bg-neutral-50"
            }`}
        >
            <div className={`p-2 rounded-xl transition-colors ${
                active ? "bg-blue-600 text-white" : "bg-neutral-50 text-neutral-400"
            }`}>
                <Icon className="w-5 h-5" />
            </div>
            <span className="font-bold text-sm tracking-tight">{label}</span>
        </Link>
    );
};

export const MobileSidebar: React.FC<MobileSidebarProps> = ({ isOpen, onClose }) => {
    const pathname = usePathname();
    const [productsOpen, setProductsOpen] = React.useState(pathname.startsWith("/dashboard/products"));

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

    // Close sidebar when clicking outside or on a link
    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Sidebar */}
            <aside className="fixed top-0 left-0 h-screen w-72 bg-white border-r border-neutral-200 z-50 flex flex-col overflow-y-auto lg:hidden transform transition-transform duration-300 ease-in-out">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-neutral-200">
                    <Link href="/dashboard" onClick={onClose}>
                        <img src={NAV_CONSTANT.LOGOS.dark} alt="Logo" className="h-10 w-auto" />
                    </Link>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
                        aria-label="Close menu"
                    >
                        <XMarkIcon className="w-6 h-6 text-neutral-600" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-6 space-y-2">
                    <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-4 mb-2">
                        Main Menu
                    </div>
                    {navItems.map((item) => (
                        <NavItem
                            key={item.href}
                            href={item.href}
                            icon={item.icon}
                            label={item.label}
                            active={pathname === item.href}
                            onClick={onClose}
                        />
                    ))}

                    <div className="pt-4">
                        <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-4 mb-2">
                            Inventory
                        </div>
                        <button
                            onClick={() => setProductsOpen(!productsOpen)}
                            className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl transition-all hover:bg-neutral-50"
                        >
                            <div className={`p-2 rounded-xl transition-colors ${
                                pathname.startsWith("/dashboard/products")
                                    ? "bg-blue-600 text-white"
                                    : "bg-neutral-50 text-neutral-400"
                            }`}>
                                <CubeIcon className="w-5 h-5" />
                            </div>
                            <span className="font-bold text-sm tracking-tight text-neutral-600">Products</span>
                            <div className="ml-auto">
                                {productsOpen ? (
                                    <ChevronUpIcon className="w-4 h-4 text-neutral-400" />
                                ) : (
                                    <ChevronDownIcon className="w-4 h-4 text-neutral-400" />
                                )}
                            </div>
                        </button>

                        {productsOpen && (
                            <div className="mt-2 ml-4 pl-4 border-l-2 border-neutral-100 space-y-1">
                                {productSubmenu.map((sub) => (
                                    <Link
                                        key={sub.href}
                                        href={sub.href}
                                        onClick={onClose}
                                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                                            pathname === sub.href
                                                ? "bg-blue-50 text-blue-600"
                                                : "hover:bg-neutral-50 text-neutral-500 hover:text-blue-600"
                                        }`}
                                    >
                                        <sub.icon className="w-4 h-4" />
                                        <span className="font-bold text-xs">{sub.label}</span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="pt-4">
                        <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-4 mb-2">
                            Marketing
                        </div>
                        <NavItem
                            href="/dashboard/whatsapp"
                            icon={ChatBubbleLeftRightIcon}
                            label="WhatsApp"
                            active={pathname.startsWith("/dashboard/whatsapp")}
                            onClick={onClose}
                        />
                    </div>

                    <div className="pt-4">
                        <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-4 mb-2">
                            Settings
                        </div>
                        <NavItem
                            href="/dashboard/domains"
                            icon={GlobeAltIcon}
                            label="Domains"
                            active={pathname === "/dashboard/domains"}
                            onClick={onClose}
                        />
                        <NavItem
                            href="/dashboard/settings/notifications"
                            icon={BellIcon}
                            label="Notifications"
                            active={pathname === "/dashboard/settings/notifications"}
                            onClick={onClose}
                        />
                    </div>
                </nav>
            </aside>
        </>
    );
};
