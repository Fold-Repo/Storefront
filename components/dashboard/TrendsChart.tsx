"use client";

import React, { useState } from "react";
import { ChartBarIcon } from "@heroicons/react/24/outline";

export type TimePeriod = "daily" | "weekly" | "monthly";

interface TrendsChartProps {
  salesData: SalesDataPoint[];
  marketingData: MarketingDataPoint[];
  loading?: boolean;
  onPeriodChange?: (period: TimePeriod) => void;
}

export interface SalesDataPoint {
  date: string;
  revenue: number;
  orders: number;
  averageOrderValue: number;
}

export interface MarketingDataPoint {
  date: string;
  visits: number;
  pageViews: number;
  conversions: number;
  conversionRate: number;
}

// Import recharts directly - it should be installed
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export const TrendsChart: React.FC<TrendsChartProps> = ({
  salesData,
  marketingData,
  loading = false,
  onPeriodChange,
}) => {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("daily");
  const [chartType, setChartType] = useState<"sales" | "marketing">("sales");

  const formatDate = (date: string, period: TimePeriod) => {
    const d = new Date(date);
    switch (period) {
      case "daily":
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      case "weekly":
        const weekNum = getWeekNumber(d);
        return `Week ${weekNum}`;
      case "monthly":
        return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      default:
        return date;
    }
  };

  const getWeekNumber = (date: Date): number => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  };

  // Filter data based on time period (this would ideally come from API)
  // For now, we'll use the data as-is and let the backend handle filtering
  const currentData = chartType === "sales" ? salesData : marketingData;

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }


  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-neutral-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 rounded-xl p-2.5">
              <ChartBarIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-black text-neutral-900 tracking-tighter">
                {chartType === "sales" ? "Sales Trends" : "Marketing Trends"}
              </h2>
              <p className="text-sm text-neutral-500 font-medium">Track your performance over time</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            {/* Chart Type Toggle */}
            <div className="flex bg-neutral-100 rounded-lg p-1">
              <button
                onClick={() => setChartType("sales")}
                className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                  chartType === "sales"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                Sales
              </button>
              <button
                onClick={() => setChartType("marketing")}
                className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                  chartType === "marketing"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                Marketing
              </button>
            </div>

            {/* Time Period Toggle */}
            <div className="flex bg-neutral-100 rounded-lg p-1">
              <button
                onClick={() => {
                  setTimePeriod("daily");
                  onPeriodChange?.("daily");
                }}
                className={`px-3 py-2 rounded-md text-xs font-semibold transition-all ${
                  timePeriod === "daily"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                Daily
              </button>
              <button
                onClick={() => {
                  setTimePeriod("weekly");
                  onPeriodChange?.("weekly");
                }}
                className={`px-3 py-2 rounded-md text-xs font-semibold transition-all ${
                  timePeriod === "weekly"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => {
                  setTimePeriod("monthly");
                  onPeriodChange?.("monthly");
                }}
                className={`px-3 py-2 rounded-md text-xs font-semibold transition-all ${
                  timePeriod === "monthly"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                Monthly
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-6">
        <ResponsiveContainer width="100%" height={400}>
          {chartType === "sales" ? (
            <AreaChart data={currentData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => formatDate(value, timePeriod)}
                stroke="#6B7280"
                style={{ fontSize: "12px" }}
              />
              <YAxis
                yAxisId="left"
                stroke="#6B7280"
                style={{ fontSize: "12px" }}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#6B7280"
                style={{ fontSize: "12px" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                }}
                formatter={(value: number | undefined, name: string | undefined) => {
                  if (value === undefined) return ["0", name || ""];
                  const displayName = name || "";
                  if (displayName === "revenue" || displayName === "averageOrderValue") {
                    return [`$${value.toLocaleString()}`, displayName === "revenue" ? "Revenue" : "Avg Order Value"];
                  }
                  return [value.toLocaleString(), displayName === "orders" ? "Orders" : displayName];
                }}
              />
              <Legend />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                stroke="#3B82F6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
                name="Revenue"
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="orders"
                stroke="#10B981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorOrders)"
                name="Orders"
              />
            </AreaChart>
          ) : (
            <LineChart data={currentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => formatDate(value, timePeriod)}
                stroke="#6B7280"
                style={{ fontSize: "12px" }}
              />
              <YAxis
                stroke="#6B7280"
                style={{ fontSize: "12px" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                }}
                formatter={(value: number | undefined, name: string | undefined) => {
                  if (value === undefined) return ["0", name || ""];
                  const displayName = name || "";
                  if (displayName === "conversionRate") {
                    return [`${value.toFixed(2)}%`, "Conversion Rate"];
                  }
                  return [value.toLocaleString(), displayName === "visits" ? "Visits" : displayName === "pageViews" ? "Page Views" : "Conversions"];
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="visits"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ fill: "#3B82F6", r: 4 }}
                name="Visits"
              />
              <Line
                type="monotone"
                dataKey="pageViews"
                stroke="#8B5CF6"
                strokeWidth={2}
                dot={{ fill: "#8B5CF6", r: 4 }}
                name="Page Views"
              />
              <Line
                type="monotone"
                dataKey="conversions"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ fill: "#10B981", r: 4 }}
                name="Conversions"
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
