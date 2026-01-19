"use client";

import React from "react";
import Link from "next/link";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui";

interface ConnectionStatusCardProps {
  connectedNumber?: {
    phone_number_id: string;
    display_phone: string;
    is_active: boolean;
  } | null;
  isConnected?: boolean;
}

export const ConnectionStatusCard: React.FC<ConnectionStatusCardProps> = ({
  connectedNumber,
  isConnected = false,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {isConnected && connectedNumber ? (
            <CheckCircleIcon className="w-8 h-8 text-green-500" />
          ) : (
            <XCircleIcon className="w-8 h-8 text-gray-400" />
          )}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-1">Connection Status</h3>
            {isConnected && connectedNumber ? (
              <div>
                <p className="text-2xl font-bold text-gray-900 mb-1">{connectedNumber.display_phone}</p>
                <p className="text-sm text-gray-500">Connected and Active</p>
              </div>
            ) : (
              <div>
                <p className="text-2xl font-bold text-gray-400 mb-1">Not Connected</p>
                <p className="text-sm text-gray-500">No WhatsApp number connected</p>
              </div>
            )}
          </div>
        </div>
        {!isConnected && (
          <Link href="/dashboard/whatsapp/connect">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Connect Number
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};
