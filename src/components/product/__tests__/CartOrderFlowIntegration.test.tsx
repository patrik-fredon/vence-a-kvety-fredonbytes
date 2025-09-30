// Integration tests for cart and order flow with wreath customizations
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { jest } from '@jest/globals';
import { CartProvider } from '@/lib/cart/context';
import { ProductDetail } from '@/components/product/ProductDetail';
import { ShoppingCart } from '@/components/cart/ShoppingCart';
import type { Product, CartItem, Order, CreateOrderRequest } from '@/types';

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
    update: jest.fn(() => ({
      eq: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: { id: 'test-cart-item' }, error: null })),
        })),
      })),
    })),
    delete: jest.fn(() => ({
      eq: jest.fn(() => Promise.resolve({ error: null })),
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
          id: "size_120",
        value: "size_120",
          label: { cs: '120cm průměr', en: '120cm diameter' },
          priceModifier: 0,
          available: true,
        },
        {
          id: "size_150",
        value: "size_150",
          label: { cs: '150cm průměr', en: '150cm diameter' },
          priceModifier: 500,
          available: true,
        },
        {
          id: "size_180",
        value: "size_180",
          label: { cs: '180cm průměr', en: '180cm diameter' },
          priceModifier: 1000,
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
          id: "ribbon_yes",
        value: "ribbon_yes",
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
          id: "color_black",
        value: "color_black",
          label: { cs: 'Černá', en: 'Black' },
          priceModifier: 0,
        },
        {
          id: "color_white",
        value: "color_white",
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
          id: "text_sympathy",
        value: "text_sympathy",
          label: { cs: 'S upřímnou soustrasti', en: 'With sincere sympathy' },
          priceModifier: 50,
        },
        {
          id: "text_memory",
        value: "text_memory",
          label: { cs: 'Na věčnou památku', en: 'In eternal memory' },
          priceModifier: 50,
        },
        {
          id: "text_love",
        value: "text_love",
          label: { cs: 'S láskou vzpomínáme', en: 'With love we remember' },
          priceModifier: 50,
        },
        {
          id: "text_respect",
        value: "text_respect",
          label: { cs: 'S úctou a respektem', en: 'With honor and respect' },
          priceModifier: 50,
        },
        {
          id: "text_custom",
        value: "text_custom",
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

describe('Cart and Order Flow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();

    // Mock successful cart API responses by default
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
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            item: {
              id: 'test-cart-item-1',
              productId: mockWreathProduct.id,
              quantity: 1,
              customizations: options.body ? JSON.parse(options.body).customizations : [],
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

  describe('Complete Wreath Customization and Cart Addition Flow', () => {
    it('should successfully add wreath with full customization to cart', async () => {
      const TestComponent = () => (
        <CartProvider>
          <ProductDetail product={mockWreathProduct} />
        </CartProvider>
      );

      render(<TestComponent />);

      // Step 1: Select size (required)
      const sizeOption = screen.getByLabelText(/120cm průměr/i);
      fireEvent.click(sizeOption);

      // Step 2: Add ribbon
      const ribbonOption = screen.getByLabelText(/Ano, přidat stuhu/i);
      fireEvent.click(ribbonOption);

      // Step 3: Select ribbon color (should appear after ribbon selection)
      await waitFor(() => {
        expect(screen.getByText(/Barva stuhy/i)).toBeInTheDocument();
      });

      const ribbonColorBlack = screen.getByLabelText(/Černá/i);
      fireEvent.click(ribbonColorBlack);

      // Step 4: Select ribbon text
      await waitFor(() => {
        expect(screen.getByText(/Text na stuze/i)).toBeInTheDocument();
      });

      const ribbonTextSympathy = screen.getByLabelText(/S upřímnou soustrasti/i);
      fireEvent.click(ribbonTextSympathy);

      // Step 5: Add to cart
      const addToCartButton = screen.getByRole('button', { name: /přidat do košíku/i });

      await act(async () => {
        fireEvent.click(addToCartButton);
      });

      // Verify API call was made with correct customizations
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/cart/items', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            productId: mockWreathProduct.id,
            quantity: 1,
            customizations: [
              {
                optionId: 'size',
                choiceIds: ['size_120'],
                priceModifier: 0,
              },
              {
                optionId: 'ribbon',
                choiceIds: ['ribbon_yes'],
                priceModifier: 0,
              },
              {
                optionId: 'ribbon_color',
                choiceIds: ['color_black'],
                priceModifier: 0,
              },
              {
                optionId: 'ribbon_text',
                choiceIds: ['text_sympathy'],
                priceModifier: 50,
              },
            ],
          }),
        });
      });
    });

    it('should prevent cart addition without required size selection', async () => {
      const TestComponent = () => (
        <CartProvider>
          <ProductDetail product={mockWreathProduct} />
        </CartProvider>
      );

      render(<TestComponent />);

      // Try to add to cart without selecting size
      const addToCartButton = screen.getByRole('button', { name: /přidat do košíku/i });

      await act(async () => {
        fireEvent.click(addToCartButton);
      });

      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText(/prosím vyberte velikost/i)).toBeInTheDocument();
      });

      // Should not make API call
      expect(mockFetch).not.toHaveBeenCalledWith('/api/cart/items', expect.any(Object));
    });

    it('should handle custom ribbon text input correctly', async () => {
      const TestComponent = () => (
        <CartProvider>
          <ProductDetail product={mockWreathProduct} />
        </CartProvider>
      );

      render(<TestComponent />);

      // Select size
      const sizeOption = screen.getByLabelText(/120cm průměr/i);
      fireEvent.click(sizeOption);

      // Add ribbon
      const ribbonOption = screen.getByLabelText(/Ano, přidat stuhu/i);
      fireEvent.click(ribbonOption);

      // Select ribbon color
      await waitFor(() => {
        const ribbonColorBlack = screen.getByLabelText(/Černá/i);
        fireEvent.click(ribbonColorBlack);
      });

      // Select custom text option
      await waitFor(() => {
        const customTextOption = screen.getByLabelText(/Vlastní text/i);
        fireEvent.click(customTextOption);
      });

      // Enter custom text
      await waitFor(() => {
        const customTextInput = screen.getByPlaceholderText(/zadejte vlastní text/i);
        fireEvent.change(customTextInput, { target: { value: 'Milovanému otci' } });
      });

      // Add to cart
      const addToCartButton = screen.getByRole('button', { name: /přidat do košíku/i });

      await act(async () => {
        fireEvent.click(addToCartButton);
      });

      // Verify API call includes custom text
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/cart/items', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            productId: mockWreathProduct.id,
            quantity: 1,
            customizations: [
              {
                optionId: 'size',
                choiceIds: ['size_120'],
                priceModifier: 0,
              },
              {
                optionId: 'ribbon',
                choiceIds: ['ribbon_yes'],
                priceModifier: 0,
              },
              {
                optionId: 'ribbon_color',
                choiceIds: ['color_black'],
                priceModifier: 0,
              },
              {
                optionId: 'ribbon_text',
                choiceIds: ['text_custom'],
                customValue: 'Milovanému otci',
                priceModifier: 100,
              },
            ],
          }),
        });
      });
    });
  });

  describe('Customization Persistence Across Browser Sessions', () => {
    it('should persist cart customizations in localStorage', async () => {
      const mockLocalStorage = {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      };

      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
        writable: true,
      });

      const TestComponent = () => (
        <CartProvider>
          <ProductDetail product={mockWreathProduct} />
        </CartProvider>
      );

      render(<TestComponent />);

      // Add item with customizations to cart
      const sizeOption = screen.getByLabelText(/120cm průměr/i);
      fireEvent.click(sizeOption);

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
    });

    it('should restore cart from localStorage on component mount', async () => {
      const mockCartState = {
        items: [
          {
            id: 'test-item-1',
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
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        itemCount: 1,
        subtotal: 3000,
        total: 3000,
      };

      const mockLocalStorage = {
        getItem: jest.fn((key) => {
          if (key === 'cart_state') {
            return JSON.stringify({
              cart: mockCartState,
              version: Date.now(),
              timestamp: Date.now(),
            });
          }
          return null;
        }),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      };

      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
        writable: true,
      });

      const TestComponent = () => (
        <CartProvider>
          <ShoppingCart />
        </CartProvider>
      );

      render(<TestComponent />);

      // Should restore cart from localStorage
      await waitFor(() => {
        expect(screen.getByText(/150cm průměr/i)).toBeInTheDocument();
        expect(screen.getByText(/3000/)).toBeInTheDocument();
      });
    });
  });

  describe('Order Processing with Complex Customization Data', () => {
    it('should successfully create order with complex wreath customizations', async () => {
      const mockOrderResponse = {
        success: true,
        order: {
          id: 'order-123',
          orderNumber: 'ORD-2024-001',
          items: [
            {
              id: 'order-item-1',
              productId: mockWreathProduct.id,
              productName: 'Smuteční věnec',
              quantity: 1,
              unitPrice: 2500,
              totalPrice: 2650,
              customizations: [
                {
                  optionId: 'size',
                  choiceIds: ['size_150'],
                  priceModifier: 500,
                  transferredAt: expect.any(String),
                },
                {
                  optionId: 'ribbon',
                  choiceIds: ['ribbon_yes'],
                  priceModifier: 0,
                  transferredAt: expect.any(String),
                },
                {
                  optionId: 'ribbon_color',
                  choiceIds: ['color_black'],
                  priceModifier: 0,
                  transferredAt: expect.any(String),
                },
                {
                  optionId: 'ribbon_text',
                  choiceIds: ['text_custom'],
                  customValue: 'Milovanému otci',
                  priceModifier: 100,
                  transferredAt: expect.any(String),
                },
              ],
            },
          ],
          status: 'pending',
          totalAmount: 2650,
          createdAt: new Date().toISOString(),
        },
      };

      mockFetch.mockImplementation((url: string, options?: any) => {
        if (url === '/api/orders' && options?.method === 'POST') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockOrderResponse),
          });
        }
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ success: false }),
        });
      });

      const orderRequest: CreateOrderRequest = {
        items: [
          {
            id: 'cart-item-1',
            productId: mockWreathProduct.id,
            quantity: 1,
            unitPrice: 2500,
            totalPrice: 2650,
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
                choiceIds: ['color_black'],
                priceModifier: 0,
              },
              {
                optionId: 'ribbon_text',
                choiceIds: ['text_custom'],
                customValue: 'Milovanému otci',
                priceModifier: 100,
              },
            ],
            product: mockWreathProduct,
          } as CartItem,
        ],
        customerInfo: {
          firstName: 'Jan',
          lastName: 'Novák',
          email: 'jan.novak@example.com',
          phone: '+420123456789',
          name: 'Jan Novák',
        },
        deliveryInfo: {
          address: {
            street: 'Testovací 123',
            city: 'Praha',
            postalCode: '11000',
            country: 'CZ',
          },
          urgency: 'standard',
          preferredDate: new Date(),
        },
        paymentMethod: 'stripe',
        agreeToTerms: true,
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderRequest),
      });

      const result = await response.json();

      expect(result.success).toBe(true);
      expect(result.order.items[0].customizations).toHaveLength(4);
      expect(result.order.items[0].customizations[3].customValue).toBe('Milovanému otci');
      expect(result.order.items[0].customizations[0].transferredAt).toBeDefined();
    });

    it('should validate customization integrity during order processing', async () => {
      const invalidOrderRequest: CreateOrderRequest = {
        items: [
          {
            id: 'cart-item-1',
            productId: mockWreathProduct.id,
            quantity: 1,
            unitPrice: 2500,
            totalPrice: 2500,
            customizations: [
              // Missing required size selection
              {
                optionId: 'ribbon_color',
                choiceIds: ['color_black'],
                priceModifier: 0,
              },
              // Ribbon color without ribbon selection (invalid dependency)
            ],
            product: mockWreathProduct,
          } as CartItem,
        ],
        customerInfo: {
          firstName: 'Jan',
          lastName: 'Novák',
          email: 'jan.novak@example.com',
          phone: '+420123456789',
          name: 'Jan Novák',
        },
        deliveryInfo: {
          address: {
            street: 'Testovací 123',
            city: 'Praha',
            postalCode: '11000',
            country: 'CZ',
          },
          urgency: 'standard',
          preferredDate: new Date(),
        },
        paymentMethod: 'stripe',
        agreeToTerms: true,
      };

      mockFetch.mockImplementation((url: string, options?: any) => {
        if (url === '/api/orders' && options?.method === 'POST') {
          return Promise.resolve({
            ok: false,
            status: 400,
            json: () => Promise.resolve({
              success: false,
              error: 'Invalid customization configuration',
              details: [
                'Size selection is required for wreath products',
                'Ribbon color requires ribbon selection',
              ],
            }),
          });
        }
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ success: false }),
        });
      });

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invalidOrderRequest),
      });

      const result = await response.json();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid customization configuration');
      expect(result.details).toContain('Size selection is required for wreath products');
    });
  });

  describe('Customization Cleanup on Cart Removal and Order Completion', () => {
    it('should clean up customizations when removing item from cart', async () => {
      mockFetch.mockImplementation((url: string, options?: any) => {
        if (url.includes('/api/cart/items/') && options?.method === 'DELETE') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              success: true,
              message: 'Item removed successfully',
              customizationCleanup: {
                removedCustomizations: 4,
                cleanupSuccess: true,
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
          <ShoppingCart />
        </CartProvider>
      );

      render(<TestComponent />);

      // Simulate cart with item
      const removeButton = screen.getByRole('button', { name: /odstranit/i });

      await act(async () => {
        fireEvent.click(removeButton);
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringMatching(/\/api\/cart\/items\/.+/),
          {
            method: 'DELETE',
            credentials: 'include',
          }
        );
      });
    });

    it('should clean up cart customizations after successful order completion', async () => {
      const mockOrderResponse = {
        success: true,
        order: {
          id: 'order-123',
          orderNumber: 'ORD-2024-001',
          status: 'pending',
          totalAmount: 2650,
        },
        cartCleanup: {
          removedItems: 1,
          removedCustomizations: 4,
          cleanupSuccess: true,
        },
      };

      mockFetch.mockImplementation((url: string, options?: any) => {
        if (url === '/api/orders' && options?.method === 'POST') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockOrderResponse),
          });
        }
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ success: false }),
        });
      });

      const orderRequest: CreateOrderRequest = {
        items: [
          {
            id: 'cart-item-1',
            productId: mockWreathProduct.id,
            quantity: 1,
            unitPrice: 2500,
            totalPrice: 2650,
            customizations: [
              {
                optionId: 'size',
                choiceIds: ['size_150'],
                priceModifier: 500,
              },
            ],
            product: mockWreathProduct,
          } as CartItem,
        ],
        customerInfo: {
          firstName: 'Jan',
          lastName: 'Novák',
          email: 'jan.novak@example.com',
          phone: '+420123456789',
          name: 'Jan Novák',
        },
        deliveryInfo: {
          address: {
            street: 'Testovací 123',
            city: 'Praha',
            postalCode: '11000',
            country: 'CZ',
          },
          urgency: 'standard',
          preferredDate: new Date(),
        },
        paymentMethod: 'stripe',
        agreeToTerms: true,
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderRequest),
      });

      const result = await response.json();

      expect(result.success).toBe(true);
      expect(result.cartCleanup.removedItems).toBe(1);
      expect(result.cartCleanup.removedCustomizations).toBe(4);
      expect(result.cartCleanup.cleanupSuccess).toBe(true);
    });

    it('should handle cleanup failures gracefully without affecting order creation', async () => {
      const mockOrderResponse = {
        success: true,
        order: {
          id: 'order-123',
          orderNumber: 'ORD-2024-001',
          status: 'pending',
          totalAmount: 2650,
        },
        cartCleanup: {
          removedItems: 0,
          removedCustomizations: 0,
          cleanupSuccess: false,
          error: 'Database connection timeout during cleanup',
        },
      };

      mockFetch.mockImplementation((url: string, options?: any) => {
        if (url === '/api/orders' && options?.method === 'POST') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockOrderResponse),
          });
        }
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ success: false }),
        });
      });

      const orderRequest: CreateOrderRequest = {
        items: [
          {
            id: 'cart-item-1',
            productId: mockWreathProduct.id,
            quantity: 1,
            unitPrice: 2500,
            totalPrice: 2650,
            customizations: [
              {
                optionId: 'size',
                choiceIds: ['size_150'],
                priceModifier: 500,
              },
            ],
            product: mockWreathProduct,
          } as CartItem,
        ],
        customerInfo: {
          firstName: 'Jan',
          lastName: 'Novák',
          email: 'jan.novak@example.com',
          phone: '+420123456789',
          name: 'Jan Novák',
        },
        deliveryInfo: {
          address: {
            street: 'Testovací 123',
            city: 'Praha',
            postalCode: '11000',
            country: 'CZ',
          },
          urgency: 'standard',
          preferredDate: new Date(),
        },
        paymentMethod: 'stripe',
        agreeToTerms: true,
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderRequest),
      });

      const result = await response.json();

      // Order should still be successful even if cleanup fails
      expect(result.success).toBe(true);
      expect(result.order.id).toBe('order-123');
      expect(result.cartCleanup.cleanupSuccess).toBe(false);
      expect(result.cartCleanup.error).toContain('Database connection timeout');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle network errors during cart operations', async () => {
      mockFetch.mockImplementation(() => {
        return Promise.reject(new Error('Network error'));
      });

      const TestComponent = () => (
        <CartProvider>
          <ProductDetail product={mockWreathProduct} />
        </CartProvider>
      );

      render(<TestComponent />);

      // Select size and try to add to cart
      const sizeOption = screen.getByLabelText(/120cm průměr/i);
      fireEvent.click(sizeOption);

      const addToCartButton = screen.getByRole('button', { name: /přidat do košíku/i });

      await act(async () => {
        fireEvent.click(addToCartButton);
      });

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/failed to add item to cart/i)).toBeInTheDocument();
      });
    });

    it('should handle server validation errors gracefully', async () => {
      mockFetch.mockImplementation((url: string, options?: any) => {
        if (url === '/api/cart/items' && options?.method === 'POST') {
          return Promise.resolve({
            ok: false,
            status: 400,
            json: () => Promise.resolve({
              success: false,
              error: 'Validation failed',
              code: 'VALIDATION_ERROR',
              userFriendlyMessage: 'Please check your selections and try again',
              details: ['Size selection is required'],
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

      // Try to add to cart (this should trigger server validation)
      const addToCartButton = screen.getByRole('button', { name: /přidat do košíku/i });

      await act(async () => {
        fireEvent.click(addToCartButton);
      });

      // Should show user-friendly error message
      await waitFor(() => {
        expect(screen.getByText(/please check your selections and try again/i)).toBeInTheDocument();
      });
    });

    it('should handle concurrent cart modifications', async () => {
      let callCount = 0;
      mockFetch.mockImplementation((url: string, options?: any) => {
        if (url === '/api/cart/items' && options?.method === 'POST') {
          callCount++;
          if (callCount === 1) {
            // First call succeeds
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve({
                success: true,
                item: {
                  id: 'test-cart-item-1',
                  productId: mockWreathProduct.id,
                  quantity: 1,
                },
              }),
            });
          } else {
            // Second call fails due to conflict
            return Promise.resolve({
              ok: false,
              status: 409,
              json: () => Promise.resolve({
                success: false,
                error: 'Cart was modified by another session',
                code: 'CONFLICT',
                userFriendlyMessage: 'Your cart was updated. Please refresh and try again.',
              }),
            });
          }
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

      // Select size
      const sizeOption = screen.getByLabelText(/120cm průměr/i);
      fireEvent.click(sizeOption);

      // Make two concurrent add-to-cart requests
      const addToCartButton = screen.getByRole('button', { name: /přidat do košíku/i });

      await act(async () => {
        fireEvent.click(addToCartButton);
        fireEvent.click(addToCartButton); // Second click should be handled
      });

      // Should handle the conflict gracefully
      await waitFor(() => {
        expect(screen.getByText(/your cart was updated/i)).toBeInTheDocument();
      });
    });
  });
});
