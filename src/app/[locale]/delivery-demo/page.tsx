/**
 * Delivery Demo Page
 * Demonstrates the delivery calendar and scheduling functionality
 */

"use client";

import { useState } from "react";
import {
  DeliveryCalendar,
  DeliveryCostCalculator,
  DeliveryOptionsSelector,
} from "@/components/delivery";
import type { Address } from "@/types";
import type { DeliveryCostCalculation, DeliveryTimeSlot, DeliveryUrgency } from "@/types/delivery";

export default function DeliveryDemoPage() {
  // State management
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedUrgency, setSelectedUrgency] = useState<DeliveryUrgency>("standard");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<DeliveryTimeSlot>("anytime");
  const [deliveryAddress, setDeliveryAddress] = useState<Address>({
    street: "Václavské náměstí 1",
    city: "Praha",
    postalCode: "110 00",
    country: "Česká republika",
  });
  const [costCalculation, setCostCalculation] = useState<DeliveryCostCalculation | null>(null);

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  // Handle time slot selection
  const handleTimeSlotSelect = (timeSlot: DeliveryTimeSlot) => {
    setSelectedTimeSlot(timeSlot);
  };

  // Handle urgency change
  const handleUrgencyChange = (urgency: DeliveryUrgency) => {
    setSelectedUrgency(urgency);
  };

  // Handle cost calculation
  const handleCostCalculated = (cost: DeliveryCostCalculation) => {
    setCostCalculation(cost);
  };

  // Handle address change
  const handleAddressChange = (field: keyof Address, value: string) => {
    setDeliveryAddress((prev: Address) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(to_right,_#AE8625,_#F7EF8A,_#D2AC47)] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-teal-900">Delivery Calendar & Scheduling Demo</h1>
          <p className="mt-2 text-teal-600">
            Demonstration of the delivery calendar and scheduling functionality for the funeral
            wreaths e-commerce platform.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Address and Options */}
          <div className="space-y-6">
            {/* Address Form */}
            <div className="bg-[linear-gradient(to_right,_#AE8625,_#F7EF8A,_#D2AC47)] rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-teal-900 mb-4">Delivery Address</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-teal-700 mb-1">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={deliveryAddress.street}
                    onChange={(e) => handleAddressChange("street", e.target.value)}
                    className="w-full px-3 py-2 border border-teal-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter street address"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-teal-700 mb-1">City</label>
                    <input
                      type="text"
                      value={deliveryAddress.city}
                      onChange={(e) => handleAddressChange("city", e.target.value)}
                      className="w-full px-3 py-2 border border-teal-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="City"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-teal-700 mb-1">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress.postalCode}
                      onChange={(e) => handleAddressChange("postalCode", e.target.value)}
                      className="w-full px-3 py-2 border border-teal-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Postal code"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Options */}
            <div className="bg-amber-200 rounded-lg shadow p-6">
              <DeliveryOptionsSelector
                address={deliveryAddress}
                selectedUrgency={selectedUrgency}
                onUrgencyChange={handleUrgencyChange}
              />
            </div>

            {/* Cost Calculator */}
            <DeliveryCostCalculator
              address={deliveryAddress}
              urgency={selectedUrgency}
              timeSlot={selectedTimeSlot}
              onCostCalculated={handleCostCalculated}
              className="bg-amber-200 rounded-lg shadow"
            />
          </div>

          {/* Right Column - Calendar */}
          <div className="space-y-6">
            {/* Delivery Calendar */}
            <div className="bg-amber-200 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-teal-900 mb-4">Select Delivery Date</h2>

              <DeliveryCalendar
                {...(selectedDate && { selectedDate })}
                onDateSelect={handleDateSelect}
                onTimeSlotSelect={handleTimeSlotSelect}
                urgency={selectedUrgency}
                postalCode={deliveryAddress.postalCode}
              />
            </div>

            {/* Summary */}
            {(selectedDate || costCalculation) && (
              <div className="bg-amber-200 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-teal-900 mb-4">Delivery Summary</h2>

                <div className="space-y-3">
                  {selectedDate && (
                    <div className="flex justify-between">
                      <span className="text-teal-600">Selected Date:</span>
                      <span className="font-medium">
                        {selectedDate.toLocaleDateString("cs-CZ", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-teal-600">Delivery Method:</span>
                    <span className="font-medium capitalize">{selectedUrgency}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-teal-600">Time Slot:</span>
                    <span className="font-medium">
                      {selectedTimeSlot === "morning" && "Morning (8-12)"}
                      {selectedTimeSlot === "afternoon" && "Afternoon (12-18)"}
                      {selectedTimeSlot === "evening" && "Evening (18-20)"}
                      {selectedTimeSlot === "anytime" && "Anytime"}
                    </span>
                  </div>

                  {costCalculation && (
                    <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                      <span>Total Cost:</span>
                      <span className="text-blue-600">{costCalculation.totalCost} Kč</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Debug Information */}
        <div className="mt-8 bg-teal-100 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-teal-900 mb-4">Debug Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-teal-700 mb-2">State:</h4>
              <pre className="bg-amber-200 p-3 rounded border text-xs overflow-auto">
                {JSON.stringify(
                  {
                    selectedDate: selectedDate?.toISOString(),
                    selectedUrgency,
                    selectedTimeSlot,
                    deliveryAddress,
                  },
                  null,
                  2
                )}
              </pre>
            </div>

            <div>
              <h4 className="font-medium text-teal-700 mb-2">Cost Calculation:</h4>
              <pre className="bg-amber-200 p-3 rounded border text-xs overflow-auto">
                {JSON.stringify(costCalculation, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
