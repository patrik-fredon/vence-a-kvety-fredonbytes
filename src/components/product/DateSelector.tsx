"use client";

import { useState } from "react";
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
  minDaysFromNow = 3,
  maxDaysFromNow = 30,
  locale,
  className,
}: DateSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Calculate min and max dates
  const today = new Date();
  const minDate = new Date(today);
  minDate.setDate(today.getDate() + minDaysFromNow);

  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + maxDaysFromNow);

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

  // Generate calendar days for current month
  const generateCalendarDays = () => {
    const firstDay = new Date(selectedYear, selectedMonth, 1);
    const lastDay = new Date(selectedYear, selectedMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // Monday = 0

    const days: (Date | null)[] = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(selectedYear, selectedMonth, day));
    }

    return days;
  };

  // Check if date is selectable
  const isDateSelectable = (date: Date) => {
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const minDateOnly = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
    const maxDateOnly = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate());

    return dateOnly > minDateOnly && dateOnly < maxDateOnly;
  };

  // Check if date is selected
  const isDateSelected = (date: Date) => {
    if (!value) return false;
    const selectedDate = new Date(value as string);
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    if (!isDateSelectable(date)) return;
    // Format date as YYYY-MM-DD without timezone conversion
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    onChange(dateString);
    setIsOpen(false);
  };

  // Navigate months
  const goToPreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const monthNames = locale === "cs"
    ? ["Leden", "Únor", "Březen", "Duben", "Květen", "Červen", "Červenec", "Srpen", "Září", "Říjen", "Listopad", "Prosinec"]
    : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const weekdayNames = locale === "cs"
    ? ["Po", "Út", "St", "Čt", "Pá", "So", "Ne"]
    : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const calendarDays = generateCalendarDays();

  return (
    <div className={cn("space-y-2", className)}>
      {/* Date Picker Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between p-3 border rounded-lg transition-colors",
          "border-amber-300 bg-amber-100 hover:border-stone-300 hover:shadow-sm",
          "focus:ring-2 focus:ring-primary-200 focus:border-primary-500"
        )}
      >
        <div className="flex items-center space-x-3">
          <CalendarIcon className="w-5 h-5 text-teal-800" />
          <div className="text-left">
            {value ? (
              <div className="font-medium text-teal-800">{formatDateForDisplay(value as string)}</div>
            ) : (
              <div className="text-teal-800">
                {locale === "cs" ? "Vyberte datum" : "Select date"}
              </div>
            )}
          </div>
        </div>
        <div className="text-teal-800">{isOpen ? "▲" : "▼"}</div>
      </button>

      {/* Enhanced Calendar Picker */}
      {isOpen && (
        <div className="p-4 border border-amber-200 rounded-lg bg-amber-100 shadow-lg">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={goToPreviousMonth}
              className="p-2 rounded-lg hover:bg-amber-200 transition-colors"
              aria-label={locale === "cs" ? "Předchozí měsíc" : "Previous month"}
            >
              <span className="text-teal-800">‹</span>
            </button>

            <h3 className="text-lg font-semibold text-teal-800">
              {monthNames[selectedMonth]} {selectedYear}
            </h3>

            <button
              type="button"
              onClick={goToNextMonth}
              className="p-2 rounded-lg hover:bg-amber-200 transition-colors"
              aria-label={locale === "cs" ? "Následující měsíc" : "Next month"}
            >
              <span className="text-teal-800">›</span>
            </button>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekdayNames.map((day) => (
              <div key={day} className="p-2 text-center text-sm font-medium text-teal-700">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="p-2" />;
              }

              const selectable = isDateSelectable(date);
              const selected = isDateSelected(date);

              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  onClick={() => handleDateSelect(date)}
                  disabled={!selectable}
                  className={cn(
                    "p-2 text-sm rounded-lg transition-colors relative",
                    {
                      // Selected date
                      "bg-teal-800 text-white font-semibold hover:bg-teal-700": selected && selectable,

                      // Selectable dates
                      "bg-amber-200 text-teal-800 hover:bg-teal-50 border border-amber-300": !selected && selectable,

                      // Disabled dates
                      "bg-amber-100/40 text-gray-400 cursor-not-allowed": !selectable,
                    }
                  )}
                  title={
                    !selectable
                      ? locale === "cs"
                        ? "Datum není dostupné"
                        : "Date not available"
                      : undefined
                  }
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          {/* Info Text */}
          <div className="mt-4 text-xs text-teal-800 text-center">
            {locale === "cs"
              ? `Dostupné termíny: ${minDate.toLocaleDateString("cs-CZ")} - ${maxDate.toLocaleDateString("cs-CZ")}`
              : `Available dates: ${minDate.toLocaleDateString("en-US")} - ${maxDate.toLocaleDateString("en-US")}`}
          </div>
        </div>
      )}

      {/* Validation Message */}
      {value && (
        <div className="text-sm text-green-600 flex items-center space-x-1">
          <CalendarIcon className="w-4 h-4" />
          <span>
            {locale === "cs"
              ? `Dodání naplánováno na ${formatDateForDisplay(value as string)}`
              : `Delivery scheduled for ${formatDateForDisplay(value as string)}`}
          </span>
        </div>
      )}
    </div>
  );
}
