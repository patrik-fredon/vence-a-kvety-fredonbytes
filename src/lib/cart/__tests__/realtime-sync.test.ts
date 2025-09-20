import { CartSyncManager, CartConflictResolver, CartPersistenceManager } from '../realtime-sync';
import { CartSummary, CartItem } from '@/types/cart';

// Mock WebSocket
class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  readyState = MockWebSocket.CONNECTING;
  onopen: ((event: Event) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;

  constructor(public url: string) {
    // Simulate connection after a short delay
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN;
      if (this.onopen) {
        this.onopen(new Event('open'));
      }
    }, 10);
  }

  send(data: string) {
    // Mock send functionality
  }

  close() {
    this.readyState = MockWebSocket.CLOSED;
    if (this.onclose) {
      this.onclose(new CloseEvent('close'));
    }
  }
}

// Mock global WebSocket
(global as any).WebSocket = MockWebSocket;

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
});

// Mock window location
Object.defineProperty(global, 'window', {
  value: {
    location: {
      protocol: 'https:',
      host: 'localhost:3000',
    },
  },
});

const mockCartItem: CartItem = {
  id: '1',
  productId: 'prod1',
  quantity: 2,
  unitPrice: 1500,
  totalPrice: 3000,
  customizations: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockCartSummary: CartSummary = {
  items: [mockCartItem],
  itemCount: 2,
  subtotal: 3000,
  total: 3000,
};

describe('CartSyncManager', () => {
  let syncManager: CartSyncManager;

  beforeEach(() => {
    jest.clearAllMocks();
    syncManager = new CartSyncManager('user123', 'session456');
  });

  afterEach(() => {
    syncManager.disconnect();
  });

  describe('WebSocket Connection', () => {
    it('should establish WebSocket connection', async () => {
      const connected = await syncManager.connect();
      expect(connected).toBe(true);
    });

    it('should handle connection errors gracefully', async () => {
      // Mock WebSocket constructor to throw error
      (global as any).WebSocket = jest.fn(() => {
        throw new Error('Connection failed');
      });

      const connected = await syncManager.connect();
      expect(connected).toBe(false);

      // Restore mock
      (global as any).WebSocket = MockWebSocket;
    });

    it('should attempt reconnection on disconnect', async () => {
      jest.useFakeTimers();

      await syncManager.connect();

      // Simulate disconnect
      const ws = (syncManager as any).ws;
      ws.readyState = MockWebSocket.CLOSED;
      if (ws.onclose) {
        ws.onclose(new CloseEvent('close'));
      }

      // Fast-forward time to trigger reconnection
      jest.advanceTimersByTime(1000);

      // Should attempt to reconnect
      expect((syncManager as any).reconnectAttempts).toBeGreaterThan(0);

      jest.useRealTimers();
    });
  });

  describe('Event Handling', () => {
    it('should register and emit events', async () => {
      const mockListener = jest.fn();
      syncManager.on('sync', mockListener);

      await syncManager.connect();

      // Simulate incoming message
      const ws = (syncManager as any).ws;
      if (ws.onmessage) {
        ws.onmessage(new MessageEvent('message', {
          data: JSON.stringify({
            type: 'cart_sync',
            data: mockCartSummary,
            timestamp: Date.now(),
          }),
        }));
      }

      expect(mockListener).toHaveBeenCalled();
    });

    it('should remove event listeners', async () => {
      const mockListener = jest.fn();
      syncManager.on('sync', mockListener);
      syncManager.off('sync', mockListener);

      await syncManager.connect();

      // Simulate incoming message
      const ws = (syncManager as any).ws;
      if (ws.onmessage) {
        ws.onmessage(new MessageEvent('message', {
          data: JSON.stringify({
            type: 'cart_sync',
            data: mockCartSummary,
            timestamp: Date.now(),
          }),
        }));
      }

      expect(mockListener).not.toHaveBeenCalled();
    });
  });

  describe('Heartbeat', () => {
    it('should send periodic heartbeat messages', async () => {
      jest.useFakeTimers();

      const sendSpy = jest.spyOn(syncManager as any, 'send');
      await syncManager.connect();

      // Fast-forward 30 seconds
      jest.advanceTimersByTime(30000);

      expect(sendSpy).toHaveBeenCalledWith({ type: 'ping' });

      jest.useRealTimers();
    });
  });
});

describe('CartConflictResolver', () => {
  const localCart: CartSummary = {
    items: [
      { ...mockCartItem, quantity: 3, totalPrice: 4500 },
    ],
    itemCount: 3,
    subtotal: 4500,
    total: 4500,
  };

  const serverCart: CartSummary = {
    items: [
      { ...mockCartItem, quantity: 2, totalPrice: 3000 },
    ],
    itemCount: 2,
    subtotal: 3000,
    total: 3000,
  };

  describe('Conflict Resolution Strategies', () => {
    it('should resolve conflicts with server_wins strategy', () => {
      const resolution = CartConflictResolver.resolveConflicts(
        localCart,
        serverCart,
        'server_wins'
      );

      expect(resolution.strategy).toBe('server_wins');
      expect(resolution.resolvedCart).toEqual(serverCart);
    });

    it('should resolve conflicts with client_wins strategy', () => {
      const resolution = CartConflictResolver.resolveConflicts(
        localCart,
        serverCart,
        'client_wins'
      );

      expect(resolution.strategy).toBe('client_wins');
      expect(resolution.resolvedCart).toEqual(localCart);
    });

    it('should resolve conflicts with merge strategy', () => {
      const resolution = CartConflictResolver.resolveConflicts(
        localCart,
        serverCart,
        'merge'
      );

      expect(resolution.strategy).toBe('merge');
      expect(resolution.conflicts).toHaveLength(1);
      expect(resolution.conflicts[0].field).toBe('quantity');
      expect(resolution.conflicts[0].localValue).toBe(3);
      expect(resolution.conflicts[0].serverValue).toBe(2);
    });

    it('should handle items that exist only locally', () => {
      const localWithExtra: CartSummary = {
        ...localCart,
        items: [
          ...localCart.items,
          {
            id: 'temp_123',
            productId: 'prod2',
            quantity: 1,
            unitPrice: 2000,
            totalPrice: 2000,
            customizations: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      };

      const resolution = CartConflictResolver.resolveConflicts(
        localWithExtra,
        serverCart,
        'merge'
      );

      // Should keep optimistic items
      expect(resolution.resolvedCart.items).toHaveLength(2);
      expect(resolution.resolvedCart.items.some(item => item.id === 'temp_123')).toBe(true);
    });

    it('should handle items that exist only on server', () => {
      const serverWithExtra: CartSummary = {
        ...serverCart,
        items: [
          ...serverCart.items,
          {
            id: '2',
            productId: 'prod2',
            quantity: 1,
            unitPrice: 2000,
            totalPrice: 2000,
            customizations: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      };

      const resolution = CartConflictResolver.resolveConflicts(
        localCart,
        serverWithExtra,
        'merge'
      );

      // Should include server-only items
      expect(resolution.resolvedCart.items).toHaveLength(2);
      expect(resolution.resolvedCart.items.some(item => item.id === '2')).toBe(true);
    });
  });

  describe('Customization Conflicts', () => {
    it('should detect customization conflicts', () => {
      const localWithCustomizations: CartSummary = {
        ...localCart,
        items: [
          {
            ...mockCartItem,
            customizations: [{ optionId: 'message', customValue: 'Local message' }],
          },
        ],
      };

      const serverWithCustomizations: CartSummary = {
        ...serverCart,
        items: [
          {
            ...mockCartItem,
            customizations: [{ optionId: 'message', customValue: 'Server message' }],
          },
        ],
      };

      const resolution = CartConflictResolver.resolveConflicts(
        localWithCustomizations,
        serverWithCustomizations,
        'merge'
      );

      expect(resolution.conflicts).toHaveLength(1);
      expect(resolution.conflicts[0].field).toBe('customizations');
    });
  });
});

describe('CartPersistenceManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Save and Load', () => {
    it('should save cart state with version and timestamp', () => {
      const version = 12345;
      CarceManager.saveCartState(mockCartSummary, version);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'cart_state_v2',
        expect.stringContaining('"version":2')
      );

      const savedData = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1]);
      expect(savedData.cartVersion).toBe(version);
      expect(savedData.cart).toEqual(mockCartSummary);
    });

    it('should load valid cart state', () => {
      const stateData = {
        version: 2,
        timestamp: Date.now(),
        cartVersion: 12345,
        cart: mockCartSummary,
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(stateData));

      const result = CartPersistenceManager.loadCartState();

      expect(result).toEqual({
        cart: mockCartSummary,
        version: 12345,
      });
    });

    it('should reject outdated cart state', () => {
      const stateData = {
        version: 2,
        timestamp: Date.now() - (25 * 60 * 60 * 1000), // 25 hours old
        cartVersion: 12345,
        cart: mockCartSummary,
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(stateData));

      const result = CartPersistenceManager.loadCartState();

      expect(result).toBeNull();
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('cart_state_v2');
    });

    it('should reject incompatible version', () => {
      const stateData = {
        version: 1, // Old version
        timestamp: Date.now(),
        cartVersion: 12345,
        cart: mockCartSummary,
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(stateData));

      const result = CartPersistenceManager.loadCartState();

      expect(result).toBeNull();
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('cart_state_v2');
    });

    it('should handle corrupted data gracefully', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json');

      const result = CartPersistenceManager.loadCartState();

      expect(result).toBeNull();
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('cart_state_v2');
    });
  });

  describe('Clear State', () => {
    it('should clear stored cart state', () => {
      CartPersistenceManager.clearCartState();

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('cart_state_v2');
    });

    it('should handle clear errors gracefully', () => {
      mockLocalStorage.removeItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      // Should not throw
      expect(() => CartPersistenceManager.clearCartState()).not.toThrow();
    });
  });
});
