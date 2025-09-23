/**
 * Test suite for funeral color system integration
 * Verifies that the funeral colors are properly integrated into the design system
 */

import { colorContrast, funeralColorUsage } from "../design-system";
import { designTokens } from "../design-tokens";

describe("Funeral Color System", () => {
  describe("Design Tokens", () => {
    test("should have funeral colors defined", () => {
      expect(designTokens.colors.funeral).toBeDefined();
      expect(designTokens.colors.funeral.hero).toBe("#102724");
      expect(designTokens.colors.funeral.background).toBe("#9B9259");
    });

    test("should have all required funeral color variants", () => {
      const funeralColors = designTokens.colors.funeral;

      expect(funeralColors.hero).toBe("#102724");
      expect(funeralColors.background).toBe("#9B9259");
      expect(funeralColors.heroLight).toBeDefined();
      expect(funeralColors.heroDark).toBeDefined();
      expect(funeralColors.backgroundLight).toBeDefined();
      expect(funeralColors.backgroundDark).toBeDefined();
      expect(funeralColors.textOnHero).toBeDefined();
      expect(funeralColors.textOnBackground).toBeDefined();
      expect(funeralColors.textSecondary).toBeDefined();
      expect(funeralColors.accent).toBeDefined();
    });
  });

  describe("Color Usage Guidelines", () => {
    test("should provide usage guidelines for hero section", () => {
      expect(funeralColorUsage.heroSection.className).toBe("bg-funeral-hero");
      expect(funeralColorUsage.heroSection.cssValue).toBe("#102724");
      expect(funeralColorUsage.heroSection.textColor).toBe("text-funeral-textOnHero");
    });

    test("should provide usage guidelines for page background", () => {
      expect(funeralColorUsage.pageBackground.className).toBe("bg-funeral-background");
      expect(funeralColorUsage.pageBackground.cssValue).toBe("#9B9259");
      expect(funeralColorUsage.pageBackground.textColor).toBe("text-funeral-textOnBackground");
    });

    test("should have all color variants defined", () => {
      const variants = funeralColorUsage.variants;

      expect(variants.heroLight.className).toBe("bg-funeral-heroLight");
      expect(variants.heroDark.className).toBe("bg-funeral-heroDark");
      expect(variants.backgroundLight.className).toBe("bg-funeral-backgroundLight");
      expect(variants.backgroundDark.className).toBe("bg-funeral-backgroundDark");
    });
  });

  describe("Color Contrast Validation", () => {
    test("should have validated color combinations", () => {
      expect(colorContrast.validCombinations).toHaveLength(3);

      const heroCombo = colorContrast.validCombinations.find(
        (combo) => combo.background === "#102724"
      );
      expect(heroCombo).toBeDefined();
      expect(heroCombo?.text).toBe("#FFFFFF");

      const backgroundCombo = colorContrast.validCombinations.find(
        (combo) => combo.background === "#9B9259" && combo.text === "#2D2D2D"
      );
      expect(backgroundCombo).toBeDefined();
    });

    test("should meet WCAG AA contrast requirements", () => {
      colorContrast.validCombinations.forEach((combo) => {
        const ratio = Number.parseFloat(combo.ratio);
        expect(ratio).toBeGreaterThanOrEqual(4.5);
      });
    });
  });

  describe("Requirements Compliance", () => {
    test("should meet Requirement 5.1 - hero background color", () => {
      expect(designTokens.colors.funeral.hero).toBe("#102724");
    });

    test("should meet Requirement 5.2 - page background color", () => {
      expect(designTokens.colors.funeral.background).toBe("#9B9259");
    });

    test("should meet Requirement 5.3 - funeral-appropriate mood", () => {
      // Verify that colors are muted and professional
      expect(designTokens.colors.funeral.hero).toMatch(/^#[0-9A-F]{6}$/i);
      expect(designTokens.colors.funeral.background).toMatch(/^#[0-9A-F]{6}$/i);

      // Verify that accent colors are available for highlights
      expect(designTokens.colors.funeral.accent).toBeDefined();
      expect(designTokens.colors.funeral.accent).toBe("#D4AF37");
    });
  });
});
