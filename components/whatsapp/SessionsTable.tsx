"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Input, Select } from "@/components/ui/form";
import type { WhatsAppSession, SessionStep, PaymentStatus } from "@/types/whatsapp";

interface SessionsTableProps {
  sessions: WhatsAppSession[];
  pagination?: any;
  isLoading?: boolean;
  filters: any;
  onFiltersChange: (filters: any) => void;
}

const stepOptions: SessionStep[] = [
  "WELCOME",
  "SELECT_STORE",
  "SELECT_CATEGORY",
  "SELECT_PRODUCT",
  "SELECT_QTY",
  "REVIEW_CART",
  "SELECT_FULFILLMENT",
  "COLLECT_ADDRESS",
  "PAYMENT_LINK_SENT",
  "CONFIRMED",
  "CLOSED",
];

const stepColors: Record<SessionStep, string> = {
  WELCOME: "bg-gray-100 text-gray-800",
  SELECT_STORE: "bg-blue-100 text-blue-800",
  SELECT_CATEGORY: "bg-blue-100 text-blue-800",
  SELECT_PRODUCT: "bg-blue-100 text-blue-800",
  SELECT_QTY: "bg-blue-100 text-blue-800",
  REVIEW_CART: "bg-yellow-100 text-yellow-800",
  SELECT_FULFILLMENT: "bg-yellow-100 text-yellow-800",
  COLLECT_ADDRESS: "bg-yellow-100 text-yellow-800",
  PAYMENT_LINK_SENT: "bg-orange-100 text-orange-800",
  CONFIRMED: "bg-green-100 text-green-800",
  CLOSED: "bg-gray-100 text-gray-800",
};

const paymentStatusColors: Record<PaymentStatus, string> = {
  unpaid: "bg-red-100 text-red-800",
  awaiting_payment: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
};

export const SessionsTable: React.FC<SessionsTableProps> = ({
  sessions,
  pagination,
  isLoading,
  filters,
  onFiltersChange,
}) => {
  const router = useRouter();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Filters */}
      <div className="p-4 sm:p-6 border-b border-gray-200 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Input
            name="search"
            placeholder="Search by phone..."
            value={filters.search || ""}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value, page: 1 })}
          />
          <Select
            name="step"
            value={filters.step || ""}
            onChange={(e) => onFiltersChange({ ...filters, step: e.target.value || undefined, page: 1 })}
          >
            <option value="">All Steps</option>
            {stepOptions.map((step) => (
              <option key={step} value={step}>
                {step.replace(/_/g, " ")}
              </option>
            ))}
          </Select>
          <Select
            name="payment_status"
            value={filters.payment_status || ""}
            onChange={(e) =>
              onFiltersChange({ ...filters, payment_status: e.target.value || undefined, page: 1 })
            }
          >
            <option value="">All Payment Status</option>
            <option value="unpaid">Unpaid</option>
            <option value="awaiting_payment">Awaiting Payment</option>
            <option value="paid">Paid</option>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell">
                Step
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">
                Store
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">
                Items
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Total
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">
                Payment
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">
                Updated
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : sessions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  No conversations found
                </td>
              </tr>
            ) : (
              sessions.map((session) => (
                <tr
                  key={session.session_id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() =>
                    router.push(`/dashboard/whatsapp/conversations?session=${session.session_id}`)
                  }
                >
                  <td className="px-3 sm:px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{session.from_phone}</div>
                    <div className="sm:hidden mt-1">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${stepColors[session.step]}`}>
                        {session.step.replace(/_/g, " ")}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${stepColors[session.step]}`}
                    >
                      {session.step.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                    {session.store_name || "—"}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden md:table-cell">
                    {session.cart_items_count || 0}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {session.cart_total ? `£${session.cart_total.toFixed(2)}` : "—"}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${paymentStatusColors[session.payment_status]}`}
                    >
                      {session.payment_status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                    {formatDate(session.updated_at)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onFiltersChange({ ...filters, page: pagination.page - 1 })}
              disabled={pagination.page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => onFiltersChange({ ...filters, page: pagination.page + 1 })}
              disabled={pagination.page >= pagination.pages}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
