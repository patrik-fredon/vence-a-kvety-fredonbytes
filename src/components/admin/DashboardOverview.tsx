'use client';

import { useEffect, useState } from 'react';
import {
  ShoppingBagIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';

interface DashboardStats {
  orders: {
    total: number;
    pending: number;
    today: number;
  };
  products: {
    total: number;
    low_stock: number;
    out_of_stock: number;
  };
  revenue: {
    total: number;
    this_month: number;
  };
  alerts: {
    unacknowledged: number;
  };
}

interface DashboardOverviewProps {
  stats: DashboardStats | null;
  onRefresh: () => void;
}

export default function DashboardOverview({ stats, onRefresh }: DashboardOverviewProps) {
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentOrders();
  }, []);

  const fetchRecentOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders?limit=5');
      if (response.ok) {
        const data = await response.json();
        setRecentOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Failed to fetch recent orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK'
    }).format(amount);
  };

  const statCards = [
    {
      title: 'Celkové objednávky',
      value: stats?.orders.total || 0,
      subtitle: `${stats?.orders.pending || 0} čekajících`,
      icon: ClipboardDocumentListIcon,
      color: 'blue',
      trend: stats?.orders.today || 0,
      trendLabel: 'dnes'
    },
    {
      title: 'Aktivní produkty',
      value: stats?.products.total || 0,
      subtitle: `${(stats?.products.low_stock || 0) + (stats?.products.out_of_stock || 0)} upozornění`,
      icon: ShoppingBagIcon,
      color: 'green',
      trend: null,
      trendLabel: ''
    },
    {
      title: 'Celkové tržby',
      value: formatCurrency(stats?.revenue.total || 0),
      subtitle: `${formatCurrency(stats?.revenue.this_month || 0)} tento měsíc`,
      icon: CurrencyDollarIcon,
      color: 'purple',
      trend: null,
      trendLabel: ''
    },
    {
      title: 'Upozornění',
      value: stats?.alerts.unacknowledged || 0,
      subtitle: 'nepotvrzených',
      icon: ExclamationTriangleIcon,
      color: stats?.alerts.unacknowledged ? 'red' : 'gray',
      trend: null,
      trendLabel: ''
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-500 text-white',
      green: 'bg-green-500 text-white',
      purple: 'bg-purple-500 text-white',
      red: 'bg-red-500 text-white',
      gray: 'bg-gray-500 text-white'
    };
    return colors[color as keyof typeof colors] || colors.gray;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Přehled</h2>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Obnovit data
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{card.value}</p>
                <p className="text-sm text-gray-500 mt-1">{card.subtitle}</p>

                {card.trend !== null && (
                  <div className="flex items-center mt-2">
                    <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">
                      +{card.trend} {card.trendLabel}
                    </span>
                  </div>
                )}
              </div>

              <div className={`p-3 rounded-lg ${getColorClasses(card.color)}`}>
                <card.icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Nejnovější objednávky</h3>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            </div>
          ) : recentOrders.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Objednávka
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Zákazník
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stav
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Částka
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Datum
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentOrders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order.orderNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.customerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {order.status === 'pending' ? 'Čekající' :
                         order.status === 'confirmed' ? 'Potvrzeno' :
                         order.status === 'shipped' ? 'Odesláno' :
                         order.status === 'delivered' ? 'Doručeno' :
                         'Zrušeno'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('cs-CZ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-6 text-center text-gray-500">
              Žádné objednávky k zobrazení
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Rychlé akce</h4>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
              Přidat nový produkt
            </button>
            <button className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
              Zobrazit čekající objednávky
            </button>
            <button className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
              Zkontrolovat zásoby
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Systémové informace</h4>
          <div className="space-y-2 text-sm text-gray-600">
            <p>Verze: 1.0.0</p>
            <p>Poslední aktualizace: {new Date().toLocaleDateString('cs-CZ')}</p>
            <p>Stav systému: <span className="text-green-600 font-medium">Online</span></p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Podpora</h4>
          <div className="space-y-3">
            <a
              href="mailto:support@pohrebni-vence.cz"
              className="block text-sm text-blue-600 hover:text-blue-800"
            >
              Technická podpora
            </a>
            <a
              href="/admin/help"
              className="block text-sm text-blue-600 hover:text-blue-800"
            >
              Dokumentace
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
