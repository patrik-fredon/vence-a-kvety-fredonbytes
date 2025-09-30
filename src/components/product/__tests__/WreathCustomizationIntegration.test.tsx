import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useTranslations } from "next-intl";
import { ProductDetail } from "../ProductDetail";
import type { Product } from "@/types/product";

// Mock next-intl
jest.mock("next-intl", () => ({
  useTranslations: jest.fn(),
}));

// Mock cart context
jest.mock("@/lib/cart/context", () => ({
  useCart: jest.fn(),
}));

// Mock price calculation hook
jest.mock("@/lib/utils/usePriceCalculation", () => ({
  usePriceCalculation: jest.fn(),
}));

// Mock validation hook
jest.mock("@/lib/validation/hooks", () => ({
  useWreathValidation: jest.fn(),
}));

// Mock utilities
jest.mock("@/lib/utils", () => ({
  cn: jest.fn((...classes) => classes.filter(Boolean).join(" ")),
  formatPrice: jest.fn((price: number, locale: string, showSign?: boolean) => {
    const sign = showSign && price > 0 ? "+" : "";
    return locale === "cs" ? `${sign}${price} Kč` : `${sign}CZK ${price}`;
  }),
}));

const mockUseTranslations = useTranslations as jest.MockedFunction<typeof useTranslations>;
const mockUseCart = require("@/lib/cart/context").useCart as jest.MockedFunction<any>;
const mockUsePriceCalculation = require("@/lib/utils/usePriceCalculation").usePriceCalculation as jest.MockedFunction<any>;
const mockUseWreathValidation = require("@/lib/validation/hooks").useWreathValidation as jest.MockedFunction<any>;

describe("Wreath Customization Integration", () => {
  const mockAddToCart = jest.fn();
  const mockT = jest.fn((key: string) => key);

  const mockWreathProduct: Product = {
    id: "wreath-001",
    slug: "premium-wreath",
    name: { cs: "Prémiový věnec", en: "Premium Wreath" },
    description: { cs: "Krásný věnec", en: "Beautiful wreath" },
    basePrice: 1500,
    images: [
      {
        id: "img1",
        url: "/wreath.jpg",
        alt: { cs: "Věnec", en: "Wreath" },
        isPrimary: true,
      },
    ],
    category: {
      id: "wreaths",
      name: { cs: "Věnce", en: "Wreaths" },
      slug: "wreaths",
    },
    availability: {
      inStock: true,
      stock: 10,
      maxOrderQuantity: 5,
    },
    active: true,
    customizationOptions: [
      {
        id: "size",
        type: "size",
        name: { cs: "Velikost", en: "Size" },
        required: true,
        minSelections: 1,
        maxSelections: 1,
        choices: [
          {
            id: "size_120",
        value: "size_120",
            label: { cs: "120cm průměr", en: "120cm diameter" },
            priceModifier: 0,
            available: true,
          },
          {
            id: "size_150",
        value: "size_150",
            label: { cs: "150cm průměr", en: "150cm diameter" },
            priceModifier: 500,
            available: true,
          },
          {
            id: "size_180",
        value: "size_180",
            label: { cs: "180cm průměr", en: "180cm diameter" },
            priceModifier: 1000,
            available: true,
          },
        ],
      },
      {
        id: "ribbon",
        type: "ribbon",
        name: { cs: "Stuha", en: "Ribbon" },
        required: false,
        choices: [
          {
            id: "ribbon_yes",
        value: "ribbon_yes",
            label: { cs: "Ano, přidat stuhu", en: "Yes, add ribbon" },
            priceModifier: 0,
            available: true,
          },
        ],
      },
      {
        id: "ribbon_color",
        type: "ribbon_color",
        name: { cs: "Barva stuhy", en: "Ribbon Color" },
        required: false,
        choices: [
          {
            id: "color_black",
        value: "color_black",
            label: { cs: "Černá", en: "Black" },
            priceModifier: 0,
            available: true,
          },
          {
            id: "color_white",
        value: "color_white",
            label: { cs: "Bílá", en: "White" },
            priceModifier: 0,
            available: true,
          },
        ],
      },
      {
        id: "ribbon_text",
        type: "ribbon_text",
        name: { cs: "Text na stuze", en: "Ribbon Text" },
        required: false,
        choices: [
          {
            id: "text_sympathy",
        value: "text_sympathy",
            label: { cs: "S upřímnou soustrasti", en: "With sincere sympathy" },
            priceModifier: 50,
            available: true,
          },
          {
            id: "text_custom",
        value: "text_custom",
            label: { cs: "Vlastní text", en: "Custom text" },
            priceModifier: 100,
            available: true,
          },
        ],
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseTranslations.mockReturnValue(mockT);

    mockUseCart.mockReturnValue({
      addToCart: mockAddToCart,
      state: { items: [], totalItems: 0, totalPrice: 0 },
      removeFromCart: jest.fn(),
      updateQuantity: jest.fn(),
      clearCart: jest.fn(),
      isLoading: false,
    });

    mockUsePriceCalculation.mockReturnValue({
      totalPrice: 1500,
      totalModifier: 0,
      breakdown: [],
      basePrice: 1500,
    });

    mockUseWreathValidation.mockReturnValue({
      validateAll: jest.fn(() => ({ isValid: true, errors: [], warnings: [] })),
      validateSize: jest.fn(() => ({ isValid: true })),
      validateRibbonDependencies: jest.fn(() => ({ isValid: true, errors: [] })),
      validateCustomText: jest.fn(() => ({ errors: [], warnings: [] })),
      isValid: true,
      errors: [],
      warnings: [],
      hasRibbonSelected: false,
    });
  });

  it("should render wreath product with customization options", () => {
    render(<ProductDetail product={mockWreathProduct} locale="en" />);

    expect(screen.getByText("Premium Wreath")).toBeInTheDocument();
    expect(screen.getByText("Size")).toBeInTheDocument();
    expect(screen.getByText("120cm diameter")).toBeInTheDocument();
    expect(screen.getByText("150cm diameter")).toBeInTheDocument();
    expect(screen.getByText("180cm diameter")).toBeInTheDocument();
  });

  it("should show ribbon configurator when ribbon is selected", async () => {
    const user = userEvent.setup();

    render(<ProductDetail product={mockWreathProduct} locale="en" />);

    // Initially ribbon configurator should not be visible
    expect(screen.queryByText("Ribbon Color")).not.toBeInTheDocument();

    // Select ribbon option
    const ribbonCheckbox = screen.getByRole("checkbox", { name: /Yes, add ribbon/i });
    await user.click(ribbonCheckbox);

    // Ribbon configurator should now be visible
    await waitFor(() => {
      expect(screen.getByText("Ribbon Color")).toBeInTheDocument();
      expect(screen.getByText("Ribbon Text")).toBeInTheDocument();
    });
  });

  it("should update price when size is selected", async () => {
    const user = userEvent.setup();

    // Mock price calculation to return updated price
    mockUsePriceCalculation.mockReturnValue({
      totalPrice: 2000,
      totalModifier: 500,
      breakdown: [
        {
          optionId: "size",
          optionName: { cs: "Velikost", en: "Size" },
          totalModifier: 500,
          choices: [
            {
              choiceId: "size_150",
              label: { cs: "150cm průměr", en: "150cm diameter" },
              priceModifier: 500,
            },
          ],
        },
      ],
      basePrice: 1500,
    });

    render(<ProductDetail product={mockWreathProduct} locale="en" />);

    const size150Button = screen.getByRole("button", { name: /150cm diameter/i });
    await user.click(size150Button);

    // Price should be updated
    expect(screen.getByText("2000 Kč")).toBeInTheDocument();
  });

  it("should validate size selection before adding to cart", async () => {
    const user = userEvent.setup();

    // Mock validation to return error for missing size
    mockUseWreathValidation.mockReturnValue({
      validateAll: jest.fn(() => ({
        isValid: false,
        errors: ["Please select wreath size before adding to cart"],
        warnings: [],
      })),
      validateSize: jest.fn(() => ({
        isValid: false,
        error: "Please select wreath size before adding to cart",
      })),
      validateRibbonDependencies: jest.fn(() => ({ isValid: true, errors: [] })),
      validateCustomText: jest.fn(() => ({ errors: [], warnings: [] })),
      isValid: false,
      errors: ["Please select wreath size before adding to cart"],
      warnings: [],
      hasRibbonSelected: false,
    });

    render(<ProductDetail product={mockWreathProduct} locale="en" />);

    const addToCartButton = screen.getByRole("button", { name: /addToCart/i });
    await user.click(addToCartButton);

    // Should show validation error
    expect(screen.getByText("Please select wreath size before adding to cart")).toBeInTheDocument();
    expect(mockAddToCart).not.toHaveBeenCalled();
  });

  it("should validate ribbon dependencies when ribbon is selected", async () => {
    const user = userEvent.setup();

    // Mock validation to return error for missing ribbon color/text
    mockUseWreathValidation.mockReturnValue({
      validateAll: jest.fn(() => ({
        isValid: false,
        errors: [
          "Ribbon color selection is required when adding ribbon",
          "Ribbon text selection is required when adding ribbon",
        ],
        warnings: [],
      })),
      validateSize: jest.fn(() => ({ isValid: true })),
      validateRibbonDependencies: jest.fn(() => ({
        isValid: false,
        errors: [
          "Ribbon color selection is required when adding ribbon",
          "Ribbon text selection is required when adding ribbon",
        ],
      })),
      validateCustomText: jest.fn(() => ({ errors: [], warnings: [] })),
      isValid: false,
      errors: [
        "Ribbon color selection is required when adding ribbon",
        "Ribbon text selection is required when adding ribbon",
      ],
      warnings: [],
      hasRibbonSelected: true,
    });

    render(<ProductDetail product={mockWreathProduct} locale="en" />);

    // Select size first
    const size120Button = screen.getByRole("button", { name: /120cm diameter/i });
    await user.click(size120Button);

    // Select ribbon
    const ribbonCheckbox = screen.getByRole("checkbox", { name: /Yes, add ribbon/i });
    await user.click(ribbonCheckbox);

    // Try to add to cart
    const addToCartButton = screen.getByRole("button", { name: /addToCart/i });
    await user.click(addToCartButton);

    // Should show validation errors
    expect(screen.getByText("Ribbon color selection is required when adding ribbon")).toBeInTheDocument();
    expect(screen.getByText("Ribbon text selection is required when adding ribbon")).toBeInTheDocument();
    expect(mockAddToCart).not.toHaveBeenCalled();
  });

  it("should successfully add to cart with complete configuration", async () => {
    const user = userEvent.setup();

    // Mock successful validation
    mockUseWreathValidation.mockReturnValue({
      validateAll: jest.fn(() => ({ isValid: true, errors: [], warnings: [] })),
      validateSize: jest.fn(() => ({ isValid: true })),
      validateRibbonDependencies: jest.fn(() => ({ isValid: true, errors: [] })),
      validateCustomText: jest.fn(() => ({ errors: [], warnings: [] })),
      isValid: true,
      errors: [],
      warnings: [],
      hasRibbonSelected: true,
    });

    mockAddToCart.mockResolvedValue(true);

    render(<ProductDetail product={mockWreathProduct} locale="en" />);

    // Select size
    const size150Button = screen.getByRole("button", { name: /150cm diameter/i });
    await user.click(size150Button);

    // Select ribbon
    const ribbonCheckbox = screen.getByRole("checkbox", { name: /Yes, add ribbon/i });
    await user.click(ribbonCheckbox);

    // Wait for ribbon configurator to appear
    await waitFor(() => {
      expect(screen.getByText("Ribbon Color")).toBeInTheDocument();
    });

    // Select ribbon color
    const blackColorButton = screen.getByRole("button", { name: /Black/i });
    await user.click(blackColorButton);

    // Select ribbon text
    const sympathyTextButton = screen.getByRole("button", { name: /With sincere sympathy/i });
    await user.click(sympathyTextButton);

    // Add to cart
    const addToCartButton = screen.getByRole("button", { name: /addToCart/i });
    await user.click(addToCartButton);

    // Should successfully add to cart
    await waitFor(() => {
      expect(mockAddToCart).toHaveBeenCalledWith({
        productId: "wreath-001",
        quantity: 1,
        customizations: expect.arrayContaining([
          expect.objectContaining({ optionId: "size" }),
          expect.objectContaining({ optionId: "ribbon" }),
          expect.objectContaining({ optionId: "ribbon_color" }),
          expect.objectContaining({ optionId: "ribbon_text" }),
        ]),
      });
    });
  });

  it("should handle custom text input and validation", async () => {
    const user = userEvent.setup();

    render(<ProductDetail product={mockWreathProduct} locale="en" />);

    // Select size
    const size120Button = screen.getByRole("button", { name: /120cm diameter/i });
    await user.click(size120Button);

    // Select ribbon
    const ribbonCheckbox = screen.getByRole("checkbox", { name: /Yes, add ribbon/i });
    await user.click(ribbonCheckbox);

    // Wait for ribbon configurator
    await waitFor(() => {
      expect(screen.getByText("Ribbon Color")).toBeInTheDocument();
    });

    // Select ribbon color
    const blackColorButton = screen.getByRole("button", { name: /Black/i });
    await user.click(blackColorButton);

    // Select custom text option
    const customTextButton = screen.getByRole("button", { name: /Custom text/i });
    await user.click(customTextButton);

    // Should show textarea
    await waitFor(() => {
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    // Type custom text
    const textarea = screen.getByRole("textbox");
    await user.type(textarea, "Milovanému otci");

    // Should show character count
    expect(screen.getByText("15/50")).toBeInTheDocument();
  });

  it("should handle locale switching correctly", () => {
    const { rerender } = render(<ProductDetail product={mockWreathProduct} locale="en" />);

    expect(screen.getByText("Premium Wreath")).toBeInTheDocument();
    expect(screen.getByText("Size")).toBeInTheDocument();

    // Switch to Czech locale
    rerender(<ProductDetail product={mockWreathProduct} locale="cs" />);

    expect(screen.getByText("Prémiový věnec")).toBeInTheDocument();
    expect(screen.getByText("Velikost")).toBeInTheDocument();
  });

  it("should handle quantity changes with customizations", async () => {
    const user = userEvent.setup();

    render(<ProductDetail product={mockWreathProduct} locale="en" />);

    // Select size
    const size120Button = screen.getByRole("button", { name: /120cm diameter/i });
    await user.click(size120Button);

    // Change quantity
    const quantityInput = screen.getByRole("spinbutton");
    await user.clear(quantityInput);
    await user.type(quantityInput, "2");

    expect(quantityInput).toHaveValue(2);

    // Mock successful validation and add to cart
    mockUseWreathValidation.mockReturnValue({
      validateAll: jest.fn(() => ({ isValid: true, errors: [], warnings: [] })),
      validateSize: jest.fn(() => ({ isValid: true })),
      validateRibbonDependencies: jest.fn(() => ({ isValid: true, errors: [] })),
      validateCustomText: jest.fn(() => ({ errors: [], warnings: [] })),
      isValid: true,
      errors: [],
      warnings: [],
      hasRibbonSelected: false,
    });

    mockAddToCart.mockResolvedValue(true);

    const addToCartButton = screen.getByRole("button", { name: /addToCart/i });
    await user.click(addToCartButton);

    await waitFor(() => {
      expect(mockAddToCart).toHaveBeenCalledWith({
        productId: "wreath-001",
        quantity: 2,
        customizations: expect.arrayContaining([
          expect.objectContaining({ optionId: "size" }),
        ]),
      });
    });
  });
});
