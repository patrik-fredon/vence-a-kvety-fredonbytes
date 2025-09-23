"use client";

import {
  ArrowPathIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

interface ErrorLog {
  id: string;
  error_id: string;
  message: string;
  level: string;
  context?: string;
  timestamp: string;
  url: string;
  resolved: boolean;
  created_at: string;
}

interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  timestamp: string;
  url: string;
}

interface MonitoringStats {
  errors: {
    total: number;
    unresolved: number;
    critical: number;
    last24h: number;
  };
  performance: {
    totalMetrics: number;
    averageValues: Record<string, number>;
    ratingDistribution: {
      good: number;
      "needs-improvement": number;
      poor: number;
    };
  };
}

export function MonitoringDashboard() {
  const [stats, setStats] = useState<MonitoringStats | null>(null);
  const [recentErrors, setRecentErrors] = useState<ErrorLog[]>([]);
  const [recentMetrics, setRecentMetrics] = useState<PerformanceMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "errors" | "performance">("overview");

  useEffect(() => {
    fetchMonitoringData();

    // Refresh data every 30 seconds
    const interval = setInterval(fetchMonitoringData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchMonitoringData = async () => {
    try {
      const [errorsResponse, performanceResponse] = await Promise.all([
        fetch("/api/monitoring/errors?limit=20"),
        fetch("/api/monitoring/performance?hours=24&limit=50"),
      ]);

      if (errorsResponse.ok && performanceResponse.ok) {
        const errorsData = await errorsResponse.json();
        const performanceData = await performanceResponse.json();

        setRecentErrors(errorsData.errors || []);
        setRecentMetrics(performanceData.metrics || []);

        // Calculate stats
        const errorStats = {
          total: errorsData.errors?.length || 0,
          unresolved: errorsData.errors?.filter((e: ErrorLog) => !e.resolved).length || 0,
          critical: errorsData.errors?.filter((e: ErrorLog) => e.level === "critical").length || 0,
          last24h:
            errorsData.errors?.filter((e: ErrorLog) => {
              const errorTime = new Date(e.created_at).getTime();
              const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
              return errorTime > dayAgo;
            }).length || 0,
        };

        setStats({
          errors: errorStats,
          performance: performanceData.summary || {
            totalMetrics: 0,
            averageValues: {},
            ratingDistribution: { good: 0, "needs-improvement": 0, poor: 0 },
          },
        });
      }
    } catch (error) {
      console.error("Failed to fetch monitoring data:", error);
    } finally {
      setLoading(false);
    }
  };

  const resolveError = async (errorId: string) => {
    try {
      const response = await fetch(`/api/monitoring/errors/${errorId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolved: true }),
      });

      if (response.ok) {
        setRecentErrors((prev) =>
          prev.map((error) => (error.error_id === errorId ? { ...error, resolved: true } : error))
        );
      }
    } catch (error) {
      console.error("Failed to resolve error:", error);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("cs-CZ");
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case "good":
        return "text-green-600 bg-green-50";
      case "needs-improvement":
        return "text-yellow-600 bg-yellow-50";
      case "poor":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "critical":
        return "text-red-600 bg-red-50";
      case "page":
        return "text-orange-600 bg-orange-50";
      case "api":
        return "text-blue-600 bg-blue-50";
      case "component":
        return "text-gray-600 bg-gray-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <ArrowPathIcon className="w-8 h-8 animate-spin text-primary-600" />
        <span className="ml-2 text-gray-600">Načítání monitorovacích dat...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Monitoring & Chyby</h1>
        <button
          onClick={fetchMonitoringData}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <ArrowPathIcon className="w-4 h-4 mr-2" />
          Obnovit
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: "overview", label: "Přehled", icon: ChartBarIcon },
            { id: "errors", label: "Chyby", icon: ExclamationTriangleIcon },
            { id: "performance", label: "Výkon", icon: ClockIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`${
                activeTab === tab.id
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Nevyřešené chyby</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.errors.unresolved}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <XCircleIcon className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Kritické chyby</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.errors.critical}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ClockIcon className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Chyby za 24h</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.errors.last24h}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Dobrý výkon</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.performance.ratingDistribution.good}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Errors Tab */}
      {activeTab === "errors" && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Nedávné chyby</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Seznam posledních chyb v aplikaci
            </p>
          </div>
          <ul className="divide-y divide-gray-200">
            {recentErrors.map((error) => (
              <li key={error.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLevelColor(error.level)}`}
                      >
                        {error.level}
                      </span>
                      {error.resolved && <CheckCircleIcon className="w-5 h-5 text-green-500" />}
                    </div>
                    <p className="text-sm font-medium text-gray-900 mt-2">{error.message}</p>
                    <div className="mt-2 flex items-center text-sm text-gray-500 space-x-4">
                      <span>ID: {error.error_id}</span>
                      <span>{formatTimestamp(error.created_at)}</span>
                      {error.context && <span>Kontext: {error.context}</span>}
                    </div>
                    <p className="text-xs text-gray-400 mt-1 truncate">{error.url}</p>
                  </div>
                  {!error.resolved && (
                    <button
                      onClick={() => resolveError(error.error_id)}
                      className="ml-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                    >
                      Vyřešit
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === "performance" && (
        <div className="space-y-6">
          {/* Web Vitals Summary */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Web Vitals</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Klíčové metriky výkonu webu</p>
            </div>
            <div className="border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 p-6">
                {["LCP", "INP", "CLS", "FCP", "TTFB"].map((metric) => {
                  const value = stats?.performance.averageValues[metric];
                  return (
                    <div key={metric} className="text-center">
                      <dt className="text-sm font-medium text-gray-500">{metric}</dt>
                      <dd className="mt-1 text-2xl font-semibold text-gray-900">
                        {value ? Math.round(value) : "-"}
                        <span className="text-sm text-gray-500 ml-1">
                          {metric === "CLS" ? "" : "ms"}
                        </span>
                      </dd>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recent Performance Metrics */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Nedávné metriky výkonu
              </h3>
            </div>
            <ul className="divide-y divide-gray-200">
              {recentMetrics.slice(0, 10).map((metric) => (
                <li key={metric.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-gray-900">{metric.name}</span>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRatingColor(metric.rating)}`}
                        >
                          {metric.rating}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 space-x-4">
                        <span>
                          {Math.round(metric.value)}
                          {metric.name === "CLS" ? "" : "ms"}
                        </span>
                        <span>{formatTimestamp(metric.timestamp)}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 truncate">{metric.url}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
