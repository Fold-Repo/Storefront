"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useWhatsAppOverview } from "@/hooks/useWhatsApp";
import { Button } from "@/components/ui";
import {
  ChatBubbleLeftRightIcon,
  PlusIcon,
  Cog6ToothIcon,
  MegaphoneIcon,
  ListBulletIcon,
  CheckCircleIcon,
  XCircleIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";
import { ConnectionStatusCard } from "@/components/whatsapp/ConnectionStatusCard";
import { StatsCards } from "@/components/whatsapp/StatsCards";
import { RecentConversationsTable } from "@/components/whatsapp/RecentConversationsTable";

export default function WhatsAppOverviewPage() {
  const router = useRouter();
  const { user } = useAuth();
  const businessId = user?.business_id;

  const { data: overview, isLoading, error } = useWhatsAppOverview(businessId || 0);

  if (!businessId) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-yellow-800">Please set up your business first to use WhatsApp Commerce.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-800">Failed to load WhatsApp overview. Please try again.</p>
        </div>
      </div>
    );
  }

  const stats = overview?.stats || {
    active_sessions: 0,
    sessions_today: 0,
    sales_today: 0,
    revenue_today: 0,
  };

  return (
    <div className="w-full max-w-7xl mx-auto pb-8 sm:pb-12 lg:pb-20 p-4 sm:p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">WhatsApp Commerce</h1>
        <p className="text-gray-600">Manage your WhatsApp business integration and customer conversations</p>
      </div>

      {/* Connection Status */}
      <div className="mb-8">
        <ConnectionStatusCard connectedNumber={overview?.connected_number} isConnected={overview?.is_connected} />
      </div>

      {/* Stats Cards */}
      <div className="mb-6 sm:mb-8">
        <StatsCards stats={stats} />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Link href="/dashboard/whatsapp/connect">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2">
              <PlusIcon className="w-5 h-5" />
              Connect Number
            </Button>
          </Link>
          <Link href="/dashboard/whatsapp/campaigns">
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2">
              <MegaphoneIcon className="w-5 h-5" />
              Create Campaign
            </Button>
          </Link>
          <Link href="/dashboard/whatsapp/conversations">
            <Button variant="bordered" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2">
              <ListBulletIcon className="w-5 h-5" />
              View Conversations
            </Button>
          </Link>
          <Link href="/dashboard/whatsapp/settings">
            <Button variant="bordered" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2">
              <Cog6ToothIcon className="w-5 h-5" />
              Settings
            </Button>
          </Link>
        </div>
      </div>

      {/* Recent Conversations */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Conversations</h2>
          <Link href="/dashboard/whatsapp/conversations">
            <Button variant="light" size="sm" className="text-blue-600">
              View All
            </Button>
          </Link>
        </div>
        <RecentConversationsTable conversations={overview?.recent_conversations || []} />
      </div>
    </div>
  );
}
