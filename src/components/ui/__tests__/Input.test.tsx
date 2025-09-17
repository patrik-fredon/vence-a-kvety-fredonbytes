import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "../Input";

describe("Input", () => {
  it("renders basic input correctly", () => {
    render(<Input label="Test Input" id="test" />);

    expect(screen.getByLabelText("Test Input")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toHaveAttribute("id", "test");
  });

  it("associates label with input correctly", () => {
    render(<Input label="Email Address" id="email" />);

    const input = screen.getByRole("textbox");
    const label = screen.getByText("Email Address");

    expect(input).toHaveAttribute("id", "email");
    expect(label).toHaveAttribute("for", "email");
  });

  it("shows required indicator when required", () => {
    render(<Input label="Required Field" required />);

    expect(screen.getByText("*")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-required", "true");
  });

  it("displays error message correctly", () => {
    render(<Input label="Email" error="Invalid email format" />);

    const input = screen.getByRole("textbox");
    const errorMessage = screen.getByRole("alert");

    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby");
    expect(errorMessage).toHaveTextContent("Invalid email format");
  });

  it("handles value changes", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<Input label="Test Input" onChange={onChange} />);

    const input = screen.getByRole("textbox");
    await user.type(input, "test value");

    expect(onChange).toHaveBeenCalled();
  });

  it("supports different input types", () => {
    render(<Input label="Password" type="password" />);

    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password");
  });

  it("shows placeholder text", () => {
    render(<Input label="Search" placeholder="Enter search term..." />);

    expect(screen.getByPlaceholderText("Enter search term...")).toBeInTheDocument();
  });

  it("can be disabled", () => {
    render(<Input label="Disabled Input" disabled />);

    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("applies custom className", () => {
    render(<Input label="Custom Input" className="custom-class" />);

    expect(screen.getByRole("textbox")).toHaveClass("custom-class");
  });

  it("supports help text", () => {
    render(<Input label="Password" helpText="Must be at least 8 characters" />);

    expect(screen.getByText("Must be at least 8 characters")).toBeInTheDocument();
  });

  it("handles focus and blur events", async () => {
    const user = userEvent.setup();
    const onFocus = jest.fn();
    const onBlur = jest.fn();

    render(<Input label="Test Input" onFocus={onFocus} onBlur={onBlur} />);

    const input = screen.getByRole("textbox");

    await user.click(input);
    expect(onFocus).toHaveBeenCalled();

    await user.tab();
    expect(onBlur).toHaveBeenCalled();
  });
});
