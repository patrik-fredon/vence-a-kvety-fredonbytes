import type { ReactNode, ElementType } from 'react';
import { cn } from '@/lib/utils';

interface TextProps {
  children: ReactNode;
  as?: ElementType;
  variant?: 'body' | 'caption' | 'overline' | 'subtitle';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  color?: 'primary' | 'secondary' | 'neutral' | 'muted' | 'error' | 'success' | 'warning';
  align?: 'left' | 'center' | 'right' | 'justify';
  className?: string;
}

export function Text({
  children,
  as: Component = 'p',
  variant = 'body',
  size = 'base',
  weight = 'normal',
  color = 'neutral',
  align = 'left',
  className,
  ...props
}: TextProps) {
  const variants = {
    body: 'leading-relaxed',
    caption: 'leading-normal',
    overline: 'leading-tight uppercase tracking-wider font-medium',
    subtitle: 'leading-snug font-medium',
  };

  const sizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  const weights = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  };

  const colors = {
    primary: 'text-primary-700',
    secondary: 'text-secondary-700',
    neutral: 'text-neutral-900',
    muted: 'text-neutral-600',
    error: 'text-error-600',
    success: 'text-success-600',
    warning: 'text-warning-600',
  };

  const alignments = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify',
  };

  return (
    <Component
      className={cn(
        // Base styles first
        'font-sans antialiased',
        // Size and weight
        sizes[size],
        weights[weight],
        // Color and alignment
        colors[color],
        alignments[align],
        // Variant-specific styles (applied last to ensure they take precedence)
        variants[variant],
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
