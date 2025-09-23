"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface DataExportButtonProps {
  className?: string;
}

export function DataExportButton({ className }: DataExportButtonProps) {
  const t = useTranslations("gdpr");
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    setExportComplete(false);

    try {
      const response = await fetch("/api/gdpr/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": await getCSRFToken(),
        },
      });

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const data = await response.json();

      if (data.success) {
        // Create and download the export file
        const exportData = JSON.stringify(data.data, null, 2);
        const blob = new Blob([exportData], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `personal-data-export-${new Date().toISOString().split("T")[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
        setExportComplete(true);

        // Reset success state after 3 seconds
        setTimeout(() => setExportComplete(false), 3000);
      } else {
        throw new Error(data.error?.message || "Export failed");
      }
    } catch (error) {
      console.error("Export error:", error);
      alert(t("exportError"));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button onClick={handleExport} disabled={isExporting} variant="outline" className={className}>
      {isExporting ? (
        <>
          <LoadingSpinner size="sm" className="mr-2" />
          {t("exporting")}
        </>
      ) : exportComplete ? (
        <>
          <svg
            className="w-4 h-4 mr-2 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {t("exportComplete")}
        </>
      ) : (
        <>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          {t("exportData")}
        </>
      )}
    </Button>
  );
}

// Helper function to get CSRF token
async function getCSRFToken(): Promise<string> {
  // In a real implementation, you would fetch this from your auth system
  // For now, return a placeholder
  return "csrf-token-placeholder";
}
