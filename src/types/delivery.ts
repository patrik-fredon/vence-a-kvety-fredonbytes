/**
 * Delivery-related type definitions for the funeral wreaths e-commerce platform
 */

import { BaseEntity } from "./index";
import type { Address } from "./index";

// Delivery option types
export type DeliveryUrgency = "standard" | "express" | "same-day";
export type DeliveryTimeSlot = "morning" | "afternoon" | "evening" | "anytime";

// Delivery availability interface
export interface DeliveryAvailability {
  date: Date;
  available: boolean;
  timeSlots: DeliveryTimeSlot[];
  maxOrders?: number;
  currentOrders?: number;
  isHoliday?: boolean;
  isWeekend?: boolean;
  reason?: string; // Why unavailable
}

// Delivery option interface
export interface DeliveryOption {
  id: string;
  name: string;
  description: string;
  urgency: DeliveryUrgency;
  baseCost: number;
  estimatedHours: number;
  availableTimeSlots: DeliveryTimeSlot[];
  minimumNoticeHours: number;
  maxDistance?: number; // in kilometers
}

// Delivery cost calculation
export interface DeliveryCostCalculation {
  baseCost: number;
  distanceCost: number;
  urgencyCost: number;
  timeSlotCost: number;
  totalCost: number;
  estimatedDeliveryDate: Date;
  estimatedTimeSlot?: DeliveryTimeSlot;
}

// Delivery request interface
export interface DeliveryRequest {
  address: Address;
  urgency: DeliveryUrgency;
  preferredDate?: Date;
  preferredTimeSlot?: DeliveryTimeSlot;
  specialInstructions?: string;
}

// Delivery calendar data
export interface DeliveryCalendarData {
  month: number;
  year: number;
  availableDates: DeliveryAvailability[];
  holidays: Date[];
  blackoutDates: Date[];
}

// API request/response types
export interface DeliveryEstimateRequest {
  address: Address;
  items?: { productId: string; quantity: number }[];
  urgency?: DeliveryUrgency;
  preferredDate?: string; // ISO date string
}

export interface DeliveryEstimateResponse {
  success: boolean;
  estimate?: DeliveryCostCalculation;
  availableOptions?: DeliveryOption[];
  error?: string;
}

export interface DeliveryCalendarRequest {
  month: number;
  year: number;
  postalCode?: string; // For location-specific availability
}

export interface DeliveryCalendarResponse {
  success: boolean;
  calendar?: DeliveryCalendarData;
  error?: string;
}

// Czech holidays configuration
export interface Holiday {
  date: Date;
  name: string;
  type: "public" | "religious" | "custom";
}

// Delivery zone configuration
export interface DeliveryZone {
  id: string;
  name: string;
  postalCodes: string[];
  baseCost: number;
  maxDistance: number;
  supportedUrgencies: DeliveryUrgency[];
}

// Redis cache keys and data structures
export interface DeliveryCacheData {
  availability: Record<string, DeliveryAvailability>; // date string -> availability
  zones: DeliveryZone[];
  holidays: Holiday[];
  lastUpdated: Date;
}

export interface DeliverySettings {
  standardDeliveryHours: number;
  expressDeliveryHours: number;
  sameDayDeliveryHours: number;
  workingHours: {
    start: string; // HH:mm format
    end: string;
  };
  workingDays: number[]; // 0-6, Sunday = 0
  maxAdvanceBookingDays: number;
  defaultTimeSlot: DeliveryTimeSlot;
}
