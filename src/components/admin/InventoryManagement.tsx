"use client";

import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

interface InventoryAlert {
  id: string;
  product: {
    name_cs: string;
    name_en: string;
    slug: string;
  };
  alert_type: "low_stock" | "out_of_stock";
  current_stock: number;
  threshold: number;
  acknowledged: boolean;
  created_at: string;
}

interface Product {
  id: string;
  name_cs: string;
  slug: string;
  stock_quantity: number;
  low_stock_threshold: number;
  track_inventory: boolean;
  category: {
    name_cs: string;
  } | null;
}

export default function InventoryManagement() {
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAcknowledged, setShowAcknowledged] = useState(false);
  const [activeTab, setActiveTab] = useState<"alerts" | "inventory">("alerts");

  useEffect(() => {
    fetchAlerts();
    fetchInventoryProducts();
  }, [showAcknowledged]);

  const fetchAlerts = async () => {
    try {
      const response = await fetch(`/api/admin/inventory/alerts?acknowledged=${showAcknowledged}`);
      if (response.ok) {
        const data = await response.json();
        setAlerts(data.alerts || []);
      }
    } catch (error) {
      console.error("Failed to fetch alerts:", error);
    }
  };

  const fetchInventoryProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/products?trackInventory=true&limit=100");
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error("Failed to fetch inventory products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      const response = await fetch(`/api/admin/inventory/alerts/${alertId}/acknowledge`, {
        method: "POST",
      });

      if (response.ok) {
        fetchAlerts();
      }
    } catch (error) {
      console.error("Failed to acknowledge alert:", error);
    }
  };

  const handleUpdateStock = async (productId: string, newStock: number) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}/inventory`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ stock_quantity: newStock }),
      });

      if (response.ok) {
        fetchInventoryProducts();
        fetchAlerts();
      }
    } catch (error) {
      console.error("Failed to update stock:", error);
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name_cs.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAlertIcon = (alertType: string) => {
    return alertType === "out_of_stock" ? XCircleIcon : ExclamationTriangleIcon;
  };

  const getAlertColor = (alertType: string) => {
    return alertType === "out_of_stock"
      ? "text-red-600 bg-red-100"
      : "text-yellow-600 bg-yellow-100";
  };

  const getStockStatus = (product: Product) => {
    if (!product.track_inventory) return { label: "Nesledováno", color: "text-gray-500" };
    if (product.stock_quantity === 0) return { label: "Vyprodáno", color: "text-red-600" };
    if (product.stock_quantity <= product.low_stock_threshold)
      return { label: "Nízké zásoby", color: "text-yellow-600" };
    return { label: "Dostupné", color: "text-green-600" };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Skladové zásoby</h2>
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab("alerts")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === "alerts"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Upozornění ({alerts.length})
          </button>
          <button
            onClick={() => setActiveTab("inventory")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === "inventory"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Zásoby ({products.length})
          </button>
        </div>
      </div>

      {activeTab === "alerts" && (
        <div className="space-y-6">
          {/* Alert filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showAcknowledged}
                onChange={(e) => setShowAcknowledged(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Zobrazit potvrzená upozornění</span>
            </label>
          </div>

          {/* Alerts list */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {alerts.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                {showAcknowledged ? "Žádná potvrzená upozornění" : "Žádná aktivní upozornění"}
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {alerts.map((alert) => {
                  const AlertIcon = getAlertIcon(alert.alert_type);
                  return (
                    <div key={alert.id} className="p-6 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-full ${getAlertColor(alert.alert_type)}`}>
                          <AlertIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">
                            {alert.product.name_cs}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {alert.alert_type === "out_of_stock"
                              ? "Vyprodáno"
                              : `Nízké zásoby (${alert.current_stock} ks, práh: ${alert.threshold} ks)`}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(alert.created_at).toLocaleString("cs-CZ")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {!alert.acknowledged && (
                          <button
                            onClick={() => handleAcknowledgeAlert(alert.id)}
                            className="flex items-center px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                          >
                            <CheckCircleIcon className="h-4 w-4 mr-1" />
                            Potvrdit
                          </button>
                        )}
                        <a
                          href={`/products/${alert.product.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Zobrazit produkt
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "inventory" && (
        <div className="space-y-6">
          {/* Search */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Hledat produkty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Inventory table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Produkt
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kategorie
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aktuální zásoby
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Práh upozornění
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stav
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Akce
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProducts.map((product) => {
                      const status = getStockStatus(product);
                      return (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {product.name_cs}
                              </div>
                              <div className="text-sm text-gray-500">{product.slug}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {product.category?.name_cs || "Bez kategorie"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="number"
                              min="0"
                              value={product.stock_quantity}
                              onChange={(e) => {
                                const newValue = parseInt(e.target.value) || 0;
                                if (newValue !== product.stock_quantity) {
                                  handleUpdateStock(product.id, newValue);
                                }
                              }}
                              className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <span className="ml-1 text-sm text-gray-500">ks</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {product.low_stock_threshold} ks
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-sm font-medium ${status.color}`}>
                              {status.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <a
                              href={`/products/${product.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Zobrazit
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
