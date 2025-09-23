"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface DataDeletionButtonProps {
  className?: string;
  onDeletionComplete?: () => void;
}

export function DataDeletionButton({ className, onDeletionComplete }: DataDeletionButtonProps) {
  const t = useTranslations("gdpr");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const [reason, setReason] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirmationText !== "DELETE_MY_DATA") {
      alert(t("confirmationTextError"));
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch("/api/gdpr/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": await getCSRFToken(),
        },
        body: JSON.stringify({
          confirmation: confirmationText,
          reason: reason.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert(t("deletionSuccess"));
        onDeletionComplete?.();
        // Redirect to home page or logout
        window.location.href = "/";
      } else {
        throw new Error(data.error?.message || "Deletion failed");
      }
    } catch (error) {
      console.error("Deletion error:", error);
      alert(t("deletionError"));
    } finally {
      setIsDeleting(false);
    }
  };

  if (!showConfirmation) {
    return (
      <Button onClick={() => setShowConfirmation(true)} variant="destructive" className={className}>
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
        {t("deleteData")}
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center mb-4">
          <svg
            className="w-6 h-6 text-red-600 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900">{t("deletionConfirmationTitle")}</h3>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-4">{t("deletionWarning")}</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("reasonLabel")} ({t("optional")})
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={t("reasonPlaceholder")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows={3}
                maxLength={500}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("confirmationLabel")}
              </label>
              <input
                type="text"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                placeholder="DELETE_MY_DATA"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono"
              />
              <p className="text-xs text-gray-500 mt-1">{t("confirmationHint")}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={() => {
              setShowConfirmation(false);
              setConfirmationText("");
              setReason("");
            }}
            disabled={isDeleting}
          >
            {t("cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting || confirmationText !== "DELETE_MY_DATA"}
          >
            {isDeleting ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                {t("deleting")}
              </>
            ) : (
              t("confirmDeletion")
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Helper function to get CSRF token
async function getCSRFToken(): Promise<string> {
  // In a real implementation, you would fetch this from your auth system
  // For now, return a placeholder
  return "csrf-token-placeholder";
}
