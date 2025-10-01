"use client";

import { ShoppingCartIcon } from "@/lib/icons";
import Link from "next/link";
import { useTranslations } from "next-intl";
import React, { useRef, useEffect } from "react";
import { useCart } from "@/lib/cart/context";
import { cn } from "@/lib/utils";
import { useCartAnimation } from "./CartAnimationProvider";

interface AnimatedCartIconProps {
  locale: string;
  className?: string;
}

export function AnimatedCartIcon({ locale, className = "" }: AnimatedCartIconProps) {
  const t = useTranslations("navigation");
  const { state: cartState } = useCart();
  const { state: animationState, config } = useCartAnimation();
  const cartRef = useRef<HTMLAnchorElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);

  const itemCount = cartState.items.reduce((sum, item) => sum + item.quantity, 0);

  // Cart bounce animation
  useEffect(() => {
    if (animationState.currentStep === 'cart-bouncing' && cartRef.current) {
      const element = cartRef.current;

      // Apply bounce animation using CSS transforms
      element.style.transition = `transform ${config.cartBounceDuration / 2}ms cubic-bezier(0.68, -0.55, 0.265, 1.55)`;
      element.style.transform = 'translateY(-8px)';

      setTimeout(() => {
        element.style.transform = 'translateY(0px)';
      }, config.cartBounceDuration / 2);

      // Cleanup
      setTimeout(() => {
        element.style.transition = '';
        element.style.transform = '';
      }, config.cartBounceDuration);
    }
  }, [animationState.currentStep, config.cartBounceDuration]);

  // Cart shake animation
  useEffect(() => {
    if (animationState.currentStep === 'cart-shaking' && cartRef.current) {
      const element = cartRef.current;

      // Apply shake animation
      element.style.transition = `transform ${config.cartShakeDuration}ms ease-in-out`;
      element.style.transform = 'translateX(-2px)';

      setTimeout(() => {
        element.style.transform = 'translateX(2px)';
      }, config.cartShakeDuration / 4);

      setTimeout(() => {
        element.style.transform = 'translateX(-1px)';
      }, config.cartShakeDuration / 2);

      setTimeout(() => {
        element.style.transform = 'translateX(0px)';
      }, (config.cartShakeDuration * 3) / 4);

      // Cleanup
      setTimeout(() => {
        element.style.transition = '';
        element.style.transform = '';
      }, config.cartShakeDuration);
    }
  }, [animationState.currentStep, config.cartShakeDuration]);

  // Count animation
  useEffect(() => {
    if (animationState.currentStep === 'count-animating' && countRef.current) {
      const element = countRef.current;

      // Scale up and fade in animation
      element.style.transition = `transform ${config.countAnimationDuration}ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity ${config.countAnimationDuration}ms ease-out`;
      element.style.transform = 'scale(1.3)';
      element.style.opacity = '1';

      setTimeout(() => {
        element.style.transform = 'scale(1)';
      }, config.countAnimationDuration / 2);

      // Cleanup
      setTimeout(() => {
        element.style.transition = '';
        element.style.transform = '';
      }, config.countAnimationDuration);
    }
  }, [animationState.currentStep, config.countAnimationDuration, itemCount]);

  return (
    <Link
      ref={cartRef}
      href={`/${locale}/cart`}
      className={cn(
        "relative inline-flex items-center text-stone-700 hover:text-stone-900 transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-950/20 focus-visible:ring-offset-2 rounded-md p-2",
        "high-contrast:text-ButtonText high-contrast:hover:text-Highlight",
        // Add will-change for performance during animations
        animationState.isAnimating && "will-change-transform",
        className
      )}
      title={t("cart")}
    >
      <ShoppingCartIcon className="w-5 h-5" />

      {itemCount > 0 && (
        <span
          ref={countRef}
          className={cn(
            "absolute -top-1 -right-1 bg-amber-600 text-white text-xs font-semibold rounded-full",
            "w-5 h-5 flex items-center justify-center min-w-[1.25rem] px-1",
            "shadow-sm border border-white",
            "high-contrast:bg-Highlight high-contrast:text-HighlightText high-contrast:border-HighlightText",
            // Add will-change for performance during count animation
            animationState.currentStep === 'count-animating' && "will-change-transform"
          )}
          style={{
            // Ensure smooth animation start
            transform: animationState.currentStep === 'count-animating' ? 'scale(1)' : undefined,
          }}
        >
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}

      <span className="sr-only">
        {t("cart")} ({itemCount} {itemCount === 1 ? "item" : "items"})
      </span>
    </Link>
  );
}
