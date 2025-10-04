export interface CartAnimationConfig {
  productShrinkDuration: number;
  packageDropDuration: number;
  cartBounceDuration: number;
  cartShakeDuration: number;
  countAnimationDuration: number;
}

export interface AnimationState {
  isAnimating: boolean;
  currentStep: AnimationStep;
  productElement?: HTMLElement;
  targetCartElement?: HTMLElement;
}

export type AnimationStep =
  | "idle"
  | "product-shrinking"
  | "package-dropping"
  | "cart-bouncing"
  | "cart-shaking"
  | "count-animating"
  | "cleanup";

export interface ProductToCartAnimationProps {
  productElement: HTMLElement;
  cartElement: HTMLElement;
  productImageSrc: string;
  onAnimationComplete: () => void;
}

export interface AnimationSequenceOptions {
  skipReducedMotion?: boolean;
  customDurations?: Partial<CartAnimationConfig>;
}
