/**
 * Accessibility utilities for the funeral wreaths e-commerce platform
 * Provides functions for managing focus, keyboard navigation, and screen reader support
 */

/**
 * Generates a unique ID for form elements and ARIA relationships
 */
export function generateId(prefix: string = 'element'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Manages focus trap for modals and dropdowns
 */
export class FocusTrap {
  private element: HTMLElement;
  private focusableElements: HTMLElement[];
  private firstFocusableElement: HTMLElement | null = null;
  private lastFocusableElement: HTMLElement | null = null;
  private previousActiveElement: Element | null = null;

  constructor(element: HTMLElement) {
    this.element = element;
    this.focusableElements = this.getFocusableElements();
    this.updateFocusableElements();
  }

  private getFocusableElements(): HTMLElement[] {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');

    return Array.from(this.element.querySelectorAll(focusableSelectors)) as HTMLElement[];
  }

  private updateFocusableElements(): void {
    this.focusableElements = this.getFocusableElements();
    this.firstFocusableElement = this.focusableElements[0] || null;
    this.lastFocusableElement = this.focusableElements[this.focusableElements.length - 1] || null;
  }

  public activate(): void {
    this.previousActiveElement = document.activeElement;
    this.updateFocusableElements();

    if (this.firstFocusableElement) {
      this.firstFocusableElement.focus();
    }

    document.addEventListener('keydown', this.handleKeyDown);
  }

  public deactivate(): void {
    document.removeEventListener('keydown', this.handleKeyDown);

    if (this.previousActiveElement && 'focus' in this.previousActiveElement) {
      (this.previousActiveElement as HTMLElement).focus();
    }
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key !== 'Tab') return;

    this.updateFocusableElements();

    if (this.focusableElements.length === 0) {
      event.preventDefault();
      return;
    }

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === this.firstFocusableElement) {
        event.preventDefault();
        this.lastFocusableElement?.focus();
      }
    } else {
      // Tab
      if (document.activeElement === this.lastFocusableElement) {
        event.preventDefault();
        this.firstFocusableElement?.focus();
      }
    }
  };
}

/**
 * Announces messages to screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove the announcement after a short delay
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Checks if an element is visible to screen readers
 */
export function isElementVisible(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element);
  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    style.opacity !== '0' &&
    element.getAttribute('aria-hidden') !== 'true'
  );
}

/**
 * Gets the accessible name of an element
 */
export function getAccessibleName(element: HTMLElement): string {
  // Check aria-label first
  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel) return ariaLabel;

  // Check aria-labelledby
  const ariaLabelledBy = element.getAttribute('aria-labelledby');
  if (ariaLabelledBy) {
    const labelElement = document.getElementById(ariaLabelledBy);
    if (labelElement) return labelElement.textContent || '';
  }

  // Check associated label for form elements
  if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT') {
    const id = element.getAttribute('id');
    if (id) {
      const label = document.querySelector(`label[for="${id}"]`);
      if (label) return label.textContent || '';
    }
  }

  // Fall back to text content
  return element.textContent || '';
}

/**
 * Keyboard navigation utilities
 */
export const KeyboardNavigation = {
  /**
   * Handles arrow key navigation for lists and grids
   */
  handleArrowKeys(
    event: KeyboardEvent,
    elements: HTMLElement[],
    currentIndex: number,
    options: {
      orientation?: 'horizontal' | 'vertical' | 'both';
      wrap?: boolean;
      columns?: number;
    } = {}
  ): number {
    const { orientation = 'vertical', wrap = true, columns = 1 } = options;
    let newIndex = currentIndex;

    switch (event.key) {
      case 'ArrowUp':
        if (orientation === 'vertical' || orientation === 'both') {
          event.preventDefault();
          newIndex = currentIndex - columns;
          if (newIndex < 0 && wrap) {
            newIndex = elements.length - 1;
          } else if (newIndex < 0) {
            newIndex = currentIndex;
          }
        }
        break;

      case 'ArrowDown':
        if (orientation === 'vertical' || orientation === 'both') {
          event.preventDefault();
          newIndex = currentIndex + columns;
          if (newIndex >= elements.length && wrap) {
            newIndex = 0;
          } else if (newIndex >= elements.length) {
            newIndex = currentIndex;
          }
        }
        break;

      case 'ArrowLeft':
        if (orientation === 'horizontal' || orientation === 'both') {
          event.preventDefault();
          newIndex = currentIndex - 1;
          if (newIndex < 0 && wrap) {
            newIndex = elements.length - 1;
          } else if (newIndex < 0) {
            newIndex = currentIndex;
          }
        }
        break;

      case 'ArrowRight':
        if (orientation === 'horizontal' || orientation === 'both') {
          event.preventDefault();
          newIndex = currentIndex + 1;
          if (newIndex >= elements.length && wrap) {
            newIndex = 0;
          } else if (newIndex >= elements.length) {
            newIndex = currentIndex;
          }
        }
        break;

      case 'Home':
        event.preventDefault();
        newIndex = 0;
        break;

      case 'End':
        event.preventDefault();
        newIndex = elements.length - 1;
        break;
    }

    if (newIndex !== currentIndex && elements[newIndex]) {
      elements[newIndex].focus();
    }

    return newIndex;
  },

  /**
   * Handles escape key to close modals/dropdowns
   */
  handleEscape(event: KeyboardEvent, callback: () => void): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      callback();
    }
  }
};

/**
 * High contrast mode detection and utilities
 */
export const HighContrast = {
  /**
   * Detects if high contrast mode is enabled
   */
  isEnabled(): boolean {
    // Check for Windows high contrast mode
    if (window.matchMedia('(prefers-contrast: high)').matches) {
      return true;
    }

    // Check for forced colors (Windows high contrast)
    if (window.matchMedia('(forced-colors: active)').matches) {
      return true;
    }

    // Check for custom high contrast setting
    return document.documentElement.classList.contains('high-contrast');
  },

  /**
   * Toggles high contrast mode
   */
  toggle(): void {
    document.documentElement.classList.toggle('high-contrast');
    localStorage.setItem('high-contrast', this.isEnabled().toString());

    // Announce the change
    announceToScreenReader(
      this.isEnabled() ? 'Vysoký kontrast zapnut' : 'Vysoký kontrast vypnut',
      'assertive'
    );
  },

  /**
   * Initializes high contrast mode from user preferences
   */
  initialize(): void {
    const saved = localStorage.getItem('high-contrast');
    const systemPreference = window.matchMedia('(prefers-contrast: high)').matches;

    if (saved === 'true' || (saved === null && systemPreference)) {
      document.documentElement.classList.add('high-contrast');
    }
  }
};

/**
 * Reduced motion utilities
 */
export const ReducedMotion = {
  /**
   * Checks if user prefers reduced motion
   */
  isPreferred(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  /**
   * Conditionally applies animation based on user preference
   */
  conditionalAnimation(element: HTMLElement, animationClass: string): void {
    if (!this.isPreferred()) {
      element.classList.add(animationClass);
    }
  }
};
