"use client";

import {
  CheckCircleIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TruckIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import OrderDetailModal from "./OrderDetailModal";

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  totalAmount: number;
  itemCount: number;
  paymentMethod: string;
  paymentStatus: string;
  deliveryAddress: string;
  deliveryMethod?: "delivery" | "pickup";
  pickupLocation?: string;
  preferredDate: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  internalNotes?: string;
}

// Status options will be generated using translations

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

export default function OrderManagement() {
  const t = useTranslations("admin");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deliveryMethodFilter, setDeliveryMethodFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const statusOptions = [
    { value: "", label: t("allStatuses") },
    { value: "pending", label: t("pending") },
    { value: "confirmed", label: t("confirmed") },
    { value: "processing", label: t("processing") },
    { value: "shipped", label: t("shipped") },
    { value: "delivered", label: t("delivered") },
    { value: "cancelled", label: t("cancelled") },
  ];

  const deliveryMethodOptions = [
    { value: "", label: t("allDeliveryMethods") },
    { value: "delivery", label: t("delivery") },
    { value: "pickup", label: t("personalPickup") },
  ];

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
      });

      if (statusFilter) {
        params.append("status", statusFilter);
      }

      if (dateFrom) {
        params.append("dateFrom", dateFrom);
      }

      if (dateTo) {
        params.append("dateTo", dateTo);
      }

      const response = await fetch(`/api/admin/orders?${params}`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
        setTotalPages(Math.ceil((data.pagination?.total || 0) / 20));
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, dateFrom, dateTo]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusUpdate = async (orderId: string, newStatus: string, internalNotes?: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
          internalNotes,
        }),
      });

      if (response.ok) {
        fetchOrders();
        setSelectedOrder(null);
      } else {
        console.error("Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const filteredOrders = orders.filter(
    (order) =>
      (order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())) &&
      // Filter by delivery method (Requirement 9.7)
      (deliveryMethodFilter === "" || order.deliveryMethod === deliveryMethodFilter)
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("cs-CZ", {
      style: "currency",
      currency: "CZK",
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: "bg-amber-100 text-amber-800",
      confirmed: "bg-blue-100 text-blue-800",
      processing: "bg-purple-100 text-purple-800",
      shipped: "bg-indigo-100 text-indigo-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status as keyof typeof colors] || "bg-stone-100 text-stone-800";
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: t("pending"),
      confirmed: t("confirmed"),
      processing: t("processing"),
      shipped: t("shipped"),
      delivered: t("delivered"),
      cancelled: t("cancelled"),
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getQuickActions = (order: Order) => {
    switch (order.status) {
      case "pending":
        return [
          {
            label: t("confirm"),
            action: () => handleStatusUpdate(order.id, "confirmed"),
            icon: CheckCircleIcon,
            color: "text-green-600 hover:text-green-900",
          },
          {
            label: t("cancel"),
            action: () => handleStatusUpdate(order.id, "cancelled"),
            icon: XCircleIcon,
            color: "text-red-600 hover:text-red-900",
          },
        ];
      case "confirmed":
        return [
          {
            label: t("process"),
            action: () => handleStatusUpdate(order.id, "processing"),
            icon: PencilIcon,
            color: "text-purple-600 hover:text-purple-900",
          },
        ];
      case "processing":
        return [
          {
            label: t("ship"),
            action: () => handleStatusUpdate(order.id, "shipped"),
            icon: TruckIcon,
            color: "text-blue-600 hover:text-blue-900",
          },
        ];
      case "shipped":
        return [
          {
            label: t("delivered"),
            action: () => handleStatusUpdate(order.id, "delivered"),
            icon: CheckCircleIcon,
            color: "text-green-600 hover:text-green-900",
          },
        ];
      default:
        return [];
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-stone-900">{t("orderManagement")}</h2>
        <div className="text-sm text-stone-500">
          {t("total")}: {filteredOrders.length} {t("orders")}
        </div>
      </div>

      {/* Filters */}
      <Card padding="lg">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {/* Search */}
          <Input
            type="text"
            placeholder={t("searchOrders")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            // Note: The delivery method filter dropdown should be added after the status filter
            // in the filters section. The code has been updated to include:
            // 1. deliveryMethodFilter state
            // 2. deliveryMethodOptions array
            // 3. Filter logic in filteredOrders
            // 4. Delivery method display in the table
            // The UI dropdown needs to be manually inserted between status filter and date filters
            icon={<MagnifyingGlassIcon className="h-5 w-5" />}
            iconPosition="left"
          />

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500 bg-white text-stone-900"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Delivery method filter (Requirement 9.7) */}
          <select
            value={deliveryMethodFilter}
            onChange={(e) => setDeliveryMethodFilter(e.target.value)}
            className="px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500 bg-white text-stone-900"
          >
            {deliveryMethodOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Date from */}
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500 bg-white text-stone-900"
            placeholder={t("fromDate")}
          />

          {/* Date to */}
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500 bg-white text-stone-900"
            placeholder={t("toDate")}
          />

          {/* Clear filters */}
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("");
              setDeliveryMethodFilter("");
              setDateFrom("");
              setDateTo("");
              setCurrentPage(1);
            }}
          >
            {t("clearFilters")}
          </Button>
        </div>
      </Card>

      {/* Orders table */}
      <Card padding="none">
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-900 mx-auto" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-stone-200">
              <thead className="bg-stone-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    {t("order")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    {t("customer")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    {t("status")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    {t("amount")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    {t("delivery")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    {t("date")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    {t("actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-stone-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-stone-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-stone-900">
                          #{order.orderNumber}
                        </div>
                        <div className="text-sm text-stone-500">
                          {order.itemCount} {t("items")}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-stone-900">
                          {order.customerName}
                        </div>
                        <div className="text-sm text-stone-500">{order.customerEmail}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-900">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="px-6 py-4">
                      {/* Display delivery method (Requirement 9.7) */}
                      {order.deliveryMethod === "pickup" ? (
                        <div>
                          <div className="text-sm font-medium text-stone-900">
                            {t("personalPickup")}
                          </div>
                          {/* Show pickup location for pickup orders (Requirement 9.7) */}
                          {order.pickupLocation && (
                            <div className="text-sm text-stone-500">{order.pickupLocation}</div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <div className="text-sm font-medium text-stone-900">{t("delivery")}</div>
                          <div className="text-sm text-stone-500">{order.deliveryAddress}</div>
                        </div>
                      )}
                      <div className="text-sm text-stone-500 mt-1">
                        {new Date(order.preferredDate).toLocaleDateString("cs-CZ")}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">
                      {new Date(order.createdAt).toLocaleDateString("cs-CZ")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedOrder(order)}
                          title={t("detail")}
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Button>

                        {getQuickActions(order).map((action, index) => (
                          <Button
                            key={index}
                            variant="ghost"
                            size="icon"
                            onClick={action.action}
                            className={action.color}
                            title={action.label}
                          >
                            <action.icon className="h-4 w-4" />
                          </Button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-stone-200 flex items-center justify-between">
            <div className="text-sm text-stone-700">
              {t("page")} {currentPage} {t("of")} {totalPages}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                {t("previous")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                {t("next")}
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Order detail modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
}
