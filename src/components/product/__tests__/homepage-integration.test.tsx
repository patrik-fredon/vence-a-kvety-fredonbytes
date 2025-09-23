/**
 * Integration test for homepage product teasers functionality
 * Tests the complete flow from API to component rendering
 */

import { render, screen, waitFor } from "@testing-library/react";
import { RandomProductTeasers } from "../RandomProductTeasers";

// Mock next-intl
jest.mock("next-intl", () => ({
  useTranslations: jest.fn(() => (key: string) => {
    const translations: Record<string, string> = {
      "featuredProducts.title": "Featured Funeral Wreaths",
      "featuredProducts.viewAll": "View All Wreaths",
      tryAgain: "Try Again",
      noProducts: "No products are currently available.",
    };
    return translations[key] || key;
  }),
}));

// Mock cart context
jest.mock("@/lib/cart/context", () => ({
  useCart: jest.fn(() => ({
    addToCart: jest.fn().mockResolvedValue(true),
  })),
}));

// Mock ProductTeaser component
jest.mock("../ProductTeaser", () => {
  return function MockProductTeaser({ product, onAddToCart, loading }: any) {
    return (
      <div data-testid={`product-teaser-${product.id}`}>
        <h3>{product.name.en}</h3>
        <span>{product.basePrice}</span>
        <button
          onClick={() => onAddToCart(product.id)}
          disabled={loading}
          data-testid={`add-to-cart-${product.id}`}
        >
          {loading ? "Adding..." : "Add to Cart"}
        </button>
      </div>
    );
  };
});

// Mock LoadingSpinner
jest.mock("@/components/ui/LoadingSpinner", () => {
  return function MockLoadingSpinner() {
    return <div data-testid="loading-spinner">Loading...</div>;
  };
});

const mockProducts = [
  {
    id: "product-1",
    name: { cs: "Věnec 1", en: "Wreath 1" },
    slug: "wreath-1",
    basePrice: 1500,
    images: [{ url: "/image1.jpg", alt: "Wreath 1", isPrimary: true }],
    availability: { inStock: true },
    featured: true,
    active: true,
    seoMetadata: { title: { cs: "", en: "" }, description: { cs: "", en: "" } },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "product-2",
    name: { cs: "Věnec 2", en: "Wreath 2" },
    slug: "wreath-2",
    basePrice: 2000,
    images: [],
    availability: { inStock: true },
    featured: false,
    active: true,
    seoMetadata: { title: { cs: "", en: "" }, description: { cs: "", en: "" } },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "product-3",
    name: { cs: "Věnec 3", en: "Wreath 3" },
    slug: "wreath-3",
    basePrice: 2500,
    images: [{ url: "/image3.jpg", alt: "Wreath 3", isPrimary: true }],
    availability: { inStock: true },
    featured: false,
    active: true,
    seoMetadata: { title: { cs: "", en: "" }, description: { cs: "", en: "" } },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Mock fetch
global.fetch = jest.fn();

describe("Homepage Product Teasers Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          products: mockProducts,
        }),
    });
  });

  it("should render the complete homepage product teaser section", async () => {
    render(<RandomProductTeasers locale="en" count={3} />);

    // Should show loading initially
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();

    // Wait for products to load
    await waitFor(() => {
      expect(screen.getByText("Featured Funeral Wreaths")).toBeInTheDocument();
    });

    // Should display all 3 products
    expect(screen.getByTestId("product-teaser-product-1")).toBeInTheDocument();
    expect(screen.getByTestId("product-teaser-product-2")).toBeInTheDocument();
    expect(screen.getByTestId("product-teaser-product-3")).toBeInTheDocument();

    // Should show product names
    expect(screen.getByText("Wreath 1")).toBeInTheDocument();
    expect(screen.getByText("Wreath 2")).toBeInTheDocument();
    expect(screen.getByText("Wreath 3")).toBeInTheDocument();

    // Should show "View All" link
    expect(screen.getByText("View All Wreaths")).toBeInTheDocument();
  });

  it("should call the correct API endpoint with parameters", async () => {
    render(<RandomProductTeasers locale="cs" count={5} />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/products/random?count=5&locale=cs", {
        cache: "no-store",
      });
    });
  });

  it("should handle product rotation on refresh", async () => {
    const { rerender } = render(<RandomProductTeasers locale="en" count={3} />);

    await waitFor(() => {
      expect(screen.getByText("Featured Funeral Wreaths")).toBeInTheDocument();
    });

    // Mock different products for second call
    const newMockProducts = [
      {
        ...mockProducts[0],
        id: "product-4",
        name: { cs: "Nový věnec", en: "New Wreath" },
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          products: newMockProducts,
        }),
    });

    // Rerender component (simulating page refresh)
    rerender(<RandomProductTeasers locale="en" count={3} />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  it("should handle API errors gracefully", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
    });

    render(<RandomProductTeasers locale="en" count={3} />);

    await waitFor(() => {
      expect(screen.getByText("Failed to load products")).toBeInTheDocument();
      expect(screen.getByText("Try Again")).toBeInTheDocument();
    });
  });

  it("should show retry functionality", async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            products: mockProducts,
          }),
      });

    render(<RandomProductTeasers locale="en" count={3} />);

    // Should show error first
    await waitFor(() => {
      expect(screen.getByText("Failed to load products")).toBeInTheDocument();
    });

    // Click retry
    const retryButton = screen.getByText("Try Again");
    retryButton.click();

    // Should show products after retry
    await waitFor(() => {
      expect(screen.getByText("Featured Funeral Wreaths")).toBeInTheDocument();
      expect(screen.getByTestId("product-teaser-product-1")).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it("should handle empty product list", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          products: [],
        }),
    });

    render(<RandomProductTeasers locale="en" count={3} />);

    await waitFor(() => {
      expect(screen.getByText("No products are currently available.")).toBeInTheDocument();
    });
  });

  it("should use cache: no-store for fresh data on each request", async () => {
    render(<RandomProductTeasers locale="en" count={3} />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/products/random?count=3&locale=en", {
        cache: "no-store",
      });
    });
  });
});
