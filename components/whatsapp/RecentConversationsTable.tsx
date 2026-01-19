"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import type { SessionStep, PaymentStatus } from "@/types/whatsapp";

interface Conversation {
  session_id: string;
  from_phone: string;
  step: SessionStep;
  store_name: string | null;
  cart_total: number;
  payment_status: PaymentStatus;
  updated_at: string;
}

interface RecentConversationsTableProps {
  conversations: Conversation[];
}

const stepColors: Record<SessionStep, string> = {
  WELCOME: "bg-gray-100 text-gray-800",
  SELECT_STORE: "bg-blue-100 text-blue-800",
  SELECT_CATEGORY: "bg-blue-100 text-blue-800",
  SELECT_PRODUCT: "bg-blue-100 text-blue-800",
  SELECT_QTY: "bg-blue-100 text-blue-800",
  REVIEW_CART: "bg-yellow-100 text-yellow-800",
  SELECT_FULFILLMENT: "bg-yellow-100 text-yellow-800",
  COLLECT_ADDRESS: "bg-yellow-100 text-yellow-800",
  PAYMENT_LINK_SENT: "bg-orange-100 text-orange-800",
  CONFIRMED: "bg-green-100 text-green-800",
  CLOSED: "bg-gray-100 text-gray-800",
};

const paymentStatusColors: Record<PaymentStatus, string> = {
  unpaid: "bg-red-100 text-red-800",
  awaiting_payment: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
};

export const RecentConversationsTable: React.FC<RecentConversationsTableProps> = ({ conversations }) => {
  const router = useRouter();

  if (conversations.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <ChatBubbleLeftRightIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
        <p>No conversations yet</p>
        <p className="text-sm mt-1">Start connecting with customers via WhatsApp</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-3">
      {conversations.map((conversation) => (
        <div
          key={conversation.session_id}
          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          onClick={() => router.push(`/dashboard/whatsapp/conversations?session=${conversation.session_id}`)}
        >
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <p className="font-semibold text-gray-900">{conversation.from_phone}</p>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${stepColors[conversation.step]}`}>
                {conversation.step.replace(/_/g, " ")}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>{conversation.store_name || "No store"}</span>
              {conversation.cart_total > 0 && (
                <span className="font-semibold text-gray-700">
                  £{conversation.cart_total.toFixed(2)}
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 mb-2">{formatDate(conversation.updated_at)}</p>
            <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${paymentStatusColors[conversation.payment_status]}`}>
              {conversation.payment_status.replace(/_/g, " ")}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
