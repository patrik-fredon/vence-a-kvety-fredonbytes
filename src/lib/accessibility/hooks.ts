"use client";

/**
 * React hooks for accessibility features
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { FocusTrap, generateId, announceToScreenReader, KeyboardNavigation } from './utils';

/**
 * Hook for managing focus trap in modals and dropdowns
 */
export function useFocusTrap(isActive: boolean) {
  const elementRef = useRef<HTMLElement>(null);
  const focusTrapRef = useRef<FocusTrap | null>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    if (isActive) {
      focusTrapRef.current = new FocusTrap(elementRef.current);
      focusTrapRef.current.activate();
    } else {
      focusTrapRef.current?.deactivate();
      focusTrapRef.current = null;
    }

    return () => {
      focusTrapRef.current?.deactivate();
    };
  }, [isActive]);

  return elementRef;
}

/**
 * Hook for generating stable IDs for form elements
 */
export function useId(prefix?: string): string {
  const [id] = useState(() => generateId(prefix));
  return id;
}

/**
 * Hook for managing ARIA live regions
 */
export function useAnnouncer() {
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    announceToScreenReader(message, priority);
  }, []);

  return announce;
}

/**
 * Hook for keyboard navigation in lists and grids
 */
export function useKeyboardNavigation<T extends HTMLElement>(
  items: T[],
  options: {
    orientation?: 'horizontal' | 'vertical' | 'both';
    wrap?: boolean;
    columns?: number;
    onActivate?: (index: number, element: T) => void;
  } = {}
) {
  const [currentIndex, setCurrentIndex] = useState(-1);
  const { orientation = 'vertical', wrap = true, columns = 1, onActivate } = options;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (items.length === 0) return;

    const newIndex = KeyboardNavigation.handleArrowKeys(
      event,
      items,
      currentIndex,
      { orientation, wrap, columns }
    );

    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
    }

    // Handle Enter and Space for activation
    if ((event.key === 'Enter' || event.key === ' ') && currentIndex >= 0) {
      event.preventDefault();
      onActivate?.(currentIndex, items[currentIndex]);
    }
  }, [items, currentIndex, orientation, wrap, columns, onActivate]);

  const focusItem = useCallback((index: number) => {
    if (index >= 0 && index < items.length) {
      setCurrentIndex(index);
      items[index].focus();
    }
  }, [items]);

  const resetFocus = useCallback(() => {
    setCurrentIndex(-1);
  }, []);

  return {
    currentIndex,
    handleKeyDown,
    focusItem,
    resetFocus
  };
}

/**
 * Hook for managing disclosure state (dropdowns, accordions)
 */
export function useDisclosure(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);
  const triggerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLElement>(null);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    // Return focus to trigger when closing
    triggerRef.current?.focus();
  }, []);

  const toggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isOpen && event.key === 'Escape') {
        close();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, close]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        contentRef.current &&
        triggerRef.current &&
        !contentRef.current.contains(event.target as Node) &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        close();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, close]);

  return {
    isOpen,
    open,
    close,
    toggle,
    triggerRef,
    contentRef
  };
}

/**
 * Hook for managing high contrast mode
 */
export function useHighContrast() {
  const [isHighContrast, setIsHighContrast] = useState(false);

  useEffect(() => {
    // Check initial state
    const checkHighContrast = () => {
      const hasClass = document.documentElement.classList.contains('high-contrast');
      const systemPreference = window.matchMedia('(prefers-contrast: high)').matches;
      const forcedColors = window.matchMedia('(forced-colors: active)').matches;

      setIsHighContrast(hasClass || systemPreference || forcedColors);
    };

    checkHighContrast();

    // Listen for changes
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    const forcedColorsQuery = window.matchMedia('(forced-colors: active)');

    mediaQuery.addEventListener('change', checkHighContrast);
    forcedColorsQuery.addEventListener('change', checkHighContrast);

    // Listen for class changes
    const observer = new MutationObserver(checkHighContrast);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => {
      mediaQuery.removeEventListener('change', checkHighContrast);
      forcedColorsQuery.removeEventListener('change', checkHighContrast);
      observer.disconnect();
    };
  }, []);

  const toggleHighContrast = useCallback(() => {
    document.documentElement.classList.toggle('high-contrast');
    localStorage.setItem('high-contrast', (!isHighContrast).toString());

    announceToScreenReader(
      !isHighContrast ? 'Vysoký kontrast zapnut' : 'Vysoký kontrast vypnut',
      'assertive'
    );
  }, [isHighContrast]);

  return {
    isHighContrast,
    toggleHighContrast
  };
}

/**
 * Hook for managing reduced motion preference
 */
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

/**
 * Hook for managing skip links
 */
export function useSkipLinks() {
  const skipToContent = useCallback(() => {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const skipToNavigation = useCallback(() => {
    const navigation = document.getElementById('main-navigation');
    if (navigation) {
      navigation.focus();
      navigation.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return {
    skipToContent,
    skipToNavigation
  };
}

/**
 * Hook for managing form accessibility
 */
export function useFormAccessibility() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const announce = useAnnouncer();

  const setFieldError = useCallback((fieldName: string, error: string) => {
    setErrors(prev => ({ ...prev, [fieldName]: error }));
    announce(`Chyba v poli ${fieldName}: ${error}`, 'assertive');
  }, [announce]);

  const clearFieldError = useCallback((fieldName: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  const getFieldProps = useCallback((fieldName: string) => {
    const hasError = fieldName in errors;
    const errorId = hasError ? `${fieldName}-error` : undefined;

    return {
      'aria-invalid': hasError,
      'aria-describedby': errorId,
      error: errors[fieldName]
    };
  }, [errors]);

  return {
    errors,
    setFieldError,
    clearFieldError,
    clearAllErrors,
    getFieldProps
  };
}
