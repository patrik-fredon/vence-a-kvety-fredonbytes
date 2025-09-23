import { cn, debounce, formatPrice, isEmpty, slugify } from "../utils";

describe("Utils", () => {
  describe("cn (className merger)", () => {
    it("should merge classes correctly", () => {
      expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
    });

    it("should handle conditional classes", () => {
      expect(cn("base-class", "conditional-class")).toBe("base-class conditional-class");
      expect(cn("base-class", false)).toBe("base-class");
    });

    it("should handle arrays and objects", () => {
      expect(cn(["class1", "class2"], { class3: true, class4: false })).toBe(
        "class1 class2 class3"
      );
    });
  });

  describe("formatPrice", () => {
    it("should format Czech prices correctly", () => {
      expect(formatPrice(1500, "cs")).toBe("1 500 Kč");
      expect(formatPrice(999, "cs")).toBe("999 Kč");
    });

    it("should format English prices correctly", () => {
      expect(formatPrice(1500, "en")).toBe("CZK 1,500");
      expect(formatPrice(999, "en")).toBe("CZK 999");
    });

    it("should default to Czech locale", () => {
      expect(formatPrice(1000)).toBe("1 000 Kč");
    });
  });

  describe("slugify", () => {
    it("should create URL-friendly slugs", () => {
      expect(slugify("Hello World")).toBe("hello-world");
      expect(slugify("Pohřební věnce")).toBe("pohrebni-vence");
      expect(slugify("Test & Special Characters!")).toBe("test-special-characters");
    });

    it("should handle multiple spaces and hyphens", () => {
      expect(slugify("  Multiple   Spaces  ")).toBe("multiple-spaces");
      expect(slugify("Already-Has-Hyphens")).toBe("already-has-hyphens");
    });

    it("should remove leading and trailing hyphens", () => {
      expect(slugify("-Leading and trailing-")).toBe("leading-and-trailing");
    });
  });

  describe("debounce", () => {
    jest.useFakeTimers();

    it("should debounce function calls", () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn("test1");
      debouncedFn("test2");
      debouncedFn("test3");

      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("test3");
    });

    afterEach(() => {
      jest.clearAllTimers();
    });
  });

  describe("isEmpty", () => {
    it("should detect empty values", () => {
      expect(isEmpty(null)).toBe(true);
      expect(isEmpty(undefined)).toBe(true);
      expect(isEmpty("")).toBe(true);
      expect(isEmpty("   ")).toBe(true);
      expect(isEmpty([])).toBe(true);
      expect(isEmpty({})).toBe(true);
    });

    it("should detect non-empty values", () => {
      expect(isEmpty("hello")).toBe(false);
      expect(isEmpty([1, 2, 3])).toBe(false);
      expect(isEmpty({ key: "value" })).toBe(false);
      expect(isEmpty(0)).toBe(false);
      expect(isEmpty(false)).toBe(false);
    });
  });
});
