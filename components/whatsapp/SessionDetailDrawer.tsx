"use client";

import React from "react";
import { XMarkIcon, LinkIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui";
import { Drawer } from "@/components/ui";
import type { WhatsAppSession } from "@/types/whatsapp";

interface SessionDetailDrawerProps {
  session: WhatsAppSession;
  isOpen: boolean;
  onClose: () => void;
}

export const SessionDetailDrawer: React.FC<SessionDetailDrawerProps> = ({ session, isOpen, onClose }) => {
  return (
    <Drawer isOpen={isOpen} onOpenChange={(open) => !open && onClose()} placement="right" size="lg">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Session Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Customer Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Customer</h3>
            <p className="text-lg font-medium text-gray-900">{session.from_phone}</p>
          </div>

          {/* Status */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Status</h3>
            <div className="flex gap-4">
              <div>
                <span className="text-sm text-gray-600">Step:</span>
                <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  {session.step.replace(/_/g, " ")}
                </span>
              </div>
              <div>
                <span className="text-sm text-gray-600">Payment:</span>
                <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  {session.payment_status}
                </span>
              </div>
            </div>
          </div>

          {/* Cart Items */}
          {session.cart_items && session.cart_items.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Cart Items</h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Product</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Qty</th>
                      <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {session.cart_items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-2 text-sm text-gray-900">{item.name || `Product ${item.product_id}`}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">{item.quantity}</td>
                        <td className="px-4 py-2 text-sm text-right text-gray-900">
                          £{item.unit_price.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {session.cart_total && (
                <div className="mt-2 text-right">
                  <p className="text-lg font-bold text-gray-900">Total: £{session.cart_total.toFixed(2)}</p>
                </div>
              )}
            </div>
          )}

          {/* Sale Link */}
          {session.sale_id && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Sale</h3>
              <a
                href={`/dashboard/sales/${session.sale_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
              >
                <LinkIcon className="w-4 h-4" />
                View Sale #{session.sale_id}
              </a>
            </div>
          )}

          {/* Payment Link */}
          {session.payment_link_url && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Payment Link</h3>
              <a
                href={session.payment_link_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
              >
                <LinkIcon className="w-4 h-4" />
                Open Payment Link
              </a>
            </div>
          )}

          {/* Address */}
          {session.address && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Delivery Address</h3>
              <p className="text-sm text-gray-900">
                {session.address.line1}
                <br />
                {session.address.city} {session.address.postcode}
              </p>
            </div>
          )}

          {/* Timestamps */}
          <div className="pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Created:</span>
                <p className="text-gray-900">{new Date(session.created_at).toLocaleString()}</p>
              </div>
              <div>
                <span className="text-gray-600">Updated:</span>
                <p className="text-gray-900">{new Date(session.updated_at).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Drawer>
  );
};
