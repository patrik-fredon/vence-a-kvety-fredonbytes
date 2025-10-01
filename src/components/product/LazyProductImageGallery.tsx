"use client";

import dynamic from "next/dynamic";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import type { ProductImage } from "@/types/product";

// Dynamic import for ProductImageGallery to reduce initial bundle size
const ProductImageGallery = dynamic(
  () => import("./ProductImageGallery").then((mod) => ({ default: mod.ProductImageGallery })),
  {
    loading: () => (
      <div className="aspect-square bg-[linear-gradient(to_right,_#AE8625,_#F7EF8A,_#D2AC47)] rounded-lg flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    ),
    ssr: false, // Image gallery is interactive and doesn't need SSR
  }
);

interface LazyProductImageGalleryProps {
  images: ProductImage[];
  productName: string;
  className?: string;
  priority?: boolean;
}

export function LazyProductImageGallery(props: LazyProductImageGalleryProps) {
  return <ProductImageGallery {...props} />;
}
