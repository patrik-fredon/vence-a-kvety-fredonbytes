"use client";

/**
 * DeliveryCostCalculator component
 * Calculates and displays delivery costs based on location and urgency
 */

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { clsx } from "clsx";
import { DeliveryUrgency, DeliveryTimeSlot, DeliveryCostCalculation } from "@/types/delivery";
import type { Address } from "@/types";
import {
  calculateDeliveryCost,
  findDeliveryZone,
  DEFAULT_DELIVERY_OPTIONS,
} from "@/lib/utils/delivery-calculator";

interface DeliveryCostCalculatorProps {
  address?: Address;
  urgency: DeliveryUrgency;
  timeSlot: DeliveryTimeSlot;
  onCostCalculated?: (cost: DeliveryCostCalculation) => void;
  className?: string;
}

export function DeliveryCostCalculator({
  address,
  urgency,
  timeSlot,
  onCostCalculated,
  className,
}: DeliveryCostCalculatorProps) {
  const t = useTranslations("delivery");
  const [calculation, setCalculation] = useState<DeliveryCostCalculation | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate delivery cost when inputs change
  useEffect(() => {
    if (!address?.postalCode) {
      setCalculation(null);
      setError(null);
      return;
    }

    setIsCalculating(true);
    setError(null);

    try {
      const deliveryZone = findDeliveryZone(address.postalCode);
      const cost = calculateDeliveryCost(address, urgency, timeSlot, deliveryZone);

      setCalculation(cost);
      onCostCalculated?.(cost);
    } catch (err) {
      console.error("Error calculating delivery cost:", err);
      setError("Chyba při výpočtu ceny doručení");
      setCalculation(null);
    } finally {
      setIsCalculating(false);
    }
  }, [address, urgency, timeSlot, onCostCalculated]);

  // Get delivery option details
  const deliveryOption = DEFAULT_DELIVERY_OPTIONS.find((opt) => opt.urgency === urgency);

  if (!address?.postalCode) {
    return (
      <div className={clsx("delivery-cost-calculator bg-gray-50 rounded-lg p-4", className)}>
        <p className="text-sm text-gray-600">Zadejte adresu pro výpočet ceny doručení</p>
      </div>
    );
  }

  if (isCalculating) {
    return (
      <div className={clsx("delivery-cost-calculator bg-gray-50 rounded-lg p-4", className)}>
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
          <span className="text-sm text-gray-600">Počítám cenu doručení...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={clsx("delivery-cost-calculator bg-red-50 rounded-lg p-4", className)}>
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (!calculation) {
    return null;
  }

  return (
    <div className={clsx("delivery-cost-calculator bg-white border rounded-lg p-4", className)}>
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Cena doručení</h3>

      {/* Delivery Option Info */}
      {deliveryOption && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900">{deliveryOption.name}</h4>
          <p className="text-sm text-blue-700">{deliveryOption.description}</p>
          <p className="text-xs text-blue-600 mt-1">
            Doručení do {deliveryOption.estimatedHours} hodin
          </p>
        </div>
      )}

      {/* Cost Breakdown */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Základní cena:</span>
          <span className="font-medium">{calculation.baseCost} Kč</span>
        </div>

        {calculation.distanceCost > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Příplatek za vzdálenost:</span>
            <span className="font-medium">{calculation.distanceCost} Kč</span>
          </div>
        )}

        {calculation.urgencyCost > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Příplatek za rychlost:</span>
            <span className="font-medium">{calculation.urgencyCost} Kč</span>
          </div>
        )}

        {calculation.timeSlotCost > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Příplatek za čas:</span>
            <span className="font-medium">{calculation.timeSlotCost} Kč</span>
          </div>
        )}

        <hr className="my-2" />

        <div className="flex justify-between text-lg font-semibold">
          <span>Celkem:</span>
          <span className="text-blue-600">{calculation.totalCost} Kč</span>
        </div>
      </div>

      {/* Estimated Delivery Date */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Odhadované doručení:</span>
          <span className="text-sm font-medium">
            {calculation.estimatedDeliveryDate.toLocaleDateString("cs-CZ", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>

        {calculation.estimatedTimeSlot && calculation.estimatedTimeSlot !== "anytime" && (
          <div className="flex justify-between items-center mt-1">
            <span className="text-sm text-gray-600">Čas:</span>
            <span className="text-sm font-medium">
              {calculation.estimatedTimeSlot === "morning" && "Dopoledne (8-12)"}
              {calculation.estimatedTimeSlot === "afternoon" && "Odpoledne (12-18)"}
              {calculation.estimatedTimeSlot === "evening" && "Večer (18-20)"}
            </span>
          </div>
        )}
      </div>

      {/* Delivery Zone Info */}
      <div className="mt-3 text-xs text-gray-500">
        <p>Cena zahrnuje doručení do oblasti {findDeliveryZone(address.postalCode).name}</p>
      </div>
    </div>
  );
}
