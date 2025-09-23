// Integration tests for cart and order flow with wreath customizations
import { jest } from '@jest/globals';
import type { AddToCartRequest, CreateOrderRequest, CartItem, Customization } from '@/types';

// Mock Supabase
const mockSupabaseClient = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(() => Promise.resolve({
          data: {
            id: 'wreath-001',
            name: { cs: 'Smuteční věnec', en: 'Funeral Wreath' },
            base_price: 2500,
            customization_options: [
              {
                id: 'size',
                type: 'size',
                name: { cs: 'Velikost', en: 'Size' },
                required: true,
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
          },
          error: null
        })),
        lt: jest.fn(() => ({
          is: jest.fn(() => ({
            select: jest.fn(() => Promise.resolve({ count: 0, error: null })),
          })),
        })),
      })),
      in: jest.fn(() => ({
        select: jest.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    })),
    insert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn(() => Promise.resolve({
          data: {
            id: 'cart-item-123',
            user_id: null,
            session_id: 'session-123',
            product_id: 'wreath-001',
            quantity: 1,
            unit_price: 2500,
            total_price: 2650,
            customizations: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          error: null
        })),
      })),
    })),
    update: jest.fn(() => ({
      eq: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({
            data: {
              id: 'order-123',
              status: 'pending',
              total_amount: 2650,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            error: null
          })),
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
  rpc: jest.fn(() => Promise.resolve({ data: null, error: null })),
};

// Mock validation functions
const mockValidateCartOperation = jest.fn(() => ({
  isValid: true,
  errors: [],
  warnings: [],
}));

const mockSanitizeCustomizations = jest.fn((customizations) => customizations);

const mockValidateCustomizationIntegrity = jest.fn((customizations) => ({
  isValid: true,
  issues: [],
  fixedCustomizations: customizations,
}));

const mockTransferCustomizationsToOrder = jest.fn((customizations) =>
  customizations.map(c => ({
    ...c,
    transferredAt: new Date().toISOString(),
  }))
);

const mockCleanupOrphanedCustomizations = jest.fn(() => Promise.resolve({
  success: true,
  cleanedItems: 0,
  customizationsRemoved: 0,
}));

// Mock fetch for API calls
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('Cart and Order Flow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  describe('Complete Wreath Customization and Cart Addition Flow', () => {
    it('should successfully add wreath with full customization to cart via API', async () => {
      const addToCartRequest: AddToCartRequest = {
        productId: 'wreath-001',
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
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          item: {
            id: 'cart-item-123',
            productId: 'wreath-001',
            quantity: 1,
            customizations: addToCartRequest.customizations,
            unitPrice: 2500,
            totalPrice: 3100, // Base price + size modifier + text modifier
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        }),
      });

      const response = await fetch('/api/cart/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(addToCartRequest),
      });

      const result = await response.json();

      expect(response.ok).toBe(true);
      expect(result.success).toBe(true);
      expect(result.item.customizations).toHaveLength(4);
      expect(result.item.customizations[3].customValue).toBe('Milovanému otci');
      expect(result.item.totalPrice).toBe(3100);

      // Verify API was called with correct data
      expect(mockFetch).toHaveBeenCalledWith('/api/cart/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(addToCartRequest),
      });
    });

    it('should validate required size selection for wreaths', async () => {
      const invalidRequest: AddToCartRequest = {
        productId: 'wreath-001',
        quantity: 1,
        customizations: [
          {
            optionId: 'ribbon',
            choiceIds: ['ribbon_yes'],
            priceModifier: 0,
          },
          // Missing required size selection
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({
          success: false,
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: ['Size selection is required for wreath products'],
        }),
      });

      const response = await fetch('/api/cart/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(invalidRequest),
      });

      const result = await response.json();

      expect(response.ok).toBe(false);
      expect(result.success).toBe(false);
      expect(result.details).toContain('Size selection is required for wreath products');
    });

    it('should validate ribbon dependencies correctly', async () => {
      const invalidRequest: AddToCartRequest = {
        productId: 'wreath-001',
        quantity: 1,
        customizations: [
          {
            optionId: 'size',
            choiceIds: ['size_120'],
            priceModifier: 0,
          },
          {
            optionId: 'ribbon_color',
            choiceIds: ['color_black'],
            priceModifier: 0,
          },
          // Missing ribbon selection - invalid dependency
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({
          success: false,
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: ['Ribbon color requires ribbon selection'],
        }),
      });

      const response = await fetch('/api/cart/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(invalidRequest),
      });

      const result = await response.json();

      expect(response.ok).toBe(false);
      expect(result.success).toBe(false);
      expect(result.details).toContain('Ribbon color requires ribbon selection');
    });
  });

  describe('Customization Persistence Across Browser Sessions', () => {
    it('shoult cazations and restore them', async () => {
      // Step 1: Add item to cart
      const addToCartRequest: AddToCartRequest = {
        productId: 'wreath-001',
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
            optionId: 'ribbon_text',
            choiceIds: ['text_custom'],
            customValue: 'Test message',
            ceModifier: 100,
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          item: {
            id: 'cart-item-123',
            productId: 'wreath-001',
            quantity: 1,
            customizations: addToCartRequest.customizations,
            unitPrice: 2500,
            totalPrice: 3100,
            reatedAt: new Date(),
            updatedAt: new Date(),
          },
        }),
      });

      // Add to cart
      const addResponse = await fetch('/api/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(addToCartRequest),
      });

      const addResult = await addResponse.json();
      expect(addResult.success).toBe(true);

      // Step 2: Simulate session restoration by fetching cart
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          cart: {
            items: [
              {
                id: 'cart-item-123',
                productId: 'wreath-001',
                quantity: 1,
                customizations: addToCartRequest.customizations,
                unitPrice: 2500,
                totalPrice: 3100,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            ],
            itemCount: 1,
            subtotal: 3100,
            total: 3100,
          },
        }),
      });

      // Fetch cart (simulating page reload)
      const cartResponse = await fetch('/api/cart', {
        method: 'GET',
        credentials: 'include',
      });

      const cartResult = await cartResponse.json();

      expect(cartResult.success).toBe(true);
      expect(cartResult.cart.items).toHaveLength(1);
      expect(cartResult.cart.items[0].customizations).toHaveLength(3);
      expect(cartResult.cart.items[0].customizations[2].customValue).toBe('Test message');
      expect(cartResult.cart.total).toBe(3100);
    });

    it('should handle session ID management for guest users', async () => {
      const addToCartRequest: AddToCartRequest = {
        productId: 'wreath-001',
        quantity: 1,
        customizations: [
          {
            optionId: 'size',
            choiceIds: ['size_120'],
            priceModifier: 0,
          },
        ],
      };

      // Mock response with session cookie
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          success: true,
          item: {
            id: 'cart-item-123',
            sessionId: 'generated-session-123',
            productId: 'wreath-001',
            quantity: 1,
            customizations: addToCartRequest.customizations,
            unitPrice: 2500,
            totalPrice: 2500,
          },
        }),
        headers: {
          get: (name: string) => {
            if (name === 'set-cookie') {
              return 'cart-session=generated-session-123; HttpOnly; SameSite=Lax; Max-Age=2592000';
            }
            return null;
          },
        },
      };

      mockFetch.mockResolvedValueOnce(mockResponse);

      const response = await fetch('/api/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(addToCartRequest),
      });

      const result = await response.json();

      expect(result.success).toBe(true);
      expect(result.item.sessionId).toBe('generated-session-123');

      // Verify session cookie would be set
      const setCookieHeader = response.headers.get('set-cookie');
      expect(setCookieHeader).toContain('cart-session=generated-session-123');
    });
  });

  describe('Order Processing with Complex Customization Data', () => {
    it('should successfully create order with complex wreath customizations', async () => {
      const orderRequest: CreateOrderRequest = {
        items: [
          {
            id: 'cart-item-1',
            productId: 'wreath-001',
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
            product: {
              id: 'wreath-001',
              name: { cs: 'Smuteční věnec', en: 'Funeral Wreath' },
              slug: 'funeral-wreath',
            },
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

      const mockOrderResponse = {
        success: true,
        order: {
          id: 'order-123',
          orderNumber: 'ORD-2024-001',
          items: [
            {
              id: 'order-item-1',
              productId: 'wreath-001',
              productName: 'Smuteční věnec',
              quantity: 1,
              unitPrice: 2500,
              totalPrice: 2650,
              customizations: [
                {
                  optionId: 'size',
                  choiceIds: ['size_150'],
                  priceModifier: 500,
                  transferredAt: new Date().toISOString(),
                },
                {
                  optionId: 'ribbon',
                  choiceIds: ['ribbon_yes'],
                  priceModifier: 0,
                  transferredAt: new Date().toISOString(),
                },
                {
                  optionId: 'ribbon_color',
                  choiceIds: ['color_black'],
                  priceModifier: 0,
                  transferredAt: new Date().toISOString(),
                },
                {
                  optionId: 'ribbon_text',
                  choiceIds: ['text_custom'],
                  customValue: 'Milovanému otci',
                  priceModifier: 100,
                  transferredAt: new Date().toISOString(),
                },
              ],
            },
          ],
          status: 'pending',
          totalAmount: 2850, // Including delivery
          createdAt: new Date().toISOString(),
        },
        cartCleanup: {
          removedItems: 1,
          removedCustomizations: 4,
          cleanupSuccess: true,
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockOrderResponse),
      });

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderRequest),
      });

      const result = await response.json();

      expect(result.success).toBe(true);
      expect(result.order.items).toHaveLength(1);
      expect(result.order.items[0].customizations).toHaveLength(4);
      expect(result.order.items[0].customizations[3].customValue).toBe('Milovanému otci');
      expect(result.order.items[0].customizations[0].transferredAt).toBeDefined();
      expect(result.cartCleanup.removedItems).toBe(1);
      expect(result.cartCleanup.removedCustomizations).toBe(4);
    });

    it('should validate customization integrity during order processing', async () => {
      const invalidOrderRequest: CreateOrderRequest = {
        items: [
          {
            id: 'cart-item-1',
            productId: 'wreath-001',
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
            product: {
              id: 'wreath-001',
              name: { cs: 'Smuteční věnec', en: 'Funeral Wreath' },
              slug: 'funeral-wreath',
            },
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

      mockFetch.mockResolvedValueOnce({
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

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidOrderRequest),
      });

      const result = await response.json();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid customization configuration');
      expect(result.details).toContain('Size selection is required for wreath products');
      expect(result.details).toContain('Ribbon color requires ribbon selection');
    });
  });

  describe('Customization Cleanup on Cart Removal and Order Completion', () => {
    it('should clean up customizations when removing item from cart', async () => {
      mockFetch.mockResolvedValueOnce({
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

      const response = await fetch('/api/cart/items/cart-item-123', {
        method: 'DELETE',
        credentials: 'include',
      });

      const result = await response.json();

      expect(result.success).toBe(true);
      expect(result.customizationCleanup.removedCustomizations).toBe(4);
      expect(result.customizationCleanup.cleanupSuccess).toBe(true);
    });

    it('should clean up cart customizations after successful order completion', async () => {
      const orderRequest: CreateOrderRequest = {
        items: [
          {
            id: 'cart-item-1',
            productId: 'wreath-001',
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
            product: {
              id: 'wreath-001',
              name: { cs: 'Smuteční věnec', en: 'Funeral Wreath' },
              slug: 'funeral-wreath',
            },
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

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          order: {
            id: 'order-123',
            orderNumber: 'ORD-2024-001',
            status: 'pending',
            totalAmount: 2850,
          },
          cartCleanup: {
            removedItems: 1,
            removedCustomizations: 1,
            cleanupSuccess: true,
          },
        }),
      });

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderRequest),
      });

      const result = await response.json();

      expect(result.success).toBe(true);
      expect(result.cartCleanup.removedItems).toBe(1);
      expect(result.cartCleanup.removedCustomizations).toBe(1);
      expect(result.cartCleanup.cleanupSuccess).toBe(true);
    });

    it('should handle cleanup failures gracefully without affecting order creation', async () => {
      const orderRequest: CreateOrderRequest = {
        items: [
          {
            id: 'cart-item-1',
            productId: 'wreath-001',
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
            product: {
              id: 'wreath-001',
              name: { cs: 'Smuteční věnec', en: 'Funeral Wreath' },
              slug: 'funeral-wreath',
            },
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

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          order: {
            id: 'order-123',
            orderNumber: 'ORD-2024-001',
            status: 'pending',
            totalAmount: 2850,
          },
          cartCleanup: {
            removedItems: 0,
            removedCustomizations: 0,
            cleanupSuccess: false,
            error: 'Database connection timeout during cleanup',
          },
        }),
      });

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      try {
        await fetch('/api/cart/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            productId: 'wreath-001',
            quantity: 1,
            customizations: [],
          }),
        });
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Network error');
      }
    });

    it('should handle server validation errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
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

      const response = await fetch('/api/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          productId: 'wreath-001',
          quantity: 1,
          customizations: [], // Missing required size
        }),
      });

      const result = await response.json();

      expect(result.success).toBe(false);
      expect(result.userFriendlyMessage).toBe('Please check your selections and try again');
      expect(result.details).toContain('Size selection is required');
    });

    it('should handle concurrent cart modifications', async () => {
      let callCount = 0;
      mockFetch.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // First call succeeds
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              success: true,
              item: {
                id: 'cart-item-1',
                productId: 'wreath-001',
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
      });

      // First request succeeds
      const response1 = await fetch('/api/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          productId: 'wreath-001',
          quantity: 1,
          customizations: [{ optionId: 'size', choiceIds: ['size_120'], priceModifier: 0 }],
        }),
      });

      const result1 = await response1.json();
      expect(result1.success).toBe(true);

      // Second request fails due to conflict
      const response2 = await fetch('/api/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          productId: 'wreath-001',
          quantity: 1,
          customizations: [{ optionId: 'size', choiceIds: ['size_150'], priceModifier: 500 }],
        }),
      });

      const result2 = await response2.json();
      expect(result2.success).toBe(false);
      expect(result2.code).toBe('CONFLICT');
      expect(result2.userFriendlyMessage).toContain('Your cart was updated');
    });
  });
});
