/**
 * Redis caching utilities for delivery data
 * Handles caching of delivery availability, pricing, and calendar data
 */

import type { DeliveryAvailability, DeliveryZone, Holiday } from "@/types/delivery";
import {
  CACHE_KEYS,
  CACHE_TTL,
  deserializeFromCache,
  generateCacheKey,
  getCacheClient,
  serializeForCache,
} from "./redis";

/**
 * Generate cache key for delivery calendar
 */
function getCalendarCacheKey(month: number, year: number, postalCode?: string): string {
  return generateCacheKey(
    CACHE_KEYS.DELIVERY_CALENDAR,
    year,
    month,
    ...(postalCode ? [postalCode] : [])
  );
}

/**
 * Generate cache key for delivery availability
 */
function getAvailabilityCacheKey(date: string, postalCode?: string): string {
  return generateCacheKey(
    CACHE_KEYS.DELIVERY_AVAILABILITY,
    date,
    ...(postalCode ? [postalCode] : [])
  );
}

/**
 * Cache delivery calendar data
 */
export async function cacheDeliveryCalendar(
  month: number,
  year: number,
  availableDates: DeliveryAvailability[],
  postalCode?: string
): Promise<void> {
  try {
    const client = getCacheClient();
    const key = getCalendarCacheKey(month, year, postalCode);
    const data = serializeForCache(availableDates);

    await client.set(key, data, CACHE_TTL.DELIVERY);
  } catch (error) {
    console.error("Error caching delivery calendar:", error);
  }
}

/**
 * Get cached delivery calendar data
 */
export async function getCachedDeliveryCalendar(
  month: number,
  year: number,
  postalCode?: string
): Promise<DeliveryAvailability[] | null> {
  try {
    const client = getCacheClient();
    const key = getCalendarCacheKey(month, year, postalCode);
    const cached = await client.get(key);

    const data = deserializeFromCache<DeliveryAvailability[]>(cached);
    if (!data) return null;

    // Convert date strings back to Date objects
    return data.map((item: any) => ({
      ...item,
      date: new Date(item.date),
    }));
  } catch (error) {
    console.error("Error getting cached delivery calendar:", error);
    return null;
  }
}

/**
 * Cache delivery availability for a specific date
 */
export async function cacheDeliveryAvailability(
  date: Date,
  availability: DeliveryAvailability,
  postalCode?: string
): Promise<void> {
  try {
    const client = getCacheClient();
    const dateStr = date.toISOString().split("T")[0]!; // YYYY-MM-DD
    const key = getAvailabilityCacheKey(dateStr, postalCode);
    const data = serializeForCache(availability);

    await client.set(key, data, CACHE_TTL.DELIVERY);
  } catch (error) {
    console.error("Error caching delivery availability:", error);
  }
}

/**
 * Get cached delivery availability for a specific date
 */
export async function getCachedDeliveryAvailability(
  date: Date,
  postalCode?: string
): Promise<DeliveryAvailability | null> {
  try {
    const client = getCacheClient();
    const dateStr = date.toISOString().split("T")[0]!; // YYYY-MM-DD
    const key = getAvailabilityCacheKey(dateStr, postalCode);
    const cached = await client.get(key);

    const data = deserializeFromCache<DeliveryAvailability>(cached);
    if (!data) return null;

    return {
      ...data,
      date: new Date(data.date),
    };
  } catch (error) {
    console.error("Error getting cached delivery availability:", error);
    return null;
  }
}

/**
 * Cache delivery zones
 */
export async function cacheDeliveryZones(zones: DeliveryZone[]): Promise<void> {
  try {
    const client = getCacheClient();
    const key = CACHE_KEYS.DELIVERY_ZONES;
    const data = serializeForCache(zones);

    await client.set(key, data, CACHE_TTL.DAY);
  } catch (error) {
    console.error("Error caching delivery zones:", error);
  }
}

/**
 * Get cached delivery zones
 */
export async function getCachedDeliveryZones(): Promise<DeliveryZone[] | null> {
  try {
    const client = getCacheClient();
    const key = CACHE_KEYS.DELIVERY_ZONES;
    const cached = await client.get(key);

    return deserializeFromCache<DeliveryZone[]>(cached);
  } catch (error) {
    console.error("Error getting cached delivery zones:", error);
    return null;
  }
}

/**
 * Cache holidays
 */
export async function cacheHolidays(holidays: Holiday[]): Promise<void> {
  try {
    const client = getCacheClient();
    const key = CACHE_KEYS.DELIVERY_HOLIDAYS;
    const data = serializeForCache(holidays);

    await client.set(key, data, CACHE_TTL.DAY);
  } catch (error) {
    console.error("Error caching holidays:", error);
  }
}

/**
 * Get cached holidays
 */
export async function getCachedHolidays(): Promise<Holiday[] | null> {
  try {
    const client = getCacheClient();
    const key = CACHE_KEYS.DELIVERY_HOLIDAYS;
    const cached = await client.get(key);

    const data = deserializeFromCache<Holiday[]>(cached);
    if (!data) return null;

    // Convert date strings back to Date objects
    return data.map((holiday: any) => ({
      ...holiday,
      date: new Date(holiday.date),
    }));
  } catch (error) {
    console.error("Error getting cached holidays:", error);
    return null;
  }
}

/**
 * Cache delivery pricing for a specific postal code and urgency
 */
export async function cacheDeliveryPricing(
  postalCode: string,
  urgency: string,
  pricing: any
): Promise<void> {
  try {
    const client = getCacheClient();
    const key = generateCacheKey(CACHE_KEYS.DELIVERY_PRICING, postalCode, urgency);
    const data = serializeForCache(pricing);

    await client.set(key, data, CACHE_TTL.SHORT);
  } catch (error) {
    console.error("Error caching delivery pricing:", error);
  }
}

/**
 * Get cached delivery pricing
 */
export async function getCachedDeliveryPricing(
  postalCode: string,
  urgency: string
): Promise<any | null> {
  try {
    const client = getCacheClient();
    const key = generateCacheKey(CACHE_KEYS.DELIVERY_PRICING, postalCode, urgency);
    const cached = await client.get(key);

    return deserializeFromCache(cached);
  } catch (error) {
    console.error("Error getting cached delivery pricing:", error);
    return null;
  }
}

/**
 * Invalidate all delivery cache
 */
export async function invalidateDeliveryCache(): Promise<void> {
  try {
    const client = getCacheClient();

    // Clear delivery-related cache patterns
    await client.flushPattern("delivery:*");
  } catch (error) {
    console.error("Error invalidating delivery cache:", error);
  }
}

/**
 * Warm up delivery cache with commonly accessed data
 */
export async function warmUpDeliveryCache(): Promise<void> {
  try {
    // This would typically pre-load frequently accessed data
    // For example, current month's calendar, popular postal codes, etc.
    console.log("Warming up delivery cache...");

    // TODO: Implement cache warming logic
  } catch (error) {
    console.error("Error warming up delivery cache:", error);
  }
}
