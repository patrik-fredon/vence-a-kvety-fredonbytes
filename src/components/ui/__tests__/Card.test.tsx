import { render, screen, fireEvent } from "@testing-library/react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../Card";

describe("Card", () => {
  it("renders with default props", () => {
    render(<Card>Card content</Card>);

    const card = screen.getByText("Card content");
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass("bg-white", "border-stone-200", "shadow-sm");
  });

  it("renders different variants correctly", () => {
    const { rerender } = render(<Card variant="outlined">Outlined Card</Card>);
    expect(screen.getByText("Outlined Card")).toHaveClass("border-stone-300", "shadow-none");

    rerender(<Card variant="elevated">Elevated Card</Card>);
    expect(screen.getByText("Elevated Card")).toHaveClass("border-stone-100", "shadow-md");
  });

  it("renders different padding sizes correctly", () => {
    const { rerender } = render(<Card padding="sm">Small padding</Card>);
    expect(screen.getByText("Small padding")).toHaveClass("p-3");

    rerender(<Card padding="lg">Large padding</Card>);
    expect(screen.getByText("Large padding")).toHaveClass("p-6");

    rerender(<Card padding="none">No padding</Card>);
    expect(screen.getByText("No padding")).toHaveClass("p-0");
  });

  it("handles interactive cards", () => {
    const handleClick = jest.fn();
    render(
      <Card interactive onClick={handleClick}>
        Interactive Card
      </Card>
    );

    const card = screen.getByRole("button");
    expect(card).toHaveClass("cursor-pointer", "hover:shadow-lg");
    expect(card).toHaveAttribute("tabIndex", "0");

    fireEvent.click(card);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("handles keyboard interactions for interactive cards", () => {
    const handleClick = jest.fn();
    render(
      <Card interactive onClick={handleClick}>
        Interactive Card
      </Card>
    );

    const card = screen.getByRole("button");

    fireEvent.keyDown(card, { key: 'Enter' });
    expect(handleClick).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(card, { key: ' ' });
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  it("applies custom className", () => {
    render(<Card className="custom-class">Custom Card</Card>);

    expect(screen.getByText("Custom Card")).toHaveClass("custom-class");
  });

  it("has proper accessibility attributes", () => {
    render(<Card>Accessible Card</Card>);

    const card = screen.getByText("Accessible Card");
    expect(card).toHaveClass("high-contrast:border-2", "high-contrast:border-WindowText");
  });
});

describe("Card sub-components", () => {
  it("renders CardHeader correctly", () => {
    render(
      <Card>
        <CardHeader>Header content</CardHeader>
      </Card>
    );

    const header = screen.getByText("Header content");
    expect(header).toBeInTheDocument();
    expect(header).toHaveClass("flex", "flex-col", "space-y-1.5", "pb-4");
  });

  it("renders CardTitle correctly", () => {
    render(
      <Card>
        <CardTitle>Card Title</CardTitle>
      </Card>
    );

    const title = screen.getByRole("heading", { level: 3 });
    expect(title).toHaveTextContent("Card Title");
    expect(title).toHaveClass("text-lg", "font-semibold", "text-stone-900");
  });

  it("renders CardDescription correctly", () => {
    render(
      <Card>
        <CardDescription>Card description text</CardDescription>
      </Card>
    );

    const description = screen.getByText("Card description text");
    expect(description).toBeInTheDocument();
    expect(description).toHaveClass("text-sm", "text-stone-600");
  });

  it("renders CardContent correctly", () => {
    render(
      <Card>
        <CardContent>Content area</CardContent>
      </Card>
    );

    const content = screen.getByText("Content area");
    expect(content).toBeInTheDocument();
    expect(content).toHaveClass("space-y-4");
  });

  it("renders CardFooter correctly", () => {
    render(
      <Card>
        <CardFooter>Footer content</CardFooter>
      </Card>
    );

    const footer = screen.getByText("Footer content");
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveClass("flex", "items-center", "justify-between", "pt-4", "border-t", "border-stone-200");
  });

  it("renders complete card with all sub-components", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Test Card</CardTitle>
          <CardDescription>This is a test card</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Main content goes here</p>
        </CardContent>
        <CardFooter>
          <span>Footer info</span>
        </CardFooter>
      </Card>
    );

    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent("Test Card");
    expect(screen.getByText("This is a test card")).toBeInTheDocument();
    expect(screen.getByText("Main content goes here")).toBeInTheDocument();
    expect(screen.getByText("Footer info")).toBeInTheDocument();
  });
});
