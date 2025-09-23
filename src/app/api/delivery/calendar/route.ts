/**
 * API routes for delivery calendar
 * Handles delivery date availability and calendar data
 */

import { type NextRequest, NextResponse } from "next/server";
import { cacheDeliveryCalendar, getCachedDeliveryCalendar } from "@/lib/cache/delivery-cache";
import {
  CZECH_HOLIDAYS_2024,
  CZECH_HOLIDAYS_2025,
  generateAvailableDeliveryDates,
} from "@/lib/utils/delivery-calculator";
import type { ApiResponse } from "@/types";
import {
  type DeliveryCalendarData,
  DeliveryCalendarRequest,
  type DeliveryCalendarResponse,
} from "@/types/delivery";

/**
 * GET /api/delivery/calendar
 * Get delivery calendar data for a specific month
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const month = Number.parseInt(searchParams.get("month") || new Date().getMonth().toString());
    const year = Number.parseInt(searchParams.get("year") || new Date().getFullYear().toString());
    const postalCode = searchParams.get("postalCode") || undefined;

    // Validate parameters
    if (month < 0 || month > 11) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_MONTH",
            message: "Month must be between 0 and 11",
          },
        } as ApiResponse,
        { status: 400 }
      );
    }

    if (year < 2024 || year > 2030) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_YEAR",
            message: "Year must be between 2024 and 2030",
          },
        } as ApiResponse,
        { status: 400 }
      );
    }

    // Try to get from cache first
    let availableDates = await getCachedDeliveryCalendar(month, year, postalCode);

    if (!availableDates) {
      // Generate available delivery dates if not cached
      availableDates = generateAvailableDeliveryDates(month, year);

      // Cache the results
      await cacheDeliveryCalendar(month, year, availableDates, postalCode);
    }

    // Get holidays for the year
    const holidays = year === 2024 ? CZECH_HOLIDAYS_2024 : year === 2025 ? CZECH_HOLIDAYS_2025 : [];

    // Filter holidays for the requested month
    const monthHolidays = holidays
      .filter((holiday) => holiday.date.getMonth() === month && holiday.date.getFullYear() === year)
      .map((holiday) => holiday.date);

    const calendarData: DeliveryCalendarData = {
      month,
      year,
      availableDates,
      holidays: monthHolidays,
      blackoutDates: [], // Could be populated from database
    };

    const response: DeliveryCalendarResponse = {
      success: true,
      calendar: calendarData,
    };

    // Set cache headers for performance
    const headers = new Headers();
    headers.set("Cache-Control", "public, max-age=3600"); // Cache for 1 hour

    return NextResponse.json(response, { headers });
  } catch (error) {
    console.error("Error in GET /api/delivery/calendar:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Internal server error",
        },
      } as ApiResponse,
      { status: 500 }
    );
  }
}

/**
 * POST /api/delivery/calendar
 * Update delivery calendar availability (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    // TODO: Add authentication check for admin users

    const body = await request.json();

    // TODO: Implement calendar updates
    // This would typically update a database with custom availability rules

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "NOT_IMPLEMENTED",
          message: "Calendar updates not yet implemented",
        },
      } as ApiResponse,
      { status: 501 }
    );
  } catch (error) {
    console.error("Error in POST /api/delivery/calendar:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Internal server error",
        },
      } as ApiResponse,
      { status: 500 }
    );
  }
}
