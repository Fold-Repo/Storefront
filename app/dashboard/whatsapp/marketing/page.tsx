"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useMarketingSubscribers } from "@/hooks";
import { Button, Input } from "@/components/ui";
import { useToast } from "@/hooks";
import { SearchInput } from "@/components/reusable";
import {
  ArrowLeftIcon,
  PlusIcon,
  UserPlusIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

export default function WhatsAppMarketingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { subscribers, createSubscriber, updateSubscriberStatus, loading, refetch } = useMarketingSubscribers(user?.business_id || null);
  const { showSuccess, showError } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSubscriber, setNewSubscriber] = useState({ phone: "", name: "" });
  const [adding, setAdding] = useState(false);

  const filteredSubscribers = subscribers.filter((sub) => {
    const matchesSearch = 
      sub.phone.includes(searchQuery) ||
      (sub.name && sub.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const handleAddSubscriber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubscriber.phone) {
      showError("Phone number is required");
      return;
    }

    setAdding(true);
    try {
      await createSubscriber(newSubscriber);
      setNewSubscriber({ phone: "", name: "" });
      setShowAddModal(false);
    } catch (error) {
      // Error is already handled in the hook
    } finally {
      setAdding(false);
    }
  };

  const handleToggleStatus = async (phone: string, currentStatus: 'opted_in' | 'opted_out') => {
    const newStatus = currentStatus === 'opted_in' ? 'opted_out' : 'opted_in';
    try {
      await updateSubscriberStatus(phone, newStatus);
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Marketing Subscribers</h1>
            <p className="text-gray-600">Manage your WhatsApp marketing subscriber list</p>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Add Subscriber
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Subscribers</p>
              <p className="text-2xl font-bold text-gray-900">{subscribers.length}</p>
            </div>
            <UserPlusIcon className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Opted In</p>
              <p className="text-2xl font-bold text-green-600">
                {subscribers.filter(s => s.status === 'opted_in').length}
              </p>
            </div>
            <CheckCircleIcon className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Opted Out</p>
              <p className="text-2xl font-bold text-red-600">
                {subscribers.filter(s => s.status === 'opted_out').length}
              </p>
            </div>
            <XCircleIcon className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <SearchInput
              onSearch={setSearchQuery}
              placeholder="Search by phone or name..."
            />
          </div>
        </div>
      </div>

      {/* Subscribers Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading subscribers...</p>
          </div>
        ) : filteredSubscribers.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <UserPlusIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>No subscribers found</p>
            {searchQuery && (
              <p className="text-sm mt-1">Try adjusting your search query</p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSubscribers.map((subscriber) => (
                  <tr key={subscriber.phone} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {subscriber.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {subscriber.name || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          subscriber.status === 'opted_in'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {subscriber.status === 'opted_in' ? 'Opted In' : 'Opted Out'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(subscriber.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        size="sm"
                        variant="light"
                        onClick={() => handleToggleStatus(subscriber.phone, subscriber.status)}
                        className={
                          subscriber.status === 'opted_in'
                            ? 'text-red-600 hover:text-red-700'
                            : 'text-green-600 hover:text-green-700'
                        }
                      >
                        {subscriber.status === 'opted_in' ? 'Opt Out' : 'Opt In'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Subscriber Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add Subscriber</h2>
            <form onSubmit={handleAddSubscriber}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="tel"
                    value={newSubscriber.phone}
                    onChange={(e) => setNewSubscriber((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1234567890"
                    required
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Name (Optional)
                  </label>
                  <Input
                    type="text"
                    value={newSubscriber.name}
                    onChange={(e) => setNewSubscriber((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="John Doe"
                    className="w-full"
                  />
                </div>
              </div>
              <div className="mt-6 flex gap-4">
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                  loading={adding}
                >
                  Add Subscriber
                </Button>
                <Button
                  type="button"
                  variant="bordered"
                  onClick={() => {
                    setShowAddModal(false);
                    setNewSubscriber({ phone: "", name: "" });
                  }}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
