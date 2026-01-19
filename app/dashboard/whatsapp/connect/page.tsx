"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useWhatsAppNumbers, useConnectNumber, useUpdateNumberToken, useDeleteNumber } from "@/hooks/useWhatsApp";
import type { ConnectNumberInput } from "@/types/whatsapp";
import { useToast } from "@/hooks";
import { Button } from "@/components/ui";
import { ConnectNumberForm } from "@/components/whatsapp/ConnectNumberForm";
import { ConnectedNumbersList } from "@/components/whatsapp/ConnectedNumbersList";
import { WebhookInstructions } from "@/components/whatsapp/WebhookInstructions";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default function ConnectWhatsAppPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const businessId = user?.business_id;

  const { data: numbers, isLoading } = useWhatsAppNumbers(businessId || 0);
  const connectMutation = useConnectNumber(businessId || 0);
  const updateTokenMutation = useUpdateNumberToken(businessId || 0);
  const deleteMutation = useDeleteNumber(businessId || 0);

  const [showInstructions, setShowInstructions] = useState(false);

  if (!businessId) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-yellow-800">Please set up your business first to use WhatsApp Commerce.</p>
        </div>
      </div>
    );
  }

  const handleConnect = async (data: ConnectNumberInput) => {
    try {
      await connectMutation.mutateAsync(data);
      showSuccess("WhatsApp number connected successfully!");
      router.push("/dashboard/whatsapp");
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      showError(message || "Failed to connect WhatsApp number");
    }
  };

  const handleUpdateToken = async (id: number, accessToken: string) => {
    try {
      await updateTokenMutation.mutateAsync({ id, accessToken });
      showSuccess("Access token updated successfully!");
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      showError(message || "Failed to update access token");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to disconnect this WhatsApp number?")) return;
    
    try {
      await deleteMutation.mutateAsync(id);
      showSuccess("WhatsApp number disconnected successfully!");
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      showError(message || "Failed to disconnect WhatsApp number");
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20 p-6">
      {/* Header */}
      <div className="mb-8">
        <Link href="/dashboard/whatsapp" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Back to WhatsApp Commerce</span>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Connect WhatsApp Number</h1>
        <p className="text-gray-600">Connect your WhatsApp Business number to start selling via WhatsApp</p>
      </div>

      {/* Instructions Toggle */}
      <div className="mb-6">
        <Button
          variant="light"
          onClick={() => setShowInstructions(!showInstructions)}
          className="text-blue-600"
        >
          {showInstructions ? "Hide" : "Show"} Setup Instructions
        </Button>
      </div>

      {showInstructions && (
        <div className="mb-8">
          <WebhookInstructions />
        </div>
      )}

      {/* Connected Numbers */}
      {numbers && numbers.length > 0 && (
        <div className="mb-8">
          <ConnectedNumbersList
            numbers={numbers}
            onUpdateToken={handleUpdateToken}
            onDelete={handleDelete}
            isLoading={updateTokenMutation.isPending || deleteMutation.isPending}
          />
        </div>
      )}

      {/* Connect Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
          {numbers && numbers.length > 0 ? "Connect Another Number" : "Connect Your First Number"}
        </h2>
        <ConnectNumberForm
          onSubmit={handleConnect}
          isLoading={connectMutation.isPending}
        />
      </div>
    </div>
  );
}
