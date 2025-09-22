"use client";

/**
 * DeliveryCalendar component for selecting delivery dates
 * Displays available delivery dates with visual indicators for holidays and weekends
 */

import { useState, useEffect, useCallback } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { clsx } from "clsx";
import { useTranslations } from "next-intl";
import {
  DeliveryAvailability,
  DeliveryCalendarData,
  DeliveryUrgency,
  DeliveryTimeSlot,
} from "@/types/delivery";
import { generateAvailableDeliveryDates } from "@/lib/utils/delivery-calculator";

interface DeliveryCalendarProps {
  selectedDate?: Date;
  onDateSelect: (date: Date) => void;
  onTimeSlotSelect?: (timeSlot: DeliveryTimeSlot) => void;
  urgency?: DeliveryUrgency;
  postalCode?: string;
  className?: string;
  disabled?: boolean;
}

const MONTHS_CS = [
  "Leden",
  "Únor",
  "Březen",
  "Duben",
  "Květen",
  "Červen",
  "Červenec",
  "Srpen",
  "Září",
  "Říjen",
  "Listopad",
  "Prosinec",
];

const MONTHS_EN = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAYS_CS = ["Po", "Út", "St", "Čt", "Pá", "So", "Ne"];
const WEEKDAYS_EN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function DeliveryCalendar({
  selectedDate,
  onDateSelect,
  onTimeSlotSelect,
  urgency = "standard",
  postalCode,
  className,
  disabled = false,
}: DeliveryCalendarProps) {
  const t = useTranslations("delivery");
  const tAccessibility = useTranslations("accessibility");
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [availableDates, setAvailableDates] = useState<DeliveryAvailability[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<DeliveryTimeSlot>("anytime");

  // Get localized month and weekday names
  const locale = "cs"; // Could be passed as prop or from context
  const monthNames = locale === "cs" ? MONTHS_CS : MONTHS_EN;
  const weekdayNames = locale === "cs" ? WEEKDAYS_CS : WEEKDAYS_EN;

  // Load available dates for current month
  const loadAvailableDates = useCallback(async () => {
    setIsLoading(true);
    try {
      // In a real app, this would be an API call
      // For now, we'll use the local calculation
      const dates = generateAvailableDeliveryDates(currentMonth, currentYear);
      setAvailableDates(dates);
    } catch (error) {
      console.error("Error loading delivery dates:", error);
      setAvailableDates([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentMonth, currentYear]);

  useEffect(() => {
    loadAvailableDates();
  }, [loadAvailableDates]);

  // Navigate to previous month
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  // Navigate to next month
  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Handle date selection
  const handleDateSelect = (date: Date, availability: DeliveryAvailability) => {
    if (disabled || !availability.available) return;

    onDateSelect(date);
  };

  // Handle time slot selection
  const handleTimeSlotSelect = (timeSlot: DeliveryTimeSlot) => {
    setSelectedTimeSlot(timeSlot);
    onTimeSlotSelect?.(timeSlot);
  };

  // Generate calendar grid
  const generateCalendarGrid = () => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const firstDayWeekday = (firstDayOfMonth.getDay() + 6) % 7; // Convert to Monday = 0

    const days: (Date | null)[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayWeekday; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      days.push(new Date(currentYear, currentMonth, day));
    }

    return days;
  };

  // Get availability for a specific date
  const getDateAvailability = (date: Date): DeliveryAvailability | undefined => {
    return availableDates.find(
      (avail) =>
        avail.date.getDate() === date.getDate() &&
        avail.date.getMonth() === date.getMonth() &&
        avail.date.getFullYear() === date.getFullYear()
    );
  };

  // Check if date is selected
  const isDateSelected = (date: Date): boolean => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const calendarDays = generateCalendarGrid();
  const today = new Date();

  return (
    <div className={clsx("delivery-calendar", className)}>
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={goToPreviousMonth}
          disabled={disabled}
          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={tAccessibility('previousMonth')}
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-semibold">
          {monthNames[currentMonth]} {currentYear}
        </h3>

        <button
          type="button"
          onClick={goToNextMonth}
          disabled={disabled}
          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={tAccessibility('nextMonth')}
        >
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekdayNames.map((day) => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((date, index) => {
          if (!date) {
            return <div key={index} className="p-2" />;
          }

          const availability = getDateAvailability(date);
          const isSelected = isDateSelected(date);
          const isPast = date < today;
          const isAvailable = availability?.available && !isPast;

          return (
            <button
              key={date.toISOString()}
              type="button"
              onClick={() => availability && handleDateSelect(date, availability)}
              disabled={disabled || !isAvailable}
              className={clsx(
                "p-2 text-sm rounded-lg transition-colors relative",
                "hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500",
                {
                  // Available dates
                  "bg-white border border-gray-200 text-gray-900 hover:border-blue-300":
                    isAvailable && !isSelected,

                  // Selected date
                  "bg-blue-600 text-white border-blue-600": isSelected && isAvailable,

                  // Unavailable dates
                  "bg-gray-50 text-gray-400 cursor-not-allowed": !isAvailable,

                  // Past dates
                  "opacity-50": isPast,

                  // Holidays
                  "bg-red-50 border-red-200": availability?.isHoliday && !isSelected,

                  // Weekends
                  "bg-gray-100": availability?.isWeekend && !availability.isHoliday && !isSelected,
                }
              )}
              title={availability?.reason || (isAvailable ? t('calendar.available') : t('calendar.unavailable'))}
            >
              {date.getDate()}

              {/* Availability indicator */}
              {availability && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1">
                  <div
                    className={clsx("w-1 h-1 rounded-full", {
                      "bg-green-500": availability.available,
                      "bg-red-500": !availability.available && availability.isHoliday,
                      "bg-gray-400": !availability.available && !availability.isHoliday,
                    })}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Time Slot Selection */}
      {selectedDate && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-3">{t('calendar.timeSlot')}</h4>
          <div className="grid grid-cols-2 gap-2">
            {["morning", "afternoon", "anytime"].map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => handleTimeSlotSelect(slot as DeliveryTimeSlot)}
                disabled={disabled}
                className={clsx(
                  "p-2 text-sm rounded-lg border transition-colors",
                  "hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500",
                  {
                    "bg-blue-600 text-white border-blue-600": selectedTimeSlot === slot,
                    "bg-white text-gray-900 border-gray-200": selectedTimeSlot !== slot,
                  }
                )}
              >
                {slot === "morning" && t('calendar.morning')}
                {slot === "afternoon" && t('calendar.afternoon')}
                {slot === "anytime" && t('calendar.anytime')}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500 rounded-full" />
          <span>{t('calendar.available')}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-500 rounded-full" />
          <span>{t('calendar.holiday')}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gray-400 rounded-full" />
          <span>{t('calendar.unavailable')}</span>
        </div>
      </div>
    </div>
  );
}
