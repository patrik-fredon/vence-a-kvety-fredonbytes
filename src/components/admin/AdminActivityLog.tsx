"use client";

import { ClockIcon, PencilIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

interface ActivityLogEntry {
  id: string;
  action: "INSERT" | "UPDATE" | "DELETE";
  resource_type: string;
  resource_id: string;
  old_values?: any;
  new_values?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  admin: {
    name?: string;
    email: string;
  };
}

export default function AdminActivityLog() {
  const [activities, setActivities] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState<ActivityLogEntry | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchActivities();
  }, [currentPage]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/activity?page=${currentPage}&limit=20`);
      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities || []);
        setTotalPages(Math.ceil((data.total || 0) / 20));
      }
    } catch (error) {
      console.error("Failed to fetch activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "INSERT":
        return PlusIcon;
      case "UPDATE":
        return PencilIcon;
      case "DELETE":
        return TrashIcon;
      default:
        return ClockIcon;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "INSERT":
        return "text-green-600 bg-green-100";
      case "UPDATE":
        return "text-blue-600 bg-blue-100";
      case "DELETE":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case "INSERT":
        return "Vytvořeno";
      case "UPDATE":
        return "Upraveno";
      case "DELETE":
        return "Smazáno";
      default:
        return action;
    }
  };

  const getResourceLabel = (resourceType: string) => {
    switch (resourceType) {
      case "products":
        return "Produkt";
      case "categories":
        return "Kategorie";
      case "orders":
        return "Objednávka";
      default:
        return resourceType;
    }
  };

  const formatChanges = (
    oldValues: any,
    newValues: any
  ): Array<{ field: string; from: any; to: any }> | null => {
    if (!(oldValues || newValues)) return null;

    const changes: Array<{ field: string; from: any; to: any }> = [];

    if (oldValues && newValues) {
      // Update - show what changed
      const keys = new Set([...Object.keys(oldValues), ...Object.keys(newValues)]);
      keys.forEach((key) => {
        if (oldValues[key] !== newValues[key]) {
          changes.push({
            field: key,
            from: oldValues[key],
            to: newValues[key],
          });
        }
      });
    } else if (newValues) {
      // Insert - show new values
      Object.entries(newValues).forEach(([key, value]) => {
        if (key !== "id" && key !== "created_at" && key !== "updated_at") {
          changes.push({
            field: key,
            from: null,
            to: value,
          });
        }
      });
    } else if (oldValues) {
      // Delete - show deleted values
      Object.entries(oldValues).forEach(([key, value]) => {
        if (key !== "id" && key !== "created_at" && key !== "updated_at") {
          changes.push({
            field: key,
            from: value,
            to: null,
          });
        }
      });
    }

    return changes.slice(0, 3); // Show only first 3 changes
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Aktivita administrátorů</h2>
        <button
          onClick={fetchActivities}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Obnovit
        </button>
      </div>

      {/* Activity log */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto" />
          </div>
        ) : activities.length === 0 ? (
          <div className="p-6 text-center text-gray-500">Žádná aktivita k zobrazení</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {activities.map((activity) => {
              const ActionIcon = getActionIcon(activity.action);
              const changes = formatChanges(activity.old_values, activity.new_values);

              return (
                <div key={activity.id} className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`p-2 rounded-full ${getActionColor(activity.action)}`}>
                      <ActionIcon className="h-4 w-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {getActionLabel(activity.action)} -{" "}
                            {getResourceLabel(activity.resource_type)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {activity.admin.name || activity.admin.email}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            {new Date(activity.created_at).toLocaleString("cs-CZ")}
                          </p>
                          {activity.ip_address && (
                            <p className="text-xs text-gray-400">IP: {activity.ip_address}</p>
                          )}
                        </div>
                      </div>

                      {changes && changes.length > 0 && (
                        <div className="mt-3 space-y-1">
                          {changes.map((change, index) => (
                            <div key={index} className="text-xs text-gray-600">
                              <span className="font-medium">{change.field}:</span>
                              {change.from !== null && (
                                <span className="text-red-600 line-through ml-1">
                                  {String(change.from).substring(0, 50)}
                                  {String(change.from).length > 50 ? "..." : ""}
                                </span>
                              )}
                              {change.to !== null && (
                                <span className="text-green-600 ml-1">
                                  {String(change.to).substring(0, 50)}
                                  {String(change.to).length > 50 ? "..." : ""}
                                </span>
                              )}
                            </div>
                          ))}
                          {(formatChanges(activity.old_values, activity.new_values)?.length || 0) >
                            3 && (
                            <button
                              onClick={() => setSelectedActivity(activity)}
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              Zobrazit všechny změny...
                            </button>
                          )}
                        </div>
                      )}

                      <div className="mt-2 text-xs text-gray-500">ID: {activity.resource_id}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Stránka {currentPage} z {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50"
              >
                Předchozí
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50"
              >
                Další
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Activity detail modal */}
      {selectedActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Detail aktivity</h3>
              <button
                onClick={() => setSelectedActivity(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">Základní informace</h4>
                <div className="mt-2 text-sm text-gray-600">
                  <p>Akce: {getActionLabel(selectedActivity.action)}</p>
                  <p>Typ: {getResourceLabel(selectedActivity.resource_type)}</p>
                  <p>ID: {selectedActivity.resource_id}</p>
                  <p>
                    Administrátor: {selectedActivity.admin.name || selectedActivity.admin.email}
                  </p>
                  <p>Čas: {new Date(selectedActivity.created_at).toLocaleString("cs-CZ")}</p>
                </div>
              </div>

              {selectedActivity.old_values && (
                <div>
                  <h4 className="font-medium text-gray-900">Původní hodnoty</h4>
                  <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-x-auto">
                    {JSON.stringify(selectedActivity.old_values, null, 2)}
                  </pre>
                </div>
              )}

              {selectedActivity.new_values && (
                <div>
                  <h4 className="font-medium text-gray-900">Nové hodnoty</h4>
                  <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-x-auto">
                    {JSON.stringify(selectedActivity.new_values, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
