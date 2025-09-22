import {
  storeOfflineOperation,
  getOfflineOperations,
  removeOfflineOperation,
  updateOfflineOperationRetry,
  clearOfflineOperations,
  processOfflineOperations,
} from '../utils';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
});

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('Enhanced Offline Operations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  describe('Store Operations', () => {
    it('should store offline operation with metadata', () => {
      const operation = {
        type: 'add' as const,
        data: { productId: 'prod1', quantity: 2 },
        timestamp: Date.now(),
        maxRetries: 3,
        priority: 'high' as const,
      };

      storeOfflineOperation(operation);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'cart_offline_operations_v2',
        expect.stringContaining('"type":"add"')
      );

      const savedData = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1]);
      expect(savedData).toHaveLength(1);
      expect(savedData[0]).toMatchObject({
        ...operation,
        retryCount: 0,
      });
      expect(savedData[0].id).toBeDefined();
    });

    it('should append to existing operations', () => {
      const existingOperations = [
        {
          id: 'existing-1',
          type: 'update',
          data: { itemId: '1', quantity: 3 },
          timestamp: Date.now() - 1000,
          retryCount: 0,
          maxRetries: 3,
          priority: 'medium',
        },
      ];

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingOperations));

      const newOperation = {
        type: 'remove' as const,
        data: { itemId: '2' },
        timestamp: Date.now(),
        maxRetries: 3,
        priority: 'low' as const,
      };

      storeOfflineOperation(newOperation);

      const savedData = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1]);
      expect(savedData).toHaveLength(2);
    });

    it('should handle storage errors gracefully', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage full');
      });

      const operation = {
        type: 'add' as const,
        data: { productId: 'prod1', quantity: 2 },
        timestamp: Date.now(),
        maxRetries: 3,
        priority: 'high' as const,
      };

      // Should not throw
      expect(() => storeOfflineOperation(operation)).not.toThrow();
    });
  });

  describe('Retrieve Operations', () => {
    it('should retrieve stored operations', () => {
      const operations = [
        {
          id: 'op-1',
          type: 'add',
          data: { productId: 'prod1', quantity: 2 },
          timestamp: Date.now(),
          retryCount: 0,
          maxRetries: 3,
          priority: 'high',
        },
      ];

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(operations));

      const result = getOfflineOperations();
      expect(result).toEqual(operations);
    });

    it('should return empty array when no operations exist', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const result = getOfflineOperations();
      expect(result).toEqual([]);
    });

    it('should handle corrupted data gracefully', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json');

      const result = getOfflineOperations();
      expect(result).toEqual([]);
    });
  });

  describe('Remove Operations', () => {
    it('should remove specific operation by ID', () => {
      const operations = [
        {
          id: 'op-1',
          type: 'add',
          data: { productId: 'prod1', quantity: 2 },
          timestamp: Date.now(),
          retryCount: 0,
          maxRetries: 3,
          priority: 'high',
        },
        {
          id: 'op-2',
          type: 'update',
          data: { itemId: '1', quantity: 3 },
          timestamp: Date.now(),
          retryCount: 0,
          maxRetries: 3,
          priority: 'medium',
        },
      ];

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(operations));

      removeOfflineOperation('op-1');

      const savedData = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1]);
      expect(savedData).toHaveLength(1);
      expect(savedData[0].id).toBe('op-2');
    });

    it('should handle non-existent operation ID', () => {
      const operations = [
        {
          id: 'op-1',
          type: 'add',
          data: { productId: 'prod1', quantity: 2 },
          timestamp: Date.now(),
          retryCount: 0,
          maxRetries: 3,
          priority: 'high',
        },
      ];

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(operations));

      removeOfflineOperation('non-existent');

      const savedData = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1]);
      expect(savedData).toHaveLength(1);
      expect(savedData[0].id).toBe('op-1');
    });
  });

  describe('Update Retry Count', () => {
    it('should increment retry count for specific operation', () => {
      const operations = [
        {
          id: 'op-1',
          type: 'add',
          data: { productId: 'prod1', quantity: 2 },
          timestamp: Date.now(),
          retryCount: 0,
          maxRetries: 3,
          priority: 'high',
        },
      ];

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(operations));

      updateOfflineOperationRetry('op-1');

      const savedData = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1]);
      expect(savedData[0].retryCount).toBe(1);
    });

    it('should handle non-existent operation ID', () => {
      const operations = [
        {
          id: 'op-1',
          type: 'add',
          data: { productId: 'prod1', quantity: 2 },
          timestamp: Date.now(),
          retryCount: 0,
          maxRetries: 3,
          priority: 'high',
        },
      ];

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(operations));

      updateOfflineOperationRetry('non-existent');

      const savedData = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1]);
      expect(savedData[0].retryCount).toBe(0); // Should remain unchanged
    });
  });

  describe('Clear Operations', () => {
    it('should clear all offline operations', () => {
      clearOfflineOperations();

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('cart_offline_operations_v2');
    });

    it('should handle clear errors gracefully', () => {
      mockLocalStorage.removeItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      // Should not throw
      expect(() => clearOfflineOperations()).not.toThrow();
    });
  });

  describe('Process Operations', () => {
    beforeEach(() => {
      mockFetch.mockClear();
    });

    it('should process successful operations', async () => {
      const operations = [
        {
          id: 'op-1',
          type: 'add',
          data: { productId: 'prod1', quantity: 2, customizations: [] },
          timestamp: Date.now(),
          retryCount: 0,
          maxRetries: 3,
          priority: 'high',
        },
        {
          id: 'op-2',
          type: 'update',
          data: { itemId: '1', quantity: 3 },
          timestamp: Date.now(),
          retryCount: 0,
          maxRetries: 3,
          priority: 'medium',
        },
      ];

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(operations));

      // Mock successful API responses
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const result = await processOfflineOperations();

      expect(result.successful).toBe(2);
      expect(result.failed).toBe(0);
      expect(result.errors).toHaveLength(0);

      // Should have made API calls for each operation
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockFetch).toHaveBeenCalledWith('/api/cart/items', expect.objectContaining({
        method: 'POST',
      }));
      expect(mockFetch).toHaveBeenCalledWith('/api/cart/items/1', expect.objectContaining({
        method: 'PUT',
      }));
    });

    it('should handle failed operations', async () => {
      const operations = [
        {
          id: 'op-1',
          type: 'add',
          data: { productId: 'prod1', quantity: 2, customizations: [] },
          timestamp: Date.now(),
          retryCount: 0,
          maxRetries: 3,
          priority: 'high',
        },
      ];

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(operations));

      // Mock failed API response
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: false, error: 'Product not found' }),
      });

      const result = await processOfflineOperations();

      expect(result.successful).toBe(0);
      expect(result.failed).toBe(1);
      expect(result.errors).toHaveLength(0);

      // Should update retry count
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    it('should handle network errors', async () => {
      const operations = [
        {
          id: 'op-1',
          type: 'add',
          data: { productId: 'prod1', quantity: 2, customizations: [] },
          timestamp: Date.now(),
          retryCount: 0,
          maxRetries: 3,
          priority: 'high',
        },
      ];

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(operations));

      // Mock network error
      mockFetch.mockRejectedValue(new Error('Network error'));

      const result = await processOfflineOperations();

      expect(result.successful).toBe(0);
      expect(result.failed).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Network error');
    });

    it('should remove operations that exceed max retries', async () => {
      const operations = [
        {
          id: 'op-1',
          type: 'add',
          data: { productId: 'prod1', quantity: 2, customizations: [] },
          timestamp: Date.now(),
          retryCount: 3, // Already at max retries
          maxRetries: 3,
          priority: 'high',
        },
      ];

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(operations));

      const result = await processOfflineOperations();

      expect(result.successful).toBe(0);
      expect(result.failed).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('exceeded max retries');

      // Should remove the operation
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    it('should handle different operation types', async () => {
      const operations = [
        {
          id: 'op-1',
          type: 'add',
          data: { productId: 'prod1', quantity: 2, customizations: [] },
          timestamp: Date.now(),
          retryCount: 0,
          maxRetries: 3,
          priority: 'high',
        },
        {
          id: 'op-2',
          type: 'update',
          data: { itemId: '1', quantity: 3 },
          timestamp: Date.now(),
          retryCount: 0,
          maxRetries: 3,
          priority: 'medium',
        },
        {
          id: 'op-3',
          type: 'remove',
          data: { itemId: '2' },
          timestamp: Date.now(),
          retryCount: 0,
          maxRetries: 3,
          priority: 'low',
        },
      ];

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(operations));

      // Mock successful API responses
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const result = await processOfflineOperations();

      expect(result.successful).toBe(3);
      expect(mockFetch).toHaveBeenCalledTimes(3);

      // Check correct API endpoints were called
      expect(mockFetch).toHaveBeenCalledWith('/api/cart/items', expect.objectContaining({
        method: 'POST',
      }));
      expect(mockFetch).toHaveBeenCalledWith('/api/cart/items/1', expect.objectContaining({
        method: 'PUT',
      }));
      expect(mockFetch).toHaveBeenCalledWith('/api/cart/items/2', expect.objectContaining({
        method: 'DELETE',
      }));
    });
  });
});
