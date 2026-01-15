"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui";
import { useToast } from "@/hooks/useToast";
import {
    BellIcon,
    EnvelopeIcon,
    ChatBubbleLeftRightIcon,
    DevicePhoneMobileIcon,
    ArrowPathIcon,
} from "@heroicons/react/24/outline";

export default function NotificationsSettingsPage() {
    const { showSuccess, showError } = useToast();
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        order_confirmation: true,
        shipping_updates: true,
        low_stock_alerts: false,
        marketing_emails: false,
        sms_notifications: false,
    });

    const handleToggle = (key: keyof typeof settings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 800));
            showSuccess("Notification preferences saved");
        } catch (error) {
            showError("Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <div className="mb-10">
                <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Notification Settings</h1>
                <p className="text-sm text-neutral-400 font-medium">Configure how you and your customers receive updates.</p>
            </div>

            <div className="space-y-8">
                {/* Email Notifications */}
                <section className="bg-white p-10 rounded-[40px] border border-neutral-100 shadow-xl shadow-neutral-100/50 space-y-8">
                    <div className="flex items-center gap-3 pb-6 border-b border-neutral-50">
                        <div className="p-2.5 bg-blue-50 rounded-2xl">
                            <EnvelopeIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <h2 className="text-xl font-black text-neutral-900 tracking-tight">Email Channels</h2>
                    </div>

                    <div className="space-y-6">
                        {[
                            { id: 'order_confirmation', title: 'Order Confirmations', desc: 'Automatically send receipts to customers after purchase.' },
                            { id: 'shipping_updates', title: 'Shipping Updates', desc: 'Notify customers when tracking info is added or status changes.' },
                            { id: 'low_stock_alerts', title: 'Low Stock Alerts', desc: 'Receive internal emails when products reach alert thresholds.' },
                            { id: 'marketing_emails', title: 'Marketing Newsletters', desc: 'Allow automated promotional campaigns for new arrivals.' },
                        ].map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-6 bg-neutral-50/50 rounded-3xl border border-neutral-50 group hover:bg-white hover:border-blue-100 transition-all">
                                <div className="space-y-1">
                                    <h3 className="font-black text-neutral-900 leading-tight">{item.title}</h3>
                                    <p className="text-xs text-neutral-400 font-medium">{item.desc}</p>
                                </div>
                                <button
                                    onClick={() => handleToggle(item.id as any)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${settings[item.id as keyof typeof settings] ? 'bg-blue-600' : 'bg-neutral-200'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings[item.id as keyof typeof settings] ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* SMS & Messaging */}
                <section className="bg-white p-10 rounded-[40px] border border-neutral-100 shadow-xl shadow-neutral-100/50 space-y-8 opacity-60">
                    <div className="flex items-center justify-between pb-6 border-b border-neutral-50">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-purple-50 rounded-2xl">
                                <DevicePhoneMobileIcon className="w-6 h-6 text-purple-600" />
                            </div>
                            <h2 className="text-xl font-black text-neutral-900 tracking-tight">SMS & WhatsApp</h2>
                        </div>
                        <span className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-[10px] font-black uppercase tracking-widest">Coming Soon</span>
                    </div>

                    <div className="flex items-center justify-between p-6 bg-neutral-50/50 rounded-3xl border border-neutral-50">
                        <div className="space-y-1">
                            <h3 className="font-black text-neutral-900 leading-tight italic">Direct Merchant Updates</h3>
                            <p className="text-xs text-neutral-400 font-medium">Get real-time sales alerts on your mobile device.</p>
                        </div>
                        <button disabled className="relative inline-flex h-6 w-11 items-center rounded-full bg-neutral-200 cursor-not-allowed">
                            <span className="inline-block h-4 w-4 transform translate-x-1 rounded-full bg-white transition-opacity opacity-50" />
                        </button>
                    </div>
                </section>

                {/* Submit */}
                <div className="flex items-center justify-end gap-6 pt-10 border-t border-neutral-100">
                    <Button
                        onPress={handleSave}
                        loading={saving}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-12 h-14 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-blue-200/50"
                    >
                        Save Preferences
                    </Button>
                </div>
            </div>
        </div>
    );
}
