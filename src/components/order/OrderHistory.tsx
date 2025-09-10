"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Order, OrderStatus } from "@/types/order";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface OrderHistoryProps {
  locale: string;
}

interface OrderSummary {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  itemCount: number;
  createdAt: string;
  deliveryAddress: string;
  customerName: string;
  deliveryDate?: string;
  paymentMethod?: string;
  items: Array<{
    productName: string;
    quantity: number;
    unitPrice: number;
  }>;
}

interface OrderHistoryResponse {
  success: boolean;
  orders?: OrderSummary[];
  error?: string;
}

type OrderFilter = "all" | OrderStatus;
type OrderSort = "newest" | "oldest" | "amount-high" | "amount-low";

export function OrderHistory({ locale }: OrderHistoryProps) {
  const t = useTranslations("order");
  const [allOrders, setAllOrders] = useState<OrderSummary[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<OrderFilter>("all");
  const [sort, setSort] = useState<OrderSort>("newest");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchOrderHistory();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [allOrders, filter, sort, searchTerm]);

  const fetchOrderHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/orders");
      const data: OrderHistoryResponse = await response.json();

      if (data.success && data.orders) {
        // Transform orders for display
        const transformedOrders: OrderSummary[] = data.orders.map((order: any) => ({
          id: order.id,
          orderNumber: order.customer_info?.orderNumber || order.id.slice(-8).toUpperCase(),
          status: order.status,
          totalAmount: order.total_amount,
          itemCount: order.items?.itemCount || 0,
          createdAt: order.created_at,
          deliveryAddress: `${order.delivery_info?.address?.city || ""}, ${order.delivery_info?.address?.postalCode || ""}`,
        }));
        setAllOrders(transformedOrders);
      } else {
        setError(data.error || "Nepodařilo se načíst historii objednávek");
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

      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusLabel = (status: OrderStatus): string => {
    const labels: Record<OrderStatus, string> = {
      pending: locale === "cs" ? "Čeká na zpracování" : "Pending",
      confirmed: locale === "cs" ? "Potvrzeno" : "Confirmed",
      processing: locale === "cs" ? "Zpracovává se" : "Processing",
      shipped: locale === "cs" ? "Odesláno" : "Shipped",
      delivered: locale === "cs" ? "Doručeno" : "Delivered",
      cancelled: locale === "cs" ? "Zrušeno" : "Cancelled",
    };
    return labels[status] || status;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const applyFiltersAndSort = () => {
    let filtered = [...allOrders];

    // Apply status filter
    if (filter !== "all") {
      filtered = filtered.filter((order) => order.status === filter);
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(term) ||
          order.deliveryAddress.toLowerCase().includes(term)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sort) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "amount-high":
          return b.totalAmount - a.totalAmount;
        case "amount-low":
          return a.totalAmount - b.totalAmount;
        default:
          return 0;
      }
    });

    setFilteredOrders(filtered);
  };

  const getFilterLabel = (filterValue: OrderFilter): string => {
    const labels: Record<OrderFilter, string> = {
      all: locale === "cs" ? "Všechny" : "All",
      pending: locale === "cs" ? "Čeká na zpracování" : "Pending",
      confirmed: locale === "cs" ? "Potvrzeno" : "Confirmed",
      processing: locale === "cs" ? "Zpracovává se" : "Processing",
      shipped: locale === "cs" ? "Odesláno" : "Shipped",
      delivered: locale === "cs" ? "Doručeno" : "Delivered",
      cancelled: locale === "cs" ? "Zrušeno" : "Cancelled",
    };
    return labels[filterValue];
  };

  const getSortLabel = (sortValue: OrderSort): string => {
    const labels = {
      newest: locale === "cs" ? "Nejnovější" : "Newest First",
      oldest: locale === "cs" ? "Nejstarší" : "Oldest First",
      "amount-high": locale === "cs" ? "Nejvyšší částka" : "Highest Amount",
      "amount-low": locale === "cs" ? "Nejnižší částka" : "Lowest Amount",
    };
    return labels[sortValue];
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

  if (allOrders.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          {locale === "cs" ? "Žádné objednávky" : "No orders"}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {locale === "cs"
            ? "Zatím jste neprovedli žádné objednávky."
            : "You haven't placed any orders yet."}
        </p>
        <div className="mt-6">
          <Link
            href={`/${locale}/products`}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {locale === "cs" ? "Prohlédnout produkty" : "Browse Products"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">
            {locale === "cs" ? "Historie objednávek" : "Order History"}
          </h2>
          <button
            onClick={fetchOrderHistory}
            disabled={loading}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {locale === "cs" ? "Aktualizovat" : "Refresh"}
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder={
                  locale === "cs"
                    ? "Hledat podle čísla objednávky nebo adresy..."
                    : "Search by order number or address..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="sm:w-48">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as OrderFilter)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              {(
                [
                  "all",
                  "pending",
                  "confirmed",
                  "processing",
                  "shipped",
                  "delivered",
                  "cancelled",
                ] as OrderFilter[]
              ).map((filterOption) => (
                <option key={filterOption} value={filterOption}>
                  {getFilterLabel(filterOption)}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="sm:w-48">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as OrderSort)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              {(["newest", "oldest", "amount-high", "amount-low"] as OrderSort[]).map(
                (sortOption) => (
                  <option key={sortOption} value={sortOption}>
                    {getSortLabel(sortOption)}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        {/* Results Summary */}
        {allOrders.length > 0 && (
          <div className="text-sm text-gray-600">
            {locale === "cs"
              ? `Zobrazeno ${filteredOrders.length} z ${allOrders.length} objednávek`
              : `Showing ${filteredOrders.length} of ${allOrders.length} orders`}
          </div>
        )}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 && allOrders.length > 0 ? (
        <div className="text-center py-8">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {locale === "cs" ? "Žádné objednávky nenalezeny" : "No orders found"}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {locale === "cs"
              ? "Zkuste změnit filtry nebo vyhledávací kritéria."
              : "Try adjusting your filters or search criteria."}
          </p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredOrders.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/${locale}/orders/${order.id}`}
                  className="block hover:bg-gray-50 px-4 py-4 sm:px-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <svg
                            className="h-6 w-6 text-gray-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-indigo-600 truncate">
                            #{order.orderNumber}
                          </p>
                          <div
                            className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}
                          >
                            {getStatusLabel(order.status)}
                          </div>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <svg
                            className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <p>{formatDate(order.createdAt)}</p>
                          <span className="mx-2">•</span>
                          <p>
                            {order.itemCount}{" "}
                            {order.itemCount === 1
                              ? locale === "cs"
                                ? "položka"
                                : "item"
                              : locale === "cs"
                                ? "položek"
                                : "items"}
                          </p>
                          {order.deliveryAddress && (
                            <>
                              <span className="mx-2">•</span>
                              <p>{order.deliveryAddress}</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {order.totalAmount.toLocaleString(locale)} Kč
                        </p>
                      </div>
                      <svg
                        className="ml-2 h-5 w-5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
