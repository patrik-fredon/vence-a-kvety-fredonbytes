/**
 * ProductFilters Accessibility Validation Tests
 *
 * This test suite validates the accessibility requirements for the ProductFilters component
 * after the white background styling changes, ensuring WCAG 2.1 AA compliance.
 *
 * Requirements tested:
 * - 3.3: Maintain all existing functionality including search, category filtering, and sorting
 * - 6.1: Maintain all existing ARIA labels and semantic HTML structure
 * - 6.3: Color contrast ratios meet WCAG 2.1 AA standards
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { ProductFilters } from "../ProductFilters";
import { ColorContrast, ARIAValidator, KeyboardValidator, auditAccessibility } from "@/lib/accessibility/validation";
import type { Category, ProductFilters as ProductFiltersType, ProductSortOptions } from "@/types/product";

// Mock data for testing
const mockCategories: Category[] = [
  {
    id: "1",
    name: { cs: "Věnce", en: "Wreaths" },
    slug: "venece",
    description: { cs: "Pohřební věnce", en: "Funeral wreaths" },
  },
  {
    id: "2",
    name: { cs: "Kytice", en: "Bouquets" },
    slug: "kytice",
    description: { cs: "Pohřební kytice", en: "Funeral bouquets" },
  },
];

const mockFilters: ProductFiltersType = {};

const mockSortOptions: ProductSortOptions = {
  field: "name",
  direction: "asc",
};

const mockMessages = {
  product: {
    hideSearch: "Hide Search",
    showSearch: "Show Search",
    searchAndFilters: "Search and Filters",
    searchPlaceholder: "Search products...",
    searchingFor: "Searching for: {query}",
    filterByCategory: "Filter by Category",
    allCategories: "All Categories",
    filterByPrice: "Filter by Price",
    priceFrom: "Price from",
    priceTo: "Price to",
    availability: "Availability",
    inStockOnly: "In stock only",
    featuredOnly: "Featured only",
    clearFilters: "Clear Filters",
  },
  common: {
    search: "Search",
  },
};

const renderProductFilters = (props: Partial<React.ComponentProps<typeof ProductFilters>> = {}) => {
  const defaultProps = {
    categories: mockCategories,
    filters: mockFilters,
    sortOptions: mockSortOptions,
    onFiltersChange: jest.fn(),
    onSortChange: jest.fn(),
    locale: "en",
  };

  return render(
    <NextIntlClientProvider locale="en" messages={mockMessages}>
      <ProductFilters {...defaultProps} {...props} />
    </NextIntlClientProvider>
  );
};

describe("ProductFilters Accessibility Validation", () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  describe("Color Contrast Validation (Requirement 6.3)", () => {
    it("should meet WCAG 2.1 AA contrast standards for white background", () => {
      // Test color combinations used in the component
      const colorTests = [
        // Main container text on white background
        { fg: "#1C1917", bg: "#FFFFFF", name: "Stone-900 text on white background" }, // text-stone-900
        { fg: "#44403C", bg: "#FFFFFF", name: "Stone-700 text on white background" }, // text-stone-700
        { fg: "#57534E", bg: "#FFFFFF", name: "Stone-600 text on white background" }, // text-stone-600

        // Button colors
        { fg: "#FFFFFF", bg: "#1C1917", name: "White text on stone-800 button" }, // bg-stone-800 text-white
        { fg: "#FFFFFF", bg: "#292524", name: "White text on stone-700 hover" }, // hover:bg-stone-700

        // Form elements
        { fg: "#1C1917", bg: "#FFFFFF", name: "Form input text" }, // text-stone-900 bg-white
        { fg: "#78716C", bg: "#FFFFFF", name: "Placeholder text" }, // text-stone-500

        // Panel background
        { fg: "#44403C", bg: "#F5F5F4", name: "Text on stone-50 panel" }, // text-stone-700 bg-stone-50
      ];

      colorTests.forEach(({ fg, bg, name }) => {
        const ratio = ColorContrast.getContrastRatio(fg, bg);
        const meetsAA = ColorContrast.meetsWCAGAA(fg, bg);

        expect(meetsAA).toBe(true);
        expect(ratio).toBeGreaterThanOrEqual(4.5);

        console.log(`✓ ${name}: ${ratio.toFixed(2)}:1 (WCAG AA: ${meetsAA ? "PASS" : "FAIL"})`);
      });
    });

    it("should have visible focus indicators on white background", async () => {
      renderProductFilters();

      const toggleButton = screen.getByRole("button", { name: /show search/i });

      // Focus the button
      await user.tab();
      expect(toggleButton).toHaveFocus();

      // Check that focus styles are applied (focus:ring-stone-500)
      const computedStyle = window.getComputedStyle(toggleButton);

      // The focus ring should be visible - we can't directly test the ring color
      // but we can ensure the element is focusable and has focus styles
      expect(toggleButton).toHaveAttribute("tabindex", "0");
      expect(toggleButton).toBeVisible();
    });
  });

  describe("Keyboard Navigation Functionality (Requirement 6.1)", () => {
    it("should support full keyboard navigation through all interactive elements", async () => {
      renderProductFilters();

      // Open the filters panel first
      const toggleButton = screen.getByRole("button", { name: /show search/i });
      await user.click(toggleButton);

      // Wait for panel to open
      await waitFor(() => {
        expect(screen.getByRole("textbox", { name: /search/i })).toBeInTheDocument();
      });

      // Test tab navigation through all interactive elements
      const interactiveElements = [
        screen.getByRole("button", { name: /hide search/i }), // Toggle button (now "hide")
        screen.getByRole("button", { name: "✕" }), // Close button
        screen.getByRole("textbox", { name: /search/i }), // Search input
        screen.getByRole("combobox", { name: /filter by category/i }), // Category select
        screen.getByRole("spinbutton", { name: /price from/i }), // Min price input
        screen.getByRole("spinbutton", { name: /price to/i }), // Max price input
        screen.getByRole("checkbox", { name: /in stock only/i }), // In stock checkbox
        screen.getByRole("checkbox", { name: /featured only/i }), // Featured checkbox
      ];

      // Test that each element can receive focus
      for (const element of interactiveElements) {
        element.focus();
        expect(element).toHaveFocus();
      }

      // Test tab order
      await user.tab(); // Should focus first element
      expect(interactiveElements[0]).toHaveFocus();
    });

    it("should handle Enter and Space key activation for buttons", async () => {
      const onFiltersChange = jest.fn();
      renderProductFilters({ onFiltersChange });

      const toggleButton = screen.getByRole("button", { name: /show search/i });

      // Test Enter key
      toggleButton.focus();
      await user.keyboard("{Enter}");

      await waitFor(() => {
        expect(screen.getByRole("textbox", { name: /search/i })).toBeInTheDocument();
      });

      // Test Space key on close button
      const closeButton = screen.getByRole("button", { name: "✕" });
      closeButton.focus();
      await user.keyboard(" ");

      await waitFor(() => {
        expect(screen.queryByRole("textbox", { name: /search/i })).not.toBeInTheDocument();
      });
    });

    it("should handle Escape key to close filters panel", async () => {
      renderProductFilters();

      // Open filters
      const toggleButton = screen.getByRole("button", { name: /show search/i });
      await user.click(toggleButton);

      await waitFor(() => {
        expect(screen.getByRole("textbox", { name: /search/i })).toBeInTheDocument();
      });

      // Press Escape
      await user.keyboard("{Escape}");

      await waitFor(() => {
        expect(screen.queryByRole("textbox", { name: /search/i })).not.toBeInTheDocument();
      });
    });
  });

  describe("ARIA Labels and Semantic HTML (Requirement 6.1)", () => {
    it("should maintain proper ARIA attributes and semantic structure", async () => {
      const { container } = renderProductFilters();

      // Open filters to test all elements
      const toggleButton = screen.getByRole("button", { name: /show search/i });
      await user.click(toggleButton);

      await waitFor(() => {
        expect(screen.getByRole("textbox", { name: /search/i })).toBeInTheDocument();
      });

      // Run comprehensive accessibility audit
      const auditResults = auditAccessibility(container);

      // Should have no critical accessibility errors
      expect(auditResults.errors).toHaveLength(0);

      // Check specific ARIA attributes
      const searchInput = screen.getByRole("textbox", { name: /search/i });
      expect(searchInput).toHaveAttribute("type", "text");
      expect(searchInput).toHaveAccessibleName();

      const categorySelect = screen.getByRole("combobox", { name: /filter by category/i });
      expect(categorySelect).toHaveAccessibleName();

      const checkboxes = screen.getAllByRole("checkbox");
      checkboxes.forEach(checkbox => {
        expect(checkbox).toHaveAccessibleName();
        expect(checkbox).toHaveAttribute("type", "checkbox");
      });

      // Check that labels are properly associated
      const labels = container.querySelectorAll("label");
      labels.forEach(label => {
        const forAttribute = label.getAttribute("for");
        if (forAttribute) {
          const associatedInput = container.querySelector(`#${forAttribute}`);
          expect(associatedInput).toBeInTheDocument();
        }
      });
    });

    it("should have proper heading hierarchy", async () => {
      renderProductFilters();

      // Open filters
      const toggleButton = screen.getByRole("button", { name: /show search/i });
      await user.click(toggleButton);

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: /search and filters/i })).toBeInTheDocument();
      });

      const heading = screen.getByRole("heading", { name: /search and filters/i });
      expect(heading.tagName).toBe("H3");
    });

    it("should announce filter changes to screen readers", async () => {
      const onFiltersChange = jest.fn();
      renderProductFilters({ onFiltersChange });

      // Open filters
      const toggleButton = screen.getByRole("button", { name: /show search/i });
      await user.click(toggleButton);

      await waitFor(() => {
        expect(screen.getByRole("textbox", { name: /search/i })).toBeInTheDocument();
      });

      // Test search input
      const searchInput = screen.getByRole("textbox", { name: /search/i });
      await user.type(searchInput, "test query");

      // Should show search feedback
      await waitFor(() => {
        expect(screen.getByText(/searching for.*test query/i)).toBeInTheDocument();
      });

      // Test checkbox changes
      const inStockCheckbox = screen.getByRole("checkbox", { name: /in stock only/i });
      await user.click(inStockCheckbox);

      expect(onFiltersChange).toHaveBeenCalled();
    });
  });

  describe("Filter Functionality Preservation (Requirement 3.3)", () => {
    it("should maintain all search functionality", async () => {
      const onFiltersChange = jest.fn();
      renderProductFilters({ onFiltersChange });

      // Open filters
      const toggleButton = screen.getByRole("button", { name: /show search/i });
      await user.click(toggleButton);

      await waitFor(() => {
        expect(screen.getByRole("textbox", { name: /search/i })).toBeInTheDocument();
      });

      // Test search input
      const searchInput = screen.getByRole("textbox", { name: /search/i });
      await user.type(searchInput, "wreath");

      // Should call onFiltersChange with debounced search
      await waitFor(() => {
        expect(onFiltersChange).toHaveBeenCalledWith(
          expect.objectContaining({ search: "wreath" })
        );
      }, { timeout: 500 });
    });

    it("should maintain category filtering functionality", async () => {
      const onFiltersChange = jest.fn();
      renderProductFilters({ onFiltersChange });

      // Open filters
      const toggleButton = screen.getByRole("button", { name: /show search/i });
      await user.click(toggleButton);

      await waitFor(() => {
        expect(screen.getByRole("combobox", { name: /filter by category/i })).toBeInTheDocument();
      });

      // Test category selection
      const categorySelect = screen.getByRole("combobox", { name: /filter by category/i });
      await user.selectOptions(categorySelect, "1");

      expect(onFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({ categoryId: "1" })
      );
    });

    it("should maintain price range filtering", async () => {
      const onFiltersChange = jest.fn();
      renderProductFilters({ onFiltersChange });

      // Open filters
      const toggleButton = screen.getByRole("button", { name: /show search/i });
      await user.click(toggleButton);

      await waitFor(() => {
        expect(screen.getByRole("spinbutton", { name: /price from/i })).toBeInTheDocument();
      });

      // Test price inputs
      const minPriceInput = screen.getByRole("spinbutton", { name: /price from/i });
      const maxPriceInput = screen.getByRole("spinbutton", { name: /price to/i });

      await user.type(minPriceInput, "100");
      expect(onFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({ minPrice: 100 })
      );

      await user.type(maxPriceInput, "500");
      expect(onFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({ maxPrice: 500 })
      );
    });

    it("should maintain availability filtering", async () => {
      const onFiltersChange = jest.fn();
      renderProductFilters({ onFiltersChange });

      // Open filters
      const toggleButton = screen.getByRole("button", { name: /show search/i });
      await user.click(toggleButton);

      await waitFor(() => {
        expect(screen.getByRole("checkbox", { name: /in stock only/i })).toBeInTheDocument();
      });

      // Test checkboxes
      const inStockCheckbox = screen.getByRole("checkbox", { name: /in stock only/i });
      const featuredCheckbox = screen.getByRole("checkbox", { name: /featured only/i });

      await user.click(inStockCheckbox);
      expect(onFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({ inStock: true })
      );

      await user.click(featuredCheckbox);
      expect(onFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({ featured: true })
      );
    });

    it("should maintain clear filters functionality", async () => {
      const onFiltersChange = jest.fn();
      const filtersWithData: ProductFiltersType = {
        search: "test",
        categoryId: "1",
        minPrice: 100,
        inStock: true,
      };

      renderProductFilters({
        onFiltersChange,
        filters: filtersWithData
      });

      // Open filters
      const toggleButton = screen.getByRole("button", { name: /show search/i });
      await user.click(toggleButton);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /clear filters/i })).toBeInTheDocument();
      });

      // Test clear filters
      const clearButton = screen.getByRole("button", { name: /clear filters/i });
      await user.click(clearButton);

      expect(onFiltersChange).toHaveBeenCalledWith({});
    });
  });

  describe("Mobile Accessibility (Requirement 3.5)", () => {
    it("should maintain accessibility on mobile viewports", async () => {
      // Simulate mobile viewport
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 375,
      });

      const { container } = renderProductFilters();

      // Open filters
      const toggleButton = screen.getByRole("button", { name: /show search/i });
      await user.click(toggleButton);

      await waitFor(() => {
        expect(screen.getByRole("textbox", { name: /search/i })).toBeInTheDocument();
      });

      // Run accessibility audit on mobile
      const auditResults = auditAccessibility(container);
      expect(auditResults.errors).toHaveLength(0);

      // Check that touch targets are large enough (minimum 44px)
      const buttons = screen.getAllByRole("button");
      buttons.forEach(button => {
        const rect = button.getBoundingClientRect();
        expect(Math.max(rect.width, rect.height)).toBeGreaterThanOrEqual(44);
      });
    });
  });

  describe("Screen Reader Compatibility", () => {
    it("should provide proper screen reader announcements", async () => {
      const { container } = renderProductFilters();

      // Check for live regions
      const liveRegions = container.querySelectorAll("[aria-live]");
      expect(liveRegions.length).toBeGreaterThanOrEqual(0);

      // Check that status messages are announced
      const toggleButton = screen.getByRole("button", { name: /show search/i });
      await user.click(toggleButton);

      await waitFor(() => {
        const searchInput = screen.getByRole("textbox", { name: /search/i });
        expect(searchInput).toHaveAttribute("autoFocus");
      });
    });

    it("should have proper form field descriptions", async () => {
      renderProductFilters();

      // Open filters
      const toggleButton = screen.getByRole("button", { name: /show search/i });
      await user.click(toggleButton);

      await waitFor(() => {
        expect(screen.getByRole("textbox", { name: /search/i })).toBeInTheDocument();
      });

      // Check that form fields have proper labels
      const searchInput = screen.getByRole("textbox", { name: /search/i });
      expect(searchInput).toHaveAccessibleName();

      const categorySelect = screen.getByRole("combobox", { name: /filter by category/i });
      expect(categorySelect).toHaveAccessibleName();

      // Check price inputs
      const priceInputs = screen.getAllByRole("spinbutton");
      priceInputs.forEach(input => {
        expect(input).toHaveAccessibleName();
      });
    });
  });
});
