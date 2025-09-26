import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  ProductComponentErrorBoundary,
  ProductErrorFallback,
  ProductCardErrorFallback,
  ProductFiltersErrorFallback,
  withProductErrorBoundary,
} from "../ProductComponentErrorBoundary";
import { useProductErrorHandler } from "../useProductErrorHandler";

// Mock the error logger
jest.mock("@/lib/monitoring/error-logger", () => ({
  logError: jest.fn(),
}));

// Test component that throws an error
const ThrowingComponent = ({ shouldThrow = true }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error("Test error");
  }
  return <div>Component loaded successfully</div>;
};

// Test component for async errors
const AsyncErrorComponent = () => {
  const { handleAsyncError } = useProductErrorHandler();

  const handleClick = () => {
    try {
      throw new Error("Async test error");
    } catch (error) {
      handleAsyncError(error as Error, {
        componentName: "AsyncErrorComponent",
        action: "button-click",
      });
    }
  };

  return <button onClick={handleClick}>Trigger Async Error</button>;
};

describe("ProductComponentErrorBoundary", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console.error for cleaner test output
    jest.spyOn(console, "error").mockImplementation(() => { });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("Error Boundary Functionality", () => {
    it("should render children when no error occurs", () => {
      render(
        <ProductComponentErrorBoundary componentName="TestComponent">
          <ThrowingComponent shouldThrow={false} />
        </ProductComponentErrorBoundary>
      );

      expect(screen.getByText("Component loaded successfully")).toBeInTheDocument();
    });

    it("should render error fallback when component throws", () => {
      render(
        <ProductComponentErrorBoundary componentName="TestComponent">
          <ThrowingComponent shouldThrow={true} />
        </ProductComponentErrorBoundary>
      );

      expect(screen.getByText("Komponenta se nepodařila načíst")).toBeInTheDocument();
      expect(screen.getByText(/Při načítání komponenty "TestComponent" došlo k chybě/)).toBeInTheDocument();
    });

    it("should render custom fallback component when provided", () => {
      const CustomFallback = <div>Custom error fallback</div>;

      render(
        <ProductComponentErrorBoundary
          componentName="TestComponent"
          fallbackComponent={CustomFallback}
        >
          <ThrowingComponent shouldThrow={true} />
        </ProductComponentErrorBoundary>
      );

      expect(screen.getByText("Custom error fallback")).toBeInTheDocument();
    });

    it("should call onError callback when error occurs", () => {
      const onErrorMock = jest.fn();

      render(
        <ProductComponentErrorBoundary
          componentName="TestComponent"
          onError={onErrorMock}
        >
          <ThrowingComponent shouldThrow={true} />
        </ProductComponentErrorBoundary>
      );

      expect(onErrorMock).toHaveBeenCalledWith(
        expect.any(Error),
        expect.any(Object)
      );
    });

    it("should allow retry functionality", () => {
      let shouldThrow = true;
      const RetryableComponent = () => {
        if (shouldThrow) {
          throw new Error("Retryable error");
        }
        return <div>Retry successful</div>;
      };

      render(
        <ProductComponentErrorBoundary componentName="RetryableComponent">
          <RetryableComponent />
        </ProductComponentErrorBoundary>
      );

      expect(screen.getByText("Komponenta se nepodařila načíst")).toBeInTheDocument();

      // Simulate fixing the error
      shouldThrow = false;

      // Click retry button
      const retryButton = screen.getByRole("button", { name: /zkusit znovu načíst komponentu/i });
      fireEvent.click(retryButton);

      expect(screen.getByText("Retry successful")).toBeInTheDocument();
    });
  });

  describe("Accessibility Features", () => {
    it("should have proper ARIA attributes", () => {
      render(
        <ProductComponentErrorBoundary componentName="TestComponent">
          <ThrowingComponent shouldThrow={true} />
        </ProductComponentErrorBoundary>
      );

      const errorContainer = screen.getByRole("alert");
      expect(errorContainer).toHaveAttribute("aria-live", "polite");
    });

    it("should have accessible retry button", () => {
      render(
        <ProductComponentErrorBoundary componentName="TestComponent">
          <ThrowingComponent shouldThrow={true} />
        </ProductComponentErrorBoundary>
      );

      const retryButton = screen.getByRole("button", { name: /zkusit znovu načíst komponentu/i });
      expect(retryButton).toHaveAttribute("aria-label");
    });
  });

  describe("Error Fallback Components", () => {
    it("should render ProductErrorFallback with correct styling", () => {
      render(
        <ProductErrorFallback
          error={new Error("Test error")}
          componentName="TestComponent"
          errorId="test-error-id"
        />
      );

      expect(screen.getByText("Komponenta se nepodařila načíst")).toBeInTheDocument();
      expect(screen.getByText("ID chyby: test-error-id")).toBeInTheDocument();
    });

    it("should render ProductCardErrorFallback with card styling", () => {
      render(
        <ProductCardErrorFallback
          error={new Error("Card error")}
          errorId="card-error-id"
        />
      );

      expect(screen.getByText("Produkt se nepodařilo načíst")).toBeInTheDocument();
      expect(screen.getByRole("alert")).toHaveClass("h-96");
    });

    it("should render ProductFiltersErrorFallback with minimal styling", () => {
      render(
        <ProductFiltersErrorFallback
          error={new Error("Filters error")}
          errorId="filters-error-id"
        />
      );

      expect(screen.getByText("Filtry se nepodařilo načíst")).toBeInTheDocument();
      expect(screen.getByText(/Při načítání filtrů došlo k chybě/)).toBeInTheDocument();
    });
  });

  describe("Higher-Order Component", () => {
    it("should wrap component with error boundary", () => {
      const WrappedComponent = withProductErrorBoundary(
        ThrowingComponent,
        "WrappedTestComponent"
      );

      render(<WrappedComponent shouldThrow={true} />);

      expect(screen.getByText("Komponenta se nepodařila načíst")).toBeInTheDocument();
      expect(screen.getByText(/Při načítání komponenty "WrappedTestComponent" došlo k chybě/)).toBeInTheDocument();
    });

    it("should preserve component display name", () => {
      const TestComponent = () => <div>Test</div>;
      TestComponent.displayName = "TestComponent";

      const WrappedComponent = withProductErrorBoundary(TestComponent);

      expect(WrappedComponent.displayName).toBe("withProductErrorBoundary(TestComponent)");
    });
  });

  describe("Development Mode Features", () => {
    const originalNodeEnv = process.env.NODE_ENV;

    beforeEach(() => {
      process.env.NODE_ENV = "development";
    });

    afterEach(() => {
      process.env.NODE_ENV = originalNodeEnv;
    });

    it("should show technical details in development mode", () => {
      render(
        <ProductComponentErrorBoundary componentName="TestComponent">
          <ThrowingComponent shouldThrow={true} />
        </ProductComponentErrorBoundary>
      );

      expect(screen.getByText("Zobrazit technické detaily")).toBeInTheDocument();
    });

    it("should expand technical details when clicked", () => {
      render(
        <ProductComponentErrorBoundary componentName="TestComponent">
          <ThrowingComponent shouldThrow={true} />
        </ProductComponentErrorBoundary>
      );

      const detailsToggle = screen.getByText("Zobrazit technické detaily");
      fireEvent.click(detailsToggle);

      expect(screen.getByText(/Error: Test error/)).toBeInTheDocument();
    });
  });

  describe("Error Handler Hook", () => {
    it("should handle async errors without throwing", () => {
      render(<AsyncErrorComponent />);

      const button = screen.getByText("Trigger Async Error");

      // This should not throw an error
      expect(() => {
        fireEvent.click(button);
      }).not.toThrow();
    });
  });

  describe("Error Logging", () => {
    it("should log errors with product-specific context", () => {
      const { logError } = require("@/lib/monitoring/error-logger");

      render(
        <ProductComponentErrorBoundary componentName="TestComponent">
          <ThrowingComponent shouldThrow={true} />
        </ProductComponentErrorBoundary>
      );

      expect(logError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          context: "product-component-TestComponent",
          productComponent: "TestComponent",
          level: "component",
        })
      );
    });
  });
});

describe("Error Boundary Integration", () => {
  it("should maintain component functionality after error recovery", () => {
    const TestComponent = ({ shouldThrow }: { shouldThrow: boolean }) => {
      if (shouldThrow) {
        throw new Error("Test component error");
      }
      return <div>Component working correctly</div>;
    };

    const { rerender } = render(
      <ProductComponentErrorBoundary componentName="TestComponent">
        <TestComponent shouldThrow={true} />
      </ProductComponentErrorBoundary>
    );

    // Should show error initially
    expect(screen.getByText("Komponenta se nepodařila načíst")).toBeInTheDocument();

    // Click retry button
    const retryButton = screen.getByRole("button", { name: /zkusit znovu načíst komponentu/i });
    fireEvent.click(retryButton);

    // After retry, the error boundary should reset and try to render the component again
    // Since we're still passing shouldThrow=true, it should show the error again
    expect(screen.getByText("Komponenta se nepodařila načíst")).toBeInTheDocument();

    // Now let's test with a working component
    rerender(
      <ProductComponentErrorBoundary componentName="TestComponent">
        <TestComponent shouldThrow={false} />
      </ProductComponentErrorBoundary>
    );

    expect(screen.getByText("Component working correctly")).toBeInTheDocument();
  });
});
