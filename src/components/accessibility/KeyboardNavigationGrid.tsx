/**
 * Keyboard navigation wrapper for product grids and lists
 * Provides arrow key navigation and proper focus management
 */

'use client';

import { useRef, useEffect, useCallback } from 'react';
import { useKeyboardNavigation } from '@/lib/accessibility/hooks';

interface KeyboardNavigationGridProps {
  children: React.ReactNode;
  className?: string;
  columns?: number;
  orientation?: 'horizontal' | 'vertical' | 'both';
  wrap?: boolean;
  onItemActivate?: (index: number, element: HTMLElement) => void;
  role?: string;
  ariaLabel?: string;
}

export function KeyboardNavigationGrid({
  children,
  className = '',
  columns = 1,
  orientation = 'both',
  wrap = true,
  onItemActivate,
  role = 'grid',
  ariaLabel
}: KeyboardNavigationGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLElement[]>([]);

  // Update items when children change
  useEffect(() => {
    if (containerRef.current) {
      const focusableElements = containerRef.current.querySelectorAll(
        '[data-keyboard-nav-item]'
      ) as NodeListOf<HTMLElement>;
      itemsRef.current = Array.from(focusableElements);
    }
  }, [children]);

  const { currentIndex, handleKeyDown, focusItem, resetFocus } = useKeyboardNavigation(
    itemsRef.current,
    {
      orientation,
      wrap,
      columns,
      onActivate: onItemActivate
    }
  );

  const handleContainerKeyDown = useCallback((event: React.KeyboardEvent) => {
    handleKeyDown(event.nativeEvent);
  }, [handleKeyDown]);

  const handleContainerFocus = useCallback((event: React.FocusEvent) => {
    // If focus enters the container and no item is focused, focus the first item
    if (event.target === containerRef.current && itemsRef.current.length > 0) {
      focusItem(0);
    }
  }, [focusItem]);

  const handleContainerBlur = useCallback((event: React.FocusEvent) => {
    // If focus leaves the container entirely, reset focus state
    if (!containerRef.current?.contains(event.relatedTarget as Node)) {
      resetFocus();
    }
  }, [resetFocus]);

  return (
    <div
      ref={containerRef}
      className={className}
      role={role}
      aria-label={ariaLabel}
      tabIndex={-1}
      onKeyDown={handleContainerKeyDown}
      onFocus={handleContainerFocus}
      onBlur={handleContainerBlur}
    >
      {children}
    </div>
  );
}
