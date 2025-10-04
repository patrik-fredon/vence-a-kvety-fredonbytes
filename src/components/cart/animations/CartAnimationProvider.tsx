"use client";

import type React from "react";
import { createContext, useCallback, useContext, useReducer, useState } from "react";
import { ProductToCartAnimation } from "./ProductToCartAnimation";
import type { AnimationState, AnimationStep, CartAnimationConfig } from "./types";

interface CartAnimationContextType {
  state: AnimationState;
  startAnimation: (
    productElement: HTMLElement,
    cartElement: HTMLElement,
    productImageSrc: string
  ) => void;
  updateAnimationStep: (step: AnimationStep) => void;
  resetAnimation: () => void;
  config: CartAnimationConfig;
}

const CartAnimationContext = createContext<CartAnimationContextType | null>(null);

type AnimationAction =
  | { type: "START_ANIMATION"; payload: { productElement: HTMLElement; cartElement: HTMLElement } }
  | { type: "UPDATE_STEP"; payload: AnimationStep }
  | { type: "RESET" };

const defaultConfig: CartAnimationConfig = {
  productShrinkDuration: 300,
  packageDropDuration: 200,
  cartBounceDuration: 300, // 150ms up + 150ms down
  cartShakeDuration: 100,
  countAnimationDuration: 200,
};

const initialState: AnimationState = {
  isAnimating: false,
  currentStep: "idle",
};

function animationReducer(state: AnimationState, action: AnimationAction): AnimationState {
  switch (action.type) {
    case "START_ANIMATION":
      return {
        ...state,
        isAnimating: true,
        currentStep: "product-shrinking",
        productElement: action.payload.productElement,
        targetCartElement: action.payload.cartElement,
      };
    case "UPDATE_STEP":
      return {
        ...state,
        currentStep: action.payload,
        isAnimating: action.payload !== "idle",
      };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

interface CartAnimationProviderProps {
  children: React.ReactNode;
  config?: Partial<CartAnimationConfig>;
}

export function CartAnimationProvider({ children, config = {} }: CartAnimationProviderProps) {
  const [state, dispatch] = useReducer(animationReducer, initialState);
  const [currentAnimation, setCurrentAnimation] = useState<{
    productElement: HTMLElement;
    cartElement: HTMLElement;
    productImageSrc: string;
  } | null>(null);
  const finalConfig = { ...defaultConfig, ...config };

  const startAnimation = useCallback(
    (productElement: HTMLElement, cartElement: HTMLElement, productImageSrc: string) => {
      console.log("🎬 [CartAnimationProvider] Starting animation:", {
        productElement: productElement?.tagName,
        cartElement: cartElement?.tagName,
        productImageSrc: `${productImageSrc?.substring(0, 50)}...`,
        hasElements: !!productElement && !!cartElement,
      });

      // Check for reduced motion preference
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReducedMotion) {
        console.log(
          "🎬 [CartAnimationProvider] Skipping animation due to reduced motion preference"
        );
        // Skip animation, just update cart immediately
        return;
      }

      if (!(productElement && cartElement)) {
        console.error("🎬 [CartAnimationProvider] Missing required elements:", {
          productElement,
          cartElement,
        });
        return;
      }

      // Set the current animation data
      setCurrentAnimation({ productElement, cartElement, productImageSrc });

      dispatch({
        type: "START_ANIMATION",
        payload: { productElement, cartElement },
      });

      console.log(
        "🎬 [CartAnimationProvider] Animation state updated, ProductToCartAnimation should render"
      );
      console.log("🎬 [CartAnimationProvider] Current animation data:", {
        productElement: productElement?.tagName,
        cartElement: cartElement?.tagName,
      });
    },
    []
  );

  const updateAnimationStep = useCallback((step: AnimationStep) => {
    dispatch({ type: "UPDATE_STEP", payload: step });
  }, []);

  const resetAnimation = useCallback(() => {
    dispatch({ type: "RESET" });
    setCurrentAnimation(null);
  }, []);

  const contextValue: CartAnimationContextType = {
    state,
    startAnimation,
    updateAnimationStep,
    resetAnimation,
    config: finalConfig,
  };

  return (
    <CartAnimationContext.Provider value={contextValue}>
      {children}
      {/* Render ProductToCartAnimation when animation is active */}
      {currentAnimation && state.isAnimating && (
        <ProductToCartAnimation
          productElement={currentAnimation.productElement}
          cartElement={currentAnimation.cartElement}
          productImageSrc={currentAnimation.productImageSrc}
          onAnimationComplete={resetAnimation}
        />
      )}
    </CartAnimationContext.Provider>
  );
}

export function useCartAnimation() {
  const context = useContext(CartAnimationContext);
  if (!context) {
    throw new Error("useCartAnimation must be used within a CartAnimationProvider");
  }
  return context;
}
