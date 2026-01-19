import apiClient from "@/lib/apiClient";
import { ENDPOINT } from "@/constants/api";
import { SalesDataPoint, MarketingDataPoint, TimePeriod } from "@/components/dashboard/TrendsChart";

export interface AnalyticsResponse {
  sales: SalesDataPoint[];
  marketing: MarketingDataPoint[];
  summary: {
    totalRevenue: number;
    totalOrders: number;
    totalVisits: number;
    totalPageViews: number;
    averageOrderValue: number;
    conversionRate: number;
  };
}

/**
 * Fetch analytics data for dashboard
 * @param businessId - Business ID
 * @param period - Time period (daily, weekly, monthly)
 * @param startDate - Optional start date (ISO string)
 * @param endDate - Optional end date (ISO string)
 */
export const getAnalytics = async (
  businessId: string | number,
  period: TimePeriod = "daily",
  startDate?: string,
  endDate?: string
): Promise<AnalyticsResponse> => {
  const params: any = {
    period,
  };

  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;

  try {
    const response = await apiClient.get(
      `/analytics/business/${businessId}/trends`,
      { params }
    );

    return response.data;
  } catch (error: any) {
    // If API endpoint doesn't exist yet (404), return empty data
    if (error.response?.status === 404) {
      console.warn("Analytics API endpoint not implemented yet. Returning empty data.");
      return {
        sales: [],
        marketing: [],
        summary: {
          totalRevenue: 0,
          totalOrders: 0,
          totalVisits: 0,
          totalPageViews: 0,
          averageOrderValue: 0,
          conversionRate: 0,
        },
      };
    }
    // Re-throw other errors
    throw error;
  }
};

/**
 * Get sales trends data
 */
export const getSalesTrends = async (
  businessId: string | number,
  period: TimePeriod = "daily"
): Promise<SalesDataPoint[]> => {
  const response = await getAnalytics(businessId, period);
  return response.sales;
};

/**
 * Get marketing trends data
 */
export const getMarketingTrends = async (
  businessId: string | number,
  period: TimePeriod = "daily"
): Promise<MarketingDataPoint[]> => {
  const response = await getAnalytics(businessId, period);
  return response.marketing;
};
