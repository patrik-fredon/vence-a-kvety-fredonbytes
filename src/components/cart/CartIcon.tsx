"use client";

import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useTranslations } from "next-intl";
import React from "react";
import { useCart } from "@/lib/cart/context";
import { cn } from "@/lib/utils";

interface CartIconProps {
  locale: string;
  className?: string;
}

export function CartIcon({ locale, className = "" }: CartIconProps) {
  const t = useTranslations("navigation");
  const { state } = useCart();

  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Link
      href={`/${locale}/cart`}
      className={cn(
        "relative inline-flex items-center text-stone-700 hover:text-stone-900 transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-950/20 focus-visible:ring-offset-2 rounded-md p-2",
        "high-contrast:text-ButtonText high-contrast:hover:text-Highlight",
        className
      )}
      title={t("cart")}
    >
      <ShoppingCartIcon className="w-5 h-5" />

      {itemCount > 0 && (
        <span
          className={cn(
            "absolute -top-1 -right-1 bg-amber-600 text-white text-xs font-semibold rounded-full",
            "w-5 h-5 flex items-center justify-center min-w-[1.25rem] px-1",
            "shadow-sm border border-white",
            "high-contrast:bg-Highlight high-contrast:text-HighlightText high-contrast:border-HighlightText"
          )}
        >
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}

      <span className="sr-only">
        {t("cart")} ({itemCount} {itemCount === 1 ? "item" : "items"})
      </span>
    </Link>
  );
}
