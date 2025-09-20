import { GET } from '../route';
import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

// Mock Supabase client
jest.mock('@/lib/supabase/server', () => ({
  createServerClient: jest.fn(),
}));

const mockSupabaseClient = {
  from: jest.fn(),
};

const mockQuery = {
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
};

describe('/api/products/random', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createServerClient as jest.Mock).mockReturnValue(mockSupabaseClient);
    mockSupabaseClient.from.mockReturnValue(mockQuery);
  });

  const createMockRequest = (searchParams: Record<string, string> = {}) => {
    const url = new URL('http://localhost/api/products/random');
    Object.entries(searchParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    return new NextRequest(url);
  };

  const mockProducts = [
    {
      id: 'product-1',
      name_cs: 'Věnec 1',
      name_en: 'Wreath 1',
      slug: 'wreath-1',
      base_price: 1500,
      images: [{ url: '/image1.jpg', alt: 'Wreath 1' }],
      availability: { inStock: true },
      active: true,
      featured: false,
    },
    {
      id: 'product-2',
      name_cs: 'Věnec 2',
      name_en: 'Wreath 2',
      slug: 'wreath-2',
      base_price: 2000,
      images: [{ url: '/image2.jpg', alt: 'Wreath 2' }],
      availability: { inStock: true },
      active: true,
      featured: true,
    },
    {
      id: 'product-3',
      name_cs: 'Věnec 3',
      name_en: 'Wreath 3',
      slug: 'wreath-3',
      base_price: 2500,
      images: [],
      availability: { inStock: false },
      active: true,
      featured: false,
    },
  ];

  it('returns random products with default parameters', async () => {
    mockQuery.mockResolvedValue({
      data: mockProducts,
      error: null,
    });

    const request = createMockRequest();
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.products).toHaveLength(2); // Only in-stock products
    expect(mockSupabaseClient.from).toHaveBeenCalledWith('products');
    expect(mockQuery.eq).toHaveBeenCalledWith('active', true);
    expect(mockQuery.limit).toHaveBeenCalledWith(50);
  });

  it('respects count parameter', async () => {
    mockQuery.mockResolvedValue({
      data: mockProducts,
      error: null,
    });

    const request = createMockRequest({ count: '1' });
    response = await GET(request);
    const data = await response.json();

    expect(data.products).toHaveLength(1);
  });

  it('limits count to maximum of 10', async () => {
    mockQuery.mockResolvedValue({
      data: Array(15).fill(null).map((_, i) => ({
        ...mockProducts[0],
        id: `product-${i}`,
        availability: { inStock: true },
      })),
      error: null,
    });

    const request = createMockRequest({ count: '15' });
    const response = await GET(request);
    const data = await response.json();

    expect(data.products.length).toBeLessThanOrEqual(10);
  });

  it('uses default locale when not specified', async () => {
    mockQuery.mockResolvedValue({
      data: mockProducts,
      error: null,
    });

    const request = createMockRequest();
    const response = await GET(request);

    expect(response.status).toBe(200);
    // The locale parameter doesn't affect the query but is used for response formatting
  });

  it('filters out products that are not in stock', async () => {
    const allProducts = [
      { ...mockProducts[0], availability: { inStock: true } },
      { ...mockProducts[1], availability: { inStock: false } },
      { ...mockProducts[2], availability: { inStock: true } },
    ];

    mockQuery.mockResolvedValue({
      data: allProducts,
      error: null,
    });

    const request = createMockRequest({ count: '3' });
    const response = await GET(request);
    const data = await response.json();

    expect(data.products).toHaveLength(2);
    expect(data.products.every((p: any) => p.availability.inStock)).toBe(true);
  });

  it('transforms database format to Product interface', async () => {
    mockQuery.mockResolvedValue({
      data: [mockProducts[0]],
      error: null,
    });

    const request = createMockRequest({ count: '1' });
    const response = await GET(request);
    const data = await response.json();

    const product = data.products[0];
    expect(product).toMatchObject({
      id: 'product-1',
      name: {
        cs: 'Věnec 1',
        en: 'Wreath 1',
      },
      slug: 'wreath-1',
      basePrice: 1500,
      images: [{ url: '/image1.jpg', alt: 'Wreath 1' }],
      availability: { inStock: true },
      active: true,
      featured: false,
    });
    expect(product.seoMetadata).toBeDefined();
    expect(product.createdAt).toBeDefined();
    expect(product.updatedAt).toBeDefined();
  });

  it('handles database errors gracefully', async () => {
    mockQuery.mockResolvedValue({
      data: null,
      error: { message: 'Database connection failed' },
    });

    const request = createMockRequest();
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Failed to fetch products');
  });

  it('returns empty array when no products found', async () => {
    mockQuery.mockResolvedValue({
      data: [],
      error: null,
    });

    const request = createMockRequest();
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.products).toEqual([]);
  });

  it('returns empty array when no products are in stock', async () => {
    const outOfStockProducts = mockProducts.map(p => ({
      ...p,
      availability: { inStock: false },
    }));

    mockQuery.mockResolvedValue({
      data: outOfStockProducts,
      error: null,
    });

    const request = createMockRequest({ count: '3' });
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.products).toEqual([]);
  });

  it('handles products with missing availability gracefully', async () => {
    const productsWithMissingAvailability = [
      { ...mockProducts[0], availability: null },
      { ...mockProducts[1], availability: undefined },
      { ...mockProducts[2], availability: { inStock: true } },
    ];

    mockQuery.mockResolvedValue({
      data: productsWithMissingAvailability,
      error: null,
    });

    const request = createMockRequest({ count: '3' });
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.products).toHaveLength(3); // All products included with default availability
    expect(data.products[0].availability).toEqual({ inStock: true });
    expect(data.products[1].availability).toEqual({ inStock: true });
  });

  it('handles unexpected errors gracefully', async () => {
    mockSupabaseClient.from.mockImplementation(() => {
      throw new Error('Unexpected error');
    });

    const request = createMockRequest();
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Internal server error');
  });

  it('randomizes product selection', async () => {
    // Create a larger set of products to test randomization
    const manyProducts = Array(20).fill(null).map((_, i) => ({
      ...mockProducts[0],
      id: `product-${i}`,
      name_cs: `Věnec ${i}`,
      name_en: `Wreath ${i}`,
      availability: { inStock: true },
    }));

    mockQuery.mockResolvedValue({
      data: manyProducts,
      error: null,
    });

    const request = createMockRequest({ count: '3' });

    // Make multiple requests to test randomization
    const results = [];
    for (let i = 0; i < 5; i++) {
      const response = await GET(request);
      const data = await response.json();
      results.push(data.products.map((p: any) => p.id));
    }

    // Check that we get different combinations (not a perfect test but reasonable)
    const uniqueResults = new Set(results.map(r => r.join(',')));
    expect(uniqueResults.size).toBeGreaterThan(1);
  });
});
