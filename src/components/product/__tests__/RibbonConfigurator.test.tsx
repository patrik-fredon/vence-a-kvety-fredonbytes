import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useTranslations } from "next-intl";
import { RibbonConfigurator } from "../RibbonConfigurator";
import type { CustomizationOption, Customization } from "@/types/product";

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

describe("RibbonConfigurator", () => {
  const mockOnCustomizationChange = jest.fn();
  const mockT = jest.fn((key: string) => key);

  const mockColorOption: CustomizationOption = {
    id: "ribbon_color",
    type: "ribbon_color",
    name: { cs: "Barva stuhy", en: "Ribbon Color" },
    required: false,
    minSelections: 1,
    maxSelections: 1,
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
  };

  const mockTextOption: CustomizationOption = {
    id: "ribbon_text",
    type: "ribbon_text",
    name: { cs: "Text na stuze", en: "Ribbon Text" },
    required: false,
    minSelections: 1,
    maxSelections: 1,
    choices: [
      {
        id: "text_sympathy",
      value: "text_sympathy",
        label: { cs: "S upřímnou soustrasti", en: "With sincere sympathy" },
        priceModifier: 50,
        available: true,
      },
      {
        id: "text_memory",
      value: "text_memory",
        label: { cs: "Na věčnou památku", en: "In eternal memory" },
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
  };

  const emptyCustomizations: Customization[] = [];

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTranslations.mockReturnValue(mockT);
  });

  it("renders when visible", () => {
    render(
      <RibbonConfigurator
        isVisible={true}
        colorOption={mockColorOption}
        textOption={mockTextOption}
        customizations={emptyCustomizations}
        onCustomizationChange={mockOnCustomizationChange}
        locale="en"
      />
    );

    expect(screen.getByText("Ribbon Color")).toBeInTheDocument();
    expect(screen.getByText("Ribbon Text")).toBeInTheDocument();
    expect(screen.getByText("Black")).toBeInTheDocument();
    expect(screen.getByText("White")).toBeInTheDocument();
    expect(screen.getByText("With sincere sympathy")).toBeInTheDocument();
    expect(screen.getByText("In eternal memory")).toBeInTheDocument();
    expect(screen.getByText("Custom text")).toBeInTheDocument();
  });

  it("does not render when not visible", () => {
    render(
      <RibbonConfigurator
        isVisible={false}
        colorOption={mockColorOption}
        textOption={mockTextOption}
        customizations={emptyCustomizations}
        onCustomizationChange={mockOnCustomizationChange}
        locale="en"
      />
    );

    expect(screen.queryByText("Ribbon Color")).not.toBeInTheDocument();
    expect(screen.queryByText("Ribbon Text")).not.toBeInTheDocument();
  });

  it("handles color selection correctly", async () => {
    const user = userEvent.setup();

    render(
      <RibbonConfigurator
        isVisible={true}
        colorOption={mockColorOption}
        textOption={mockTextOption}
        customizations={emptyCustomizations}
        onCustomizationChange={mockOnCustomizationChange}
        locale="en"
      />
    );

    const blackColorButton = screen.getByRole("button", { name: /Black/i });
    await user.click(blackColorButton);

    expect(mockOnCustomizationChange).toHaveBeenCalledWith([
      {
        optionId: "ribbon_color",
        choiceIds: ["color_black"],
      },
    ]);
  });

  it("handles text selection correctly", async () => {
    const user = userEvent.setup();

    render(
      <RibbonConfigurator
        isVisible={true}
        colorOption={mockColorOption}
        textOption={mockTextOption}
        customizations={emptyCustomizations}
        onCustomizationChange={mockOnCustomizationChange}
        locale="en"
      />
    );

    const sympathyTextButton = screen.getByRole("button", { name: /With sincere sympathy/i });
    await user.click(sympathyTextButton);

    expect(mockOnCustomizationChange).toHaveBeenCalledWith([
      {
        optionId: "ribbon_text",
        choiceIds: ["text_sympathy"],
      },
    ]);
  });

  it("shows selected state for color options", () => {
    const customizationsWithColor: Customization[] = [
      {
        optionId: "ribbon_color",
        choiceIds: ["color_black"],
      },
    ];

    render(
      <RibbonConfigurator
        isVisible={true}
        colorOption={mockColorOption}
        textOption={mockTextOption}
        customizations={customizationsWithColor}
        onCustomizationChange={mockOnCustomizationChange}
        locale="en"
      />
    );

    const blackColorButton = screen.getByRole("button", { name: /Black/i });
    expect(blackColorButton).toHaveAttribute("aria-pressed", "true");
    expect(blackColorButton).toHaveClass("border-stone-900", "bg-stone-50");
  });

  it("shows selected state for text options", () => {
    const customizationsWithText: Customization[] = [
      {
        optionId: "ribbon_text",
        choiceIds: ["text_sympathy"],
      },
    ];

    render(
      <RibbonConfigurator
        isVisible={true}
        colorOption={mockColorOption}
        textOption={mockTextOption}
        customizations={customizationsWithText}
        onCustomizationChange={mockOnCustomizationChange}
        locale="en"
      />
    );

    const sympathyTextButton = screen.getByRole("button", { name: /With sincere sympathy/i });
    expect(sympathyTextButton).toHaveAttribute("aria-pressed", "true");
    expect(sympathyTextButton).toHaveClass("border-stone-900", "bg-stone-50");
  });

  it("displays custom text input when custom text option is selected", async () => {
    const user = userEvent.setup();

    render(
      <RibbonConfigurator
        isVisible={true}
        colorOption={mockColorOption}
        textOption={mockTextOption}
        customizations={emptyCustomizations}
        onCustomizationChange={mockOnCustomizationChange}
        locale="en"
      />
    );

    const customTextButton = screen.getByRole("button", { name: /Custom text/i });
    await user.click(customTextButton);

    // Should show textarea for custom text input
    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("customTextPlaceholder")).toBeInTheDocument();
  });

  it("handles custom text input correctly", async () => {
    const user = userEvent.setup();
    const customizationsWithCustomText: Customization[] = [
      {
        optionId: "ribbon_text",
        choiceIds: ["text_custom"],
        customValue: "",
      },
    ];

    render(
      <RibbonConfigurator
        isVisible={true}
        colorOption={mockColorOption}
        textOption={mockTextOption}
        customizations={customizationsWithCustomText}
        onCustomizationChange={mockOnCustomizationChange}
        locale="en"
      />
    );

    const textarea = screen.getByRole("textbox");
    await user.type(textarea, "Milovanému otci");

    expect(mockOnCustomizationChange).toHaveBeenCalledWith([
      {
        optionId: "ribbon_text",
        choiceIds: ["text_custom"],
        customValue: "Milovanému otci",
      },
    ]);
  });

  it("validates custom text length", async () => {
    const user = userEvent.setup();
    const customizationsWithCustomText: Customization[] = [
      {
        optionId: "ribbon_text",
        choiceIds: ["text_custom"],
        customValue: "",
      },
    ];

    render(
      <RibbonConfigurator
        isVisible={true}
        colorOption={mockColorOption}
        textOption={mockTextOption}
        customizations={customizationsWithCustomText}
        onCustomizationChange={mockOnCustomizationChange}
        locale="en"
      />
    );

    const textarea = screen.getByRole("textbox");
    const longText = "A".repeat(51); // Exceeds 50 character limit
    await user.type(textarea, longText);

    // Should show character count and validation error
    expect(screen.getByText(/51\/50/)).toBeInTheDocument();
    expect(screen.getByText("customTextTooLong")).toBeInTheDocument();
  });

  it("shows character count for custom text", () => {
    const customizationsWithCustomText: Customization[] = [
      {
        optionId: "ribbon_text",
        choiceIds: ["text_custom"],
        customValue: "Test text",
      },
    ];

    render(
      <RibbonConfigurator
        isVisible={true}
        colorOption={mockColorOption}
        textOption={mockTextOption}
        customizations={customizationsWithCustomText}
        onCustomizationChange={mockOnCustomizationChange}
        locale="en"
      />
    );

    expect(screen.getByText("9/50")).toBeInTheDocument();
  });

  it("displays price modifiers correctly", () => {
    render(
      <RibbonConfigurator
        isVisible={true}
        colorOption={mockColorOption}
        textOption={mockTextOption}
        customizations={emptyCustomizations}
        onCustomizationChange={mockOnCustomizationChange}
        locale="en"
      />
    );

    // Text options should show price modifiers
    expect(screen.getByText("+CZK 50")).toBeInTheDocument(); // For sympathy and memory texts
    expect(screen.getByText("+CZK 100")).toBeInTheDocument(); // For custom text
  });

  it("handles single selection constraint correctly", async () => {
    const user = userEvent.setup();
    const customizationsWithText: Customization[] = [
      {
        optionId: "ribbon_text",
        choiceIds: ["text_sympathy"],
      },
    ];

    render(
      <RibbonConfigurator
        isVisible={true}
        colorOption={mockColorOption}
        textOption={mockTextOption}
        customizations={customizationsWithText}
        onCustomizationChange={mockOnCustomizationChange}
        locale="en"
      />
    );

    // Select a different text option
    const memoryTextButton = screen.getByRole("button", { name: /In eternal memory/i });
    await user.click(memoryTextButton);

    // Should replace the previous selection
    expect(mockOnCustomizationChange).toHaveBeenCalledWith([
      {
        optionId: "ribbon_text",
        choiceIds: ["text_memory"],
      },
    ]);
  });

  it("clears custom value when selecting predefined option", async () => {
    const user = userEvent.setup();
    const customizationsWithCustomText: Customization[] = [
      {
        optionId: "ribbon_text",
        choiceIds: ["text_custom"],
        customValue: "Custom message",
      },
    ];

    render(
      <RibbonConfigurator
        isVisible={true}
        colorOption={mockColorOption}
        textOption={mockTextOption}
        customizations={customizationsWithCustomText}
        onCustomizationChange={mockOnCustomizationChange}
        locale="en"
      />
    );

    // Select a predefined text option
    const sympathyTextButton = screen.getByRole("button", { name: /With sincere sympathy/i });
    await user.click(sympathyTextButton);

    // Should clear custom value
    expect(mockOnCustomizationChange).toHaveBeenCalledWith([
      {
        optionId: "ribbon_text",
        choiceIds: ["text_sympathy"],
      },
    ]);
  });

  it("handles Czech locale correctly", () => {
    render(
      <RibbonConfigurator
        isVisible={true}
        colorOption={mockColorOption}
        textOption={mockTextOption}
        customizations={emptyCustomizations}
        onCustomizationChange={mockOnCustomizationChange}
        locale="cs"
      />
    );

    expect(screen.getByText("Barva stuhy")).toBeInTheDocument();
    expect(screen.getByText("Text na stuze")).toBeInTheDocument();
    expect(screen.getByText("Černá")).toBeInTheDocument();
    expect(screen.getByText("Bílá")).toBeInTheDocument();
    expect(screen.getByText("S upřímnou soustrasti")).toBeInTheDocument();
    expect(screen.getByText("Na věčnou památku")).toBeInTheDocument();
    expect(screen.getByText("Vlastní text")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <RibbonConfigurator
        isVisible={true}
        colorOption={mockColorOption}
        textOption={mockTextOption}
        customizations={emptyCustomizations}
        onCustomizationChange={mockOnCustomizationChange}
        locale="en"
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("handles missing options gracefully", () => {
    render(
      <RibbonConfigurator
        isVisible={true}
        colorOption={undefined}
        textOption={undefined}
        customizations={emptyCustomizations}
        onCustomizationChange={mockOnCustomizationChange}
        locale="en"
      />
    );

    // Should render without crashing
    expect(screen.queryByText("Ribbon Color")).not.toBeInTheDocument();
    expect(screen.queryByText("Ribbon Text")).not.toBeInTheDocument();
  });

  it("supports keyboard navigation", async () => {
    const user = userEvent.setup();

    render(
      <RibbonConfigurator
        isVisible={true}
        colorOption={mockColorOption}
        textOption={mockTextOption}
        customizations={emptyCustomizations}
        onCustomizationChange={mockOnCustomizationChange}
        locale="en"
      />
    );

    const blackColorButton = screen.getByRole("button", { name: /Black/i });
    blackColorButton.focus();

    await user.keyboard("{Enter}");
    expect(mockOnCustomizationChange).toHaveBeenCalledWith([
      {
        optionId: "ribbon_color",
        choiceIds: ["color_black"],
      },
    ]);
  });

  it("displays accessibility attributes correctly", () => {
    const customizationsWithColor: Customization[] = [
      {
        optionId: "ribbon_color",
        choiceIds: ["color_black"],
      },
    ];

    render(
      <RibbonConfigurator
        isVisible={true}
        colorOption={mockColorOption}
        textOption={mockTextOption}
        customizations={customizationsWithColor}
        onCustomizationChange={mockOnCustomizationChange}
        locale="en"
      />
    );

    const blackColorButton = screen.getByRole("button", { name: /Black/i });
    expect(blackColorButton).toHaveAttribute("aria-pressed", "true");
  });
});
