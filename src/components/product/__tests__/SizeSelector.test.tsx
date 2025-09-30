import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useTranslations } from "next-intl";
import { SizeSelector } from "../SizeSelector";
import type { CustomizationOption } from "@/types/product";

// Mock next-intl
jest.mock("next-intl", () => ({
  useTranslations: jest.fn(),
}));

// Mock formatPrice utility
jest.mock("@/lib/utils", () => ({
  cn: jest.fn((...classes) => classes.filter(Boolean).join(" ")),
  formatPrice: jest.fn((price: number, locale: string, showSign?: boolean) => {
    const sign = showSign && price > 0 ? "+" : "";
    return locale === "cs" ? `${sign}${price} Kč` : `${sign}CZK ${price}`;
  }),
}));

const mockUseTranslations = useTranslations as jest.MockedFunction<typeof useTranslations>;

describe("SizeSelector", () => {
  const mockOnSizeChange = jest.fn();
  const mockT = jest.fn((key: string) => key);
  const mockTCurrency = jest.fn((key: string, params?: any) => params?.amount || key);

  const mockSizeOption: CustomizationOption = {
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
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTranslations.mockImplementation((namespace: string) => {
      if (namespace === "product") return mockT;
      if (namespace === "currency") return mockTCurrency;
      return mockT;
    });
  });

  it("renders size options correctly", () => {
    render(
      <SizeSelector
        sizeOption={mockSizeOption}
        selectedSize={null}
        onSizeChange={mockOnSizeChange}
        locale="en"
        basePrice={1500}
      />
    );

    expect(screen.getByText("Size")).toBeInTheDocument();
    expect(screen.getByText("required")).toBeInTheDocument();
    expect(screen.getByText("120cm diameter")).toBeInTheDocument();
    expect(screen.getByText("150cm diameter")).toBeInTheDocument();
    expect(screen.getByText("180cm diameter")).toBeInTheDocument();
  });

  it("displays correct prices for each size option", () => {
    render(
      <SizeSelector
        sizeOption={mockSizeOption}
        selectedSize={null}
        onSizeChange={mockOnSizeChange}
        locale="cs"
        basePrice={1500}
      />
    );

    // Base price for 120cm (no modifier)
    expect(screen.getByText("1500 Kč")).toBeInTheDocument();
    // Base price + 500 for 150cm
    expect(screen.getByText("2000 Kč")).toBeInTheDocument();
    // Base price + 1000 for 180cm
    expect(screen.getByText("2500 Kč")).toBeInTheDocument();
  });

  it("shows price modifiers for non-zero modifications", () => {
    render(
      <SizeSelector
        sizeOption={mockSizeOption}
        selectedSize={null}
        onSizeChange={mockOnSizeChange}
        locale="en"
        basePrice={1500}
      />
    );

    // Should show +500 for 150cm option
    expect(screen.getByText("+CZK 500")).toBeInTheDocument();
    // Should show +1000 for 180cm option
    expect(screen.getByText("+CZK 1000")).toBeInTheDocument();
  });

  it("handles size selection correctly", async () => {
    const user = userEvent.setup();

    render(
      <SizeSelector
        sizeOption={mockSizeOption}
        selectedSize={null}
        onSizeChange={mockOnSizeChange}
        locale="en"
        basePrice={1500}
      />
    );

    const size150Button = screen.getByRole("button", { name: /150cm diameter/i });
    await user.click(size150Button);

    expect(mockOnSizeChange).toHaveBeenCalledWith("size_150");
  });

  it("shows selected state correctly", () => {
    render(
      <SizeSelector
        sizeOption={mockSizeOption}
        selectedSize="size_150"
        onSizeChange={mockOnSizeChange}
        locale="en"
        basePrice={1500}
      />
    );

    const size150Button = screen.getByRole("button", { name: /150cm diameter/i });
    expect(size150Button).toHaveAttribute("aria-pressed", "true");
    expect(size150Button).toHaveClass("border-stone-900", "bg-stone-50");
  });

  it("disables unavailable options", () => {
    const sizeOptionWithUnavailable = {
      ...mockSizeOption,
      choices: [
        ...mockSizeOption.choices,
        {
          id: "size_200",
        value: "size_200",
          label: { cs: "200cm průměr", en: "200cm diameter" },
          priceModifier: 1500,
          available: false,
        },
      ],
    };

    render(
      <SizeSelector
        sizeOption={sizeOptionWithUnavailable}
        selectedSize={null}
        onSizeChange={mockOnSizeChange}
        locale="en"
        basePrice={1500}
      />
    );

    const size200Button = screen.getByRole("button", { name: /200cm diameter/i });
    expect(size200Button).toBeDisabled();
    expect(size200Button).toHaveClass("disabled:opacity-50", "disabled:cursor-not-allowed");
  });

  it("supports keyboard navigation", async () => {
    const user = userEvent.setup();

    render(
      <SizeSelector
        sizeOption={mockSizeOption}
        selectedSize={null}
        onSizeChange={mockOnSizeChange}
        locale="en"
        basePrice={1500}
      />
    );

    const size120Button = screen.getByRole("button", { name: /120cm diameter/i });
    size120Button.focus();

    await user.keyboard("{Enter}");
    expect(mockOnSizeChange).toHaveBeenCalledWith("size_120");
  });

  it("displays accessibility attributes correctly", () => {
    render(
      <SizeSelector
        sizeOption={mockSizeOption}
        selectedSize="size_120"
        onSizeChange={mockOnSizeChange}
        locale="en"
        basePrice={1500}
      />
    );

    const size120Button = screen.getByRole("button", { name: /120cm diameter/i });
    expect(size120Button).toHaveAttribute("aria-pressed", "true");
    expect(size120Button).toHaveAttribute("aria-describedby", "size-size_120-description");
  });

  it("handles Czech locale correctly", () => {
    render(
      <SizeSelector
        sizeOption={mockSizeOption}
        selectedSize={null}
        onSizeChange={mockOnSizeChange}
        locale="cs"
        basePrice={1500}
      />
    );

    expect(screen.getByText("Velikost")).toBeInTheDocument();
    expect(screen.getByText("120cm průměr")).toBeInTheDocument();
    expect(screen.getByText("150cm průměr")).toBeInTheDocument();
    expect(screen.getByText("180cm průměr")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <SizeSelector
        sizeOption={mockSizeOption}
        selectedSize={null}
        onSizeChange={mockOnSizeChange}
        locale="en"
        basePrice={1500}
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("handles empty choices gracefully", () => {
    const emptyOption = {
      ...mockSizeOption,
      choices: [],
    };

    render(
      <SizeSelector
        sizeOption={emptyOption}
        selectedSize={null}
        onSizeChange={mockOnSizeChange}
        locale="en"
        basePrice={1500}
      />
    );

    expect(screen.getByText("Size")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("shows required indicator when option is required", () => {
    render(
      <SizeSelector
        sizeOption={mockSizeOption}
        selectedSize={null}
        onSizeChange={mockOnSizeChange}
        locale="en"
        basePrice={1500}
      />
    );

    const requiredBadge = screen.getByText("required");
    expect(requiredBadge).toBeInTheDocument();
    expect(requiredBadge).toHaveClass("bg-amber-100", "text-amber-800");
  });

  it("does not show required indicator when option is not required", () => {
    const optionalSizeOption = {
      ...mockSizeOption,
      required: false,
    };

    render(
      <SizeSelector
        sizeOption={optionalSizeOption}
        selectedSize={null}
        onSizeChange={mockOnSizeChange}
        locale="en"
        basePrice={1500}
      />
    );

    expect(screen.queryByText("required")).not.toBeInTheDocument();
  });
});
