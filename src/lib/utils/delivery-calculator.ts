/**
 * Delivery date calculation utilities
 * Handles business logic for delivery scheduling, holidays, and cost calculation
 */

import type { Address } from "@/types";
import type {
  DeliveryAvailability,
  DeliveryCostCalculation,
  DeliveryOption,
  DeliverySettings,
  DeliveryTimeSlot,
  DeliveryUrgency,
  DeliveryZone,
  Holiday,
} from "@/types/delivery";

// Czech public holidays (fixed dates and calculated dates)
export const CZECH_HOLIDAYS_2024: Holiday[] = [
  { date: new Date(2024, 0, 1), name: "Nový rok", type: "public" },
  { date: new Date(2024, 3, 1), name: "Velikonoční pondělí", type: "religious" },
  { date: new Date(2024, 4, 1), name: "Svátek práce", type: "public" },
  { date: new Date(2024, 4, 8), name: "Den vítězství", type: "public" },
  { date: new Date(2024, 6, 5), name: "Den slovanských věrozvěstů", type: "religious" },
  { date: new Date(2024, 6, 6), name: "Den upálení Jana Husa", type: "religious" },
  { date: new Date(2024, 8, 28), name: "Den české státnosti", type: "public" },
  { date: new Date(2024, 9, 28), name: "Den vzniku Československa", type: "public" },
  { date: new Date(2024, 10, 17), name: "Den boje za svobodu a demokracii", type: "public" },
  { date: new Date(2024, 11, 24), name: "Štědrý den", type: "religious" },
  { date: new Date(2024, 11, 25), name: "1. svátek vánoční", type: "religious" },
  { date: new Date(2024, 11, 26), name: "2. svátek vánoční", type: "religious" },
];

export const CZECH_HOLIDAYS_2025: Holiday[] = [
  { date: new Date(2025, 0, 1), name: "Nový rok", type: "public" },
  { date: new Date(2025, 3, 21), name: "Velikonoční pondělí", type: "religious" },
  { date: new Date(2025, 4, 1), name: "Svátek práce", type: "public" },
  { date: new Date(2025, 4, 8), name: "Den vítězství", type: "public" },
  { date: new Date(2025, 6, 5), name: "Den slovanských věrozvěstů", type: "religious" },
  { date: new Date(2025, 6, 6), name: "Den upálení Jana Husa", type: "religious" },
  { date: new Date(2025, 8, 28), name: "Den české státnosti", type: "public" },
  { date: new Date(2025, 9, 28), name: "Den vzniku Československa", type: "public" },
  { date: new Date(2025, 10, 17), name: "Den boje za svobodu a demokracii", type: "public" },
  { date: new Date(2025, 11, 24), name: "Štědrý den", type: "religious" },
  { date: new Date(2025, 11, 25), name: "1. svátek vánoční", type: "religious" },
  { date: new Date(2025, 11, 26), name: "2. svátek vánoční", type: "religious" },
];

// Default delivery settings
export const DEFAULT_DELIVERY_SETTINGS: DeliverySettings = {
  standardDeliveryHours: 24,
  expressDeliveryHours: 12,
  sameDayDeliveryHours: 4,
  workingHours: {
    start: "08:00",
    end: "18:00",
  },
  workingDays: [1, 2, 3, 4, 5], // Monday to Friday
  maxAdvanceBookingDays: 30,
  defaultTimeSlot: "anytime",
};

// Default delivery options
export const DEFAULT_DELIVERY_OPTIONS: DeliveryOption[] = [
  {
    id: "standard",
    name: "Standardní doručení",
    description: "Doručení následující pracovní den",
    urgency: "standard",
    baseCost: 150,
    estimatedHours: 24,
    availableTimeSlots: ["morning", "afternoon", "anytime"],
    minimumNoticeHours: 12,
    maxDistance: 50,
  },
  {
    id: "express",
    name: "Expresní doručení",
    description: "Doručení do 12 hodin",
    urgency: "express",
    baseCost: 300,
    estimatedHours: 12,
    availableTimeSlots: ["morning", "afternoon", "evening", "anytime"],
    minimumNoticeHours: 4,
    maxDistance: 30,
  },
  {
    id: "same-day",
    name: "Doručení tentýž den",
    description: "Doručení do 4 hodin",
    urgency: "same-day",
    baseCost: 500,
    estimatedHours: 4,
    availableTimeSlots: ["anytime"],
    minimumNoticeHours: 2,
    maxDistance: 15,
  },
];

/**
 * Check if a date is a Czech holiday
 */
export function isCzechHoliday(date: Date): boolean {
  const year = date.getFullYear();
  const holidays = year === 2024 ? CZECH_HOLIDAYS_2024 : year === 2025 ? CZECH_HOLIDAYS_2025 : [];

  return holidays.some(
    (holiday) =>
      holiday.date.getDate() === date.getDate() &&
      holiday.date.getMonth() === date.getMonth() &&
      holiday.date.getFullYear() === date.getFullYear()
  );
}

/**
 * Check if a date is a weekend (Saturday or Sunday)
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday = 0, Saturday = 6
}

/**
 * Check if a date is a working day (not weekend, not holiday)
 */
export function isWorkingDay(
  date: Date,
  settings: DeliverySettings = DEFAULT_DELIVERY_SETTINGS
): boolean {
  const dayOfWeek = date.getDay();
  return settings.workingDays.includes(dayOfWeek) && !isCzechHoliday(date);
}

/**
 * Get the next working day from a given date
 */
export function getNextWorkingDay(
  fromDate: Date,
  settings: DeliverySettings = DEFAULT_DELIVERY_SETTINGS
): Date {
  const nextDay = new Date(fromDate);
  nextDay.setDate(nextDay.getDate() + 1);

  while (!isWorkingDay(nextDay, settings)) {
    nextDay.setDate(nextDay.getDate() + 1);
  }

  return nextDay;
}

/**
 * Calculate the earliest delivery date based on urgency and current time
 */
export function calculateEarliestDeliveryDate(
  urgency: DeliveryUrgency,
  settings: DeliverySettings = DEFAULT_DELIVERY_SETTINGS
): Date {
  const now = new Date();
  const currentHour = now.getHours();

  let hoursToAdd: number;
  switch (urgency) {
    case "same-day":
      hoursToAdd = settings.sameDayDeliveryHours;
      break;
    case "express":
      hoursToAdd = settings.expressDeliveryHours;
      break;
    default:
      hoursToAdd = settings.standardDeliveryHours;
      break;
  }

  const deliveryDate = new Date(now.getTime() + hoursToAdd * 60 * 60 * 1000);

  // For same-day delivery, check if it's still possible today
  if (urgency === "same-day") {
    const endOfWorkingHours = Number.parseInt(settings.workingHours.end.split(":")[0] || "18", 10);
    if (currentHour >= endOfWorkingHours - settings.sameDayDeliveryHours) {
      // Too late for same-day, move to next working day
      return getNextWorkingDay(now, settings);
    }
  }

  // Ensure delivery is on a working day
  if (!isWorkingDay(deliveryDate, settings)) {
    return getNextWorkingDay(deliveryDate, settings);
  }

  return deliveryDate;
}

/**
 * Generate available delivery dates for a given month
 */
export function generateAvailableDeliveryDates(
  month: number,
  year: number,
  settings: DeliverySettings = DEFAULT_DELIVERY_SETTINGS
): DeliveryAvailability[] {
  const availableDates: DeliveryAvailability[] = [];
  const now = new Date();
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0); // Last day of month

  for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    const currentDate = new Date(date);

    // Skip past dates
    if (currentDate < now) {
      continue;
    }

    // Skip dates beyond max advance booking
    const maxBookingDate = new Date(now);
    maxBookingDate.setDate(maxBookingDate.getDate() + settings.maxAdvanceBookingDays);
    if (currentDate > maxBookingDate) {
      continue;
    }

    const isHoliday = isCzechHoliday(currentDate);
    const isWeekendDay = isWeekend(currentDate);
    const isWorking = isWorkingDay(currentDate, settings);

    const reasonText = !isWorking
      ? isHoliday
        ? "Státní svátek"
        : isWeekendDay
          ? "Víkend"
          : "Nedostupné"
      : null;

    availableDates.push({
      date: new Date(currentDate),
      available: isWorking,
      timeSlots: isWorking ? ["morning", "afternoon", "anytime"] : [],
      isHoliday,
      isWeekend: isWeekendDay,
      ...(reasonText && { reason: reasonText }),
    });
  }

  return availableDates;
}

/**
 * Calculate delivery cost based on distance, urgency, and time slot
 */
export function calculateDeliveryCost(
  _address: Address,
  urgency: DeliveryUrgency,
  timeSlot: DeliveryTimeSlot = "anytime",
  deliveryZone?: DeliveryZone
): DeliveryCostCalculation {
  const option = DEFAULT_DELIVERY_OPTIONS.find((opt) => opt.urgency === urgency);
  if (!option) {
    throw new Error(`Invalid delivery urgency: ${urgency}`);
  }

  const baseCost = deliveryZone?.baseCost || option.baseCost;

  // Distance cost calculation (simplified - in real app would use geocoding)
  const distanceCost = 0; // Would calculate based on actual distance

  // Urgency cost (already included in base cost)
  const urgencyCost = 0;

  // Time slot cost
  let timeSlotCost = 0;
  if (timeSlot === "morning" || timeSlot === "evening") {
    timeSlotCost = 50; // Premium for specific time slots
  }

  const totalCost = baseCost + distanceCost + urgencyCost + timeSlotCost;
  const estimatedDeliveryDate = calculateEarliestDeliveryDate(urgency);

  return {
    baseCost,
    distanceCost,
    urgencyCost,
    timeSlotCost,
    totalCost,
    estimatedDeliveryDate,
    estimatedTimeSlot: timeSlot,
  };
}

/**
 * Get delivery zones (simplified - in real app would be from database)
 */
export function getDeliveryZones(): DeliveryZone[] {
  return [
    {
      id: "prague",
      name: "Praha",
      postalCodes: ["100", "110", "120", "130", "140", "150", "160", "170", "180", "190"],
      baseCost: 150,
      maxDistance: 25,
      supportedUrgencies: ["standard", "express", "same-day"],
    },
    {
      id: "central-bohemia",
      name: "Střední Čechy",
      postalCodes: ["250", "260", "270", "280", "290"],
      baseCost: 200,
      maxDistance: 50,
      supportedUrgencies: ["standard", "express"],
    },
    {
      id: "other",
      name: "Ostatní oblasti",
      postalCodes: [],
      baseCost: 300,
      maxDistance: 100,
      supportedUrgencies: ["standard"],
    },
  ];
}

/**
 * Find delivery zone by postal code
 */
export function findDeliveryZone(postalCode: string): DeliveryZone {
  const zones = getDeliveryZones();
  const zone = zones.find((z) => z.postalCodes.some((pc) => postalCode.startsWith(pc)));
  return zone || zones[zones.length - 1]!; // Default to 'other' zone
}

/**
 * Validate if delivery is possible for given parameters
 */
export function validateDeliveryRequest(
  address: Address,
  urgency: DeliveryUrgency,
  preferredDate?: Date
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check postal code
  if (!address.postalCode) {
    errors.push("PSČ je povinné");
  }

  // Check delivery zone support
  const zone = findDeliveryZone(address.postalCode);
  if (!zone.supportedUrgencies.includes(urgency)) {
    errors.push(`${urgency} doručení není dostupné pro vaši oblast`);
  }

  // Check preferred date
  if (preferredDate) {
    const earliestDate = calculateEarliestDeliveryDate(urgency);
    if (preferredDate < earliestDate) {
      errors.push("Zvolené datum je příliš brzy pro tento typ doručení");
    }

    if (!isWorkingDay(preferredDate)) {
      errors.push("Zvolené datum není pracovní den");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
