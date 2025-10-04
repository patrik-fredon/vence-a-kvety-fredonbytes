"use client";

import { useCallback, useState } from "react";
import { CalendarIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

interface DateSelectorProps {
  value?: string;
  onChange: (date: string) => void;
  minDaysFromNow?: number;
  maxDaysFromNow?: number;
  locale: string;
  className?: string;
}

export function DateSelector({
  value,
  onChange,
  minDaysFromNow = 1,
  maxDaysFromNow = 30,
  locale,
  className,
}: DateSelectorProps) {
  // Removed unused translation hook
  const [isOpen, setIsOpen] = useState(false);

  // Calculate min and max dates
  const today = new Date();
  const minDate = new Date(today);
  minDate.setDate(today.getDate() + minDaysFromNow);

  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + maxDaysFromNow);

  // Format date for input
  const formatDateForInput = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  // Format date for display
  const formatDateForDisplay = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === "cs" ? "cs-CZ" : "en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleDateChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedDate = event.target.value;
      onChange(selectedDate);
      setIsOpen(false);
    },
    [onChange]
  );

  const handleToggleCalendar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Date Display/Trigger */}
      <button
        type="button"
        onClick={handleToggleCalendar}
        className={cn(
          "w-full flex items-center justify-between p-3 border rounded-lg transition-colors",
          "border-neutral-300 bg-funeral-gold hover:border-neutral-400 hover:bg-neutral-50",
          "focus:ring-2 focus:ring-primary-200 focus:border-primary-500"
        )}
      >
        <div className="flex items-center space-x-3">
          <CalendarIcon className="w-5 h-5 text-neutral-500" />
          <div className="text-left">
            {value ? (
              <div className="font-medium text-neutral-900">{formatDateForDisplay(value)}</div>
            ) : (
              <div className="text-teal-500">
                {locale === "cs" ? "Vyberte datum" : "Select date"}
              </div>
            )}
          </div>
        </div>
        <div className="text-teal-400">{isOpen ? "▲" : "▼"}</div>
      </button>

      {/* Calendar Input */}
      {isOpen && (
        <div className="p-4 border border-neutral-200 rounded-lg bg-funeral-gold shadow-lg">
          <div className="space-y-3">
            <div className="text-sm font-medium text-teal-700">
              {locale === "cs" ? "Vyberte datum dodání:" : "Select delivery date:"}
            </div>

            <input
              type="date"
              value={value || ""}
              onChange={handleDateChange}
              min={formatDateForInput(minDate)}
              max={formatDateForInput(maxDate)}
              className={cn(
                "w-full p-2 border border-neutral-300 rounded-md",
                "focus:ring-2 focus:ring-primary-200 focus:border-primary-500"
              )}
            />

            <div className="text-xs text-neutral-500">
              {locale === "cs"
                ? `Dostupné termíny: ${minDate.toLocaleDateString("cs-CZ")} - ${maxDate.toLocaleDateString("cs-CZ")}`
                : `Available dates: ${minDate.toLocaleDateString("en-US")} - ${maxDate.toLocaleDateString("en-US")}`}
            </div>
          </div>
        </div>
      )}

      {/* Validation Message */}
      {value && (
        <div className="text-sm text-green-600 flex items-center space-x-1">
          <CalendarIcon className="w-4 h-4" />
          <span>
            {locale === "cs"
              ? `Dodání naplánováno na ${formatDateForDisplay(value)}`
              : `Delivery scheduled for ${formatDateForDisplay(value)}`}
          </span>
        </div>
      )}
    </div>
  );
}
