import apiClient from "@/lib/apiClient";
import { ENDPOINT } from "@/constants/api";
import type {
  ApiResponse,
  WhatsAppOverview,
  WhatsAppNumber,
  WhatsAppSettings,
  WhatsAppSession,
  CartDetails,
  MarketingSubscriber,
  MarketingCampaign,
  ServiceToken,
  ConnectNumberInput,
  UpdateSettingsInput,
  SessionFilters,
  SubscriberFilters,
  CreateSubscriberInput,
  ImportSubscribersInput,
  CampaignFilters,
  CreateCampaignInput,
  RunCampaignInput,
  PaginatedResponse,
} from "@/types/whatsapp";

// Overview
export const getWhatsAppOverview = async (businessId: number): Promise<ApiResponse<WhatsAppOverview>> => {
  const response = await apiClient.get(ENDPOINT.WHATSAPP.OVERVIEW(businessId));
  return response.data;
};

// Numbers
export const getWhatsAppNumbers = async (businessId: number): Promise<ApiResponse<WhatsAppNumber[]>> => {
  const response = await apiClient.get(ENDPOINT.WHATSAPP.NUMBERS.LIST(businessId));
  return response.data;
};

export const connectWhatsAppNumber = async (
  businessId: number,
  data: ConnectNumberInput
): Promise<ApiResponse<WhatsAppNumber>> => {
  const response = await apiClient.post(ENDPOINT.WHATSAPP.NUMBERS.CONNECT(businessId), data);
  return response.data;
};

export const updateNumberToken = async (
  businessId: number,
  id: number,
  accessToken: string
): Promise<ApiResponse<WhatsAppNumber>> => {
  const response = await apiClient.patch(ENDPOINT.WHATSAPP.NUMBERS.UPDATE_TOKEN(businessId, id), {
    access_token: accessToken,
  });
  return response.data;
};

export const deleteWhatsAppNumber = async (
  businessId: number,
  id: number
): Promise<ApiResponse<void>> => {
  const response = await apiClient.delete(ENDPOINT.WHATSAPP.NUMBERS.DELETE(businessId, id));
  return response.data;
};

// Settings
export const getWhatsAppSettings = async (businessId: number): Promise<ApiResponse<WhatsAppSettings>> => {
  const response = await apiClient.get(ENDPOINT.WHATSAPP.SETTINGS.GET(businessId));
  return response.data;
};

export const updateWhatsAppSettings = async (
  businessId: number,
  data: UpdateSettingsInput
): Promise<ApiResponse<WhatsAppSettings>> => {
  const response = await apiClient.put(ENDPOINT.WHATSAPP.SETTINGS.UPDATE(businessId), data);
  return response.data;
};

// Sessions
export const getWhatsAppSessions = async (
  businessId: number,
  filters?: SessionFilters
): Promise<ApiResponse<PaginatedResponse<WhatsAppSession>>> => {
  const response = await apiClient.get(ENDPOINT.WHATSAPP.SESSIONS.LIST(businessId), { params: filters });
  return response.data;
};

export const getWhatsAppSession = async (sessionId: string): Promise<ApiResponse<WhatsAppSession>> => {
  const response = await apiClient.get(ENDPOINT.WHATSAPP.SESSIONS.GET(sessionId));
  return response.data;
};

export const getSessionCart = async (sessionId: string): Promise<ApiResponse<CartDetails>> => {
  const response = await apiClient.get(ENDPOINT.WHATSAPP.SESSIONS.CART(sessionId));
  return response.data;
};

// Marketing Subscribers
export const getMarketingSubscribers = async (
  filters: SubscriberFilters
): Promise<ApiResponse<PaginatedResponse<MarketingSubscriber>>> => {
  const response = await apiClient.get(ENDPOINT.WHATSAPP.MARKETING.SUBSCRIBERS.LIST, { params: filters });
  return response.data;
};

export const createSubscriber = async (
  data: CreateSubscriberInput
): Promise<ApiResponse<MarketingSubscriber>> => {
  const response = await apiClient.post(ENDPOINT.WHATSAPP.MARKETING.SUBSCRIBERS.CREATE, data);
  return response.data;
};

export const updateSubscriber = async (
  id: number,
  data: { status?: string; name?: string; tags?: string[] }
): Promise<ApiResponse<MarketingSubscriber>> => {
  const response = await apiClient.patch(ENDPOINT.WHATSAPP.MARKETING.SUBSCRIBERS.UPDATE(id), data);
  return response.data;
};

export const importSubscribers = async (
  data: ImportSubscribersInput
): Promise<ApiResponse<{ total: number; created: number; updated: number; skipped: number; errors: any[] }>> => {
  const response = await apiClient.post(ENDPOINT.WHATSAPP.MARKETING.SUBSCRIBERS.IMPORT, data);
  return response.data;
};

// Marketing Campaigns
export const getCampaigns = async (
  filters: CampaignFilters
): Promise<ApiResponse<PaginatedResponse<MarketingCampaign>>> => {
  const response = await apiClient.get(ENDPOINT.WHATSAPP.MARKETING.CAMPAIGNS.LIST, { params: filters });
  return response.data;
};

export const getCampaign = async (
  campaignId: number,
  businessId: number
): Promise<ApiResponse<MarketingCampaign>> => {
  const response = await apiClient.get(ENDPOINT.WHATSAPP.MARKETING.CAMPAIGNS.GET(campaignId), {
    params: { business_id: businessId },
  });
  return response.data;
};

export const createCampaign = async (
  data: CreateCampaignInput
): Promise<ApiResponse<MarketingCampaign>> => {
  const response = await apiClient.post(ENDPOINT.WHATSAPP.MARKETING.CAMPAIGNS.CREATE, data);
  return response.data;
};

export const runCampaign = async (
  campaignId: number,
  data: RunCampaignInput
): Promise<ApiResponse<{ total: number; sent: number; failed: number; errors: any[] }>> => {
  const response = await apiClient.post(ENDPOINT.WHATSAPP.MARKETING.CAMPAIGNS.RUN(campaignId), data);
  return response.data;
};

// Service Tokens
export const getServiceTokens = async (): Promise<ApiResponse<ServiceToken[]>> => {
  const response = await apiClient.get(ENDPOINT.WHATSAPP.SERVICE_TOKENS.LIST);
  return response.data;
};

export const getServiceTokenScopes = async (): Promise<ApiResponse<{ scopes: Array<{ id: string; description: string }> }>> => {
  const response = await apiClient.get(ENDPOINT.WHATSAPP.SERVICE_TOKENS.SCOPES);
  return response.data;
};

export const createServiceToken = async (data: {
  name: string;
  scopes: string[];
  expires_at?: string | null;
}): Promise<ApiResponse<ServiceToken>> => {
  const response = await apiClient.post(ENDPOINT.WHATSAPP.SERVICE_TOKENS.CREATE, data);
  return response.data;
};

export const revokeServiceToken = async (id: number): Promise<ApiResponse<void>> => {
  const response = await apiClient.patch(ENDPOINT.WHATSAPP.SERVICE_TOKENS.REVOKE(id));
  return response.data;
};

export const deleteServiceToken = async (id: number): Promise<ApiResponse<void>> => {
  const response = await apiClient.delete(ENDPOINT.WHATSAPP.SERVICE_TOKENS.DELETE(id));
  return response.data;
};
