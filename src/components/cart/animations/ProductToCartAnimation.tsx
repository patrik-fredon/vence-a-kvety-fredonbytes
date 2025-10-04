"use client";

import React, { useEffect, useRef } from "react";
import { useCartAnimation } from "./CartAnimationProvider";
import type { ProductToCartAnimationProps } from "./types";

export function ProductToCartAnimation({
  productElement,
  cartElement,
  productImageSrc,
  onAnimationComplete,
}: ProductToCartAnimationProps) {
  const { config, updateAnimationStep } = useCartAnimation();
  const animationElementRef = useRef<HTMLDivElement>(null);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const packageElementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const animateProductToCart = async () => {
      console.log("🎭 [ProductToCartAnimation] Starting animation sequence:", {
        productElement: productElement?.tagName,
        cartElement: cartElement?.tagName,
        animationElement: !!animationElementRef.current,
        productImageSrc: productImageSrc?.substring(0, 50) + "...",
      });

      if (!(productElement && cartElement && animationElementRef.current)) {
        console.error(
          "🎭 [ProductToCartAnimation] Missing required elements, completing animation"
        );
        onAnimationComplete();
        return;
      }

      const animationElement = animationElementRef.current;

      // Get positions
      const productRect = productElement.getBoundingClientRect();
      const cartRect = cartElement.getBoundingClientRect();

      // Create temporary product image element
      const productImage = productElement.querySelector("img");
      const imageRect = productImage?.getBoundingClientRect() || productRect;

      // Position the animation element at the product image location
      animationElement.style.position = "fixed";
      animationElement.style.left = `${imageRect.left}px`;
      animationElement.style.top = `${imageRect.top}px`;
      animationElement.style.width = `${imageRect.width}px`;
      animationElement.style.height = `${imageRect.height}px`;
      animationElement.style.zIndex = "9999";
      animationElement.style.pointerEvents = "none";
      animationElement.style.borderRadius = "8px";
      animationElement.style.overflow = "hidden";
      animationElement.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";

      console.log("🎭 [ProductToCartAnimation] Animation element positioned:", {
        left: imageRect.left,
        top: imageRect.top,
        width: imageRect.width,
        height: imageRect.height,
        zIndex: "9999",
      });

      // Set background image
      animationElement.style.backgroundImage = `url(${productImageSrc})`;
      animationElement.style.backgroundSize = "cover";
      animationElement.style.backgroundPosition = "center";

      // Add temporary border for debugging (remove in production)
      animationElement.style.border = "3px solid red";

      console.log("🎭 [ProductToCartAnimation] Background image set:", productImageSrc);

      // Calculate target position (cart center)
      const targetX = cartRect.left + cartRect.width / 2 - imageRect.width / 4; // Quarter size
      const targetY = cartRect.top + cartRect.height / 2 - imageRect.height / 4;

      // Start animation
      console.log("🎭 [ProductToCartAnimation] Starting product shrink animation");
      animationElement.style.transition = `all ${config.productShrinkDuration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
      animationElement.style.transform = `translate(${targetX - imageRect.left}px, ${targetY - imageRect.top}px) scale(0.25)`;
      animationElement.style.opacity = "0.8";

      // After product shrink animation, start package drop
      const timeout1 = setTimeout(() => {
        updateAnimationStep("package-dropping");

        // Create package drop element
        const packageElement = document.createElement("div");
        packageElement.style.position = "fixed";
        packageElement.style.left = `${cartRect.left + cartRect.width / 2 - 8}px`;
        packageElement.style.top = `${cartRect.top - 20}px`;
        packageElement.style.width = "16px";
        packageElement.style.height = "16px";
        packageElement.style.backgroundColor = "#d97706"; // amber-600
        packageElement.style.borderRadius = "4px";
        packageElement.style.zIndex = "9998";
        packageElement.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";

        // Store reference for cleanup
        packageElementRef.current = packageElement;
        document.body.appendChild(packageElement);

        // Animate package drop
        packageElement.style.transition = `transform ${config.packageDropDuration}ms cubic-bezier(0.55, 0.085, 0.68, 0.53)`;
        packageElement.style.transform = `translateY(${cartRect.height + 10}px) rotate(180deg)`;

        // After package drop, start cart bounce
        const timeout2 = setTimeout(() => {
          updateAnimationStep("cart-bouncing");

          // After cart bounce, start cart shake (with 3ms delay as requested)
          const timeout3 = setTimeout(() => {
            updateAnimationStep("cart-shaking");

            // After cart shake, start count animation
            const timeout4 = setTimeout(() => {
              updateAnimationStep("count-animating");

              // Final cleanup
              const timeout5 = setTimeout(() => {
                updateAnimationStep("idle");
                onAnimationComplete();
              }, config.countAnimationDuration);

              timeoutsRef.current.push(timeout5);
            }, config.cartShakeDuration);

            timeoutsRef.current.push(timeout4);
          }, config.cartBounceDuration + 3); // 3ms delay as requested

          timeoutsRef.current.push(timeout3);
        }, config.packageDropDuration);

        timeoutsRef.current.push(timeout2);
      }, config.productShrinkDuration);

      timeoutsRef.current.push(timeout1);
    };

    animateProductToCart();

    // Cleanup function - runs when component unmounts or dependencies change
    return () => {
      console.log("🎭 [ProductToCartAnimation] Cleaning up animation");

      // Clear all timeouts to prevent race conditions
      timeoutsRef.current.forEach((timeout) => {
        if (timeout) {
          clearTimeout(timeout);
        }
      });
      timeoutsRef.current = [];

      // Safely remove package element if it exists
      if (packageElementRef.current) {
        try {
          // Use modern remove() method instead of parentNode.removeChild()
          packageElementRef.current.remove();
        } catch (error) {
          console.warn("🎭 [ProductToCartAnimation] Package element already removed:", error);
        }
        packageElementRef.current = null;
      }

      // Reset animation step
      updateAnimationStep("idle");
    };
  }, [
    productElement,
    cartElement,
    productImageSrc,
    config,
    updateAnimationStep,
    onAnimationComplete,
  ]);

  return (
    <div ref={animationElementRef} className="pointer-events-none" style={{ display: "block" }} />
  );
}

// Hook for triggering the animation
export function useProductToCartAnimation() {
  const { startAnimation, state } = useCartAnimation();

  const triggerAnimation = (
    productElement: HTMLElement,
    cartElement: HTMLElement,
    productImageSrc: string
  ) => {
    if (state.isAnimating) {
      return; // Prevent multiple animations
    }

    // Check for reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      return;
    }

    startAnimation(productElement, cartElement, productImageSrc);
  };

  return {
    triggerAnimation,
    isAnimating: state.isAnimating,
  };
}
