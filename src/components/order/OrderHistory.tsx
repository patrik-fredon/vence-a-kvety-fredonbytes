'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Order, OrderStatus } from '@/types/order';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

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

export function OrderHistory({ locale }: OrderHistoryProps) {
  const t = useTranslations('order');
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrderHistory();
  }, []);

  const fetchOrderHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/orders');
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
          deliveryAddress: `${order.delivery_info?.address?.city || ''}, ${order.delivery_info?.address?.postalCode || ''}`
        }));
        setOrders(transformedOrders);
      } else {
        setError(data.error || 'Nepodařilo se načíst historii objednávek');
      }
    } catch (err) {
      console.error('Error fetching order history:', err);
      setError('Chyba při načítání dat');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: OrderStatus): string => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'processing':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: OrderStatus): string => {
    const labels = {
      pending: locale === 'cs' ? 'Čeká na zpracování' : 'Pending',
      confirmed: locale === 'cs' ? 'Potvrzeno' : 'Confirmed',
      processing: locale === 'cs' ? 'Zpracovává se' : 'Processing',
      shipped: locale === 'cs' ? 'Odesláno' : 'Shipped',
      delivered: locale === 'cs' ? 'Doručeno' : 'Delivered',
      cancelled: locale === 'cs' ? 'Zrušeno' : 'Cancelled'
    };
    return labels[status] || status;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              {locale === 'cs' ? 'Chyba při načítání' : 'Loading Error'}
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          {locale === 'cs' ? 'Žádné objednávky' : 'No orders'}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {locale === 'cs'
            ? 'Zatím jste neprovedli žádné objednávky.'
            : 'You haven\'t placed any orders yet.'
          }
        </p>
        <div className="mt-6">
          <Link
            href={`/${locale}/products`}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {locale === 'cs' ? 'Prohlédnout produkty' : 'Browse Products'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">
          {locale === 'cs' ? 'Historie objednávek' : 'Order History'}
        </h2>
        <button
          onClick={fetchOrderHistory}
          disabled={loading}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {locale === 'cs' ? 'Aktualizovat' : 'Refresh'}
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`/${locale}/orders/${order.id}`}
                className="block hover:bg-gray-50 px-4 py-4 sm:px-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-indigo-600 truncate">
                          #{order.orderNumber}
                        </p>
                        <div className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </div>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p>{formatDate(order.createdAt)}</p>
                        <span className="mx-2">•</span>
                        <p>
                          {order.itemCount} {order.itemCount === 1
                            ? (locale === 'cs' ? 'položka' : 'item')
                            : (locale === 'cs' ? 'položek' : 'items')
                          }
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
                    <svg className="ml-2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
