/**
 * Accessibility validation utilities for WCAG 2.1 AA compliance
 * Provides functions to validate color contrast, keyboard navigation, and ARIA attributes
 */

/**
 * Color contrast validation according to WCAG 2.1 AA standards
 */
export class ColorContrast {
  /**
   * Converts hex color to RGB values
   */
  private static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: Number.parseInt(result[1]!, 16),
          g: Number.parseInt(result[2]!, 16),
          b: Number.parseInt(result[3]!, 16),
        }
      : null;
  }

  /**
   * Calculates relative luminance of a color
   */
  private static getLuminance(r: number, g: number, b: number): number {
    const [rs, gs, bs] = [r, g, b].map((c) => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    }) as [number, number, number];
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  /**
   * Calculates contrast ratio between two colors
   */
  static getContrastRatio(color1: string, color2: string): number {
    const rgb1 = ColorContrast.hexToRgb(color1);
    const rgb2 = ColorContrast.hexToRgb(color2);

    if (!(rgb1 && rgb2)) return 0;

    const lum1 = ColorContrast.getLuminance(rgb1.r, rgb1.g, rgb1.b);
    const lum2 = ColorContrast.getLuminance(rgb2.r, rgb2.g, rgb2.b);

    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);

    return (brightest + 0.05) / (darkest + 0.05);
  }

  /**
   * Validates if contrast ratio meets WCAG AA standards
   */
  static meetsWCAGAA(foreground: string, background: string, isLargeText = false): boolean {
    const ratio = ColorContrast.getContrastRatio(foreground, background);
    return isLargeText ? ratio >= 3 : ratio >= 4.5;
  }

  /**
   * Validates if contrast ratio meets WCAG AAA standards
   */
  static meetsWCAGAAA(foreground: string, background: string, isLargeText = false): boolean {
    const ratio = ColorContrast.getContrastRatio(foreground, background);
    return isLargeText ? ratio >= 4.5 : ratio >= 7;
  }
}

/**
 * ARIA validation utilities
 */
export class ARIAValidator {
  /**
   * Validates required ARIA attributes for interactive elements
   */
  static validateInteractiveElement(element: HTMLElement): string[] {
    const errors: string[] = [];
    const tagName = element.tagName.toLowerCase();
    const role = element.getAttribute("role");

    // Check for accessible name
    if (!ARIAValidator.hasAccessibleName(element)) {
      errors.push(
        "Interactive element missing accessible name (aria-label, aria-labelledby, or text content)"
      );
    }

    // Check for proper role
    if (role && !ARIAValidator.isValidRole(role)) {
      errors.push(`Invalid ARIA role: ${role}`);
    }

    // Check for required ARIA attributes based on role
    const requiredAttrs = ARIAValidator.getRequiredAttributes(role || tagName);
    for (const attr of requiredAttrs) {
      if (!element.hasAttribute(attr)) {
        errors.push(`Missing required ARIA attribute: ${attr}`);
      }
    }

    return errors;
  }

  /**
   * Checks if element has an accessible name
   */
  private static hasAccessibleName(element: HTMLElement): boolean {
    // Check aria-label
    if (element.getAttribute("aria-label")) return true;

    // Check aria-labelledby
    const labelledBy = element.getAttribute("aria-labelledby");
    if (labelledBy) {
      const labelElement = document.getElementById(labelledBy);
      if (labelElement && labelElement.textContent?.trim()) return true;
    }

    // Check associated label for form elements
    if (["input", "textarea", "select"].includes(element.tagName.toLowerCase())) {
      const id = element.getAttribute("id");
      if (id) {
        const label = document.querySelector(`label[for="${id}"]`);
        if (label && label.textContent?.trim()) return true;
      }
    }

    // Check text content
    if (element.textContent?.trim()) return true;

    // Check alt attribute for images
    if (element.tagName.toLowerCase() === "img" && element.getAttribute("alt")) return true;

    return false;
  }

  /**
   * Validates if ARIA role is valid
   */
  private static isValidRole(role: string): boolean {
    const validRoles = [
      "alert",
      "alertdialog",
      "application",
      "article",
      "banner",
      "button",
      "cell",
      "checkbox",
      "columnheader",
      "combobox",
      "complementary",
      "contentinfo",
      "definition",
      "dialog",
      "directory",
      "document",
      "feed",
      "figure",
      "form",
      "grid",
      "gridcell",
      "group",
      "heading",
      "img",
      "link",
      "list",
      "listbox",
      "listitem",
      "log",
      "main",
      "marquee",
      "math",
      "menu",
      "menubar",
      "menuitem",
      "menuitemcheckbox",
      "menuitemradio",
      "navigation",
      "none",
      "note",
      "option",
      "presentation",
      "progressbar",
      "radio",
      "radiogroup",
      "region",
      "row",
      "rowgroup",
      "rowheader",
      "scrollbar",
      "search",
      "searchbox",
      "separator",
      "slider",
      "spinbutton",
      "status",
      "switch",
      "tab",
      "table",
      "tablist",
      "tabpanel",
      "term",
      "textbox",
      "timer",
      "toolbar",
      "tooltip",
      "tree",
      "treegrid",
      "treeitem",
    ];
    return validRoles.includes(role);
  }

  /**
   * Gets required ARIA attributes for a given role or element
   */
  private static getRequiredAttributes(roleOrTag: string): string[] {
    const requirements: Record<string, string[]> = {
      button: [],
      checkbox: ["aria-checked"],
      radio: ["aria-checked"],
      slider: ["aria-valuenow", "aria-valuemin", "aria-valuemax"],
      spinbutton: ["aria-valuenow"],
      progressbar: ["aria-valuenow"],
      tab: ["aria-selected"],
      tabpanel: ["aria-labelledby"],
      listbox: [],
      option: ["aria-selected"],
      combobox: ["aria-expanded"],
      dialog: ["aria-labelledby"],
      alertdialog: ["aria-labelledby"],
    };

    return requirements[roleOrTag] || [];
  }
}

/**
 * Keyboard navigation validation
 */
export class KeyboardValidator {
  /**
   * Validates keyboard accessibility of an element
   */
  static validateKeyboardAccess(element: HTMLElement): string[] {
    const errors: string[] = [];

    // Check if interactive element is focusable
    if (
      KeyboardValidator.isInteractiveElement(element) &&
      !KeyboardValidator.isFocusable(element)
    ) {
      errors.push("Interactive element is not keyboard focusable");
    }

    // Check for proper tabindex usage
    const tabIndex = element.getAttribute("tabindex");
    if (tabIndex && Number.parseInt(tabIndex) < -1) {
      errors.push("Invalid tabindex value (should be -1, 0, or positive integer)");
    }

    // Check for keyboard event handlers on non-interactive elements
    if (
      !KeyboardValidator.isInteractiveElement(element) &&
      KeyboardValidator.hasClickHandler(element)
    ) {
      if (!(element.hasAttribute("tabindex") && KeyboardValidator.hasKeyboardHandlers(element))) {
        errors.push("Clickable element missing keyboard support");
      }
    }

    return errors;
  }

  /**
   * Checks if element is interactive
   */
  private static isInteractiveElement(element: HTMLElement): boolean {
    const interactiveTags = ["button", "a", "input", "select", "textarea"];
    const interactiveRoles = ["button", "link", "checkbox", "radio", "tab", "menuitem"];

    const tagName = element.tagName.toLowerCase();
    const role = element.getAttribute("role");

    return (
      interactiveTags.includes(tagName) ||
      (role && interactiveRoles.includes(role)) ||
      element.hasAttribute("onclick")
    );
  }

  /**
   * Checks if element is focusable
   */
  private static isFocusable(element: HTMLElement): boolean {
    const tabIndex = element.getAttribute("tabindex");

    // Elements with tabindex="-1" are programmatically focusable but not tab-focusable
    if (tabIndex === "-1") return true;

    // Elements with positive tabindex are focusable
    if (tabIndex && Number.parseInt(tabIndex) >= 0) return true;

    // Naturally focusable elements
    const focusableTags = ["button", "input", "select", "textarea", "a"];
    const tagName = element.tagName.toLowerCase();

    if (focusableTags.includes(tagName)) {
      // Check if element is disabled
      if ("disabled" in element && (element as any).disabled) return false;

      // Check if link has href
      if (tagName === "a" && !element.hasAttribute("href")) return false;

      return true;
    }

    return false;
  }

  /**
   * Checks if element has click handlers
   */
  private static hasClickHandler(element: HTMLElement): boolean {
    return element.hasAttribute("onclick") || element.addEventListener !== undefined; // This is a simplified check
  }

  /**
   * Checks if element has keyboard event handlers
   */
  private static hasKeyboardHandlers(element: HTMLElement): boolean {
    return (
      element.hasAttribute("onkeydown") ||
      element.hasAttribute("onkeyup") ||
      element.hasAttribute("onkeypress")
    );
  }
}

/**
 * Comprehensive accessibility audit function
 */
export function auditAccessibility(container: HTMLElement = document.body): {
  errors: string[];
  warnings: string[];
  passed: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  const passed: string[] = [];

  // Find all interactive elements
  const interactiveElements = container.querySelectorAll(
    'button, a, input, select, textarea, [role="button"], [role="link"], [tabindex], [onclick]'
  );

  interactiveElements.forEach((element, index) => {
    const htmlElement = element as HTMLElement;
    const elementId = `Element ${index + 1} (${htmlElement.tagName.toLowerCase()})`;

    // ARIA validation
    const ariaErrors = ARIAValidator.validateInteractiveElement(htmlElement);
    if (ariaErrors.length > 0) {
      errors.push(`${elementId}: ${ariaErrors.join(", ")}`);
    } else {
      passed.push(`${elementId}: ARIA attributes valid`);
    }

    // Keyboard validation
    const keyboardErrors = KeyboardValidator.validateKeyboardAccess(htmlElement);
    if (keyboardErrors.length > 0) {
      errors.push(`${elementId}: ${keyboardErrors.join(", ")}`);
    } else {
      passed.push(`${elementId}: Keyboard accessible`);
    }
  });

  // Check for images without alt text
  const images = container.querySelectorAll("img");
  images.forEach((img, index) => {
    const alt = img.getAttribute("alt");
    if (alt === null) {
      errors.push(`Image ${index + 1}: Missing alt attribute`);
    } else if (alt === "" && !img.hasAttribute("role")) {
      warnings.push(
        `Image ${index + 1}: Empty alt attribute (decorative image should have role="presentation")`
      );
    } else {
      passed.push(`Image ${index + 1}: Alt text provided`);
    }
  });

  // Check for proper heading hierarchy
  const headings = container.querySelectorAll("h1, h2, h3, h4, h5, h6");
  let previousLevel = 0;
  headings.forEach((heading, index) => {
    const level = Number.parseInt(heading.tagName.charAt(1));
    if (index === 0 && level !== 1) {
      warnings.push(`Heading ${index + 1}: Page should start with h1`);
    } else if (level > previousLevel + 1) {
      warnings.push(`Heading ${index + 1}: Skipped heading level (h${previousLevel} to h${level})`);
    } else {
      passed.push(`Heading ${index + 1}: Proper heading level`);
    }
    previousLevel = level;
  });

  return { errors, warnings, passed };
}

/**
 * Validates design system color combinations for accessibility
 */
export function validateDesignSystemColors(): {
  compliant: Array<{ combination: string; ratio: number }>;
  nonCompliant: Array<{ combination: string; ratio: number; required: number }>;
} {
  // Import design tokens (this would need to be adjusted based on actual import structure)
  const colors = {
    primary: "#2D5016",
    secondary: "#6F7752", // Updated to match the corrected design token
    accent: "#D4AF37",
    neutral: {
      50: "#F8F9FA",
      900: "#212529",
    },
    white: "#FFFFFF",
  };

  const compliant: Array<{ combination: string; ratio: number }> = [];
  const nonCompliant: Array<{ combination: string; ratio: number; required: number }> = [];

  // Test common color combinations
  const combinations = [
    { fg: colors.primary, bg: colors.white, name: "Primary on White" },
    { fg: colors.secondary, bg: colors.white, name: "Secondary on White" },
    { fg: colors.accent, bg: colors.white, name: "Accent on White" },
    { fg: colors.white, bg: colors.primary, name: "White on Primary" },
    { fg: colors.white, bg: colors.secondary, name: "White on Secondary" },
    { fg: colors.neutral[900], bg: colors.neutral[50], name: "Dark text on Light background" },
  ];

  combinations.forEach(({ fg, bg, name }) => {
    const ratio = ColorContrast.getContrastRatio(fg, bg);
    const meetsAA = ColorContrast.meetsWCAGAA(fg, bg);

    if (meetsAA) {
      compliant.push({ combination: name, ratio });
    } else {
      nonCompliant.push({ combination: name, ratio, required: 4.5 });
    }
  });

  return { compliant, nonCompliant };
}
