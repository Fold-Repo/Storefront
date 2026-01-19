import apiClient from "@/lib/apiClient";
import { ENDPOINT } from "@/constants/api";

// Types
export interface WhatsAppNumber {
  phone_number_id: string;
  waba_id: string;
  display_phone_number: string;
  verify_token?: string;
  status: 'connected' | 'disconnected' | 'pending';
  connected_at?: string;
}

export interface WhatsAppSettings {
  multi_store_routing_enabled: boolean;
  default_store_id?: number;
  pickup_allowed: boolean;
  delivery_allowed: boolean;
  payment_link_required_for_delivery: boolean;
}

export interface WhatsAppSession {
  session_id: string;
  customer_phone: string;
  step: string;
  store_id?: number;
  store_name?: string;
  updated_at: string;
  payment_status?: 'pending' | 'completed' | 'failed';
  sale_id?: number;
  receipt_link?: string;
  cart?: {
    items: Array<{
      product_id: number;
      product_name: string;
      quantity: number;
      price: number;
    }>;
    total: number;
  };
}

export interface MarketingSubscriber {
  phone: string;
  name?: string;
  status: 'opted_in' | 'opted_out';
  created_at: string;
  updated_at?: string;
}

export interface MarketingCampaign {
  campaign_id: string;
  name: string;
  message_template: string;
  offer_link?: string;
  schedule_time?: string;
  status: 'draft' | 'scheduled' | 'running' | 'completed' | 'failed';
  created_at: string;
  results?: {
    sent: number;
    delivered: number;
    failed: number;
    opt_out: number;
  };
}

export interface ConnectNumberRequest {
  phone_number_id: string;
  waba_id: string;
  display_phone_number: string;
  verify_token: string;
}

export interface CreateSubscriberRequest {
  phone: string;
  name?: string;
}

export interface CreateCampaignRequest {
  name: string;
  message_template: string;
  offer_link?: string;
  schedule_time?: string;
}

export interface UpdateSettingsRequest {
  multi_store_routing_enabled?: boolean;
  default_store_id?: number;
  pickup_allowed?: boolean;
  delivery_allowed?: boolean;
  payment_link_required_for_delivery?: boolean;
}

// API Service
export const whatsappApi = {
  /**
   * Connect a WhatsApp number
   */
  connectNumber: async (businessId: string | number, data: ConnectNumberRequest): Promise<WhatsAppNumber> => {
    const response = await apiClient.post(
      ENDPOINT.WHATSAPP.NUMBERS.CONNECT(businessId),
      data
    );
    return response.data;
  },

  /**
   * Get connected WhatsApp numbers
   */
  getNumbers: async (businessId: string | number): Promise<WhatsAppNumber[]> => {
    const response = await apiClient.get(
      ENDPOINT.WHATSAPP.NUMBERS.LIST(businessId)
    );
    return response.data;
  },

  /**
   * Get WhatsApp settings
   */
  getSettings: async (businessId: string | number): Promise<WhatsAppSettings> => {
    const response = await apiClient.get(
      ENDPOINT.WHATSAPP.SETTINGS.GET(businessId)
    );
    return response.data;
  },

  /**
   * Update WhatsApp settings
   */
  updateSettings: async (businessId: string | number, data: UpdateSettingsRequest): Promise<WhatsAppSettings> => {
    const response = await apiClient.put(
      ENDPOINT.WHATSAPP.SETTINGS.UPDATE(businessId),
      data
    );
    return response.data;
  },

  /**
   * Get WhatsApp sessions/conversations
   */
  getSessions: async (businessId: string | number, params?: { limit?: number; offset?: number }): Promise<WhatsAppSession[]> => {
    const response = await apiClient.get(
      ENDPOINT.WHATSAPP.SESSIONS.LIST(businessId),
      { params }
    );
    return response.data;
  },

  /**
   * Get a specific WhatsApp session
   */
  getSession: async (businessId: string | number, sessionId: string): Promise<WhatsAppSession> => {
    const response = await apiClient.get(
      ENDPOINT.WHATSAPP.SESSIONS.GET(sessionId)
    );
    return response.data;
  },

  /**
   * Get marketing subscribers
   */
  getSubscribers: async (businessId: string | number, params?: { search?: string; status?: string }): Promise<MarketingSubscriber[]> => {
    const response = await apiClient.get(
      ENDPOINT.WHATSAPP.MARKETING.SUBSCRIBERS.LIST(businessId),
      { params }
    );
    return response.data;
  },

  /**
   * Create a marketing subscriber
   */
  createSubscriber: async (businessId: string | number, data: CreateSubscriberRequest): Promise<MarketingSubscriber> => {
    const response = await apiClient.post(
      ENDPOINT.WHATSAPP.MARKETING.SUBSCRIBERS.CREATE(businessId),
      data
    );
    return response.data;
  },

  /**
   * Update subscriber status (opt-in/opt-out)
   */
  updateSubscriberStatus: async (businessId: string | number, phone: string, status: 'opted_in' | 'opted_out'): Promise<MarketingSubscriber> => {
    const response = await apiClient.patch(
      ENDPOINT.WHATSAPP.MARKETING.SUBSCRIBERS.UPDATE(businessId, phone),
      { status }
    );
    return response.data;
  },

  /**
   * Get marketing campaigns
   */
  getCampaigns: async (businessId: string | number): Promise<MarketingCampaign[]> => {
    const response = await apiClient.get(
      ENDPOINT.WHATSAPP.MARKETING.CAMPAIGNS.LIST(businessId)
    );
    return response.data;
  },

  /**
   * Create a marketing campaign
   */
  createCampaign: async (businessId: string | number, data: CreateCampaignRequest): Promise<MarketingCampaign> => {
    const response = await apiClient.post(
      ENDPOINT.WHATSAPP.MARKETING.CAMPAIGNS.CREATE(businessId),
      data
    );
    return response.data;
  },

  /**
   * Get a specific campaign
   */
  getCampaign: async (businessId: string | number, campaignId: string): Promise<MarketingCampaign> => {
    const response = await apiClient.get(
      ENDPOINT.WHATSAPP.MARKETING.CAMPAIGNS.GET(businessId, campaignId)
    );
    return response.data;
  },

  /**
   * Run a campaign
   */
  runCampaign: async (businessId: string | number, campaignId: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post(
      ENDPOINT.WHATSAPP.MARKETING.CAMPAIGNS.RUN(businessId, campaignId)
    );
    return response.data;
  },
};
