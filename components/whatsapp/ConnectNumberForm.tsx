"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui/form";
import type { ConnectNumberInput } from "@/types/whatsapp";

interface ConnectNumberFormProps {
  onSubmit: (data: ConnectNumberInput) => void;
  isLoading?: boolean;
}

export const ConnectNumberForm: React.FC<ConnectNumberFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<ConnectNumberInput>({
    waba_id: "",
    phone_number_id: "",
    display_phone_number: "",
    access_token: "",
    verify_token: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.waba_id.trim()) {
      newErrors.waba_id = "WABA ID is required";
    } else if (!/^\d{15}$/.test(formData.waba_id)) {
      newErrors.waba_id = "WABA ID must be 15 digits";
    }

    if (!formData.phone_number_id.trim()) {
      newErrors.phone_number_id = "Phone Number ID is required";
    } else if (!/^\d{15}$/.test(formData.phone_number_id)) {
      newErrors.phone_number_id = "Phone Number ID must be 15 digits";
    }

    if (!formData.display_phone_number.trim()) {
      newErrors.display_phone_number = "Display phone number is required";
    } else if (!/^\+[1-9]\d{1,14}$/.test(formData.display_phone_number)) {
      newErrors.display_phone_number = "Must be in E.164 format (e.g., +447700900123)";
    }

    if (!formData.access_token.trim()) {
      newErrors.access_token = "Access token is required";
    } else if (!formData.access_token.startsWith("EAAG")) {
      newErrors.access_token = "Access token must start with EAAG";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field: keyof ConnectNumberInput) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="WhatsApp Business Account ID (WABA ID)"
        name="waba_id"
        value={formData.waba_id}
        onChange={handleChange("waba_id")}
        error={errors.waba_id}
        placeholder="123456789012345"
        required
      />

      <Input
        label="Phone Number ID"
        name="phone_number_id"
        value={formData.phone_number_id}
        onChange={handleChange("phone_number_id")}
        error={errors.phone_number_id}
        placeholder="987654321098765"
        required
      />

      <Input
        label="Display Phone Number"
        name="display_phone_number"
        value={formData.display_phone_number}
        onChange={handleChange("display_phone_number")}
        error={errors.display_phone_number}
        placeholder="+447700900123"
        required
      />

      <Input
        label="Permanent Access Token"
        name="access_token"
        type="password"
        value={formData.access_token}
        onChange={handleChange("access_token")}
        error={errors.access_token}
        placeholder="EAAG..."
        required
      />

      <Input
        label="Webhook Verify Token (Optional)"
        name="verify_token"
        value={formData.verify_token}
        onChange={handleChange("verify_token")}
        error={errors.verify_token}
        placeholder="my_secret_token"
      />

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Your access token will be securely stored and never displayed. 
          You can update it later if needed.
        </p>
      </div>

      <Button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        isDisabled={isLoading}
      >
        {isLoading ? "Connecting..." : "Connect WhatsApp Number"}
      </Button>
    </form>
  );
};
