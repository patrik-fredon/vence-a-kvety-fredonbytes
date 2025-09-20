import { NextRequest } from 'next/server';
import { GET } from '../route';

// Mock Supabase
jest.mock('@/lib/supabase/server', () => ({
  createServerClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest.fn(() => ({
              data: mockProducts,
              error: null,
            })),
          })),
        })),
      })),
    })),
  })),
}));

const mockProducts = [
  {
    id: 'featured-1',
    name_cs: 'Vybraný věnec 1',
    name_en: 'Featured Wreath 1',
    slug: 'featured-wreath-1',
    base_price: 2000,
    images: [{ url: '/image1.jpg', alt: 'Featured 1', isPrimary: true }],
    availability: { inStock: true },
    active: true,
    featured: true,
  },
  {
    id: 'featured-2',
    name_cs: 'Vybraný věnec 2',
    name_en: 'Featured Wreath 2',
    slug: 'featured-wreath-2',
    base_price: 2500,
    images: [{ url: '/image2.jpg', alt: 'Featured 2', isPrimary: true }],
    availability: { inStock: true },
    active: true,
    featured: true,
  },
  {
    id: 'regular-1',
    name_cs: 'Běžný věnec 1',
    name_en: 'Regular Wreath 1',
    slug: 'regular-wreath-1',
    base_price: 1500,
    images: [{ url: '/image3.jpg', alt: 'Regular 1', isPrimary: true }],
    availability: { inStock: true },
    active: true,
    featured: false,
  },
  {
    id: 'regular-2',
    name_cs: 'Běžný věnec 2',
    name_en: 'Regular Wreath 2',
    slug: 'regular-wreath-2',
    base_price: 1800,
    images: [{ url: '/image4.jpg', alt: 'Regular 2', isPrimary: true }],
    availability: { inStock: true },
    active: true,
    featured: false,
  },
  {
    id: 'out-of-stock',
    name_cs: 'Nedostupný věnec',
    name_en: 'Out of Stock Wreath',
    slug: 'out-of-stock-wreath',
    base_price: 1200,
    images: [],
    availability: { inStock: false },
    active: true,
    featured: false,
  },
];

describe('Enhanced Random Products API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset Math.random to ensure predictable tests
    jest.spyOn(Math, 'random').mockReturnValue(0.5);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return random products with enhanced algorithm', async () => {
    const request = new NextRequest('http://localhost:3000/api/products/random?count=3&locale=en');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.products).toHaveLength(3);

    // Should exclude out-of-stock products
    const productIds = data.products.map((p: any) => p.id);
    expect(productIds).not.toContain('out-of-stock');
  });

  it('should prioritize featured products when available', async () => {
    // Mock Math.random to favor featured products
    jest.spyOn(Math, 'random').mockReturnValue(0.6); // > 0.7 threshold

    const request = new NextRequest('http://localhost:3000/api/products/random?count=2&locale=cs');
    const response = await GET(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.products).toHaveLength(2);

    // At least one should be featured (due to our algorithm)
    const hasFeatured = data.products.some((p: any) => p.featured);
    expect(hasFeatured).toBe(true);
  });

  it('should handle empty product list gracefully', async () => {
    // Mock empty response
    const { createServerClient } = require('@/lib/supabase/server');
    createServerClient.mockReturnValue({
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              limit: jest.fn(() => ({
                data: [],
                error: null,
              })),
            })),
          })),
        })),
      })),
    });

    const request = new NextRequest('http://localhost:3000/api/products/random?count=3&locale=en');
    const response = await GET(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.products).toHaveLength(0);
  });

  it('should respect count parameter limits', async () => {
    const request = new NextRequest('http://localhost:3000/api/products/random?count=15&locale=en');
    const response = await GET(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    // Should be limited to max 10 products
    expect(data.products.length).toBeLessThanOrEqual(10);
  });

  it('should transform products to correct interface', async () => {
    const request = new NextRequest('http://localhost:3000/api/products/random?count=1&locale=cs');
    const response = await GET(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.products).toHaveLength(1);

    const product = data.products[0];
    expect(product).toHaveProperty('id');
    expect(product).toHaveProperty('name');
    expect(product.name).toHaveProperty('cs');
    expect(product.name).toHaveProperty('en');
    expect(product).toHaveProperty('slug');
    expect(product).toHaveProperty('basePrice');
    expect(product).toHaveProperty('images');
    expect(product).toHaveProperty('availability');
    expect(product).toHaveProperty('seoMetadata');
  });

  it('should handle database errors gracefully', async () => {
    // Mock database error
    const { createServerClient } = require('@/lib/supabase/server');
    createServerClient.mockReturnValue({
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              limit: jest.fn(() => ({
                data: null,
                error: { message: 'Database connection failed' },
              })),
            })),
          })),
        })),
      })),
    });

    const request = new NextRequest('http://localhost:3000/api/products/random?count=3&locale=en');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Failed to fetch products');
  });

  it('should use default values for missing parameters', async () => {
    const request = new NextRequest('http://localhost:3000/api/products/random');
    const response = await GET(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    // Should default to count=3
    expect(data.products.length).toBeLessThanOrEqual(3);
  });

  it('should filter out inactive products', async () => {
    // Add inactive product to mock data
    const mockWithInactive = [
      ...mockProducts,
      {
        id: 'inactive-product',
        name_cs: 'Neaktivní věnec',
        name_en: 'Inactive Wreath',
        slug: 'inactive-wreath',
        base_price: 1000,
        images: [],
        availability: { inStock: true },
        active: false, // This should be filtered out
        featured: false,
      },
    ];

    const { createServerClient } = require('@/lib/supabase/server');
    createServerClient.mockReturnValue({
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              limit: jest.fn(() => ({
                data: mockWithInactive,
                error: null,
              })),
            })),
          })),
        })),
      })),
    });

    const request = new NextRequest('http://localhost:3000/api/products/random?count=5&locale=en');
    const response = await GET(request);
    const data = await response.json();

    expect(data.success).toBe(true);

    // Should not include inactive product
    const productIds = data.products.map((p: any) => p.id);
    expect(productIds).not.toContain('inactive-product');
  });
});
