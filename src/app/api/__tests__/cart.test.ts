import { NextRequest } from 'next/server';
import { GET } from '../cart/route';

// Mock auth
const mockAuth = {
  getUser: jest.fn(() => ({ id: 'user123' })),
};

jest.mock('@/lib/auth/utils', () => ({
  getServerSession: () => mockAuth,
}));

// Mock Supabase client
const mockSupabaseClient = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        data: [
          {
            id: '1',
            product_id: 'prod1',
            quantity: 2,
            unit_price: 1500,
            total_price: 3000,
            customizations: [
              {
                option_id: 'message',
                custom_value: 'In loving memory',
              },
            ],
            product: {
              id: 'prod1',
              name_cs: 'Pohřební věnec',
              name_en: 'Funeral Wreath',
              slug: 'funeral-wreath',
              base_price: 1500,
              images: [
                {
                  id: 'img1',
                  url: '/test-image.jpg',
                  alt: 'Test image',
                  is_primary: true,
                },
              ],
            },
          },
        ],
        error: null,
      })),
    })),
    insert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn(() => ({
          data: {
            id: '2',
            product_id: 'prod2',
            quantity: 1,
            unit_price: 2000,
            total_price: 2000,
          },
          error: null,
        })),
      })),
    })),
  })),
};

jest.mock('@/lib/supabase/server', () => ({
  createClient: () => mockSupabaseClient,
}));

describe('/api/cart', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/cart', () => {
    it('returns cart items for authenticated user', async () => {
      const request = new NextRequest('http://localhost:3000/api/cart');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.items).toHaveLength(1);
      expect(data.items[0].product.name.cs).toBe('Pohřební věnec');
      expect(data.total).toBe(3000);
    });

    it('returns 401 for unauthenticated user', async () => {
      mockAuth.getUser = jest.fn().mockReturnValue(null);

      const request = new NextRequest('http://localhost:3000/api/cart');
      const response = await GET(request);

      expect(response.status).toBe(401);
    });

    it('handles database errors', async () => {
      mockSupabaseClient.from = jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              data: null,
              error: { message: 'Database error' },
            })),
          })),
        })),
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => ({
              data: null,
              error: { message: 'Database error' },
            })),
          })),
        })),
      })) as any;

      const request = new NextRequest('http://localhost:3000/api/cart');
      const response = await GET(request);

      expect(response.status).toBe(500);
    });
  });

  // Note: POST method is not implemented in the cart route
  // Cart items are added through /api/cart/items route instead
});
