import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getWhatsAppOverview,
  getWhatsAppNumbers,
  connectWhatsAppNumber,
  updateNumberToken,
  deleteWhatsAppNumber,
  getWhatsAppSettings,
  updateWhatsAppSettings,
  getWhatsAppSessions,
  getWhatsAppSession,
  getSessionCart,
  getMarketingSubscribers,
  createSubscriber,
  updateSubscriber,
  importSubscribers,
  getCampaigns,
  getCampaign,
  createCampaign,
  runCampaign,
} from "@/lib/api/whatsapp";
import type {
  ConnectNumberInput,
  UpdateSettingsInput,
  SessionFilters,
  SubscriberFilters,
  CreateSubscriberInput,
  ImportSubscribersInput,
  CampaignFilters,
  CreateCampaignInput,
  RunCampaignInput,
} from "@/types/whatsapp";

// Overview
export function useWhatsAppOverview(businessId: number) {
  return useQuery({
    queryKey: ["whatsapp", "overview", businessId],
    queryFn: () => getWhatsAppOverview(businessId),
    enabled: !!businessId,
    refetchInterval: 30000, // Auto-refresh every 30s
    select: (response) => response.data,
  });
}

// Numbers
export function useWhatsAppNumbers(businessId: number) {
  return useQuery({
    queryKey: ["whatsapp", "numbers", businessId],
    queryFn: () => getWhatsAppNumbers(businessId),
    enabled: !!businessId,
    select: (response) => response.data,
  });
}

export function useConnectNumber(businessId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ConnectNumberInput) => connectWhatsAppNumber(businessId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp", "numbers", businessId] });
      queryClient.invalidateQueries({ queryKey: ["whatsapp", "overview", businessId] });
    },
  });
}

export function useUpdateNumberToken(businessId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, accessToken }: { id: number; accessToken: string }) =>
      updateNumberToken(businessId, id, accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp", "numbers", businessId] });
      queryClient.invalidateQueries({ queryKey: ["whatsapp", "overview", businessId] });
    },
  });
}

export function useDeleteNumber(businessId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteWhatsAppNumber(businessId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp", "numbers", businessId] });
      queryClient.invalidateQueries({ queryKey: ["whatsapp", "overview", businessId] });
    },
  });
}

// Settings
export function useWhatsAppSettings(businessId: number) {
  return useQuery({
    queryKey: ["whatsapp", "settings", businessId],
    queryFn: () => getWhatsAppSettings(businessId),
    enabled: !!businessId,
    select: (response) => response.data,
  });
}

export function useUpdateSettings(businessId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateSettingsInput) => updateWhatsAppSettings(businessId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp", "settings", businessId] });
    },
  });
}

// Sessions
export function useWhatsAppSessions(businessId: number, filters?: SessionFilters) {
  return useQuery({
    queryKey: ["whatsapp", "sessions", businessId, filters],
    queryFn: () => getWhatsAppSessions(businessId, filters),
    enabled: !!businessId,
    select: (response) => response.data,
  });
}

export function useWhatsAppSession(sessionId: string) {
  return useQuery({
    queryKey: ["whatsapp", "session", sessionId],
    queryFn: () => getWhatsAppSession(sessionId),
    enabled: !!sessionId,
    select: (response) => response.data,
  });
}

export function useSessionCart(sessionId: string) {
  return useQuery({
    queryKey: ["whatsapp", "cart", sessionId],
    queryFn: () => getSessionCart(sessionId),
    enabled: !!sessionId,
    select: (response) => response.data,
  });
}

// Marketing Subscribers
export function useMarketingSubscribers(businessId: number, filters?: Omit<SubscriberFilters, "business_id">) {
  return useQuery({
    queryKey: ["whatsapp", "subscribers", businessId, filters],
    queryFn: () => getMarketingSubscribers({ business_id: businessId, ...filters }),
    enabled: !!businessId,
    select: (response) => response.data,
  });
}

export function useCreateSubscriber() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSubscriberInput) => createSubscriber(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp", "subscribers", variables.business_id] });
    },
  });
}

export function useUpdateSubscriber() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { status?: string; name?: string; tags?: string[] } }) =>
      updateSubscriber(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp", "subscribers"] });
    },
  });
}

export function useImportSubscribers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ImportSubscribersInput) => importSubscribers(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp", "subscribers", variables.business_id] });
    },
  });
}

// Campaigns
export function useCampaigns(businessId: number, filters?: Omit<CampaignFilters, "business_id">) {
  return useQuery({
    queryKey: ["whatsapp", "campaigns", businessId, filters],
    queryFn: () => getCampaigns({ business_id: businessId, ...filters }),
    enabled: !!businessId,
    select: (response) => response.data,
  });
}

export function useCampaign(campaignId: number, businessId: number) {
  return useQuery({
    queryKey: ["whatsapp", "campaign", campaignId],
    queryFn: () => getCampaign(campaignId, businessId),
    enabled: !!campaignId && !!businessId,
    select: (response) => response.data,
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCampaignInput) => createCampaign(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp", "campaigns", variables.business_id] });
    },
  });
}

export function useRunCampaign(businessId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ campaignId, phoneNumberId }: { campaignId: number; phoneNumberId: string }) =>
      runCampaign(campaignId, { phone_number_id: phoneNumberId }, businessId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp", "campaigns"] });
    },
  });
}
