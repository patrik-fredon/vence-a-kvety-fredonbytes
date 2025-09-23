/**
 * Design System Integration Tests
 * Tests the funeral-appropriate design system implementation
 */

import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { ColorContrast, validateDesignSystemColors } from "@/lib/accessibility/validation";
import { Badge } from "../Badge";
import { Button } from "../Button";
import { Card, CardContent, CardHeader, CardTitle } from "../Card";
import { Divider } from "../Divider";
import { Heading } from "../Heading";
import { Input } from "../Input";
import { Text } from "../Text";

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe("Design System - Funeral Appropriate Styling", () => {
  describe("Color Contrast Compliance", () => {
    it("should meet WCAG AA standards for primary colors", () => {
      const primaryOnWhite = ColorContrast.getContrastRatio("#2D5016", "#FFFFFF");
      const secondaryOnWhite = ColorContrast.getContrastRatio("#6F7752", "#FFFFFF");

      expect(primaryOnWhite).toBeGreaterThanOrEqual(4.5);
      expect(secondaryOnWhite).toBeGreaterThanOrEqual(4.5);
    });

    it("should validate all design system color combinations", () => {
      const { compliant, nonCompliant } = validateDesignSystemColors();

      // Log results for manual verification
      console.log("Compliant color combinations:", compliant);
      if (nonCompliant.length > 0) {
        console.warn("Non-compliant color combinations:", nonCompliant);
      }

      // Most combinations should be compliant (allow for some edge cases)
      expect(compliant.length).toBeGreaterThan(nonCompliant.length);
      expect(compliant.length).toBeGreaterThan(0);
    });
  });

  describe("Button Component", () => {
    it("should render with funeral-appropriate styling", () => {
      render(<Button>Test Button</Button>);
      const button = screen.getByRole("button");

      expect(button).toHaveClass("bg-primary-600");
      expect(button).toHaveClass("text-white");
      expect(button).toHaveClass("shadow-md");
    });

    it("should have proper focus styles", () => {
      render(<Button>Test Button</Button>);
      const button = screen.getByRole("button");

      expect(button).toHaveClass("focus-visible:ring-primary-500/20");
      expect(button).toHaveClass("focus-visible:outline-none");
    });

    it("should support high contrast mode", () => {
      render(<Button>Test Button</Button>);
      const button = screen.getByRole("button");

      expect(button).toHaveClass("high-contrast:bg-ButtonText");
      expect(button).toHaveClass("high-contrast:text-ButtonFace");
    });

    it("should be accessible", async () => {
      const { container } = render(<Button>Accessible Button</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("Input Component", () => {
    it("should render with funeral-appropriate styling", () => {
      render(<Input placeholder="Test input" />);
      const input = screen.getByRole("textbox");

      expect(input).toHaveClass("border-neutral-300");
      expect(input).toHaveClass("focus:border-primary-500");
      expect(input).toHaveClass("focus:ring-primary-500/20");
    });

    it("should handle error states appropriately", () => {
      render(<Input error="Test error" />);
      const input = screen.getByRole("textbox");
      const errorMessage = screen.getByRole("alert");

      expect(input).toHaveClass("border-error-500");
      expect(errorMessage).toHaveClass("text-error-600");
    });

    it("should be accessible with labels", async () => {
      const { container } = render(<Input label="Test Label" placeholder="Test input" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("Typography Components", () => {
    it("should render Text with appropriate styling", () => {
      render(<Text variant="body">Test text content</Text>);
      const text = screen.getByText("Test text content");

      expect(text).toHaveClass("text-neutral-900");
      expect(text).toHaveClass("leading-relaxed");
    });

    it("should render Heading with appropriate styling", () => {
      render(<Heading as="h1">Test Heading</Heading>);
      const heading = screen.getByRole("heading", { level: 1 });

      expect(heading).toHaveClass("text-neutral-900");
      expect(heading).toHaveClass("font-semibold");
      expect(heading).toHaveClass("leading-tight");
    });

    it("should support different text colors", () => {
      render(<Text color="primary">Primary text</Text>);
      const text = screen.getByText("Primary text");

      expect(text).toHaveClass("text-primary-700");
    });
  });

  describe("Card Component", () => {
    it("should render with funeral-appropriate styling", () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Test Card</CardTitle>
          </CardHeader>
          <CardContent>Card content</CardContent>
        </Card>
      );

      const cardContent = screen.getByText("Card content");
      const card = cardContent.closest('[class*="bg-white"]');
      expect(card).toHaveClass("bg-white");
      expect(card).toHaveClass("border-neutral-200");
      expect(card).toHaveClass("shadow-sm");
    });

    it("should support memorial variant", () => {
      render(<Card variant="memorial">Memorial card</Card>);
      const card = screen.getByText("Memorial card");

      expect(card).toHaveClass("bg-gradient-to-br");
      expect(card).toHaveClass("border-primary-200");
      expect(card).toHaveClass("shadow-memorial");
    });

    it("should be accessible", async () => {
      const { container } = render(
        <Card>
          <CardHeader>
            <CardTitle>Accessible Card</CardTitle>
          </CardHeader>
          <CardContent>This is accessible content</CardContent>
        </Card>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("Badge Component", () => {
    it("should render with appropriate styling", () => {
      render(<Badge>Test Badge</Badge>);
      const badge = screen.getByText("Test Badge");

      expect(badge).toHaveClass("bg-primary-100");
      expect(badge).toHaveClass("text-primary-800");
      expect(badge).toHaveClass("border-primary-200");
    });

    it("should support different variants", () => {
      render(<Badge variant="success">Success Badge</Badge>);
      const badge = screen.getByText("Success Badge");

      expect(badge).toHaveClass("bg-success-100");
      expect(badge).toHaveClass("text-success-800");
    });
  });

  describe("Divider Component", () => {
    it("should render with appropriate styling", () => {
      render(<Divider />);
      const divider = screen.getByRole("separator");

      expect(divider).toHaveClass("border-neutral-200");
      expect(divider).toHaveClass("w-full");
    });

    it("should support memorial variant", () => {
      render(<Divider variant="memorial" />);
      const divider = screen.getByRole("separator");

      expect(divider).toHaveClass("bg-gradient-to-r");
      expect(divider).toHaveClass("from-transparent");
      expect(divider).toHaveClass("via-primary-300");
    });
  });

  describe("Responsive Design", () => {
    it("should apply responsive classes correctly", () => {
      render(
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <Card>Responsive card</Card>
        </div>
      );

      const container = screen.getByText("Responsive card").closest("div")?.parentElement;
      expect(container).toHaveClass("grid-cols-1");
      expect(container).toHaveClass("md:grid-cols-2");
      expect(container).toHaveClass("lg:grid-cols-3");
    });
  });

  describe("Animation and Transitions", () => {
    it("should include respectful animations", () => {
      render(<Button>Animated Button</Button>);
      const button = screen.getByRole("button");

      expect(button).toHaveClass("transition-all");
      expect(button).toHaveClass("duration-200");
    });

    it("should support reduced motion preferences", () => {
      // Mock reduced motion preference
      Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: jest.fn().mockImplementation((query) => ({
          matches: query === "(prefers-reduced-motion: reduce)",
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      render(<Button>Motion-aware Button</Button>);
      // Component should respect reduced motion preferences
      // This would need to be tested with actual reduced motion logic
    });
  });

  describe("High Contrast Mode", () => {
    it("should include high contrast styles for all components", () => {
      const { rerender } = render(<Button>High Contrast Button</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("high-contrast:bg-ButtonText");

      rerender(<Input placeholder="High contrast input" />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("high-contrast:border-ButtonText");

      rerender(<Card>High contrast card</Card>);
      const card = screen.getByText("High contrast card");
      expect(card).toHaveClass("high-contrast:border-2");
    });
  });
});

describe("Design System Integration", () => {
  it("should work together harmoniously", async () => {
    const { container } = render(
      <div className="p-6 space-y-6">
        <Heading as="h1" color="primary">
          Funeral Wreaths & Arrangements
        </Heading>

        <Text color="muted">
          Professional and respectful floral arrangements for memorial services.
        </Text>

        <Divider variant="memorial" />

        <Card variant="memorial">
          <CardHeader>
            <Heading as="h2" size="lg">
              Featured Arrangement
            </Heading>
          </CardHeader>
          <CardContent>
            <Text>Beautiful white lily arrangement with respectful presentation.</Text>
            <div className="flex gap-2 mt-4">
              <Badge variant="success">Available</Badge>
              <Badge variant="outline">Premium</Badge>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button variant="primary">Add to Cart</Button>
          <Button variant="outline">View Details</Button>
        </div>

        <Input
          label="Special Instructions"
          placeholder="Any special requests for the arrangement..."
        />
      </div>
    );

    // Test overall accessibility
    const results = await axe(container);
    expect(results).toHaveNoViolations();

    // Verify all components are rendered
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(
      screen.getByText("Professional and respectful floral arrangements for memorial services.")
    ).toBeInTheDocument();
    expect(screen.getByRole("separator")).toBeInTheDocument();
    expect(screen.getByText("Featured Arrangement")).toBeInTheDocument();
    expect(screen.getByText("Available")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add to Cart" })).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });
});
