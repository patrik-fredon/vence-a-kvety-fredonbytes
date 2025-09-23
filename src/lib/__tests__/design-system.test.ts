/**
 * Design System Foundation Tests
 * Tests for the stone/amber design system setup
 */

import { amberVariants, getButtonStyles, getCardStyles, stoneVariants } from "../design-system";
import { amberColors, designTokens, stoneColors } from "../design-tokens";
import { getBorderRadius, getColor, getFontSize, getSpacing } from "../utils";

describe("Design System Foundation", () => {
  describe("Design Tokens", () => {
    it("should have stone color palette", () => {
      expect(designTokens.colors.stone).toBeDefined();
      expect(designTokens.colors.stone[50]).toBe("#FAFAF9");
      expect(designTokens.colors.stone[500]).toBe("#78716C");
      expect(designTokens.colors.stone[900]).toBe("#1C1917");
    });

    it("should have amber color palette", () => {
      expect(designTokens.colors.amber).toBeDefined();
      expect(designTokens.colors.amber[50]).toBe("#FFFBEB");
      expect(designTokens.colors.amber[600]).toBe("#D97706");
      expect(designTokens.colors.amber[900]).toBe("#78350F");
    });

    it("should have white and black colors", () => {
      expect(designTokens.colors.white).toBe("#FFFFFF");
      expect(designTokens.colors.black).toBe("#000000");
    });

    it("should have semantic colors", () => {
      expect(designTokens.colors.semantic.success).toBeDefined();
      expect(designTokens.colors.semantic.warning).toBe(amberColors);
      expect(designTokens.colors.semantic.error).toBeDefined();
      expect(designTokens.colors.semantic.info).toBeDefined();
    });
  });

  describe("Design System Utilities", () => {
    it("should generate button styles correctly", () => {
      const defaultButton = getButtonStyles("default", "default");
      expect(defaultButton).toContain("bg-stone-900");
      expect(defaultButton).toContain("text-stone-50");
      expect(defaultButton).toContain("h-10");

      const outlineButton = getButtonStyles("outline", "sm");
      expect(outlineButton).toContain("border-stone-200");
      expect(outlineButton).toContain("h-9");
    });

    it("should generate card styles correctly", () => {
      const basicCard = getCardStyles(false);
      expect(basicCard).toContain("border-stone-200");
      expect(basicCard).toContain("bg-white");

      const hoverCard = getCardStyles(true);
      expect(hoverCard).toContain("hover:shadow-md");
    });

    it("should have stone variants", () => {
      expect(stoneVariants.background.primary).toBe("bg-stone-50");
      expect(stoneVariants.text.primary).toBe("text-stone-900");
      expect(stoneVariants.border.light).toBe("border-stone-200");
    });

    it("should have amber variants", () => {
      expect(amberVariants.background.primary).toBe("bg-amber-600");
      expect(amberVariants.text.primary).toBe("text-amber-600");
      expect(amberVariants.border.primary).toBe("border-amber-600");
    });
  });

  describe("Utility Functions", () => {
    it("should get color values correctly", () => {
      expect(getColor("stone.500")).toBe("#78716C");
      expect(getColor("amber.600")).toBe("#D97706");
      expect(getColor("white")).toBe("#FFFFFF");
      expect(getColor("black")).toBe("#000000");
      expect(getColor("invalid.color", "#fallback")).toBe("#fallback");
    });

    it("should get spacing values correctly", () => {
      expect(getSpacing("4")).toBe("1rem");
      expect(getSpacing("8")).toBe("2rem");
      expect(getSpacing("invalid", "0")).toBe("0");
    });

    it("should get font size values correctly", () => {
      expect(getFontSize("base")).toBe("1rem");
      expect(getFontSize("xl")).toBe("1.25rem");
      expect(getFontSize("invalid", "1rem")).toBe("1rem");
    });

    it("should get border radius values correctly", () => {
      expect(getBorderRadius("md")).toBe("0.375rem");
      expect(getBorderRadius("lg")).toBe("0.5rem");
      expect(getBorderRadius("invalid", "0")).toBe("0");
    });
  });
});
