"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useCampaigns } from "@/hooks";
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
  const { campaigns, createCampaign, runCampaign, loading } = useCampaigns(user?.business_id || null);
  const { showSuccess, showError } = useToast();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [running, setRunning] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    message_template: "",
    offer_link: "",
    schedule_time: "",
  });

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.message_template) {
      showError("Name and message template are required");
      return;
    }

    setCreating(true);
    try {
      await createCampaign({
        name: formData.name,
        message_template: formData.message_template,
        offer_link: formData.offer_link || undefined,
        schedule_time: formData.schedule_time || undefined,
      });
      setFormData({ name: "", message_template: "", offer_link: "", schedule_time: "" });
      setShowCreateModal(false);
    } catch (error) {
      // Error is already handled in the hook
    } finally {
      setCreating(false);
    }
  };

  const handleRunCampaign = async (campaignId: string) => {
    setRunning(campaignId);
    try {
      await runCampaign(campaignId);
    } catch (error) {
      // Error is already handled in the hook
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
              key={campaign.campaign_id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{campaign.name}</h3>
                  <p className="text-sm text-gray-600 mb-3 whitespace-pre-wrap">{campaign.message_template}</p>
                  {campaign.offer_link && (
                    <a
                      href={campaign.offer_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      {campaign.offer_link}
                    </a>
                  )}
                </div>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
                  {campaign.status}
                </span>
              </div>

              {campaign.results && (
                <div className="grid grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Sent</p>
                    <p className="text-lg font-semibold text-gray-900">{campaign.results.sent}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Delivered</p>
                    <p className="text-lg font-semibold text-green-600">{campaign.results.delivered}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Failed</p>
                    <p className="text-lg font-semibold text-red-600">{campaign.results.failed}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Opt Out</p>
                    <p className="text-lg font-semibold text-yellow-600">{campaign.results.opt_out}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Created {new Date(campaign.created_at).toLocaleDateString()}
                  {campaign.schedule_time && (
                    <span className="ml-4">
                      <ClockIcon className="w-4 h-4 inline mr-1" />
                      Scheduled: {new Date(campaign.schedule_time).toLocaleString()}
                    </span>
                  )}
                </div>
                {campaign.status === 'draft' && (
                  <Button
                    onClick={() => handleRunCampaign(campaign.campaign_id)}
                    className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                    loading={running === campaign.campaign_id}
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
                    Message Template <span className="text-red-500">*</span>
                  </label>
                  <TextArea
                    value={formData.message_template}
                    onChange={(e) => setFormData((prev) => ({ ...prev, message_template: e.target.value }))}
                    placeholder="Hi! Check out our amazing summer sale..."
                    required
                    rows={6}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use {`{name}`} for personalization
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Offer Link (Optional)
                  </label>
                  <Input
                    type="url"
                    value={formData.offer_link}
                    onChange={(e) => setFormData((prev) => ({ ...prev, offer_link: e.target.value }))}
                    placeholder="https://yourstore.com/sale"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Schedule Time (Optional)
                  </label>
                  <Input
                    type="datetime-local"
                    value={formData.schedule_time}
                    onChange={(e) => setFormData((prev) => ({ ...prev, schedule_time: e.target.value }))}
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
                    setFormData({ name: "", message_template: "", offer_link: "", schedule_time: "" });
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
