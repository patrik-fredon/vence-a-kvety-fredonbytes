import { fireEvent, render, screen } from "@testing-library/react";
import { ErrorBoundary, ErrorFallback } from "@/components/ui/ErrorBoundary";

// Mock the error logger
jest.mock("@/lib/monitoring/error-logger", () => ({
  logError: jest.fn(),
}));

// Mock the error messages
jest.mock("@/lib/monitoring/error-messages", () => ({
  getErrorMessage: jest.fn(() => ({
    title: "Test Error",
    message: "This is a test error message",
    recoveryActions: [
      {
        label: "Retry",
        action: jest.fn(),
        primary: true,
      },
    ],
    contactSupport: true,
  })),
}));

// Component that throws an error
function ThrowError({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error("Test error");
  }
  return <div>No error</div>;
}

describe("ErrorBoundary", () => {
  beforeEach(() => {
    // Suppress console.error for these tests
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders children when there is no error", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText("No error")).toBeInTheDocument();
  });

  it("renders error fallback when there is an error", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText("Test Error")).toBeInTheDocument();
    expect(screen.getByText("This is a test error message")).toBeInTheDocument();
  });

  it("shows retry button and handles click", () => {
    const onRetry = jest.fn();

    render(
      <ErrorFallback error={new Error("Test error")} onRetry={onRetry} errorId="test-error-123" />
    );

    const retryButton = screen.getByText("Retry");
    expect(retryButton).toBeInTheDocument();

    fireEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalled();
  });

  it("shows error ID when provided", () => {
    render(<ErrorFallback error={new Error("Test error")} errorId="test-error-123" />);

    expect(screen.getByText(/test-error-123/)).toBeInTheDocument();
  });

  it("shows contact support button when enabled", () => {
    // Mock window.open
    const mockOpen = jest.fn();
    Object.defineProperty(window, "open", {
      value: mockOpen,
      writable: true,
    });

    render(
      <ErrorFallback
        error={new Error("Test error")}
        showContactSupport={true}
        errorId="test-error-123"
      />
    );

    const contactButton = screen.getByText("Kontaktovat podporu");
    expect(contactButton).toBeInTheDocument();

    fireEvent.click(contactButton);
    expect(mockOpen).toHaveBeenCalledWith(
      expect.stringContaining("mailto:podpora@pohrebni-vence.cz")
    );
  });

  it("shows development error details in development mode", () => {
    const originalEnv = process.env['NODE_ENV'];

    // Mock NODE_ENV for this test
    Object.defineProperty(process.env, "NODE_ENV", {
      value: "development",
      configurable: true,
    });

    const error = new Error("Test error");
    error.stack = "Error stack trace";

    render(<ErrorFallback error={error} />);

    expect(screen.getByText("Zobrazit technické detaily")).toBeInTheDocument();

    // Restore original NODE_ENV
    Object.defineProperty(process.env, "NODE_ENV", {
      value: originalEnv,
      configurable: true,
    });
  });
});
