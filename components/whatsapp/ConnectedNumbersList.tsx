"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui/form";
import { TrashIcon, KeyIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import type { WhatsAppNumber } from "@/types/whatsapp";

interface ConnectedNumbersListProps {
  numbers: WhatsAppNumber[];
  onUpdateToken: (id: number, accessToken: string) => void;
  onDelete: (id: number) => void;
  isLoading?: boolean;
}

export const ConnectedNumbersList: React.FC<ConnectedNumbersListProps> = ({
  numbers,
  onUpdateToken,
  onDelete,
  isLoading,
}) => {
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [newToken, setNewToken] = useState<Record<number, string>>({});

  const handleUpdateToken = (id: number) => {
    if (!newToken[id] || !newToken[id].startsWith("EAAG")) {
      alert("Please enter a valid access token starting with EAAG");
      return;
    }
    setUpdatingId(id);
    onUpdateToken(id, newToken[id]);
    setTimeout(() => {
      setUpdatingId(null);
      setNewToken((prev) => ({ ...prev, [id]: "" }));
    }, 1000);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Connected Numbers</h2>
      <div className="space-y-4">
        {numbers.map((number) => (
          <div
            key={number.id}
            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <CheckCircleIcon className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-semibold text-gray-900">{number.display_phone_number}</p>
                  <p className="text-sm text-gray-500">
                    {number.is_active ? "Active" : "Inactive"}
                  </p>
                </div>
              </div>
              <Button
                variant="light"
                color="danger"
                size="sm"
                onClick={() => onDelete(number.id)}
                disabled={isLoading}
                className="text-red-600"
              >
                <TrashIcon className="w-4 h-4 mr-1" />
                Disconnect
              </Button>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm font-semibold text-gray-700 mb-2">Update Access Token</p>
              <div className="flex gap-2">
                <Input
                  name={`token_${number.id}`}
                  type="password"
                  value={newToken[number.id] || ""}
                  onChange={(e) =>
                    setNewToken((prev) => ({ ...prev, [number.id]: e.target.value }))
                  }
                  placeholder="EAAG..."
                  className="flex-1"
                />
                <Button
                  size="sm"
                  onClick={() => handleUpdateToken(number.id)}
                  disabled={isLoading || updatingId === number.id}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <KeyIcon className="w-4 h-4 mr-1" />
                  Update
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
