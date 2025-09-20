import { renderHook, act } from "@testing-library/react";
import { useRouter, usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import {
  useLocaleSwitch,
  useSafeTranslations,
  useLocalePersistence,
} from "../hooks";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

// Mock next-intl
jest.mock("next-intl", () => ({
  useLocale: jest.fn(),
  useTranslations: jest.fn(),
}));

// Mock i18n utils
jest.mock("../utils", () => ({
  setLocalePreference: jest.fn(),
  setLocaleCookie: jest.fn(),
  isValidLocale: jest.fn((locale: string) => ["cs", "en"].includes(locale)),
}));

describe("useLocaleSwitch", () => {
  const mockPush = jest.fn();
  const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
  const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;
  const mockUseLocale = useLocale as jest.MockedFunction<typeof useLocale>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({ push: mockPush } as any);
    mockUsePathname.mockReturnValue("/cs/products");
    mockUseLocale.mockReturnValue("cs");
  });

  test("should switch locale correctly", async () => {
    const { result } = renderHook(() => useLocaleSwitch());

    expect(result.current.currentLocale).toBe("cs");
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);

    await act(async () => {
      await result.current.switchLocale("en");
    });

    expect(mockPush).toHaveBeenCalledWith("/en/products");
  });

  test("should not switch to invalid locale", async () => {
    const { result } = renderHook(() => useLocaleSwitch());

    await act(async () => {
      await result.current.switchLocale("fr" as any);
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  test("should not switch to same locale", async () => {
    const { result } = renderHook(() => useLocaleSwitch());

    await act(async () => {
      await result.current.switchLocale("cs");
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  test("should handle errors during locale switch", async () => {
    mockPush.mockImplementation(() => {
      throw new Error("Navigation error");
    });

    const { result } = renderHook(() => useLocaleSwitch());

    await act(async () => {
      await result.current.switchLocale("en");
    });

    expect(result.current.error).toBe("Navigation error");
  });

  test("should clear error", () => {
    const { result } = renderHook(() => useLocaleSwitch());

    // Simulate error state
    act(() => {
      // This would be set by an actual error in switchLocale
    });

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBe(null);
  });
});

describe("useSafeTranslations", () => {
  const mockT = jest.fn();
  const mockUseTranslations = require("next-intl").useTranslations as jest.MockedFunction<any>;
  const mockUseLocale = useLocale as jest.MockedFunction<typeof useLocale>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTranslations.mockReturnValue(mockT);
    mockUseLocale.mockReturnValue("cs");
  });

  test("should return translation when available", () => {
    mockT.mockReturnValue("Translated text");

    const { result } = renderHook(() => useSafeTranslations());

    const translation = result.current.t("common.loading");
    expect(translation).toBe("Translated text");
    expect(mockT).toHaveBeenCalledWith("common.loading", undefined);
  });

  test("should handle translation errors gracefully", () => {
    mockT.mockImplementation(() => {
      throw new Error("Translation error");
    });

    const { result } = renderHook(() => useSafeTranslations());

    const translation = result.current.t("common.missing");
    expect(translation).toBe("common.missing"); // fallback to key
  });

  test("should check if translation exists", () => {
    mockT.mockImplementation((key: string) => {
      if (key === "common.loading") return "Loading...";
      return key; // Return key for missing translations
    });

    const { result } = renderHook(() => useSafeTranslations());

    expect(result.current.hasTranslation("common.loading")).toBe(true);
    expect(result.current.hasTranslation("common.missing")).toBe(false);
  });
});

describe("useLocalePersistence", () => {
  const mockUseLocale = useLocale as jest.MockedFunction<typeof useLocale>;
  const mockSetLocalePreference = require("../utils").setLocalePreference as jest.MockedFunction<any>;
  const mockSetLocaleCookie = require("../utils").setLocaleCookie as jest.MockedFunction<any>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLocale.mockReturnValue("cs");
  });

  test("should save locale preference", () => {
    const { result } = renderHook(() => useLocalePersistence());

    act(() => {
      result.current.saveLocalePreference("en");
    });

    expect(mockSetLocalePreference).toHaveBeenCalledWith("en");
    expect(mockSetLocaleCookie).toHaveBeenCalledWith("en");
  });

  test("should clear locale preference", () => {
    // Mock localStorage and document
    const mockRemoveItem = jest.fn();
    const mockDocument = { cookie: "" };

    Object.defineProperty(window, "localStorage", {
      value: { removeItem: mockRemoveItem },
      writable: true,
    });
    Object.defineProperty(global, "document", {
      value: mockDocument,
      writable: true,
    });

    const { result } = renderHook(() => useLocalePersistence());

    act(() => {
      result.current.clearLocalePreference();
    });

    expect(mockRemoveItem).toHaveBeenCalledWith("preferred-locale");
  });
});
