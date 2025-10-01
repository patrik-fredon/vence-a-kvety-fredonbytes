"use client";

import { useCallback, useRef } from 'react';
import { useCartAnimation } from '../animations/CartAnimationProvider';
import type { AnimationSequenceOptions } from '../animations/types';

export function useAnimationSequence(options: AnimationSequenceOptions = {}) {
  const { startAnimation, state, resetAnimation } = useCartAnimation();
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startProductToCartAnimation = useCallback(
    (productElement: HTMLElement, cartElement: HTMLElement, productImageSrc: string) => {
      console.log('🎯 [useAnimationSequence] startProductToCartAnimation called:', {
        productElement: productElement?.tagName,
        cartElement: cartElement?.tagName,
        productImageSrc: productImageSrc?.substring(0, 50) + '...',
        isAnimating: state.isAnimating
      });

      // Clear any existing animation timeout
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }

      // Check for reduced motion preference unless explicitly skipped
      if (!options.skipReducedMotion) {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
          console.log('🎯 [useAnimationSequence] Using reduced motion fallback');
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
      console.log('🎯 [useAnimationSequence] Calling startAnimation from context');
      console.log('🎯 [useAnimationSequence] Animation state before start:', state);
      startAnimation(productElement, cartElement, productImageSrc);
      console.log('🎯 [useAnimationSequence] startAnimation called successfully');
    },
    [startAnimation, options.skipReducedMotion, state.isAnimating]
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
