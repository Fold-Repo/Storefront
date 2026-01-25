"use client";

import React from "react";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

export const WebhookInstructions: React.FC = () => {
  const webhookUrl = process.env.NEXT_PUBLIC_API_URL 
    ? `${process.env.NEXT_PUBLIC_API_URL}/whatsapp/webhook`
    : "https://shorp-epos-backend.onrender.com/api/v1/whatsapp/webhook";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-start gap-3 mb-4">
        <InformationCircleIcon className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Meta Business Manager Setup</h3>
          <p className="text-sm text-gray-600 mb-4">
            Follow these steps to connect your WhatsApp Business number:
          </p>
        </div>
      </div>

      <ol className="space-y-4 text-sm text-gray-700">
        <li className="flex gap-3">
          <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
            1
          </span>
          <div>
            <p className="font-semibold mb-1">Go to Meta Business Manager</p>
            <p className="text-gray-600">
              Navigate to{" "}
              <a
                href="https://business.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                business.facebook.com
              </a>{" "}
              and select your WhatsApp Business Account
            </p>
          </div>
        </li>

        <li className="flex gap-3">
          <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
            2
          </span>
          <div>
            <p className="font-semibold mb-1">Get Your Credentials</p>
            <p className="text-gray-600">
              In your WhatsApp Business Account settings, find:
              <ul className="list-disc list-inside mt-1 ml-4 space-y-1">
                <li>WABA ID (WhatsApp Business Account ID)</li>
                <li>Phone Number ID</li>
                <li>Permanent Access Token</li>
              </ul>
            </p>
          </div>
        </li>

        <li className="flex gap-3">
          <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
            3
          </span>
          <div>
            <p className="font-semibold mb-1">Configure Webhook</p>
            <p className="text-gray-600 mb-2">
              In Meta Business Manager, go to Configuration → Webhooks and add:
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 font-mono text-xs break-all">
              {webhookUrl}
            </div>
            <p className="text-gray-600 mt-2">
              Subscribe to: <code className="bg-gray-100 px-1 rounded">messages</code> and{" "}
              <code className="bg-gray-100 px-1 rounded">message_status</code>
            </p>
          </div>
        </li>

        <li className="flex gap-3">
          <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
            4
          </span>
          <div>
            <p className="font-semibold mb-1">Enter Credentials Below</p>
            <p className="text-gray-600">
              Fill in the form with your WABA ID, Phone Number ID, Display Phone Number, and Access Token
            </p>
          </div>
        </li>
      </ol>
    </div>
  );
};
