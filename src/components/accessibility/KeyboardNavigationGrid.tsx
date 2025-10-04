/**
 * Keyboard navigation grid component for product listings and other grid layouts
 * Provides arrow key navigation, focus management, and screen reader support
 */

"use client";

import { useTranslations } from "next-intl";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useAnnouncer, useKeyboardNavigation } from "@/lib/accessibility/hooks";

interface KeyboardNavigationGridProps {
  children: React.ReactElement[];
  columns?: number;
  ariaLabel?: string;
  onItemActivate?: (index: number, element: HTMLElement) => void;
  className?: string;
}

export function KeyboardNavigationGrid({
  children,
  columns = 3,
  ariaLabel,
  onItemActivate,
  className = "",
}: KeyboardNavigationGridProps) {
  const t = useTranslations("accessibility");
  const announce = useAnnouncer();
  const gridRef = useRef<HTMLDivElement>(null);
  const [gridItems, setGridItems] = useState<HTMLElement[]>([]);

  // Update grid items when children change
  useEffect(() => {
    if (gridRef.current) {
      const items = Array.from(
        gridRef.current.querySelectorAll("[data-grid-item]")
      ) as HTMLElement[];
      setGridItems(items);
    }
  }, [children]);

  const handleItemActivate = useCallback(
    (index: number, element: HTMLElement) => {
      announce(`Aktivován prvek ${index + 1} z ${gridItems.length}`, "polite");
      onItemActivate?.(index, element);
    },
    [announce, gridItems.length, onItemActivate]
  );

  const { currentIndex, handleKeyDown, focusItem } = useKeyboardNavigation(gridItems, {
    orientation: "both",
    wrap: true,
    columns,
    onActivate: handleItemActivate,
  });

  // Handle grid-level keyboard events
  const handleGridKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      // Convert React event to native event for the hook
      const nativeEvent = event.nativeEvent;
      handleKeyDown(nativeEvent);
    },
    [handleKeyDown]
  );

  // Focus first item when grid receives focus
  const handleGridFocus = useCallback(() => {
    if (gridItems.length > 0 && currentIndex === -1) {
      focusItem(0);
    }
  }, [gridItems.length, currentIndex, focusItem]);

  // Enhanced children with grid item attributes
  const enhancedChildren = children.map((child, index) => {
    const props = {
      key: child.key || index,
      tabIndex: currentIndex === index ? 0 : -1,
      role: "gridcell" as const,
      "aria-setsize": children.length,
      "aria-posinset": index + 1,
      ...({ "data-grid-item": true } as any),
      onFocus: () => {
        if (currentIndex !== index) {
          focusItem(index);
        }
      },
    };
    return React.cloneElement(child, props);
  });

  return (
    <div
      ref={gridRef}
      className={`grid gap-4 ${className}`}
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
      }}
      role="grid"
      aria-label={ariaLabel || t("productGrid")}
      aria-rowcount={Math.ceil(children.length / columns)}
      aria-colcount={columns}
      tabIndex={gridItems.length > 0 ? 0 : -1}
      onKeyDown={handleGridKeyDown}
      onFocus={handleGridFocus}
    >
      {enhancedChildren}
    </div>
  );
}

/**
 * Grid item wrapper component for proper accessibility attributes
 */
interface GridItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  ariaLabel?: string;
}

export function GridItem({ children, onClick, className = "", ariaLabel }: GridItemProps) {
  const itemRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback(() => {
    onClick?.();
  }, [onClick]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleClick();
      }
    },
    [handleClick]
  );

  return (
    <div
      ref={itemRef}
      className={`focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 rounded-lg ${className}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="gridcell"
      tabIndex={-1}
      aria-label={ariaLabel}
      data-grid-item
    >
      {children}
    </div>
  );
}
