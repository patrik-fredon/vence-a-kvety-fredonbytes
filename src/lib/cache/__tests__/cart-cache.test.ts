/**
 * Tests for cart cache functionality
 * These tests verify that the cart cache operations work correctly
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock the Redis client
const mockCacheClient = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  exists: jest.fn(),
};

jest.mock('../redis', () => ({
  getCacheClient: () => mockCacheClient,
  CACHE_KEYS: {
    CART: 'cart',
  },
  generateCacheKey: (...parts: string[]) => parts.join(':'),
  serializeForCache: (data: any) => JSON.stringify(data),
  deserializeFromCache: (data: string) => JSON.parse(data),
}));

import {
  cacheCartConfiguration,
  getCachedCartConfiguration,
  invalidateCartCache,
  clearCartCache,
  updateCachedCartAfterItemChange,
  hasCartCache,
  getCartCacheStats,
  type CachedCartConfig,
} from '../cart-cache';

describe('Cart Cache', () => {
  const userId = 'test-user-123';
  const sessionId = 'test-session-456';

  const mockCartData: CachedCartConfig = {
    items: [],
    totalItems: 0,
    totalPrice: 0,
    lastUpdated: new Date().toISOString(),
    version: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('cacheCartConfiguration', () => {
    it('should cache cart configuration successfully', async () => {
      mockCacheClient.set.mockResolvedValue(undefined);

      await cacheCartConfiguration(userId, null, mockCartData);

      expect(mockCacheClient.set).toHaveBeenCalledWith(
        'cart:config:test-user-123',
        expect.any(String),
        86400 // 24 hours in seconds
      );
    });

    it('should handle cache errors gracefully', async () => {
      mockCacheClient.set.mockRejectedValue(new Error('Redis error'));

      // Should not throw
      await expect(cacheCartConfiguration(userId, null, mockCartData)).resolves.toBeUndefined();
    });
  });

  describe('getCachedCartConfiguration', () => {
    it('should retrieve cached cart configuration', async () => {
      const cachedData = JSON.stringify(mockCartData);
      mockCacheClient.get.mockResolvedValue(cachedData);

      const result = await getCachedCartConfiguration(userId, null);

      expect(result).toEqual(mockCartData);
      expect(mockCacheClient.get).toHaveBeenCalledWith('cart:config:test-user-123');
    });

    it('should return null when no cache exists', async () => {
      mockCacheClient.get.mockResolvedValue(null);

      const result = await getCachedCartConfiguration(userId, null);

      expect(result).toBeNull();
    });

    it('should handle cache errors gracefully', async () => {
      mockCacheClient.get.mockRejectedValue(new Error('Redis error'));

      const result = await getCachedCartConfiguration(userId, null);

      expect(result).toBeNull();
    });
  });

  describe('invalidateCartCache', () => {
    it('should invalidate cart cache successfully', async () => {
      mockCacheClient.del.mockResolvedValue(1);

      await invalidateCartCache(userId, null);

      expect(mockCacheClient.del).toHaveBeenCalledWith('cart:config:test-user-123');
    });

    it('should handle invalidation errors gracefully', async () => {
      mockCacheClient.del.mockRejectedValue(new Error('Redis error'));

      // Should not throw
      await expect(invalidateCartCache(userId, null)).resolves.toBeUndefined();
    });
  });

  describe('updateCachedCartAfterItemChange', () => {
    it('should invalidate cache after item change', async () => {
      mockCacheClient.del.mockResolvedValue(1);

      await updateCachedCartAfterItemChange(userId, null, 'add', 'item-123');

      expect(mockCacheClient.del).toHaveBeenCalledWith('cart:config:test-user-123');
    });
  });

  describe('hasCartCache', () => {
    it('should return true when cache exists', async () => {
      mockCacheClient.exists.mockResolvedValue(true);

      const result = await hasCartCache(userId, null);

      expect(result).toBe(true);
      expect(mockCacheClient.exists).toHaveBeenCalledWith('cart:config:test-user-123');
    });

    it('should return false when cache does not exist', async () => {
      mockCacheClient.exists.mockResolvedValue(false);

      const result = await hasCartCache(userId, null);

      expect(result).toBe(false);
    });

    it('should handle errors gracefully', async () => {
      mockCacheClient.exists.mockRejectedValue(new Error('Redis error'));

      const result = await hasCartCache(userId, null);

      expect(result).toBe(false);
    });
  });

  describe('getCartCacheStats', () => {
    it('should return cache stats when cache exists', async () => {
      const cartData = {
        ...mockCartData,
        totalItems: 2,
        lastUpdated: new Date(Date.now() - 5000).toISOString(), // 5 seconds ago
      };
      mockCacheClient.get.mockResolvedValue(JSON.stringify(cartData));

      const result = await getCartCacheStats(userId, null);

      expect(result).toEqual({
        hasCache: true,
        cacheAge: expect.any(Number),
        itemCount: 2,
      });
      expect(result?.cacheAge).toBeGreaterThanOrEqual(4);
      expect(result?.cacheAge).toBeLessThanOrEqual(6);
    });

    it('should return hasCache false when no cache exists', async () => {
      mockCacheClient.get.mockResolvedValue(null);

      const result = await getCartCacheStats(userId, null);

      expect(result).toEqual({ hasCache: false });
    });

    it('should handle errors gracefully', async () => {
      mockCacheClient.get.mockRejectedValue(new Error('Redis error'));

      const result = await getCartCacheStats(userId, null);

      expect(result).toBeNull();
    });
  });

  describe('session vs user handling', () => {
    it('should use session ID when user ID is not available', async () => {
      mockCacheClient.set.mockResolvedValue(undefined);

      await cacheCartConfiguration(null, sessionId, mockCartData);

      expect(mockCacheClient.set).toHaveBeenCalledWith(
        'cart:config:test-session-456',
        expect.any(String),
        86400
      );
    });

    it('should prefer user ID over session ID', async () => {
      mockCacheClient.set.mockResolvedValue(undefined);

      await cacheCartConfiguration(userId, sessionId, mockCartData);

      expect(mockCacheClient.set).toHaveBeenCalledWith(
        'cart:config:test-user-123',
        expect.any(String),
        86400
      );
    });

    it('should use anonymous when neither user nor session ID is available', async () => {
      mockCacheClient.set.mockResolvedValue(undefined);

      await cacheCartConfiguration(null, null, mockCartData);

      expect(mockCacheClient.set).toHaveBeenCalledWith(
        'cart:config:anonymous',
        expect.any(String),
        86400
      );
    });
  });
});
