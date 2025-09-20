import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "../Button";

describe("Button", () => {
  it("renders with default props", () => {
    render(<Button>Click me</Button>);

    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("bg-stone-900"); // default variant
  });

  it("renders different variants correctly", () => {
    const { rerender } = render(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-stone-100");

    rerender(<Button variant="outline">Outline</Button>);
    expect(screen.getByRole("button")).toHaveClass("border", "border-stone-300");

    rerender(<Button variant="ghost">Ghost</Button>);
    expect(screen.getByRole("button")).toHaveClass("text-stone-700");

    rerender(<Button variant="destructive">Destructive</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-error-600");

    rerender(<Button variant="link">Link</Button>);
    expect(screen.getByRole("button")).toHaveClass("text-stone-900");
  });

  it("renders different sizes correctly", () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    expect(screen.getByRole("button")).toHaveClass("px-3", "py-1.5", "text-sm");

    rerender(<Button size="default">Default</Button>);
    expect(screen.getByRole("button")).toHaveClass("px-4", "py-2", "text-sm");

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByRole("button")).toHaveClass("px-8", "py-3", "text-base");

    rerender(<Button size="icon">Icon</Button>);
    expect(screen.getByRole("button")).toHaveClass("h-9", "w-9");
  });

  it("shows loading state", () => {
    render(<Button loading>Loading</Button>);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button.querySelector("svg")).toBeInTheDocument(); // Loading spinner
  });

  it("handles click events", () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("can be disabled", () => {
    render(<Button disabled>Disabled</Button>);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveClass("disabled:pointer-events-none", "disabled:opacity-50");
  });

  it("applies custom className", () => {
    render(<Button className="custom-class">Custom</Button>);

    expect(screen.getByRole("button")).toHaveClass("custom-class");
  });

  it("renders with icons", () => {
    const TestIcon = () => <span data-testid="test-icon">Icon</span>;

    const { rerender } = render(
      <Button icon={<TestIcon />} iconPosition="left">
        With Icon
      </Button>
    );

    expect(screen.getByTestId("test-icon")).toBeInTheDocument();

    rerender(
      <Button icon={<TestIcon />} iconPosition="right">
        With Icon
      </Button>
    );

    expect(screen.getByTestId("test-icon")).toBeInTheDocument();
  });

  it("has proper accessibility attributes", () => {
    render(<Button>Accessible Button</Button>);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("focus-visible:outline-none", "focus-visible:ring-2");
  });

  it("shows loading text when provided", () => {
    render(<Button loading loadingText="Processing...">Submit</Button>);

    // Check that the loading text appears in the visible content
    expect(screen.getAllByText("Processing...")).toHaveLength(2); // One visible, one for screen readers

    // Check that the button is disabled during loading
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });
});
