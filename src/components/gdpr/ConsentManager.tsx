"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface ConsentPreferences {
  marketing: boolean;
  analytics: boolean;
  functional: boolean;
}

interface ConsentManagerProps {
  onConsentChange?: (consent: ConsentPreferences) => void;
  showBanner?: boolean;
}

export function ConsentManager({ onConsentChange, showBanner = false }: ConsentManagerProps) {
  const t = useTranslations("gdpr");
  const [consent, setConsent] = useState<ConsentPreferences>({
    marketing: false,
    analytics: false,
    functional: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSettings, setShowSettings] = useState(showBanner);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Load current consent preferences
  useEffect(() => {
    const loadConsent = async () => {
      try {
        const response = await fetch("/api/gdpr/consent");
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.consent) {
            setConsent(data.consent);
            setHasInteracted(true);
          }
        }
      } catch (error) {
        console.error("Failed to load consent preferences:", error);
      } finally {
        setLoading(false);
      }
    };

    loadConsent();
  }, []);

  // Check if consent banner should be shown
  useEffect(() => {
    const consentGiven = localStorage.getItem("gdpr-consent-given");
    if (!consentGiven && !hasInteracted) {
      setShowSettings(true);
    }
  }, [hasInteracted]);

  const handleConsentChange = (type: keyof ConsentPreferences, value: boolean) => {
    const newConsent = { ...consent, [type]: value };
    setConsent(newConsent);
    onConsentChange?.(newConsent);
  };

  const saveConsent = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/gdpr/consent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": await getCSRFToken(),
        },
        body: JSON.stringify(consent),
      });

      if (response.ok) {
        localStorage.setItem("gdpr-consent-given", "true");
        setShowSettings(false);
        setHasInteracted(true);
      } else {
        throw new Error("Failed to save consent preferences");
      }
    } catch (error) {
      console.error("Failed to save consent:", error);
      alert(t("consentSaveError"));
    } finally {
      setSaving(false);
    }
  };

  const acceptAll = async () => {
    const allConsent = {
      marketing: true,
      analytics: true,
      functional: true,
    };
    setConsent(allConsent);
    onConsentChange?.(allConsent);

    setSaving(true);
    try {
      const response = await fetch("/api/gdpr/consent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": await getCSRFToken(),
        },
        body: JSON.stringify(allConsent),
      });

      if (response.ok) {
        localStorage.setItem("gdpr-consent-given", "true");
        setShowSettings(false);
        setHasInteracted(true);
      }
    } catch (error) {
      console.error("Failed to save consent:", error);
    } finally {
      setSaving(false);
    }
  };

  const rejectAll = async () => {
    const minimalConsent = {
      marketing: false,
      analytics: false,
      functional: true, // Required for basic functionality
    };
    setConsent(minimalConsent);
    onConsentChange?.(minimalConsent);

    setSaving(true);
    try {
      const response = await fetch("/api/gdpr/consent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": await getCSRFToken(),
        },
        body: JSON.stringify(minimalConsent),
      });

      if (response.ok) {
        localStorage.setItem("gdpr-consent-given", "true");
        setShowSettings(false);
        setHasInteracted(true);
      }
    } catch (error) {
      console.error("Failed to save consent:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <LoadingSpinner size="sm" />
      </div>
    );
  }

  if (!showSettings && hasInteracted) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowSettings(true)}
        className="fixed bottom-4 right-4 z-50"
      >
        {t("manageConsent")}
      </Button>
    );
  }

  return (
    <>
      {/* Consent Banner */}
      {showSettings && (
        <div className="fixed inset-x-0 bottom-0 z-50 bg-white border-t border-gray-200 shadow-lg">
          <div className="max-w-7xl mx-auto p-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t("consentTitle")}</h3>
                <p className="text-sm text-gray-600 mb-4">{t("consentDescription")}</p>

                {/* Consent Options */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        {t("functionalCookies")}
                      </label>
                      <p className="text-xs text-gray-500">{t("functionalCookiesDescription")}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={consent.functional}
                      disabled={true} // Always required
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        {t("analyticsCookies")}
                      </label>
                      <p className="text-xs text-gray-500">{t("analyticsCookiesDescription")}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={consent.analytics}
                      onChange={(e) => handleConsentChange("analytics", e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        {t("marketingCookies")}
                      </label>
                      <p className="text-xs text-gray-500">{t("marketingCookiesDescription")}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={consent.marketing}
                      onChange={(e) => handleConsentChange("marketing", e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 lg:ml-4">
                <Button
                  variant="outline"
                  onClick={rejectAll}
                  disabled={saving}
                  className="whitespace-nowrap"
                >
                  {t("rejectAll")}
                </Button>
                <Button
                  variant="outline"
                  onClick={saveConsent}
                  disabled={saving}
                  className="whitespace-nowrap"
                >
                  {saving ? <LoadingSpinner size="sm" /> : t("savePreferences")}
                </Button>
                <Button onClick={acceptAll} disabled={saving} className="whitespace-nowrap">
                  {t("acceptAll")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Helper function to get CSRF token
async function getCSRFToken(): Promise<string> {
  // In a real implementation, you would fetch this from your auth system
  // For now, return a placeholder
  return "csrf-token-placeholder";
}
