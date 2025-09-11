interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({ size = "md", className = "" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <div className="animate-spin rounded-full border-2 border-primary-200 border-t-primary-600"></div>
    </div>
  );
}

interface LoadingStateProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingState({
  message = "Načítání...",
  size = "md",
  className = "",
}: LoadingStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      <LoadingSpinner size={size} />
      <p className="text-sm text-neutral-600 animate-pulse">{message}</p>
    </div>
  );
}

export function PageLoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-memorial">
      <div className="text-center space-y-6">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
          <span className="text-3xl">🌹</span>
        </div>
        <LoadingState message="Načítání stránky..." size="lg" />
      </div>
    </div>
  );
}

export function ComponentLoadingState({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <LoadingState />
    </div>
  );
}

// Skeleton loaders for specific components
export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-soft overflow-hidden animate-pulse">
      <div className="aspect-square bg-neutral-200"></div>
      <div className="p-4 space-y-3">
        <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
        <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
        <div className="h-8 bg-neutral-200 rounded w-full"></div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}
