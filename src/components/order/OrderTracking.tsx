"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Order, OrderStatus } from "@/types/order";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface OrderTrackingProps {
  orderId: string;
  locale: string;
}

interface StatusHistoryItem {
  status: OrderStatus;
  timestamp: string;
  description: string;
}

interface OrderHistoryResponse {
  success: boolean;
  order?: {
    id: string;
    orderNumber: string;
    status: OrderStatus;
    totalAmount: number;
    createdAt: string;
  };
  statusHistory?: StatusHistoryItem[];
  error?: string;
}

export function OrderTracking({ orderId, locale }: OrderTrackingProps) {
  const t = useTranslations("order");
  const [order, setOrder] = useState<OrderHistoryResponse["order"] | null>(null);
  const [statusHistory, setStatusHistory] = useState<StatusHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrderHistory();
  }, [orderId]);

  const fetchOrderHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/orders/${orderId}/history`);
      const data: OrderHistoryResponse = await response.json();

      if (data.success && data.order && data.statusHistory) {
        setOrder(data.order);
        setStatusHistory(data.statusHistory);
      } else {
        setError(data.error || "Nepodařilo se načíst historii objednávky");
      }
    } catch (err) {
      console.error("Error fetching order history:", err);
      setError("Chyba při načítání dat");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: OrderStatus): string => {
    switch (status) {
<<<<<<< HEAD
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "processing":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "shipped":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
=======
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'processing':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'ready':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'refunded':
        return 'bg-gray-100 text-gray-800 border-gray-200';
>>>>>>> 2de4c3c (Api routing problem, non functional state)
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusLabel = (status: OrderStatus): string => {
<<<<<<< HEAD
    const labels = {
      pending: locale === "cs" ? "Čeká na zpracování" : "Pending",
      confirmed: locale === "cs" ? "Potvrzeno" : "Confirmed",
      processing: locale === "cs" ? "Zpracovává se" : "Processing",
      shipped: locale === "cs" ? "Odesláno" : "Shipped",
      delivered: locale === "cs" ? "Doručeno" : "Delivered",
      cancelled: locale === "cs" ? "Zrušeno" : "Cancelled",
=======
    const labels: Record<OrderStatus, string> = {
      pending: locale === 'cs' ? 'Čeká na zpracování' : 'Pending',
      confirmed: locale === 'cs' ? 'Potvrzeno' : 'Confirmed',
      processing: locale === 'cs' ? 'Zpracovává se' : 'Processing',
      ready: locale === 'cs' ? 'Připraveno' : 'Ready',
      shipped: locale === 'cs' ? 'Odesláno' : 'Shipped',
      delivered: locale === 'cs' ? 'Doručeno' : 'Delivered',
      cancelled: locale === 'cs' ? 'Zrušeno' : 'Cancelled',
      refunded: locale === 'cs' ? 'Vráceno' : 'Refunded'
>>>>>>> 2de4c3c (Api routing problem, non functional state)
    };
    return labels[status] || status;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              {locale === "cs" ? "Chyba při načítání" : "Loading Error"}
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">
          {locale === "cs" ? "Objednávka nebyla nalezena" : "Order not found"}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Order Header */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {locale === "cs" ? "Objednávka" : "Order"} #{order.orderNumber}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {locale === "cs" ? "Vytvořeno" : "Created"}: {formatDate(order.createdAt)}
              </p>
            </div>
            <div className="text-right">
              <div
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}
              >
                {getStatusLabel(order.status)}
              </div>
              <p className="text-lg font-semibold text-gray-900 mt-2">
                {order.totalAmount.toLocaleString(locale)} Kč
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Timeline */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            {locale === "cs" ? "Historie objednávky" : "Order History"}
          </h2>
        </div>
        <div className="px-6 py-4">
          {statusHistory.length > 0 ? (
            <div className="flow-root">
              <ul className="-mb-8">
                {statusHistory.map((item, index) => (
                  <li key={index}>
                    <div className="relative pb-8">
                      {index !== statusHistory.length - 1 && (
                        <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      )}
                      <div className="relative flex space-x-3">
                        <div>
                          <span
                            className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                              item.status === order.status ? "bg-green-500" : "bg-gray-400"
                            }`}
                          >
                            <svg
                              className="h-4 w-4 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {getStatusLabel(item.status)}
                            </p>
                            <p className="text-sm text-gray-500">{item.description}</p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            {formatDate(item.timestamp)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              {locale === "cs" ? "Žádná historie není k dispozici" : "No history available"}
            </p>
          )}
        </div>
      </div>

      {/* Refresh Button */}
      <div className="mt-6 text-center">
        <button
          onClick={fetchOrderHistory}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? (
            <>
              <LoadingSpinner className="w-4 h-4 mr-2" />
              {locale === "cs" ? "Načítání..." : "Loading..."}
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              {locale === "cs" ? "Aktualizovat" : "Refresh"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
