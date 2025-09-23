/**
 * Tests for enhanced i18n utilities and hooks
 */

import { interpolateTranslation, validateTranslationKey } from "../advanced-utils";
import { translationValidation } from "../utils";

describe("Enhanced i18n utilities", () => {
  describe("validateTranslationKey", () => {
    it("should validate correct translation keys", () => {
      const result = validateTranslationKey("common.button.save");
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject empty keys", () => {
      const result = validateTranslationKey("");
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Translation key cannot be empty");
    });

    it("should reject keys with invalid characters", () => {
      const result = validateTranslationKey("common.button@save");
      expect(result.isValid).toBe(false);
      expect(result.errors.some((error) => error.includes("Invalid characters"))).toBe(true);
    });

    it("should provide suggestions for invalid keys", () => {
      const result = validateTranslationKey("common..button");
      expect(result.isValid).toBe(false);
      expect(result.suggestions).toBeDefined();
    });
  });

  describe("interpolateTranslation", () => {
    it("should interpolate parameters correctly", () => {
      const text = "Hello {name}, you have {count} messages";
      const params = { name: "John", count: 5 };
      const result = interpolateTranslation(text, params);
      expect(result).toBe("Hello John, you have 5 messages");
    });

    it("should handle missing parameters gracefully", () => {
      const text = "Hello {name}, you have {count} messages";
      const params = { name: "John" };
      const result = interpolateTranslation(text, params);
      expect(result).toBe("Hello John, you have {count} messages");
    });

    it("should return original text when no parameters provided", () => {
      const text = "Hello world";
      const result = interpolateTranslation(text);
      expect(result).toBe("Hello world");
    });
  });

  describe("translationValidation", () => {
    const mockMessages = {
      common: {
        button: {
          save: "Save",
          cancel: "Cancel",
        },
      },
      product: {
        title: "Product",
      },
    };

    it("should detect existing translations", () => {
      expect(translationValidation.hasTranslation(mockMessages, "common.button.save")).toBe(true);
      expect(translationValidation.hasTranslation(mockMessages, "product.title")).toBe(true);
    });

    it("should detect missing translations", () => {
      expect(translationValidation.hasTranslation(mockMessages, "common.button.delete")).toBe(
        false
      );
      expect(translationValidation.hasTranslation(mockMessages, "nonexistent.key")).toBe(false);
    });

    it("should get nested keys correctly", () => {
      const keys = translationValidation.getNestedKeys(mockMessages);
      expect(keys).toContain("common.button.save");
      expect(keys).toContain("common.button.cancel");
      expect(keys).toContain("product.title");
    });

    it("should find missing keys", () => {
      const requiredKeys = ["common.button.save", "common.button.delete", "product.title"];
      const missing = translationValidation.getMissingKeys(mockMessages, requiredKeys);
      expect(missing).toEqual(["common.button.delete"]);
    });
  });
});
