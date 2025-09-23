"use client";

import { useCallback, useRef } from 'react';
import { useCartAnimation } from '../animations/CartAnimationProvider';
import type { AnimationSequenceOptions } from '../animations/types';

export function useAnimationSequence(options: AnimationSequenceOptions = {}) {
  const { startAnimation, state, resetAnimation } = useCartAnimation();
  const animationTimeoutRef = useRef<NodeJS.Timeout>();

  const startProductToCartAnimation = useCallback(
    (productElement: HTMLElement, cartElement: HTMLElement, productImageSrc: string) => {
      // Clear any existing animation timeout
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }

      // Check for reduced motion preference unless explicitly skipped
      if (!options.skipReducedMotion) {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
          // Provide alternative feedback for reduced motion users
          cartElement.style.transition = 'transform 150ms ease-out';
          cartElement.style.transform = 'scale(1.05)';

          setTimeout(() => {
            cartElement.style.transform = 'scale(1)';
            setTimeout(() => {
              cartElement.style.transition = '';
            }, 150);
          }, 150);

          return;
        }
      }

      // Start the animation sequence
      startAnimation(productElement, cartElement, productImageSrc);
    },
    [startAnimation, options.skipReducedMotion]
  );

  const cancelAnimation = useCallback(() => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
    resetAnimation();
  }, [resetAnimation]);

  return {
    startProductToCartAnimation,
    cancelAnimation,
    isAnimating: state.isAnimating,
    currentStep: state.currentStep,
  };
}
