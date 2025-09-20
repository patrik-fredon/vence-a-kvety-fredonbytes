"use client";

import { useState, useEffect } from "react";
import {
  EyeIcon,
  PencilIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckCircleIcon,
  TruckIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
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
  preferredDate: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  internalNotes?: string;
}

const statusOptions = [
  { value: "", label: "Všechny stavy" },
  { value: "pending", label: "Čekající" },
  { value: "confirmed", label: "Potvrzeno" },
  { value: "processing", label: "Zpracovává se" },
  { value: "shipped", label: "Odesláno" },
  { value: "delivered", label: "Doručeno" },
  { value: "cancelled", label: "Zrušeno" },
];

"use client";

import { useState, useEffect } from "react";
import {
  EyeIcon,
  PencilIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckCircleIcon,
  TruckIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
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
  preferredDate: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  internalNotes?: string;
}

const statusOptions = [
  { value: "", label: "Všechny stavy" },
  { value: "pending", label: "Čekající" },
  { value: "confirmed", label: "Potvrzeno" },
  { value: "processing", label: "Zpracovává se" },
  { value: "shipped", label: "Odesláno" },
  { value: "delivered", label: "Doručeno" },
  { value: "cancelled", label: "Zrušeno" },
];

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchOrders();
  }, [currentPage, statusFilter, dateFrom, dateTo]);

  const fetchOrders = async () => {
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
  };

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
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
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
      pending: "Čekající",
      confirmed: "Potvrzeno",
      processing: "Zpracovává se",
      shipped: "Odesláno",
      delivered: "Doručeno",
      cancelled: "Zrušeno",
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getQuickActions = (order: Order) => {
    switch (order.status) {
      case "pending":
        return [
          {
            label: "Potvrdit",
            action: () => handleStatusUpdate(order.id, "confirmed"),
            icon: CheckCircleIcon,
            color: "text-green-600 hover:text-green-900",
          },
          {
            label: "Zrušit",
            action: () => handleStatusUpdate(order.id, "cancelled"),
            icon: XCircleIcon,
            color: "text-red-600 hover:text-red-900",
          },
        ];
      case "confirmed":
        return [
          {
            label: "Zpracovat",
            action: () => handleStatusUpdate(order.id, "processing"),
            icon: PencilIcon,
            color: "text-purple-600 hover:text-purple-900",
          },
        ];
      case "processing":
        return [
          {
            label: "Odeslat",
            action: () => handleStatusUpdate(order.id, "shipped"),
            icon: TruckIcon,
            color: "text-blue-600 hover:text-blue-900",
          },
        ];
      case "shipped":
        return [
          {
            label: "Doručeno",
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
        <h2 className="text-2xl font-bold text-stone-900">Správa objednávek</h2>
        <div className="text-sm text-stone-500">Celkem: {filteredOrders.length} objednávek</div>
      </div>

      {/* Filters */}
      <Card padding="lg">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <Input
            type="text"
            placeholder="Hledat objednávky..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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

          {/* Date from */}
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500 bg-white text-stone-900"
            placeholder="Od data"
          />

          {/* Date to */}
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500 bg-white text-stone-900"
            placeholder="Do data"
          />

          {/* Clear filters */}
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("");
              setDateFrom("");
              setDateTo("");
              setCurrentPage(1);
            }}
          >
            Vymazat filtry
          </Button>
        </div>
      </Card>

      {/* Orders table */}
      <Card padding="none">
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-900 mx-auto"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-stone-200">
              <thead className="bg-stone-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    Objednávka
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    Zákazník
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    Stav
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    Částka
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    Doručení
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    Datum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    Akce
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
                        <div className="text-sm text-stone-500">{order.itemCount} položek</div>
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
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}
                      >
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-900">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-stone-900">{order.deliveryAddress}</div>
                      <div className="text-sm text-stone-500">
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
                          title="Detail"
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
              Stránka {currentPage} z {totalPages}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Předchozí
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Další
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
