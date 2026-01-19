"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useWhatsAppSessions, useWhatsAppSession } from "@/hooks/useWhatsApp";
import { SessionsTable } from "@/components/whatsapp/SessionsTable";
import { SessionDetailDrawer } from "@/components/whatsapp/SessionDetailDrawer";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export const ConversationsContent: React.FC = () => {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const businessId = user?.business_id;
  const selectedSessionId = searchParams.get("session");

  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    step: undefined as string | undefined,
    payment_status: undefined as string | undefined,
    search: undefined as string | undefined,
  });

  const { data: sessionsData, isLoading } = useWhatsAppSessions(businessId || 0, filters);
  const { data: selectedSession } = useWhatsAppSession(selectedSessionId || "");

  if (!businessId) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 sm:p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-yellow-800 text-sm sm:text-base">Please set up your business first to use WhatsApp Commerce.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto pb-8 sm:pb-12 lg:pb-20 p-4 sm:p-6">
      <Link href="/dashboard/whatsapp" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeftIcon className="w-5 h-5" />
        <span>Back to WhatsApp Commerce</span>
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Conversations</h1>
        <p className="text-gray-600">View and manage customer WhatsApp conversations</p>
      </div>

      <SessionsTable
        sessions={sessionsData?.sessions || []}
        pagination={sessionsData?.pagination}
        isLoading={isLoading}
        filters={filters}
        onFiltersChange={setFilters}
      />

      {selectedSessionId && selectedSession && (
        <SessionDetailDrawer
          session={selectedSession}
          isOpen={!!selectedSessionId}
          onClose={() => window.history.pushState({}, "", "/dashboard/whatsapp/conversations")}
        />
      )}
    </div>
  );
};
