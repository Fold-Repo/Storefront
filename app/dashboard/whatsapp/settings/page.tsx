"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useWhatsAppSettings, useUpdateSettings } from "@/hooks/useWhatsApp";
import { useToast } from "@/hooks";
import { SettingsForm } from "@/components/whatsapp/SettingsForm";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default function WhatsAppSettingsPage() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const businessId = user?.business_id;

  const { data: settings, isLoading } = useWhatsAppSettings(businessId || 0);
  const updateMutation = useUpdateSettings(businessId || 0);

  if (!businessId) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-yellow-800">Please set up your business first to use WhatsApp Commerce.</p>
        </div>
      </div>
    );
  }

  const handleSave = async (data: any) => {
    try {
      await updateMutation.mutateAsync(data);
      showSuccess("Settings saved successfully!");
    } catch (error: any) {
      showError(error.response?.data?.message || "Failed to save settings");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto pb-8 sm:pb-12 lg:pb-20 p-4 sm:p-6">
      <Link href="/dashboard/whatsapp" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 sm:mb-6 text-sm sm:text-base">
        <ArrowLeftIcon className="w-4 h-4 sm:w-5 sm:h-5" />
        <span>Back to WhatsApp Commerce</span>
      </Link>

      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">WhatsApp Commerce Settings</h1>
        <p className="text-sm sm:text-base text-gray-600">Configure how your WhatsApp Commerce works</p>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-xl"></div>
        </div>
      ) : (
        <SettingsForm
          settings={settings}
          onSubmit={handleSave}
          isLoading={updateMutation.isPending}
        />
      )}
    </div>
  );
}
