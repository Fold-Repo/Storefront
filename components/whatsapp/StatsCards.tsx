"use client";

import React from "react";
import {
  ChatBubbleLeftRightIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

interface StatsCardsProps {
  stats: {
    active_sessions: number;
    sessions_today: number;
    sales_today: number;
    revenue_today: number;
  };
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(amount);
  };

  const cards = [
    {
      label: "Active Sessions",
      value: stats.active_sessions,
      icon: ChatBubbleLeftRightIcon,
      color: "blue",
    },
    {
      label: "Sessions Today",
      value: stats.sessions_today,
      icon: UserGroupIcon,
      color: "purple",
    },
    {
      label: "Sales Today",
      value: stats.sales_today,
      icon: ShoppingBagIcon,
      color: "green",
    },
    {
      label: "Revenue Today",
      value: formatCurrency(stats.revenue_today),
      icon: CurrencyDollarIcon,
      color: "yellow",
    },
  ];

  const colorClasses = {
    blue: "bg-blue-500",
    purple: "bg-purple-500",
    green: "bg-green-500",
    yellow: "bg-yellow-500",
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{card.label}</h3>
              <div className={`p-2 rounded-lg ${colorClasses[card.color as keyof typeof colorClasses]}`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">{card.value}</p>
          </div>
        );
      })}
    </div>
  );
};
