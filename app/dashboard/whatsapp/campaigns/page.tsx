"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useCampaigns } from "@/hooks";
import { useCreateCampaign, useRunCampaign } from "@/hooks/useWhatsApp";
import type { MarketingCampaign } from "@/types/whatsapp";
import { Button, Input, TextArea } from "@/components/ui";
import { useToast } from "@/hooks";
import {
  ArrowLeftIcon,
  PlusIcon,
  PlayIcon,
  ClockIcon,
  MegaphoneIcon,
} from "@heroicons/react/24/outline";

export default function WhatsAppCampaignsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const businessId = user?.business_id;
  
  // Get campaigns query
  const { data: campaignsData, isLoading: loading } = useCampaigns(businessId || 0);
  // Handle PaginatedResponse structure - campaigns can be in campaigns property or items property
  // PaginatedResponse has: campaigns?, items?, sessions?, pagination
  const campaigns: MarketingCampaign[] = campaignsData?.campaigns || campaignsData?.items || [];
  
  // Mutations
  const createCampaignMutation = useCreateCampaign();
  const runCampaignMutation = useRunCampaign(businessId || 0);
  
  const { showSuccess, showError } = useToast();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [running, setRunning] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    template_name: "",
    scheduled_at: "",
  });

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.template_name) {
      showError("Name and template name are required");
      return;
    }

    if (!businessId) {
      showError("Business ID is required");
      return;
    }

    setCreating(true);
    try {
      await createCampaignMutation.mutateAsync({
        business_id: businessId,
        name: formData.name,
        description: formData.description || undefined,
        template_name: formData.template_name,
        scheduled_at: formData.scheduled_at || undefined,
      });
      showSuccess("Campaign created successfully");
      setFormData({ name: "", description: "", template_name: "", scheduled_at: "" });
      setShowCreateModal(false);
    } catch (error: unknown) {
      showError(error instanceof Error ? error.message : "Failed to create campaign");
    } finally {
      setCreating(false);
    }
  };

  const handleRunCampaign = async (campaignId: string) => {
    if (!businessId) {
      showError("Business ID is required");
      return;
    }

    setRunning(campaignId);
    try {
      // Get phone number ID from user or settings - for now using a placeholder
      // You may need to get this from WhatsApp settings or number selection
      const phoneNumberId = ""; // TODO: Get from WhatsApp settings or number selection
      
      if (!phoneNumberId) {
        showError("Phone number ID is required. Please connect a WhatsApp number first.");
        setRunning(null);
        return;
      }

      await runCampaignMutation.mutateAsync({
        campaignId: parseInt(campaignId),
        phoneNumberId,
      });
      showSuccess("Campaign started successfully");
    } catch (error: unknown) {
      showError(error instanceof Error ? error.message : "Failed to run campaign");
    } finally {
      setRunning(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Marketing Campaigns</h1>
            <p className="text-gray-600">Create and manage WhatsApp marketing campaigns</p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Create Campaign
          </Button>
        </div>
      </div>

      {/* Campaigns List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading campaigns...</p>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <MegaphoneIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No campaigns yet</h3>
          <p className="text-gray-500 mb-6">Create your first WhatsApp marketing campaign</p>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Create Campaign
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{campaign.name}</h3>
                  <p className="text-sm text-gray-600 mb-3 whitespace-pre-wrap">
                    {campaign.description || campaign.template_name || "No description"}
                  </p>
                  {campaign.template_components && campaign.template_components.length > 0 && (
                    <div className="text-sm text-gray-500">
                      Template: {campaign.template_name}
                    </div>
                  )}
                </div>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
                  {campaign.status}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Sent</p>
                  <p className="text-lg font-semibold text-gray-900">{campaign.sent_count || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Delivered</p>
                  <p className="text-lg font-semibold text-green-600">{campaign.delivered_count || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Failed</p>
                  <p className="text-lg font-semibold text-red-600">{campaign.failed_count || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Target</p>
                  <p className="text-lg font-semibold text-blue-600">{campaign.target_count || 0}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Created {new Date(campaign.created_at).toLocaleDateString()}
                  {campaign.scheduled_at && (
                    <span className="ml-4">
                      <ClockIcon className="w-4 h-4 inline mr-1" />
                      Scheduled: {new Date(campaign.scheduled_at).toLocaleString()}
                    </span>
                  )}
                </div>
                {(campaign.status === 'draft' || campaign.status === 'scheduled') && (
                  <Button
                    onClick={() => handleRunCampaign(String(campaign.id))}
                    className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                    loading={running === String(campaign.id)}
                  >
                    <PlayIcon className="w-4 h-4" />
                    Run Now
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create Campaign</h2>
            <form onSubmit={handleCreateCampaign}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Campaign Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="campaign_name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Summer Sale 2024"
                    required
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <TextArea
                    name="description"
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Campaign description..."
                    rows={4}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Template Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="template_name"
                    type="text"
                    value={formData.template_name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, template_name: e.target.value }))}
                    placeholder="summer_sale_2024"
                    required
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    WhatsApp template name (must be approved by Meta)
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Schedule Time (Optional)
                  </label>
                  <Input
                    name="scheduled_at"
                    type="datetime-local"
                    value={formData.scheduled_at}
                    onChange={(e) => setFormData((prev) => ({ ...prev, scheduled_at: e.target.value }))}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty to run immediately
                  </p>
                </div>
              </div>
              <div className="mt-6 flex gap-4">
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                  loading={creating}
                >
                  Create Campaign
                </Button>
                <Button
                  type="button"
                  variant="bordered"
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormData({ name: "", description: "", template_name: "", scheduled_at: "" });
                  }}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
