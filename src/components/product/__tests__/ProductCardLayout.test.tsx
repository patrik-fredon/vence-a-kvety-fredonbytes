import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { ProductCardLayout } from "../ProductCardLayout";
import type { Product } from "@/types/product";

// Mock product data
const mockProduct: Product = {
  id: "test-product-1",
  nameCs: "Testovací věnec",
  nameEn: "Test Wreath",
  slug: "test-wreath",
  descriptionCs: "Testovací popis",
  descriptionEn: "Test description",
  basePrice: 1500,
  categoryId: "test-category",
  images: [
    {
      id: "img-1",
      url: "/test-image.jpg",
      alt: "Test image",
      isPrimary: true,
      sortOrder: 1,
    },
  ],
  customizationOptions: [],
  availability: {
    inStock: true,
    stockQuantity: 10,
  },
  seoMetadata: {
    title: "Test Product",
    description: "Test description",
    keywords: ["test"],
  },
  active: true,
  featured: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  name: {
    cs: "Testovací věnec",
    en: "Test Wreath",
  },
};

const messages = {
  product: {
    addToCart: "Add to Cart",
    customize: "Customize",
    quickView: "Quick View",
    featured: "Featured",
    inStock: "In Stock",
    outOfStock: "Out of Stock",
    limitedStock: "Limited Stock",
    availability: "Availability",
  },
  currency: {
    format: "{amount} CZK",
  },
};

const renderWithIntl = (component: React.ReactElement) => {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      {component}
    </NextIntlClientProvider>
  );
};

describe("ProductCardLayout", () => {
  it("renders product name correctly", () => {
    renderWithIntl(
      <ProductCardLayout product={mockProduct} locale="en" variant="grid" />
    );

    expect(screen.getByText("Test Wreath")).toBeInTheDocument();
  });

  it("renders with grid variant styling", () => {
    renderWithIntl(
      <ProductCardLayout product={mockProduct} locale="en" variant="grid" />
    );

    const article = screen.getByRole("article");
    expect(article).toHaveClass("h-96"); // Grid variant should have increased height
  });

  it("renders with teaser variant styling", () => {
    renderWithIntl(
      <ProductCardLayout product={mockProduct} locale="en" variant="teaser" />
    );

    const article = screen.getByRole("article");
    expect(article).toHaveClass("h-80"); // Teaser variant should have smaller height
  });

  it("renders with list variant styling", () => {
    renderWithIntl(
      <ProductCardLayout product={mockProduct} locale="en" variant="list" />
    );

    const article = screen.getByRole("article");
    expect(article).toHaveClass("flex-row"); // List variant should be horizontal
  });

  it("shows add to cart button for products without customizations", () => {
    renderWithIntl(
      <ProductCardLayout product={mockProduct} locale="en" variant="teaser" />
    );

    expect(screen.getByText("Add to Cart")).toBeInTheDocument();
  });

  it("shows customize button for products with customizations", () => {
    const productWithCustomizations = {
      ...mockProduct,
      customizationOptions: [
        {
          id: "size",
          type: "size" as const,
          name: { cs: "Velikost", en: "Size" },
          choices: [],
          required: true,
        },
      ],
    };

    renderWithIntl(
      <ProductCardLayout
        product={productWithCustomizations}
        locale="en"
        variant="teaser"
      />
    );

    expect(screen.getByText("Customize")).toBeInTheDocument();
  });

  it("displays price correctly", () => {
    renderWithIntl(
      <ProductCardLayout product={mockProduct} locale="en" variant="grid" />
    );

    expect(screen.getByText("1,500 CZK")).toBeInTheDocument();
  });

  it("shows availability status", () => {
    renderWithIntl(
      <ProductCardLayout product={mockProduct} locale="en" variant="grid" />
    );

    expect(screen.getByText("In Stock")).toBeInTheDocument();
  });

  it("shows out of stock status for unavailable products", () => {
    const outOfStockProduct = {
      ...mockProduct,
      availability: {
        inStock: false,
      },
    };

    renderWithIntl(
      <ProductCardLayout product={outOfStockProduct} locale="en" variant="grid" />
    );

    expect(screen.getByText("Out of Stock")).toBeInTheDocument();
  });

  it("renders featured badge when product is featured", () => {
    const featuredProduct = {
      ...mockProduct,
      featured: true,
    };

    renderWithIntl(
      <ProductCardLayout
        product={featuredProduct}
        locale="en"
        variant="grid"
        featured={true}
      />
    );

    expect(screen.getByText("Featured")).toBeInTheDocument();
  });
});
