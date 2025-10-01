"use client";

import {
  ChartBarIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  HomeIcon,
  ShoppingBagIcon,
  XMarkIcon,
} from "@/lib/icons";
import { useTranslations } from "next-intl";

type AdminView = "overview" | "products" | "orders" | "inventory" | "activity" | "monitoring";

interface AdminSidebarProps {
  currentView: AdminView;
  onViewChange: (view: AdminView) => void;
  isOpen: boolean;
  onToggle: () => void;
  stats?: {
    orders: { pending: number };
    products: { low_stock: number; out_of_stock: number };
    alerts: { unacknowledged: number };
  } | null;
}

export default function AdminSidebar({
  currentView,
  onViewChange,
  isOpen,
  onToggle,
  stats,
}: AdminSidebarProps) {
  const t = useTranslations("admin");

  const navigation = [
    {
      id: "overview" as AdminView,
      name: t("overview"),
      icon: HomeIcon,
      badge: null,
    },
    {
      id: "products" as AdminView,
      name: t("products"),
      icon: ShoppingBagIcon,
      badge: null,
    },
    {
      id: "orders" as AdminView,
      name: t("orders"),
      icon: ClipboardDocumentListIcon,
      badge: stats?.orders.pending || 0,
    },
    {
      id: "inventory" as AdminView,
      name: t("inventory"),
      icon: CubeIcon,
      badge: (stats?.products.low_stock || 0) + (stats?.products.out_of_stock || 0),
    },
    {
      id: "activity" as AdminView,
      name: t("activity"),
      icon: ClockIcon,
      badge: null,
    },
    {
      id: "monitoring" as AdminView,
      name: t("monitoring"),
      icon: ChartBarIcon,
      badge: null,
    },
  ];

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
    lg:translate-x-0 lg:static lg:inset-0
    ${isOpen ? "translate-x-0" : "-translate-x-full"}
  `;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-stone-600 bg-opacity-75 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={sidebarClasses}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-stone-200">
            <h1 className="text-xl font-semibold text-stone-900">{t("adminPanel")}</h1>
            <button
              onClick={onToggle}
              className="lg:hidden p-2 rounded-md text-stone-400 hover:text-stone-500 hover:bg-stone-100 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onViewChange(item.id);
                    if (window.innerWidth < 1024) {
                      onToggle();
                    }
                  }}
                  className={`
                    w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${isActive
                      ? "bg-amber-100 text-amber-800 border border-amber-200"
                      : "text-stone-700 hover:bg-stone-100"
                    }
                  `}
                >
                  <div className="flex items-center">
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </div>

                  {item.badge !== null && item.badge > 0 && (
                    <span
                      className={`
                      inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded-full
                      ${item.id === "inventory"
                          ? "bg-red-100 text-red-800"
                          : "bg-amber-100 text-amber-800"
                        }
                    `}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Alerts section */}
          {stats?.alerts.unacknowledged && stats.alerts.unacknowledged > 0 && (
            <div className="p-4 border-t border-stone-200">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 text-amber-400 mr-2" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-800">
                      {stats.alerts.unacknowledged} {t("unacknowledgedAlerts")}
                    </p>
                    <p className="text-amber-700">{t("checkInventory")}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="p-4 border-t border-stone-200">
            <p className="text-xs text-stone-500 text-center">{t("adminFooter")}</p>
          </div>
        </div>
      </div>
    </>
  );
}
