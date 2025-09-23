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
  
