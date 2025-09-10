/**
 * Redis caching utilities for delivery data
 * Handles caching of delivery availability, pricing, and calendar data
 */

import {
  DeliveryAvailability,
  DeliveryCacheData,
  DeliveryZone,
  Holiday
} from '@/types/delivery';

// Cache key prefixes
const CACHE_KEYS = {
  DELIVERY_CALENDAR: 'delivery:calendar',
  DELIVERY_AVAILABILITY: 'delivery:availability',
  DELIVERY_ZONES: 'delivery:zones',
  DELIVERY_HOLIDAYS: 'delivery:holidays',
  DELIVERY_PRICING: 'delivery:pricing'
} as const;

// Cache TTL (Time To Live) in seconds
const CACHE_TTL = {
  CALENDAR: 3600, // 1 hour
  AVAILABILITY: 1800, // 30 minutes
  ZONES: 86400, // 24 hours
  HOLIDAYS: 86400, // 24 hours
  PRICING: 300 // 5 minutes
} as const;

/**
 * Redis client interface (to be implemented with actual Redis client)
 * For now, we'll use a simple in-memory cache as fallback
 */
interface CacheClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttl?: number): Promise<void>;
  del(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
}

// Simple in-memory cache implementation (fallback)
class MemoryCache implements CacheClient {
  private cache = new Map<string, { value: string; expires: number }>();

  async get(key: string): Promise<string | null> {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  async set(key: string, value: string, ttl = 3600): Promise<void> {
    const expires = Date.now() + (ttl * 1000);
    this.cache.set(key, { value, expires });
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    const item = this.cache.get(key);
    if (!item) return false;

    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }
}

// Cache client instance (would be Redis in production)
let cacheClient: CacheClient;

/**
 * Initialize cache client
 */
function getCacheClient(): CacheClient {
  if (!cacheClient) {
    // In production, this would initialize Redis client
    // For now, use memory cache
    cacheClient = new MemoryCache();
  }
  return cacheClient;
}

/**
 * Generate cache key for delivery calendar
 */
function getCalendarCacheKey(month: number, year: number, postalCode?: string): string {
  const base = `${CACHE_KEYS.DELIVERY_CALENDAR}:${year}:${month}`;
  return postalCode ? `${base}:${postalCode}` : base;
}

/**
 * Generate cache key for delivery availability
 */
function getAvailabilityCacheKey(date: string, postalCode?: string): string {
  const base = `${CACHE_KEYS.DELIVERY_AVAILABILITY}:${date}`;
  return postalCode ? `${base}:${postalCode}` : base;
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
    const data = JSON.stringify(availableDates);

    await client.set(key, data, CACHE_TTL.CALENDAR);
  } catch (error) {
    console.error('Error caching delivery calendar:', error);
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

    if (!cached) return null;

    const data = JSON.parse(cached);
    // Convert date strings back to Date objects
    return data.map((item: any) => ({
      ...item,
      date: new Date(item.date)
    }));
  } catch (error) {
    console.error('Error getting cached delivery calendar:', error);
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
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
    const key = getAvailabilityCacheKey(dateStr, postalCode);
    const data = JSON.stringify(availability);

    await client.set(key, data, CACHE_TTL.AVAILABILITY);
  } catch (error) {
    console.error('Error caching delivery availability:', error);
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
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
    const key = getAvailabilityCacheKey(dateStr, postalCode);
    const cached = await client.get(key);

    if (!cached) return null;

    const data = JSON.parse(cached);
    return {
      ...data,
      date: new Date(data.date)
    };
  } catch (error) {
    console.error('Error getting cached delivery availability:', error);
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
    const data = JSON.stringify(zones);

    await client.set(key, data, CACHE_TTL.ZONES);
  } catch (error) {
    console.error('Error caching delivery zones:', error);
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

    if (!cached) return null;

    return JSON.parse(cached);
  } catch (error) {
    console.error('Error getting cached delivery zones:', error);
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
    const data = JSON.stringify(holidays);

    await client.set(key, data, CACHE_TTL.HOLIDAYS);
  } catch (error) {
    console.error('Error caching holidays:', error);
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

    if (!cached) return null;

    const data = JSON.parse(cached);
    // Convert date strings back to Date objects
    return data.map((holiday: any) => ({
      ...holiday,
      date: new Date(holiday.date)
    }));
  } catch (error) {
    console.error('Error getting cached holidays:', error);
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
    const key = `${CACHE_KEYS.DELIVERY_PRICING}:${postalCode}:${urgency}`;
    const data = JSON.stringify(pricing);

    await client.set(key, data, CACHE_TTL.PRICING);
  } catch (error) {
    console.error('Error caching delivery pricing:', error);
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
    const key = `${CACHE_KEYS.DELIVERY_PRICING}:${postalCode}:${urgency}`;
    const cached = await client.get(key);

    if (!cached) return null;

    return JSON.parse(cached);
  } catch (error) {
    console.error('Error getting cached delivery pricing:', error);
    return null;
  }
}

/**
 * Invalidate all delivery cache
 */
export async function invalidateDeliveryCache(): Promise<void> {
  try {
    const client = getCacheClient();

    // In a real Redis implementation, you would use pattern matching
    // For now, we'll clear the memory cache entirely
    if (client instanceof MemoryCache) {
      (client as any).cache.clear();
    }
  } catch (error) {
    console.error('Error invalidating delivery cache:', error);
  }
}

/**
 * Warm up delivery cache with commonly accessed data
 */
export async function warmUpDeliveryCache(): Promise<void> {
  try {
    // This would typically pre-load frequently accessed data
    // For example, current month's calendar, popular postal codes, etc.
    console.log('Warming up delivery cache...');

    // TODO: Implement cache warming logic
  } catch (error) {
    console.error('Error warming up delivery cache:', error);
  }
}
