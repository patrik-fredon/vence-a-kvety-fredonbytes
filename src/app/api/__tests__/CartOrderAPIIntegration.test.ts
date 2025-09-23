// API Integration tests for cart and order endpoints with wreath customizations
import { jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { POST as CartItemsPOST } from '@/app/api/cart/items/route';
import { DELETE as CartItemsDELETE } from '@/app/api/cart/items/[id]/route';
import { POST as OrdersPOST } from '@/app/api/orders/route';
import type { AddToCartRequest, CreateOrderRequest, CartItem } from '@/types';

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

jest.mock('@/lib/supabase/server', () => ({
  createServerClient: () => mockSupabaseClient,
}));

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabaseClient,
}));

// Mock auth
jest.mock('@/lib/auth/config', () => ({
  auth: jest.fn(() => Promise.resolve(null)),
}));

// Mock validation functions
jest.mock('@/lib/validation/api-validation', () => ({
  validateCartOperation: jest.fn(() => ({
    isValid: true,
    errors: [],
    warnings: [],
  })),
  sanitizeCustomizations: jest.fn((customizations) => customizations),
}));

// Mock utility functions
jest.mock('@/lib/cart/utils', () => ({
  validateCustomizationIntegrity: jest.fn((customizations) => ({
    isValid: true,
    issues: [],
    fixedCustomizations: customizations,
  })),
  transferCustomizationsToOrder: jest.fn((customizations) =>
    customizations.map(c => ({
      ...c,
      transferredAt: new Date().toISOString(),
    }))
  ),
  cleanupOrphanedCustomizations: jest.fn(() => Promise.resolve({
    success: true,
    cleanedItems: 0,
    customizationsRemoved: 0,
  })),
}));

// Mock delivery and payment functions
jest.mock('@/lib/utils/delivery-calculator', () => ({
  calculateDeliveryCost: jest.fn(() => Promise.resolve(200)),
}));

jest.mock('@/lib/payments/stripe', () => ({
  createStripePaymentSession: jest.fn(() => Promise.resolve('https://stripe.com/pay/123')),
}));

jest.mock('@/lib/email/service', () => ({
  sendOrderConfirmationEmail: jest.fn(() => Promise.resolve()),
}));

// Helper function to create mock request
const createMockRequest = (body: any, headers: Record<string, string> = {}) => {
  return {
    json: jest.fn(() => Promise.resolve(body)),
    headers: {
      get: jest.fn((key: string) => headers[key] || null),
    },
    cookies: {
      get: jest.fn(() => ({ value: 'session-123' })),
    },
  } as unknown as NextRequest;
};

describe('Cart and Order API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Cart Items API', () => {
    describe('POST /api/cart/items', () => {
      it('should successfully add wreath with complex customizations to cart', async () => {
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

        const request = createMockRequest(addToCartRequest);
        const response = await CartItemsPOST(request);
        const result = await response.json();

        expect(response.status).toBe(200);
        expect(result.success).toBe(true);
        expect(result.item).toBeDefined();
        expect(result.item.id).toBe('cart-item-123');
        expect(result.item.productId).toBe('wreath-001');
        expect(result.item.quantity).toBe(1);

        // Verify Supabase insert was called with correct data
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('cart_items');
        expect(mockSupabaseClient.from().insert).toHaveBeenCalledWith(
          expect.objectContaining({
            product_id: 'wreath-001',
            quantity: 1,
            customizations: addToCartRequest.customizations,
            session_id: 'session-123',
            user_id: null,
          })
        );
      });

      it('should validate required size selection for wreaths', async () => {
        const { validateCartOperation } = require('@/lib/validation/api-validation');
        validateCartOperation.mockReturnValueOnce({
          isValid: false,
          errors: ['Size selection is required for wreath products'],
          warnings: [],
        });

        const invalidRequest: AddToCartRequest = {
          productId: 'wreath-001',
          quantity: 1,
          customizations: [
            {
              optionId: 'ribbon',
              choiceIds: ['ribbon_yes'],
              priceModifier: 0,
            },
          ],
        };

        const request = createMockRequest(invalidRequest);
        const response = await CartItemsPOST(request);
        const result = await response.json();

        expect(response.status).toBe(400);
        expect(result.success).toBe(false);
        expect(result.error).toContain('validation');
        expect(result.details).toContain('Size selection is required for wreath products');
      });

      it('should validate ribbon dependencies correctly', async () => {
        const { validateCartOperation } = require('@/lib/validation/api-validation');
        validateCartOperation.mockReturnValueOnce({
          isValid: false,
          errors: ['Ribbon color requires ribbon selection'],
          warnings: [],
        });

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
            // Missing ribbon selection
          ],
        };

        const request = createMockRequest(invalidRequest);
        const response = await CartItemsPOST(request);
        const result = await response.json();

        expect(response.status).toBe(400);
        expect(result.success).toBe(false);
        expect(result.details).toContain('Ribbon color requires ribbon selection');
      });

      it('should sanitize custom text input', async () => {
        const { sanitizeCustomizations } = require('@/lib/validation/api-validation');
        sanitizeCustomizations.mockReturnValueOnce([
          {
            optionId: 'size',
            choiceIds: ['size_120'],
            priceModifier: 0,
          },
          {
            optionId: 'ribbon_text',
            choiceIds: ['text_custom'],
            customValue: 'Sanitized text', // Sanitized version
            priceModifier: 100,
          },
        ]);

        const requestWithUnsafeText: AddToCartRequest = {
          productId: 'wreath-001',
          quantity: 1,
          customizations: [
            {
              optionId: 'size',
              choiceIds: ['size_120'],
              priceModifier: 0,
            },
            {
              optionId: 'ribbon_text',
              choiceIds: ['text_custom'],
              customValue: '<script>alert("xss")</script>Unsafe text',
              priceModifier: 100,
            },
          ],
        };

        const request = createMockRequest(requestWithUnsafeText);
        const response = await CartItemsPOST(request);
        const result = await response.json();

        expect(response.status).toBe(200);
        expect(result.success).toBe(true);
        expect(sanitizeCustomizations).toHaveBeenCalledWith(requestWithUnsafeText.customizations);
      });

      it('should handle database errors gracefully', async () => {
        mockSupabaseClient.from().insert().select().single.mockResolvedValueOnce({
          data: null,
          error: { message: 'Database connection failed', code: 'CONNECTION_ERROR' },
        });

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

        const request = createMockRequest(addToCartRequest);
        const response = await CartItemsPOST(request);
        const result = await response.json();

        expect(response.status).toBe(500);
        expect(result.success).toBe(false);
        expect(result.error).toBe('Failed to add item to cart');
        expect(result.retryable).toBe(true);
      });
    });

    describe('DELETE /api/cart/items/[id]', () => {
      it('should successfully remove cart item and clean up customizations', async () => {
        // Mock cart item with customizations
        mockSupabaseClient.from().select().eq().single.mockResolvedValueOnce({
          data: {
            id: 'cart-item-123',
            customizations: [
              {
                optionId: 'size',
                choiceIds: ['size_150'],
                priceModifier: 500,
              },
              {
                optionId: 'ribbon_text',
                choiceIds: ['text_custom'],
                customValue: 'Test message',
                priceModifier: 100,
              },
            ],
          },
          error: null,
        });

        const request = createMockRequest({});
        const response = await CartItemsDELETE(request, { params: { id: 'cart-item-123' } });
        const result = await response.json();

        expect(response.status).toBe(200);
        expect(result.success).toBe(true);
        expect(result.message).toContain('removed successfully');

        // Verify delete was called
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('cart_items');
        expect(mockSupabaseClient.from().delete).toHaveBeenCalled();
      });

      it('should handle non-existent cart item gracefully', async () => {
        mockSupabaseClient.from().select().eq().single.mockResolvedValueOnce({
          data: null,
          error: { message: 'Item not found', code: 'PGRST116' },
        });

        const request = createMockRequest({});
        const response = await CartItemsDELETE(request, { params: { id: 'non-existent-item' } });
        const result = await response.json();

        expect(response.status).toBe(404);
        expect(result.success).toBe(false);
        expect(result.error).toContain('not found');
      });
    });
  });

  describe('Orders API', () => {
    describe('POST /api/orders', () => {
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

        mockSupabaseClient.from().insert().select().single.mockResolvedValueOnce({
          data: {
            id: 'order-123',
            customer_info: {
              firstName: 'Jan',
              lastName: 'Novák',
              email: 'jan.novak@example.com',
              orderNumber: 'ORD-2024-001',
            },
            delivery_info: {
              address: orderRequest.deliveryInfo.address,
              deliveryCost: 200,
            },
            payment_info: {
              method: 'stripe',
              amount: 2850,
              currency: 'CZK',
              status: 'pending',
            },
            items: {
              items: [
                {
                  id: expect.any(String),
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
              itemCount: 1,
              subtotal: 2650,
              totalAmount: 2850,
            },
            status: 'pending',
            total_amount: 2850,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          error: null,
        });

        const request = createMockRequest(orderRequest);
        const response = await OrdersPOST(request);
        const result = await response.json();

        expect(response.status).toBe(200);
        expect(result.success).toBe(true);
        expect(result.order).toBeDefined();
        expect(result.order.id).toBe('order-123');
        expect(result.order.items).toHaveLength(1);
        expect(result.order.items[0].customizations).toHaveLength(4);
        expect(result.order.items[0].customizations[3].customValue).toBe('Milovanému otci');

        // Verify customization transfer was called
        const { transferCustomizationsToOrder } = require('@/lib/cart/utils');
        expect(transferCustomizationsToOrder).toHaveBeenCalledWith(
          orderRequest.items[0].customizations
        );
      });

      it('should validate customization integrity during order processing', async () => {
        const { validateCustomizationIntegrity } = require('@/lib/cart/utils');
        validateCustomizationIntegrity.mockReturnValueOnce({
          isValid: false,
          issues: ['Missing required size selection', 'Invalid ribbon dependency'],
          fixedCustomizations: [
            {
              optionId: 'size',
              choiceIds: ['size_120'],
              priceModifier: 0,
            },
          ],
        });

        const orderWithInvalidCustomizations: CreateOrderRequest = {
          items: [
            {
              id: 'cart-item-1',
              productId: 'wreath-001',
              quantity: 1,
              unitPrice: 2500,
              totalPrice: 2500,
              customizations: [
                {
                  optionId: 'ribbon_color',
                  choiceIds: ['color_black'],
                  priceModifier: 0,
                },
                // Missing size, invalid ribbon dependency
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

        mockSupabaseClient.from().insert().select().single.mockResolvedValueOnce({
          data: {
            id: 'order-123',
            customer_info: { orderNumber: 'ORD-2024-001' },
            delivery_info: { deliveryCost: 200 },
            payment_info: { method: 'stripe', amount: 2700, status: 'pending' },
            items: { items: [], itemCount: 1, subtotal: 2500, totalAmount: 2700 },
            status: 'pending',
            total_amount: 2700,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          error: null,
        });

        const request = createMockRequest(orderWithInvalidCustomizations);
        const response = await OrdersPOST(request);
        const result = await response.json();

        expect(response.status).toBe(200);
        expect(result.success).toBe(true);

        // Should have validated and fixed customizations
        expect(validateCustomizationIntegrity).toHaveBeenCalledWith(
          orderWithInvalidCustomizations.items[0].customizations
        );
      });

      it('should clean up cart items after successful order creation', async () => {
        const orderRequest: CreateOrderRequest = {
          items: [
            {
              id: 'cart-item-1',
              productId: 'wreath-001',
              quantity: 1,
              unitPrice: 2500,
              totalPrice: 2500,
              customizations: [],
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

        // Mock successful order creation
        mockSupabaseClient.from().insert().select().single.mockResolvedValueOnce({
          data: {
            id: 'order-123',
            customer_info: { orderNumber: 'ORD-2024-001' },
            delivery_info: { deliveryCost: 200 },
            payment_info: { method: 'stripe', amount: 2700, status: 'pending' },
            items: { items: [], itemCount: 1, subtotal: 2500, totalAmount: 2700 },
            status: 'pending',
            total_amount: 2700,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          error: null,
        });

        // Mock cart items for cleanup
        mockSupabaseClient.from().select().eq.mockResolvedValueOnce({
          data: [
            {
              id: 'cart-item-1',
              customizations: [
                { optionId: 'size', choiceIds: ['size_120'] },
              ],
            },
          ],
          error: null,
        });

        const request = createMockRequest(orderRequest, { 'cookie': 'cart-session=session-123' });
        const response = await OrdersPOST(request);
        const result = await response.json();

        expect(response.status).toBe(200);
        expect(result.success).toBe(true);

        // Should have attempted cart cleanup
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('cart_items');
        expect(mockSupabaseClient.from().delete).toHaveBeenCalled();
      });

      it('should handle cleanup failures gracefully without affecting order creation', async () => {
        const orderRequest: CreateOrderRequest = {
          items: [
            {
              id: 'cart-item-1',
              productId: 'wreath-001',
              quantity: 1,
              unitPrice: 2500,
              totalPrice: 2500,
              customizations: [],
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

        // Mock successful order creation
        mockSupabaseClient.from().insert().select().single.mockResolvedValueOnce({
          data: {
            id: 'order-123',
            customer_info: { orderNumber: 'ORD-2024-001' },
            delivery_info: { deliveryCost: 200 },
            payment_info: { method: 'stripe', amount: 2700, status: 'pending' },
            items: { items: [], itemCount: 1, subtotal: 2500, totalAmount: 2700 },
            status: 'pending',
            total_amount: 2700,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          error: null,
        });

        // Mock cart cleanup failure
        mockSupabaseClient.from().select().eq.mockResolvedValueOnce({
          data: null,
          error: { message: 'Database connection timeout', code: 'CONNECTION_TIMEOUT' },
        });

        const request = createMockRequest(orderRequest);
        const response = await OrdersPOST(request);
        const result = await response.json();

        // Order should still be successful even if cleanup fails
        expect(response.status).toBe(200);
        expect(result.success).toBe(true);
        expect(result.order.id).toBe('order-123');
      });

      it('should validate required order fields', async () => {
        const incompleteOrderRequest = {
          items: [], // Empty items
          customerInfo: {
            firstName: 'Jan',
            lastName: 'Novák',
            email: 'jan.novak@example.com',
            phone: '+420123456789',
            name: 'Jan Novák',
          },
          // Missing deliveryInfo and paymentMethod
          agreeToTerms: true,
        };

        const request = createMockRequest(incompleteOrderRequest);
        const response = await OrdersPOST(request);
        const result = await response.json();

        expect(response.status).toBe(400);
        expect(result.success).toBe(false);
        expect(result.error).toContain('alespoň jednu položku');
      });

      it('should require terms agreement', async () => {
        const orderWithoutTerms: CreateOrderRequest = {
          items: [
            {
              id: 'cart-item-1',
              productId: 'wreath-001',
              quantity: 1,
              unitPrice: 2500,
              totalPrice: 2500,
              customizations: [],
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
          agreeToTerms: false, // Not agreed
        };

        const request = createMockRequest(orderWithoutTerms);
        const response = await OrdersPOST(request);
        const result = await response.json();

        expect(response.status).toBe(400);
        expect(result.success).toBe(false);
        expect(result.error).toContain('obchodními podmínkami');
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle malformed JSON requests', async () => {
      const request = {
        json: jest.fn(() => Promise.reject(new SyntaxError('Unexpected token'))),
        headers: {
          get: jest.fn(() => null),
        },
        cookies: {
          get: jest.fn(() => ({ value: 'session-123' })),
        },
      } as unknown as NextRequest;

      const response = await CartItemsPOST(request);
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Internal server error');
    });

    it('should handle database connection failures', async () => {
      mockSupabaseClient.from().select().eq().single.mockRejectedValueOnce(
        new Error('Connection refused')
      );

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

      const request = createMockRequest(addToCartRequest);
      const response = await CartItemsPOST(request);
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result.success).toBe(false);
      expect(result.retryable).toBe(true);
    });

    it('should handle concurrent modification conflicts', async () => {
      // Simulate optimistic locking conflict
      mockSupabaseClient.from().insert().select().single.mockResolvedValueOnce({
        data: null,
        error: {
          message: 'duplicate key value violates unique constraint',
          code: '23505',
        },
      });

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

      const request = createMockRequest(addToCartRequest);
      const response = await CartItemsPOST(request);
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result.success).toBe(false);
      expect(result.retryable).toBe(true);
    });
  });
});
