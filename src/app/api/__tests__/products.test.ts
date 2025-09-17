import { NextRequest } from "next/server";
import { GET } from "../products/route";

// Mock Supabase client
const mockSupabaseClient = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        order: jest.fn(() => ({
          range: jest.fn(() => ({
            data: [
              {
                id: "1",
                name_cs: "Pohřební věnec",
                name_en: "Funeral Wreath",
                description_cs: "Krásný pohřební věnec",
                description_en: "Beautiful funeral wreath",
                slug: "funeral-wreath",
                base_price: 1500,
                category: {
                  id: "cat1",
                  name_cs: "Věnce",
                  name_en: "Wreaths",
                  slug: "wreaths",
                },
                images: [
                  {
                    id: "img1",
                    url: "/test-image.jpg",
                    alt: "Test image",
                    is_primary: true,
                    sort_order: 0,
                  },
                ],
                availability: {
                  in_stock: true,
                  stock_quantity: 10,
                },
                active: true,
                featured: false,
                created_at: "2024-01-01T00:00:00Z",
                updated_at: "2024-01-01T00:00:00Z",
              },
            ],
            error: null,
            count: 1,
          })),
        })),
      })),
    })),
  })),
};

jest.mock("@/lib/supabase/server", () => ({
  createClient: () => mockSupabaseClient,
}));

describe("/api/products", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns products with default pagination", async () => {
    const request = new NextRequest("http://localhost:3000/api/products");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.products).toHaveLength(1);
    expect(data.products[0].name.cs).toBe("Pohřební věnec");
    expect(data.pagination).toBeDefined();
    expect(data.pagination.total).toBe(1);
  });

  it("handles pagination parameters", async () => {
    const request = new NextRequest("http://localhost:3000/api/products?page=2&limit=5");
    await GET(request);

    expect(mockSupabaseClient.from().select().eq().order().range).toHaveBeenCalledWith(5, 9);
  });

  it("filters products by category", async () => {
    const request = new NextRequest("http://localhost:3000/api/products?category=wreaths");
    await GET(request);

    expect(mockSupabaseClient.from().select().eq).toHaveBeenCalledWith("category.slug", "wreaths");
  });

  it("handles search query", async () => {
    const mockSearchResult = {
      ...mockSupabaseClient.from().select().eq().order().range(),
      textSearch: jest.fn(() => ({
        data: [],
        error: null,
        count: 0,
      })),
    };

    mockSupabaseClient.from = jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            range: jest.fn(() => mockSearchResult),
          })),
        })),
      })),
    }));

    const request = new NextRequest("http://localhost:3000/api/products?search=wreath");
    const response = await GET(request);

    expect(response.status).toBe(200);
  });

  it("handles database errors gracefully", async () => {
    mockSupabaseClient.from = jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            range: jest.fn(() => ({
              data: null,
              error: { message: "Database error" },
              count: null,
            })),
          })),
        })),
      })),
    })) as any;

    const request = new NextRequest("http://localhost:3000/api/products");
    const response = await GET(request);

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBeDefined();
  });

  it("validates pagination limits", async () => {
    const request = new NextRequest("http://localhost:3000/api/products?limit=200");
    await GET(request);

    // Should cap limit at 50
    expect(mockSupabaseClient.from().select().eq().order().range).toHaveBeenCalledWith(0, 49);
  });

  it("handles invalid page numbers", async () => {
    const request = new NextRequest("http://localhost:3000/api/products?page=0");
    await GET(request);

    // Should default to page 1
    expect(mockSupabaseClient.from().select().eq().order().range).toHaveBeenCalledWith(0, 19);
  });

  it("returns products in correct format", async () => {
    const request = new NextRequest("http://localhost:3000/api/products");
    const response = await GET(request);
    const data = await response.json();

    const product = data.products[0];
    expect(product).toHaveProperty("id");
    expect(product).toHaveProperty("name");
    expect(product.name).toHaveProperty("cs");
    expect(product.name).toHaveProperty("en");
    expect(product).toHaveProperty("basePrice");
    expect(product).toHaveProperty("category");
    expect(product).toHaveProperty("images");
    expect(product).toHaveProperty("availability");
  });
});
