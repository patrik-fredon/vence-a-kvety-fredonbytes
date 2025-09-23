"use client";

import React, { useEffect, useRef } from 'react';
import { useCartAnimation } from './CartAnimationProvider';
import type { ProductToCartAnimationProps } from './types';

export function ProductToCartAnimation({
  productElement,
  cartElement,
  productImageSrc,
  onAnimationComplete,
}: ProductToCartAnimationProps) {
  const { config, updateAnimationStep } = useCartAnimation();
  const animationElementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const animateProductToCart = async () => {
      console.log('🎭 [ProductToCartAnimation] Starting animation sequence:', {
        productElement: productElement?.tagName,
        cartElement: cartElement?.tagName,
        animationElement: !!animationElementRef.current,
        productImageSrc: productImageSrc?.substring(0, 50) + '...'
      });

      if (!productElement || !cartElement || !animationElementRef.current) {
        console.error('🎭 [ProductToCartAnimation] Missing required elements, completing animation');
        onAnimationComplete();
        return;
      }

      const animationElement = animationElementRef.current;

      // Get positions
      const productRect = productElement.getBoundingClientRect();
      const cartRect = cartElement.getBoundingClientRect();

      // Create temporary product image element
      const productImage = productElement.querySelector('img');
      const imageRect = productImage?.getBoundingClientRect() || productRect;

      // Position the animation element at the product image location
      animationElement.style.position = 'fixed';
      animationElement.style.left = `${imageRect.left}px`;
      animationElement.style.top = `${imageRect.top}px`;
      animationElement.style.width = `${imageRect.width}px`;
      animationElement.style.height = `${imageRect.height}px`;
      animationElement.style.zIndex = '9999';
      animationElement.style.pointerEvents = 'none';
      animationElement.style.borderRadius = '8px';
      animationElement.style.overflow = 'hidden';
      animationElement.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';

      // Set background image
      animationElement.style.backgroundImage = `url(${productImageSrc})`;
      animationElement.style.backgroundSize = 'cover';
      animationElement.style.backgroundPosition = 'center';

      // Calculate target position (cart center)
      const targetX = cartRect.left + cartRect.width / 2 - imageRect.width / 4; // Quarter size
      const targetY = cartRect.top + cartRect.height / 2 - imageRect.height / 4;

      // Start animation
      console.log('🎭 [ProductToCartAnimation] Starting product shrink animation');
      animationElement.style.transition = `all ${config.productShrinkDuration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
      animationElement.style.transform = `translate(${targetX - imageRect.left}px, ${targetY - imageRect.top}px) scale(0.25)`;
      animationElement.style.opacity = '0.8';

      // After product shrink animation, start package drop
      setTimeout(() => {
        updateAnimationStep('package-dropping');

        // Create package drop element
        const packageElement = document.createElement('div');
        packageElement.style.position = 'fixed';
        packageElement.style.left = `${cartRect.left + cartRect.width / 2 - 8}px`;
        packageElement.style.top = `${cartRect.top - 20}px`;
        packageElement.style.width = '16px';
        packageElement.style.height = '16px';
        packageElement.style.backgroundColor = '#d97706'; // amber-600
        packageElement.style.borderRadius = '4px';
        packageElement.style.zIndex = '9998';
        packageElement.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';

        document.body.appendChild(packageElement);

        // Animate package drop
        packageElement.style.transition = `transform ${config.packageDropDuration}ms cubic-bezier(0.55, 0.085, 0.68, 0.53)`;
        packageElement.style.transform = `translateY(${cartRect.height + 10}px) rotate(180deg)`;

        // After package drop, start cart bounce
        setTimeout(() => {
          updateAnimationStep('cart-bouncing');

          // After cart bounce, start cart shake (with 3ms delay as requested)
          setTimeout(() => {
            updateAnimationStep('cart-shaking');

            // After cart shake, start count animation
            setTimeout(() => {
              updateAnimationStep('count-animating');

              // Final cleanup
              setTimeout(() => {
                updateAnimationStep('idle');
                onAnimationComplete();

                // Remove temporary elements
                if (animationElement.parentNode) {
                  animationElement.parentNode.removeChild(animationElement);
                }
                if (packageElement.parentNode) {
                  packageElement.parentNode.removeChild(packageElement);
                }
              }, config.countAnimationDuration);
            }, config.cartShakeDuration);
          }, config.cartBounceDuration + 3); // 3ms delay as requested
        }, config.packageDropDuration);
      }, config.productShrinkDuration);
    };

    animateProductToCart();
  }, [productElement, cartElement, productImageSrc, config, updateAnimationStep, onAnimationComplete]);

  return (
    <div
      ref={animationElementRef}
      className="pointer-events-none"
      style={{ display: 'block' }}
    />
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
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
