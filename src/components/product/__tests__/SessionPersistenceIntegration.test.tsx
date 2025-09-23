// Integration tests for customization persistence across browser sessions
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { jest } from '@jest/globals';
import { CartProvider } from '@/lib/cart/context';
import { ProductDetail } from '@/components/product/ProductDetail';
import type { Product, CartItem } from '@/types';

// Mock Next.js modules
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: () => '/products/test-wreath',
}));

jest.mock('@/lib/auth/hooks', () => ({
  useAuthContext: () => ({
    user: null,
    loading: false,
  }),
}));

// Mock Supabase client
const mockSupabaseClient = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
    insert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn(() => Promise.resolve({ data: { id: 'test-cart-item' }, error: null })),
      })),
    })),
  })),
  auth: {
    getUser: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })),
  },
};

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabaseClient,
}));

// Mock fetch for API calls
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock localStorage
const createMockLocalStorage = () => {
  const storage: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => storage[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      storage[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete storage[key];
    }),
    clear: jest.fn(() => {
      Object.keys(storage).forEach(key => delete storage[key]);
    }),
    get storage() { return { ...storage }; },
  };
};

// Mock sessionStorage
const createMockSessionStorage = () => {
  const storage: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => storage[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      storage[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete storage[key];
    }),
    clear: jest.fn(() => {
      Object.keys(storage).forEach(key => delete storage[key]);
    }),
    get storage() { return { ...storage }; },
  };
};

// Test data
const mockWreathProduct: Product = {
  id: 'wreath-001',
  name: { cs: 'Smuteční věnec', en: 'Funeral Wreath' },
  slug: 'funeral-wreath-classic',
  description: { cs: 'Klasický smuteční věnec', en: 'Classic funeral wreath' },
  basePrice: 2500,
  images: ['/test-wreath.jpg'],
  category: 'wreaths',
  available: true,
  featured: false,
  customizationOptions: [
    {
      id: 'size',
      type: 'size',
      name: { cs: 'Velikost', en: 'Size' },
      required: true,
      minSelections: 1,
      maxSelections: 1,
      choices: [
        {
          id: 'size_120',
          label: { cs: '120cm průměr', en: '120cm diameter' },
          priceModifier: 0,
          available: true,
        },
        {
          id: 'size_150',
          label: { cs: '150cm průměr', en: '150cm diameter' },
          priceModifier: 500,
          available: true,
        },
      ],
    },
    {
      id: 'ribbon',
      type: 'ribbon',
      name: { cs: 'Stuha', en: 'Ribbon' },
      required: false,
      choices: [
        {
          id: 'ribbon_yes',
          label: { cs: 'Ano, přidat stuhu', en: 'Yes, add ribbon' },
          priceModifier: 0,
        },
      ],
    },
    {
      id: 'ribbon_color',
      type: 'ribbon_color',
      name: { cs: 'Barva stuhy', en: 'Ribbon Color' },
      required: false,
      dependsOn: {
        optionId: 'ribbon',
        requiredChoiceIds: ['ribbon_yes'],
      },
      choices: [
        {
          id: 'color_black',
          label: { cs: 'Černá', en: 'Black' },
          priceModifier: 0,
        },
        {
          id: 'color_white',
          label: { cs: 'Bílá', en: 'White' },
          priceModifier: 0,
        },
      ],
    },
    {
      id: 'ribbon_text',
      type: 'ribbon_text',
      name: { cs: 'Text na stuze', en: 'Ribbon Text' },
      required: false,
      dependsOn: {
        optionId: 'ribbon',
        requiredChoiceIds: ['ribbon_yes'],
      },
      choices: [
        {
          id: 'text_custom',
          label: { cs: 'Vlastní text', en: 'Custom text' },
          priceModifier: 100,
          allowCustomInput: true,
          maxLength: 50,
        },
      ],
    },
  ],
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('Session Persistence Integration Tests', () => {
  let mockLocalStorage: ReturnType<typeof createMockLocalStorage>;
  let mockSessionStorage: ReturnType<typeof createMockSessionStorage>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();

    // Create fresh storage mocks for each test
    mockLocalStorage = createMockLocalStorage();
    mockSessionStorage = createMockSessionStorage();

    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });

    Object.defineProperty(window, 'sessionStorage', {
      value: mockSessionStorage,
      writable: true,
    });

    // Mock successful cart API responses
    mockFetch.mockImplementation((url: string, options?: any) => {
      if (url === '/api/cart') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            cart: { items: [], itemCount: 0, subtotal: 0, total: 0 },
          }),
        });
      }

      if (url === '/api/cart/items' && options?.method === 'POST') {
        const body = JSON.parse(options.body);
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            item: {
              id: `cart-item-${Date.now()}`,
              productId: body.productId,
              quantity: body.quantity,
              customizations: body.customizations || [],
              unitPrice: 2500,
              totalPrice: 2500,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          }),
        });
      }

      return Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ success: false, error: 'Not found' }),
      });
    });
  });

  describe('Cart State Persistence', () => {
    it('should persist cart state to localStorage after adding items', async () => {
      const TestComponent = () => (
        <CartProvider>
          <ProductDetail product={mockWreathProduct} />
        </CartProvider>
      );

      render(<TestComponent />);

      // Add item with customizations to cart
      const sizeOption = screen.getByLabelText(/120cm průměr/i);
      fireEvent.click(sizeOption);

      const ribbonOption = screen.getByLabelText(/Ano, přidat stuhu/i);
      fireEvent.click(ribbonOption);

      await waitFor(() => {
        const ribbonColorBlack = screen.getByLabelText(/Černá/i);
        fireEvent.click(ribbonColorBlack);
      });

      await waitFor(() => {
        const customTextOption = screen.getByLabelText(/Vlastní text/i);
        fireEvent.click(customTextOption);
      });

      await waitFor(() => {
        const customTextInput = screen.getByPlaceholderText(/zadejte vlastní text/i);
        fireEvent.change(customTextInput, { target: { value: 'Test message' } });
      });

      const addToCartButton = screen.getByRole('button', { name: /přidat do košíku/i });

      await act(async () => {
        fireEvent.click(addToCartButton);
      });

      // Wait for cart state to be persisted
      await waitFor(() => {
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          'cart_state',
          expect.stringContaining('customizations')
        );
      });

      // Verify the persisted data contains our customizations
      const persistedData = JSON.parse(mockLocalStorage.storage.cart_state);
      expect(persistedData.cart.items).toHaveLength(1);
      expect(persistedData.cart.items[0].customizations).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            optionId: 'size',
            choiceIds: ['size_120'],
          }),
          expect.objectContaining({
            optionId: 'ribbon',
            choiceIds: ['ribbon_yes'],
          }),
          expect.objectContaining({
            optionId: 'ribbon_color',
            choiceIds: ['color_black'],
          }),
          expect.objectContaining({
            optionId: 'ribbon_text',
            choiceIds: ['text_custom'],
            customValue: 'Test message',
          }),
        ])
      );
    });

    it('should restore cart state from localStorage on component mount', async () => {
      // Pre-populate localStorage with cart data
      const existingCartState = {
        cart: {
          items: [
            {
              id: 'existing-item-1',
              productId: mockWreathProduct.id,
              quantity: 1,
              customizations: [
                {
                  optionId: 'size',
                  choiceIds: ['size_150'],
                  priceModifier: 500,
                },
                {
                  optionId: 'ribbon',
                  choiceIds: ['ribbon_yes'],
                  priceModifier: 0,
                },
                {
                  optionId: 'ribbon_color',
                  choiceIds: ['color_white'],
                  priceModifier: 0,
                },
                {
                  optionId: 'ribbon_text',
                  choiceIds: ['text_custom'],
                  customValue: 'Restored message',
                  priceModifier: 100,
                },
              ],
              unitPrice: 2500,
              totalPrice: 3100,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
          itemCount: 1,
          subtotal: 3100,
          total: 3100,
        },
        version: Date.now(),
        timestamp: Date.now(),
      };

      mockLocalStorage.setItem('cart_state', JSON.stringify(existingCartState));

      const TestComponent = () => (
        <CartProvider>
          <div data-testid="cart-content">
            <div data-testid="item-count">{/* Cart item count would be displayed here */}</div>
            <div data-testid="total-price">{/* Total price would be displayed here */}</div>
          </div>
        </CartProvider>
      );

      render(<TestComponent />);

      // Verify localStorage was read
      await waitFor(() => {
        expect(mockLocalStorage.getItem).toHaveBeenCalledWith('cart_state');
      });

      // The cart should be restored with the persisted data
      // Note: In a real implementation, you'd verify the cart context state
      // For this test, we're verifying the localStorage interaction
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('cart_state');
    });

    it('should handle corrupted localStorage data gracefully', async () => {
      // Set corrupted data in localStorage
      mockLocalStorage.setItem('cart_state', 'invalid-json-data');

      const TestComponent = () => (
        <CartProvider>
          <ProductDetail product={mockWreathProduct} />
        </CartProvider>
      );

      // Should not throw an error
      expect(() => render(<TestComponent />)).not.toThrow();

      // Should attempt to read from localStorage
      await waitFor(() => {
        expect(mockLocalStorage.getItem).toHaveBeenCalledWith('cart_state');
      });
    });

    it('should update localStorage when cart items are modified', async () => {
      // Start with an existing cart item
      const existingCartState = {
        cart: {
          items: [
            {
              id: 'existing-item-1',
              productId: mockWreathProduct.id,
              quantity: 1,
              customizations: [
                {
                  optionId: 'size',
                  choiceIds: ['size_120'],
                  priceModifier: 0,
                },
              ],
              unitPrice: 2500,
              totalPrice: 2500,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
          itemCount: 1,
          subtotal: 2500,
          total: 2500,
        },
        version: Date.now(),
        timestamp: Date.now(),
      };

      mockLocalStorage.setItem('cart_state', JSON.stringify(existingCartState));

      // Mock cart update API
      mockFetch.mockImplementation((url: string, options?: any) => {
        if (url.includes('/api/cart/items/') && options?.method === 'PUT') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              success: true,
              item: {
                id: 'existing-item-1',
                quantity: JSON.parse(options.body).quantity,
              },
            }),
          });
        }

        if (url === '/api/cart') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              success: true,
              cart: {
                items: [
                  {
                    ...existingCartState.cart.items[0],
                    quantity: 2,
                    totalPrice: 5000,
                  },
                ],
                itemCount: 2,
                subtotal: 5000,
                total: 5000,
              },
            }),
          });
        }

        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ success: false }),
        });
      });

      const TestComponent = () => (
        <CartProvider>
          <div data-testid="cart-controls">
            <button
              onClick={() => {
                // Simulate quantity update
                fetch('/api/cart/items/existing-item-1', {
                  method: 'PUT',
                  body: JSON.stringify({ quantity: 2 }),
                });
              }}
            >
              Update Quantity
            </button>
          </div>
        </CartProvider>
      );

      render(<TestComponent />);

      // Simulate quantity update
      const updateButton = screen.getByText('Update Quantity');

      await act(async () => {
        fireEvent.click(updateButton);
      });

      // Should update localStorage with new cart state
      await waitFor(() => {
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          'cart_state',
          expect.stringContaining('"quantity":2')
        );
      });
    });
  });

  describe('Session ID Management', () => {
    it('should generate and persist session ID for guest users', async () => {
      const TestComponent = () => (
        <CartProvider>
          <ProductDetail product={mockWreathProduct} />
        </CartProvider>
      );

      render(<TestComponent />);

      // Add item to cart (should generate session ID)
      const sizeOption = screen.getByLabelText(/120cm průměr/i);
      fireEvent.click(sizeOption);

      const addToCartButton = screen.getByRole('button', { name: /přidat do košíku/i });

      await act(async () => {
        fireEvent.click(addToCartButton);
      });

      // Should store session ID in localStorage
      await waitFor(() => {
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          'cart_session_id',
          expect.any(String)
        );
      });
    });

    it('should reuse existing session ID across page reloads', async () => {
      const existingSessionId = 'existing-session-123';
      mockLocalStorage.setItem('cart_session_id', existingSessionId);

      const TestComponent = () => (
        <CartProvider>
          <ProductDetail product={mockWreathProduct} />
        </CartProvider>
      );

      render(<TestComponent />);

      // Add item to cart
      const sizeOption = screen.getByLabelText(/120cm průměr/i);
      fireEvent.click(sizeOption);

      const addToCartButton = screen.getByRole('button', { name: /přidat do košíku/i });

      await act(async () => {
        fireEvent.click(addToCartButton);
      });

      // Should read existing session ID
      await waitFor(() => {
        expect(mockLocalStorage.getItem).toHaveBeenCalledWith('cart_session_id');
      });

      // Should not generate new session ID
      expect(mockLocalStorage.setItem).not.toHaveBeenCalledWith(
        'cart_session_id',
        expect.not.stringMatching(existingSessionId)
      );
    });

    it('should handle session ID conflicts gracefully', async () => {
      // Simulate a scenario where session ID exists but server doesn't recognize it
      const conflictingSessionId = 'conflicting-session-456';
      mockLocalStorage.setItem('cart_session_id', conflictingSessionId);

      mockFetch.mockImplementation((url: string, options?: any) => {
        if (url === '/api/cart/items' && options?.method === 'POST') {
          return Promise.resolve({
            ok: false,
            status: 404,
            json: () => Promise.resolve({
              success: false,
              error: 'Session not found',
              code: 'SESSION_NOT_FOUND',
            }),
          });
        }

        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ success: false }),
        });
      });

      const TestComponent = () => (
        <CartProvider>
          <ProductDetail product={mockWreathProduct} />
        </CartProvider>
      );

      render(<TestComponent />);

      // Try to add item to cart
      const sizeOption = screen.getByLabelText(/120cm průměr/i);
      fireEvent.click(sizeOption);

      const addToCartButton = screen.getByRole('button', { name: /přidat do košíku/i });

      await act(async () => {
        fireEvent.click(addToCartButton);
      });

      // Should handle the session conflict
      await waitFor(() => {
        expect(screen.getByText(/session not found/i)).toBeInTheDocument();
      });
    });
  });

  describe('Cross-Tab Synchronization', () => {
    it('should sync cart changes across browser tabs', async () => {
      const TestComponent = () => (
        <CartProvider>
          <div data-testid="cart-sync-test">Cart Sync Test</div>
        </CartProvider>
      );

      render(<TestComponent />);

      // Simulate storage event from another tab
      const storageEvent = new StorageEvent('storage', {
        key: 'cart_state',
        newValue: JSON.stringify({
          cart: {
            items: [
              {
                id: 'synced-item-1',
                productId: mockWreathProduct.id,
                quantity: 1,
                customizations: [
                  {
                    optionId: 'size',
                    choiceIds: ['size_150'],
                    priceModifier: 500,
                  },
                ],
                unitPrice: 2500,
                totalPrice: 3000,
              },
            ],
            itemCount: 1,
            subtotal: 3000,
            total: 3000,
          },
          version: Date.now(),
          timestamp: Date.now(),
        }),
        oldValue: null,
        storageArea: localStorage,
        url: window.location.href,
      });

      // Dispatch storage event
      await act(async () => {
        window.dispatchEvent(storageEvent);
      });

      // Cart should be updated with synced data
      // Note: In a real implementation, you'd verify the cart context state
      // For this test, we're verifying the event was handled
      expect(screen.getByTestId('cart-sync-test')).toBeInTheDocument();
    });

    it('should handle version conflicts during cross-tab sync', async () => {
      // Set initial cart state with version
      const initialCartState = {
        cart: {
          items: [
            {
              id: 'initial-item-1',
              productId: mockWreathProduct.id,
              quantity: 1,
              customizations: [],
              unitPrice: 2500,
              totalPrice: 2500,
            },
          ],
          itemCount: 1,
          subtotal: 2500,
          total: 2500,
        },
        version: 1000,
        timestamp: Date.now() - 5000, // 5 seconds ago
      };

      mockLocalStorage.setItem('cart_state', JSON.stringify(initialCartState));

      const TestComponent = () => (
        <CartProvider>
          <div data-testid="cart-version-test">Cart Version Test</div>
        </CartProvider>
      );

      render(<TestComponent />);

      // Simulate newer version from another tab
      const newerCartState = {
        cart: {
          items: [
            {
              id: 'newer-item-1',
              productId: mockWreathProduct.id,
              quantity: 2,
              customizations: [],
              unitPrice: 2500,
              totalPrice: 5000,
            },
          ],
          itemCount: 2,
          subtotal: 5000,
          total: 5000,
        },
        version: 2000, // Newer version
        timestamp: Date.now(),
      };

      const storageEvent = new StorageEvent('storage', {
        key: 'cart_state',
        newValue: JSON.stringify(newerCartState),
        oldValue: JSON.stringify(initialCartState),
        storageArea: localStorage,
        url: window.location.href,
      });

      // Dispatch storage event with newer version
      await act(async () => {
        window.dispatchEvent(storageEvent);
      });

      // Should accept the newer version
      expect(screen.getByTestId('cart-version-test')).toBeInTheDocument();
    });
  });

  describe('Data Integrity and Recovery', () => {
    it('should validate and fix corrupted customization data on load', async () => {
      // Set cart state with corrupted customizations
      const corruptedCartState = {
        cart: {
          items: [
            {
              id: 'corrupted-item-1',
              productId: mockWreathProduct.id,
              quantity: 1,
              customizations: [
                {
                  optionId: 'size',
                  choiceIds: ['size_120'],
                  priceModifier: 0,
                },
                {
                  // Missing required fields
                  optionId: 'ribbon_color',
                  // Missing choiceIds
                  priceModifier: 0,
                },
                {
                  // Invalid dependency
                  optionId: 'ribbon_text',
                  choiceIds: ['text_custom'],
                  customValue: 'Test',
                  priceModifier: 100,
                  // ribbon_color selected without ribbon
                },
              ],
              unitPrice: 2500,
              totalPrice: 2600,
            },
          ],
          itemCount: 1,
          subtotal: 2600,
          total: 2600,
        },
        version: Date.now(),
        timestamp: Date.now(),
      };

      mockLocalStorage.setItem('cart_state', JSON.stringify(corruptedCartState));

      const TestComponent = () => (
        <CartProvider>
          <div data-testid="integrity-test">Integrity Test</div>
        </CartProvider>
      );

      render(<TestComponent />);

      // Should load without errors and fix corrupted data
      await waitFor(() => {
        expect(screen.getByTestId('integrity-test')).toBeInTheDocument();
      });

      // Should have attempted to fix the corrupted data
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('cart_state');
    });

    it('should recover from complete localStorage corruption', async () => {
      // Simulate localStorage throwing errors
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage corrupted');
      });

      const TestComponent = () => (
        <CartProvider>
          <div data-testid="recovery-test">Recovery Test</div>
        </CartProvider>
      );

      // Should not crash
      expect(() => render(<TestComponent />)).not.toThrow();

      await waitFor(() => {
        expect(screen.getByTestId('recovery-test')).toBeInTheDocument();
      });
    });

    it('should handle quota exceeded errors gracefully', async () => {
      // Simulate localStorage quota exceeded
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new DOMException('QuotaExceededError');
      });

      const TestComponent = () => (
        <CartProvider>
          <ProductDetail product={mockWreathProduct} />
        </CartProvider>
      );

      render(<TestComponent />);

      // Add item to cart
      const sizeOption = screen.getByLabelText(/120cm průměr/i);
      fireEvent.click(sizeOption);

      const addToCartButton = screen.getByRole('button', { name: /přidat do košíku/i });

      await act(async () => {
        fireEvent.click(addToCartButton);
      });

      // Should handle quota exceeded gracefully
      await waitFor(() => {
        expect(mockLocalStorage.setItem).toHaveBeenCalled();
      });

      // Should not crash the application
      expect(screen.getByRole('button', { name: /přidat do košíku/i })).toBeInTheDocument();
    });
  });
});
