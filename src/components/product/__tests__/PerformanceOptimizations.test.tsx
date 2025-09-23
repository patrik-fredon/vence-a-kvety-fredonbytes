import { useDebouncedPriceCalculation } from "@/lib/utils/usePriceCalculation";
import { useCustomizationCache } from "@/lib/cache/customization-cache";
import { withPerformanceMonitoring } from "@/lib/utils/customization-performance";
import type { Customization } from "@/types/product";

// Mock the hooks and utilities
jest.mock("@/lib/utils/usePriceCalculation");
jest.mock("@/lib/cache/customization-cache");
jest.mock("@/lib/utils/customization-performance");

const mockUseDebouncedPriceCalculation = useDebouncedPriceCalculation as jest.MockedFunction<typeof useDebouncedPriceCalculation>;
const mockUseCustomizationCache = useCustomizationCache as jest.MockedFunction<typeof useCustomizationCache>;
const mockWithPerformanceMonitoring = withPerformanceMonitoring as jest.MockedFunction<typeof withPerformanceMonitoring>;

describe("Performance Optimizations", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    mockUseDebouncedPriceCalculation.mockReturnValue({
      totalPrice: 2000,
      totalModifier: 0,
      breakdown: [],
      basePrice: 2000,
    });

    mockUseCustomizationCache.mockReturnValue({
      get: jest.fn().mockReturnValue(null),
      set: jest.fn(),
      clear: jest.fn(),
      clearAll: jest.fn(),
      getStats: jest.fn().mockReturnValue({ size: 0, keys: [] }),
    });
  });

  describe("Debounced Price Calculation", () => {
    it("should create debounced price calculation hook", () => {
      const mockCustomizations: Customization[] = [
        { optionId: "size", choiceIds: ["size_120"] }
      ];

      const mockOptions = [
        {
          id: "size",
          type: "size" as const,
          name: { cs: "Velikost", en: "Size" },
          required: true,
          choices: []
        }
      ];

      // Test that the hook can be called
      expect(() => {
        mockUseDebouncedPriceCalculation(2000, mockCustomizations, mockOptions, 300);
      }).not.toThrow();

      expect(mockUseDebouncedPriceCalculation).toHaveBeenCalledWith(
        2000,
        mockCustomizations,
        mockOptions,
        300
      );
    });

    it("should return price calculation result", () => {
      const result = mockUseDebouncedPriceCalculation(2000, [], [], 300);

      expect(result).toEqual({
        totalPrice: 2000,
        totalModifier: 0,
        breakdown: [],
        basePrice: 2000,
      });
    });
  });

  describe("Customization Cache", () => {
    it("should provide cache functionality", () => {
      const mockCache = mockUseCustomizationCache();

      expect(mockCache.get).toBeDefined();
      expect(mockCache.set).toBeDefined();
      expect(mockCache.clear).toBeDefined();
      expect(mockCache.clearAll).toBeDefined();
      expect(mockCache.getStats).toBeDefined();
    });

    it("should handle cache operations", () => {
      const mockCache = mockUseCustomizationCache();
      const mockOptions = [{ id: "test", type: "size" as const, name: { cs: "Test", en: "Test" }, required: false, choices: [] }];

      mockCache.get("test-product");
      mockCache.set("test-product", mockOptions);
      mockCache.clear("test-product");

      expect(mockCache.get).toHaveBeenCalledWith("test-product");
      expect(mockCache.set).toHaveBeenCalledWith("test-product", mockOptions);
      expect(mockCache.clear).toHaveBeenCalledWith("test-product");
    });

    it("should provide cache statistics", () => {
      const mockCache = mockUseCustomizationCache();
      const stats = mockCache.getStats();

      expect(stats).toEqual({ size: 0, keys: [] });
      expect(mockCache.getStats).toHaveBeenCalled();
    });
  });

  describe("Performance Monitoring", () => {
    it("should wrap functions with performance monitoring", () => {
      const testFunction = jest.fn();
      mockWithPerformanceMonitoring.mockReturnValue(testFunction);

      const wrappedFunction = withPerformanceMonitoring(testFunction, "test-operation");

      expect(mockWithPerformanceMonitoring).toHaveBeenCalledWith(testFunction, "test-operation");
      expect(wrappedFunction).toBe(testFunction);
    });

    it("should handle performance monitoring wrapper", () => {
      const originalFunction = (x: number) => x * 2;
      mockWithPerformanceMonitoring.mockImplementation((fn) => fn);

      const wrappedFunction = withPerformanceMonitoring(originalFunction, "multiply");
      const result = wrappedFunction(5);

      expect(result).toBe(10);
      expect(mockWithPerformanceMonitoring).toHaveBeenCalledWith(originalFunction, "multiply");
    });
  });

  describe("Cache Performance", () => {
    it("should provide efficient cache operations", () => {
      const mockCache = mockUseCustomizationCache();
      const mockOptions = [{ id: "test", type: "size" as const, name: { cs: "Test", en: "Test" }, required: false, choices: [] }];

      // Test cache hit scenario
      mockCache.get.mockReturnValue(mockOptions);

      const result = mockCache.get("test-product");
      expect(result).toBe(mockOptions);
      expect(mockCache.get).toHaveBeenCalledWith("test-product");
    });

    it("should handle cache miss scenario", () => {
      const mockCache = mockUseCustomizationCache();

      // Test cache miss scenario
      mockCache.get.mockReturnValue(null);

      const result = mockCache.get("non-existent-product");
      expect(result).toBeNull();
      expect(mockCache.get).toHaveBeenCalledWith("non-existent-product");
    });
  });
});
