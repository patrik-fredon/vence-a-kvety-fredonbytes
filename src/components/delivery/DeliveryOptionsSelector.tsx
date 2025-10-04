"use client";

/**
 * DeliveryOptionsSelector component
 * Allows users to select delivery urgency and view available options
 */

import { clsx } from "clsx";
import { useEffect, useState } from "react";
import { ClockIcon, TruckIcon } from "@/lib/icons";
import type { Address } from "@/types";
import type { DeliveryOption, DeliveryUrgency } from "@/types/delivery";

interface DeliveryOptionsSelectorProps {
  address?: Address;
  selectedUrgency: DeliveryUrgency;
  onUrgencyChange: (urgency: DeliveryUrgency) => void;
  className?: string;
  disabled?: boolean;
}

export function DeliveryOptionsSelector({
  address,
  selectedUrgency,
  onUrgencyChange,
  className,
  disabled = false,
}: DeliveryOptionsSelectorProps) {
  const [availableOptions, setAvailableOptions] = useState<DeliveryOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load available delivery options
  useEffect(() => {
    const loadOptions = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (address?.postalCode) {
          params.set("postalCode", address.postalCode);
        }

        const response = await fetch(`/api/delivery/estimate?${params}`);
        const data = await response.json();

        if (data.success && data.availableOptions) {
          setAvailableOptions(data.availableOptions);
        } else {
          setError(data.error?.message || "Chyba při načítání možností doručení");
        }
      } catch (err) {
        console.error("Error loading delivery options:", err);
        setError("Chyba při načítání možností doručení");
      } finally {
        setIsLoading(false);
      }
    };

    loadOptions();
  }, [address?.postalCode]);

  // Handle option selection
  const handleOptionSelect = (urgency: DeliveryUrgency) => {
    if (disabled) return;
    onUrgencyChange(urgency);
  };

  // Get icon for delivery urgency
  const getUrgencyIcon = (urgency: DeliveryUrgency) => {
    switch (urgency) {
      case "same-day":
        return <ClockIcon className="w-5 h-5" />;
      case "express":
        return <TruckIcon className="w-5 h-5" />;
      case "standard":
      default:
        return <TruckIcon className="w-5 h-5" />;
    }
  };

  // Get urgency color classes
  const getUrgencyColors = (urgency: DeliveryUrgency, isSelected: boolean) => {
    const baseClasses = "border-2 transition-colors";

    if (isSelected) {
      switch (urgency) {
        case "same-day":
          return `${baseClasses} border-red-500 bg-red-50 text-red-900`;
        case "express":
          return `${baseClasses} border-orange-500 bg-orange-50 text-orange-900`;
        case "standard":
        default:
          return `${baseClasses} border-blue-500 bg-blue-50 text-blue-900`;
      }
    }

    return `${baseClasses} border-gray-200 bg-white text-gray-900 hover:border-gray-300`;
  };

  if (isLoading) {
    return (
      <div className={clsx("delivery-options-selector", className)}>
        <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
          <span className="text-sm text-gray-600">Načítám možnosti doručení...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={clsx("delivery-options-selector", className)}>
        <div className="p-4 bg-red-50 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (availableOptions.length === 0) {
    return (
      <div className={clsx("delivery-options-selector", className)}>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            Žádné možnosti doručení nejsou dostupné pro vaši oblast.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx("delivery-options-selector", className)}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Způsob doručení</h3>

      <div className="space-y-3">
        {availableOptions.map((option) => {
          const isSelected = selectedUrgency === option.urgency;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => handleOptionSelect(option.urgency)}
              disabled={disabled}
              className={clsx(
                "w-full p-4 rounded-lg text-left transition-all",
                "focus:outline-none focus:ring-2 focus:ring-blue-500",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                getUrgencyColors(option.urgency, isSelected)
              )}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">{getUrgencyIcon(option.urgency)}</div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium">{option.name}</h4>
                    <span className="text-lg font-semibold">{option.baseCost} Kč</span>
                  </div>

                  <p className="text-sm opacity-90 mb-2">{option.description}</p>

                  <div className="flex items-center gap-4 text-xs opacity-75">
                    <span>Doručení do {option.estimatedHours} hodin</span>

                    {option.maxDistance && <span>Dosah {option.maxDistance} km</span>}

                    <span>Min. {option.minimumNoticeHours}h předem</span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Additional Info */}
      {address?.postalCode && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">Možnosti doručení pro PSČ {address.postalCode}</p>
        </div>
      )}
    </div>
  );
}
