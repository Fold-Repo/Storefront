'use client';

import React from 'react';
import { GeneratedSite } from '@/services/firebase';
import {
    GlobeAltIcon,
    CheckCircleIcon,
    PlusIcon,
    ArrowUpIcon,
    ChevronDownIcon
} from '@heroicons/react/24/outline';
import { getSubdomainWithDomain } from '@/utils/domain';

interface SiteSwitcherProps {
    sites: GeneratedSite[];
    activeSite: GeneratedSite | null;
    onSelect: (site: GeneratedSite) => void;
    onCreateNew: () => void;
    canCreate: boolean;
    maxSites: number;
    onUpgrade: () => void;
}

export const SiteSwitcher: React.FC<SiteSwitcherProps> = ({
    sites,
    activeSite,
    onSelect,
    onCreateNew,
    canCreate,
    maxSites,
    onUpgrade,
}) => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <div className="relative">
            {/* Dropdown Trigger */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 px-4 py-3 bg-white border border-neutral-200 rounded-xl hover:border-blue-400 transition-colors w-full"
            >
                <div className="bg-blue-50 p-2 rounded-lg">
                    <GlobeAltIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 text-left min-w-0">
                    {activeSite ? (
                        <>
                            <p className="font-bold text-neutral-900 truncate">{activeSite.companyName}</p>
                            <p className="text-xs text-neutral-400 font-mono truncate">
                                {getSubdomainWithDomain(activeSite.subdomain)}
                            </p>
                        </>
                    ) : (
                        <p className="text-neutral-400 font-medium">Select a storefront</p>
                    )}
                </div>
                <ChevronDownIcon className={`w-5 h-5 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-neutral-200 rounded-xl shadow-xl z-50 overflow-hidden">
                        {/* Sites List */}
                        <div className="max-h-64 overflow-y-auto">
                            {sites.length === 0 ? (
                                <div className="p-4 text-center text-neutral-400 text-sm">
                                    No storefronts yet
                                </div>
                            ) : (
                                sites.map((site) => (
                                    <button
                                        key={site.subdomain}
                                        onClick={() => {
                                            onSelect(site);
                                            setIsOpen(false);
                                        }}
                                        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors ${activeSite?.subdomain === site.subdomain ? 'bg-blue-50' : ''
                                            }`}
                                    >
                                        <div className={`p-1.5 rounded-lg ${activeSite?.subdomain === site.subdomain ? 'bg-blue-100' : 'bg-neutral-100'
                                            }`}>
                                            <GlobeAltIcon className={`w-4 h-4 ${activeSite?.subdomain === site.subdomain ? 'text-blue-600' : 'text-neutral-400'
                                                }`} />
                                        </div>
                                        <div className="flex-1 text-left min-w-0">
                                            <p className="font-semibold text-neutral-900 text-sm truncate">{site.companyName}</p>
                                            <p className="text-xs text-neutral-400 font-mono truncate">{site.subdomain}</p>
                                        </div>
                                        {activeSite?.subdomain === site.subdomain && (
                                            <CheckCircleIcon className="w-5 h-5 text-blue-600" />
                                        )}
                                    </button>
                                ))
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div className="border-t border-neutral-100 p-2">
                            {canCreate ? (
                                <button
                                    onClick={() => {
                                        onCreateNew();
                                        setIsOpen(false);
                                    }}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors"
                                >
                                    <PlusIcon className="w-4 h-4" />
                                    Create New Storefront
                                </button>
                            ) : (
                                <button
                                    onClick={() => {
                                        onUpgrade();
                                        setIsOpen(false);
                                    }}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity"
                                >
                                    <ArrowUpIcon className="w-4 h-4" />
                                    Upgrade to Create More ({sites.length}/{maxSites})
                                </button>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default SiteSwitcher;
