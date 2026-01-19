"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui";
import { Input, TextArea } from "@/components/ui/form";
import type { WhatsAppSettings, UpdateSettingsInput } from "@/types/whatsapp";

interface SettingsFormProps {
  settings?: WhatsAppSettings;
  onSubmit: (data: UpdateSettingsInput) => void;
  isLoading?: boolean;
}

export const SettingsForm: React.FC<SettingsFormProps> = ({ settings, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<UpdateSettingsInput>({
    multi_store_routing: false,
    default_store_id: null,
    pickup_enabled: true,
    delivery_enabled: true,
    payment_required_for_delivery: true,
    auto_welcome_message: true,
    welcome_message_template: null,
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        multi_store_routing: settings.multi_store_routing,
        default_store_id: settings.default_store_id,
        pickup_enabled: settings.pickup_enabled,
        delivery_enabled: settings.delivery_enabled,
        payment_required_for_delivery: settings.payment_required_for_delivery,
        auto_welcome_message: settings.auto_welcome_message,
        welcome_message_template: settings.welcome_message_template,
      });
    }
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleToggle = (field: keyof UpdateSettingsInput) => {
    setFormData((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Multi-Store Routing */}
      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
        <div>
          <h3 className="font-semibold text-gray-900 mb-1">Multi-Store Routing</h3>
          <p className="text-sm text-gray-600">Allow customers to select which store to order from</p>
        </div>
        <button
          type="button"
          onClick={() => handleToggle("multi_store_routing")}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            formData.multi_store_routing ? "bg-blue-600" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              formData.multi_store_routing ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Default Store */}
      {formData.multi_store_routing && (
        <Input
          label="Default Store ID"
          name="default_store_id"
          type="number"
          value={formData.default_store_id?.toString() || ""}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              default_store_id: e.target.value ? parseInt(e.target.value) : null,
            }))
          }
          placeholder="Store ID"
        />
      )}

      {/* Pickup Enabled */}
      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
        <div>
          <h3 className="font-semibold text-gray-900 mb-1">Allow Store Pickup</h3>
          <p className="text-sm text-gray-600">Enable customers to pick up orders from your store</p>
        </div>
        <button
          type="button"
          onClick={() => handleToggle("pickup_enabled")}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            formData.pickup_enabled ? "bg-blue-600" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              formData.pickup_enabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Delivery Enabled */}
      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
        <div>
          <h3 className="font-semibold text-gray-900 mb-1">Allow Delivery</h3>
          <p className="text-sm text-gray-600">Enable customers to have orders delivered</p>
        </div>
        <button
          type="button"
          onClick={() => handleToggle("delivery_enabled")}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            formData.delivery_enabled ? "bg-blue-600" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              formData.delivery_enabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Payment Required for Delivery */}
      {formData.delivery_enabled && (
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Payment Required for Delivery</h3>
            <p className="text-sm text-gray-600">Require payment before processing delivery orders</p>
          </div>
          <button
            type="button"
            onClick={() => handleToggle("payment_required_for_delivery")}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              formData.payment_required_for_delivery ? "bg-blue-600" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                formData.payment_required_for_delivery ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      )}

      {/* Auto Welcome Message */}
      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
        <div>
          <h3 className="font-semibold text-gray-900 mb-1">Auto Welcome Message</h3>
          <p className="text-sm text-gray-600">Automatically send a welcome message to new customers</p>
        </div>
        <button
          type="button"
          onClick={() => handleToggle("auto_welcome_message")}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            formData.auto_welcome_message ? "bg-blue-600" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              formData.auto_welcome_message ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Welcome Message Template */}
      {formData.auto_welcome_message && (
        <TextArea
          label="Welcome Message Template"
          name="welcome_message_template"
          value={formData.welcome_message_template || ""}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              welcome_message_template: e.target.value || null,
            }))
          }
          placeholder="Welcome! Type 'menu' to see our products."
          rows={4}
        />
      )}

      <Button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        isDisabled={isLoading}
      >
        {isLoading ? "Saving..." : "Save Settings"}
      </Button>
    </form>
  );
};
