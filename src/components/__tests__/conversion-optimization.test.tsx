/**
 * Conversion Optimization Elements Test Suite
 *
 * This test suite validates:
 * - CTA buttons display correctly with new text
 * - Trust-building elements and value propositions
 * - User journey from content to conversion points
 *
 * Requirements: 6.1, 6.2, 6.3
 */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { ProductCard } from "@/components/product/ProductCard";
import type { Product } from "@/types/product";
import csMessages from "../../../messages/cs.json";
import enMessages from "../../../messages/en.json";

// Mock product data for testing
const mockProduct: Product = {
  id: "test-product-1",
  slug: "test-wreath",
  name: {
    cs: "Testovací věnec",
    en: "Test Wreath",
  },
  description: {
    cs: "Krásný testovací věnec",
    en: "Beautiful test wreath",
  },
  basePrice: 2500,
  images: [
    {
      id: "img-1",
      url: "/test-image.jpg",
      alt: "Test wreath image",
      isPrimary: true,
      sortOrder: 1,
    },
  ],
  availability: {
    inStock: true,
    stockQuantity: 10,
  },
  featured: true,
  category: {
    id: "cat-1",
    slug: "hearts",
    name: {
      cs: "Srdce",
      en: "Hearts",
    },
    description: {
      cs: "Smuteční věnce ve tvaru srdce",
      en: "Heart-shaped funeral wreaths",
    },
    imageUrl: "/category-hearts.jpg",
    parentId: null,
    sortOrder: 1,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  customizationOptions: [],
  seoTitle: {
    cs: "Testovací věnec SEO",
    en: "Test Wreath SEO",
  },
  seoDescription: {
    cs: "SEO popis testovacího věnce",
    en: "SEO description for test wreath",
  },
  active: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Test wrapper component
const TestWrapper = ({
  children,
  locale = "cs",
}: {
  children: React.ReactNode;
  locale?: string;
}) => {
  const messages = locale === "cs" ? csMessages : enMessages;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
};

describe("Conversion Optimization Elements", () => {
  describe("CTA Buttons Display and Functionality", () => {
    test('should display "Add to Cart" CTA with correct Czech text', () => {
      const mockAddToCart = jest.fn();

      render(
        <TestWrapper locale="cs">
          <ProductCard product={mockProduct} locale="cs" onAddToCart={mockAddToCart} />
        </TestWrapper>
      );

      // Check that the Add to Cart button displays with correct Czech text
      const addToCartButton = screen.getByRole("button", { name: /přidat do košíku/i });
      expect(addToCartButton).toBeInTheDocument();
      expect(addToCartButton).toHaveTextContent("Přidat do košíku");
    });

    test('should display "Add to Cart" CTA with correct English text', () => {
      const mockAddToCart = jest.fn();

      render(
        <TestWrapper locale="en">
          <ProductCard product={mockProduct} locale="en" onAddToCart={mockAddToCart} />
        </TestWrapper>
      );

      // Check that the Add to Cart button displays with correct English text
      const addToCartButton = screen.getByRole("button", { name: /add to cart/i });
      expect(addToCartButton).toBeInTheDocument();
      expect(addToCartButton).toHaveTextContent("Add to Cart");
    });

    test("should call onAddToCart when CTA button is clicked", () => {
      const mockAddToCart = jest.fn();

      render(
        <TestWrapper locale="cs">
          <ProductCard product={mockProduct} locale="cs" onAddToCart={mockAddToCart} />
        </TestWrapper>
      );

      const addToCartButton = screen.getByRole("button", { name: /přidat do košíku/i });
      fireEvent.click(addToCartButton);

      expect(mockAddToCart).toHaveBeenCalledWith(mockProduct);
    });

    test('should display "Customize" CTA button', () => {
      render(
        <TestWrapper locale="cs">
          <ProductCard product={mockProduct} locale="cs" />
        </TestWrapper>
      );

      // Check for customize button (appears on hover)
      const productCard = screen.getByRole("article");
      fireEvent.mouseEnter(productCard);

      const customizeButton = screen.getByRole("button", { name: /přizpůsobit/i });
      expect(customizeButton).toBeInTheDocument();
    });

    test("should disable Add to Cart when product is out of stock", () => {
      const outOfStockProduct = {
        ...mockProduct,
        availability: {
          inStock: false,
          stockQuantity: 0,
        },
      };

      render(
        <TestWrapper locale="cs">
          <ProductCard product={outOfStockProduct} locale="cs" onAddToCart={jest.fn()} />
        </TestWrapper>
      );

      // Should not show Add to Cart button when out of stock
      const addToCartButton = screen.queryByRole("button", { name: /přidat do košíku/i });
      expect(addToCartButton).not.toBeInTheDocument();

      // Should show out of stock status
      expect(screen.getByText("Není skladem")).toBeInTheDocument();
    });
  });

  describe("Trust-Building Elements", () => {
    test("should display availability status as trust signal", () => {
      render(
        <TestWrapper locale="cs">
          <ProductCard product={mockProduct} locale="cs" />
        </TestWrapper>
      );

      // Check availability badge
      const availabilityBadge = screen.getByText("Skladem");
      expect(availabilityBadge).toBeInTheDocument();
      expect(availabilityBadge).toHaveClass("text-green-600", "bg-green-50");
    });

    test("should display limited stock warning as urgency signal", () => {
      const limitedStockProduct = {
        ...mockProduct,
        availability: {
          inStock: true,
          stockQuantity: 3,
        },
      };

      render(
        <TestWrapper locale="cs">
          <ProductCard product={limitedStockProduct} locale="cs" />
        </TestWrapper>
      );

      const limitedStockBadge = screen.getByText("Omezené množství");
      expect(limitedStockBadge).toBeInTheDocument();
      expect(limitedStockBadge).toHaveClass("text-orange-600", "bg-orange-50");
    });

    test("should display featured badge as quality signal", () => {
      render(
        <TestWrapper locale="cs">
          <ProductCard product={mockProduct} locale="cs" />
        </TestWrapper>
      );

      const featuredBadge = screen.getByText("⭐ Featured");
      expect(featuredBadge).toBeInTheDocument();
      expect(featuredBadge).toHaveClass("bg-primary-600", "text-white");
    });

    test("should display product category as context", () => {
      render(
        <TestWrapper locale="cs">
          <ProductCard product={mockProduct} locale="cs" />
        </TestWrapper>
      );

      expect(screen.getByText("Srdce")).toBeInTheDocument();
    });

    test("should display price clearly formatted", () => {
      render(
        <TestWrapper locale="cs">
          <ProductCard product={mockProduct} locale="cs" />
        </TestWrapper>
      );

      // Check price formatting
      const priceElement = screen.getByText("2 500 Kč");
      expect(priceElement).toBeInTheDocument();
      expect(priceElement).toHaveClass("text-lg", "font-semibold", "text-primary-700");
    });
  });

  describe("Value Propositions", () => {
    test("should display product name as value proposition", () => {
      render(
        <TestWrapper locale="cs">
          <ProductCard product={mockProduct} locale="cs" />
        </TestWrapper>
      );

      const productTitle = screen.getByRole("heading", { level: 3 });
      expect(productTitle).toHaveTextContent("Testovací věnec");
      expect(productTitle).toHaveClass("font-elegant", "text-lg", "font-semibold");
    });

    test("should display product description as benefit", () => {
      render(
        <TestWrapper locale="cs">
          <ProductCard product={mockProduct} locale="cs" />
        </TestWrapper>
      );

      expect(screen.getByText("Krásný testovací věnec")).toBeInTheDocument();
    });

    test("should provide accessible product information", () => {
      render(
        <TestWrapper locale="cs">
          <ProductCard product={mockProduct} locale="cs" />
        </TestWrapper>
      );

      // Check ARIA labels and roles
      const article = screen.getByRole("article");
      expect(article).toHaveAttribute("aria-labelledby", "product-test-product-1-title");

      const availabilityStatus = screen.getByRole("status");
      expect(availabilityStatus).toHaveAttribute("aria-label", "Dostupnost: Skladem");
    });
  });

  describe("User Journey Validation", () => {
    test("should provide clear path to product customization", () => {
      render(
        <TestWrapper locale="cs">
          <ProductCard product={mockProduct} locale="cs" />
        </TestWrapper>
      );

      // Check product title link
      const titleLink = screen.getByRole("link", { name: /testovací věnec/i });
      expect(titleLink).toHaveAttribute("href", "/cs/products/test-wreath");

      // Check customize button link on hover
      const productCard = screen.getByRole("article");
      fireEvent.mouseEnter(productCard);

      const customizeLink = screen.getByRole("link");
      expect(customizeLink.closest("a")).toHaveAttribute("href", "/cs/products/test-wreath");
    });

    test("should provide immediate add to cart functionality", () => {
      const mockAddToCart = jest.fn();

      render(
        <TestWrapper locale="cs">
          <ProductCard product={mockProduct} locale="cs" onAddToCart={mockAddToCart} />
        </TestWrapper>
      );

      // Test both desktop and mobile add to cart buttons
      const addToCartButtons = screen.getAllByRole("button", { name: /přidat do košíku|^\+$/i });
      expect(addToCartButtons.length).toBeGreaterThan(0);

      // Click the first available button
      fireEvent.click(addToCartButtons[0]);
      expect(mockAddToCart).toHaveBeenCalledWith(mockProduct);
    });

    test("should handle hover interactions for enhanced UX", () => {
      render(
        <TestWrapper locale="cs">
          <ProductCard product={mockProduct} locale="cs" />
        </TestWrapper>
      );

      const productCard = screen.getByRole("article");

      // Test hover state
      fireEvent.mouseEnter(productCard);

      // Should show quick actions overlay
      const customizeButton = screen.getByRole("button", { name: /přizpůsobit/i });
      expect(customizeButton).toBeInTheDocument();

      fireEvent.mouseLeave(productCard);
    });

    test("should provide responsive design for mobile users", () => {
      render(
        <TestWrapper locale="cs">
          <ProductCard product={mockProduct} locale="cs" onAddToCart={jest.fn()} />
        </TestWrapper>
      );

      // Check for mobile-specific elements
      const mobileAddButton = screen.getByRole("button", { name: "+" });
      expect(mobileAddButton).toHaveClass("sm:hidden");

      // Check for desktop-specific elements
      const desktopAddButton = screen.getByRole("button", { name: "Přidat do košíku" });
      expect(desktopAddButton.closest("div")).toHaveClass("hidden", "sm:block");
    });
  });

  describe("Conversion Flow Integration", () => {
    test("should maintain consistent messaging across languages", () => {
      const { rerender } = render(
        <TestWrapper locale="cs">
          <ProductCard product={mockProduct} locale="cs" onAddToCart={jest.fn()} />
        </TestWrapper>
      );

      // Check Czech version
      expect(screen.getByText("Přidat do košíku")).toBeInTheDocument();
      expect(screen.getByText("Skladem")).toBeInTheDocument();

      // Switch to English
      rerender(
        <TestWrapper locale="en">
          <ProductCard product={mockProduct} locale="en" onAddToCart={jest.fn()} />
        </TestWrapper>
      );

      // Check English version
      expect(screen.getByText("Add to Cart")).toBeInTheDocument();
      expect(screen.getByText("In Stock")).toBeInTheDocument();
    });

    test("should handle error states gracefully", () => {
      const productWithoutImage = {
        ...mockProduct,
        images: [],
      };

      render(
        <TestWrapper locale="cs">
          <ProductCard product={productWithoutImage} locale="cs" />
        </TestWrapper>
      );

      // Should still render product information even without image
      expect(screen.getByText("Testovací věnec")).toBeInTheDocument();
      expect(screen.getByText("2 500 Kč")).toBeInTheDocument();
    });

    test("should provide clear visual hierarchy for conversion elements", () => {
      render(
        <TestWrapper locale="cs">
          <ProductCard product={mockProduct} locale="cs" onAddToCart={jest.fn()} />
        </TestWrapper>
      );

      // Check visual hierarchy classes
      const title = screen.getByRole("heading", { level: 3 });
      expect(title).toHaveClass("font-elegant", "text-lg", "font-semibold", "text-primary-800");

      const price = screen.getByText("2 500 Kč");
      expect(price).toHaveClass("text-lg", "font-semibold", "text-primary-700");

      const addToCartButton = screen.getByRole("button", { name: "Přidat do košíku" });
      expect(addToCartButton).toHaveClass("w-full"); // Full width for prominence
    });
  });
});
