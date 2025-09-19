/**
 * API routes for delivery cost estimation
 * Handles delivery cost calculation based on location and urgency
 */

import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types";
import {
  DeliveryEstimateRequest,
  DeliveryEstimateResponse,
  DeliveryUrgency,
  DeliveryTimeSlot,
} from "@/types/delivery";
import {
  calculateDeliveryCost,
  findDeliveryZone,
  validateDeliveryRequest,
  DEFAULT_DELIVERY_OPTIONS,
} from "@/lib/utils/delivery-calculator";

/**
 * POST /api/delivery/estimate
 * Calculate delivery cost estimate
 */
export async function POST(request: NextRequest) {
  try {
    const body: DeliveryEstimateRequest = await request.json();

    // Validate required fields
    if (!body.address) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MISSING_ADDRESS",
            message: "Address is required for delivery estimation",
          },
        } as ApiResponse,
        { status: 400 }
      );
    }

    if (!body.address.postalCode) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MISSING_POSTAL_CODE",
            message: "Postal code is required for delivery estimation",
          },
        } as ApiResponse,
        { status: 400 }
      );
    }

    const urgency: DeliveryUrgency = body.urgency || "standard";
    const timeSlot: DeliveryTimeSlot = "anytime"; // Default time slot

    // Validate delivery request
    const validation = validateDeliveryRequest(
      body.address,
      urgency,
      body.preferredDate ? new Date(body.preferredDate) : undefined
    );

    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Delivery request validation failed",
            details: validation.errors,
          },
        } as ApiResponse,
        { status: 400 }
      );
    }

    // Find delivery zone
    const deliveryZone = findDeliveryZone(body.address.postalCode);

    // Calculate delivery cost
    const estimate = calculateDeliveryCost(body.address, urgency, timeSlot, deliveryZone);

    // Get available delivery options for this zone
    const availableOptions = DEFAULT_DELIVERY_OPTIONS.filter((option) =>
      deliveryZone.supportedUrgencies.includes(option.urgency)
    );

    const response: DeliveryEstimateResponse = {
      success: true,
      estimate,
      availableOptions,
    };

    // Set cache headers (short cache since prices might change)
    const headers = new Headers();
    headers.set("Cache-Control", "public, max-age=300"); // Cache for 5 minutes

    return NextResponse.json(response, { headers });
  } catch (error) {
    console.error("Error in POST /api/delivery/estimate:", error);
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
 * GET /api/delivery/estimate
 * Get delivery options and zones information
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postalCode = searchParams.get("postalCode");

    let availableOptions = DEFAULT_DELIVERY_OPTIONS;

    // Filter options by postal code if provided
    if (postalCode) {
      const deliveryZone = findDeliveryZone(postalCode);
      availableOptions = DEFAULT_DELIVERY_OPTIONS.filter((option) =>
        deliveryZone.supportedUrgencies.includes(option.urgency)
      );
    }

    const response: DeliveryEstimateResponse = {
      success: true,
      availableOptions,
    };

    // Set cache headers
    const headers = new Headers();
    headers.set("Cache-Control", "public, max-age=3600"); // Cache for 1 hour

    return NextResponse.json(response, { headers });
  } catch (error) {
    console.error("Error in GET /api/delivery/estimate:", error);
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
