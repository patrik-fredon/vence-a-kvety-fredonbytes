"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import DashboardOverview from "./DashboardOverview";
import ProductManagement from "./ProductManagement";
import OrderManagement from "./OrderManagement";
import InventoryManagement from "./InventoryManagement";
import AdminActivityLog from "./AdminActivityLog";
import { MonitoringDashboard } from "./MonitoringDashboard";

type AdminView = "overview" | "products" | "orders" | "inventory" | "activity" | "monitoring";

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

export default function AdminDashboard() {
  const t = useTranslations("admin");
  const [currentView, setCurrentView] = useState<AdminView>("overview");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch("/api/admin/dashboard/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case "overview":
        return <DashboardOverview stats={stats} onRefresh={fetchDashboardStats} />;
      case "products":
        return <ProductManagement />;
      case "orders":
        return <OrderManagement />;
      case "inventory":
        return <InventoryManagement />;
      case "activity":
        return <AdminActivityLog />;
      case "monitoring":
        return <MonitoringDashboard />;
      default:
        return <DashboardOverview stats={stats} onRefresh={fetchDashboardStats} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <AdminSidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        stats={stats}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader currentView={currentView} onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          {renderCurrentView()}
        </main>
      </div>
    </div>
  );
}
