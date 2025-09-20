import type { ReactNode, ElementType } from 'react';
import { cn } from '@/lib/utils';

interface HeadingProps {
  children: ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?: 'primary' | 'secondary' | 'neutral' | 'accent';
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export function Heading({
  children,
  as: Component = 'h2',
  size,
  weight = 'semibold',
  color = 'neutral',
  align = 'left',
  className,
  ...props
}: HeadingProps) {
  // Default sizes based on heading level if not specified
  const defaultSizes = {
    h1: '4xl',
    h2: '3xl',
    h3: '2xl',
    h4: 'xl',
    h5: 'lg',
    h6: 'base',
  } as const;

  const actualSize = size || defaultSizes[Component];

  const sizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl',
    '5xl': 'text-5xl',
  };

  const weights = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  };

  const colors = {
    primary: 'text-primary-800',
    secondary: 'text-secondary-800',
    neutral: 'text-neutral-900',
    accent: 'text-accent-700',
  };

  const alignments = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <Component
      className={cn(
        // Base styles
        'font-sans antialiased tracking-tight',
        // Size, weight, color, alignment
        sizes[actualSize],
        weights[weight],
        colors[color],
        alignments[align],
        // Leading applied last to ensure it takes precedence
        'leading-tight',
        // High contrast support
        'high-contrast:text-WindowText',
        // Custom className last
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
