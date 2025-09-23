import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useTranslations } from "next-intl";
import type { Product } from "@/types/product";
import { ProductTeaser } from "../ProductTeaser";

// Mock next-intl
jest.mock("next-intl", () => ({
  useTranslations: jest.fn(),
}));

// Mock Next.js components
jest.mock("next/link", () => {
  return function MockLink({ children, href, ...props }: any) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

jest.mock("next/image", () => {
  return function MockImage({ src, alt, ...props }: any) {
    return <img src={src} alt={alt} {...props} />;
  };
});

// Mock Heroicons
jest.mock("@heroicons/react/24/outline", () => ({
  ShoppingCartIcon: () => <svg data-testid="cart-icon" />,
}));

const mockTranslations = {
  inStock: "In Stock",
  outOfStock: "Out of Stock",
  addToCart: "Add to Cart",
};

const mockProduct: Product = {
  id: "test-product-1",
  name: {
    cs: "Testovací věnec",
    en: "Test Wreath",
  },
  slug: "test-wreath",
  basePrice: 1500,
  images: [
    {
      id: "img-1",
      url: "/test-image.jpg",
      alt: "Test wreath image",
      isPrimary: true,
      sortOrder: 0,
    },
  ],
  availability: {
    inStock: true,
  },
  seoMetadata: {
    title: { cs: "", en: "" },
    description: { cs: "", en: "" },
  },
  active: true,
  featured: false,
  customizationOptions: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("ProductTeaser", () => {
  const mockOnAddToCart = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useTranslations as jest.Mock).mockReturnValue(
      (key: string) => mockTranslations[key as keyof typeof mockTranslations] || key
    );
  });

  it("renders product information correctly for Czech locale", () => {
    render(<ProductTeaser product={mockProduct} locale="cs" onAddToCart={mockOnAddToCart} />);

    expect(screen.getByText("Testovací věnec")).toBeInTheDocument();
    expect(screen.getByText("1 500 Kč")).toBeInTheDocument();
    expect(screen.getByText("In Stock")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add to cart/i })).toBeInTheDocument();
  });

  it("renders product information correctly for English locale", () => {
    render(<ProductTeaser product={mockProduct} locale="en" onAddToCart={mockOnAddToCart} />);

    expect(screen.getByText("Test Wreath")).toBeInTheDocument();
    expect(screen.getByText("CZK 1,500")).toBeInTheDocument();
  });

  it("displays primary image when available", () => {
    render(<ProductTeaser product={mockProduct} locale="cs" onAddToCart={mockOnAddToCart} />);

    const image = screen.getByAltText("Test wreath image");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "/test-image.jpg");
  });

  it("displays fallback emoji when no image is available", () => {
    const productWithoutImage = {
      ...mockProduct,
      images: [],
    };

    render(
      <ProductTeaser product={productWithoutImage} locale="cs" onAddToCart={mockOnAddToCart} />
    );

    expect(screen.getByText("🌹")).toBeInTheDocument();
  });

  it("shows out of stock status correctly", () => {
    const outOfStockProduct = {
      ...mockProduct,
      availability: {
        inStock: false,
      },
    };

    render(<ProductTeaser product={outOfStockProduct} locale="cs" onAddToCart={mockOnAddToCart} />);

    expect(screen.getByText("Out of Stock")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add to cart/i })).toBeDisabled();
  });

  it("calls onAddToCart when add to cart button is clicked", async () => {
    render(<ProductTeaser product={mockProduct} locale="cs" onAddToCart={mockOnAddToCart} />);

    const addToCartButton = screen.getByRole("button", { name: /add to cart/i });
    fireEvent.click(addToCartButton);

    expect(mockOnAddToCart).toHaveBeenCalledWith("test-product-1");
  });

  it("disables add to cart button when loading", () => {
    render(
      <ProductTeaser
        product={mockProduct}
        locale="cs"
        onAddToCart={mockOnAddToCart}
        loading={true}
      />
    );

    const addToCartButton = screen.getByRole("button", { name: /add to cart/i });
    expect(addToCartButton).toBeDisabled();
  });

  it("creates correct product detail link", () => {
    render(<ProductTeaser product={mockProduct} locale="cs" onAddToCart={mockOnAddToCart} />);

    const productLinks = screen.getAllByRole("link");
    const detailLink = productLinks.find(
      (link) => link.getAttribute("href") === "/cs/products/test-wreath"
    );

    expect(detailLink).toBeInTheDocument();
  });

  it("handles missing onAddToCart prop gracefully", () => {
    render(<ProductTeaser product={mockProduct} locale="cs" />);

    const addToCartButton = screen.getByRole("button", { name: /add to cart/i });

    // Should not throw error when clicked without onAddToCart
    expect(() => fireEvent.click(addToCartButton)).not.toThrow();
  });

  it("applies hover effects and transitions", () => {
    render(<ProductTeaser product={mockProduct} locale="cs" onAddToCart={mockOnAddToCart} />);

    const container = screen.getByText("Testovací věnec").closest(".bg-white");
    expect(container).toHaveClass("hover:shadow-memorial", "transition-shadow");
  });
});
