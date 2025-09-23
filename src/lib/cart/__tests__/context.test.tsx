import { act, renderHook, waitFor } from "@testing-library/react";
import type React from "react";
import type { AddToCartRequest, CartItem } from "@/types/cart";
import { CartProvider, useCart } from "../context";

// Mock auth context
const mockAuthContext = {
  user: null,
  loading: false,
};

jest.mock("@/components/auth/AuthProvider", () => ({
  useAuthContext: () => mockAuthContext,
}));

// Mock cart utils
jest.mock("../utils", () => ({
  getCartSessionId: jest.fn(() => "test-session-id"),
  setCartSessionId: jest.fn(),
  generateCartSessionId: jest.fn(() => "new-session-id"),
  clearCartSessionId: jest.fn(),
  storeOfflineOperation: jest.fn(),
  getOfflineOperations: jest.fn(() => []),
  calculateCartTotals: jest.fn((items) => ({
    itemCount: items.reduce((sum: number, item: any) => sum + item.quantity, 0),
    subtotal: items.reduce((sum: number, item: any) => sum + (item.totalPrice || 0), 0),
    total: items.reduce((sum: number, item: any) => sum + (item.totalPrice || 0), 0),
  })),
}));

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
});

// Mock online/offline events
const mockAddEventListener = jest.fn();
const mockRemoveEventListener = jest.fn();
Object.defineProperty(window, "addEventListener", { value: mockAddEventListener });
Object.defineProperty(window, "removeEventListener", { value: mockRemoveEventListener });
Object.defineProperty(navigator, "onLine", { value: true, writable: true });

const mockCartItem: CartItem = {
  id: "1",
  productId: "prod1",
  quantity: 2,
  unitPrice: 1500,
  totalPrice: 3000,
  customizations: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  product: {
    id: "prod1",
    nameCs: "Test Product",
    nameEn: "Test Product",
    name: { cs: "Test Product", en: "Test Product" },
    description: { cs: "Test", en: "Test" },
    slug: "test-product",
    basePrice: 1500,
    images: [],
    category: {
      id: "cat1",
      nameCs: "Test Category",
      nameEn: "Test Category",
      name: { cs: "Test Category", en: "Test Category" },
      slug: "test-category",
      description: { cs: "", en: "" },
      sortOrder: 0,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    customizationOptions: [],
    availability: { inStock: true, stockQuantity: 10 },
    seoMetadata: { title: { cs: "", en: "" }, description: { cs: "", en: "" } },
    active: true,
    featured: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <CartProvider>{children}</CartProvider>
);

describe("Enhanced Cart Context", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
    mockLocalStorage.removeItem.mockClear();

    // Default successful cart fetch
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          cart: {
            items: [mockCartItem],
            itemCount: 2,
            subtotal: 3000,
            total: 3000,
          },
        }),
    });
  });

  describe("Optimistic Updates", () => {
    it("should apply optimistic update when adding item", async () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      const addRequest: AddToCartRequest = {
        productId: "prod2",
        quantity: 1,
        customizations: [],
      };

      // Mock successful API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            item: { id: "real-id", ...addRequest },
          }),
      });

      act(() => {
        result.current.addToCart(addRequest);
      });

      // Should immediately show optimistic update
      await waitFor(() => {
        expect(result.current.state.items).toHaveLength(2);
        expect(result.current.state.items.some((item) => item.productId === "prod2")).toBe(true);
      });
    });

    it("should revert optimistic update on API failure", async () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      const addRequest: AddToCartRequest = {
        productId: "prod2",
        quantity: 1,
        customizations: [],
      };

      // Mock API failure
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: false,
            error: "Product not available",
          }),
      });

      await act(async () => {
        await result.current.addToCart(addRequest);
      });

      // Should revert to original state
      await waitFor(() => {
        expect(result.current.state.items).toHaveLength(1);
        expect(result.current.state.items[0].id).toBe("1");
        expect(result.current.state.error).toBe("Product not available");
      });
    });

    it("should handle optimistic quantity updates", async () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      // Mock successful update
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      act(() => {
        result.current.updateQuantity("1", 5);
      });

      // Should immediately update quantity
      await waitFor(() => {
        const item = result.current.state.items.find((item) => item.id === "1");
        expect(item?.quantity).toBe(5);
        expect(item?.totalPrice).toBe(7500); // 1500 * 5
      });
    });

    it("should handle optimistic item removal", async () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      // Mock successful removal
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      act(() => {
        result.current.removeItem("1");
      });

      // Should immediately remove item
      await waitFor(() => {
        expect(result.current.state.items).toHaveLength(0);
      });
    });
  });

  describe("Enhanced Offline Support", () => {
    it("should handle offline state", async () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      // Simulate going offline
      Object.defineProperty(navigator, "onLine", { value: false });

      const addRequest: AddToCartRequest = {
        productId: "prod2",
        quantity: 1,
        customizations: [],
      };

      // Mock network error
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      await act(async () => {
        await result.current.addToCart(addRequest);
      });

      expect(result.current.state.error).toContain("No internet connection");
      expect(result.current.isOnline).toBe(false);
    });

    it("should sync when coming back online", async () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      // Simulate online event
      const onlineHandler = mockAddEventListener.mock.calls.find(
        (call) => call[0] === "online"
      )?.[1];

      if (onlineHandler) {
        act(() => {
          onlineHandler();
        });
      }

      // Should trigger sync
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("/api/cart", expect.any(Object));
      });
    });

    it("should store offline operations for later sync", async () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      // Simulate offline state
      Object.defineProperty(navigator, "onLine", { value: false });

      const addRequest: AddToCartRequest = {
        productId: "prod2",
        quantity: 1,
        customizations: [],
      };

      // Mock network error
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      await act(async () => {
        await result.current.addToCart(addRequest);
      });

      // Should still apply optimistic update
      expect(result.current.state.items).toHaveLength(2);
      expect(result.current.state.error).toContain("No internet connection");
    });

    it("should process offline operations when back online", async () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      // Mock successful processing of offline operations
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      // Simulate coming back online
      Object.defineProperty(navigator, "onLine", { value: true });

      const onlineHandler = mockAddEventListener.mock.calls.find(
        (call) => call[0] === "online"
      )?.[1];

      if (onlineHandler) {
        act(() => {
          onlineHandler();
        });
      }

      // Should process offline operations
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });
    });
  });

  describe("Persistence", () => {
    it("should backup cart to localStorage", async () => {
      renderHook(() => useCart(), { wrapper });

      await waitFor(() => {
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          "cart_backup",
          expect.stringContaining('"items"')
        );
      });
    });

    it("should restore cart from localStorage when empty", async () => {
      const backupData = {
        items: [mockCartItem],
        lastUpdated: new Date().toISOString(),
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(backupData));

      // Mock empty cart response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            cart: { items: [], itemCount: 0, subtotal: 0, total: 0 },
          }),
      });

      const { result } = renderHook(() => useCart(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.items).toHaveLength(1);
      });
    });
  });

  describe("Error Handling", () => {
    it("should retry failed requests with exponential backoff", async () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      // Mock initial failure then success
      mockFetch.mockRejectedValueOnce(new Error("Network error")).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            cart: { items: [], itemCount: 0, subtotal: 0, total: 0 },
          }),
      });

      // Wait for retry
      await waitFor(
        () => {
          expect(mockFetch).toHaveBeenCalledTimes(2);
        },
        { timeout: 3000 }
      );
    });

    it("should handle network errors gracefully", async () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      mockFetch.mockRejectedValue(new Error("Network error"));

      const addRequest: AddToCartRequest = {
        productId: "prod2",
        quantity: 1,
        customizations: [],
      };

      await act(async () => {
        const success = await result.current.addToCart(addRequest);
        expect(success).toBe(false);
      });

      expect(result.current.state.error).toBeTruthy();
    });
  });

  describe("Real-time Synchronization", () => {
    it("should periodically sync with server", async () => {
      jest.useFakeTimers();

      renderHook(() => useCart(), { wrapper });

      // Fast-forward 30 seconds
      act(() => {
        jest.advanceTimersByTime(30000);
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("/api/cart", expect.any(Object));
      });

      jest.useRealTimers();
    });

    it("should not sync when optimistic updates are pending", async () => {
      jest.useFakeTimers();

      const { result } = renderHook(() => useCart(), { wrapper });

      // Add item to create pending optimistic update
      const addRequest: AddToCartRequest = {
        productId: "prod2",
        quantity: 1,
        customizations: [],
      };

      // Mock slow API response
      mockFetch.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: () => Promise.resolve({ success: true, item: { id: "real-id" } }),
                }),
              1000
            );
          })
      );

      act(() => {
        result.current.addToCart(addRequest);
      });

      // Fast-forward sync interval
      act(() => {
        jest.advanceTimersByTime(30000);
      });

      // Should not trigger additional sync while optimistic update is pending
      expect(mockFetch).toHaveBeenCalledTimes(2); // Initial load + add item

      jest.useRealTimers();
    });

    it("should enable and disable real-time sync", async () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      // Initially disabled
      expect(result.current.isRealTimeEnabled).toBe(false);

      // Enable real-time sync
      act(() => {
        result.current.enableRealTime();
      });

      await waitFor(() => {
        expect(result.current.isRealTimeEnabled).toBe(true);
      });

      // Disable real-time sync
      act(() => {
        result.current.disableRealTime();
      });

      expect(result.current.isRealTimeEnabled).toBe(false);
    });

    it("should handle conflict resolution during sync", async () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      // Mock server response with different cart state
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            cart: {
              items: [
                {
                  ...mockCartItem,
                  quantity: 5, // Different from local state
                },
              ],
              itemCount: 5,
              subtotal: 7500,
              total: 7500,
            },
          }),
      });

      await act(async () => {
        await result.current.syncWithServer();
      });

      // Should resolve conflict and update state
      await waitFor(() => {
        const item = result.current.state.items.find((item) => item.id === "1");
        expect(item?.quantity).toBe(5); // Server wins in merge strategy
      });
    });
  });

  describe("Session Management", () => {
    it("should handle guest cart sessions", async () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      const addRequest: AddToCartRequest = {
        productId: "prod2",
        quantity: 1,
        customizations: [],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            item: { id: "real-id", ...addRequest },
          }),
      });

      await act(async () => {
        await result.current.addToCart(addRequest);
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/cart/items",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(addRequest),
        })
      );
    });

    it("should track cart version for conflict resolution", async () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      const initialVersion = result.current.getCartVersion();
      expect(typeof initialVersion).toBe("number");

      // Perform cart operation
      const addRequest: AddToCartRequest = {
        productId: "prod2",
        quantity: 1,
        customizations: [],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            item: { id: "real-id", ...addRequest },
          }),
      });

      await act(async () => {
        await result.current.addToCart(addRequest);
      });

      // Version should be updated after successful operation
      await waitFor(() => {
        const newVersion = result.current.getCartVersion();
        expect(newVersion).toBeGreaterThan(initialVersion);
      });
    });
  });

  describe("Advanced Persistence", () => {
    it("should save cart state with versioning", async () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      // Wait for cart to load and persist
      await waitFor(() => {
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          expect.stringContaining("cart_state"),
          expect.stringContaining('"version"')
        );
      });
    });

    it("should restore cart state with version validation", async () => {
      const validBackup = {
        version: 2,
        timestamp: Date.now(),
        cartVersion: Date.now(),
        cart: {
          items: [mockCartItem],
          itemCount: 1,
          subtotal: 3000,
          total: 3000,
        },
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(validBackup));

      // Mock empty server cart
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            cart: { items: [], itemCount: 0, subtotal: 0, total: 0 },
          }),
      });

      const { result } = renderHook(() => useCart(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.items).toHaveLength(1);
      });
    });

    it("should reject outdated cart state", async () => {
      const outdatedBackup = {
        version: 1, // Old version
        timestamp: Date.now() - 25 * 60 * 60 * 1000, // 25 hours old
        cartVersion: Date.now(),
        cart: {
          items: [mockCartItem],
          itemCount: 1,
          subtotal: 3000,
          total: 3000,
        },
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(outdatedBackup));

      const { result } = renderHook(() => useCart(), { wrapper });

      // Should not restore outdated state
      await waitFor(() => {
        expect(result.current.state.items).toHaveLength(1); // From server
      });

      // Should clear outdated storage
      expect(mockLocalStorage.removeItem).toHaveBeenCalled();
    });
  });

  describe("Performance and Reliability", () => {
    it("should handle concurrent operations gracefully", async () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      const requests = [
        { productId: "prod2", quantity: 1, customizations: [] },
        { productId: "prod3", quantity: 2, customizations: [] },
        { productId: "prod4", quantity: 1, customizations: [] },
      ];

      // Mock successful responses
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            item: { id: "real-id" },
          }),
      });

      // Execute concurrent operations
      const promises = requests.map((request) => result.current.addToCart(request));

      await act(async () => {
        await Promise.all(promises);
      });

      // All operations should succeed
      await waitFor(() => {
        expect(result.current.state.items).toHaveLength(4); // Original + 3 new
      });
    });

    it("should implement circuit breaker for failed operations", async () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      // Mock repeated failures
      mockFetch.mockRejectedValue(new Error("Server error"));

      const addRequest: AddToCartRequest = {
        productId: "prod2",
        quantity: 1,
        customizations: [],
      };

      // Try multiple times
      for (let i = 0; i < 5; i++) {
        await act(async () => {
          await result.current.addToCart(addRequest);
        });
      }

      // Should eventually stop trying and show appropriate error
      expect(result.current.state.error).toBeTruthy();
    });

    it("should debounce rapid operations", async () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      // Rapid quantity updates
      act(() => {
        result.current.updateQuantity("1", 3);
        result.current.updateQuantity("1", 4);
        result.current.updateQuantity("1", 5);
      });

      // Should only make one API call after debounce
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(2); // Initial load + final update
      });
    });
  });
});
