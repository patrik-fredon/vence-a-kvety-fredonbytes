import type { ReactNode, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'outlined' | 'elevated' | 'memorial';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  interactive?: boolean;
  className?: string;
}

export function Card({
  children,
  variant = 'default',
  padding = 'md',
  interactive = false,
  className,
  onClick,
  ...props
}: CardProps) {
  const variants = {
    default: cn(
      'bg-white border border-neutral-200',
      'shadow-sm'
    ),
    outlined: cn(
      'bg-white border-2 border-neutral-300',
      'shadow-none'
    ),
    elevated: cn(
      'bg-white border border-neutral-100',
      'shadow-lg'
    ),
    memorial: cn(
      'bg-gradient-to-br from-white to-neutral-50',
      'border border-primary-200',
      'shadow-memorial'
    ),
  };

  const paddings = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  };

  const interactiveStyles = interactive ? cn(
    'cursor-pointer transition-all duration-200',
    'hover:shadow-lg hover:scale-[1.02]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/20',
    'active:scale-[0.98]'
  ) : '';

  return (
    <div
      className={cn(
        'rounded-lg overflow-hidden',
        variants[variant],
        paddings[padding],
        interactiveStyles,
        // High contrast support
        'high-contrast:border-2 high-contrast:border-WindowText',
        className
      )}
      onClick={onClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      {...props}
    >
      {children}
    </div>
  );
}

// Card sub-components for better composition
export function CardHeader({
  children,
  className,
  ...props
}: { children: ReactNode; className?: string } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex flex-col space-y-1.5 pb-4',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className,
  ...props
}: { children: ReactNode; className?: string } & HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        'text-lg font-semibold leading-none tracking-tight text-neutral-900',
        'high-contrast:text-WindowText',
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  children,
  className,
  ...props
}: { children: ReactNode; className?: string } & HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        'text-sm text-neutral-600 leading-relaxed',
        'high-contrast:text-WindowText',
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({
  children,
  className,
  ...props
}: { children: ReactNode; className?: string } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('space-y-4', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardFooter({
  children,
  className,
  ...props
}: { children: ReactNode; className?: string } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex items-center justify-between pt-4 border-t border-neutral-200',
        'high-contrast:border-WindowText',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
